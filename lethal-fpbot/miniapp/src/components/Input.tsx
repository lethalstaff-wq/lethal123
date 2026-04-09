import { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, ...rest }: Props) {
  return (
    <div className="mb-3">
      {label && <label className="label">{label}</label>}
      <input className="input" {...rest} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
