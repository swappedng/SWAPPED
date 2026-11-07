import { PrismaClient } from '@/app/generated/prisma';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  (global.prisma && 'modelConditionModifier' in global.prisma ? global.prisma : undefined) ||
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
