// Russian translations for product cards displayed inside the Telegram bot.
//
// The site's source of truth stays English (lib/products.ts). When the bot
// detects a Russian-speaking user it looks up overrides here. Any missing
// field falls back to the English original so adding a new product doesn't
// break the bot.

export interface ProductTranslation {
  name?: string
  description?: string
  longDescription?: string
  features?: string[]
  variantNames?: Record<string, string>
}

export const RU_PRODUCTS: Record<string, ProductTranslation> = {
  "perm-spoofer": {
    name: "Перманентный спуфер",
    description: "Перманентное спуфирование HWID",
    longDescription:
      "Меняет аппаратную идентичность на уровне ядра — серийник материнки, GPU UUID, сигнатуру диска, MAC сетевой карты. После установки старого HWID больше не существует. Хардварные баны перестают иметь значение. Настройка занимает меньше 5 минут.",
    features: [
      "Kernel-level подмена HWID",
      "Замена серийного номера материнки",
      "Сброс GPU UUID",
      "Подмена сигнатуры диска",
      "Сброс MAC сетевого адаптера",
      "Переживает все перезагрузки",
      "EAC, BattleEye, Vanguard, Ricochet",
      "Поддержка Intel + AMD",
      "Настройка меньше 5 минут",
      "Уникальный профиль железа на пользователя",
      "Пожизненная поддержка в Discord",
    ],
    variantNames: {
      "perm-onetime": "Разовая лицензия",
      "perm-lifetime": "Пожизненная лицензия",
    },
  },
  "temp-spoofer": {
    name: "Временный спуфер",
    description: "Временное спуфирование HWID",
    longDescription:
      "Сессионное спуфирование HWID без постоянных изменений. Активируется при загрузке, сбрасывается при рестарте. Идеально для альтов и краткосрочной защиты.",
    features: [
      "Сессионная подмена HWID",
      "Никаких постоянных изменений в системе",
      "Активация при загрузке, сброс при рестарте",
      "Работает после HWID бана",
      "Совместим с EAC, BattleEye, Vanguard",
      "Мгновенная активация",
      "Чистая изоляция сессий",
      "Настройка 3 минуты",
      "Поддержка в Discord включена",
    ],
    variantNames: {
      "temp-15day": "15 дней",
      "temp-30day": "30 дней",
      "temp-180day": "180 дней",
      "temp-lifetime": "Пожизненная лицензия",
    },
  },
  "fortnite-external": {
    name: "Fortnite External",
    description: "Чистый интерфейс. Быстрая настройка. Готов к турнирам.",
    longDescription:
      "Работает полностью вне процесса игры — без инжекта, без kernel-драйвера, без второго ПК. Чистый оверлей без влияния на FPS.",
    features: [
      "Не требует DMA-железа",
      "Без инжекта и kernel-драйвера",
      "Не нужен второй ПК",
      "Ноль влияния на FPS",
      "Плавный aimbot",
      "Полный ESP игроков",
      "Безопасен для стрима",
      "Безопасен на турнирах",
      "Патчи быстрее 2 часов",
    ],
    variantNames: {
      "fn-ext-1day": "1 день",
      "fn-ext-3day": "3 дня",
      "fn-ext-7day": "7 дней",
      "fn-ext-30day": "30 дней",
      "fn-ext-lifetime": "Пожизненная",
    },
  },
  "custom-dma-firmware": {
    name: "Кастомная DMA прошивка",
    description: "Построена для точности. Создана, чтобы работать.",
    longDescription:
      "Приватная прошивка под каждый заказ — уникальная сигнатура устройства, никаких общих релизов. Чистое PCIe-перечисление, без следов драйвера. Сборка и выдача в течение 24–48 часов.",
    features: [
      "Сборка под заказ — уникальная сигнатура",
      "Никаких общих релизов",
      "Чистое PCIe-перечисление",
      "Без следов драйвера",
      "Эмуляция EAC / BattleEye",
      "Маскировка FaceIt / Vanguard",
      "Поддержка 75T, 100T, M.2, ZDMA",
      "Выдача за 24–48 часов",
      "Пожизненная замена",
    ],
    variantNames: {
      "dma-fw-eac-be": "EAC / BE эмуляция",
      "dma-fw-slotted": "Slotted Edition",
      "dma-fw-faceit-vgk": "FaceIt / VGK",
    },
  },
  streck: {
    name: "Streck DMA Чит",
    description: "Премиум DMA-чит",
    longDescription:
      "Лёгкий DMA-чит с чистой производительностью по доступной цене. Базовый ESP и aimbot, быстрые патчи, мгновенная выдача.",
    features: [
      "Полный ESP игроков",
      "Плавный aimbot",
      "No recoil",
      "Обход EAC / BattleEye",
      "Fortnite + Apex Legends",
      "Быстрые патчи",
      "Мгновенная выдача",
    ],
    variantNames: {
      "streck-7day": "7 дней",
      "streck-30day": "30 дней",
      "streck-90day": "90 дней",
      "streck-lifetime": "Пожизненная",
    },
  },
  blurred: {
    name: "Blurred DMA Чит",
    description: "Премиум DMA-чит",
    longDescription:
      "Самый полный DMA-набор. Полный радар, стрим-прувф оверлей, обход FaceIt и Vanguard. Читает память игры через DMA-карту — полностью внешний. Автообновления в течение 2 часов после патча.",
    features: [
      "Полный ESP игроков",
      "Плавный aimbot + триггербот",
      "Полный радар карты",
      "No recoil",
      "Стрим-прувф оверлей",
      "EAC, BE, FaceIt, Vanguard, Ricochet",
      "UAV-оверлей радара",
      "Web-радар",
      "Web-меню",
      "ESP лута",
      "Авто-апдейтер < 2ч",
      "Поддержка 6 игр",
    ],
    variantNames: {
      "blurred-weekly": "Неделя",
      "blurred-monthly": "Месяц",
      "blurred-quarterly": "Квартал",
      "blurred-lifetime": "Пожизненная",
    },
  },
  "dma-basic": {
    name: "DMA Базовый комплект",
    description:
      "Надёжная база на каждый день. Включает: Captain DMA 100T-7th, EAC/BE Emulated, Mini DP Fuser V2, Blurred (30 дней), Macku (бесплатно)",
    longDescription:
      "Преднастроено и готово к работе. Никаких отдельных покупок, никаких проблем с совместимостью. Отправка в течение 24 часов с пожизненной поддержкой в Discord.",
    variantNames: {
      "dma-basic-full": "Полный комплект",
    },
  },
  "dma-advanced": {
    name: "DMA Продвинутый комплект",
    description:
      "Сбалансированная конфигурация для креаторов и полупро-пользователей. Включает: Captain DMA 100T-7th, Dichen D60 Fuser, Teensy (с прошивкой), EAC/BE Emulated Slotted, Blurred DMA (Квартал)",
    longDescription:
      "Slotted-прошивка снижает пересечения детектов. Квартальный Blurred держит тебя надолго. Отправка в течение 24 часов с полным техническим сопровождением.",
    variantNames: {
      "dma-advanced-full": "Полный комплект",
    },
  },
  "dma-elite": {
    name: "DMA Элитный комплект",
    description:
      "Максимальная производительность — полная эмуляция и пожизненный доступ. Включает: Captain DMA 100T-7th, Dichen DC500 Fuser, Teensy (с прошивкой), Blurred Lifetime DMA Cheat, EAC/BE, FaceIt, VGK Emulated",
    longDescription:
      "Максимум производительности, пожизненный доступ, без компромиссов. Топ-железо с эмуляцией FaceIt и Vanguard. Пожизненная замена железа и приоритетный доступ в Discord.",
    variantNames: {
      "dma-elite-full": "Полный комплект",
    },
  },
}
