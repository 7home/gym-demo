import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// v Next 15 je cookies() asynchronní → funkce bude async
export const createSupabaseServer = async () => {
  const cookieStore = await cookies(); // Promise → await

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // V RSC (layouty, server components) nelze měnit hlavičky.
        // Pro naše účely stačí no-op; obnovu session řeší middleware/route handlers.
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(_name: string, _options: CookieOptions) {},
      },
    }
  );
};