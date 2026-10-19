import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import os from 'os';
import { 
  UserProfile, 
  Campaign, 
  Reward, 
  Banner, 
  Voucher, 
  RedemptionRecord, 
  AdminAuditLog,
  GamePlay
} from '../types';

let dbInstance: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  let dbPath = ':memory:';

  try {
    const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    let targetDir = path.join(process.cwd(), '.data');

    if (isServerless) {
      targetDir = path.join(os.tmpdir(), 'eyevengers-db');
    }

    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      dbPath = path.join(targetDir, 'eyevengers.db');
    } catch {
      // Fallback to /tmp directly or :memory:
      dbPath = path.join(os.tmpdir(), 'eyevengers.db');
    }
  } catch {
    dbPath = ':memory:';
  }

  try {
    dbInstance = new DatabaseSync(dbPath);
  } catch {
    dbInstance = new DatabaseSync(':memory:');
  }
  
  try {
    // Disable strict foreign keys for serverless multi-container stability, enable WAL mode & memory cache
    dbInstance.exec('PRAGMA foreign_keys = OFF;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA synchronous = NORMAL;');
    dbInstance.exec('PRAGMA temp_store = MEMORY;');
    dbInstance.exec('PRAGMA cache_size = -32000;');
  } catch {}

  initSchema(dbInstance);
  seedInitialData(dbInstance);

  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      mobile TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      theme TEXT NOT NULL DEFAULT 'navratri',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      spin_wheel_enabled INTEGER NOT NULL DEFAULT 1,
      mystery_boxes_enabled INTEGER NOT NULL DEFAULT 1,
      spin_limit_per_user INTEGER NOT NULL DEFAULT 1,
      box_limit_per_user INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      image_url TEXT NOT NULL,
      cta_text TEXT NOT NULL DEFAULT 'Play Now',
      cta_link TEXT NOT NULL DEFAULT '/#games',
      display_order INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      theme TEXT DEFAULT 'navratri',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      reward_type TEXT NOT NULL,
      monetary_value_paise INTEGER NOT NULL DEFAULT 0,
      discount_percentage REAL NOT NULL DEFAULT 0,
      min_purchase_paise INTEGER NOT NULL DEFAULT 0,
      max_discount_paise INTEGER NOT NULL DEFAULT 0,
      total_inventory INTEGER NOT NULL DEFAULT 100,
      reserved_inventory INTEGER NOT NULL DEFAULT 0,
      issued_count INTEGER NOT NULL DEFAULT 0,
      redeemed_count INTEGER NOT NULL DEFAULT 0,
      probability_percent REAL NOT NULL DEFAULT 0.0,
      is_active INTEGER NOT NULL DEFAULT 1,
      applicable_game TEXT NOT NULL DEFAULT 'both',
      terms TEXT NOT NULL,
      color TEXT DEFAULT '#E8C477',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS game_plays (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES profiles(id),
      campaign_id TEXT NOT NULL REFERENCES campaigns(id),
      game_type TEXT NOT NULL,
      reward_id TEXT NOT NULL REFERENCES rewards(id),
      metadata TEXT DEFAULT '{}',
      played_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vouchers (
      id TEXT PRIMARY KEY,
      voucher_code TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL REFERENCES profiles(id),
      reward_id TEXT NOT NULL REFERENCES rewards(id),
      campaign_id TEXT NOT NULL REFERENCES campaigns(id),
      game_play_id TEXT UNIQUE REFERENCES game_plays(id),
      issue_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'issued',
      qr_token TEXT NOT NULL UNIQUE,
      redeemed_at TEXT,
      redeemed_by_staff_id TEXT REFERENCES profiles(id),
      bill_reference TEXT,
      purchase_amount_paise INTEGER,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS redemptions (
      id TEXT PRIMARY KEY,
      voucher_id TEXT NOT NULL REFERENCES vouchers(id),
      voucher_code TEXT NOT NULL,
      staff_id TEXT NOT NULL REFERENCES profiles(id),
      bill_reference TEXT,
      purchase_amount_paise INTEGER,
      redeemed_at TEXT NOT NULL,
      showroom_location TEXT NOT NULL DEFAULT 'Bhadu Market Showroom, Jodhpur'
    );

    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_name TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details TEXT,
      timestamp TEXT NOT NULL
    );

    -- Fast Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_vouchers_user_id ON vouchers(user_id);
    CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
    CREATE INDEX IF NOT EXISTS idx_game_plays_user_camp ON game_plays(user_id, campaign_id, game_type);
    CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
    CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON profiles(mobile);
    CREATE INDEX IF NOT EXISTS idx_rewards_camp_act ON rewards(campaign_id, is_active);
  `);
}

function seedInitialData(db: DatabaseSync) {
  const profileCountStmt = db.prepare('SELECT COUNT(*) as count FROM profiles');
  const profileCount = (profileCountStmt.get() as { count: number }).count;

  if (profileCount > 0) return; // already seeded

  const now = new Date().toISOString();
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Seed Accounts (Precomputed static hash for Heyeyevengers saves 500ms CPU on cold starts)
  const adminHash = '$2b$10$dY4lu7Gv43F7zRnvcx/g4O1eWHPp4m9t.VjxdIv1sSqcd57DaxXCS';
  const staffHash = '$2b$10$dY4lu7Gv43F7zRnvcx/g4O1eWHPp4m9t.VjxdIv1sSqcd57DaxXCS';

  const admin1Id = 'adm-7240-158860';
  const admin2Id = 'adm-8824-187493';
  const staffId = 'stf-0000-0000-0002';

  const insertProfile = db.prepare(`
    INSERT INTO profiles (id, mobile, full_name, password_hash, role, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProfile.run(admin1Id, '+917240158860', 'Admin (7240158860)', adminHash, 'admin', 'active', now, now);
  insertProfile.run(admin2Id, '+918824187493', 'Admin (8824187493)', adminHash, 'admin', 'active', now, now);
  insertProfile.run(staffId, '+919876500002', 'Showroom Desk Staff', staffHash, 'staff', 'active', now, now);

  // 2. Seed Default Navratri Campaign
  const campaignId = 'cmp-festive-navratri-2026';
  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (id, slug, name, description, theme, start_date, end_date, is_active, spin_wheel_enabled, mystery_boxes_enabled, spin_limit_per_user, box_limit_per_user, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCampaign.run(
    campaignId,
    'festive-dhamaka-2026',
    'Navratri & Festive Optical Mahotsav 2026',
    'Play our festive games and win guaranteed vouchers, free eyewear upgrades, and complimentary comprehensive vision checkups at our Jodhpur showroom!',
    'navratri',
    now,
    futureDate,
    1,
    1,
    1,
    1,
    1,
    now,
    now
  );

  // 3. Seed Banners
  const insertBanner = db.prepare(`
    INSERT INTO banners (id, title, subtitle, image_url, cta_text, cta_link, display_order, is_active, start_date, end_date, theme, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBanner.run(
    'ban-001',
    'Celebrate Navratri with Grand Rewards',
    'Spin the Golden Wheel or open Mystery Boxes to unlock exclusive discounts at EYEVENGERS Jodhpur!',
    '/banners/navratri-spin.svg',
    'Explore Games',
    '#games',
    1,
    1,
    now,
    futureDate,
    'navratri',
    now
  );

  insertBanner.run(
    'ban-002',
    'Festive Vision Care: Free Eye Checkup Offer',
    'Get comprehensive digital eye examinations and expert lens consultations with our senior optometrists.',
    '/banners/eye-checkup.svg',
    'Win Voucher',
    '#games',
    2,
    1,
    now,
    futureDate,
    'navratri',
    now
  );

  insertBanner.run(
    'ban-003',
    'Special Showroom Discounts up to ₹200 Off',
    'Redeem instantly at our flagship Bhadu Market showroom. Valid on all premium frames and blue-cut lenses.',
    '/banners/discount-voucher.svg',
    'Claim Now',
    '#games',
    3,
    1,
    now,
    futureDate,
    'navratri',
    now
  );

  // 4. Seed Configured Rewards (Total Probability = 100%)
  const insertReward = db.prepare(`
    INSERT INTO rewards (
      id, campaign_id, name, description, reward_type, monetary_value_paise, 
      discount_percentage, min_purchase_paise, max_discount_paise, total_inventory, 
      reserved_inventory, issued_count, redeemed_count, probability_percent, is_active, 
      applicable_game, terms, color, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialRewards = [
    {
      id: 'rew-001',
      name: 'Flat ₹100 OFF',
      desc: 'Flat ₹100 instant festive discount on any eyewear purchase.',
      type: 'fixed_discount',
      value: 10000,
      pct: 0,
      minPurchase: 9900,
      maxDiscount: 10000,
      stock: 500,
      prob: 5.0,
      color: '#FF5722',
      terms: 'Valid on purchases above ₹99 at EYEVENGERS showroom.'
    },
    {
      id: 'rew-002',
      name: '10% OFF Flat',
      desc: 'Flat 10% discount on complete frame + lens eyewear package.',
      type: 'percentage_discount',
      value: 0,
      pct: 10.0,
      minPurchase: 0,
      maxDiscount: 50000,
      stock: 400,
      prob: 1.0,
      color: '#E91E63',
      terms: '10% discount on total eyewear bill at EYEVENGERS showroom.'
    },
    {
      id: 'rew-003',
      name: 'Flat ₹200 OFF',
      desc: 'Special ₹200 festive voucher on luxury designer frames and sunglasses.',
      type: 'fixed_discount',
      value: 20000,
      pct: 0,
      minPurchase: 79900,
      maxDiscount: 20000,
      stock: 300,
      prob: 10.0,
      color: '#00B0FF',
      terms: 'Valid on purchases above ₹799 at EYEVENGERS showroom.'
    },
    {
      id: 'rew-004',
      name: 'Free Sunglasses',
      desc: 'Win a complimentary pair of premium UV400 protective sunglasses!',
      type: 'free_product',
      value: 99900,
      pct: 0,
      minPurchase: 0,
      maxDiscount: 99900,
      stock: 100,
      prob: 1.0,
      color: '#FFB300',
      terms: 'Choose from designated festive collection at showroom.'
    },
    {
      id: 'rew-005',
      name: 'Free Frame',
      desc: 'Complimentary premium eyewear frame on lens purchase.',
      type: 'free_product',
      value: 79900,
      pct: 0,
      minPurchase: 99900,
      maxDiscount: 79900,
      stock: 150,
      prob: 53.0,
      color: '#00C853',
      terms: 'Valid on purchase of prescription lenses above ₹999.'
    },
    {
      id: 'rew-006',
      name: 'Flat ₹500 OFF',
      desc: 'Massive ₹500 discount on premium branded frames & progressive lenses.',
      type: 'fixed_discount',
      value: 50000,
      pct: 0,
      minPurchase: 149900,
      maxDiscount: 50000,
      stock: 50,
      prob: 27.0,
      color: '#8E24AA',
      terms: 'Valid on purchases above ₹1,499 at EYEVENGERS showroom.'
    },
    {
      id: 'rew-007',
      name: 'Frame + Lens Combo',
      desc: 'Grand Festive Bumper Prize: Complete Eyewear Frame + Lens Set 100% Free!',
      type: 'free_product',
      value: 199900,
      pct: 0,
      minPurchase: 0,
      maxDiscount: 199900,
      stock: 25,
      prob: 1.0,
      color: '#FF1744',
      terms: 'Grand prize! Complete prescription eyeglasses set from festive catalog.'
    },
    {
      id: 'rew-008',
      name: 'Free Eye Checkup',
      desc: 'Complimentary 14-step automated vision test with senior optometrist.',
      type: 'free_service',
      value: 30000,
      pct: 0,
      minPurchase: 0,
      maxDiscount: 30000,
      stock: 500,
      prob: 2.0,
      color: '#00E5FF',
      terms: 'Complimentary computerized refraction and vision test.'
    }
  ];

  for (const r of initialRewards) {
    insertReward.run(
      r.id,
      campaignId,
      r.name,
      r.desc,
      r.type,
      r.value,
      r.pct,
      r.minPurchase,
      r.maxDiscount,
      r.stock,
      0, // reserved
      0, // issued
      0, // redeemed
      r.prob,
      1, // active
      'both',
      r.terms,
      r.color,
      now,
      now
    );
  }
}

// ============================================================================
// DATA ACCESS METHODS
// ============================================================================

export const db = {
  // Profiles & Auth
  getUserByMobile(mobile: string): (UserProfile & { passwordHash: string }) | null {
    const database = getDb();
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

    const placeholders = variants.map(() => '?').join(', ');
    const stmt = database.prepare(`SELECT * FROM profiles WHERE mobile IN (${placeholders}) LIMIT 1`);
    const row = stmt.get(...variants) as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      id: row.id as string,
      mobile: row.mobile as string,
      fullName: row.full_name as string,
      role: row.role as UserProfile['role'],
      status: row.status as UserProfile['status'],
      passwordHash: row.password_hash as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  },

  getUserById(id: string): UserProfile | null {
    const database = getDb();
    const stmt = database.prepare('SELECT id, mobile, full_name, role, status, created_at, updated_at FROM profiles WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      id: row.id as string,
      mobile: row.mobile as string,
      fullName: row.full_name as string,
      role: row.role as UserProfile['role'],
      status: row.status as UserProfile['status'],
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  },

  createUser(data: { id?: string; mobile: string; fullName: string; passwordHash: string; role?: 'customer' | 'staff' | 'admin' }): UserProfile {
    const database = getDb();
    const id = data.id || crypto.randomUUID();
    const role = data.role || 'customer';
    const now = new Date().toISOString();

    const stmt = database.prepare(`
      INSERT INTO profiles (id, mobile, full_name, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
    `);
    stmt.run(id, data.mobile, data.fullName, data.passwordHash, role, now, now);

    return {
      id,
      mobile: data.mobile,
      fullName: data.fullName,
      role,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
  },

  saveUserLocally(user: UserProfile & { passwordHash: string }) {
    const database = getDb();
    const now = new Date().toISOString();
    const stmt = database.prepare(`
      INSERT OR REPLACE INTO profiles (id, mobile, full_name, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      user.id,
      user.mobile,
      user.fullName,
      user.passwordHash,
      user.role || 'customer',
      user.status || 'active',
      user.createdAt || now,
      user.updatedAt || now
    );
  },

  getAllUsers(role?: string, search?: string): UserProfile[] {
    const database = getDb();
    let query = 'SELECT id, mobile, full_name, role, status, created_at, updated_at FROM profiles WHERE 1=1';
    const params: unknown[] = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    if (search) {
      query += ' AND (full_name LIKE ? OR mobile LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY created_at DESC';

    const stmt = database.prepare(query);
    const rows = stmt.all(...params) as Record<string, unknown>[];
    return rows.map(r => ({
      id: r.id as string,
      mobile: r.mobile as string,
      fullName: r.full_name as string,
      role: r.role as UserProfile['role'],
      status: r.status as UserProfile['status'],
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    }));
  },

  updateUserStatus(id: string, status: 'active' | 'suspended'): boolean {
    const database = getDb();
    const stmt = database.prepare('UPDATE profiles SET status = ?, updated_at = ? WHERE id = ?');
    stmt.run(status, new Date().toISOString(), id);
    return true;
  },

  updateUserPassword(id: string, passwordHash: string): boolean {
    const database = getDb();
    const stmt = database.prepare('UPDATE profiles SET password_hash = ?, updated_at = ? WHERE id = ?');
    stmt.run(passwordHash, new Date().toISOString(), id);
    return true;
  },

  // Campaigns
  getActiveCampaign(): Campaign | null {
    const database = getDb();
    const now = new Date().toISOString();
    const stmt = database.prepare(`
      SELECT * FROM campaigns 
      WHERE is_active = 1 AND start_date <= ? AND end_date >= ?
      ORDER BY created_at DESC LIMIT 1
    `);
    const row = stmt.get(now, now) as Record<string, unknown> | undefined;
    if (!row) {
      // Fallback to latest active campaign
      const fallbackStmt = database.prepare('SELECT * FROM campaigns WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1');
      const fallbackRow = fallbackStmt.get() as Record<string, unknown> | undefined;
      if (!fallbackRow) return null;
      return this.mapCampaign(fallbackRow);
    }
    return this.mapCampaign(row);
  },

  getCampaignById(id: string): Campaign | null {
    const database = getDb();
    const stmt = database.prepare('SELECT * FROM campaigns WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    return this.mapCampaign(row);
  },

  getAllCampaigns(): Campaign[] {
    const database = getDb();
    const stmt = database.prepare('SELECT * FROM campaigns ORDER BY created_at DESC');
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(r => this.mapCampaign(r));
  },

  createCampaign(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Campaign {
    const database = getDb();
    const id = 'cmp-' + crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = database.prepare(`
      INSERT INTO campaigns (id, slug, name, description, theme, start_date, end_date, is_active, spin_wheel_enabled, mystery_boxes_enabled, spin_limit_per_user, box_limit_per_user, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      data.slug,
      data.name,
      data.description,
      data.theme,
      data.startDate,
      data.endDate,
      data.isActive ? 1 : 0,
      data.spinWheelEnabled ? 1 : 0,
      data.mysteryBoxesEnabled ? 1 : 0,
      data.spinLimitPerUser,
      data.boxLimitPerUser,
      now,
      now
    );
    return { id, ...data, createdAt: now, updatedAt: now };
  },

  updateCampaign(id: string, data: Partial<Campaign>): boolean {
    const database = getDb();
    const current = this.getCampaignById(id);
    if (!current) return false;

    const merged = { ...current, ...data, updatedAt: new Date().toISOString() };
    const stmt = database.prepare(`
      UPDATE campaigns SET 
        name = ?, description = ?, theme = ?, start_date = ?, end_date = ?, 
        is_active = ?, spin_wheel_enabled = ?, mystery_boxes_enabled = ?, 
        spin_limit_per_user = ?, box_limit_per_user = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      merged.name,
      merged.description,
      merged.theme,
      merged.startDate,
      merged.endDate,
      merged.isActive ? 1 : 0,
      merged.spinWheelEnabled ? 1 : 0,
      merged.mysteryBoxesEnabled ? 1 : 0,
      merged.spinLimitPerUser,
      merged.boxLimitPerUser,
      merged.updatedAt,
      id
    );
    return true;
  },

  mapCampaign(r: Record<string, unknown>): Campaign {
    return {
      id: r.id as string,
      slug: r.slug as string,
      name: r.name as string,
      description: (r.description as string) || '',
      theme: r.theme as Campaign['theme'],
      startDate: r.start_date as string,
      endDate: r.end_date as string,
      isActive: Boolean(r.is_active),
      spinWheelEnabled: Boolean(r.spin_wheel_enabled),
      mysteryBoxesEnabled: Boolean(r.mystery_boxes_enabled),
      spinLimitPerUser: Number(r.spin_limit_per_user),
      boxLimitPerUser: Number(r.box_limit_per_user),
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    };
  },

  // Banners
  getActiveBanners(): Banner[] {
    const database = getDb();
    const now = new Date().toISOString();
    const stmt = database.prepare(`
      SELECT * FROM banners 
      WHERE is_active = 1 AND start_date <= ? AND end_date >= ?
      ORDER BY display_order ASC
    `);
    const rows = stmt.all(now, now) as Record<string, unknown>[];
    return rows.map(r => this.mapBanner(r));
  },

  getAllBanners(): Banner[] {
    const database = getDb();
    const stmt = database.prepare('SELECT * FROM banners ORDER BY display_order ASC');
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(r => this.mapBanner(r));
  },

  createBanner(data: Omit<Banner, 'id' | 'createdAt'>): Banner {
    const database = getDb();
    const id = 'ban-' + crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = database.prepare(`
      INSERT INTO banners (id, title, subtitle, image_url, cta_text, cta_link, display_order, is_active, start_date, end_date, theme, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      data.title,
      data.subtitle,
      data.imageUrl,
      data.ctaText,
      data.ctaLink,
      data.displayOrder,
      data.isActive ? 1 : 0,
      data.startDate,
      data.endDate,
      data.theme || 'navratri',
      now
    );
    return { id, ...data, createdAt: now };
  },

  updateBanner(id: string, data: Partial<Banner>): boolean {
    const database = getDb();
    const stmt = database.prepare(`
      UPDATE banners SET 
        title = COALESCE(?, title),
        subtitle = COALESCE(?, subtitle),
        image_url = COALESCE(?, image_url),
        cta_text = COALESCE(?, cta_text),
        cta_link = COALESCE(?, cta_link),
        display_order = COALESCE(?, display_order),
        is_active = COALESCE(?, is_active),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date)
      WHERE id = ?
    `);
    stmt.run(
      data.title ?? null,
      data.subtitle ?? null,
      data.imageUrl ?? null,
      data.ctaText ?? null,
      data.ctaLink ?? null,
      data.displayOrder ?? null,
      data.isActive !== undefined ? (data.isActive ? 1 : 0) : null,
      data.startDate ?? null,
      data.endDate ?? null,
      id
    );
    return true;
  },

  deleteBanner(id: string): boolean {
    const database = getDb();
    const stmt = database.prepare('DELETE FROM banners WHERE id = ?');
    stmt.run(id);
    return true;
  },

  mapBanner(r: Record<string, unknown>): Banner {
    return {
      id: r.id as string,
      title: r.title as string,
      subtitle: (r.subtitle as string) || '',
      imageUrl: r.image_url as string,
      ctaText: r.cta_text as string,
      ctaLink: r.cta_link as string,
      displayOrder: Number(r.display_order),
      isActive: Boolean(r.is_active),
      startDate: r.start_date as string,
      endDate: r.end_date as string,
      theme: r.theme as Banner['theme'],
      createdAt: r.created_at as string,
    };
  },

  // Rewards
  getRewardsByCampaign(campaignId: string, gameType?: 'spin_wheel' | 'mystery_box'): Reward[] {
    const database = getDb();
    let query = 'SELECT * FROM rewards WHERE campaign_id = ? AND is_active = 1';
    const params: unknown[] = [campaignId];

    if (gameType) {
      query += " AND (applicable_game = ? OR applicable_game = 'both')";
      params.push(gameType);
    }
    query += ' ORDER BY created_at ASC';

    const stmt = database.prepare(query);
    const rows = stmt.all(...params) as Record<string, unknown>[];
    return rows.map(r => this.mapReward(r));
  },

  getAllRewards(campaignId?: string): Reward[] {
    const database = getDb();
    let query = 'SELECT * FROM rewards WHERE 1=1';
    const params: unknown[] = [];
    if (campaignId) {
      query += ' AND campaign_id = ?';
      params.push(campaignId);
    }
    query += ' ORDER BY created_at ASC';
    const stmt = database.prepare(query);
    const rows = stmt.all(...params) as Record<string, unknown>[];
    return rows.map(r => this.mapReward(r));
  },

  getRewardById(id: string): Reward | null {
    const database = getDb();
    const stmt = database.prepare('SELECT * FROM rewards WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    return this.mapReward(row);
  },

  createReward(data: Omit<Reward, 'id' | 'reservedInventory' | 'issuedCount' | 'redeemedCount' | 'createdAt' | 'updatedAt'>): Reward {
    const database = getDb();
    const id = 'rew-' + crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = database.prepare(`
      INSERT INTO rewards (
        id, campaign_id, name, description, reward_type, monetary_value_paise, 
        discount_percentage, min_purchase_paise, max_discount_paise, total_inventory, 
        reserved_inventory, issued_count, redeemed_count, probability_percent, is_active, 
        applicable_game, terms, color, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      data.campaignId,
      data.name,
      data.description,
      data.rewardType,
      data.monetaryValuePaise,
      data.discountPercentage,
      data.minPurchasePaise,
      data.maxDiscountPaise,
      data.totalInventory,
      data.probabilityPercent,
      data.isActive ? 1 : 0,
      data.applicableGame,
      data.terms,
      data.color || '#E8C477',
      now,
      now
    );
    return {
      id,
      ...data,
      reservedInventory: 0,
      issuedCount: 0,
      redeemedCount: 0,
      createdAt: now,
      updatedAt: now,
    };
  },

  updateReward(id: string, data: Partial<Reward>): boolean {
    const database = getDb();
    const current = this.getRewardById(id);
    if (!current) return false;

    const merged = { ...current, ...data, updatedAt: new Date().toISOString() };
    const stmt = database.prepare(`
      UPDATE rewards SET 
        name = ?, description = ?, reward_type = ?, monetary_value_paise = ?, 
        discount_percentage = ?, min_purchase_paise = ?, max_discount_paise = ?, 
        total_inventory = ?, probability_percent = ?, is_active = ?, 
        applicable_game = ?, terms = ?, color = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      merged.name,
      merged.description,
      merged.rewardType,
      merged.monetaryValuePaise,
      merged.discountPercentage,
      merged.minPurchasePaise,
      merged.maxDiscountPaise,
      merged.totalInventory,
      merged.probabilityPercent,
      merged.isActive ? 1 : 0,
      merged.applicableGame,
      merged.terms,
      merged.color || '#E8C477',
      merged.updatedAt,
      id
    );
    return true;
  },

  mapReward(r: Record<string, unknown>): Reward {
    return {
      id: r.id as string,
      campaignId: r.campaign_id as string,
      name: r.name as string,
      description: (r.description as string) || '',
      rewardType: r.reward_type as Reward['rewardType'],
      monetaryValuePaise: Number(r.monetary_value_paise),
      discountPercentage: Number(r.discount_percentage),
      minPurchasePaise: Number(r.min_purchase_paise),
      maxDiscountPaise: Number(r.max_discount_paise),
      totalInventory: Number(r.total_inventory),
      reservedInventory: Number(r.reserved_inventory),
      issuedCount: Number(r.issued_count),
      redeemedCount: Number(r.redeemed_count),
      probabilityPercent: Number(r.probability_percent),
      isActive: Boolean(r.is_active),
      applicableGame: r.applicable_game as Reward['applicableGame'],
      terms: (r.terms as string) || '',
      color: (r.color as string) || '#E8C477',
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    };
  },

  // Game Plays & Limit Checks
  getUserPlaysCount(userId: string, campaignId: string, gameType: 'spin_wheel' | 'mystery_box', mobile?: string): number {
    const database = getDb();
    let query = `
      SELECT COUNT(*) as count FROM game_plays gp
      LEFT JOIN profiles u ON gp.user_id = u.id
      WHERE (gp.user_id = ?
    `;
    const params: unknown[] = [userId];
    if (mobile) {
      query += " OR (u.mobile = ? AND u.mobile != ''))";
      params.push(mobile);
    } else {
      query += ')';
    }
    query += ' AND gp.campaign_id = ? AND gp.game_type = ?';
    params.push(campaignId, gameType);

    const stmt = database.prepare(query);
    const row = stmt.get(...params) as { count: number } | undefined;
    return row ? row.count : 0;
  },

  // ATOMIC PLAY & REWARD ALLOCATION TRANSACTION
  recordPlayAndIssueVoucher(params: {
    userId: string;
    userMobile?: string;
    userName?: string;
    campaignId: string;
    gameType: 'spin_wheel' | 'mystery_box';
    rewardId: string;
    rewardData?: any;
    expiryDays?: number;
    expiryDate?: string;
  }): { success: boolean; error?: string; voucher?: Voucher; gamePlay?: GamePlay } {
    const database = getDb();

    // Verify campaign is active
    const campaign = this.getCampaignById(params.campaignId);
    if (!campaign || !campaign.isActive) {
      return { success: false, error: 'Campaign is not currently active.' };
    }

    const now = new Date();
    if (new Date(campaign.startDate) > now) {
      return { success: false, error: 'Campaign has not started yet.' };
    }
    if (new Date(campaign.endDate) < now) {
      return { success: false, error: 'Campaign has concluded.' };
    }

    // Verify limit
    const allowedLimit = params.gameType === 'spin_wheel' ? campaign.spinLimitPerUser : campaign.boxLimitPerUser;
    const currentPlays = this.getUserPlaysCount(params.userId, params.campaignId, params.gameType, params.userMobile);
    if (currentPlays >= allowedLimit) {
      return { success: false, error: `You have reached the maximum play limit (${allowedLimit}) for this festive game.` };
    }

    // BEGIN ATOMIC ALLOCATION
    const gamePlayId = 'gpl-' + crypto.randomUUID();
    const voucherId = 'vch-' + crypto.randomUUID();
    const nowIso = now.toISOString();
    // Fixed Festive Campaign Expiry Date: 25 Oct 2026 (23:59:59 IST)
    const fixedCampaignExpiry = new Date('2026-10-25T23:59:59+05:30').toISOString();
    const expiryDate = params.expiryDate || fixedCampaignExpiry;
    
    // Human readable unique ticket voucher code e.g. EYE-NAV-849201
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const voucherCode = `EYE-${campaign.theme.substring(0, 3).toUpperCase()}-${randomHex}`;
    const qrToken = crypto.randomBytes(20).toString('hex');

    // Ensure user profile exists in profiles table before inserting game_play or voucher
    try {
      const userStmt = database.prepare('SELECT id FROM profiles WHERE id = ?');
      const userRow = userStmt.get(params.userId);
      if (!userRow) {
        database.prepare(`
          INSERT OR IGNORE INTO profiles (id, mobile, full_name, password_hash, role, status, created_at, updated_at)
          VALUES (?, ?, ?, 'session_token', 'customer', 'active', ?, ?)
        `).run(
          params.userId,
          params.userMobile || `+91${params.userId.replace(/\D/g, '').slice(-10) || '9876543210'}`,
          params.userName || 'Valued Customer',
          nowIso,
          nowIso
        );
      }
    } catch {}

    try {
      database.exec('BEGIN IMMEDIATE TRANSACTION;');

      // 1. Re-check stock in transaction
      const stockStmt = database.prepare('SELECT id, total_inventory, issued_count FROM rewards WHERE id = ?');
      let stockRow = stockStmt.get(params.rewardId) as { id: string; total_inventory: number; issued_count: number } | undefined;
      
      // If reward exists in cloud but not yet in SQLite, ensure it exists with full details
      if (!stockRow && params.rewardData) {
        try {
          database.prepare(`
            INSERT OR REPLACE INTO rewards (
              id, campaign_id, name, description, reward_type, monetary_value_paise,
              discount_percentage, min_purchase_paise, max_discount_paise, total_inventory,
              reserved_inventory, issued_count, redeemed_count, probability_percent, is_active,
              applicable_game, terms, color, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            params.rewardData.id,
            params.campaignId,
            params.rewardData.name,
            params.rewardData.description || '',
            params.rewardData.rewardType || params.rewardData.reward_type || 'fixed_discount',
            Number(params.rewardData.monetaryValuePaise || params.rewardData.monetary_value_paise || 0),
            Number(params.rewardData.discountPercentage || params.rewardData.discount_percentage || 0),
            Number(params.rewardData.minPurchasePaise || params.rewardData.min_purchase_paise || 0),
            Number(params.rewardData.maxDiscountPaise || params.rewardData.max_discount_paise || 0),
            Number(params.rewardData.totalInventory || params.rewardData.total_inventory || 9999),
            Number(params.rewardData.reservedInventory || params.rewardData.reserved_inventory || 0),
            Number(params.rewardData.issuedCount || params.rewardData.issued_count || 0),
            Number(params.rewardData.redeemedCount || params.rewardData.redeemed_count || 0),
            Number(params.rewardData.probabilityPercent || params.rewardData.probability_percent || 0),
            1,
            params.rewardData.applicableGame || params.rewardData.applicable_game || 'both',
            params.rewardData.terms || '',
            params.rewardData.color || '#E8C477',
            nowIso,
            nowIso
          );
          stockRow = stockStmt.get(params.rewardId) as { id: string; total_inventory: number; issued_count: number } | undefined;
        } catch {}
      }

      if (!stockRow) {
        // Fallback to active reward in this campaign only if no rewardData was given
        stockRow = database.prepare('SELECT id, total_inventory, issued_count FROM rewards WHERE campaign_id = ? AND is_active = 1 LIMIT 1').get(params.campaignId) as { id: string; total_inventory: number; issued_count: number } | undefined;
        if (stockRow) {
          params.rewardId = stockRow.id;
        } else {
          database.exec('ROLLBACK;');
          return { success: false, error: 'Selected reward does not exist.' };
        }
      }

      if (stockRow.issued_count >= stockRow.total_inventory) {
        database.exec('ROLLBACK;');
        return { success: false, error: 'Selected reward stock has been completely exhausted.' };
      }

      // 2. Increment issued_count atomically
      const updateStockStmt = database.prepare('UPDATE rewards SET issued_count = issued_count + 1 WHERE id = ?');
      updateStockStmt.run(params.rewardId);

      // 3. Record Game Play
      const insertPlayStmt = database.prepare(`
        INSERT INTO game_plays (id, user_id, campaign_id, game_type, reward_id, metadata, played_at)
        VALUES (?, ?, ?, ?, ?, '{}', ?)
      `);
      insertPlayStmt.run(gamePlayId, params.userId, params.campaignId, params.gameType, params.rewardId, nowIso);

      // 4. Issue Voucher
      const insertVoucherStmt = database.prepare(`
        INSERT INTO vouchers (
          id, voucher_code, user_id, reward_id, campaign_id, game_play_id,
          issue_date, expiry_date, status, qr_token, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'issued', ?, ?)
      `);
      insertVoucherStmt.run(
        voucherId,
        voucherCode,
        params.userId,
        params.rewardId,
        params.campaignId,
        gamePlayId,
        nowIso,
        expiryDate,
        qrToken,
        nowIso
      );

      database.exec('COMMIT;');

      const user = this.getUserById(params.userId);
      const reward = this.getRewardById(params.rewardId)!;

      const voucher: Voucher = {
        id: voucherId,
        voucherCode,
        userId: params.userId,
        customerName: user ? user.fullName : 'Valued Customer',
        customerMobile: user ? user.mobile : '',
        rewardId: reward.id,
        rewardName: reward.name,
        rewardType: reward.rewardType,
        rewardValueDisplay: reward.monetaryValuePaise > 0 
          ? `₹${reward.monetaryValuePaise / 100}` 
          : (reward.discountPercentage > 0 ? `${reward.discountPercentage}% OFF` : 'COMPLIMENTARY'),
        terms: reward.terms,
        campaignId: campaign.id,
        campaignName: campaign.name,
        gamePlayId,
        issueDate: nowIso,
        expiryDate,
        status: 'issued',
        qrToken,
        createdAt: nowIso,
      };

      const gamePlay: GamePlay = {
        id: gamePlayId,
        userId: params.userId,
        campaignId: params.campaignId,
        gameType: params.gameType,
        rewardId: reward.id,
        playedAt: nowIso,
      };

      return { success: true, voucher, gamePlay };
    } catch (err: unknown) {
      try { database.exec('ROLLBACK;'); } catch {}
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      return { success: false, error: msg };
    }
  },

  // Vouchers
  getVoucherById(id: string): Voucher | null {
    const database = getDb();
    const stmt = database.prepare(`
      SELECT v.*, u.full_name as customer_name, u.mobile as customer_mobile,
             r.name as reward_name, r.reward_type, r.monetary_value_paise, r.discount_percentage, r.terms,
             c.name as campaign_name
      FROM vouchers v
      LEFT JOIN profiles u ON v.user_id = u.id
      LEFT JOIN rewards r ON v.reward_id = r.id
      LEFT JOIN campaigns c ON v.campaign_id = c.id
      WHERE v.id = ?
    `);
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    return this.mapVoucher(row);
  },

  getVoucherByCode(code: string): Voucher | null {
    const database = getDb();
    const cleanCode = code.trim().toUpperCase();
    const stmt = database.prepare(`
      SELECT v.*, u.full_name as customer_name, u.mobile as customer_mobile,
             r.name as reward_name, r.reward_type, r.monetary_value_paise, r.discount_percentage, r.terms,
             c.name as campaign_name
      FROM vouchers v
      LEFT JOIN profiles u ON v.user_id = u.id
      LEFT JOIN rewards r ON v.reward_id = r.id
      LEFT JOIN campaigns c ON v.campaign_id = c.id
      WHERE UPPER(v.voucher_code) = ?
    `);
    const row = stmt.get(cleanCode) as Record<string, unknown> | undefined;
    if (!row) return null;
    return this.mapVoucher(row);
  },

  getVoucherByQrToken(token: string): Voucher | null {
    const database = getDb();
    const stmt = database.prepare(`
      SELECT v.*, u.full_name as customer_name, u.mobile as customer_mobile,
             r.name as reward_name, r.reward_type, r.monetary_value_paise, r.discount_percentage, r.terms,
             c.name as campaign_name
      FROM vouchers v
      LEFT JOIN profiles u ON v.user_id = u.id
      LEFT JOIN rewards r ON v.reward_id = r.id
      LEFT JOIN campaigns c ON v.campaign_id = c.id
      WHERE v.qr_token = ?
    `);
    const row = stmt.get(token) as Record<string, unknown> | undefined;
    if (!row) return null;
    return this.mapVoucher(row);
  },

  getUserVouchers(userId: string, mobile?: string): Voucher[] {
    const database = getDb();
    let query = `
      SELECT v.*, u.full_name as customer_name, u.mobile as customer_mobile,
             r.name as reward_name, r.reward_type, r.monetary_value_paise, r.discount_percentage, r.terms,
             c.name as campaign_name
      FROM vouchers v
      LEFT JOIN profiles u ON v.user_id = u.id
      LEFT JOIN rewards r ON v.reward_id = r.id
      LEFT JOIN campaigns c ON v.campaign_id = c.id
      WHERE v.user_id = ?
    `;
    const params: unknown[] = [userId];

    if (mobile) {
      query += " OR (u.mobile = ? AND u.mobile != '')";
      params.push(mobile);
    }

    query += ' ORDER BY v.created_at DESC';

    const stmt = database.prepare(query);
    const rows = stmt.all(...params) as Record<string, unknown>[];
    return rows.map(r => this.mapVoucher(r));
  },

  getAllVouchers(status?: string, search?: string): Voucher[] {
    const database = getDb();
    let query = `
      SELECT v.*, u.full_name as customer_name, u.mobile as customer_mobile,
             r.name as reward_name, r.reward_type, r.monetary_value_paise, r.discount_percentage, r.terms,
             c.name as campaign_name
      FROM vouchers v
      LEFT JOIN profiles u ON v.user_id = u.id
      LEFT JOIN rewards r ON v.reward_id = r.id
      LEFT JOIN campaigns c ON v.campaign_id = c.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (status) {
      query += ' AND v.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (v.voucher_code LIKE ? OR u.full_name LIKE ? OR u.mobile LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY v.created_at DESC';

    const stmt = database.prepare(query);
    const rows = stmt.all(...params) as Record<string, unknown>[];
    return rows.map(r => this.mapVoucher(r));
  },

  saveVoucherLocally(v: any) {
    const database = getDb();
    const now = new Date().toISOString();
    const vchId = v.id || v.voucherId;
    const vchCode = v.voucherCode || v.voucher_code;
    const userId = v.userId || v.user_id;
    const rewardId = v.rewardId || v.reward_id;
    const campaignId = v.campaignId || v.campaign_id || 'cmp-festive-navratri-2026';
    const status = v.status || 'issued';

    // Ensure reward exists in SQLite
    if (rewardId) {
      try {
        const rwCheck = database.prepare('SELECT id FROM rewards WHERE id = ?').get(rewardId);
        if (!rwCheck) {
          database.prepare(`
            INSERT OR IGNORE INTO rewards (id, campaign_id, name, description, reward_type, monetary_value_paise, discount_percentage, min_purchase_paise, total_inventory, remaining_inventory, probability_weight, is_active, terms, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'fixed_discount', 0, 0, 0, 1000, 1000, 10, 1, 'Showroom redemption terms apply', ?, ?)
          `).run(rewardId, campaignId, v.rewardName || 'Festive Reward', 'Exclusive festive discount', now, now);
        }
      } catch {}
    }

    // Ensure customer profile exists in SQLite
    if (userId) {
      try {
        const pCheck = database.prepare('SELECT id FROM profiles WHERE id = ?').get(userId);
        if (!pCheck) {
          database.prepare(`
            INSERT OR IGNORE INTO profiles (id, mobile, full_name, password_hash, role, status, created_at, updated_at)
            VALUES (?, ?, ?, '', 'customer', 'active', ?, ?)
          `).run(userId, v.customerMobile || '+910000000000', v.customerName || 'Valued Customer', now, now);
        }
      } catch {}
    }

    const stmt = database.prepare(`
      INSERT OR REPLACE INTO vouchers (
        id, voucher_code, user_id, reward_id, campaign_id, game_play_id,
        issue_date, expiry_date, status, qr_token, redeemed_at,
        redeemed_by_staff_id, bill_reference, purchase_amount_paise, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      vchId,
      vchCode,
      userId,
      rewardId,
      campaignId,
      v.gamePlayId || v.game_play_id || null,
      v.issueDate || v.issue_date || v.createdAt || v.created_at || now,
      v.expiryDate || v.expiry_date || new Date(Date.now() + 14 * 86400000).toISOString(),
      status,
      v.qrToken || v.qr_token || ('QR-' + vchCode),
      v.redeemedAt || v.redeemed_at || null,
      v.redeemedByStaffId || v.redeemed_by_staff_id || null,
      v.billReference || v.bill_reference || null,
      v.purchaseAmountPaise || v.purchase_amount_paise || null,
      v.createdAt || v.created_at || now
    );
  },

  // SHOWROOM REDEMPTION TRANSACTION (Safe against race conditions)
  redeemVoucher(params: {
    voucherId: string;
    staffId: string;
    billReference?: string;
    purchaseAmountPaise?: number;
    showroomLocation?: string;
  }): { success: boolean; error?: string; voucher?: Voucher } {
    const database = getDb();
    const nowIso = new Date().toISOString();

    try {
      database.exec('BEGIN IMMEDIATE TRANSACTION;');

      const vStmt = database.prepare('SELECT * FROM vouchers WHERE id = ? OR voucher_code = ?');
      const vRow = vStmt.get(params.voucherId, params.voucherId) as Record<string, unknown> | undefined;

      if (!vRow) {
        database.exec('ROLLBACK;');
        return { success: false, error: 'Voucher does not exist.' };
      }

      if (vRow.status === 'redeemed') {
        database.exec('ROLLBACK;');
        return { success: false, error: 'Voucher has already been redeemed earlier.' };
      }

      if (vRow.status === 'cancelled') {
        database.exec('ROLLBACK;');
        return { success: false, error: 'Voucher has been revoked or cancelled.' };
      }

      // Check expiry
      if (new Date(vRow.expiry_date as string) < new Date()) {
        database.exec('ROLLBACK;');
        return { success: false, error: 'Voucher has expired.' };
      }

      const actualVoucherId = vRow.id as string;

      // Mark redeemed
      const updateStmt = database.prepare(`
        UPDATE vouchers 
        SET status = 'redeemed', redeemed_at = ?, redeemed_by_staff_id = ?, bill_reference = ?, purchase_amount_paise = ?
        WHERE id = ? AND status = 'issued'
      `);
      const res = updateStmt.run(
        nowIso,
        params.staffId,
        params.billReference || null,
        params.purchaseAmountPaise || 0,
        actualVoucherId
      );

      if (res.changes === 0) {
        database.exec('ROLLBACK;');
        return { success: false, error: 'Voucher state conflict: could not be redeemed.' };
      }

      // Update reward redeemed_count
      try {
        const incRewardStmt = database.prepare('UPDATE rewards SET redeemed_count = redeemed_count + 1 WHERE id = ?');
        incRewardStmt.run(vRow.reward_id as string);
      } catch {}

      // Record in redemptions table
      const insertRedemptionStmt = database.prepare(`
        INSERT INTO redemptions (id, voucher_id, voucher_code, staff_id, bill_reference, purchase_amount_paise, redeemed_at, showroom_location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertRedemptionStmt.run(
        'rdm-' + crypto.randomUUID(),
        actualVoucherId,
        vRow.voucher_code as string,
        params.staffId,
        params.billReference || null,
        params.purchaseAmountPaise || 0,
        nowIso,
        params.showroomLocation || 'Bhadu Market Showroom, Jodhpur'
      );

      database.exec('COMMIT;');

      const updatedVoucher = this.getVoucherById(actualVoucherId)!;
      return { success: true, voucher: updatedVoucher };
    } catch (err: unknown) {
      try { database.exec('ROLLBACK;'); } catch {}
      const msg = err instanceof Error ? err.message : 'Redemption transaction failed';
      return { success: false, error: msg };
    }
  },

  revokeVoucher(id: string, reason: string): boolean {
    const database = getDb();
    const stmt = database.prepare("UPDATE vouchers SET status = 'cancelled' WHERE id = ?");
    stmt.run(id);
    return true;
  },

  mapVoucher(r: Record<string, unknown>): Voucher {
    const valPaise = Number(r.monetary_value_paise || 0);
    const discPct = Number(r.discount_percentage || 0);
    let displayVal = 'COMPLIMENTARY';
    if (valPaise > 0) displayVal = `₹${valPaise / 100}`;
    else if (discPct > 0) displayVal = `${discPct}% OFF`;

    return {
      id: r.id as string,
      voucherCode: r.voucher_code as string,
      userId: r.user_id as string,
      customerName: (r.customer_name as string) || 'Customer',
      customerMobile: (r.customer_mobile as string) || '',
      rewardId: r.reward_id as string,
      rewardName: (r.reward_name as string) || 'Reward',
      rewardType: r.reward_type as Reward['rewardType'],
      rewardValueDisplay: displayVal,
      terms: (r.terms as string) || '',
      campaignId: r.campaign_id as string,
      campaignName: (r.campaign_name as string) || 'Eyevengers Campaign',
      gamePlayId: r.game_play_id as string,
      issueDate: r.issue_date as string,
      expiryDate: r.expiry_date as string,
      status: r.status as Voucher['status'],
      qrToken: r.qr_token as string,
      redeemedAt: r.redeemed_at as string | undefined,
      redeemedByStaffId: r.redeemed_by_staff_id as string | undefined,
      billReference: r.bill_reference as string | undefined,
      purchaseAmountPaise: r.purchase_amount_paise ? Number(r.purchase_amount_paise) : undefined,
      createdAt: r.created_at as string,
    };
  },

  // Audit Logs
  createAuditLog(log: Omit<AdminAuditLog, 'id' | 'timestamp'>): void {
    const database = getDb();
    const id = 'aud-' + crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = database.prepare(`
      INSERT INTO admin_audit_logs (id, admin_id, admin_name, action, target_type, target_id, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, log.adminId, log.adminName, log.action, log.targetType, log.targetId, log.details || null, now);
  },

  getAuditLogs(limit = 100): AdminAuditLog[] {
    const database = getDb();
    const stmt = database.prepare('SELECT * FROM admin_audit_logs ORDER BY timestamp DESC LIMIT ?');
    const rows = stmt.all(limit) as Record<string, unknown>[];
    return rows.map(r => ({
      id: r.id as string,
      adminId: r.admin_id as string,
      adminName: r.admin_name as string,
      action: r.action as string,
      targetType: r.target_type as string,
      targetId: r.target_id as string,
      details: r.details as string | undefined,
      timestamp: r.timestamp as string,
    }));
  },

  getRecentRedemptions(limit = 20): RedemptionRecord[] {
    const database = getDb();
    const stmt = database.prepare(`
      SELECT r.*, 
             COALESCE(u.full_name, 'Showroom Staff') as staff_name, 
             v.user_id, 
             COALESCE(c.full_name, 'Valued Customer') as customer_name, 
             COALESCE(rw.name, 'Festive Reward') as reward_name
      FROM redemptions r
      LEFT JOIN profiles u ON r.staff_id = u.id
      LEFT JOIN vouchers v ON r.voucher_id = v.id
      LEFT JOIN profiles c ON v.user_id = c.id
      LEFT JOIN rewards rw ON v.reward_id = rw.id
      ORDER BY r.redeemed_at DESC LIMIT ?
    `);
    const rows = stmt.all(limit) as Record<string, unknown>[];
    return rows.map(r => ({
      id: r.id as string,
      voucherId: r.voucher_id as string,
      voucherCode: r.voucher_code as string,
      customerName: (r.customer_name as string) || 'Customer',
      rewardName: (r.reward_name as string) || 'Reward',
      staffId: r.staff_id as string,
      staffName: (r.staff_name as string) || 'Staff',
      billReference: r.bill_reference as string | undefined,
      purchaseAmountPaise: r.purchase_amount_paise ? Number(r.purchase_amount_paise) : undefined,
      redeemedAt: r.redeemed_at as string,
      showroomLocation: (r.showroom_location as string) || 'Bhadu Market Showroom, Jodhpur',
    }));
  },

  // Overview Metrics (High-Performance Combined Aggregates)
  getDashboardMetrics() {
    const database = getDb();
    const now = new Date().toISOString();

    const countsRow = database.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM profiles WHERE role = 'customer') as totalCustomers,
        (SELECT COUNT(*) FROM campaigns WHERE is_active = 1) as activeCampaigns
    `).get() as { totalCustomers: number; activeCampaigns: number } | undefined;

    const playRow = database.prepare(`
      SELECT 
        COUNT(*) as totalPlays,
        SUM(CASE WHEN game_type = 'spin_wheel' THEN 1 ELSE 0 END) as spinPlays,
        SUM(CASE WHEN game_type = 'mystery_box' THEN 1 ELSE 0 END) as boxPlays
      FROM game_plays
    `).get() as { totalPlays: number; spinPlays: number | null; boxPlays: number | null } | undefined;

    const voucherRow = database.prepare(`
      SELECT 
        COUNT(*) as vouchersIssued,
        SUM(CASE WHEN status = 'redeemed' THEN 1 ELSE 0 END) as vouchersRedeemed,
        SUM(CASE WHEN status = 'issued' AND expiry_date < ? THEN 1 ELSE 0 END) as vouchersExpired
      FROM vouchers
    `).get(now) as { vouchersIssued: number; vouchersRedeemed: number | null; vouchersExpired: number | null } | undefined;

    const inventoryCostRow = database.prepare(`
      SELECT 
        (SELECT SUM(total_inventory - issued_count) FROM rewards WHERE is_active = 1) as remainingInventory,
        (SELECT SUM(r.monetary_value_paise) FROM vouchers v JOIN rewards r ON v.reward_id = r.id WHERE v.status = 'redeemed') as estimatedCostPaise
    `).get() as { remainingInventory: number | null; estimatedCostPaise: number | null } | undefined;

    const totalCustomers = countsRow?.totalCustomers ?? 0;
    const activeCampaigns = countsRow?.activeCampaigns ?? 0;
    const totalPlays = playRow?.totalPlays ?? 0;
    const spinPlays = playRow?.spinPlays ?? 0;
    const boxPlays = playRow?.boxPlays ?? 0;
    const vouchersIssued = voucherRow?.vouchersIssued ?? 0;
    const vouchersRedeemed = voucherRow?.vouchersRedeemed ?? 0;
    const vouchersExpired = voucherRow?.vouchersExpired ?? 0;
    const remainingInventory = inventoryCostRow?.remainingInventory ?? 0;
    const estimatedCostPaise = inventoryCostRow?.estimatedCostPaise ?? 0;
    const redemptionRate = vouchersIssued > 0 ? Math.round((vouchersRedeemed / vouchersIssued) * 100) : 0;

    return {
      totalCustomers,
      activeCampaigns,
      totalPlays,
      spinPlays,
      boxPlays,
      vouchersIssued,
      vouchersRedeemed,
      vouchersExpired,
      remainingInventory,
      redemptionRate,
      estimatedCostPaise,
    };
  },

  getRawDb(): DatabaseSync {
    return getDb();
  }
};
