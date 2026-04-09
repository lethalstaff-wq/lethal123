import { useState } from "react";
import { useApiCall } from "../hooks/useApiCall";
import { api } from "../api";
import Card from "../components/Card";
import Spinner from "../components/Spinner";
import Modal from "../components/Modal";
import Input from "../components/Input";
import EmptyState from "../components/EmptyState";

export default function Texts() {
  const { data, loading, refresh } = useApiCall(() => api.listTexts());
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  if (loading) return <Spinner />;
  const items = data?.texts || [];

  const submit = async () => {
    if (!name || !text) return;
    await api.addText(name, text);
    setShow(false);
    setName("");
    setText("");
    refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">✍️ Заготовки</h1>
        <button className="btn-primary" onClick={() => setShow(true)}>
          + Текст
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="✍️" title="Нет заготовок" />
      ) : (
        items.map((t: any) => (
          <Card key={t.id}>
            <div className="font-semibold">{t.name}</div>
            <div className="text-sm text-text-muted mt-1">{t.text}</div>
            <button
              className="btn-danger text-xs px-3 py-1 mt-2"
              onClick={async () => {
                await api.deleteText(t.id);
                refresh();
              }}
            >
              Удалить
            </button>
          </Card>
        ))
      )}

      <Modal open={show} onClose={() => setShow(false)} title="Новый текст">
        <Input
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="mb-3">
          <label className="label">Текст</label>
          <textarea
            className="input"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <button className="btn-primary w-full" onClick={submit}>
          Сохранить
        </button>
      </Modal>
    </div>
  );
}
