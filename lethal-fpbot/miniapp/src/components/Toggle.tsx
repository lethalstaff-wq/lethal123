interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}

export default function Toggle({ checked, onChange, label, hint }: Props) {
  return (
    <label className="flex items-start justify-between gap-4 py-3 cursor-pointer">
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        {hint && <div className="text-xs text-text-muted">{hint}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${
          checked ? "bg-brand-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}
