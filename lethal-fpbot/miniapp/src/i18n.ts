// Минималистичный i18n для Mini App. Грузит ru.ts по умолчанию,
// en.ts если язык TG != ru.

import en from "./locales/en";
import ru from "./locales/ru";

const dicts: Record<string, Record<string, string>> = { ru, en };

let lang = "ru";

export function setLang(code: string) {
  if (code in dicts) lang = code;
}

export function detectLang(): string {
  const tg = window.Telegram?.WebApp;
  const code = tg?.initDataUnsafe?.user?.language_code;
  if (code && code in dicts) return code;
  return "ru";
}

export function t(key: string, vars?: Record<string, string | number>): string {
  let val = dicts[lang]?.[key] ?? dicts.ru[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      val = val.replace(`{${k}}`, String(v));
    }
  }
  return val;
}
