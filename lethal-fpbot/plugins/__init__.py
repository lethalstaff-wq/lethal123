"""Плагины расширяют функциональность бота без правки ядра.

Каждый плагин — Python-модуль в plugins/<name>.py с переменной
PLUGIN — экземпляром Plugin (или подкласса). При запуске бота
PluginManager сканирует папку, импортирует модули и регистрирует
их хуки.

Доступные хуки:
  • on_new_message(bot, account, chat_id, author, text)
  • on_new_order(bot, account, order)
  • on_review(bot, account, review)
  • on_session_lost(bot, account)

Плагин может вернуть из хука "stop" чтобы прервать дальнейшую
обработку этого события другими плагинами.
"""

from .manager import (
    Plugin,
    PluginManager,
    get_manager,
    install_default_plugins,
)

__all__ = ["Plugin", "PluginManager", "get_manager", "install_default_plugins"]
