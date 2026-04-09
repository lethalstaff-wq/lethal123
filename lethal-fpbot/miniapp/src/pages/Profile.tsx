import { useApiCall } from "../hooks/useApiCall";
import { api } from "../api";
import { t } from "../i18n";
import Card from "../components/Card";
import Stat from "../components/Stat";
import Spinner from "../components/Spinner";

export default function Profile() {
  const { data, loading } = useApiCall(() => api.profile());

  if (loading) return <Spinner />;
  const p = data;

  const tier =
    p?.tier === "pro"
      ? "🥇 Pro"
      : p?.tier === "standard"
      ? "🥈 Standard"
      : p?.tier === "starter"
      ? "🥉 Starter"
      : "—";

  const copy = async () => {
    if (!p?.referral_code) return;
    await navigator.clipboard.writeText(p.referral_code);
    alert("Скопировано!");
  };

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">{t("profile.title")}</h1>

      <Card>
        <div className="text-sm text-text-muted">
          @{p?.username || "—"} · ID: {p?.telegram_id}
        </div>
        <div className="mt-2">
          Тариф: <b>{tier}</b>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Баланс" value={`${p?.balance || 0}₽`} />
        <Stat label="ФП-аккаунтов" value={p?.fp_accounts_count || 0} />
        <Stat label="Приглашено" value={p?.referrals_count || 0} />
        <Stat label="С нами" value={p?.created_at ? new Date(p.created_at * 1000).toLocaleDateString() : "—"} />
      </div>

      <Card title="Реферальный код">
        <div className="flex items-center gap-2">
          <code className="flex-1 font-mono text-lg">
            {p?.referral_code || "—"}
          </code>
          <button className="btn-primary text-xs px-3 py-1" onClick={copy}>
            Копировать
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Поделись ссылкой <code>t.me/your_bot?start={p?.referral_code}</code>
          {" "}и получай 10% от каждой покупки приглашённого.
        </p>
      </Card>
    </div>
  );
}
