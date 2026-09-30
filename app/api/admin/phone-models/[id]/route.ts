import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const phoneModel = await prisma.phoneModel.findUnique({
      where: { id },
    });

    if (!phoneModel) {
      return NextResponse.json({ error: 'Phone model not found' }, { status: 404 });
    }

    return NextResponse.json(phoneModel);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch phone model' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const phoneModel = await prisma.phoneModel.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(phoneModel);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update phone model' }, { status: 500 });
  }
}

// Alias PATCH to PUT for compatibility
export const PATCH = PUT;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.phoneModel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete phone model' }, { status: 500 });
  }
}
