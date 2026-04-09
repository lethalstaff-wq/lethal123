import { useState } from "react";
import { useApiCall } from "../hooks/useApiCall";
import { api } from "../api";
import Card from "../components/Card";
import Spinner from "../components/Spinner";
import Modal from "../components/Modal";
import Input from "../components/Input";
import EmptyState from "../components/EmptyState";

export default function AutoDelivery() {
  const { data, loading, refresh } = useApiCall(() => api.listAutoDelivery());
  const [show, setShow] = useState(false);
  const [lotName, setLotName] = useState("");
  const [items, setItems] = useState("");
  const [tpl, setTpl] = useState("");

  if (loading) return <Spinner />;
  const rules = data?.rules || [];

  const submit = async () => {
    const list = items.split("\n").map((x) => x.trim()).filter(Boolean);
    if (!lotName || !list.length) return;
    await api.addAutoDelivery(lotName, list, tpl || undefined);
    setShow(false);
    setLotName("");
    setItems("");
    setTpl("");
    refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🤖 Автовыдача</h1>
        <button className="btn-primary" onClick={() => setShow(true)}>
          + Лот
        </button>
      </div>

      {rules.length === 0 ? (
        <EmptyState icon="🤖" title="Нет правил" />
      ) : (
        rules.map((r: any) => (
          <Card key={r.id}>
            <div className="font-semibold">{r.lot_name}</div>
            <div className="text-xs text-text-muted">
              Осталось товаров: {(r.items || []).length}
            </div>
            <button
              className="btn-danger text-xs px-3 py-1 mt-2"
              onClick={async () => {
                await api.deleteAutoDelivery(r.id);
                refresh();
              }}
            >
              Удалить
            </button>
          </Card>
        ))
      )}

      <Modal open={show} onClose={() => setShow(false)} title="Новый лот">
        <Input
          label="Название лота"
          value={lotName}
          onChange={(e) => setLotName(e.target.value)}
        />
        <div className="mb-3">
          <label className="label">Товары (по одному на строку)</label>
          <textarea
            className="input"
            rows={5}
            value={items}
            onChange={(e) => setItems(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="label">Шаблон сообщения (опц.)</label>
          <textarea
            className="input"
            rows={2}
            value={tpl}
            onChange={(e) => setTpl(e.target.value)}
            placeholder="Спасибо за покупку! Ваш товар: {item}"
          />
        </div>
        <button className="btn-primary w-full" onClick={submit}>
          Сохранить
        </button>
      </Modal>
    </div>
  );
}
