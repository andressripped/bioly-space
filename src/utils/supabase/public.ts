import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Plain, cookie-free Supabase client for anonymous, publicly-readable data
// (RLS already allows anon reads on `profiles`/`links`). Unlike
// `utils/supabase/server.ts`, this never calls `cookies()` and never forces
// `cache: 'no-store'`, so pages that use it can be statically rendered and
// revalidated (ISR) instead of opting out of caching on every request.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
  );
}
