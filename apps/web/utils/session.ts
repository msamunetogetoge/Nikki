export interface SessionUser {
  id: number;
  user_id: string;
  user_name: string;
  token?: string;
}

const STORAGE_KEY = "nikki_session";

export function saveSession(user: SessionUser) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function loadSession(): SessionUser | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch (_err) {
    return null;
  }
}

export function clearSession() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
