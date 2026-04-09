"""Пример плагина: автоматическое приветствие первого сообщения.

Когда покупатель пишет впервые в новом чате, бот шлёт приветственное
сообщение. Использует chat_state чтобы определить «впервые».
"""

from __future__ import annotations

from plugins import Plugin

PLUGIN = Plugin(
    name="greeter",
    description="Шлёт приветствие новым покупателям",
)


@PLUGIN.hook("on_new_message")
async def on_message(bot, account, chat_id, author, text):
    from database.models import get_chat_state
    from funpay.api import send_chat_message
    from services import session_pool

    state = await get_chat_state(account["id"], chat_id)
    # Если сообщений в этом чате ещё не было — это первое
    if state and state.get("last_message_id"):
        return None

    sess = await session_pool.get(account["id"])
    if not sess:
        return None
    greeting = (
        "👋 Здравствуйте! Спасибо что заинтересовались моим лотом. "
        "Если есть вопросы — задавайте, отвечу как можно скорее!"
    )
    await send_chat_message(sess, chat_id, greeting)
    return None
