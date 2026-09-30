import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET option by group key and option value
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupKey: string; optionValue: string }> }
) {
  try {
    const { groupKey, optionValue } = await params;

    // First find the group by key
    const group = await prisma.conditionAttributeGroup.findUnique({
      where: { key: groupKey }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Then find the option by value within that group
    const option = await prisma.conditionAttributeOption.findFirst({
      where: {
        groupId: group.id,
        value: optionValue
      },
      include: {
        group: true
      }
    });

    if (!option) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 });
    }

    return NextResponse.json(option);
  } catch (error) {
    console.error('Failed to fetch option:', error);
    return NextResponse.json({ error: 'Failed to fetch option' }, { status: 500 });
  }
}

// UPDATE option by group key and option value
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupKey: string; optionValue: string }> }
) {
  try {
    const { groupKey, optionValue } = await params;
    const body = await request.json();

    // First find the group by key
    const group = await prisma.conditionAttributeGroup.findUnique({
      where: { key: groupKey }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Then find the option by value within that group
    const existingOption = await prisma.conditionAttributeOption.findFirst({
      where: {
        groupId: group.id,
        value: optionValue
      }
    });

    if (!existingOption) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 });
    }

    // Update the option
    const { value, label, description, priceModifier, order, isActive } = body;
    const updatedOption = await prisma.conditionAttributeOption.update({
      where: { id: existingOption.id },
      data: { value, label, description, priceModifier, order, isActive },
      include: { group: true }
    });

    return NextResponse.json(updatedOption);
  } catch (error) {
    console.error('Failed to update option:', error);
    return NextResponse.json({ error: 'Failed to update option' }, { status: 500 });
  }
}

// DELETE option by group key and option value
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupKey: string; optionValue: string }> }
) {
  try {
    const { groupKey, optionValue } = await params;

    // First find the group by key
    const group = await prisma.conditionAttributeGroup.findUnique({
      where: { key: groupKey }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Then find the option by value within that group
    const existingOption = await prisma.conditionAttributeOption.findFirst({
      where: {
        groupId: group.id,
        value: optionValue
      }
    });

    if (!existingOption) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 });
    }

    // Delete the option
    await prisma.conditionAttributeOption.delete({
      where: { id: existingOption.id }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete option:', error);
    return NextResponse.json({ error: 'Failed to delete option' }, { status: 500 });
  }
}