import { NextRequest, NextResponse } from 'next/server';
import { resolveAdmin } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const { isAdmin, email } = await resolveAdmin(req);
  return NextResponse.json({ isAdmin, email });
}
