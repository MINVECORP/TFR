
import { Product, User, Role, Store, BillingStatus, Brand, AdRequest } from './types';

export const initialBrands: Brand[] = [
  {
    id: 'brand-1',
    name: 'Santiago Retail Group',
    ownerId: 'santi-maestro',
    billingConfig: {
      type: 'per_store',
      price: 150,
      status: BillingStatus.PAID
    }
  }
];

export const initialUsers: User[] = [
  // Usuario Santiago - Acceso Multi-Portal
  { 
    id: 'santi-maestro', 
    name: 'Santiago (Admin)', 
    email: 'santiago@minve.co', 
    password: '123456', 
    role: Role.SUPER_ADMIN 
  },
  { 
    id: 'santi-gerente', 
    name: 'Santiago (Gerencia)', 
    email: 'santiago@minve.co', 
    password: '123456', 
    role: Role.STORE_ADMIN 
  },
  { 
    id: 'santi-staff', 
    name: 'Santiago (Staff)', 
    email: 'santiago@minve.co', 
    password: '123456', 
    role: Role.STAFF 
  },
  // Usuarios Base
  { 
    id: '1', 
    name: 'Admin Plataforma', 
    email: 'admin@fittingpro.com', 
    password: 'admin123', 
    role: Role.SUPER_ADMIN 
  },
  { 
    id: '2', 
    name: 'Gerente Tienda A', 
    email: 'tienda_a@fittingpro.com', 
    password: 'tienda123', 
    role: Role.STORE_ADMIN 
  },
  { 
    id: '4', 
    name: 'Staff Piso 1', 
    email: 'staff1@fittingpro.com', 
    password: 'staff123', 
    role: Role.STAFF 
  }
];

export const initialStores: Store[] = [
  {
    id: 'store-1',
    brandId: 'brand-1',
    name: 'Sede Central Santiago',
    location: 'Calle Principal 123, Bogotá',
    adminId: 'santi-gerente',
    config: { fittingRoomsCount: 10 },
    billing: {
      plan: 'enterprise',
      status: BillingStatus.PAID,
      nextBillingDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      history: [],
      price: 150
    }
  }
];

export const initialAdRequests: AdRequest[] = [
  {
    id: 'ad-1',
    brandId: 'brand-1',
    storeId: 'store-1',
    title: 'Campaña Verano 2026',
    description: 'Promoción de vestidos de baño y ropa ligera.',
    status: 'pending',
    requestedAt: Date.now()
  }
];

export const initialProducts: Product[] = [
  { sku: '770123456', name: 'Camisa Lino Blanca', category: 'Tops', price: 45.00, stock: 50 },
  { sku: '770987654', name: 'Jean Slim Fit Azul', category: 'Pantalones', price: 60.00, stock: 30 },
  { sku: '770111222', name: 'Vestido Floral Verano', category: 'Vestidos', price: 75.00, stock: 20 },
  { sku: '770333444', name: 'Chaqueta Cuero Negra', category: 'Abrigos', price: 120.00, stock: 15 },
  { sku: '770555666', name: 'Camiseta Algodón Gris', category: 'Basicos', price: 25.00, stock: 100 }
];
