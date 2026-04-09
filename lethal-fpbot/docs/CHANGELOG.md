# Changelog

## 0.1.0 — Initial release

### Core
- Telegram bot on aiogram 3.x
- FunPay client: session pool, login, raise lots, send chat,
  get orders, reviews, buyer profiles
- SQLite database with 14+ tables and migration system
- AES encryption (Fernet) for FP passwords
- Multi-account support with per-account proxies

### Automation services (13 background tasks)
- `session_restore` — periodic session verification + relogin
- `always_online` — ping `/` to keep account 🟢
- `auto_raise` — periodic lot raising with smart scheduling
- `chat_watcher` — 7s polling of FP chats with TG forwarding
- `order_watcher` — 30s polling of paid orders
- `auto_deliver` — smart delivery with validation + refund recovery
- `review_watcher` — auto-reply to reviews by rating
- `competitor_watcher` — hourly price monitoring
- `funnel` — multi-step buyer follow-up
- `smart_pricing` — quantile-based pricing recommendations
- `auto_bichevka` — cheap lot factory loop
- `backup` — daily SQLite snapshot + S3 upload
- `weekly_digest` — Monday 10am weekly report

### AI features (Pro tier)
- `ai_responder` — Claude Sonnet replies to buyers
- `arbitrage_assist` — Claude Opus defense text for disputes
- `lot_ai_generator` — AI-generated lot titles + descriptions
- `chat_summarizer` — Claude Haiku summary of long chats

### Intelligence modules (v2)
- `auto_responder_v2` — regex, variables, working hours, cooldown
- `delivery_v2` — format validators, multi-item, low-stock alerts
- `smart_pricing_v2` — 7 strategies, quantiles, market rank
- `anti_scam_v2` — 0-100 scoring with 11+ signals
- `hot_leads` — purchase intent scoring (20+ patterns)
- `content_moderation` — block forbidden outgoing content
- `lot_quality` — A-F grading with actionable tips
- `funnel_v2` — multi-step with A/B + personal promo codes
- `raise_scheduler` — priority-based with jitter + cooldown
- `lot_health` — health monitoring with issue detection

### CRM (full-featured)
- Customer auto-tracking from messages and orders
- 7 segments: new, regular, VIP, sleeping, churn_risk,
  problematic, lost
- LTV calculation with bonuses/penalties
- Tags + notes + interaction timeline
- TTL cache for hot queries
- Segment-based broadcast with content moderation

### UI/UX
- 30+ handlers with minimalist design
- Reply keyboard with 3 buttons per row
- Inline callbacks with proper pagination
- Onboarding wizard with progress bar
- Help center with 7 categories × 3-5 Q&A
- Smart suggestions with actionable buttons
- Rich order notifications with CRM context
- Dashboard with 5 matplotlib chart types
- Export: CSV sales, CSV customers, JSON dump, tax report
- Forecast with linear regression
- Quick commands: /raise /online /ping /stop /go /summary /me /health

### Infrastructure
- Web API (aiohttp) with JWT auth
- Mini App (React + Vite + Tailwind) static build
- Plugin system with hot reload
- CLI tool for admin ops
- i18n: 4 locales (ru/en/uk/kz), 250+ keys each
- Games catalog: 130+ popular FunPay games
- Docker + docker-compose with persistent volumes
- GitHub Actions CI (ruff + pytest)
- Prometheus metrics endpoint
- Sentry integration (optional)
- S3 backup (optional)
- nginx reverse proxy config

### Billing
- Telegram Payments (native card flow)
- Telegram Stars (XTR currency)
- Manual approval fallback
- Promo codes
- Referral bonus 10%
- Auto-activation on payment

### Testing
- 278 tests across 30+ test files
- pytest + pytest-asyncio
- In-memory SQLite fixtures
- Ruff linting clean
- CI pipeline

### Documentation
- GETTING_STARTED.md — 10-min setup guide
- DEPLOY.md — Docker/systemd/nginx deployment
- FEATURES.md — full feature list
- COMMANDS.md — command reference
- ARCHITECTURE.md — internal structure
- ADVANCED.md — power user techniques
- PLUGINS.md — plugin development
- PAYMENTS.md — billing integration
- API.md — Web API reference
- CLI.md — CLI tool reference

### Migrations
1. `0001_initial` — base tables
2. `0002_promo_codes` — promo code system
3. `0003_notifications` — notification preferences
4. `0004_audit_log` — action history
5. `0005_ab_tests` — A/B testing
6. `0006_crm` — customers/interactions/tags/notes
7. `0007_price_tracker` — lot price history + templates

### LOC stats
- 29000+ total lines
- 150+ Python files
- 30+ tests
- 10+ docs
- 4 locale files with 1000+ keys
- 130+ games in catalog
