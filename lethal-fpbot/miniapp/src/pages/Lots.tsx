import { useRef, useState } from "react";
import { useApiCall } from "../hooks/useApiCall";
import { api } from "../api";
import { t } from "../i18n";
import Card from "../components/Card";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";

export default function Lots() {
  const { data, loading, refresh } = useApiCall(() => api.listLots());
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (loading) return <Spinner />;
  const lots = (data?.lots || []).filter((l: any) =>
    !filter || (l.title || "").toLowerCase().includes(filter.toLowerCase())
  );

  const raise = async () => {
    setBusy(true);
    try {
      const r = await api.raiseAll();
      alert(`Поднято: ${r.raised}`);
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const r = await api.bulkUpload(file);
      alert(`Импортировано: ${r.imported}`);
      refresh();
    } catch (e: any) {
      alert(e?.payload?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t("lots.title")}</h1>
        <div className="flex gap-2">
          <button
            className="btn-secondary text-xs px-3 py-1"
            onClick={refresh}
            disabled={busy}
          >
            ↻
          </button>
          <button
            className="btn-primary text-xs px-3 py-1"
            onClick={raise}
            disabled={busy}
          >
            ⬆️ {t("lots.raise")}
          </button>
        </div>
      </div>

      <input
        className="input"
        placeholder="Фильтр по названию…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className="flex gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />
        <button
          className="btn-secondary flex-1"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          📤 {t("lots.bulk")}
        </button>
      </div>

      {lots.length === 0 ? (
        <EmptyState icon="📦" title={t("lots.empty")} />
      ) : (
        <div className="space-y-2">
          {lots.map((lot: any) => (
            <Card key={`${lot.account_id}-${lot.id}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{lot.title}</div>
                  <div className="text-xs text-text-muted">
                    {lot.game_name || "—"} · {lot.type}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {lot.price} {lot.currency}
                  </div>
                  <div className="text-xs text-text-muted">
                    {lot.account_login}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
