const STORAGE_KEY = "tester:teacher-sessions";

export type CachedTeacherSession = {
  sessionId: string;
  teacherKey: string;
  ownerName: string;
  testId: string;
  createdAt: string;
};

function readSessions(): CachedTeacherSession[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isCachedTeacherSession);
  } catch {
    return [];
  }
}

function writeSessions(sessions: CachedTeacherSession[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function isCachedTeacherSession(value: unknown): value is CachedTeacherSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Record<string, unknown>;
  return (
    typeof session.sessionId === "string" &&
    typeof session.teacherKey === "string" &&
    typeof session.ownerName === "string" &&
    typeof session.testId === "string" &&
    typeof session.createdAt === "string"
  );
}

export function cacheTeacherSession(session: CachedTeacherSession): void {
  const existing = readSessions().filter(
    (item) => item.sessionId !== session.sessionId,
  );
  writeSessions([session, ...existing]);
}

export function getCachedTeacherSessions(): CachedTeacherSession[] {
  return readSessions();
}

export function removeCachedTeacherSession(sessionId: string): void {
  writeSessions(readSessions().filter((item) => item.sessionId !== sessionId));
}
