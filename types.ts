
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  STORE_ADMIN = 'STORE_ADMIN',
  STAFF = 'STAFF'
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  TRANSFERRED = 'TRANSFERRED'
}

export enum ItemStatus {
  IN = 'IN',
  OUT = 'OUT',
  SOLD = 'SOLD',
  MISSING = 'MISSING'
}

export enum ItemExitDestination {
  RELOCATION = 'RELOCATION',
  PURCHASE = 'PURCHASE',
  MISSING = 'MISSING'
}

export interface ProductVariation {
  sku: string;
  size: string;
  color: string;
  stock: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  variations: ProductVariation[];
}

export enum BillingStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  TRIAL = 'TRIAL'
}

export interface Invoice {
  id: string;
  amount: number;
  date: number;
  status: BillingStatus;
  dueDate: number;
  usageDetails?: {
    sessions: number;
    itemsProcessed: number;
  };
}

export interface Brand {
  id: string;
  name: string;
  ownerId: string;
  logoUrl?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  billingConfig: {
    type: 'global' | 'per_store';
    price: number;
    status: BillingStatus;
  };
}

export type PlanType = 'basic' | 'pro' | 'enterprise' | 'growth';

export interface Store {
  id: string;
  brandId: string;
  name: string;
  location: string;
  adminId: string;
  config: StoreConfig;
  code: string;
  billing?: {
    plan: PlanType;
    status: BillingStatus;
    nextBillingDate: number;
    history: Invoice[];
    price: number;
    successFeePercentage?: number; // For Growth plan (1-3%)
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  storeId?: string;
  isFirstLogin?: boolean;
}

export interface Customer {
  id: string; // Internal ID for stores to see
  phone: string; // Hidden from store view
  countryCode: string;
  name?: string; // Hidden from store view
  history: {
    sessionId: string;
    fittingRoomId: number;
    itemsEntered: string[];
    itemsSold: string[];
    itemsLeft: string[];
    timestamp: number;
  }[];
}

export interface StoreConfig {
  fittingRoomsCount: number;
}

export interface SessionItem {
  sku: string;
  quantity: number;
  status: ItemStatus;
  exitDestination?: ItemExitDestination;
}

export interface FittingSession {
  id: string;
  customerPhone: string;
  customerName?: string;
  fittingRoomId: number;
  workerId: string;
  status: SessionStatus;
  items: SessionItem[];
  startTime: number;
  endTime?: number;
}

export interface InventoryLog {
  id: string;
  sku: string;
  action: 'tried_on' | 'sold';
  timestamp: number;
  workerId: string;
}

export interface AdRequest {
  id: string;
  brandId: string;
  storeId: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'running' | 'completed' | 'rejected';
  requestedAt: number;
  imageUrl?: string;
  externalLink?: string;
  type?: 'banner' | 'sms';
  smsType?: 'not_purchased' | 'cross_sell' | 'promotion';
}

export interface InventoryAlert {
  id: string;
  sku: string;
  productName: string;
  storeId: string;
  workerId: string;
  workerName: string;
  timestamp: number;
  isRead: boolean;
  type: 'missing';
}

export interface SmartCampaign {
  id: string;
  storeId: string;
  event: 'abandonment' | 'purchase' | 'out_of_stock';
  action: 'discount_coupon' | 'complementary_suggestion' | 'back_in_stock_alert';
  waitTimeHours: number;
  requirement?: string; // e.g., "price > 50"
  discountPercent?: number;
  isActive: boolean;
}

export interface SMSCampaign {
  id: string;
  sessionId: string;
  customerId: string; // phone number
  storeId: string;
  type: 'retargeting' | 'urgency' | 'cross_sell';
  sku: string;
  message: string;
  sentAt: number;
  status: 'sent' | 'failed';
  tracking?: {
    clicks: number;
    conversions: number;
    revenue: number;
    lastClickAt?: number;
    conversionAt?: number;
  };
  shortUrl: string;
  couponCode?: string;
  isConverted: boolean;
}

export interface MarketingMetrics {
  totalSent: number;
  totalClicks: number;
  totalConversions: number;
  recoveredRevenue: number;
  costPerAcquisition: number;
  roi: number;
}

export type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year';
