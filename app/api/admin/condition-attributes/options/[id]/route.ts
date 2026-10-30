import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const option = await prisma.conditionAttributeOption.findUnique({
      where: { id },
      include: { group: true },
    });

    if (!option) {
      return NextResponse.json({ error: 'Attribute option not found' }, { status: 404 });
    }

    return NextResponse.json(option);
  } catch (error) {
    console.error('Failed to fetch option:', error);
    return NextResponse.json({ error: 'Failed to fetch option' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { id } = await params;
    const { label, description, priceModifier, order, isActive } = body;

    const updated = await prisma.conditionAttributeOption.update({
      where: { id },
      data: { label, description, priceModifier, order, isActive },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update option:', error);
    return NextResponse.json({ error: 'Failed to update option' }, { status: 500 });
  }
}

// Alias PATCH to PUT for compatibility
export const PATCH = PUT;

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.conditionAttributeOption.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete option:', error);
    return NextResponse.json({ error: 'Failed to delete option' }, { status: 500 });
  }
}
