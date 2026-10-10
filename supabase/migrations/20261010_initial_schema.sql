-- ============================================================================
-- EYEVENGERS FESTIVE GAMING & REWARDS PLATFORM
-- Initial Database Schema Migration for PostgreSQL / Supabase
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table (Customers, Staff, Administrators)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON profiles(mobile);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 2. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  theme VARCHAR(30) NOT NULL DEFAULT 'navratri' CHECK (theme IN ('navratri', 'diwali', 'holi')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  spin_wheel_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  mystery_boxes_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  spin_limit_per_user INT NOT NULL DEFAULT 1 CHECK (spin_limit_per_user >= 1),
  box_limit_per_user INT NOT NULL DEFAULT 1 CHECK (box_limit_per_user >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(is_active, start_date, end_date);

-- 3. Banners Table (Homepage promotional slider)
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  cta_text VARCHAR(50) NOT NULL DEFAULT 'Play Now',
  cta_link VARCHAR(150) NOT NULL DEFAULT '/#games',
  display_order INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  theme VARCHAR(30) DEFAULT 'navratri',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Rewards Table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  reward_type VARCHAR(30) NOT NULL CHECK (reward_type IN ('fixed_discount', 'percentage_discount', 'free_product', 'free_service', 'custom')),
  monetary_value_paise BIGINT NOT NULL DEFAULT 0, -- e.g. 5000 = ₹50
  discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
  min_purchase_paise BIGINT NOT NULL DEFAULT 0,
  max_discount_paise BIGINT NOT NULL DEFAULT 0,
  total_inventory INT NOT NULL DEFAULT 100 CHECK (total_inventory >= 0),
  reserved_inventory INT NOT NULL DEFAULT 0 CHECK (reserved_inventory >= 0),
  issued_count INT NOT NULL DEFAULT 0 CHECK (issued_count >= 0),
  redeemed_count INT NOT NULL DEFAULT 0 CHECK (redeemed_count >= 0),
  probability_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.0 CHECK (probability_percent >= 0 AND probability_percent <= 100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  applicable_game VARCHAR(30) NOT NULL DEFAULT 'both' CHECK (applicable_game IN ('spin_wheel', 'mystery_box', 'both')),
  terms TEXT NOT NULL,
  color VARCHAR(30) DEFAULT '#E8C477',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rewards_campaign ON rewards(campaign_id, is_active);

-- 5. Game Plays (Immutable record of each game play)
CREATE TABLE IF NOT EXISTS game_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
  game_type VARCHAR(30) NOT NULL CHECK (game_type IN ('spin_wheel', 'mystery_box')),
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
  metadata JSONB DEFAULT '{}'::jsonb,
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_plays_user ON game_plays(user_id, campaign_id, game_type);

-- 6. Digital Vouchers Table
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_code VARCHAR(30) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
  game_play_id UUID UNIQUE REFERENCES game_plays(id) ON DELETE RESTRICT,
  issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'redeemed', 'expired', 'cancelled')),
  qr_token VARCHAR(80) NOT NULL UNIQUE,
  redeemed_at TIMESTAMPTZ,
  redeemed_by_staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  bill_reference VARCHAR(50),
  purchase_amount_paise BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vouchers_user ON vouchers(user_id, status);
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(voucher_code);
CREATE INDEX IF NOT EXISTS idx_vouchers_qr ON vouchers(qr_token);

-- 7. Redemptions Log Table
CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE RESTRICT,
  voucher_code VARCHAR(30) NOT NULL,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  bill_reference VARCHAR(50),
  purchase_amount_paise BIGINT,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  showroom_location VARCHAR(150) NOT NULL DEFAULT 'Sardarpura Showroom, Jodhpur'
);

-- 8. Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  admin_name VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(100) NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Row Level Security Policies (Supabase RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read active campaigns, banners, and active rewards for games
CREATE POLICY "Public read active campaigns" ON campaigns FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active banners" ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active rewards" ON rewards FOR SELECT USING (is_active = true);
