import { useApiCall } from "../hooks/useApiCall";
import { api } from "../api";
import { t } from "../i18n";
import Card from "../components/Card";
import Stat from "../components/Stat";
import Spinner from "../components/Spinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const stats = useApiCall(() => api.stats("week"));
  const profile = useApiCall(() => api.profile());
  const ltv = useApiCall(() => api.ltv());
  const accounts = useApiCall(() => api.listAccounts());

  if (stats.loading || profile.loading) return <Spinner />;
  if (stats.error)
    return (
      <Card>
        <p>{t("common.error")}: {stats.error.message}</p>
      </Card>
    );

  const summary = stats.data?.summary || { count: 0, total: 0 };
  const chart = (stats.data?.chart || []).map((p: any) => ({
    day: new Date(p.day * 1000).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
    }),
    revenue: p.total,
    orders: p.count,
  }));

  const onlineAccs = (accounts.data?.accounts || []).filter(
    (a: any) => a.is_online
  ).length;

  return (
    <div className="space-y-3 pb-2">
      <h1 className="text-2xl font-bold mb-2">{t("nav.dashboard")}</h1>

      <div className="grid grid-cols-2 gap-3">
        <Stat
          label={t("dashboard.revenue.week")}
          value={`${summary.total}₽`}
        />
        <Stat label={t("dashboard.orders.today")} value={summary.count} />
        <Stat
          label={t("dashboard.accounts.online")}
          value={`${onlineAccs}/${accounts.data?.accounts.length || 0}`}
        />
        <Stat
          label={t("stats.aov")}
          value={
            ltv.data?.aov
              ? `${ltv.data.aov}₽`
              : "—"
          }
        />
      </div>

      <Card title={t("stats.revenue")}>
        {chart.length === 0 ? (
          <p className="text-text-muted text-center py-6">
            {t("dashboard.no_sales")}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#7c5cff"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card title={t("dashboard.top_lots")}>
        {(stats.data?.top_lots || []).length === 0 ? (
          <p className="text-text-muted text-center py-4">
            {t("common.empty")}
          </p>
        ) : (
          <ul className="space-y-2">
            {stats.data?.top_lots.map((lot: any, i: number) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate flex-1">
                  {lot.lot_name || "—"}
                </span>
                <span className="font-medium">{lot.total}₽</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
