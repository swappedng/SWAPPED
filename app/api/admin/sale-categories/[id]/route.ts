import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try { return NextResponse.json(await prisma.phoneSaleCategory.update({ where: { id: params.id }, data: await request.json() })); }
  catch (error) { console.error('Failed to update category:', error); return NextResponse.json({ error: 'Failed to update category' }, { status: 500 }); }
}
