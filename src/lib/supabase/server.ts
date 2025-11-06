// src/lib/supabase/server.ts
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export function supabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Support Next 13/14 signatures without TS drama
          const anyStore = cookieStore as any;
          try { anyStore.set(name, value, options); }
          catch { anyStore.set({ name, value, ...options }); }
        },
        remove(name: string, options: CookieOptions) {
          const anyStore = cookieStore as any;
          try { anyStore.set(name, '', { ...options, maxAge: 0 }); }
          catch { anyStore.set({ name, value: '', ...options, maxAge: 0 }); }
        },
      },
    }
  );
}
