import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyCoachSession } from '@/lib/auth-utils';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('coach_session')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const session = await verifyCoachSession(token);

  if (!session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  return NextResponse.json(session);
}
