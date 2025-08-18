'use server';

import { prisma } from '@/lib/db';
import { createSupabaseServer } from '@/lib/supabaseServer';
import { startOfMonth, endOfMonth, addDays, isBefore } from 'date-fns';

// EXISTUJÍCÍ generateLessonsForMonth ponech tak jak máš

export async function seedDemo() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // najdi/ověř existenci "User" řádku pro přihl. uživatele (ensure user)
  const me = await prisma.user.findUnique({ where: { authId: user.id } });
  if (!me) throw new Error('User row not found (ensure-user failed)');

  // demo trenér (vlastní User řádek s fiktivním authId)
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

  // klient = ty (tvoje User.id), rate a trenér
  const client = await prisma.client.upsert({
    where: { userId: me.id },
    update: { trainerId: demoTrainer.id, rate: 900 },
    create: { userId: me.id, trainerId: demoTrainer.id, rate: 900 },
  });

  // slot (čtvrtek 14:00, 60 min), pokud ještě není
  let slot = await prisma.slot.findFirst({
    where: { clientId: client.id, trainerId: demoTrainer.id, weekday: 4, startMin: 14 * 60, active: true },
  });
  if (!slot) {
    slot = await prisma.slot.create({
      data: {
        clientId: client.id,
        trainerId: demoTrainer.id,
        weekday: 4,
        startMin: 14 * 60,
        durationMin: 60,
        active: true,
      },
    });
  }

  return { ok: true, clientId: client.id, trainerId: demoTrainer.id, slotId: slot.id };
}