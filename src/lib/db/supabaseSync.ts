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

const DEFAULT_CLOUD_CAMPAIGN_ID = '11111111-1111-1111-1111-111111111111';

// 1-to-1 Mapping between local reward IDs and Supabase Cloud UUIDs
const REWARD_MAP: Record<string, string> = {
  'rew-001': '33333333-3333-3333-3333-000000000001',
  'rew-002': '33333333-3333-3333-3333-000000000002',
  'rew-003': '33333333-3333-3333-3333-000000000003',
  'rew-004': '33333333-3333-3333-3333-000000000004',
  'rew-005': '33333333-3333-3333-3333-000000000005',
  'rew-006': '33333333-3333-3333-3333-000000000006',
};

const REWARD_REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(REWARD_MAP).map(([k, v]) => [v, k])
);

export function toCloudUUID(val?: string): string {
  if (!val) return crypto.randomUUID();
  let clean = val;
  if (
    clean.startsWith('usr-') ||
    clean.startsWith('adm-') ||
    clean.startsWith('stf-') ||
    clean.startsWith('vch-') ||
    clean.startsWith('gpl-')
  ) {
    clean = clean.replace(/^(usr-|adm-|stf-|vch-|gpl-)/, '');
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(clean)) return clean;
  if (REWARD_MAP[val]) return REWARD_MAP[val];
  if (val.startsWith('cmp-')) return DEFAULT_CLOUD_CAMPAIGN_ID;
  return crypto.randomUUID();
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
    const vchId = toCloudUUID(voucher.id);
    const userId = toCloudUUID(voucher.userId);
    const campaignId = toCloudUUID(voucher.campaignId);
    const rewardId = REWARD_MAP[voucher.rewardId] || toCloudUUID(voucher.rewardId);

    const { error } = await client.from('vouchers').upsert(
      {
        id: vchId,
        user_id: userId,
        campaign_id: campaignId,
        reward_id: rewardId,
        voucher_code: voucher.voucherCode,
        qr_token: voucher.qrToken,
        status: voucher.status,
        expiry_date: voucher.expiryDate,
        created_at: voucher.createdAt,
        updated_at: voucher.updatedAt || voucher.createdAt,
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.error('[Supabase] Cloud voucher sync error:', error.message);
    }
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
    const gplId = toCloudUUID(gamePlay.id);
    const userId = toCloudUUID(gamePlay.userId);
    const campaignId = toCloudUUID(gamePlay.campaignId);
    const rewardId = REWARD_MAP[gamePlay.rewardId] || toCloudUUID(gamePlay.rewardId);

    const { error } = await client.from('game_plays').upsert(
      {
        id: gplId,
        user_id: userId,
        campaign_id: campaignId,
        game_type: gamePlay.gameType,
        reward_id: rewardId,
        metadata: gamePlay.metadata || {},
        played_at: gamePlay.playedAt,
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.error('[Supabase] Cloud game play sync error:', error.message);
    }
  } catch (err) {
    console.warn('Cloud game play sync warning:', err);
  }
}

export async function getCloudUserPlaysCount(userId: string, gameType: string): Promise<number> {
  const client = getSupabase();
  if (!client) return 0;

  try {
    const uid = toCloudUUID(userId);
    const { count, error } = await client
      .from('game_plays')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', uid)
      .eq('game_type', gameType);

    if (error) {
      console.warn('Cloud user plays count warning:', error.message);
      return 0;
    }
    return count || 0;
  } catch {
    return 0;
  }
}

export async function getCloudUserVouchers(userId: string): Promise<any[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    const uid = toCloudUUID(userId);
    const { data, error } = await client
      .from('vouchers')
      .select('*, rewards(*)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(v => {
      const reward = v.rewards;
      const monetaryPaise = reward?.monetary_value_paise || 0;
      const discountPct = reward?.discount_percentage || 0;
      let rewardValueDisplay = '';
      if (monetaryPaise > 0) {
        rewardValueDisplay = `₹${(monetaryPaise / 100).toLocaleString('en-IN')}`;
      } else if (discountPct > 0) {
        rewardValueDisplay = `${discountPct}% OFF`;
      } else {
        rewardValueDisplay = reward?.name || 'Festive Reward';
      }

      return {
        id: v.id,
        voucherCode: v.voucher_code,
        userId: v.user_id,
        rewardId: REWARD_REVERSE_MAP[v.reward_id] || v.reward_id,
        campaignId: v.campaign_id,
        issueDate: v.created_at,
        expiryDate: v.expiry_date,
        status: v.status,
        qrToken: v.qr_token,
        redeemedAt: v.redeemed_at,
        redeemedByStaffId: v.redeemed_by_staff_id,
        createdAt: v.created_at,
        rewardName: reward?.name || 'Festive Reward',
        rewardType: reward?.reward_type || 'fixed_discount',
        rewardValueDisplay,
        minPurchasePaise: reward?.min_purchase_paise || 0,
        terms: reward?.terms || '',
        customerName: 'Valued Customer',
        customerMobile: '',
      };
    });
  } catch {
    return [];
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
