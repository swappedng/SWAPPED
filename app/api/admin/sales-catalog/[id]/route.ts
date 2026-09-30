import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await prisma.phoneSellingPrice.update({ where: { id }, data: await request.json() }));
  } catch (error) { console.error('Failed to update selling price:', error); return NextResponse.json({ error: 'Failed to update selling price' }, { status: 500 }); }
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; await prisma.phoneSellingPrice.delete({ where: { id } }); return NextResponse.json({ ok: true }); }
  catch (error) { console.error('Failed to delete selling price:', error); return NextResponse.json({ error: 'Failed to delete selling price' }, { status: 500 }); }
}
