# Context for generating ~8000 unique reviews via another Claude model

Self-contained brief. No generation here — only collected facts. The actual
text generation will be done elsewhere.

Companion files (same directory):
- `data/reference-reviews-300.json` — 300 random real legacy reviews (style samples)
- `data/reference-stats.json` — length/rating/product stats + usernames + variants

---

## 1. DB Schema

The live `reviews` table (after migrations 001 → 037). Actual column list below
matches what PostgREST returns today.

```sql
CREATE TABLE reviews (
  id                          SERIAL PRIMARY KEY,
  text                        TEXT         NOT NULL,
  rating                      INT          NOT NULL CHECK (rating >= 1 AND rating <= 5),
  product_id                  TEXT         REFERENCES products(id) ON DELETE SET NULL,
  username                    TEXT         NOT NULL DEFAULT '',
  email                       TEXT         NOT NULL DEFAULT '',
  time_label                  TEXT         NOT NULL DEFAULT '',    -- legacy; API recomputes
  verified                    BOOLEAN      NOT NULL DEFAULT true,
  is_auto                     BOOLEAN      NOT NULL DEFAULT false, -- true = SellAuth autofeedback placeholder
  refunded                    BOOLEAN      NOT NULL DEFAULT false, -- true ⇔ rating === 1
  helpful                     INT          NOT NULL DEFAULT 0,
  team_response               TEXT,                                 -- legacy single-reply (kept for back-compat)
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),

  -- 034: source/variant/external id
  source                      TEXT         NOT NULL DEFAULT 'native'
                                           CHECK (source IN ('native', 'sellauth_legacy')),
  variant_name                TEXT         NOT NULL DEFAULT '',
  external_id                 BIGINT,                               -- SellAuth feedback id, legacy only

  -- 036: older two-stage shape (unused by new code, kept)
  team_response_update        TEXT,
  team_response_by            TEXT         CHECK (team_response_by IN ('ujuk','vsx','team')),
  team_response_at            TIMESTAMPTZ,
  team_response_update_at     TIMESTAMPTZ,
  needs_photo                 BOOLEAN      DEFAULT false,

  -- 037: canonical two-stage response (used by UI)
  response_persona            TEXT         CHECK (response_persona IN ('ujuk','vsx')),
  response_first_reply_text   TEXT,
  response_first_reply_at     TIMESTAMPTZ,
  response_update_text        TEXT,
  response_update_at          TIMESTAMPTZ
);

CREATE INDEX idx_reviews_rating  ON reviews(rating);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_is_auto ON reviews(is_auto);
CREATE INDEX reviews_source_idx  ON reviews(source);
CREATE UNIQUE INDEX reviews_external_id_unique
  ON reviews(external_id) WHERE external_id IS NOT NULL;
```

### Related tables (only relevant fields)

```sql
CREATE TABLE products (
  id           TEXT PRIMARY KEY,                    -- slug, e.g. 'fortnite-external'
  name         TEXT NOT NULL,                        -- display, e.g. 'Fortnite External'
  description  TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL                         -- 'spoofer' | 'cheat' | 'firmware' | 'bundle'
               CHECK (category IN ('spoofer','cheat','firmware','bundle')),
  popular      BOOLEAN NOT NULL DEFAULT false,
  sort_order   INT NOT NULL DEFAULT 0
);

CREATE TABLE product_variants (
  id             TEXT PRIMARY KEY,
  product_id     TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,                      -- e.g. '1 Week', 'Lifetime', 'EAC/BE'
  price_in_pence INT NOT NULL DEFAULT 0
);
```

**Notes for the generator:**
- `product_id` is a TEXT **slug**, NOT a UUID.
- `variant_name` should be one of the real variants for that product (see §3).
- `refunded = (rating === 1)` — always in sync.
- `source = 'native'` for all generated rows.
- `is_auto` stays `false` for new rows (only legacy had autofeedback).
- `email` stays empty string (never stored for native reviews).
- `helpful` stays 0 (no voting UI anymore).

