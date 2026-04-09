interface Props {
  icon?: string;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon = "📭", title, hint, action }: Props) {
  return (
    <div className="flex flex-col items-center text-center py-10">
      <div className="text-5xl mb-3">{icon}</div>
      <div className="text-lg font-semibold">{title}</div>
      {hint && <div className="text-text-muted text-sm mt-1">{hint}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
