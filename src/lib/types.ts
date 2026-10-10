export type UserRole = 'customer' | 'staff' | 'admin';

export type RewardType = 
  | 'fixed_discount' 
  | 'percentage_discount' 
  | 'free_product' 
  | 'free_service' 
  | 'custom';

export type AllocationMode = 
  | 'weighted_random' 
  | 'fixed_inventory' 
  | 'fixed_reward';

export type ApplicableGame = 
  | 'spin_wheel' 
  | 'mystery_box' 
  | 'both';

export type VoucherStatus = 
  | 'issued' 
  | 'redeemed' 
  | 'expired' 
  | 'cancelled';

export type FestivalTheme = 'navratri' | 'diwali' | 'holi';

export interface UserProfile {
  id: string;
  mobile: string;
  fullName: string;
  role: UserRole;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  slug: string;
  name: string;
  description: string;
  theme: FestivalTheme;
  startDate: string; // ISO
  endDate: string; // ISO
  isActive: boolean;
  spinWheelEnabled: boolean;
  mysteryBoxesEnabled: boolean;
  spinLimitPerUser: number;
  boxLimitPerUser: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  rewardType: RewardType;
  monetaryValuePaise: number; // e.g. 5000 = ₹50
  discountPercentage: number; // e.g. 10
  minPurchasePaise: number;
  maxDiscountPaise: number;
  totalInventory: number;
  reservedInventory: number;
  issuedCount: number;
  redeemedCount: number;
  probabilityPercent: number; // e.g. 25.0
  isActive: boolean;
  applicableGame: ApplicableGame;
  terms: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  displayOrder: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  theme?: FestivalTheme;
  createdAt: string;
}

export interface GamePlay {
  id: string;
  userId: string;
  campaignId: string;
  gameType: 'spin_wheel' | 'mystery_box';
  rewardId: string;
  metadata?: Record<string, unknown>;
  playedAt: string;
}

export interface Voucher {
  id: string;
  voucherCode: string;
  userId: string;
  customerName: string;
  customerMobile: string;
  rewardId: string;
  rewardName: string;
  rewardType: RewardType;
  rewardValueDisplay: string;
  terms: string;
  campaignId: string;
  campaignName: string;
  gamePlayId: string;
  issueDate: string;
  expiryDate: string;
  status: VoucherStatus;
  qrToken: string;
  redeemedAt?: string;
  redeemedByStaffId?: string;
  billReference?: string;
  purchaseAmountPaise?: number;
  createdAt: string;
}

export interface RedemptionRecord {
  id: string;
  voucherId: string;
  voucherCode: string;
  customerName: string;
  rewardName: string;
  staffId: string;
  staffName: string;
  billReference?: string;
  purchaseAmountPaise?: number;
  redeemedAt: string;
  showroomLocation: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  timestamp: string;
}

export interface SessionUser {
  id: string;
  mobile: string;
  fullName: string;
  role: UserRole;
}
