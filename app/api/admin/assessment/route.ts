import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const steps = await prisma.assessmentStep.findMany({
      orderBy: { order: 'asc' },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });
    return NextResponse.json(steps);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assessment steps' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, internalNote, order, isActive } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const step = await prisma.assessmentStep.create({
      data: {
        question,
        internalNote,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(step, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create assessment step' }, { status: 500 });
  }
}
