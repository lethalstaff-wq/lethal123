// Русские строки для Mini App. Дублируют (на момент создания) серверный
// i18n.locales.ru.MESSAGES, чтобы клиент работал автономно без round-trip.

const ru: Record<string, string> = {
  "nav.dashboard": "Дэшборд",
  "nav.accounts": "Аккаунты",
  "nav.lots": "Лоты",
  "nav.chats": "Чаты",
  "nav.stats": "Статистика",
  "nav.settings": "Настройки",
  "nav.billing": "Биллинг",
  "nav.profile": "Профиль",

  "common.loading": "Загрузка…",
  "common.empty": "Пусто",
  "common.error": "Ошибка",
  "common.save": "Сохранить",
  "common.cancel": "Отмена",
  "common.delete": "Удалить",
  "common.add": "Добавить",
  "common.refresh": "Обновить",

  "dashboard.revenue.today": "Сегодня",
  "dashboard.revenue.week": "За неделю",
  "dashboard.revenue.month": "За месяц",
  "dashboard.orders.today": "Заказов сегодня",
  "dashboard.accounts.online": "Онлайн",
  "dashboard.no_sales": "Пока нет продаж",
  "dashboard.top_lots": "Топ лотов",

  "accounts.title": "Мои аккаунты",
  "accounts.add": "Добавить аккаунт",
  "accounts.empty": "Нет аккаунтов",
  "accounts.online": "🟢 Онлайн",
  "accounts.offline": "⚪️ Оффлайн",
  "accounts.reconnect": "Переподключить",

  "lots.title": "Лоты",
  "lots.empty": "Лотов нет",
  "lots.refresh": "Обновить",
  "lots.raise": "Поднять все",
  "lots.bulk": "Массовая загрузка",

  "chats.title": "Чаты",
  "chats.empty": "Чатов нет",
  "chats.send": "Отправить",
  "chats.placeholder": "Введите сообщение…",
  "chats.ai": "ИИ-ответ",

  "stats.title": "Статистика",
  "stats.revenue": "Выручка",
  "stats.orders": "Заказов",
  "stats.aov": "Средний чек",

  "settings.title": "Настройки",
  "billing.title": "Биллинг",
  "profile.title": "Профиль",
};

export default ru;