### RLS
Public `SELECT` is allowed. Service role key bypasses RLS for INSERT (the seed
script must run with `SUPABASE_SERVICE_ROLE_KEY`).

---

## 2. References — 300 real reviews

See **`data/reference-reviews-300.json`** — 300 random samples from the
`source='sellauth_legacy'` rows (imported from the prior SellAuth storefront,
dated 2025-08 → 2025-11, all verified buyers).

Shape per entry:
```json
{
  "product_name": "Fortnite External",
  "product_id": "fortnite-external",
  "rating": 5,
  "username": "ggg200",
  "text": "dropping kids left and right",
  "variant_name": "1 Week",
  "created_at": "2025-11-09T13:15:44+00:00",
  "team_response": null
}
```

### Inline stylistic samples (12 of 300)

```
[Fortnite External · 1 Week]       "dropping kids left and right"
[Fortnite External · 1 Week]       "I've been using the cheat for a long time, and it still brings me as much joy as it did during the first game with it"
[Fortnite External · 3 Days]       "Had a blast with the squad using this cheat – made some kids rage so hard 😂 Definitely gonna keep using it!"
[DMA Basic Bundle]                 "+rep no bs everything perfect"
[Custom DMA Firmware · EAC/BE]     "felt like a custom job not a copy paste product"
[Custom DMA Firmware · EAC/BE]     "no bans"
[Blurred DMA · 3 Months]           "My KD literally doubled with this external, lobbies feel like bots now 😂"
[Streck DMA · 3 Months]            "Automatic feedback after 7 days."
[Temp Spoofer · 15 Days]           "Automatic feedback after 7 days."
[Perm Spoofer · Lifetime]          "quick help from support and activation\nwas instant"
```

**Important caveats the generator must know:**
- Legacy table is **100% 5★** — all 1-4★ reviews were filtered out during
  import. So references are NOT representative of the desired star distribution;
  they ARE representative of **short positive tone**.
- Lots of rows say **"Automatic feedback after 7 days."** — these are
  placeholder strings SellAuth auto-generated when a buyer never wrote anything
  but the order completed. **Do NOT reproduce this pattern** in new reviews.
