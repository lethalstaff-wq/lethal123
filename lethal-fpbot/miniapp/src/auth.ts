// Авторизация Mini App: получаем initData от Telegram, обмениваем на JWT
import { api, getToken, setToken } from "./api";

export async function ensureLogin(): Promise<boolean> {
  if (getToken()) return true;
  const tg = window.Telegram?.WebApp;
  if (!tg) return false;
  const initData = tg.initData;
  if (!initData) return false;
  try {
    const { token } = await api.loginWithInitData(initData);
    setToken(token);
    return true;
  } catch (e) {
    console.error("login failed", e);
    return false;
  }
}
