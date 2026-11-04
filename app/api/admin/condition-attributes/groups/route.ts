import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET: list all groups with active options in UI-friendly shape
export async function GET() {
  try {
    const groups = await prisma.conditionAttributeGroup.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        options: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    const result = groups.map(g => ({
      id: g.id,
      key: g.key,
      label: g.label,
      description: g.description ?? undefined,
      options: g.options.map(o => ({
        id: o.id,
        groupId: o.groupId,
        label: o.label,
        description: o.description ?? undefined,
        imagePath: o.imagePath ?? undefined,
        isActive: o.isActive,
        order: o.order,
      })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch condition attribute groups:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

// POST: create a new attribute group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, label, description, order = 0, isActive = true } = body;

    if (!key || !label) {
      return NextResponse.json({ error: 'key and label are required' }, { status: 400 });
    }

    const group = await prisma.conditionAttributeGroup.create({
      data: { key, label, description, order, isActive },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Failed to create group:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
