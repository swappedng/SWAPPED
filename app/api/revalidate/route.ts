import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { QUESTIONNAIRE_TAG } from '@/lib/api/endpoints/tradein.server';

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-revalidate-token');
  if (!process.env.REVALIDATE_SECRET || token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  revalidateTag(QUESTIONNAIRE_TAG);
  return NextResponse.json({ ok: true, revalidated: QUESTIONNAIRE_TAG });
}
