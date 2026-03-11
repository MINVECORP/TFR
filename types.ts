
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

export interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
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
  billingConfig: {
    type: 'global' | 'per_store';
    price: number;
    status: BillingStatus;
  };
}

export interface Store {
  id: string;
  brandId: string;
  name: string;
  location: string;
  adminId: string;
  config: StoreConfig;
  billing?: {
    plan: 'basic' | 'pro' | 'enterprise';
    status: BillingStatus;
    nextBillingDate: number;
    history: Invoice[];
    price: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface Customer {
  phone: string;
  countryCode: string;
  name?: string;
  history: {
    sessionId: string;
    fittingRoomId: number;
    itemsEntered: string[];
    itemsSold: string[];
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
}

export type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year';
