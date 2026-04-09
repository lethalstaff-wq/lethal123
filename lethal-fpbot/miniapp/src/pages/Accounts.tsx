import { useState } from "react";
import { useApiCall } from "../hooks/useApiCall";
import { api } from "../api";
import { t } from "../i18n";
import Card from "../components/Card";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import Input from "../components/Input";

export default function Accounts() {
  const { data, loading, refresh } = useApiCall(() => api.listAccounts());
  const [showAdd, setShowAdd] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [proxy, setProxy] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <Spinner />;
  const accounts = data?.accounts || [];

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.addAccount({
        login,
        password,
        proxy: proxy || undefined,
      });
      setShowAdd(false);
      setLogin("");
      setPassword("");
      setProxy("");
      refresh();
    } catch (e: any) {
      setError(e?.payload?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: number, login: string) => {
    if (!confirm(`Удалить аккаунт ${login}?`)) return;
    await api.deleteAccount(id);
    refresh();
  };

  const onReconnect = async (id: number) => {
    setBusy(true);
    try {
      await api.reconnect(id);
      refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("accounts.title")}</h1>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          + {t("accounts.add")}
        </button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          icon="📁"
          title={t("accounts.empty")}
          action={
            <button className="btn-primary" onClick={() => setShowAdd(true)}>
              {t("accounts.add")}
            </button>
          }
        />
      ) : (
        accounts.map((acc: any) => (
          <Card key={acc.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{acc.login}</div>
                <div className="text-xs text-text-muted">
                  {acc.is_online
                    ? t("accounts.online")
                    : t("accounts.offline")}{" "}
                  · {acc.proxy || "🌐"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-secondary text-xs px-3 py-1"
                  onClick={() => onReconnect(acc.id)}
                  disabled={busy}
                >
                  {t("accounts.reconnect")}
                </button>
                <button
                  className="btn-danger text-xs px-3 py-1"
                  onClick={() => onDelete(acc.id, acc.login)}
                >
                  ✕
                </button>
              </div>
            </div>
          </Card>
        ))
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title={t("accounts.add")}
      >
        <Input
          label="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
        <Input
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Прокси (опционально)"
          value={proxy}
          onChange={(e) => setProxy(e.target.value)}
          placeholder="http://user:pass@host:port"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button
            className="btn-secondary flex-1"
            onClick={() => setShowAdd(false)}
            disabled={busy}
          >
            {t("common.cancel")}
          </button>
          <button
            className="btn-primary flex-1"
            onClick={submit}
            disabled={busy || !login || !password}
          >
            {busy ? "..." : t("common.save")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
