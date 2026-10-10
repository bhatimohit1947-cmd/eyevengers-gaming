-- ============================================================================
-- EYEVENGERS FESTIVE REWARDS — SUPABASE SEED DATA
-- Default Campaigns, Banners, Seed Rewards, and Bootstrap Accounts
-- ============================================================================

-- 1. Seed Admin Accounts (Password: Heyeyevengers)
INSERT INTO profiles (mobile, full_name, password_hash, role, status)
VALUES 
  ('+917240158860', 'Admin (7240158860)', '$2b$10$dY4lu7Gv43F7zRnvcx/g4O1eWHPp4m9t.VjxdIv1sSqcd57DaxXCS', 'admin', 'active'),
  ('+918824187493', 'Admin (8824187493)', '$2b$10$dY4lu7Gv43F7zRnvcx/g4O1eWHPp4m9t.VjxdIv1sSqcd57DaxXCS', 'admin', 'active'),
  ('+919876500002', 'Showroom Desk Staff', '$2b$10$dY4lu7Gv43F7zRnvcx/g4O1eWHPp4m9t.VjxdIv1sSqcd57DaxXCS', 'staff', 'active')
ON CONFLICT (mobile) DO NOTHING;

-- 2. Seed Festive Navratri Campaign
INSERT INTO campaigns (
  id, slug, name, description, theme, start_date, end_date, 
  is_active, spin_wheel_enabled, mystery_boxes_enabled, 
  spin_limit_per_user, box_limit_per_user
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'festive-dhamaka-2026',
  'Navratri & Festive Optical Mahotsav 2026',
  'Play our festive games and win guaranteed vouchers, free eyewear upgrades, and complimentary comprehensive vision checkups at our Jodhpur showroom!',
  'navratri',
  NOW(),
  NOW() + INTERVAL '30 days',
  TRUE,
  TRUE,
  TRUE,
  1,
  1
) ON CONFLICT (slug) DO NOTHING;

-- 3. Seed Banners
INSERT INTO banners (id, title, subtitle, image_url, cta_text, cta_link, display_order, is_active, theme)
VALUES
  ('22222222-2222-2222-2222-000000000001', 'Celebrate Navratri with Grand Rewards', 'Spin the Golden Wheel or open Mystery Boxes to unlock exclusive discounts at EYEVENGERS Jodhpur!', '/banners/navratri-spin.svg', 'Explore Games', '#games', 1, TRUE, 'navratri'),
  ('22222222-2222-2222-2222-000000000002', 'Festive Vision Care: Free Eye Checkup Offer', 'Get comprehensive digital eye examinations and expert lens consultations with our senior optometrists.', '/banners/eye-checkup.svg', 'Win Voucher', '#games', 2, TRUE, 'navratri'),
  ('22222222-2222-2222-2222-000000000003', 'Special Showroom Discounts up to ₹200 Off', 'Redeem instantly at our flagship Sardarpura showroom. Valid on all premium frames and blue-cut lenses.', '/banners/discount-voucher.svg', 'Claim Now', '#games', 3, TRUE, 'navratri')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Configured Rewards (Total Probability = 100%)
INSERT INTO rewards (
  id, campaign_id, name, description, reward_type, monetary_value_paise, 
  discount_percentage, min_purchase_paise, max_discount_paise, total_inventory, 
  probability_percent, is_active, applicable_game, terms, color
) VALUES 
  ('33333333-3333-3333-3333-000000000001', '11111111-1111-1111-1111-111111111111', '₹50 OFF Eyewear Voucher', 'Flat ₹50 instant discount on any frame, sunglass, or optical lens.', 'fixed_discount', 5000, 0, 49900, 5000, 500, 50.0, TRUE, 'both', 'Valid on purchases above ₹499 at Sardarpura showroom.', '#C93B3B'),
  ('33333333-3333-3333-3333-000000000002', '11111111-1111-1111-1111-111111111111', '₹100 OFF Premium Frames', 'Flat ₹100 instant discount on branded eyewear collections.', 'fixed_discount', 10000, 0, 99900, 10000, 300, 25.0, TRUE, 'both', 'Valid on frames and lenses above ₹999.', '#E8C477'),
  ('33333333-3333-3333-3333-000000000003', '11111111-1111-1111-1111-111111111111', '10% OFF Complete Glasses', '10% discount on complete frame + anti-glare lens package.', 'percentage_discount', 0, 10.0, 149900, 50000, 200, 15.0, TRUE, 'both', '10% off up to ₹500 on total eyewear bill exceeding ₹1,499.', '#FF5149'),
  ('33333333-3333-3333-3333-000000000004', '11111111-1111-1111-1111-111111111111', '₹200 OFF Luxury Eyewear', 'Special ₹200 festive voucher on luxury designer frames and polarized sunglasses.', 'fixed_discount', 20000, 0, 199900, 20000, 100, 8.0, TRUE, 'both', 'Valid on minimum billing of ₹1,999.', '#681F2B'),
  ('33333333-3333-3333-3333-000000000005', '11111111-1111-1111-1111-111111111111', 'Free UV400 Sunglasses', 'Win a complimentary pair of premium UV400 protective trendy sunglasses!', 'free_product', 99900, 0, 0, 99900, 25, 2.0, TRUE, 'both', 'Choose from designated festive showcase selection in showroom.', '#D4AF37'),
  ('33333333-3333-3333-3333-000000000006', '11111111-1111-1111-1111-111111111111', 'Free Comprehensive Eye Checkup', 'Complimentary 14-step automated vision test and prescription check with senior optometrist.', 'free_service', 30000, 0, 0, 30000, 500, 0.0, TRUE, 'both', 'Includes digital retinal and refraction inspection.', '#FFF1CF')
ON CONFLICT (id) DO NOTHING;
