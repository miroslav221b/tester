function ensureProtocol(baseUrl: string): string {
  if (/^https?:\/\//i.test(baseUrl)) {
    return baseUrl;
  }

  const useHttp =
    /^localhost(?::\d+)?(?:\/|$)/i.test(baseUrl) ||
    /^127\.\d+\.\d+\.\d+(?::\d+)?(?:\/|$)/.test(baseUrl) ||
    /^192\.168\.\d+\.\d+(?::\d+)?(?:\/|$)/.test(baseUrl) ||
    /^10\.\d+\.\d+\.\d+(?::\d+)?(?:\/|$)/.test(baseUrl);

  return `${useHttp ? "http" : "https"}://${baseUrl}`;
}

export function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return ensureProtocol(fromEnv).replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}
