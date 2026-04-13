# Email Setup

Transactional emails (order confirmations, license delivery, welcome, renewal reminders, etc.) are sent through `app/api/send-email/route.ts`. The route auto-detects which provider is configured via env variables and uses it.

Pick **one** provider, set its env vars in Vercel/your `.env.local`, and deploy. Emails stop logging-only the moment a key is present.

## Recommended: Resend

Simplest setup for Next.js apps. Free tier: 3000 emails/month.

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@lethalsolutions.me
RESEND_FROM_NAME=Lethal Solutions
```

1. Sign up at <https://resend.com>
2. Verify domain `lethalsolutions.me` (add DNS records they provide)
3. Create API key → paste into `RESEND_API_KEY`
4. Set the two `RESEND_FROM_*` vars (from_email must use your verified domain)

## Alternatives

### SendGrid
```env
SENDGRID_API_KEY=SG.xxxxxxxx
```

### Postmark
```env
POSTMARK_API_KEY=xxxxxxxx
```

### Mailgun
```env
MAILGUN_API_KEY=xxxxxxxx
MAILGUN_DOMAIN=mg.lethalsolutions.me
```

## Required env for links inside emails

```env
NEXT_PUBLIC_SITE_URL=https://www.lethalsolutions.me
```

Without this, links inside order-confirmation and renewal-reminder emails fall back to `lethal-solutions.vercel.app`.

## What triggers emails today

| Event | Route | Template |
| ----- | ----- | -------- |
| Order confirmation | `app/checkout/actions.ts` → `createOrder` | `order_confirmation` |
| License delivery | `app/api/orders/approve/route.ts`, `app/admin/actions.ts` | `license_delivery` |
| Order status update | `app/api/orders/decline/route.ts` | `order_status` |
| Welcome | `app/api/auth/signup/route.ts` | `welcome` |
| Renewal reminder | cron `app/api/cron/renewals/route.ts` | `renewal_reminder` |

## Password reset

Password-reset emails go through **Supabase's built-in flow** (see `app/forgot-password/page.tsx` — it calls `supabase.auth.resetPasswordForEmail`). Configure the template in Supabase Dashboard → Authentication → Email Templates.

## Testing

Hit the API directly to confirm the provider works:

```bash
curl -X POST https://www.lethalsolutions.me/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"type":"welcome","to":"yourself@example.com","data":{"customerName":"Test"}}'
```

Success response: `{ "success": true, "id": "..." }`.
If you get `Email logged (no provider configured)` — env vars aren't picked up.

## Cron-based emails

Renewal reminders run daily at 10:00 UTC via Vercel Cron (see `vercel.json`). Requires:

```env
CRON_SECRET=<random-string>
```

Vercel sets this automatically when you enable Cron in the dashboard. If testing locally:

```bash
curl "http://localhost:3000/api/cron/renewals" \
  -H "Authorization: Bearer $CRON_SECRET"
```
