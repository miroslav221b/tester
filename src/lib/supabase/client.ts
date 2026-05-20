import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Project URL only — Supabase JS appends `/rest/v1` itself. */
export function normalizeSupabaseUrl(url: string): string {
  let normalized = url.trim().replace(/\/+$/, "");
  if (normalized.endsWith("/rest/v1")) {
    normalized = normalized.slice(0, -"/rest/v1".length).replace(/\/+$/, "");
  }
  return normalized;
}

function getSupabaseEnv(): { url: string; anonKey: string } {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawUrl?.trim() || !anonKey) {
    const inBrowser = typeof window !== "undefined";
    if (inBrowser) {
      throw new Error(
        "Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
      );
    }
    throw new Error(
      "Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { url: normalizeSupabaseUrl(rawUrl), anonKey };
}

export function createSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey);
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient();
  }
  return client;
}
