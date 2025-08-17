'use server';
import { prisma } from '@/lib/db';
import { startOfMonth, endOfMonth, addDays, isSameDay } from 'date-fns';

export async function generateLessonsForMonth(isoMonth: string) {
  const month = new Date(isoMonth + '-01T00:00:00.000Z');
  const from = startOfMonth(month);
  const to = endOfMonth(month);
  const slots = await prisma.slot.findMany({ where: { active: true } });

  for (const slot of slots) {
    // Projdi dny měsíce a hledej shodu weekday
    for (let d = from; d <= to; d = addDays(d, 1)) {
      if (d.getUTCDay() === slot.weekday) {
        const startUTC = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, slot.startMin, 0));
        // přidej jen pokud neexistuje
        const exists = await prisma.lesson.findFirst({ where: { slotId: slot.id, date: startUTC } });
        if (!exists) {
          await prisma.lesson.create({ data: { slotId: slot.id, date: startUTC } });
        }
      }
    }
  }
}