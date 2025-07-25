// Filename: client.ts
// Path: @/lib/supabase/
import { env } from "@/env";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Type alias for clarity
type BrowserClient = SupabaseClient<any, "public", any>;

// 🧠 Client for Project One (Your main Nexus application)
export function createClient(): BrowserClient {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// 🧠 Client for Project Two (Your Data Source)
export function createClientTwo(): BrowserClient {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_TWO_URL,
    env.NEXT_PUBLIC_SUPABASE_TWO_ANON_KEY
  );
}
