import { createSupabaseServer } from '@/lib/supabaseServer';

export default async function Dashboard() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p>Přihlášen: {user?.email}</p>
    </main>
  );
}