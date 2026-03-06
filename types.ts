
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
  SOLD = 'SOLD'
}

export interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface SessionItem {
  sku: string;
  quantity: number;
  status: ItemStatus;
}

export interface FittingSession {
  id: string;
  customerName: string;
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

export type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year';
