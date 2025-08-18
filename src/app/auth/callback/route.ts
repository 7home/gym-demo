import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const redirectTo = `${url.origin}/app`; // kam uživatele po přihlášení pustíme
  const res = NextResponse.redirect(redirectTo);

  if (!code) {
    // žádný kód → pošli na login
    return NextResponse.redirect(`${url.origin}/login`);
  }

  // vytvoř serverový Supabase klient s cookie bridge
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // vyměň kód za session → nastaví cookies do `res`
  await supabase.auth.exchangeCodeForSession(code);

  return res;
}