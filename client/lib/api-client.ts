export type EntityRecord = Record<string, any> & { id?: string; status?: string };

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
export const appParams = { appId: "", token: typeof window === "undefined" ? null : token() };

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function token(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("access_token") || window.localStorage.getItem("token");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const accessToken = token();
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: "include" });
  const data = await response.json().catch(() => undefined);
  if (!response.ok) throw new ApiError((data as { message?: string })?.message || response.statusText, response.status, data);
  return data as T;
}

const entityPath = (name: string) => {
  const pluralNames: Record<string, string> = {
    Application: "applications",
    Certificate: "certificates",
    Complaint: "complaints",
    Inspection: "inspections",
    Instrument: "instruments",
    ToleranceRule: "tolerance-rules",
  };
  return pluralNames[name] || (name.endsWith("s") ? name.toLowerCase() : `${name.toLowerCase()}s`);
};

const entity = (name: string) => {
  const path = entityPath(name);
  return {
  list: (sort?: string, limit?: number) => {
    const query = new URLSearchParams();
    if (sort) query.set("sort", sort);
    if (limit) query.set("limit", String(limit));
    const suffix = query.toString() ? `?${query}` : "";
    return request<EntityRecord[]>(`/api/entities/${path}${suffix}`);
  },
  get: (id: string) => request<EntityRecord>(`/api/entities/${path}/${id}`),
  filter: (filters: Record<string, unknown>, sort?: string, limit?: number) => {
    const query = new URLSearchParams(filters as Record<string, string>);
    if (sort) query.set("sort", sort);
    if (limit) query.set("limit", String(limit));
    return request<EntityRecord[]>(`/api/entities/${path}?${query}`);
  },
  create: (data: EntityRecord) => request<EntityRecord>(`/api/entities/${path}`, { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: EntityRecord) => request<EntityRecord>(`/api/entities/${path}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  };
};

export const api = {
  entities: new Proxy({} as Record<string, ReturnType<typeof entity>>, { get: (_, name) => entity(String(name)) }),
  auth: {
    me: () => request<any>("/api/auth/me"),
    loginViaEmailPassword: async (email: string, password: string) => {
      const result = await request<{ access_token: string }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      if (typeof window !== "undefined") window.localStorage.setItem("access_token", result.access_token);
      return result;
    },
    register: (data: { email: string; password: string }) => request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
    verifyOtp: (data: Record<string, string>) => request<{ access_token: string }>("/api/auth/verify-otp", { method: "POST", body: JSON.stringify(data) }),
    resendOtp: (email: string) => request("/api/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) }),
    resetPasswordRequest: (email: string) => request("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
    resetPassword: (data: Record<string, string>) => request("/api/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),
    updateMe: (data: EntityRecord) => request<EntityRecord>("/api/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
    setToken: (value: string) => { if (typeof window !== "undefined") window.localStorage.setItem("access_token", value); },
    logout: (redirect?: string) => { if (typeof window !== "undefined") { window.localStorage.removeItem("access_token"); window.localStorage.removeItem("token"); if (redirect) window.location.href = redirect; } },
    redirectToLogin: (redirect?: string) => { if (typeof window !== "undefined") window.location.href = `/login${redirect ? `?returnTo=${encodeURIComponent(redirect)}` : ""}`; },
    loginWithProvider: (provider: string, redirect?: string) => { if (typeof window !== "undefined") window.location.href = `${API_URL}/api/auth/${provider}?returnTo=${encodeURIComponent(redirect || "/")}`; },
  },
  app: { getPublicSettings: () => request<unknown>("/api/app/public-settings") },
  functions: { invoke: (name: string, data: unknown) => request<unknown>(`/api/functions/${name}`, { method: "POST", body: JSON.stringify(data) }) },
  agents: {
    createConversation: (data: unknown) => request<EntityRecord>("/api/chat/conversations", { method: "POST", body: JSON.stringify(data) }),
    addMessage: (conversation: EntityRecord, data: unknown) => request("/api/chat/messages", { method: "POST", body: JSON.stringify({ conversation, ...data as object }) }),
    subscribeToConversation: (_id: string, _callback: (data: any) => void) => () => undefined,
  },
};
