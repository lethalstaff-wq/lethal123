"""Чат FunPay через Telegram — киллер-фича.

Цикл:
  1. Раз в 5-10 секунд для каждого активного ФП-аккаунта парсим /chat/
  2. Для каждого чата с новыми сообщениями (по сравнению с chat_state)
     вытягиваем полную ленту и находим новые
  3. Каждое новое сообщение от не-нас:
       — пересылаем в Telegram пользователю с inline-кнопками
       — прогоняем через автоответчик (триггеры)
       — сохраняем как «последний от покупателя» (для воронки)
  4. Обновляем chat_state.last_message_id
"""

from __future__ import annotations

import asyncio
import logging

from aiogram import Bot

from database.models import (
    find_matching_response,
    get_chat_state,
    get_settings,
    get_user_by_id,
    is_blacklisted,
    upsert_chat_state,
)
from funpay.api import (
    get_buyer_profile,
    get_chat_messages,
    get_chats,
    send_chat_message,
)
from utils.helpers import escape_html, now_ts

from . import session_pool

logger = logging.getLogger(__name__)
INTERVAL = 7  # секунд


async def run(bot: Bot) -> None:
    while True:
        try:
            await _tick(bot)
        except Exception:  # noqa: BLE001
            logger.exception("chat_watcher tick failed")
        await asyncio.sleep(INTERVAL)


async def _tick(bot: Bot) -> None:
    for account_id, sess, acc in await session_pool.iter_active():
        try:
            await _process_account(bot, account_id, sess, acc)
        except Exception as exc:  # noqa: BLE001
            logger.warning("chat_watcher account %s failed: %s", acc["login"], exc)


async def _process_account(bot: Bot, account_id: int, sess, acc: dict) -> None:
    chats = await get_chats(sess)
    user = await get_user_by_id(acc["user_id"])
    if not user:
        return
    settings = await get_settings(acc["user_id"])

    for chat in chats:
        state = await get_chat_state(account_id, chat.chat_id)
        last_seen_id = (state or {}).get("last_message_id") or ""
        msgs = await get_chat_messages(sess, chat.chat_id)
        if not msgs:
            continue

        # Берём только новые (id больше last_seen — id у нас строковый,
        # FunPay использует возрастающие int, так что сравним по int).
        def _as_int(x: str) -> int:
            try:
                return int(x)
            except (ValueError, TypeError):
                return 0

        last_seen_int = _as_int(last_seen_id)
        new_msgs = [m for m in msgs if _as_int(m.get("id", "0")) > last_seen_int]
        if not new_msgs:
            continue

        latest_id = max(_as_int(m.get("id", "0")) for m in new_msgs)
        last_buyer_ts: int | None = None

        for m in new_msgs:
            author = m.get("author") or ""
            text = (m.get("text") or "").strip()
            if not text:
                continue

            # Не нас — это любое сообщение, где author != self_username
            self_name = sess.username or ""
            if author and author == self_name:
                continue
            if not text:
                continue

            # Чёрный список
            if author and await is_blacklisted(acc["user_id"], author):
                continue

            last_buyer_ts = now_ts()

            # Плагины могут перехватить и попросить не пересылать
            from plugins import get_manager

            plugin_results = await get_manager().emit(
                "on_new_message", bot, acc, chat.chat_id, author, text
            )
            if "stop" in plugin_results:
                continue

            # Hot leads detector — нужно до пересылки, чтобы приоритет
            # отметить
            from .hot_leads import format_alert as format_lead_alert
            from .hot_leads import score_message, should_alert

            lead = score_message(text)
            is_hot_lead = should_alert(lead)

            # Пересылка в TG (с меткой если горячий)
            try:
                await _forward_to_tg(
                    bot, user, acc, chat, author, text, settings,
                    is_hot=is_hot_lead, lead_score=lead,
                )
            except Exception as exc:  # noqa: BLE001
                logger.warning("forward to tg failed: %s", exc)

            # Если горячий — отдельный алёрт
            if is_hot_lead:
                try:
                    await bot.send_message(
                        user["telegram_id"],
                        format_lead_alert(lead, author, text, acc["login"]),
                    )
                except Exception:  # noqa: BLE001
                    pass

            # Автоответчик v2 — с переменными, часами, регексом
            if settings.get("auto_response"):
                from . import auto_responder_v2

                reply = await auto_responder_v2.find_response(
                    user_id=acc["user_id"],
                    text=text,
                    account_id=acc["id"],
                    chat_id=chat.chat_id,
                    message_id=str(m.get("id", "")),
                    buyer_username=author,
                    self_username=sess.username,
                )
                if not reply:
                    # Фоллбэк на старый matcher (обратная совместимость)
                    reply = await find_matching_response(acc["user_id"], text)
                if reply:
                    # Content moderation — не допускаем блокировки аккаунта
                    from .content_moderation import check_outgoing

                    mod = check_outgoing(reply)
                    if mod.blocked:
                        logger.warning(
                            "Auto-reply blocked by moderation: %s", mod.reason
                        )
                        reply = mod.safe_text
                    try:
                        await send_chat_message(sess, chat.chat_id, reply)
                    except Exception as exc:  # noqa: BLE001
                        logger.warning("auto_response send failed: %s", exc)

        await upsert_chat_state(
            account_id=account_id,
            fp_chat_id=chat.chat_id,
            interlocutor=chat.interlocutor,
            last_message_id=str(latest_id),
            last_buyer_msg_ts=last_buyer_ts,
        )


async def _forward_to_tg(
    bot: Bot,
    user: dict,
    acc: dict,
    chat,
    author: str,
    text: str,
    settings: dict,
    is_hot: bool = False,
    lead_score=None,
) -> None:
    from bot.keyboards.kb import chat_message_keyboard

    # Антискам v2 — scoring по профилю + тексту
    scam_block = ""
    if settings.get("anti_scam") and author:
        try:
            from .anti_scam_v2 import (
                cached_score,
                combine,
                get_cached_score,
                score_from_message,
                score_from_profile,
            )

            cached = get_cached_score(author)
            if cached:
                profile_score = cached
            else:
                sess = await session_pool.get(acc["id"])
                profile = None
                if sess:
                    profile_raw = await get_buyer_profile(sess, author)
                    if profile_raw:
                        profile = {
                            "username": profile_raw.username,
                            "reviews_count": profile_raw.reviews_count,
                            "registered_text": profile_raw.registered_text,
                        }
                profile_score = score_from_profile(profile)
                cached_score(author, profile_score)

            msg_score = score_from_message(text)
            total_score = combine(profile_score, msg_score)
            if total_score.level != "green":
                scam_block = (
                    f"\n{total_score.color_emoji} Антискам: "
                    f"<b>{total_score.total}/100</b>"
                )
        except Exception:  # noqa: BLE001
            pass

    # Hot lead marker
    hot_prefix = ""
    if is_hot and lead_score:
        hot_prefix = f"{lead_score.emoji} <b>ГОРЯЧИЙ ЛИД ({lead_score.capped_total}/100)</b>\n"

    msg = (
        f"{hot_prefix}💬 <b>[{escape_html(acc['login'])}]</b> "
        f"<b>{escape_html(author or 'покупатель')}</b>:\n"
        f"{escape_html(text)}{scam_block}"
    )
    await bot.send_message(
        chat_id=user["telegram_id"],
        text=msg,
        reply_markup=chat_message_keyboard(acc["id"], chat.chat_id),
    )
