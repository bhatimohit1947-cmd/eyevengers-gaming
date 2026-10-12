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
    const cleaned = mobile.replace(/[\s\-()]/g, '');
    const digits10 = cleaned.replace(/\D/g, '').slice(-10);
    const variants = Array.from(new Set([
      mobile,
      cleaned,
      `+91${digits10}`,
      digits10,
      `91${digits10}`,
      `0${digits10}`,
    ])).filter(Boolean);

    const { data, error } = await client
      .from('profiles')
      .select('*')
      .in('mobile', variants)
      .limit(1);

    if (error || !data || data.length === 0) return null;

    const row = data[0];
    return {
      id: row.id,
      mobile: row.mobile,
      fullName: row.full_name,
      passwordHash: row.password_hash,
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
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
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let clean = val;
  if (clean.startsWith('cmp-') && uuidRegex.test(clean.replace('cmp-', ''))) {
    return clean.replace('cmp-', '');
  }
  if (
    clean.startsWith('usr-') ||
    clean.startsWith('adm-') ||
    clean.startsWith('stf-') ||
    clean.startsWith('vch-') ||
    clean.startsWith('gpl-')
  ) {
    clean = clean.replace(/^(usr-|adm-|stf-|vch-|gpl-)/, '');
  }
  if (uuidRegex.test(clean)) return clean;
  if (REWARD_MAP[val]) return REWARD_MAP[val];
  if (val === 'cmp-festive-navratri-2026' || val.startsWith('cmp-')) return DEFAULT_CLOUD_CAMPAIGN_ID;

  // Deterministic MD5 hash formatted as standard UUIDv4 (the same input ALWAYS produces the same UUID)
  const hash = crypto.createHash('md5').update(val).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

export async function getCloudUserIdByMobileOrId(userId: string, mobile?: string): Promise<string> {
  const client = getSupabase();
  if (!client) return toCloudUUID(userId);

  // If mobile is available, look up the permanent Supabase profile UUID
  if (mobile) {
    try {
      const { data } = await client.from('profiles').select('id').eq('mobile', mobile).maybeSingle();
      if (data?.id) return data.id;
    } catch {}
  }

  // If userId is already a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(userId)) return userId;

  return toCloudUUID(userId);
}

export async function saveVoucherToCloud(voucher: {
  id: string;
  userId: string;
  userMobile?: string;
  campaignId: string;
  rewardId: string;
  voucherCode: string;
  qrToken: string;
  status: string;
  expiryDate: string;
  createdAt: string;
}) {
  const client = getSupabase();
  if (!client) return;

  try {
    const vchId = toCloudUUID(voucher.id);
    const userId = await getCloudUserIdByMobileOrId(voucher.userId, voucher.userMobile);
    const campaignId = toCloudUUID(voucher.campaignId);
    const rewardId = REWARD_MAP[voucher.rewardId] || toCloudUUID(voucher.rewardId);

    // Note: 'vouchers' table in Supabase does NOT have 'updated_at', it uses issue_date and created_at
    const { error } = await client.from('vouchers').upsert(
      {
        id: vchId,
        user_id: userId,
        campaign_id: campaignId,
        reward_id: rewardId,
        voucher_code: voucher.voucherCode,
        qr_token: voucher.qrToken,
        status: voucher.status || 'issued',
        issue_date: voucher.createdAt || new Date().toISOString(),
        expiry_date: voucher.expiryDate,
        created_at: voucher.createdAt || new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.error('[Supabase] Cloud voucher sync error:', error.message);
    } else {
      console.log(`[Supabase] Successfully saved voucher ${voucher.voucherCode} for user ${userId}`);
    }
  } catch (err) {
    console.warn('Cloud voucher sync warning:', err);
  }
}

export async function saveGamePlayToCloud(gamePlay: {
  id: string;
  userId: string;
  userMobile?: string;
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
    const userId = await getCloudUserIdByMobileOrId(gamePlay.userId, gamePlay.userMobile);
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
    } else {
      console.log(`[Supabase] Recorded ${gamePlay.gameType} for user ${userId}`);
    }
  } catch (err) {
    console.warn('Cloud game play sync warning:', err);
  }
}

export async function getCloudUserPlaysCount(userId: string, gameType: string, userMobile?: string): Promise<number> {
  const client = getSupabase();
  if (!client) return 0;

  try {
    const uid = await getCloudUserIdByMobileOrId(userId, userMobile);
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

export async function getCloudUserVouchers(userId: string, userMobile?: string): Promise<any[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    const uid = await getCloudUserIdByMobileOrId(userId, userMobile);
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
        issueDate: v.issue_date || v.created_at,
        expiryDate: v.expiry_date,
        status: v.status,
        qrToken: v.qr_token,
        redeemedAt: v.redeemed_at,
        redeemedByStaffId: v.redeemed_by_staff_id,
        billReference: v.bill_reference,
        purchaseAmountPaise: v.purchase_amount_paise,
        createdAt: v.created_at,
        rewardName: reward?.name || 'Festive Reward',
        rewardType: reward?.reward_type || 'fixed_discount',
        rewardValueDisplay,
        minPurchasePaise: reward?.min_purchase_paise || 0,
        terms: reward?.terms || '',
        customerName: 'Valued Customer',
        customerMobile: userMobile || '',
      };
    });
  } catch {
    return [];
  }
}

