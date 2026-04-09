import { useState } from "react";
import { useApiCall } from "../hooks/useApiCall";
import { api } from "../api";
import { t } from "../i18n";
import Card from "../components/Card";
import Spinner from "../components/Spinner";

const TIERS = [
  { id: "starter", name: "🥉 Starter", desc: "1 аккаунт, базовое" },
  { id: "standard", name: "🥈 Standard", desc: "До 5 аккаунтов, чат через ТГ" },
  { id: "pro", name: "🥇 Pro", desc: "До 10 аккаунтов, ИИ" },
];

export default function Billing() {
  const profile = useApiCall(() => api.profile());
  const [promo, setPromo] = useState("");
  const [busy, setBusy] = useState(false);

  if (profile.loading) return <Spinner />;
  const p = profile.data;
  const tierName =
    p?.tier === "pro" ? "🥇 Pro" : p?.tier === "standard" ? "🥈 Standard" : p?.tier === "starter" ? "🥉 Starter" : "—";

  const buy = async (tier: string, provider: string) => {
    setBusy(true);
    try {
      const r = await api.createInvoice(tier, provider, promo || undefined);
      if (r.url) {
        window.open(r.url, "_blank");
      } else {
        alert(`Заявка #${r.payment_id} создана. Админ свяжется.`);
      }
    } catch (e: any) {
      alert(e?.payload?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">{t("billing.title")}</h1>
      <Card>
        <div>
          Текущий тариф: <b>{tierName}</b>
        </div>
        {p?.expires && (
          <div className="text-xs text-text-muted">
            До {new Date(p.expires * 1000).toLocaleDateString()}
          </div>
        )}
      </Card>

      <input
        className="input"
        placeholder="Промокод (если есть)"
        value={promo}
        onChange={(e) => setPromo(e.target.value)}
      />

      {TIERS.map((tier) => (
        <Card key={tier.id} title={tier.name}>
          <p className="text-sm text-text-muted mb-3">{tier.desc}</p>
          <div className="flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => buy(tier.id, "yookassa")}
              disabled={busy}
            >
              💳 ЮKassa
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() => buy(tier.id, "crypto_bot")}
              disabled={busy}
            >
              ₿ Crypto
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
