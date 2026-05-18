
import { Product, User, Role, Store, BillingStatus, Brand, AdRequest, Customer } from './types';

export const initialBrands: Brand[] = [
  {
    id: 'brand-1',
    name: 'Santiago Retail Group',
    ownerId: 'santi-maestro',
    logoUrl: 'https://images.unsplash.com/photo-1541140532154-b024d715b909?auto=format&fit=crop&q=80&w=200',
    billingConfig: {
      type: 'per_store',
      price: 150,
      status: BillingStatus.PAID
    }
  },
  {
    id: 'brand-2',
    name: 'Urban Wear',
    ownerId: 'santi-maestro',
    logoUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=200',
    billingConfig: {
      type: 'per_store',
      price: 120,
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
    id: 'user-corporate', 
    name: 'Admin Corporate', 
    email: 'minve.corporate@gmail.com', 
    password: '123456', 
    role: Role.SUPER_ADMIN 
  },
  { 
    id: 'demo-customer-user', 
    name: 'Cliente Demo', 
    email: '3001234567', 
    password: '', 
    role: Role.CUSTOMER 
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
    role: Role.STAFF,
    storeId: 'store-1'
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
    role: Role.STAFF,
    storeId: 'store-1'
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
    code: 'SANTI123',
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
    status: 'running',
    requestedAt: Date.now(),
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1000'
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    phone: '3001234567',
    name: 'Cliente Demo',
    countryCode: '+57',
    history: [
      {
        sessionId: 'prev-session-1',
        storeId: 'store-1',
        fittingRoomId: 2,
        timestamp: Date.now() - 86400000,
        itemsEntered: ['770123456-M', '770111222-S'],
        itemsSold: ['770123456-M'],
        itemsLeft: ['770111222-S']
      }
    ]
  }
];

export const initialProducts: Product[] = [
  { 
    id: 'p1',
    name: 'Camisa Lino Blanca', 
    category: 'Tops', 
    price: 45.00, 
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1000',
    variations: [
      { sku: '770123456-S', size: 'S', color: 'Blanco', stock: 20, isActive: true },
      { sku: '770123456-M', size: 'M', color: 'Blanco', stock: 15, isActive: true },
      { sku: '770123456-L', size: 'L', color: 'Blanco', stock: 15, isActive: true }
    ]
  },
  { 
    id: 'p2',
    name: 'Jean Slim Fit Azul', 
    category: 'Pantalones', 
    price: 60.00, 
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=1000',
    variations: [
      { sku: '770987654-30', size: '30', color: 'Azul', stock: 10, isActive: true },
      { sku: '770987654-32', size: '32', color: 'Azul', stock: 10, isActive: true },
      { sku: '770987654-34', size: '34', color: 'Azul', stock: 10, isActive: true }
    ]
  },
  { 
    id: 'p3',
    name: 'Vestido Floral Verano', 
    category: 'Vestidos', 
    price: 75.00, 
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=1000',
    variations: [
      { sku: '770111222-S', size: 'S', color: 'Flores Azules', stock: 10, isActive: true },
      { sku: '770111222-M', size: 'M', color: 'Flores Azules', stock: 10, isActive: true },
      { sku: '770111233-S', size: 'S', color: 'Flores Rojas', stock: 5, isActive: true },
      { sku: '770111233-M', size: 'M', color: 'Flores Rojas', stock: 8, isActive: true }
    ]
  },
  {
    id: 'p4',
    name: 'Chaqueta Denim Classic',
    category: 'Tops',
    price: 85.00,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=1000',
    variations: [
      { sku: '770222333-M', size: 'M', color: 'Denim', stock: 12, isActive: true },
      { sku: '770222333-L', size: 'L', color: 'Denim', stock: 8, isActive: true }
    ]
  },
  {
    id: 'p5',
    name: 'Pantalón Chino Beige',
    category: 'Pantalones',
    price: 55.00,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1624373665920-3162955e568a?auto=format&fit=crop&q=80&w=1000',
    variations: [
      { sku: '770333444-32', size: '32', color: 'Beige', stock: 15, isActive: true },
      { sku: '770333444-34', size: '34', color: 'Beige', stock: 15, isActive: true }
    ]
  },
  {
    id: 'p6',
    name: 'Blusa Seda Negra',
    category: 'Tops',
    price: 50.00,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1564252629749-43a046256864?auto=format&fit=crop&q=80&w=1000',
    variations: [
      { sku: '770444555-S', size: 'S', color: 'Negro', stock: 10, isActive: true },
      { sku: '770444555-M', size: 'M', color: 'Negro', stock: 10, isActive: true }
    ]
  }
];