export async function getAllCloudVouchers(): Promise<any[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('vouchers')
      .select('*, customer:profiles!user_id(id, full_name, mobile), rewards(*)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Fetch all cloud vouchers error:', error?.message);
      return [];
    }

    return data.map(v => {
      const reward = v.rewards;
      const customer = v.customer;
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
        issueDate: v.issue_date || v.created_at,
        expiryDate: v.expiry_date,
        status: v.status,
        qrToken: v.qr_token,
        redeemedAt: v.redeemed_at,
        redeemedByStaffId: v.redeemed_by_staff_id,
        billReference: v.bill_reference,
        purchaseAmountPaise: v.purchase_amount_paise,
        createdAt: v.created_at,
        rewardName: reward?.name || 'Festive Reward',
        rewardType: reward?.reward_type || 'fixed_discount',
        rewardValueDisplay,
        minPurchasePaise: reward?.min_purchase_paise || 0,
        terms: reward?.terms || '',
        customerName: customer?.full_name || 'Valued Customer',
        customerMobile: customer?.mobile || '',
      };
    });
  } catch {
    return [];
  }
}

export async function getCloudVoucherByCodeOrToken(codeOrToken: string): Promise<any | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('vouchers')
      .select('*, customer:profiles!user_id(id, full_name, mobile), rewards(*)')
      .or(`voucher_code.eq.${codeOrToken},qr_token.eq.${codeOrToken}`)
      .maybeSingle();

    if (error || !data) return null;

    const reward = data.rewards;
    const customer = data.customer;
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
      id: data.id,
      voucherCode: data.voucher_code,
      userId: data.user_id,
      rewardId: REWARD_REVERSE_MAP[data.reward_id] || data.reward_id,
      campaignId: data.campaign_id,
      issueDate: data.issue_date || data.created_at,
      expiryDate: data.expiry_date,
      status: data.status,
      qrToken: data.qr_token,
      redeemedAt: data.redeemed_at,
      redeemedByStaffId: data.redeemed_by_staff_id,
      billReference: data.bill_reference,
      purchaseAmountPaise: data.purchase_amount_paise,
      createdAt: data.created_at,
      rewardName: reward?.name || 'Festive Reward',
      rewardType: reward?.reward_type || 'fixed_discount',
      rewardValueDisplay,
      minPurchasePaise: reward?.min_purchase_paise || 0,
      terms: reward?.terms || '',
      customerName: customer?.full_name || 'Valued Customer',
      customerMobile: customer?.mobile || '',
    };
  } catch {
    return null;
  }
}

