'use server';

import { prisma } from '@/lib/db';
import { createSupabaseServer } from '@/lib/supabaseServer';
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

/**
 * Pomocná: vygeneruje Date na daný den s časem ze slotu (startMin).
 */
function atSlotTime(d: Date, startMin: number) {
  const dt = new Date(d);
  dt.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0);
  return dt;
}

/**
 * Založí demo data: trenéra, klienta (tebe), 1 slot (Čt 14:00).
 */
export async function seedDemo() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const me = await prisma.user.findUnique({ where: { authId: user.id } });
  if (!me) throw new Error('User row not found');

  // demo trenér
  const demoTrainerUser = await prisma.user.upsert({
    where: { authId: 'trainer-demo-auth-id' },
    update: {},
    create: { authId: 'trainer-demo-auth-id', role: 'TRAINER' },
  });

  const demoTrainer = await prisma.trainer.upsert({
    where: { userId: demoTrainerUser.id },
    update: {},
    create: { userId: demoTrainerUser.id, hourlyFix: 600, active: true },
  });

  // klient = aktuálně přihlášený uživatel
  const client = await prisma.client.upsert({
    where: { userId: me.id },
    update: { trainerId: demoTrainer.id, rate: 900 },
    create: { userId: me.id, trainerId: demoTrainer.id, rate: 900 },
  });

  // slot (Čt 14:00, 60 min), pokud ještě není
  await prisma.slot.upsert({
    where: {
      // unikátní klíč nemáme; najdeme ručně a případně vytvoříme
      // proto zkusíme najít:
      // … ale upsert potřebuje unique where → uděláme to přes findFirst+create
      // => řešíme jednoduše:
      id: (
        await prisma.slot.findFirst({
          where: {
            clientId: client.id,
            trainerId: demoTrainer.id,
            weekday: 4,           // Čt (getDay: 0=Ne, 4=Čt)
            startMin: 14 * 60,
            active: true,
          },
          select: { id: true },
        })
      )?.id ?? '___force_create___',
    },
    update: {},
    create: {
      clientId: client.id,
      trainerId: demoTrainer.id,
      weekday: 4,           // Čt
      startMin: 14 * 60,    // 14:00
      durationMin: 60,
      active: true,
    },
  });

  return { ok: true };
}

/**
 * Vygeneruje Lesson z aktivních slotů aktuálního uživatele pro aktuální měsíc.
 * (nevytváří duplicity pro slotId+date)
 */
export async function generateLessonsForMonth() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const me = await prisma.user.findUnique({ where: { authId: user.id } });
  if (!me) throw new Error('User row not found');

  const client = await prisma.client.findUnique({
    where: { userId: me.id },
    include: { slots: { where: { active: true } } },
  });

  if (!client || client.slots.length === 0) return { created: 0 };

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  let created = 0;

  for (const slot of client.slots) {
    for (const day of days) {
      // getDay: 0=Ne, 1=Po, …, 4=Čt, …
      if (day.getDay() !== slot.weekday) continue;

      const lessonStart = atSlotTime(day, slot.startMin);

      // existuje?
      const exists = await prisma.lesson.findFirst({
        where: { slotId: slot.id, date: lessonStart },
        select: { id: true },
      });
      if (exists) continue;

      await prisma.lesson.create({
        data: {
          slotId: slot.id,
          date: lessonStart,
          state: 'PLANNED',
          type: 'CONTRACT',
        },
      });
      created++;
    }
  }

  return { created };
}