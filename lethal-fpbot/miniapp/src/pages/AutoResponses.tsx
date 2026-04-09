import { useState } from "react";
import { useApiCall } from "../hooks/useApiCall";
import { api } from "../api";
import Card from "../components/Card";
import Spinner from "../components/Spinner";
import Modal from "../components/Modal";
import Input from "../components/Input";
import EmptyState from "../components/EmptyState";

export default function AutoResponses() {
  const { data, loading, refresh } = useApiCall(() => api.listAutoResponses());
  const [show, setShow] = useState(false);
  const [triggers, setTriggers] = useState("");
  const [response, setResponse] = useState("");

  if (loading) return <Spinner />;
  const rules = data?.rules || [];

  const submit = async () => {
    const trigs = triggers.split(",").map((s) => s.trim()).filter(Boolean);
    if (!trigs.length || !response.trim()) return;
    await api.addAutoResponse(trigs, response);
    setShow(false);
    setTriggers("");
    setResponse("");
    refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📨 Автоответчик</h1>
        <button className="btn-primary" onClick={() => setShow(true)}>
          + Добавить
        </button>
      </div>

      {rules.length === 0 ? (
        <EmptyState
          icon="📨"
          title="Нет правил"
          hint="Добавь триггер-слова и текст ответа"
        />
      ) : (
        rules.map((r: any) => (
          <Card key={r.id}>
            <div className="font-semibold">
              {(r.trigger_words || []).join(", ")}
            </div>
            <div className="text-sm text-text-muted mt-1">{r.response_text}</div>
            <button
              className="btn-danger text-xs px-3 py-1 mt-2"
              onClick={async () => {
                await api.deleteAutoResponse(r.id);
                refresh();
              }}
            >
              Удалить
            </button>
          </Card>
        ))
      )}

      <Modal open={show} onClose={() => setShow(false)} title="Новый триггер">
        <Input
          label="Триггер-слова (через запятую)"
          value={triggers}
          onChange={(e) => setTriggers(e.target.value)}
          placeholder="привет, hi, hello"
        />
        <div className="mb-3">
          <label className="label">Ответ</label>
          <textarea
            className="input"
            rows={3}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
        </div>
        <button className="btn-primary w-full" onClick={submit}>
          Сохранить
        </button>
      </Modal>
    </div>
  );
}
