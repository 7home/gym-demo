import { createSupabaseServer } from '@/lib/supabaseServer';
import { generateLessonsForMonth } from './actions';

export default async function Dashboard() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  async function action(formData: FormData) {
    'use server';
    const month = String(formData.get('month'));
    await generateLessonsForMonth(month);
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Přihlášen: {user?.email}</p>
      <form action={action} className="flex items-center gap-2">
        <input name="month" defaultValue={new Date().toISOString().slice(0,7)} className="border px-2 py-1 rounded" />
        <button className="bg-black text-white rounded px-3 py-1" type="submit">Vygenerovat lekce pro měsíc (YYYY-MM)</button>
      </form>
    </main>
  );
}