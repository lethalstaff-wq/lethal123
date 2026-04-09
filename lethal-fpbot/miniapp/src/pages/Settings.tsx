import { useApiCall } from "../hooks/useApiCall";
import { api } from "../api";
import { t } from "../i18n";
import Card from "../components/Card";
import Spinner from "../components/Spinner";
import Toggle from "../components/Toggle";

const TOGGLES = [
  { key: "auto_raise", label: "Автоподнятие" },
  { key: "auto_delivery", label: "Автовыдача" },
  { key: "auto_response", label: "Автоответчик" },
  { key: "always_online", label: "Вечный онлайн" },
  { key: "ask_review", label: "Просить отзыв" },
  { key: "ask_confirm", label: "Просить подтвердить" },
  { key: "auto_complaint", label: "Авто-жалоба 24ч" },
  { key: "review_reply", label: "Ответ на отзывы" },
  { key: "cross_sell", label: "Кросселл" },
  { key: "funnel_enabled", label: "Воронка" },
  { key: "anti_scam", label: "Антискам" },
  { key: "smart_pricing", label: "Смарт-прайсинг" },
];

export default function Settings() {
  const { data, loading, refresh } = useApiCall(() => api.getSettings());

  if (loading) return <Spinner />;
  const s = data?.settings || {};

  const toggle = async (key: string) => {
    await api.patchSettings({ [key]: !s[key] });
    refresh();
  };

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
      <Card>
        {TOGGLES.map((tg) => (
          <Toggle
            key={tg.key}
            checked={Boolean(s[tg.key])}
            onChange={() => toggle(tg.key)}
            label={tg.label}
          />
        ))}
      </Card>
      <Card title="Интервалы">
        <div className="text-sm text-text-muted">
          Текущий интервал автоподнятия:{" "}
          <b>{s.raise_interval || 240} мин</b>
        </div>
        <div className="text-sm text-text-muted">
          Просить подтвердить через: <b>{s.confirm_minutes || 30} мин</b>
        </div>
        <div className="text-sm text-text-muted">
          Жаловаться через: <b>{s.complaint_hours || 24} ч</b>
        </div>
      </Card>
    </div>
  );
}
