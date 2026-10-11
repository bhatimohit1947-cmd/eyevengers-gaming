import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { UserProfile } from '../types';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false },
    });
    return supabaseClient;
  } catch (err) {
    console.warn('Supabase client initialization skipped:', err);
    return null;
  }
}

export async function saveProfileToCloud(profile: {
  id: string;
  mobile: string;
  fullName: string;
  passwordHash: string;
  role?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}) {
  const client = getSupabase();
  if (!client) {
    console.warn('[Supabase] Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured.');
    return;
  }

  try {
    let cleanId = profile.id;
    if (cleanId.startsWith('usr-') || cleanId.startsWith('adm-') || cleanId.startsWith('stf-')) {
      cleanId = cleanId.replace(/^(usr-|adm-|stf-)/, '');
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cleanId)) {
      cleanId = crypto.randomUUID();
    }

    const { error } = await client.from('profiles').upsert(
      {
        id: cleanId,
        mobile: profile.mobile,
        full_name: profile.fullName,
        password_hash: profile.passwordHash,
        role: profile.role || 'customer',
        status: profile.status || 'active',
        created_at: profile.createdAt || new Date().toISOString(),
        updated_at: profile.updatedAt || new Date().toISOString(),
      },
      { onConflict: 'mobile' }
    );
    if (error) {
      console.error('[Supabase] Cloud profile upsert failed:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Cloud profile sync warning:', err);
  }
}

export async function getProfileFromCloudByMobile(mobile: string): Promise<(UserProfile & { passwordHash: string }) | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('mobile', mobile)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      mobile: data.mobile,
      fullName: data.full_name,
      passwordHash: data.password_hash,
      role: data.role,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.warn('Fetch cloud profile warning:', err);
    return null;
  }
}

export async function getProfileFromCloudById(id: string): Promise<(UserProfile & { passwordHash: string }) | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      mobile: data.mobile,
      fullName: data.full_name,
      passwordHash: data.password_hash,
      role: data.role,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.warn('Fetch cloud profile by ID warning:', err);
    return null;
  }
}

export async function updateProfilePasswordInCloud(id: string, passwordHash: string) {
  const client = getSupabase();
  if (!client) return;

  try {
    await client
      .from('profiles')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  } catch (err) {
    console.warn('Cloud password update warning:', err);
  }
}

export async function saveVoucherToCloud(voucher: {
  id: string;
  userId: string;
  campaignId: string;
  rewardId: string;
  voucherCode: string;
  qrToken: string;
  status: string;
  expiryDate: string;
  createdAt: string;
  updatedAt?: string;
}) {
  const client = getSupabase();
  if (!client) return;

  try {
    await client.from('vouchers').upsert(
      {
        id: voucher.id,
        user_id: voucher.userId,
        campaign_id: voucher.campaignId,
        reward_id: voucher.rewardId,
        voucher_code: voucher.voucherCode,
        qr_token: voucher.qrToken,
        status: voucher.status,
        expiry_date: voucher.expiryDate,
        created_at: voucher.createdAt,
        updated_at: voucher.updatedAt,
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.warn('Cloud voucher sync warning:', err);
  }
}

export async function saveGamePlayToCloud(gamePlay: {
  id: string;
  userId: string;
  campaignId: string;
  gameType: string;
  rewardId: string;
  metadata?: Record<string, unknown>;
  playedAt: string;
}) {
  const client = getSupabase();
  if (!client) return;

  try {
    await client.from('game_plays').upsert(
      {
        id: gamePlay.id,
        user_id: gamePlay.userId,
        campaign_id: gamePlay.campaignId,
        game_type: gamePlay.gameType,
        reward_id: gamePlay.rewardId,
        metadata: gamePlay.metadata || {},
        played_at: gamePlay.playedAt,
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.warn('Cloud game play sync warning:', err);
  }
}

export async function syncCloudProfilesToLocalDb(database: any) {
  const client = getSupabase();
  if (!client) return;

  try {
    const { data, error } = await client.from('profiles').select('*');
    if (error || !data || data.length === 0) return;

    const delStmt = database.prepare('DELETE FROM profiles WHERE mobile = ? AND id != ?');
    const stmt = database.prepare(`
      INSERT OR REPLACE INTO profiles (id, mobile, full_name, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of data) {
      try {
        delStmt.run(p.mobile, p.id);
        stmt.run(
          p.id,
          p.mobile,
          p.full_name,
          p.password_hash,
          p.role || 'customer',
          p.status || 'active',
          p.created_at,
          p.updated_at
        );
      } catch {}
    }
  } catch (err) {
    console.warn('Sync profiles from cloud error:', err);
  }
}