export async function redeemCloudVoucher(
  voucherId: string,
  staffId: string,
  billReference?: string,
  purchaseAmountPaise?: number
) {
  const client = getSupabase();
  if (!client) return;

  try {
    const vchId = toCloudUUID(voucherId);
    const stfId = toCloudUUID(staffId);
    const now = new Date().toISOString();

    await client
      .from('vouchers')
      .update({
        status: 'redeemed',
        redeemed_at: now,
        redeemed_by_staff_id: stfId,
        bill_reference: billReference || null,
        purchase_amount_paise: purchaseAmountPaise || null,
      })
      .eq('id', vchId);

    // Also record in redemptions table
    await client.from('redemptions').insert({
      id: crypto.randomUUID(),
      voucher_id: vchId,
      staff_id: stfId,
      bill_reference: billReference || null,
      purchase_amount_paise: purchaseAmountPaise || 0,
      discount_applied_paise: 0,
      redeemed_at: now,
    });
  } catch (err) {
    console.warn('Cloud voucher redemption sync error:', err);
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
      } catch (innerErr) {
        // Continue with other profiles
      }
    }
  } catch (err) {
    console.warn('Sync profiles from cloud error:', err);
  }
}

export async function getCloudBanners(onlyActive = true): Promise<any[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    let query = client.from('banners').select('*').order('display_order', { ascending: true });
    if (onlyActive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(b => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      imageUrl: b.image_url,
      ctaText: b.cta_text,
      ctaLink: b.cta_link,
      displayOrder: b.display_order,
      isActive: !!b.is_active,
      startDate: b.start_date,
      endDate: b.end_date,
      theme: b.theme,
      createdAt: b.created_at,
    }));
  } catch {
    return [];
  }
}

export async function updateCloudBanner(id: string, updates: Partial<any>) {
  const client = getSupabase();
  if (!client) return;

  try {
    const patch: any = {};
    if (updates.isActive !== undefined) patch.is_active = updates.isActive;
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.subtitle !== undefined) patch.subtitle = updates.subtitle;
    if (updates.imageUrl !== undefined) patch.image_url = updates.imageUrl;
    if (updates.ctaText !== undefined) patch.cta_text = updates.ctaText;
    if (updates.ctaLink !== undefined) patch.cta_link = updates.ctaLink;

    let targetId = id;
    if (id === 'ban-001') targetId = '22222222-2222-2222-2222-000000000001';
    else if (id === 'ban-002') targetId = '22222222-2222-2222-2222-000000000002';
    else if (id === 'ban-003') targetId = '22222222-2222-2222-2222-000000000003';

    await client.from('banners').update(patch).eq('id', targetId);
    if (updates.displayOrder) {
      await client.from('banners').update(patch).eq('display_order', updates.displayOrder);
    }
  } catch (err) {
    console.warn('Update cloud banner error:', err);
  }
}

export async function toggleAllCloudBanners(isActive: boolean) {
  const client = getSupabase();
  if (!client) return;

  try {
    await client.from('banners').update({ is_active: isActive }).not('id', 'is', null);
  } catch (err) {
    console.warn('Toggle all cloud banners error:', err);
  }
}

function mapCloudReward(r: any) {
  return {
    id: r.id,
    campaignId: r.campaign_id,
    name: r.name,
    description: r.description || '',
    rewardType: r.reward_type,
    monetaryValuePaise: Number(r.monetary_value_paise || 0),
    discountPercentage: Number(r.discount_percentage || 0),
    minPurchasePaise: Number(r.min_purchase_paise || 0),
    maxDiscountPaise: Number(r.max_discount_paise || 0),
    totalInventory: Number(r.total_inventory || 0),
    reservedInventory: Number(r.reserved_inventory || 0),
    issuedCount: Number(r.issued_count || 0),
    redeemedCount: Number(r.redeemed_count || 0),
    probabilityPercent: Number(r.probability_percent || 0),
    isActive: !!r.is_active,
    applicableGame: r.applicable_game,
    terms: r.terms || '',
    color: r.color || '#E8C477',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getCloudRewards(campaignId?: string): Promise<any[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    let query = client.from('rewards').select('*').order('created_at', { ascending: true });
    // Only filter by campaignId if it's a UUID and not the local 'cmp-' slug
    if (campaignId && !campaignId.startsWith('cmp-')) {
      const specific = await client
        .from('rewards')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });
      if (specific.data && specific.data.length > 0) {
        return specific.data.map(mapCloudReward);
      }
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(mapCloudReward);
  } catch {
    return [];
  }
}

