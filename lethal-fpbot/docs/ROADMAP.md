# Roadmap

Планы развития Lethal FunPay Bot.

## v0.2 — Stability & Polish (следующий релиз)

- [ ] Исправление edge cases в FP-парсерах при смене FunPay HTML
- [ ] Лучшая обработка Cloudflare (интеграция curl_cffi)
- [ ] Ретраи с exponential backoff для сетевых запросов
- [ ] Более детальные метрики Prometheus
- [ ] Performance profiling + оптимизация горячих путей
- [ ] Полное покрытие тестами всех handlers (сейчас только services)
- [ ] Lighthouse audit для Mini App

## v0.3 — Team features

- [ ] Multi-seat подписка: один тариф на команду продавцов
- [ ] Роли: admin, seller, viewer
- [ ] Распределение чатов между продавцами
- [ ] Shift scheduling — кто в какое время работает
- [ ] Team analytics: сравнение продавцов

## v0.4 — Expansion

- [ ] Поддержка других маркетплейсов: PlayerAuctions, G2G, Eneba
- [ ] Unified inbox — все чаты со всех платформ в одном месте
- [ ] Cross-platform auto-delivery

## v0.5 — ML & Intelligence

- [ ] Price prediction через gradient boosting (не линейка)
- [ ] Buyer intent classification через fine-tuned Claude
- [ ] Auto-generated A/B variants через AI
- [ ] Anomaly detection в заказах (фрод)
- [ ] Dynamic pricing на основе real-time спроса

## v0.6 — Mobile

- [ ] Native iOS/Android apps (React Native поверх Web API)
- [ ] Push notifications через Apple/Firebase
- [ ] Offline mode с sync

## v0.7 — Integrations

- [ ] Zapier app
- [ ] n8n node
- [ ] Webhook marketplace
- [ ] Discord bot companion
- [ ] Slack integration
