// Тонкая обёртка над fetch для работы с /api/*
// Хранит JWT в localStorage и автоматически добавляет в Authorization.

const STORAGE_KEY = "lethal_token";

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(status: number, payload: unknown, message?: string) {
    super(message || `API ${status}`);
    this.status = status;
    this.payload = payload;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isFormData = false
): Promise<T> {
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  const resp = await fetch(`/api${path}`, init);
  const text = await resp.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!resp.ok) {
    throw new ApiError(resp.status, data);
  }
  return data as T;
}

export const api = {
  // ----- AUTH -----
  loginWithInitData: (initData: string) =>
    request<{ token: string; user: any }>("POST", "/auth/login", {
      init_data: initData,
    }),

  // ----- ACCOUNTS -----
  listAccounts: () =>
    request<{ accounts: any[] }>("GET", "/accounts"),
  getAccount: (id: number) =>
    request<{ account: any }>("GET", `/accounts/${id}`),
  addAccount: (payload: { login: string; password: string; proxy?: string }) =>
    request<{ id: number }>("POST", "/accounts", payload),
  deleteAccount: (id: number) =>
    request<{ ok: boolean }>("DELETE", `/accounts/${id}`),
  setProxy: (id: number, proxy: string | null) =>
    request<{ ok: boolean }>("PATCH", `/accounts/${id}/proxy`, { proxy }),
  reconnect: (id: number) =>
    request<{ ok: boolean }>("POST", `/accounts/${id}/reconnect`),

  // ----- LOTS -----
  listLots: () => request<{ lots: any[]; count: number }>("GET", "/lots"),
  raiseAll: () => request<{ raised: number }>("POST", "/lots/raise"),
  bulkUpload: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return request<{ imported: number }>("POST", "/lots/bulk", fd, true);
  },

  // ----- CHATS -----
  listChats: () => request<{ chats: any[] }>("GET", "/chats"),
  chatMessages: (accId: number, chatId: string) =>
    request<{ messages: any[] }>(
      "GET",
      `/chats/${accId}/${encodeURIComponent(chatId)}/messages`
    ),
  sendMessage: (accId: number, chatId: string, text: string) =>
    request<{ ok: boolean }>("POST", `/chats/${accId}/send`, {
      chat_id: chatId,
      text,
    }),

  // ----- STATS / FORECAST -----
  stats: (period: string) =>
    request<any>("GET", `/stats?period=${period}`),
  forecast: (days: number) =>
    request<any>("GET", `/forecast?days=${days}`),
  ltv: () => request<any>("GET", "/forecast/ltv"),

  // ----- SETTINGS -----
  getSettings: () => request<{ settings: any }>("GET", "/settings"),
  patchSettings: (patch: Record<string, any>) =>
    request<{ settings: any }>("PATCH", "/settings", patch),

  // ----- AUTO RESPONSE -----
  listAutoResponses: () => request<{ rules: any[] }>("GET", "/auto_response"),
  addAutoResponse: (triggers: string[], response: string) =>
    request<{ id: number }>("POST", "/auto_response", { triggers, response }),
  deleteAutoResponse: (id: number) =>
    request<{ ok: boolean }>("DELETE", `/auto_response/${id}`),

  // ----- AUTO DELIVERY -----
  listAutoDelivery: () => request<{ rules: any[] }>("GET", "/auto_delivery"),
  addAutoDelivery: (lot_name: string, items: string[], template?: string) =>
    request<{ id: number }>("POST", "/auto_delivery", {
      lot_name,
      items,
      template,
    }),
  deleteAutoDelivery: (id: number) =>
    request<{ ok: boolean }>("DELETE", `/auto_delivery/${id}`),

  // ----- TEXTS -----
  listTexts: () => request<{ texts: any[] }>("GET", "/texts"),
  addText: (name: string, text: string) =>
    request<{ id: number }>("POST", "/texts", { name, text }),
  deleteText: (id: number) =>
    request<{ ok: boolean }>("DELETE", `/texts/${id}`),

  // ----- BILLING / PAYMENTS -----
  tiers: () => request<{ tiers: any[] }>("GET", "/billing/tiers"),
  buy: (tier: string, promo?: string) =>
    request<{ payment_id: number; amount: number }>("POST", "/billing/buy", {
      tier,
      promo,
    }),
  createInvoice: (tier: string, provider: string, promo?: string) =>
    request<any>("POST", "/payments/create", { tier, provider, promo }),

  // ----- PROFILE -----
  profile: () => request<any>("GET", "/profile"),

  // ----- AI -----
  aiReply: (text: string, context?: string) =>
    request<{ suggestion: string }>("POST", "/ai/reply", { text, context }),
  aiArbitrage: (account_id: number, chat_id: string) =>
    request<{ defense: string }>("POST", "/ai/arbitrage", {
      account_id,
      chat_id,
    }),

  // ----- GAMES -----
  listGames: (category?: string) =>
    request<{ games: any[] }>(
      "GET",
      category ? `/games?category=${category}` : "/games"
    ),
  listGameCategories: () =>
    request<{ categories: string[] }>("GET", "/games/categories"),

  // ----- NOTIFICATIONS -----
  getNotifPrefs: () => request<{ prefs: any }>("GET", "/notifications"),
  patchNotifPrefs: (patch: Record<string, any>) =>
    request<{ prefs: any }>("PATCH", "/notifications", patch),
};
