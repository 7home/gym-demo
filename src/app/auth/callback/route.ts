import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export const runtime = 'nodejs';          // pojistka
export const dynamic = 'force-dynamic';   // nikdy necachovat
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${url.origin}/login`);
  }

  // Připravíme redirect response, do kterého budeme zapisovat cookies
  const redirectTo = `${url.origin}/app`;
  const res = NextResponse.redirect(redirectTo);

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

  // Výměna kódu za session → zapíše Set-Cookie do `res`
  await supabase.auth.exchangeCodeForSession(code);

  return res;
}