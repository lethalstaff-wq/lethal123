"""Пример плагина: алерт админу при подозрительных ключевых словах
в сообщениях покупателя (мошенничество, угрозы, сторонние мессенджеры).
"""

from __future__ import annotations

from config import ADMIN_IDS
from plugins import Plugin

PLUGIN = Plugin(
    name="keyword_alert",
    description="Алерт админу при сомнительных словах от покупателя",
)


SUSPICIOUS = [
    "верни деньги",
    "верните деньги",
    "обман",
    "мошенник",
    "обвиню",
    "арбитраж",
    "пожалуюсь",
    "telegram @",
    "discord ",
    "вне funpay",
    "напиши в тг",
    "напиши в телеграм",
]


@PLUGIN.hook("on_new_message")
async def on_message(bot, account, chat_id, author, text):
    text_low = (text or "").lower()
    hits = [kw for kw in SUSPICIOUS if kw in text_low]
    if not hits:
        return None
    msg = (
        f"⚠️ <b>Подозрительные слова</b> в чате аккаунта "
        f"<b>{account['login']}</b>\n\n"
        f"От: {author}\n"
        f"Слова: {', '.join(hits)}\n"
        f"Текст: {text[:300]}"
    )
    for admin_id in ADMIN_IDS:
        try:
            await bot.send_message(admin_id, msg)
        except Exception:  # noqa: BLE001
            pass
    return None
