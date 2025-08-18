'use client';

import { createSupabaseBrowser } from '@/lib/supabaseClient';
import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const supabase = createSupabaseBrowser();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) {
      alert(error.message);
    } else {
      alert('Zkontroluj e-mail – poslal jsem magic link.');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="border p-2 rounded"
        required
      />
      <button className="px-4 py-2 rounded bg-blue-600 text-white">Poslat magic link</button>
    </form>
  );
}