import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-revalidate-token');
  if (!process.env.REVALIDATE_SECRET || token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  revalidatePath('/tradein');
  return NextResponse.json({ ok: true, revalidated: '/tradein' });
}
