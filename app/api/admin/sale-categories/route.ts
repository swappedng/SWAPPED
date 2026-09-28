import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { key, label, description, order = 0, isActive = true } = await request.json();
    if (!key || !label) return NextResponse.json({ error: 'Key and label are required' }, { status: 400 });
    return NextResponse.json(await prisma.phoneSaleCategory.create({ data: { key, label, description, order, isActive } }), { status: 201 });
  } catch (error) { console.error('Failed to create category:', error); return NextResponse.json({ error: 'Failed to create category' }, { status: 500 }); }
}
