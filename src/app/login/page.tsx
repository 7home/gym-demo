'use client';
import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (!error) setSent(true);
    else alert(error.message);
  };

  return (
    <main className="min-h-screen grid place-items-center p-8">
      <form onSubmit={onSubmit} className="space-y-4 max-w-sm w-full">
        <h1 className="text-2xl font-bold">Přihlášení</h1>
        <input className="border rounded px-3 py-2 w-full" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tvoje@email.cz" />
        <button className="bg-black text-white rounded px-4 py-2 w-full" type="submit">Poslat magic link</button>
        {sent && <p className="text-green-600">Zkontroluj e‑mail, poslal jsem odkaz k přihlášení.</p>}
      </form>
    </main>
  );
}