import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const group = await prisma.conditionAttributeGroup.findUnique({
      where: { id },
      include: { options: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'Attribute group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Failed to fetch group:', error);
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { id } = await params;
    const { key, label, description, order, isActive } = body;

    const updated = await prisma.conditionAttributeGroup.update({
      where: { id },
      data: { key, label, description, order, isActive },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update group:', error);
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
  }
}

// Alias PATCH to PUT for compatibility
export const PATCH = PUT;

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.conditionAttributeGroup.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete group:', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}
