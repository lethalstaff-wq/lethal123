import { useState } from "react";
import { useApiCall } from "../hooks/useApiCall";
import { api } from "../api";
import { t } from "../i18n";
import Card from "../components/Card";
import Stat from "../components/Stat";
import Spinner from "../components/Spinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const PERIODS = [
  { id: "day", label: "День" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "all", label: "Всё" },
];

export default function Stats() {
  const [period, setPeriod] = useState("week");
  const { data, loading } = useApiCall(() => api.stats(period), [period]);
  const ltv = useApiCall(() => api.ltv());
  const forecast = useApiCall(() => api.forecast(7));

  if (loading) return <Spinner />;
  const summary = data?.summary || { count: 0, total: 0 };
  const tops = data?.top_lots || [];
  const chart = (data?.chart || []).map((p: any) => ({
    day: new Date(p.day * 1000).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
    }),
    revenue: p.total,
    orders: p.count,
  }));

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">{t("stats.title")}</h1>

      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            className={`flex-1 px-3 py-2 rounded-xl text-sm ${
              p.id === period
                ? "bg-brand-500 text-white"
                : "bg-bg-subtle text-text"
            }`}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label={t("stats.revenue")} value={`${summary.total}₽`} />
        <Stat label={t("stats.orders")} value={summary.count} />
        <Stat
          label="LTV"
          value={ltv.data?.ltv ? `${ltv.data.ltv}₽` : "—"}
        />
        <Stat
          label="AOV"
          value={ltv.data?.aov ? `${ltv.data.aov}₽` : "—"}
        />
      </div>

      <Card title="Динамика">
        {chart.length === 0 ? (
          <p className="text-text-muted text-center py-6">
            {t("dashboard.no_sales")}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#7c5cff" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card title="Топ лотов">
        {tops.length === 0 ? (
          <p className="text-text-muted text-center py-4">{t("common.empty")}</p>
        ) : (
          <ul className="space-y-2">
            {tops.map((lot: any, i: number) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate flex-1">{lot.lot_name || "—"}</span>
                <span className="font-medium">{lot.total}₽</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={`Прогноз 7 дней (${forecast.data?.confidence || "—"})`}>
        {forecast.data?.forecast?.length ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={forecast.data.forecast.map((p: any) => ({
                day: new Date(p.day * 1000).toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                }),
                predicted: p.predicted,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="predicted" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-text-muted text-center py-4">
            Недостаточно данных
          </p>
        )}
      </Card>
    </div>
  );
}
