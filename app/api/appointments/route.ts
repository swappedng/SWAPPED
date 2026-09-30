import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { swapId, appointmentType, date, time } = data;

    if (!swapId || !appointmentType || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        swapId,
        appointmentType,
        date: new Date(date),
        time,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const swapId = searchParams.get('swapId');

  if (!swapId) {
    return NextResponse.json({ error: 'Swap ID is required' }, { status: 400 });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { swapId },
    });
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
