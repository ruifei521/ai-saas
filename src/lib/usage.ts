import { prisma } from "@/lib/prisma";

export const FREE_DAILY_LIMIT = 3;

export async function checkAndIncrementUsage(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  // Pro users get unlimited
  if (subscription?.isPro) {
    return { allowed: true, remaining: Infinity };
  }

  // Check today's usage
  const usage = await prisma.usage.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  const used = usage?.count ?? 0;

  if (used >= FREE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  // Increment usage
  await prisma.usage.upsert({
    where: { userId_date: { userId, date: today } },
    update: { count: { increment: 1 } },
    create: { userId, date: today, count: 1 },
  });

  return { allowed: true, remaining: FREE_DAILY_LIMIT - used - 1 };
}

export async function getUsageInfo(userId: string): Promise<{
  used: number;
  remaining: number;
  isPro: boolean;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (subscription?.isPro) {
    return { used: 0, remaining: Infinity, isPro: true };
  }

  const usage = await prisma.usage.findUnique({
    where: {
      userId_date: { userId, date: today },
    },
  });

  const used = usage?.count ?? 0;
  return {
    used,
    remaining: Math.max(0, FREE_DAILY_LIMIT - used),
    isPro: false,
  };
}
