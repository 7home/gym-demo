import { seedDemo, generateLessonsForMonth } from './actions';
import { createSupabaseServer } from '@/lib/supabaseServer';
import { prisma } from '@/lib/db';

export default async function Dashboard() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const me = await prisma.user.findUnique({ where: { authId: user.id } });
  const slotsCount = me ? await prisma.slot.count({
    where: { client: { userId: me.id }, active: true },
  }) : 0;
  const lessonsCount = me ? await prisma.lesson.count({
    where: { slot: { client: { userId: me.id } } },
  }) : 0;

  async function seed() { 'use server'; await seedDemo(); }
  async function gen()  { 'use server'; await generateLessonsForMonth(); }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="space-y-2">
        <div>Aktivní sloty: {slotsCount}</div>
        <div>Počet lekcí: {lessonsCount}</div>
      </div>

      <form action={seed}>
        <button className="px-4 py-2 rounded bg-amber-600 text-white">Seed demo data</button>
      </form>

      <form action={gen}>
        <button className="px-4 py-2 rounded bg-blue-600 text-white">Vygenerovat lekce pro měsíc</button>
      </form>
    </main>
  );
}