export async function syncCloudRewardsToLocalDb(database: any) {
  const client = getSupabase();
  if (!client || !database) return;

  try {
    const { data, error } = await client.from('rewards').select('*');
    if (error || !data || data.length === 0) return;

    // Purge outdated seeded placeholder rewards so they NEVER override live configured odds
    try {
      database.exec("DELETE FROM rewards WHERE id LIKE 'rew-%';");
    } catch {}

    const stmt = database.prepare(`
      INSERT OR REPLACE INTO rewards (
        id, campaign_id, name, description, reward_type, monetary_value_paise,
        discount_percentage, min_purchase_paise, max_discount_paise, total_inventory,
        reserved_inventory, issued_count, redeemed_count, probability_percent, is_active,
        applicable_game, terms, color, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const r of data) {
      // 1. Insert with original Supabase campaign ID
      stmt.run(
        r.id,
        r.campaign_id,
        r.name,
        r.description || '',
        r.reward_type,
        Number(r.monetary_value_paise || 0),
        Number(r.discount_percentage || 0),
        Number(r.min_purchase_paise || 0),
        Number(r.max_discount_paise || 0),
        Number(r.total_inventory || 0),
        Number(r.reserved_inventory || 0),
        Number(r.issued_count || 0),
        Number(r.redeemed_count || 0),
        Number(r.probability_percent || 0),
        r.is_active ? 1 : 0,
        r.applicable_game,
        r.terms || '',
        r.color || '#E8C477',
        r.created_at,
        r.updated_at
      );

      // 2. Also map to local campaign 'cmp-festive-navratri-2026' so queries by local campaign ID find the live cloud rewards
      if (r.campaign_id !== 'cmp-festive-navratri-2026') {
        stmt.run(
          `cmp-${r.id}`,
          'cmp-festive-navratri-2026',
          r.name,
          r.description || '',
          r.reward_type,
          Number(r.monetary_value_paise || 0),
          Number(r.discount_percentage || 0),
          Number(r.min_purchase_paise || 0),
          Number(r.max_discount_paise || 0),
          Number(r.total_inventory || 0),
          Number(r.reserved_inventory || 0),
          Number(r.issued_count || 0),
          Number(r.redeemed_count || 0),
          Number(r.probability_percent || 0),
          r.is_active ? 1 : 0,
          r.applicable_game,
          r.terms || '',
          r.color || '#E8C477',
          r.created_at,
          r.updated_at
        );
      }
    }
  } catch (err) {
    console.warn('Sync cloud rewards to local db error:', err);
  }
}

export async function updateCloudReward(id: string, updates: Partial<any>) {
  const client = getSupabase();
  if (!client) return;

  try {
    const REWARD_ID_MAP: Record<string, string> = {
      'rew-001': '33333333-3333-3333-3333-000000000001',
      'rew-002': '33333333-3333-3333-3333-000000000002',
      'rew-003': '33333333-3333-3333-3333-000000000003',
      'rew-004': '33333333-3333-3333-3333-000000000004',
      'rew-005': '33333333-3333-3333-3333-000000000005',
      'rew-006': '33333333-3333-3333-3333-000000000006',
      'rew-007': '33333333-3333-3333-3333-000000000007',
      'rew-008': '33333333-3333-3333-3333-000000000008',
    };

    let targetId = REWARD_ID_MAP[id] || id;
    if (typeof targetId === 'string' && targetId.startsWith('cmp-')) {
      targetId = targetId.replace(/^cmp-/, '');
    }

    const patch: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.rewardType !== undefined) patch.reward_type = updates.rewardType;
    if (updates.monetaryValuePaise !== undefined) patch.monetary_value_paise = updates.monetaryValuePaise;
    if (updates.discountPercentage !== undefined) patch.discount_percentage = updates.discountPercentage;
    if (updates.minPurchasePaise !== undefined) patch.min_purchase_paise = updates.minPurchasePaise;
    if (updates.maxDiscountPaise !== undefined) patch.max_discount_paise = updates.maxDiscountPaise;
    if (updates.totalInventory !== undefined) patch.total_inventory = updates.totalInventory;
    if (updates.probabilityPercent !== undefined) patch.probability_percent = updates.probabilityPercent;
    if (updates.isActive !== undefined) patch.is_active = updates.isActive;
    if (updates.applicableGame !== undefined) patch.applicable_game = updates.applicableGame;
    if (updates.terms !== undefined) patch.terms = updates.terms;
    if (updates.color !== undefined) patch.color = updates.color;

    await client.from('rewards').update(patch).eq('id', targetId);
  } catch (err) {
    console.warn('Update cloud reward error:', err);
  }
}

export async function saveRewardToCloud(reward: any) {
  const client = getSupabase();
  if (!client) return;

  try {
    let cleanId = reward.id;
    if (cleanId.startsWith('rew-')) {
      cleanId = cleanId.replace(/^rew-/, '');
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cleanId)) {
      cleanId = crypto.randomUUID();
    }

    await client.from('rewards').upsert({
      id: cleanId,
      campaign_id: reward.campaignId || '11111111-1111-1111-1111-111111111111',
      name: reward.name,
      description: reward.description || '',
      reward_type: reward.rewardType,
      monetary_value_paise: reward.monetaryValuePaise,
      discount_percentage: reward.discountPercentage,
      min_purchase_paise: reward.minPurchasePaise,
      max_discount_paise: reward.maxDiscountPaise,
      total_inventory: reward.totalInventory,
      probability_percent: reward.probabilityPercent,
      is_active: reward.isActive,
      applicable_game: reward.applicableGame,
      terms: reward.terms,
      color: reward.color,
      created_at: reward.createdAt || new Date().toISOString(),
      updated_at: reward.updatedAt || new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Save reward to cloud error:', err);
  }
}

export async function getCyclePlayCounts(batchSize = 100): Promise<{
  totalPlays: number;
  currentCycleCount: number;
  cycleIssued: Record<string, number>;
}> {
  const client = getSupabase();
  const normalize = (id: string) => {
    if (!id) return '';
    const clean = id.replace(/^cmp-/, '');
    const REWARD_MAP: Record<string, string> = {
      'rew-001': '33333333-3333-3333-3333-000000000001',
      'rew-002': '33333333-3333-3333-3333-000000000002',
      'rew-003': '33333333-3333-3333-3333-000000000003',
      'rew-004': '33333333-3333-3333-3333-000000000004',
      'rew-005': '33333333-3333-3333-3333-000000000005',
      'rew-006': '33333333-3333-3333-3333-000000000006',
      'rew-007': '33333333-3333-3333-3333-000000000007',
      'rew-008': '33333333-3333-3333-3333-000000000008',
    };
    return REWARD_MAP[clean] || clean;
  };

  const cycleIssued: Record<string, number> = {};

  if (client) {
    try {
      const { count, error } = await client
        .from('game_plays')
        .select('*', { count: 'exact', head: true });

      if (!error && typeof count === 'number') {
        const totalPlays = count;
        const currentCycleCount = totalPlays % batchSize;

        if (currentCycleCount > 0) {
          const { data } = await client
            .from('game_plays')
            .select('reward_id')
            .order('played_at', { ascending: false })
            .limit(currentCycleCount);

          if (data) {
            for (const row of data) {
              const normId = normalize(row.reward_id);
              cycleIssued[normId] = (cycleIssued[normId] || 0) + 1;
            }
          }
        }
        return { totalPlays, currentCycleCount, cycleIssued };
      }
    } catch (e) {
      console.warn('Cloud cycle play count error:', e);
    }
  }

  // Fallback to SQLite
  try {
    const { db } = await import('./index');
    const database = db.getRawDb();
    const countRow = database.prepare('SELECT COUNT(*) as c FROM game_plays').get() as { c: number };
    const totalPlays = countRow?.c || 0;
    const currentCycleCount = totalPlays % batchSize;
    if (currentCycleCount > 0) {
      const rows = database
        .prepare('SELECT reward_id FROM game_plays ORDER BY played_at DESC LIMIT ?')
        .all(currentCycleCount) as { reward_id: string }[];
      for (const row of rows) {
        const normId = normalize(row.reward_id);
        cycleIssued[normId] = (cycleIssued[normId] || 0) + 1;
      }
    }
    return { totalPlays, currentCycleCount, cycleIssued };
  } catch {
    return { totalPlays: 0, currentCycleCount: 0, cycleIssued: {} };
  }
}


