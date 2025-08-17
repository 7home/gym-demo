import { ReactNode } from 'react';
import { createSupabaseServer } from '@/lib/supabaseServer';
import { prisma } from '@/lib/db';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServer(); // ← přidat await
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  await prisma.user.upsert({
    where: { authId: user.id },
    update: {},
    create: { authId: user.id, role: 'CLIENT' },
  });

  return (
    <section className="min-h-screen">
      <nav className="border-b p-4 flex gap-4">
        <a href="/app/dashboard">Dashboard</a>
        <a href="/app/trainer">Trainer</a>
        <a href="/app/client">Client</a>
      </nav>
      {children}
    </section>
  );
}