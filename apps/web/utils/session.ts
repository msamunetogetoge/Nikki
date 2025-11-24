export const SESSION_COOKIE_NAME = "nikki_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day
const SESSION_TTL_MS = SESSION_MAX_AGE_SECONDS * 1000;

type SessionRecord = {
  userId: string;
  expiresAt: number;
};

const sessions = new Map<string, SessionRecord>();

export function generateSessionToken(): string {
  return crypto.randomUUID();
}

export function createSession(userId: string): string {
  const token = generateSessionToken();
  sessions.set(token, {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

export function validateSession(
  token: string,
): { userId: string } | null {
  const session = sessions.get(token);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  return { userId: session.userId };
}

export function deleteSession(token: string) {
  sessions.delete(token);
}
