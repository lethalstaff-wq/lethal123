interface Props {
  label: string;
  value: string | number;
  hint?: string;
  trend?: "up" | "down" | "flat";
}

export default function Stat({ label, value, hint, trend }: Props) {
  const arrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "";
  const colour =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
      ? "text-red-600"
      : "text-text-muted";
  return (
    <div className="card flex flex-col gap-1">
      <div className="text-text-muted text-xs uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {hint && (
        <div className={`text-xs ${colour}`}>
          {arrow} {hint}
        </div>
      )}
    </div>
  );
}
