import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// POST: create a new option in a group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, label, description, order = 0, isActive = true } = body;

    if (!groupId || !label) {
      return NextResponse.json({ error: 'groupId and label are required' }, { status: 400 });
    }

    const option = await prisma.conditionAttributeOption.create({
      data: { groupId, label, description, order, isActive },
    });

    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    console.error('Failed to create option:', error);
    return NextResponse.json({ error: 'Failed to create option' }, { status: 500 });
  }
}

// GET: list all options (optional utility)
export async function GET() {
  try {
    const options = await prisma.conditionAttributeOption.findMany({
      where: { isActive: true },
      orderBy: [{ groupId: 'asc' }, { order: 'asc' }],
    });
    return NextResponse.json(options);
  } catch (error) {
    console.error('Failed to fetch options:', error);
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
  }
}