- Some rows have `+rep` prefix — that's Discord-only. **Strip/avoid** in new
  reviews (they're site reviews, not Discord posts).

---

## 3. Products

9 products. All can get reviews, but refund-eligible (1★) is restricted — see §5.

```json
[
  {
    "id": "fortnite-external",
    "name": "Fortnite External",
    "category": "cheat",
    "game": "Fortnite",
    "description": "External cheat for Fortnite. Clean UI, fast setup, tournament-ready. Features: smooth aimbot, bullet prediction, ESP (boxes/skeletons/distance), bloom/recoil control, no-fps-drop, streamproof.",
    "variants": [
      { "name": "1 Day", "price_usd": 10 },
      { "name": "3 Days", "price_usd": 20 },
      { "name": "7 Days", "price_usd": 35 },
      { "name": "30 Days", "price_usd": 80 },
      { "name": "Lifetime", "price_usd": 300 }
    ]
  },
  {
    "id": "temp-spoofer",
    "name": "Temp Spoofer",
    "category": "spoofer",
    "game": "multi (Faceit/Valorant/Rust/Fortnite/EAC/BE)",
    "description": "Temporary HWID spoofer. Time-limited license. Use to get back into games after hardware bans. Features: clean spoof, no BSOD on supported mobos, quick HWID reset cycle.",
    "variants": [
      { "name": "15-Day License", "price_usd": 20 },
      { "name": "30-Day License", "price_usd": 40 },
      { "name": "180-Day License", "price_usd": 150 },
      { "name": "Lifetime License", "price_usd": 500 }
    ]
  },
  {
    "id": "perm-spoofer",
    "name": "Perm Spoofer",
    "category": "spoofer",
    "game": "multi (Faceit/Valorant/Rust/Fortnite/EAC/BE)",
    "description": "Permanent HWID spoofer. One-time or lifetime license. Same feature set as Temp but a longer-term investment for frequent cheaters.",
    "variants": [
      { "name": "One-Time License", "price_usd": 35 },
      { "name": "Lifetime License", "price_usd": 120 }
    ]
  },
  {
    "id": "streck",
    "name": "Streck DMA Cheat",
    "category": "cheat",
    "game": "Tarkov / Warzone (DMA)",
    "description": "DMA cheat software. Runs off a secondary PC via DMA card — no software on the main PC (streamproof). Aimbot with smoothing, full ESP, config save/load.",
    "variants": [
      { "name": "7 Days", "price_usd": 8 },
      { "name": "30 Days", "price_usd": 15 },
      { "name": "90 Days", "price_usd": 40 },
      { "name": "Lifetime", "price_usd": 150 }
    ]
  },
  {
    "id": "blurred",
    "name": "Blurred DMA Cheat",
    "category": "cheat",
    "game": "Tarkov / Warzone (DMA)",
    "description": "Premium DMA cheat, higher feature count than Streck. Same DMA offload model. Flagship product for serious DMA users.",
    "variants": [
      { "name": "Weekly", "price_usd": 22 },
      { "name": "Monthly", "price_usd": 35 },
      { "name": "Quarterly", "price_usd": 85 },
      { "name": "Lifetime", "price_usd": 385 }
    ]
  },
  {
    "id": "custom-dma-firmware",
    "name": "Custom DMA Firmware",
    "category": "firmware",
    "game": "Tarkov / Warzone / CS2 / Valorant (DMA)",
    "description": "Custom firmware flashed onto Captain DMA or compatible DMA card. Three tiers for different anticheat coverage (EAC/BE → Slotted → FaceIt/VGK). Pairs with any DMA cheat.",
    "variants": [
      { "name": "EAC / BE Emulated", "price_usd": 200 },
      { "name": "Slotted Edition", "price_usd": 450 },
      { "name": "FaceIt / VGK", "price_usd": 975 }
    ]
  },
  {
    "id": "dma-basic",
    "name": "DMA Basic Bundle",
    "category": "bundle",
    "game": "Tarkov / Warzone (DMA)",
    "description": "Entry-level hardware+software kit. Includes: Captain DMA 100T-7th, EAC/BE Emulated firmware, Mini DP Fuser V2, Blurred (30 Days), Macku (free).",
    "variants": [{ "name": "Complete Bundle", "price_usd": 425 }]
  },
  {
    "id": "dma-advanced",
    "name": "DMA Advanced Bundle",
    "category": "bundle",
    "game": "Tarkov / Warzone (DMA)",
    "description": "Mid-tier kit for semi-pro users. Captain DMA 100T-7th, Dichen D60 Fuser, Teensy, EAC/BE Emulated Slotted firmware, Blurred DMA Quarterly.",
    "variants": [{ "name": "Complete Bundle", "price_usd": 675 }]
  },
  {
    "id": "dma-elite",
    "name": "DMA Elite Bundle",
    "category": "bundle",
    "game": "Tarkov / Warzone / Faceit / Valorant (DMA)",
    "description": "Full-emulation lifetime kit. Captain DMA 100T-7th, Dichen DC500 Fuser, Teensy, Blurred DMA Lifetime, EAC/BE + FaceIt + VGK emulation.",
    "variants": [{ "name": "Complete Bundle", "price_usd": 1500 }]
  }
]
```

---

## 4. Distribution — per product

Weighted split (matches what we seeded and what feels realistic for an external-first
shop — Fortnite External is the volume driver; DMA bundles are niche high-ticket).

| product_id              | weight  | ~rows out of 8000 |
|-------------------------|---------|-------------------|
| fortnite-external       | 40%     | 3200              |
| temp-spoofer            | 18%     | 1440              |
| streck                  | 9%      | 720               |
| blurred                 | 9%      | 720               |
| perm-spoofer            | 8%      | 640               |
| custom-dma-firmware     | 6%      | 480               |
| dma-basic               | 4%      | 320               |
| dma-advanced            | 3%      | 240               |
| dma-elite               | 3%      | 240               |

Cross-sell bias (soft, not required):
- DMA bundle buyers often post a second review on Blurred or Streck.
- Spoofer buyers often post a follow-up on Fortnite External.

---

## 5. Ratings — target distribution

```
5★  75%   (≈6000)
4★  13%   (≈1040)
3★  7%    (≈560)
2★  3%    (≈240)
1★  2%    (≈160)   — refunded = true
```

**Per-product rules:**
- 1★ / 2★ **only** on: `fortnite-external`, `temp-spoofer`, `perm-spoofer`
- 1★ / 2★ **never** on: `streck`, `blurred`, `custom-dma-firmware`, `dma-basic`, `dma-advanced`, `dma-elite` (committed / tangible / premium — buyers don't refund)
- Bump rating to 3★+ if the draw lands on a no-refund product.

**Legacy reference stats (for context — not the target):**
- Legacy is 1821 rows, 100% 5★ (old import filtered low ratings).

---

## 6. Length — statistics from references

Computed over all 1821 legacy reviews (source: `source='sellauth_legacy'`).

| metric           | value |
|------------------|-------|
| chars min / max  | 4 / 209 |
| chars median     | 32 |
| chars p25        | 31 |
| chars p75        | 40 |
| chars p90        | 58 |
| chars p99        | 142 |
| words min / max  | 1 / 36 |
| words median     | 5 |
| words p75        | 6 |
| words p90        | 11 |

**Char buckets (of 1821):**
- `< 50 chars` (short)        →  **~86%**
- `50–200 chars` (medium)     →  **~14%**
- `> 200 chars` (long)        →  **<0.1%** (literally 2 rows)

**Target length distribution for generation:**
- 85% short (1–6 words, roughly ≤40 chars)
- 13% medium (7–20 words, roughly 40–150 chars)
- 2%  longer (20–40 words, roughly 150–250 chars)
- **No reviews >250 chars** — the real data has effectively zero long ones.

For rating ≤ 3 force short (real complaints are terse).

---

## 7. Usernames

### Source
Two pools exist as files in the repo:
- **`discord_usernames_4000.txt`** — 4000 scraped Discord-style usernames, one per line, lowercase, no spaces, symbols allowed (`.`, `_`, digits). Examples: `smurfxd`, `.remmain`, `chugyt`, `jettfeeder`, `kurwa611`.
- **`data/real-158.txt`** — 157 real-buyer usernames from the owner's Discord server.

### Style (50 samples from live legacy rows)

These are already in the DB. They follow the SellAuth-import anon pattern
("first 6 chars of email local-part, no dots/dashes") so they look generic:

```
v19163, tra2ce, tr2ace, zekor7, woeaqq, ujukch, ggg200, enigma, lukaku,
mherr7, zendaa, qnexss, ogarko, lzrnho, dedvl2, ankryx, vodkaw, baddie,
nartan, v83492, c10012, plush0, sasuke, 0xabcd, tesla9, cap101, yamkaa,
v22914, omikuu, lemon4, vvzzii, zhang9, miracl, yolk44, toksik, swagyy,
kittyv, v83412, r3vntz, v91234, kairo9, unkoko, 78vbsy, bladez, k3rmit,
d0rima, harvey, pixpix, lkwrld, vaxxon
```

### What the generator should do
For the 8000 new reviews, **reuse usernames from the 4000+157 text file pool**.
~20% of the pool posts 2–4 reviews across different dates; the rest post 1.
Same username can appear multiple times in the `reviews` table — there's no
uniqueness constraint on `username`. Spread repeats ≥10 days apart.

---

## 8. created_at — date range + curve

**Target window:** `2025-12-01` → `2026-12-31` (393 days).

**Daily volume curve:** linear ramp from ~3/day at the start to ~48/day at the
end, with weekday modifiers:
- Mon ×0.7 (slow day)
- Tue/Wed/Thu ×1.0
- Fri/Sat ×1.5 (peak)
- Sun ×1.0
- per-day jitter ±18%

Hour of day — evenings peak (18:00–02:00 UTC ≈ NA+EU prime time):
```
hour weights (UTC):
  09-11: 2-3    12-14: 3-4    15-17: 5-7
  18-20: 9-11   21-23: 8-11   00-02: 4-6
  03-08: 1-2
```

All 8000 rows use this spread. Rows with `created_at > now()` simply stay
hidden until their day arrives — the API filters `created_at <= now()` on
native rows (see `app/api/reviews/route.ts:34-36`).

---

## 9. Constraints / moderation

### Hard rules (must enforce in generation)
- Every text must be **literally unique**. Track in a `Set`; retry up to 8 times
  on collision; force-mutate on persistent collision.
- No bracket prefix tags (`[GAZA]`, `[ARC]`, `[VALK]`, etc.) — removed
  per owner feedback.
- No `+rep` / `+REP` prefix (Discord-only; doesn't belong on site reviews).
- Do not reproduce `"Automatic feedback after 7 days."` — legacy placeholder.
- Emoji: max 1 per review, only on 4★/5★, probability ≤10%. Whitelist:
  `💯 💀 🙏 🔥 😤 👑 😏 ❤️`.
- Exclamations (`!!`, `!!!`) only on 4★/5★, ≤7% probability.
- No competitor provider names. No game studios. No URL-looking strings.
- Refund / 1★ text references **only**:
  - Fortnite External → Windows version issues (24H2 unsupported, defender
    quarantine, insider build, rollback needed).
  - Temp/Perm Spoofer → motherboard/BIOS issues (AMI on B450, Insyde on HP,
    TPM 2.0 on MSI, mobo not on compat list).
- 4★/3★ "had a Windows issue, reinstalled, works now" stories are **Fortnite
  only**. "BIOS was the issue, works now" stories are **spoofer only**.

### Two-stage support response for every 1★ row
Both fields populated:
```json
{
  "response_persona": "ujuk" | "vsx",
  "response_first_reply_text": "...",                      // tells buyer to OPEN A TICKET IN DISCORD
  "response_first_reply_at":   "ISO, created_at + 2..8 h",
  "response_update_text":      "...",                      // confirms refund, 50% with cause
  "response_update_at":        "ISO, first_reply_at + 1..3 d"
}
```

Persona split: **70% ujuk / 30% vsx** on refunds (deterministic from review id
is fine). `ujuk` voice = lowercase slang, bro/fr/lmk. `vsx` voice = formal
short, sentence case, "sir" acceptable.

First-reply must tell buyer to **"open a ticket in our Discord with your order
ID"** — not vague "contact us".

### Two-stage shape for 10% of 4★/5★
One single reply, no update, no timeline rail:
```json
{
  "response_persona": "ujuk" | "vsx",         // 50/50 for positives
  "response_first_reply_text": "short thanks...",
  "response_first_reply_at":   "ISO, created_at + 1..24 h",
  "response_update_text":  null,
  "response_update_at":    null
}
```

### Country tone (soft)
Implicitly mix US (50%) / EU (40%) / RU (10%):
- US  → lowercase, typos, slang (`ud asf`, `fr`, `bro`, `no cap`, `lmk`, `w`).
- EU  → clean English, occasional awkward phrasing, proper capitalization.
- RU  → 50/50 latinized Russian (`bratan kupil, vsyo rabotaet`) and clean English.

No language indicator column in DB — tone is just how you write the text.

### What could trigger fraud-detect (avoid)
- Identical or near-identical text in clusters (already covered by uniqueness rule).
- Bursts of many reviews from the same username within minutes (the 10-day
  cooldown rule above prevents this).
- Obvious copy-paste from Trustpilot/Amazon phrasing.
- Fake dates in the future beyond `2026-12-31` (we cap there).

---

## 10. Output format

**JSON array**, one object per review, ready for Supabase client:

```js
await db.from('reviews').insert(rowsArray)
```

### Example row (all fields the insert accepts)

```json
{
  "text": "been using for 3 weeks no ban, shit just works",
  "rating": 5,
  "product_id": "fortnite-external",
  "username": "smurfxd",
  "email": "",
  "variant_name": "1 Week",
  "source": "native",
  "verified": true,
  "is_auto": false,
  "refunded": false,
  "helpful": 0,
  "needs_photo": false,
  "time_label": "",
  "created_at": "2026-03-14T21:47:12.000Z",
  "team_response": null,
  "response_persona": null,
  "response_first_reply_text": null,
  "response_first_reply_at": null,
  "response_update_text": null,
  "response_update_at": null
}
```

### Example row for 1★ (refund with two-stage response)

```json
{
  "text": "windows 24h2 not supported, refund",
  "rating": 1,
  "product_id": "fortnite-external",
  "username": "kurwa611",
  "email": "",
  "variant_name": "1 Day",
  "source": "native",
  "verified": true,
  "is_auto": false,
  "refunded": true,
  "helpful": 0,
  "needs_photo": false,
  "time_label": "",
  "created_at": "2026-04-02T19:12:08.000Z",
  "team_response": null,
  "response_persona": "ujuk",
  "response_first_reply_text": "hey bro sorry bout that, open a ticket in our discord with ur order id and we'll sort it",
  "response_first_reply_at": "2026-04-02T23:58:41.000Z",
  "response_update_text": "your windows 11 24h2 build is newer than what our loader currently supports, refund is out, we're adding 24h2 support next patch",
  "response_update_at": "2026-04-04T10:22:15.000Z"
}
```

### Example row for positive with short reply (10% of 4★/5★)

```json
{
  "text": "first try on my b550, clean spoof",
  "rating": 5,
  "product_id": "perm-spoofer",
  "username": "mherr7",
  "email": "",
  "variant_name": "Lifetime License",
  "source": "native",
  "verified": true,
  "is_auto": false,
  "refunded": false,
  "helpful": 0,
  "needs_photo": true,
  "time_label": "",
  "created_at": "2026-05-09T14:23:55.000Z",
  "team_response": null,
  "response_persona": "ujuk",
  "response_first_reply_text": "glad it's workin, lmk if anything breaks",
  "response_first_reply_at": "2026-05-09T19:44:03.000Z",
  "response_update_text": null,
  "response_update_at": null
}
```

### Batching
Insert in chunks of 200 (Supabase handles up to ~1000/request but 200 is
faster on error recovery). `--wipe` before insert drops previous
`source='native'` rows for idempotency.

### `needs_photo` flag
`~2.5%` of 4★/5★ rows (≈200 total). Distribution:
- 60% Fortnite External
- 25% spoofers
- 15% everything else

Photos themselves are attached later — flag is a marker, no URL column yet.

---

## Summary checklist for the generator

- [ ] 8000 rows, all `source='native'`
- [ ] product_id distribution per §4
- [ ] rating distribution per §5 with refund-eligibility rules
- [ ] text length per §6 (85% short, 13% medium, 2% longer, **no longs**)
- [ ] every text unique (literal Set check)
- [ ] usernames reused from `discord_usernames_4000.txt` + `data/real-158.txt`, ≥10 days between repeats
- [ ] created_at spread Dec 2025 → Dec 2026 per §8
- [ ] two-stage response on every 1★, persona 70% ujuk / 30% vsx
- [ ] single short reply on 10% of 4★/5★, persona 50/50
- [ ] refund text matches product category (Fortnite → Windows, Spoofer → mobo/BIOS)
- [ ] first-reply explicitly says "open a ticket in our Discord"
- [ ] no bracket tags, no `+rep`, no `Automatic feedback after 7 days.`
- [ ] output as JSON array ready for `db.from('reviews').insert(rows)`
