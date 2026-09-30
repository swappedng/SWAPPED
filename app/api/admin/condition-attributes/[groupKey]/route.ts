import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET group by key
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupKey: string }> }
) {
  try {
    const { groupKey } = await params;

    const group = await prisma.conditionAttributeGroup.findUnique({
      where: { key: groupKey },
      include: {
        options: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Failed to fetch group:', error);
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
  }
}

// UPDATE group by key
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupKey: string }> }
) {
  try {
    const { groupKey } = await params;
    const body = await request.json();

    const existingGroup = await prisma.conditionAttributeGroup.findUnique({
      where: { key: groupKey }
    });

    if (!existingGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const { key, label, description, order, isActive } = body;
    const updatedGroup = await prisma.conditionAttributeGroup.update({
      where: { id: existingGroup.id },
      data: { key, label, description, order, isActive },
      include: { options: true }
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('Failed to update group:', error);
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
  }
}

// DELETE group by key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupKey: string }> }
) {
  try {
    const { groupKey } = await params;

    const existingGroup = await prisma.conditionAttributeGroup.findUnique({
      where: { key: groupKey }
    });

    if (!existingGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    await prisma.conditionAttributeGroup.delete({
      where: { id: existingGroup.id }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete group:', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}