import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { syncCloudProfilesToLocalDb } from '@/lib/db/supabaseSync';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Sync cloud profiles to ensure newly registered customers across containers appear
  try {
    await syncCloudProfilesToLocalDb(db.getRawDb());
  } catch {}

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;

  const users = db.getAllUsers('customer', search);
  return NextResponse.json({ customers: users });
}
