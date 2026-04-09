import { useState } from "react";
import { useApiCall } from "../hooks/useApiCall";
import { api } from "../api";
import { t } from "../i18n";
import Card from "../components/Card";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

export default function Chats() {
  const { data, loading, refresh } = useApiCall(() => api.listChats());
  const [active, setActive] = useState<{ accId: number; chatId: string; name: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const messages = useApiCall(
    () => (active ? api.chatMessages(active.accId, active.chatId) : Promise.resolve({ messages: [] })),
    [active?.accId, active?.chatId]
  );

  if (loading) return <Spinner />;
  const chats = data?.chats || [];

  const send = async () => {
    if (!active || !draft.trim()) return;
    setBusy(true);
    try {
      await api.sendMessage(active.accId, active.chatId, draft);
      setDraft("");
      messages.refresh();
    } finally {
      setBusy(false);
    }
  };

  const aiReply = async () => {
    if (!active || !messages.data) return;
    setBusy(true);
    try {
      const lastBuyer = messages.data.messages
        .filter((m: any) => m.text)
        .pop();
      const r = await api.aiReply(lastBuyer?.text || "");
      setDraft(r.suggestion);
    } catch (e: any) {
      alert(e?.payload?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("chats.title")}</h1>
        <button className="btn-secondary text-xs px-3 py-1" onClick={refresh}>
          ↻
        </button>
      </div>

      {chats.length === 0 ? (
        <EmptyState icon="💬" title={t("chats.empty")} />
      ) : (
        chats.map((c: any, i: number) => (
          <Card
            key={`${c.account_id}-${c.chat_id}-${i}`}
            className="cursor-pointer"
          >
            <div
              onClick={() =>
                setActive({
                  accId: c.account_id,
                  chatId: c.chat_id,
                  name: c.interlocutor || c.chat_id,
                })
              }
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  {c.unread && "🔴 "}
                  {c.interlocutor || c.chat_id}
                </div>
                <div className="text-xs text-text-muted">
                  {c.account_login}
                </div>
              </div>
              <div className="text-sm text-text-muted truncate mt-1">
                {c.last_message || "—"}
              </div>
            </div>
          </Card>
        ))
      )}

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.name}
      >
        <div className="max-h-96 overflow-y-auto mb-3 space-y-2">
          {(messages.data?.messages || []).map((m: any, i: number) => (
            <div key={i} className="text-sm">
              <span className="font-semibold">{m.author || "?"}: </span>
              {m.text}
            </div>
          ))}
        </div>
        <textarea
          className="input mb-2"
          rows={3}
          placeholder={t("chats.placeholder")}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            className="btn-secondary flex-1"
            onClick={aiReply}
            disabled={busy}
          >
            🤖 {t("chats.ai")}
          </button>
          <button
            className="btn-primary flex-1"
            onClick={send}
            disabled={busy || !draft.trim()}
          >
            {t("chats.send")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
