import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async (cookieStore: ReturnType<typeof cookies>) => {
  const cookieStoreResolved = await cookieStore;
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStoreResolved.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) => cookieStoreResolved.set(name, value))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}; 