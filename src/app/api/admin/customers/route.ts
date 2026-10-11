import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getSupabase, syncCloudProfilesToLocalDb } from '@/lib/db/supabaseSync';
import { UserProfile } from '@/lib/types';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase().trim() || undefined;

  // Sync cloud profiles to local db
  try {
    await syncCloudProfilesToLocalDb(db.getRawDb());
  } catch {}

  // 1. Fetch from local SQLite
  const localUsers = db.getAllUsers('customer', search);

  // 2. Map keyed by mobile to deduplicate and guarantee all customers appear
  const mergedMap = new Map<string, UserProfile>();

  for (const u of localUsers) {
    mergedMap.set(u.mobile, u);
  }

  // 3. Directly query Supabase cloud to ensure multi-container & fresh customer registrations are never lost
  try {
    const client = getSupabase();
    if (client) {
      let query = client.from('profiles').select('*').eq('role', 'customer');
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,mobile.ilike.%${search}%`);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (data && !error) {
        for (const p of data) {
          mergedMap.set(p.mobile, {
            id: p.id,
            mobile: p.mobile,
            fullName: p.full_name,
            role: p.role,
            status: p.status,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Direct cloud customers fetch warning:', err);
  }

  const customers = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ customers });
}

