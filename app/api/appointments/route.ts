import { after, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { SwapMethod } from '@/lib/api/types/enums';
import {
  sendAppointmentConfirmationEmail,
  sendAdminAppointmentNotification,
} from '@/app/lib/email';

// Helper to convert Prisma enum to API enum
function toApiSwapMethod(prismaMethod: string): SwapMethod {
  return prismaMethod as SwapMethod;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { swapId, date, time, swapMethod } = data;

    if (!swapId || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch swap details for email notifications and to get swapMethod if not provided
    const swap = await prisma.swap.findUnique({
      where: { id: swapId },
      select: {
        id: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        swapMethod: true,
      },
    });

    if (!swap) {
      return NextResponse.json({ error: 'Swap not found' }, { status: 404 });
    }

    const existingAppointment = await prisma.appointment.findUnique({
      where: { swapId },
      select: { id: true },
    });

    const appointment = await prisma.appointment.upsert({
      where: { swapId },
      create: {
        swapId,
        swapMethod: swapMethod || swap.swapMethod,
        date: new Date(date),
        time,
      },
      update: {
        swapMethod: swapMethod || swap.swapMethod,
        date: new Date(date),
        time,
      },
    });

    if (!existingAppointment) {
      after(async () => {
        if (swap.contactEmail) {
          const result = await sendAppointmentConfirmationEmail({
            to: swap.contactEmail,
            appointmentDetails: {
              date,
              time,
              swapMethod: toApiSwapMethod(swapMethod || swap.swapMethod),
            },
          });
          if (!result.success) {
            console.error('Failed to send appointment confirmation email:', result.error);
          }
        }

        const result = await sendAdminAppointmentNotification({
          swap: {
            id: swap.id,
            contactName: swap.contactName,
            contactEmail: swap.contactEmail,
            contactPhone: swap.contactPhone,
          },
          appointment: {
            date,
            time,
            swapMethod: toApiSwapMethod(swapMethod || swap.swapMethod),
          },
        });
        if (!result.success) {
          console.error('Failed to send admin appointment notification:', result.error);
        }
      });
    }

    return NextResponse.json(appointment, {
      status: existingAppointment ? 200 : 201,
    });
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
