
import React, { useState, useMemo } from 'react';
import { User, Product, InventoryLog, FittingSession, TimeRange, Role, Customer, StoreConfig, Store, BillingStatus, Invoice, Brand, AdRequest, InventoryAlert, SessionStatus, ItemExitDestination, SMSCampaign, ItemStatus, SmartCampaign, MarketingMetrics } from '../types';
import { MarketingNotificationPreview } from './MarketingNotificationPreview';
import { TriggerWorkflow } from './TriggerWorkflow';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  User as UserIcon,
  Upload, 
  Search,
  ArrowUpRight,
  LogOut,
  ClipboardCheck,
  Clock,
  Crown,
  Briefcase,
  ShieldAlert,
  Settings,
  Building2,
  Store as StoreIcon,
  MapPin,
  Activity,
  Layers,
  History,
  ShieldCheck,
  Sparkles,
  Plus,
  Home,
  Smartphone,
  Trash2,
  DollarSign,
  ShoppingCart,
  X,
  MessageSquare,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle2,
  Megaphone,
  Download,
  PieChart as PieChartIcon,
  Menu,
  Bell,
  Check,
  AlertTriangle,
  ArrowRightLeft,
  ArrowLeft
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line } from 'recharts';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  logs: InventoryLog[];
  sessions: FittingSession[];
  storeConfig: StoreConfig;
  setStoreConfig: React.Dispatch<React.SetStateAction<StoreConfig>>;
  customers: Customer[];
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  adRequests: AdRequest[];
  setAdRequests: React.Dispatch<React.SetStateAction<AdRequest[]>>;
  inventoryAlerts: InventoryAlert[];
  setInventoryAlerts: React.Dispatch<React.SetStateAction<InventoryAlert[]>>;
  smsCampaigns: SMSCampaign[];
  setSmsCampaigns: React.Dispatch<React.SetStateAction<SMSCampaign[]>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, onLogout, products, setProducts, logs, sessions, storeConfig, setStoreConfig, customers, users, setUsers, stores, setStores, brands, setBrands, adRequests, setAdRequests, inventoryAlerts, setInventoryAlerts, smsCampaigns, setSmsCampaigns
}) => {
  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  
  // Tabs diferenciadas por rol
  const [activeTab, setActiveTab] = useState<string>(isSuperAdmin ? 'global' : 'overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [showCreateBrand, setShowCreateBrand] = useState(false);
  const [showCreateSmartCampaign, setShowCreateSmartCampaign] = useState(false);
  const [showAdRequestModal, setShowAdRequestModal] = useState(false);
  const [editingStoreBilling, setEditingStoreBilling] = useState<Store | null>(null);
  const [newStore, setNewStore] = useState({ name: '', location: '', adminEmail: '', plan: 'pro' as const, brandId: '' });
  const [newBrand, setNewBrand] = useState({ name: '', billingType: 'per_store' as const, price: 150 });
  const [newAdRequest, setNewAdRequest] = useState({ title: '', description: '', storeId: '', imageUrl: '' });
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [showStoreSuccess, setShowStoreSuccess] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    isActive: true,
    variations: []
  });
  const [smsStatus, setSmsStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedStoreIdForDetail, setSelectedStoreIdForDetail] = useState<string | null>(null);

  const currentStore = stores.find(s => s.adminId === user.id) || stores[0];

  const [smartCampaigns, setSmartCampaigns] = useState<SmartCampaign[]>([
    {
      id: '1',
      storeId: currentStore?.id || '1',
      event: 'abandonment',
      action: 'discount_coupon',
      waitTimeHours: 2,
      isActive: true,
      requirement: 'price > 50',
      discountPercent: 10
    },
    {
      id: '2',
      storeId: currentStore?.id || '1',
      event: 'abandonment',
      action: 'discount_coupon',
      waitTimeHours: 48,
      isActive: true,
      requirement: 'price > 100',
      discountPercent: 15
    },
    {
      id: '3',
      storeId: currentStore?.id || '1',
      event: 'purchase',
      action: 'complementary_suggestion',
      waitTimeHours: 24,
      isActive: true
    }
  ]);

  const marketingMetrics: MarketingMetrics = useMemo(() => ({
    totalSent: 1240,
    totalClicks: 308,
    totalConversions: 45,
    recoveredRevenue: 4520,
    costPerAcquisition: 0.05,
    roi: 15.2
  }), []);

  const [newSmartCampaign, setNewSmartCampaign] = useState<Partial<SmartCampaign>>({
    event: 'abandonment',
    action: 'discount_coupon',
    waitTimeHours: 2,
    isActive: true
  });

  const [selectedScenario, setSelectedScenario] = useState<'retargeting' | 'urgency' | 'cross_selling'>('retargeting');
  const [recoveredSales, setRecoveredSales] = useState<any[]>([]);

  const scenarios = {
    retargeting: {
      title: "¡Vuelve por lo que amas! ✨",
      message: `Te veías genial con el Vestido Floral en ${currentStore?.name || 'Perchero Digital'}. ¿Te faltó un empujoncito? Llévatelo hoy con 10% OFF usando el código PROBA15 aquí: pd.go/xyz123`,
      buttonText: "Comprar Ahora",
      image: "https://images.unsplash.com/photo-1539109132384-361555754525?auto=format&fit=crop&w=300&q=80",
      coupon: "PROBA15"
    },
    urgency: {
      title: "¡Últimas unidades! 😱",
      message: `Quedan pocas unidades de tu Vestido Floral en tu talla. No dejes que se agote. Muestra el código PROBA22 en caja o usa este link: pd.go/xyz123`,
      buttonText: "Ver Stock",
      image: "https://images.unsplash.com/photo-1539109132384-361555754525?auto=format&fit=crop&w=300&q=80",
      coupon: "PROBA22"
    },
    cross_selling: {
      title: "Completa el Look 👗",
      message: `Esperamos que disfrutes tu compra. Para completar tu look, usa el código PROBA88 aquí: pd.go/abc456`,
      buttonText: "Ver Accesorios",
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80",
      coupon: "PROBA88"
    }
  };

  const handleCreateSmartCampaign = () => {
    if (!newSmartCampaign.event || !newSmartCampaign.action) return;
    
    const campaign: SmartCampaign = {
      id: Math.random().toString(36).substr(2, 9),
      storeId: currentStore?.id || '1',
      event: newSmartCampaign.event as 'abandonment' | 'purchase',
      action: newSmartCampaign.action as 'discount_coupon' | 'complementary_suggestion',
      waitTimeHours: newSmartCampaign.waitTimeHours || 2,
      isActive: true,
      requirement: newSmartCampaign.requirement,
      discountPercent: newSmartCampaign.discountPercent
    };
    
    setSmartCampaigns([...smartCampaigns, campaign]);
    setShowCreateSmartCampaign(false);
    setNewSmartCampaign({
      event: 'abandonment',
      action: 'discount_coupon',
      waitTimeHours: 2,
      isActive: true
    });
  };

  const simulateConversion = async (type: 'Online' | 'Física') => {
    try {
      const response = await fetch('/api/marketing/pixel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: smartCampaigns[0]?.id || 'test-campaign',
          customerId: 'test-customer',
          orderId: `ORD-${Date.now()}`,
          amount: Math.floor(Math.random() * 200) + 50,
          type
        })
      });
      if (response.ok) {
        const salesRes = await fetch('/api/marketing/sales');
        const salesData = await salesRes.json();
        setRecoveredSales(salesData);
        setSmsStatus({ success: true, message: 'Conversión registrada exitosamente' });
      }
    } catch (error) {
      console.error("Error simulating conversion:", error);
    }
  };

  const storeAlerts = useMemo(() => 
    inventoryAlerts.filter(a => a.storeId === currentStore?.id),
    [inventoryAlerts, currentStore?.id]
  );

  const unreadStoreAlertsCount = useMemo(() => 
    storeAlerts.filter(a => !a.isRead).length,
    [storeAlerts]
  );

  const storeStats = useMemo(() => {
    const closedSessions = sessions.filter(s => s.status === SessionStatus.CLOSED);
    let missing = 0;
    let relocation = 0;
    let purchase = 0;

    closedSessions.forEach(s => {
      s.items.forEach(item => {
        if (item.exitDestination === ItemExitDestination.MISSING) missing += item.quantity;
        if (item.exitDestination === ItemExitDestination.RELOCATION) relocation += item.quantity;
        if (item.exitDestination === ItemExitDestination.PURCHASE) purchase += item.quantity;
      });
    });

    return { missing, relocation, purchase };
  }, [sessions]);

  const handleDownloadInventoryReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Reporte de Inventario - FittingRoom Pro', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Sede: ${currentStore?.name || 'Sede Principal'}`, 14, 36);

    const tableData = products.map(p => [
      p.name,
      p.sku,
      p.category,
      `$${p.price}`,
      `${p.stock} Uds`
    ]);

    (doc as any).autoTable({
      startY: 45,
      head: [['Producto', 'SKU', 'Categoría', 'Precio', 'Stock']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillStyle: [79, 70, 229] }, // Indigo-600
    });

    doc.save(`inventario_${currentStore?.name || 'tienda'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Colores temáticos
  const theme = isSuperAdmin 
    ? { primary: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/20', hover: 'hover:bg-amber-500', shadow: 'shadow-amber-500/20' }
    : { primary: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-500/20', hover: 'hover:bg-indigo-600', shadow: 'shadow-indigo-500/20' };

  // Datos procesados
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const activeSessions = sessions.filter(s => s.status === 'ACTIVE').length;
    const sales = logs.filter(l => l.action === 'sold').length;
    const conversion = totalSessions > 0 ? ((sales / totalSessions) * 100).toFixed(1) : '0';
    
    return { totalSessions, activeSessions, sales, conversion };
  }, [sessions, logs]);

  const topProducts = useMemo(() => {
    const triedOnLogs = logs.filter(l => l.action === 'tried_on');
    const productCounts: Record<string, number> = {};
    triedOnLogs.forEach(l => {
      productCounts[l.productName] = (productCounts[l.productName] || 0) + 1;
    });
    return Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 5);
  }, [logs]);

  const billingTrend = useMemo(() => {
    return [
      { month: 'Ene', cost: 45 },
      { month: 'Feb', cost: 52 },
      { month: 'Mar', cost: 48 },
      { month: 'Abr', cost: 61 },
      { month: 'May', cost: 55 },
      { month: 'Jun', cost: 64 },
    ];
  }, []);

  const categorySales = useMemo(() => {
    const soldLogs = logs.filter(l => l.action === 'sold');
    const categoryCounts: Record<string, number> = {};
    soldLogs.forEach(l => {
      const product = products.find(p => p.name === l.productName);
      const category = product?.category || 'Otros';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    // If no sales, add some dummy data for visual
    if (Object.keys(categoryCounts).length === 0) {
      return [
        { name: 'Tops', value: 40 },
        { name: 'Pantalones', value: 30 },
        { name: 'Vestidos', value: 20 },
        { name: 'Otros', value: 10 },
      ];
    }
    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  }, [logs, products]);

  const weeklyPerformance = useMemo(() => {
    return [
      { day: 'Lun', visitas: 45, ventas: 12 },
      { day: 'Mar', visitas: 52, ventas: 15 },
      { day: 'Mie', visitas: 48, ventas: 10 },
      { day: 'Jue', visitas: 61, ventas: 22 },
      { day: 'Vie', visitas: 85, ventas: 35 },
      { day: 'Sab', visitas: 120, ventas: 50 },
      { day: 'Dom', visitas: 90, ventas: 40 },
    ];
  }, []);

  const COLORS = ['#6366f1', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleCreateStore = () => {
    const adminId = Math.random().toString(36).substr(2, 9);
    
    // Crear el usuario de gerencia
    const newAdmin: User = {
      id: adminId,
      name: `Gerente ${newStore.name}`,
      email: newStore.adminEmail,
      password: 'password123', // Contraseña por defecto
      role: Role.STORE_ADMIN
    };

    const store: Store = {
      id: Math.random().toString(36).substr(2, 9),
      brandId: newStore.brandId || (brands[0]?.id || ''),
      name: newStore.name,
      location: newStore.location,
      adminId: adminId,
      config: { fittingRoomsCount: 5 },
      code: newStore.name.substring(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900),
      billing: {
        plan: newStore.plan,
        status: BillingStatus.TRIAL,
        nextBillingDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        history: [],
        price: 49
      }
    };

    setUsers(prev => [...prev, newAdmin]);
    setStores([...stores, store]);
    setShowCreateStore(false);
    setNewStore({ name: '', location: '', adminEmail: '', plan: 'pro', brandId: '' });
    setShowStoreSuccess(true);
    setTimeout(() => setShowStoreSuccess(false), 4000);
  };

  const handleCreateBrand = () => {
    const brand: Brand = {
      id: Math.random().toString(36).substr(2, 9),
      name: newBrand.name,
      ownerId: user.id,
      billingConfig: {
        type: newBrand.billingType,
        price: newBrand.price,
        status: BillingStatus.PAID
      }
    };
    setBrands([...brands, brand]);
    setShowCreateBrand(false);
    setNewBrand({ name: '', billingType: 'per_store', price: 150 });
  };

  const handleCreateAdRequest = () => {
    const ad: AdRequest = {
      id: Math.random().toString(36).substr(2, 9),
      brandId: brands.find(b => b.ownerId === user.id)?.id || brands[0]?.id || '',
      storeId: newAdRequest.storeId || stores[0]?.id || '',
      title: newAdRequest.title,
      description: newAdRequest.description,
      status: isSuperAdmin ? 'running' : 'pending',
      requestedAt: Date.now(),
      imageUrl: newAdRequest.imageUrl || `https://picsum.photos/seed/${Math.random()}/800/200`,
      externalLink: (newAdRequest as any).externalLink,
      type: (newAdRequest as any).type as 'banner' | 'sms',
      smsType: (newAdRequest as any).smsType as 'not_purchased' | 'cross_sell' | 'promotion'
    };
    setAdRequests([...adRequests, ad]);
    setShowAdRequestModal(false);
    setNewAdRequest({ title: '', description: '', storeId: '', imageUrl: '', ...({ externalLink: '', type: 'banner', smsType: 'promotion' } as any) });
  };

  const handleUpdateBilling = (storeId: string, updates: Partial<Store['billing']>) => {
    setStores(prev => prev.map(s => s.id === storeId ? { ...s, billing: { ...s.billing, ...updates } } : s));
    setEditingStoreBilling(null);
  };

  const handleGenerateInvoice = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    const amount = store?.billing?.price || 49;
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      amount,
      date: Date.now(),
      status: BillingStatus.PENDING,
      dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      usageDetails: {
        sessions: sessions.filter(s => s.status === 'CLOSED').length,
        itemsProcessed: logs.length
      }
    };
    
    setStores(prev => prev.map(s => {
      if (s.id === storeId) {
        return {
          ...s,
          billing: {
            ...s.billing,
            history: [newInvoice, ...s.billing.history]
          }
        };
      }
      return s;
    }));
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const newProducts: Product[] = data.map((row: any) => {
          const sku = String(row.SKU || row.sku || Math.random().toString(36).substr(2, 6).toUpperCase());
          return {
            id: Math.random().toString(36).substr(2, 9),
            name: String(row.Nombre || row.name || row.Name || 'Producto Sin Nombre'),
            category: String(row.Categoria || row.category || row.Category || 'General'),
            price: Number(row.Precio || row.price || row.Price || 0),
            imageUrl: String(row.Imagen || row.image || row.Image || 'https://picsum.photos/seed/product/200'),
            isActive: true,
            variations: [{
              sku,
              size: String(row.Talla || row.size || 'N/A'),
              color: String(row.Color || row.color || 'N/A'),
              stock: Number(row.Stock || row.stock || row.Cantidad || 0),
              isActive: true
            }]
          };
        });

        setProducts(prev => [...prev, ...newProducts]);
        setShowUploadSuccess(true);
        setTimeout(() => setShowUploadSuccess(false), 3000);
      } catch (error) {
        console.error('Error parsing Excel:', error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveProduct = () => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
    } else {
      const product: Product = {
        ...newProduct as Product,
        id: `p-${Date.now()}`
      };
      setProducts(prev => [...prev, product]);
    }
    setShowProductModal(false);
    setEditingProduct(null);
    setNewProduct({ name: '', category: '', price: 0, isActive: true, variations: [] });
  };

  const toggleProductStatus = (productId: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, isActive: !p.isActive } : p));
  };

  const toggleVariationStatus = (productId: string, sku: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          variations: p.variations.map(v => v.sku === sku ? { ...v, isActive: !v.isActive } : v)
        };
      }
      return p;
    }));
  };

  const handleSendSMS = async (customerId: string, storeId: string, type: 'retargeting' | 'cross_sell', sku: string, message: string) => {
    try {
      setSmsStatus({ success: true, message: 'Enviando SMS...' });
      
      const store = stores.find(s => s.id === storeId);
      const brand = brands.find(b => b.id === store?.brandId);
      const brandTpoa = brand?.name?.replace(/[^a-zA-Z0-9]/g, '').substring(0, 11) || 'tienda';

      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: customerId, // customerId is the phone number in this context
          message,
          tpoa: brandTpoa,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const newCampaign: SMSCampaign = {
          id: `SMS-${Date.now()}`,
          sessionId: 'manual-trigger',
          customerId,
          storeId,
          type,
          sku,
          message,
          sentAt: Date.now(),
          status: 'sent',
          shortUrl: `pd.go/${Math.random().toString(36).substring(7)}`,
          isConverted: false
        };
        setSmsCampaigns(prev => [...prev, newCampaign]);
        setSmsStatus({ success: true, message: '¡SMS enviado con éxito!' });
        setTimeout(() => setSmsStatus(null), 3000);
      } else {
        throw new Error(data.error || 'Error al enviar SMS');
      }
    } catch (error: any) {
      console.error('Error enviando SMS:', error);
      setSmsStatus({ success: false, message: `Error: ${error.message}` });
      setTimeout(() => setSmsStatus(null), 5000);
    }
  };


  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* MODAL CREAR TIENDA */}
      {showCreateStore && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowCreateStore(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900">Nueva Sede</h3>
              <button onClick={() => setShowCreateStore(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Marca Asociada</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-500 rounded-2xl font-bold outline-none transition-all appearance-none"
                  value={newStore.brandId}
                  onChange={e => setNewStore({...newStore, brandId: e.target.value})}
                >
                  <option value="">Seleccionar Marca</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Nombre de la Tienda / Sede</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-500 rounded-2xl font-bold outline-none transition-all"
                  placeholder="Ej: Tienda Norte"
                  value={newStore.name}
                  onChange={e => setNewStore({...newStore, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Ubicación / Dirección</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-500 rounded-2xl font-bold outline-none transition-all"
                  placeholder="Ej: Av. Principal 123"
                  value={newStore.location}
                  onChange={e => setNewStore({...newStore, location: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Correo Electrónico Gerencia</label>
                <input 
                  type="email" 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-500 rounded-2xl font-bold outline-none transition-all"
                  placeholder="gerente@tienda.com"
                  value={newStore.adminEmail}
                  onChange={e => setNewStore({...newStore, adminEmail: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Plan de Facturación</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-500 rounded-2xl font-bold outline-none transition-all appearance-none"
                  value={newStore.plan}
                  onChange={e => setNewStore({...newStore, plan: e.target.value as any})}
                >
                  <option value="basic">Plan Básico (Hasta 3 probadores)</option>
                  <option value="pro">Plan Pro (Hasta 10 probadores)</option>
                  <option value="enterprise">Plan Enterprise (Ilimitado)</option>
                </select>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider leading-relaxed">
                  Nota: Se creará automáticamente un usuario de Gerencia con la contraseña por defecto: <span className="font-black">password123</span>
                </p>
              </div>
              
              <button 
                onClick={handleCreateStore}
                disabled={!newStore.name || !newStore.location || !newStore.adminEmail}
                className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-200 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
              >
                Confirmar Alta de Sede
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GESTIÓN FACTURACIÓN */}
      {editingStoreBilling && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setEditingStoreBilling(null)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Gestionar Facturación</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{editingStoreBilling.name}</p>
              </div>
              <button onClick={() => setEditingStoreBilling(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Estado de Cuenta</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(BillingStatus).map(status => (
                    <button 
                      key={status}
                      onClick={() => handleUpdateBilling(editingStoreBilling.id, { status })}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        editingStoreBilling.billing.status === status 
                          ? 'bg-amber-500 border-amber-500 text-white shadow-lg' 
                          : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Plan de Suscripción</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-500 rounded-2xl font-bold outline-none transition-all appearance-none"
                  value={editingStoreBilling.billing.plan}
                  onChange={e => handleUpdateBilling(editingStoreBilling.id, { plan: e.target.value as any })}
                >
                  <option value="basic">Plan Básico</option>
                  <option value="pro">Plan Pro</option>
                  <option value="enterprise">Plan Enterprise</option>
                </select>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Historial Reciente</label>
                  <button 
                    onClick={() => handleGenerateInvoice(editingStoreBilling.id)}
                    className="text-[10px] font-black text-amber-500 uppercase tracking-widest hover:underline"
                  >
                    Generar Factura
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {editingStoreBilling.billing.history.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400 italic">Sin facturas previas</p>
                  ) : (
                    editingStoreBilling.billing.history.map(inv => (
                      <div key={inv.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-[10px] font-black text-slate-800">#{inv.id.split('-')[1]}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase">{new Date(inv.date).toLocaleDateString()}</p>
                          {inv.usageDetails && (
                            <p className="text-[7px] text-slate-400 font-medium mt-0.5">
                              {inv.usageDetails.sessions} Sesiones | {inv.usageDetails.itemsProcessed} Prendas
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-900">${inv.amount}</p>
                          <p className={`text-[8px] font-black uppercase ${inv.status === BillingStatus.PAID ? 'text-emerald-500' : 'text-amber-500'}`}>{inv.status}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTORIAL CLIENTE */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Historial de Cliente</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {selectedCustomer.name || 'Sin Nombre'} • {selectedCustomer.phone}
                </p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="space-y-8">
              {selectedCustomer.history.slice().reverse().map((session, idx) => (
                <div key={idx} className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Clock className="w-4 h-4 text-indigo-500" />
                      </div>
                      <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                        {new Date(session.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Probador #{session.fittingRoomId}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        Prendas Compradas
                      </h4>
                      <div className="space-y-2">
                        {session.itemsSold.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic">Ninguna prenda comprada</p>
                        ) : (
                          session.itemsSold.map(sku => {
                            const product = products.find(p => p.sku === sku);
                            return (
                              <div key={sku} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100">
                                <img src={product?.image} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                                <div>
                                  <p className="text-[10px] font-bold text-slate-800">{product?.name || sku}</p>
                                  <p className="text-[8px] text-slate-400 uppercase font-black">{product?.category}</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <X className="w-3 h-3" />
                        Prendas Dejadas
                      </h4>
                      <div className="space-y-2">
                        {(!session.itemsLeft || session.itemsLeft.length === 0) ? (
                          <p className="text-[10px] text-slate-400 italic">Ninguna prenda dejada</p>
                        ) : (
                          session.itemsLeft.map(sku => {
                            const product = products.find(p => p.sku === sku);
                            return (
                              <div key={sku} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 opacity-75">
                                <img src={product?.image} className="w-8 h-8 rounded-lg object-cover grayscale" referrerPolicy="no-referrer" />
                                <div>
                                  <p className="text-[10px] font-bold text-slate-800">{product?.name || sku}</p>
                                  <p className="text-[8px] text-slate-400 uppercase font-black">{product?.category}</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR DIFERENCIADO */}
      <aside className={`fixed inset-y-0 left-0 z-50 lg:relative lg:flex w-80 flex-col transition-all duration-500 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isSuperAdmin ? 'bg-slate-950 shadow-[20px_0_60px_rgba(0,0,0,0.4)]' : 'bg-slate-900 shadow-xl'}`}>
        <div className="p-8 h-full flex flex-col">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div className={`${theme.primary} p-3 rounded-2xl shadow-2xl transform hover:rotate-6 transition-all`}>
                    {isSuperAdmin ? <Crown className="w-6 h-6 text-white" /> : <StoreIcon className="w-6 h-6 text-white" />}
                 </div>
                 <div>
                   <h1 className="text-xl font-black text-white tracking-tight leading-none">FittingPro</h1>
                   <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 ${theme.text}`}>
                      {isSuperAdmin ? 'Plataforma Global' : 'Gestor Local'}
                   </p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
                  title="Volver al Inicio"
                >
                  <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
           </div>
           
           <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
             {isSuperAdmin ? (
               <>
                 <SidebarItem active={activeTab === 'global'} onClick={() => { setActiveTab('global'); setIsSidebarOpen(false); }} icon={<Activity />} label="Visión Global" theme={theme} />
                 <SidebarItem active={activeTab === 'brands'} onClick={() => { setActiveTab('brands'); setIsSidebarOpen(false); }} icon={<Crown />} label="Marcas / Clientes" theme={theme} />
                 <SidebarItem active={activeTab === 'stores'} onClick={() => { setActiveTab('stores'); setIsSidebarOpen(false); }} icon={<Building2 />} label="Sedes / Tiendas" theme={theme} />
                 <SidebarItem active={activeTab === 'ads'} onClick={() => { setActiveTab('ads'); setIsSidebarOpen(false); }} icon={<Megaphone />} label="Publicidad" theme={theme} />
                 <SidebarItem active={activeTab === 'billing'} onClick={() => { setActiveTab('billing'); setIsSidebarOpen(false); }} icon={<CreditCard />} label="Facturación" theme={theme} />
                 <SidebarItem active={activeTab === 'customers'} onClick={() => { setActiveTab('customers'); setIsSidebarOpen(false); }} icon={<Users />} label="Clientes Global" theme={theme} />
                 <SidebarItem active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} icon={<Users />} label="Directorio Admin" theme={theme} />
                 <SidebarItem active={activeTab === 'security'} onClick={() => { setActiveTab('security'); setIsSidebarOpen(false); }} icon={<ShieldCheck />} label="Seguridad" theme={theme} />
               </>
             ) : (
               <>
                 <SidebarItem active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} icon={<BarChart3 />} label="Mi Tienda" theme={theme} />
                 <SidebarItem active={activeTab === 'inventory'} onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }} icon={<Package />} label="Control Stock" theme={theme} />
                 <SidebarItem active={activeTab === 'marketing'} onClick={() => { setActiveTab('marketing'); setIsSidebarOpen(false); }} icon={<TrendingUp />} label="Marketing Directo" theme={theme} />
                 <SidebarItem active={activeTab === 'ads'} onClick={() => { setActiveTab('ads'); setIsSidebarOpen(false); }} icon={<Megaphone />} label="Publicidad" theme={theme} />
                 <SidebarItem active={activeTab === 'customers'} onClick={() => { setActiveTab('customers'); setIsSidebarOpen(false); }} icon={<Users />} label="Clientes" theme={theme} />
                  <SidebarItem active={activeTab === 'staff'} onClick={() => { setActiveTab('staff'); setIsSidebarOpen(false); }} icon={<Users />} label="Mi Equipo" theme={theme} />
                 <SidebarItem active={activeTab === 'config'} onClick={() => { setActiveTab('config'); setIsSidebarOpen(false); }} icon={<Settings />} label="Configuración" theme={theme} />
                  <SidebarItem active={activeTab === 'billing'} onClick={() => { setActiveTab('billing'); setIsSidebarOpen(false); }} icon={<CreditCard />} label="Mi Factura" theme={theme} />
                  <SidebarItem active={activeTab === 'audit'} onClick={() => { setActiveTab('audit'); setIsSidebarOpen(false); }} icon={<History />} label="Arqueo Diario" theme={theme} />
                  <SidebarItem 
                    active={activeTab === 'alerts'} 
                    onClick={() => { 
                      setActiveTab('alerts'); 
                      setIsSidebarOpen(false);
                      setInventoryAlerts(prev => prev.map(a => a.storeId === currentStore?.id ? { ...a, isRead: true } : a));
                    }} 
                    icon={<Bell />} 
                    label="Alertas" 
                    theme={theme} 
                    badge={unreadStoreAlertsCount}
                  />
               </>
             )}
           </nav>

           <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-4 mb-8">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-2xl ${theme.primary}`}>
                   {user.name.charAt(0)}
                 </div>
                 <div>
                    <p className="text-sm font-black text-white">{user.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {isSuperAdmin ? 'Acceso Nivel 0' : 'Sede Regional 01'}
                    </p>
                 </div>
              </div>
              <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest">
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
           </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto w-full relative">
        {/* NOTIFICACIÓN SMS */}
        {smsStatus && (
          <div className={`fixed top-10 right-10 z-[100] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 animate-in slide-in-from-top-10 duration-500 ${
            smsStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              smsStatus.success ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}>
              {smsStatus.success ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <p className="text-sm font-black uppercase tracking-widest">{smsStatus.message}</p>
          </div>
        )}
        {/* Banner Publicitario Dinámico */}
        {activeTab !== 'ads' && adRequests.filter(ad => (ad.status === 'running' || ad.status === 'active') && (!ad.storeId || ad.storeId === currentStore?.id)).length > 0 && (
          <div className="px-4 sm:px-6 lg:px-10 pt-6">
            <div className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl shadow-indigo-200/50 h-32 sm:h-40">
              {adRequests.filter(ad => (ad.status === 'running' || ad.status === 'active') && (!ad.storeId || ad.storeId === currentStore?.id)).map((ad, idx) => (
                <div key={ad.id} className={`${idx === 0 ? 'block' : 'hidden'} w-full relative h-full overflow-hidden`}>
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.title} 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[8px] font-black text-amber-400 uppercase tracking-[0.3em]">Campaña Activa</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">{ad.title}</h2>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 sticky top-0 z-30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 bg-slate-100 rounded-xl text-slate-600"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className={`p-2 rounded-lg ${isSuperAdmin ? 'bg-amber-50' : 'bg-indigo-50'}`}>
                    {isSuperAdmin ? <Layers className="w-5 h-5 text-amber-600" /> : <MapPin className="w-5 h-5 text-indigo-600" />}
                </div>
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-none capitalize">
                      {activeTab.replace('_', ' ')}
                    </h2>
                    <p className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">
                      {isSuperAdmin ? 'Consola de Administración Central' : 'Panel de Control Local'}
                    </p>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 overflow-x-auto max-w-full no-scrollbar">
             {(['day', 'week', 'month'] as TimeRange[]).map(range => (
               <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 lg:px-6 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${timeRange === range ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {range.toUpperCase()}
               </button>
             ))}
          </div>
        </header>

        <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
          
          {/* VISTAS PARA SUPER ADMIN */}
          {isSuperAdmin && activeTab === 'global' && (
            <div className="space-y-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard label="Ventas Red" value={stats.sales.toString()} icon={<Activity />} theme="amber" />
                <StatCard label="Tiendas Activas" value={stores.length.toString()} icon={<Building2 />} theme="amber" />
                <StatCard label="Conversión Global" value={`${stats.conversion}%`} icon={<TrendingUp />} theme="amber" />
                <StatCard label="Alertas Sistema" value="0" icon={<ShieldAlert />} theme="emerald" />
              </div>
              
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                   <BarChart3 className="w-5 h-5 text-amber-500" />
                   Rendimiento Comparativo por Tienda
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stores.map(s => ({
                      name: s.name,
                      ventas: logs.filter(l => l.action === 'sold').length / stores.length, // Simulated
                      visitas: sessions.length / stores.length // Simulated
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <Tooltip />
                      <Bar dataKey="ventas" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={40} />
                      <Bar dataKey="visitas" fill="#cbd5e1" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {isSuperAdmin && activeTab === 'brands' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900">Gestión de Marcas</h3>
                <button 
                  onClick={() => setShowCreateBrand(true)}
                  className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-200 hover:bg-amber-600 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Marca
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brands.map(brand => (
                  <div key={brand.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-amber-500">
                        <Crown className="w-8 h-8" />
                      </div>
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black rounded-lg uppercase tracking-widest">
                        {brand.billingConfig.type === 'per_store' ? 'Por Sede' : 'Global'}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900">{brand.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium">ID: {brand.id}</p>
                    
                    <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sedes</p>
                        <p className="text-sm font-bold text-slate-700">{stores.filter(s => s.brandId === brand.id).length}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio Base</p>
                        <p className="text-sm font-bold text-slate-700">${brand.billingConfig.price}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setNewStore({...newStore, brandId: brand.id});
                          setShowCreateStore(true);
                        }}
                        className="w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all"
                      >
                        Añadir Sub-Sede
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Gestión de Publicidad</h3>
                  <p className="text-sm text-slate-400 font-medium">Solicitudes y campañas activas en la red de probadores</p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowAdRequestModal(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    <Megaphone className="w-4 h-4" />
                    {isSuperAdmin ? 'Nueva Pauta' : 'Solicitar Campaña'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-10 py-6">Campaña</th>
                      <th className="px-10 py-6">Marca / Sede</th>
                      <th className="px-10 py-6">Estado</th>
                      <th className="px-10 py-6">Fecha</th>
                      <th className="px-10 py-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-10 py-20 text-center text-slate-400 italic">No hay solicitudes de publicidad</td>
                      </tr>
                    ) : (
                      adRequests.map(ad => (
                        <tr key={ad.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{ad.title}</p>
                                <p className="text-[10px] text-slate-400 truncate max-w-xs">{ad.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <p className="text-xs font-black text-slate-600 uppercase tracking-widest">
                              {brands.find(b => b.id === ad.brandId)?.name || 'Marca'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {stores.find(s => s.id === ad.storeId)?.name || 'Global'}
                            </p>
                          </td>
                          <td className="px-10 py-6">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                              ad.status === 'running' || ad.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 
                              ad.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                            }`}>
                              {ad.status === 'running' ? 'En Curso' : 
                               ad.status === 'active' ? 'Activa' : 
                               ad.status === 'pending' ? 'Pendiente' : ad.status}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-sm text-slate-500">{new Date(ad.requestedAt).toLocaleDateString()}</td>
                          <td className="px-10 py-6 text-right">
                            {isSuperAdmin && ad.status === 'pending' && (
                              <button 
                                onClick={() => setAdRequests(prev => prev.map(a => a.id === ad.id ? {...a, status: 'running'} : a))}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                              >
                                Publicar
                              </button>
                            )}
                            {isSuperAdmin && ad.status === 'running' && (
                              <button 
                                onClick={() => setAdRequests(prev => prev.map(a => a.id === ad.id ? {...a, status: 'completed'} : a))}
                                className="px-4 py-2 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-300 transition-all"
                              >
                                Finalizar
                              </button>
                            )}
                            {!isSuperAdmin && (
                              <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                                <Settings className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {isSuperAdmin && activeTab === 'stores' && (
            <div className="space-y-6">
              {showStoreSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-500">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">¡Sede y Usuario de Gerencia creados exitosamente!</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {stores.map(s => (
                 <div key={s.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-amber-500/40 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-amber-500">
                          <StoreIcon className="w-8 h-8" />
                       </div>
                       <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest ${
                         s.billing.status === BillingStatus.PAID ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                       }`}>
                         {s.billing.status === BillingStatus.PAID ? 'Activa' : 'Trial / Pendiente'}
                       </span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900">{s.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium italic">{s.location}</p>
                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</p>
                          <p className="text-sm font-bold text-slate-700 uppercase">
                            {s.billing?.plan === 'growth' ? `Growth (${s.billing.successFeePercentage}%)` : (s.billing?.plan || 'Trial')}
                          </p>
                       </div>
                       <div className="flex gap-2">
                         <button 
                           onClick={() => setSelectedStoreIdForDetail(s.id)}
                           className="p-3 bg-indigo-50 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                           title="Ver detalle de sede"
                         >
                            <ArrowUpRight className="w-5 h-5" />
                         </button>
                         <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-amber-500 transition-colors">
                            <Settings className="w-5 h-5" />
                         </button>
                       </div>
                    </div>
                 </div>
               ))}
               <button 
                onClick={() => setShowCreateStore(true)}
                className="border-2 border-dashed border-slate-200 p-8 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 hover:border-amber-500 hover:text-amber-500 transition-all group min-h-[250px]"
               >
                  <Plus className="w-10 h-10 mb-4 transform group-hover:scale-110 transition-transform" />
                  <span className="font-black text-xs uppercase tracking-widest">Dar de alta nueva sede</span>
               </button>
              </div>
            </div>
          )}

          {isSuperAdmin && activeTab === 'billing' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recaudación Mensual Est.</p>
                  <h4 className="text-3xl font-black text-slate-900">${stores.length * 49}</h4>
                  <p className="text-xs text-emerald-500 font-bold mt-2">+12% vs mes anterior</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Facturas Pendientes</p>
                  <h4 className="text-3xl font-black text-rose-500">{stores.filter(s => s.billing.status === BillingStatus.OVERDUE).length}</h4>
                  <p className="text-xs text-slate-400 font-bold mt-2">Requieren atención</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sedes en Trial</p>
                  <h4 className="text-3xl font-black text-amber-500">{stores.filter(s => s.billing.status === BillingStatus.TRIAL).length}</h4>
                  <p className="text-xs text-slate-400 font-bold mt-2">Conversión a pago pronto</p>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900">Estado de Facturación por Sede</h3>
                  <button className="hidden sm:block text-xs font-black uppercase tracking-widest text-amber-500 hover:underline">Descargar Reporte Global</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 lg:px-10 py-6">Sede</th>
                        <th className="px-6 lg:px-10 py-6">Plan</th>
                        <th className="px-6 lg:px-10 py-6">Estado</th>
                        <th className="px-6 lg:px-10 py-6">Próximo Cobro</th>
                        <th className="px-6 lg:px-10 py-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stores.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 lg:px-10 py-6 font-bold text-slate-800 whitespace-nowrap">{s.name}</td>
                          <td className="px-6 lg:px-10 py-6 text-xs font-black uppercase text-slate-500">{s.billing.plan}</td>
                          <td className="px-6 lg:px-10 py-6">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                              s.billing.status === BillingStatus.PAID ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {s.billing.status}
                            </span>
                          </td>
                          <td className="px-6 lg:px-10 py-6 text-sm text-slate-500 whitespace-nowrap">{new Date(s.billing.nextBillingDate).toLocaleDateString()}</td>
                          <td className="px-6 lg:px-10 py-6 text-right">
                            <button 
                              onClick={() => setEditingStoreBilling(s)}
                              className="p-2 hover:bg-amber-50 text-slate-400 hover:text-amber-500 rounded-lg transition-all"
                            >
                              <Settings className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VISTAS PARA STORE ADMIN */}
          {!isSuperAdmin && activeTab === 'overview' && (
             <div className="space-y-10">
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                 <StatCard label="Visitas Hoy" value={stats.totalSessions.toString()} icon={<Users />} theme="indigo" />
                 <StatCard label="En Probador" value={stats.activeSessions.toString()} icon={<Clock />} theme="indigo" />
                 <StatCard label="Ventas Sede" value={stats.sales.toString()} icon={<Plus />} theme="emerald" />
                 <StatCard label="Conversión" value={`${stats.conversion}%`} icon={<TrendingUp />} theme="indigo" />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                 <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 flex items-center justify-between">
                   <div>
                     <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Faltantes</p>
                     <p className="text-3xl font-black text-rose-600">{storeStats.missing}</p>
                   </div>
                   <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                     <AlertTriangle className="w-6 h-6" />
                   </div>
                 </div>
                 <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-center justify-between">
                   <div>
                     <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Reubicación</p>
                     <p className="text-3xl font-black text-amber-600">{storeStats.relocation}</p>
                   </div>
                   <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                     <ArrowRightLeft className="w-6 h-6" />
                   </div>
                 </div>
                 <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                   <div>
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Ventas</p>
                     <p className="text-3xl font-black text-emerald-600">{storeStats.purchase}</p>
                   </div>
                   <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                     <Plus className="w-6 h-6" />
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                    <h3 className="text-xl font-black text-slate-900 mb-8">Uso de Probadores (Conversión por Sala)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Array.from({ length: storeConfig.fittingRoomsCount }).map((_, i) => {
                          const roomId = i + 1;
                          const roomHistory = customers.flatMap(c => c.history).filter(h => h.fittingRoomId === roomId);
                          const totalEntered = roomHistory.reduce((acc, h) => acc + h.itemsEntered.length, 0);
                          const totalSold = roomHistory.reduce((acc, h) => acc + h.itemsSold.length, 0);
                          const conversion = totalEntered > 0 ? Math.round((totalSold / totalEntered) * 100) : 0;
                          return { name: `Sala ${roomId}`, conversion, visitas: roomHistory.length };
                        })}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                          <Tooltip />
                          <Bar dataKey="conversion" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-xl text-white">
                    <h3 className="text-xl font-black mb-6">Estado de Almacén</h3>
                    <div className="space-y-6">
                       <InventoryMiniItem label="Tops" value={75} total={100} />
                       <InventoryMiniItem label="Bottoms" value={30} total={100} />
                       <InventoryMiniItem label="Accesorios" value={92} total={100} />
                       <InventoryMiniItem label="Calzado" value={12} total={100} />
                    </div>
                    <button 
                      onClick={handleDownloadInventoryReport}
                      className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Descargar Reporte PDF
                    </button>
                  </div>
               </div>

               {/* NUEVAS GRÁFICAS PARA EL GERENTE */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                       <Package className="w-5 h-5 text-indigo-500" />
                       Top 5 Prendas Más Probadas
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProducts} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} width={100} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                       <PieChartIcon className="w-5 h-5 text-amber-500" />
                       Ventas por Categoría
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categorySales}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categorySales.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                       <Activity className="w-5 h-5 text-emerald-500" />
                       Rendimiento Semanal (Visitas vs Ventas)
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyPerformance}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                          <Tooltip />
                          <Bar dataKey="visitas" fill="#cbd5e1" radius={[8, 8, 0, 0]} barSize={20} />
                          <Bar dataKey="ventas" fill="#10b981" radius={[8, 8, 0, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
               </div>
             </div>
          )}

          {!isSuperAdmin && activeTab === 'inventory' && (
             <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="text" placeholder="Buscar por SKU en esta tienda..." className="w-full pl-16 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-bold" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="file" 
                      id="excel-upload" 
                      className="hidden" 
                      accept=".xlsx, .xls" 
                      onChange={handleExcelUpload}
                    />
                    <label 
                      htmlFor="excel-upload" 
                      className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 cursor-pointer hover:bg-emerald-700 transition-all flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Cargar Excel
                    </label>
                    <button 
                      onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
                      className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Nuevo Producto
                    </button>
                    <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">Exportar Stock</button>
                  </div>
                </div>
                {showUploadSuccess && (
                  <div className="mx-8 mb-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">¡Inventario actualizado exitosamente!</p>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 sm:px-10 py-4 sm:py-6">Producto</th>
                        <th className="px-6 sm:px-10 py-4 sm:py-6">Referencia</th>
                        <th className="px-6 sm:px-10 py-4 sm:py-6 text-center">Disponible</th>
                        <th className="px-6 sm:px-10 py-4 sm:py-6 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p, i) => (
                        <React.Fragment key={p.id}>
                          <tr className={`hover:bg-slate-50/50 transition-colors ${!p.isActive ? 'opacity-50' : ''}`}>
                            <td className="px-6 sm:px-10 py-4 sm:py-5">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                <span className="font-black text-slate-800 text-sm sm:text-base">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-6 sm:px-10 py-4 sm:py-5 font-mono text-[10px] sm:text-xs text-slate-400">Padre</td>
                            <td className="px-6 sm:px-10 py-4 sm:py-5 text-center">
                              <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black bg-slate-100 text-slate-500">
                                {p.variations.reduce((acc, v) => acc + v.stock, 0)} Uds
                              </span>
                            </td>
                            <td className="px-6 sm:px-10 py-4 sm:py-5 text-right flex items-center justify-end gap-2">
                               <button 
                                 onClick={() => toggleProductStatus(p.id)}
                                 className={`p-2 rounded-lg transition-colors ${p.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100'}`}
                                 title={p.isActive ? 'Desactivar Producto' : 'Activar Producto'}
                               >
                                 <Activity className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={() => { setEditingProduct(p); setShowProductModal(true); }}
                                 className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                               >
                                 <Settings className="w-4 h-4" />
                               </button>
                            </td>
                          </tr>
                          {p.variations.map(v => (
                            <tr key={v.sku} className={`bg-slate-50/30 ${!v.isActive || !p.isActive ? 'opacity-50' : ''}`}>
                              <td className="px-12 sm:px-16 py-3 sm:py-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${v.isActive && p.isActive ? 'bg-indigo-400' : 'bg-slate-300'}`}></div>
                                  <span className="text-xs font-bold text-slate-600">{v.size} / {v.color}</span>
                                </div>
                              </td>
                              <td className="px-6 sm:px-10 py-3 sm:py-4 font-mono text-[10px] text-slate-400">{v.sku}</td>
                              <td className="px-6 sm:px-10 py-3 sm:py-4 text-center">
                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black ${v.stock < 5 ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                                  {v.stock} Uds
                                </span>
                              </td>
                              <td className="px-6 sm:px-10 py-3 sm:py-4 text-right">
                                <button 
                                  onClick={() => toggleVariationStatus(p.id, v.sku)}
                                  className={`p-1.5 rounded-md transition-colors ${v.isActive ? 'text-indigo-500 hover:bg-indigo-50' : 'text-slate-300 hover:bg-slate-100'}`}
                                >
                                  <Activity className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          )}

          {!isSuperAdmin && activeTab === 'marketing' && (
            <div className="space-y-10">
              {/* Marketing Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mensajes Enviados</p>
                  <h4 className="text-3xl font-black text-slate-900">{marketingMetrics.totalSent}</h4>
                  <p className="text-xs text-slate-400 font-bold mt-2">Acumulado mensual</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clics en Enlaces</p>
                  <h4 className="text-3xl font-black text-indigo-500">{marketingMetrics.totalClicks}</h4>
                  <p className="text-xs text-indigo-400 font-bold mt-2">{(marketingMetrics.totalClicks / marketingMetrics.totalSent * 100).toFixed(1)}% CTR</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Conversiones</p>
                  <h4 className="text-3xl font-black text-emerald-500">{marketingMetrics.totalConversions}</h4>
                  <p className="text-xs text-emerald-400 font-bold mt-2">Ventas recuperadas</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ROI Estimado</p>
                  <h4 className="text-3xl font-black text-amber-500">{marketingMetrics.roi}x</h4>
                  <p className="text-xs text-amber-400 font-bold mt-2">Retorno de inversión</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Campaigns List */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-slate-900">Campañas Inteligentes</h3>
                    <div className="flex gap-3">
                      <button 
                        onClick={simulateConversion}
                        className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                      >
                        <Activity className="w-4 h-4" />
                        Simular Venta
                      </button>
                      <button 
                        onClick={() => setShowCreateSmartCampaign(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Nueva Automatización
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50">
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-8 py-6">Evento Disparador</th>
                          <th className="px-8 py-6">Acción Automática</th>
                          <th className="px-8 py-6">Espera</th>
                          <th className="px-8 py-6">Estado</th>
                          <th className="px-8 py-6 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {smartCampaigns.map(campaign => (
                          <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                {campaign.event === 'abandonment' ? <Clock className="w-4 h-4 text-amber-500" /> : <ShoppingCart className="w-4 h-4 text-emerald-500" />}
                                <span className="font-bold text-slate-700 capitalize">{campaign.event === 'abandonment' ? 'Abandono de Probador' : 'Compra Realizada'}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-xs font-medium text-slate-500">
                                {campaign.action === 'discount_coupon' ? `Cupón de Descuento (${campaign.discountPercent}%)` : 'Sugerencia Complementaria'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-xs font-bold text-slate-400">{campaign.waitTimeHours}h</td>
                            <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${campaign.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                {campaign.isActive ? 'Activa' : 'Pausada'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                                <Settings className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Workflow Visualization */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-indigo-500" />
                      Flujo de Automatización
                    </h3>
                    <TriggerWorkflow />
                  </div>
                </div>

                {/* Preview and Tips */}
                <div className="space-y-8">
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16"></div>
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-indigo-400" />
                      Vista Previa SMS
                    </h3>
                    <MarketingNotificationPreview 
                      type={smartCampaigns[0]?.event === 'abandonment' ? 'abandonment' : 'cross_sell'}
                      customerName="Ana García"
                      productName="Vestido Floral"
                      discountCode="FITTING10"
                    />
                  </div>

                  <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100">
                    <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-4">Tips de Conversión</h4>
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <div className="w-5 h-5 bg-indigo-200 rounded-full flex-shrink-0 flex items-center justify-center text-indigo-600 text-[10px] font-black">1</div>
                        <p className="text-xs text-indigo-700 leading-relaxed font-medium">Envía el recordatorio de abandono entre 2 y 4 horas después de la sesión para máxima efectividad.</p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-5 h-5 bg-indigo-200 rounded-full flex-shrink-0 flex items-center justify-center text-indigo-600 text-[10px] font-black">2</div>
                        <p className="text-xs text-indigo-700 leading-relaxed font-medium">Los cupones del 10% tienen la mejor relación costo/beneficio en retargeting.</p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-5 h-5 bg-indigo-200 rounded-full flex-shrink-0 flex items-center justify-center text-indigo-600 text-[10px] font-black">3</div>
                        <p className="text-xs text-indigo-700 leading-relaxed font-medium">Personaliza siempre con el nombre del cliente y la prenda que se probó.</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          {(activeTab === 'users' || activeTab === 'staff') && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900">
                       {isSuperAdmin ? 'Directorio de Usuarios' : 'Mi Equipo de Trabajo'}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">Gestión de accesos y roles del personal</p>
                    {!isSuperAdmin && currentStore && (
                      <div className="mt-2 flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 w-fit">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Código de Tienda:</p>
                        <p className="text-sm font-black text-indigo-700 tracking-[0.2em]">{currentStore.code}</p>
                      </div>
                    )}
                 </div>
                 <button 
                  onClick={() => {
                    if (!isSuperAdmin) {
                      const name = prompt('Nombre del Staff:');
                      const email = prompt('Email del Staff:');
                      if (name && email) {
                        const newUser: User = {
                          id: Math.random().toString(36).substr(2, 9),
                          name,
                          email,
                          role: Role.STAFF,
                          storeId: currentStore?.id,
                          isFirstLogin: true
                        };
                        setUsers(prev => [...prev, newUser]);
                      }
                    }
                  }}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all ${theme.primary}`}
                 >
                    Registrar Nuevo
                 </button>
              </div>

              {/* Resumen Visual por Rol */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
                {Object.values(Role).map(role => {
                  const count = users.filter(u => {
                    if (isSuperAdmin) return u.role === role;
                    return u.role === role && u.storeId === currentStore?.id;
                  }).length;
                  if (count === 0 && !isSuperAdmin) return null;
                  return (
                    <div key={role} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                      <div className={`absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 ${theme.primary} opacity-5 rounded-full -mr-10 -mt-10 sm:-mr-12 sm:-mt-12 transition-transform group-hover:scale-150`}></div>
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{role.replace('_', ' ')}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl sm:text-4xl font-black text-slate-900">{count}</p>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400">Usuarios</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Agrupación por Rol */}
              {Object.values(Role).map(role => {
                const usersInRole = users.filter(u => {
                  if (isSuperAdmin) return u.role === role;
                  return u.role === role && u.storeId === currentStore?.id;
                });
                if (usersInRole.length === 0) return null;
                
                return (
                  <div key={role} className="space-y-4">
                    <div className="flex items-center gap-3 ml-4">
                      <div className={`w-2 h-2 rounded-full ${theme.primary}`}></div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{role.replace('_', ' ')}</h4>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">{usersInRole.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {usersInRole.map(u => (
                        <div key={u.id} className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 flex items-center gap-4 sm:gap-5 hover:shadow-2xl hover:-translate-y-1 transition-all group">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transform group-hover:rotate-6 transition-all ${theme.primary}`}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{u.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {u.id}</p>
                            <div className="flex gap-2 mt-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span className="text-[9px] font-black text-slate-400 uppercase">En Línea</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end mb-4">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900">Clientes en Probadores</h3>
                    <p className="text-sm text-slate-400 font-medium">Base de datos de clientes registrados durante las sesiones</p>
                 </div>
              </div>
              
              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 sm:px-10 py-4 sm:py-6">Cliente</th>
                        <th className="px-6 sm:px-10 py-4 sm:py-6">Teléfono</th>
                        <th className="px-6 sm:px-10 py-4 sm:py-6 text-center">Visitas Totales</th>
                        <th className="px-6 sm:px-10 py-4 sm:py-6 text-center">Prendas Probadas</th>
                        <th className="px-6 sm:px-10 py-4 sm:py-6 text-center">Prendas Compradas</th>
                        <th className="px-6 sm:px-10 py-4 sm:py-6 text-right">Tasa de Conversión</th>
                        <th className="px-6 sm:px-10 py-4 sm:py-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-10 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <Users className="w-12 h-12 text-slate-200" />
                              <p className="text-slate-400 font-medium">No hay clientes registrados aún.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        customers.map((c, i) => {
                          const totalEntered = c.history.reduce((acc, h) => acc + h.itemsEntered.length, 0);
                          const totalSold = c.history.reduce((acc, h) => acc + h.itemsSold.length, 0);
                          const conversion = totalEntered > 0 ? ((totalSold / totalEntered) * 100).toFixed(1) : '0';
                          return (
                            <tr key={c.id || i} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-6 sm:px-10 py-4 sm:py-6">
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-black text-slate-800 text-sm sm:text-base">
                                      {c.name ? `${c.name[0]}${'*'.repeat(c.name.length - 1)}` : 'Sin Nombre'}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">ID: {c.id || 'N/A'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 sm:px-10 py-4 sm:py-6">
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                                    <Smartphone className="w-3.5 h-3.5 sm:w-4 h-4" />
                                  </div>
                                  <span className="font-bold text-slate-600 text-sm sm:text-base">
                                    {c.phone ? `${c.phone.slice(0, 3)}****${c.phone.slice(-2)}` : 'N/A'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 sm:px-10 py-4 sm:py-6 text-center font-bold text-slate-600 text-sm sm:text-base">{c.history.length}</td>
                              <td className="px-6 sm:px-10 py-4 sm:py-6 text-center font-medium text-slate-500 text-sm sm:text-base">{totalEntered}</td>
                              <td className="px-6 sm:px-10 py-4 sm:py-6 text-center font-medium text-emerald-600 text-sm sm:text-base">{totalSold}</td>
                              <td className="px-6 sm:px-10 py-4 sm:py-6 text-right">
                                <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black bg-indigo-50 text-indigo-600 border border-indigo-100">
                                  {conversion}%
                                </span>
                              </td>
                              <td className="px-6 sm:px-10 py-4 sm:py-6 text-right">
                                <button 
                                  onClick={() => setSelectedCustomer(c)}
                                  className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                                  title="Ver Historial Detallado"
                                >
                                  <History className="w-4 h-4 sm:w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!isSuperAdmin && activeTab === 'config' && (
            <div className="max-w-2xl bg-white rounded-[3rem] border border-slate-200 p-10 shadow-xl">
              <h3 className="text-2xl font-black text-slate-900 mb-8">Configuración de Tienda</h3>
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Número de Probadores Disponibles</label>
                  <div className="flex items-center gap-6">
                    <input 
                      type="number" 
                      min="1" 
                      max="20"
                      className="w-32 px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xl font-black outline-none transition-all"
                      value={storeConfig.fittingRoomsCount}
                      onChange={(e) => setStoreConfig({ ...storeConfig, fittingRoomsCount: parseInt(e.target.value) || 1 })}
                    />
                    <p className="text-sm text-slate-400 font-medium">Define cuántos probadores físicos tiene la tienda para asignar a los clientes.</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Identidad de Marca</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Logo de la Marca (URL)</label>
                      <input 
                        type="text" 
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all"
                        placeholder="https://ejemplo.com/logo.png"
                        value={brands.find(b => b.id === currentStore?.brandId)?.logoUrl || ''}
                        onChange={(e) => {
                          if (currentStore?.brandId) {
                            setBrands(prev => prev.map(b => b.id === currentStore.brandId ? { ...b, logoUrl: e.target.value } : b));
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Color Principal</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="color" 
                          className="w-16 h-14 bg-slate-50 border-2 border-transparent rounded-2xl cursor-pointer p-1"
                          value={brands.find(b => b.id === currentStore?.brandId)?.colors?.primary || '#4f46e5'}
                          onChange={(e) => {
                            if (currentStore?.brandId) {
                              setBrands(prev => prev.map(b => b.id === currentStore.brandId ? { ...b, colors: { ...b.colors, primary: e.target.value } } : b));
                            }
                          }}
                        />
                        <input 
                          type="text" 
                          className="flex-1 px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all"
                          value={brands.find(b => b.id === currentStore?.brandId)?.colors?.primary || '#4f46e5'}
                          onChange={(e) => {
                            if (currentStore?.brandId) {
                              setBrands(prev => prev.map(b => b.id === currentStore.brandId ? { ...b, colors: { ...b.colors, primary: e.target.value } } : b));
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                  <button className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all active:scale-95">
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isSuperAdmin && activeTab === 'billing' && (
            <div className="max-w-4xl space-y-8 pb-20">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Estado de Suscripción</p>
                      <h3 className="text-3xl font-black">Plan {currentStore?.billing?.plan.toUpperCase()} Activo</h3>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${
                      currentStore?.billing?.status === BillingStatus.PAID 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {currentStore?.billing?.status === BillingStatus.PAID ? 'Al día' : 'Pendiente / Trial'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Próximo Pago</p>
                      <p className="text-xl font-bold">{currentStore?.billing ? new Date(currentStore.billing.nextBillingDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Mensual</p>
                      <p className="text-xl font-bold">${currentStore?.billing?.price.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Método de Pago</p>
                      <p className="text-xl font-bold flex items-center gap-2">•••• 4242 <CreditCard className="w-4 h-4 text-indigo-400" /></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selección de Planes */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { id: 'basic', name: 'Básico', price: 29, features: ['Hasta 3 Probadores', 'Reportes Básicos', 'Soporte Email'] },
                  { id: 'pro', name: 'Profesional', price: 49, features: ['Hasta 10 Probadores', 'Reportes Avanzados', 'Soporte 24/7'] },
                  { id: 'enterprise', name: 'Enterprise', price: 99, features: ['Probadores Ilimitados', 'API Access', 'Account Manager'] },
                  { id: 'growth', name: 'Growth', price: 19, features: ['Marketing Directo', 'Success Fee (2%)', 'Automatización IA'] }
                ].map((plan) => (
                  <div 
                    key={plan.id}
                    className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer hover:shadow-xl ${
                      currentStore?.billing?.plan === plan.id 
                        ? 'border-indigo-600 shadow-lg shadow-indigo-100' 
                        : 'border-slate-100 hover:border-indigo-200'
                    }`}
                    onClick={() => {
                      if (currentStore) {
                        const updatedStore = {
                          ...currentStore,
                          billing: {
                            ...currentStore.billing!,
                            plan: plan.id as any,
                            price: plan.price
                          }
                        };
                        setStores(prev => prev.map(s => s.id === currentStore.id ? updatedStore : s));
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="font-black text-slate-900">{plan.name}</h4>
                        <p className="text-2xl font-black text-indigo-600 mt-1">${plan.price}<span className="text-xs text-slate-400 font-bold">/mes</span></p>
                      </div>
                      {currentStore?.billing?.plan === plan.id && (
                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-xl">
                <h3 className="text-xl font-black text-slate-900 mb-8">Tendencia de Costos por Uso</h3>
                <div className="h-64 mb-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={billingTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 mb-8">Historial de Facturas</h3>
                <div className="space-y-4">
                  {currentStore?.billing.history.length === 0 ? (
                    <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                       <FileText className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                       <p className="text-slate-400 font-medium">No hay facturas registradas aún.</p>
                    </div>
                  ) : (
                    currentStore?.billing.history.map(invoice => (
                      <div key={invoice.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-500/30 transition-all group">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-slate-800">Factura #{invoice.id.split('-')[1]}</p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(invoice.date).toLocaleDateString()}</p>
                            {invoice.usageDetails && (
                              <p className="text-[10px] text-slate-400 font-medium mt-1">
                                {invoice.usageDetails.sessions} Sesiones | {invoice.usageDetails.itemsProcessed} Prendas procesadas
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <p className="font-black text-slate-900">${invoice.amount.toFixed(2)}</p>
                          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                            Descargar PDF
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {!isSuperAdmin && activeTab === 'marketing' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Marketing Directo</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Motor de Monetización y Re-engagement</p>
                </div>
                <div className="flex gap-4">
                   <div className="bg-indigo-600/10 px-6 py-3 rounded-2xl border border-indigo-500/20">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Plan Actual</p>
                      <p className="text-sm font-black text-indigo-900">{currentStore?.billing?.plan === 'growth' ? 'GROWTH (Variable)' : 'SaaS Fijo'}</p>
                   </div>
                </div>
              </div>

              {/* Marketing Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="SMS Enviados" value={marketingMetrics.totalSent.toLocaleString()} icon={<Smartphone />} theme="indigo" />
                <StatCard label="CTR (Clics)" value={`${((marketingMetrics.totalClicks / marketingMetrics.totalSent) * 100).toFixed(1)}%`} icon={<TrendingUp />} theme="emerald" />
                <StatCard label="Ventas Recuperadas" value={`$${marketingMetrics.recoveredRevenue.toLocaleString()}`} icon={<DollarSign />} theme="amber" />
                <StatCard label="ROI Estimado" value={`${marketingMetrics.roi}x`} icon={<Activity />} theme="indigo" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Trigger Workflow Visualization */}
                <div className="lg:col-span-2">
                  <TriggerWorkflow />
                </div>

                {/* Copywriting Preview */}
                <div className="space-y-6">
                  <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                    
                    <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-2xl border border-white/10">
                      <button 
                        onClick={() => setSelectedScenario('retargeting')}
                        className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${selectedScenario === 'retargeting' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Retargeting
                      </button>
                      <button 
                        onClick={() => setSelectedScenario('urgency')}
                        className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${selectedScenario === 'urgency' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Urgencia
                      </button>
                      <button 
                        onClick={() => setSelectedScenario('cross_selling')}
                        className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${selectedScenario === 'cross_selling' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Cross-sell
                      </button>
                    </div>
                    
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-10 text-indigo-400 text-center">UX de Marketing: Notificación</h4>
                    
                    <MarketingNotificationPreview 
                      storeName={currentStore?.name || 'Perchero Digital'} 
                      title={scenarios[selectedScenario].title}
                      message={scenarios[selectedScenario].message}
                      buttonText={scenarios[selectedScenario].buttonText}
                      productImage={scenarios[selectedScenario].image}
                    />
                    
                    <div className="mt-10 pt-8 border-t border-white/10 w-full flex justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tasa de Apertura</span>
                        <span className="text-xl font-black text-emerald-400">98.2%</span>
                      </div>
                      <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-lg">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Métrica de Éxito</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <p className="text-2xl font-black text-slate-900">25%</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">CTR Promedio</p>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                        Tus clientes están regresando a la tienda online o física gracias a los recordatorios automáticos.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Simulador de Conversión</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => simulateConversion('Online')}
                        className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-indigo-500 transition-all group"
                      >
                        <ShoppingCart className="w-5 h-5 text-indigo-600 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Venta Online</p>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-1">(Píxel Script)</p>
                      </button>
                      <button 
                        onClick={() => simulateConversion('Física')}
                        className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-emerald-500 transition-all group"
                      >
                        <StoreIcon className="w-5 h-5 text-emerald-600 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Venta Física</p>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-1">(Cupón QR)</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recovered Sales Table */}
              {recoveredSales.length > 0 && (
                <div className="mt-10">
                  <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-emerald-50/30">
                      <div>
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Ventas Recuperadas (Atribución)</h4>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Ventas detectadas vía Píxel y Cupones</p>
                      </div>
                      <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Total: ${recoveredSales.reduce((acc, s) => acc + s.amount, 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-0">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Sesión</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Canal</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {recoveredSales.map((sale) => (
                            <tr key={sale.id} className="hover:bg-emerald-50/30 transition-colors">
                              <td className="px-8 py-6 font-mono text-[10px] text-slate-600">{sale.sessionId}</td>
                              <td className="px-8 py-6 font-black text-slate-900">${sale.amount}</td>
                              <td className="px-8 py-6">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${sale.type === 'Online' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {sale.type}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {new Date(sale.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Campaigns Config */}
              <div className="mt-10">
                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Campañas Inteligentes (SmartCampaigns)</h4>
                    <button 
                      onClick={() => setShowCreateSmartCampaign(true)}
                      className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                      Nueva Regla
                    </button>
                  </div>
                  <div className="p-0">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Evento</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Acción</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Espera</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {smartCampaigns.map((camp) => (
                          <tr key={camp.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-8 py-6 font-bold text-slate-800">
                              {camp.event === 'abandonment' ? 'Abandono de Prenda' : 
                               camp.event === 'purchase' ? 'Compra Exitosa' : 
                               camp.event === 'out_of_stock' ? 'Sin Stock' : camp.event}
                            </td>
                            <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                {camp.action === 'discount_coupon' ? 'Cupón Descuento' : 
                                 camp.action === 'complementary_suggestion' ? 'Sugerencia' : 'Aviso Stock'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-slate-500 font-medium">
                              {camp.waitTime} Horas
                            </td>
                            <td className="px-8 py-6">
                              <button 
                                onClick={() => setSmartCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, isActive: !c.isActive } : c))}
                                className={`w-12 h-6 rounded-full transition-all relative ${camp.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${camp.isActive ? 'right-1' : 'left-1'}`}></div>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!isSuperAdmin && activeTab === 'audit' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-xl">
              <h3 className="text-2xl font-black text-slate-900 mb-4">Arqueo Diario</h3>
              <p className="text-slate-400 font-medium mb-8">Resumen de movimientos y cierres de caja de la jornada actual.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Ventas Hoy</p>
                  <p className="text-2xl font-black text-slate-900">{stats.sales} Uds</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sesiones Finalizadas</p>
                  <p className="text-2xl font-black text-slate-900">{sessions.filter(s => s.status === 'CLOSED').length}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Artículos Probados</p>
                  <p className="text-2xl font-black text-slate-900">{logs.filter(l => l.action === 'tried_on').length} Uds</p>
                </div>
              </div>
            </div>
          )}

          {!isSuperAdmin && activeTab === 'alerts' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Alertas de Inventario</h3>
                  <p className="text-slate-400 font-medium">Notificaciones de productos faltantes reportados por el staff.</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100">
                     {storeAlerts.length} Alertas Totales
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                {storeAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                      <Bell className="w-10 h-10 text-slate-200" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">Todo en orden</h4>
                    <p className="text-slate-400 font-medium">No se han reportado productos faltantes en esta sede.</p>
                  </div>
                ) : (
                  [...storeAlerts].reverse().map(alert => (
                    <div key={alert.id} className="bg-white border border-slate-100 p-6 rounded-2xl hover:border-rose-500/30 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-all">
                          <AlertTriangle className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Producto Faltante</p>
                            {!alert.isRead && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>}
                          </div>
                          <h4 className="text-lg font-black text-slate-900">{alert.productName}</h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <p className="text-xs font-bold text-slate-500">SKU: <span className="text-slate-900">{alert.sku}</span></p>
                            <p className="text-xs font-bold text-slate-500">Reportado por: <span className="text-slate-900">{alert.workerName}</span></p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-900">{new Date(alert.timestamp).toLocaleDateString()}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                        </div>
                        <button 
                          onClick={() => {
                            if(confirm('¿Deseas eliminar esta alerta?')) {
                              setInventoryAlerts(prev => prev.filter(a => a.id !== alert.id));
                            }
                          }}
                          className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* MODAL CREAR MARCA */}
        {showCreateBrand && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 sm:p-10 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-300">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-8">Nueva Marca</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Nombre de la Marca</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-500 rounded-2xl font-bold outline-none transition-all"
                    placeholder="Ej: Zara Global"
                    value={newBrand.name}
                    onChange={(e) => setNewBrand({...newBrand, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Tipo de Facturación</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-500 rounded-2xl font-bold outline-none transition-all appearance-none"
                    value={newBrand.billingType}
                    onChange={(e) => setNewBrand({...newBrand, billingType: e.target.value as any})}
                  >
                    <option value="per_store">Por Sede Individual</option>
                    <option value="global">Consolidado Global</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Precio Base Mensual</label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-500 rounded-2xl font-bold outline-none transition-all"
                    value={newBrand.price}
                    onChange={(e) => setNewBrand({...newBrand, price: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowCreateBrand(false)}
                    className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleCreateBrand}
                    className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-200 hover:bg-amber-600 transition-all"
                  >
                    Crear Marca
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL SOLICITAR PUBLICIDAD */}
        {/* Smart Campaign Creation Modal */}
        {showCreateSmartCampaign && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Nueva Regla Inteligente</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Automatización de Marketing</p>
                </div>
                <button onClick={() => setShowCreateSmartCampaign(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Campaña</label>
                  <input 
                    type="text"
                    value={newSmartCampaign.name}
                    onChange={(e) => setNewSmartCampaign({ ...newSmartCampaign, name: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Ej: Recuperación de Carrito"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evento Disparador</label>
                    <select 
                      value={newSmartCampaign.event}
                      onChange={(e) => setNewSmartCampaign({ ...newSmartCampaign, event: e.target.value as any })}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="abandonment">Abandono de Prenda</option>
                      <option value="purchase">Compra Exitosa</option>
                      <option value="out_of_stock">Sin Stock</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Acción</label>
                    <select 
                      value={newSmartCampaign.action}
                      onChange={(e) => setNewSmartCampaign({ ...newSmartCampaign, action: e.target.value as any })}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="discount_coupon">Cupón Descuento</option>
                      <option value="complementary_suggestion">Sugerencia Complementaria</option>
                      <option value="back_in_stock_alert">Aviso de Stock</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiempo de Espera (Horas)</label>
                  <input 
                    type="number"
                    value={newSmartCampaign.waitTime}
                    onChange={(e) => setNewSmartCampaign({ ...newSmartCampaign, waitTime: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Ej: 2"
                  />
                </div>
                <button 
                  onClick={() => {
                    if (newSmartCampaign.event) {
                      setSmartCampaigns([...smartCampaigns, { ...newSmartCampaign as SmartCampaign, id: Date.now().toString(), storeId: currentStore?.id || '1' }]);
                      setShowCreateSmartCampaign(false);
                      setNewSmartCampaign({ event: 'abandonment', action: 'discount_coupon', waitTime: 2, isActive: true });
                    }
                  }}
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                  Crear Regla Automática
                </button>
              </div>
            </div>
          </div>
        )}
        {showAdRequestModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-8 sm:p-10 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-300">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-8">
                {isSuperAdmin ? 'Publicar Pauta Publicitaria' : 'Solicitar Campaña Publicitaria'}
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-1 bg-slate-100 rounded-2xl">
                  <button 
                    onClick={() => setNewAdRequest({...newAdRequest, type: 'banner'} as any)}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(newAdRequest as any).type === 'banner' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Banner App
                  </button>
                  <button 
                    onClick={() => setNewAdRequest({...newAdRequest, type: 'sms'} as any)}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(newAdRequest as any).type === 'sms' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Campaña SMS
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Título de la Campaña</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all"
                    placeholder="Ej: Nueva Colección Verano 2024"
                    value={newAdRequest.title}
                    onChange={(e) => setNewAdRequest({...newAdRequest, title: e.target.value})}
                  />
                </div>

                {(newAdRequest as any).type === 'banner' ? (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">URL de la Imagen (Banner)</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all"
                      placeholder="https://ejemplo.com/banner.jpg"
                      value={newAdRequest.imageUrl}
                      onChange={(e) => setNewAdRequest({...newAdRequest, imageUrl: e.target.value})}
                    />
                    <p className="text-[8px] text-slate-400 mt-2 ml-4 uppercase font-bold">Si se deja vacío, se generará una imagen aleatoria.</p>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Tipo de Notificación SMS</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all appearance-none"
                      value={(newAdRequest as any).smsType}
                      onChange={(e) => setNewAdRequest({...newAdRequest, smsType: e.target.value} as any)}
                    >
                      <option value="promotion">Promoción General</option>
                      <option value="not_purchased">Retargeting (No comprado)</option>
                      <option value="cross_sell">Cross-selling (Complementos)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Enlace Externo (Opcional)</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all"
                    placeholder="https://tu-tienda.com/oferta"
                    value={(newAdRequest as any).externalLink}
                    onChange={(e) => setNewAdRequest({...newAdRequest, externalLink: e.target.value} as any)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Descripción / Mensaje</label>
                  <textarea 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all h-24 resize-none"
                    placeholder={(newAdRequest as any).type === 'banner' ? "Describe el contenido y dónde quieres que se muestre..." : "Escribe el mensaje que recibirán los clientes..."}
                    value={newAdRequest.description}
                    onChange={(e) => setNewAdRequest({...newAdRequest, description: e.target.value})}
                  ></textarea>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Sede de Destino</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all appearance-none"
                    value={newAdRequest.storeId}
                    onChange={(e) => setNewAdRequest({...newAdRequest, storeId: e.target.value})}
                  >
                    <option value="">Todas las Sedes (Global)</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowAdRequestModal(false)}
                    className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleCreateAdRequest}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
                  >
                    {isSuperAdmin ? 'Publicar Ahora' : 'Enviar Solicitud'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* MODAL DETALLE DE SEDE (SUPER ADMIN) */}
        {selectedStoreIdForDetail && (
          <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-6 overflow-hidden">
            <div className="bg-slate-50 w-full h-full sm:h-[90vh] max-w-6xl sm:rounded-[3rem] shadow-2xl flex flex-col animate-in zoom-in duration-300">
              {/* Header */}
              <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-white sm:rounded-t-[3rem]">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setSelectedStoreIdForDetail(null)}
                    className="p-3 bg-slate-100 rounded-2xl text-slate-600 hover:bg-slate-200 transition-all"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {stores.find(s => s.id === selectedStoreIdForDetail)?.name}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">Historial de Clientes y Campañas SMS</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-200">
                      Sede Activa
                   </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {/* Historial de Clientes */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-widest">Historial de Clientes</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total: {customers.filter(c => sessions.some(s => s.customerId === c.id && s.storeId === selectedStoreIdForDetail)).length} Clientes</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {customers.filter(c => sessions.some(s => s.customerPhone === c.phone && s.storeId === selectedStoreIdForDetail)).map(customer => {
                      const customerSessions = sessions.filter(s => s.customerPhone === customer.phone && s.storeId === selectedStoreIdForDetail);
                      const triedOnSkus = Array.from(new Set(customerSessions.flatMap(s => s.products.map(p => p.sku))));
                      const soldSkus = Array.from(new Set(customerSessions.flatMap(s => s.products.filter(p => p.status === ItemStatus.SOLD).map(p => p.sku))));
                      const notTakenSkus = triedOnSkus.filter(sku => !soldSkus.includes(sku));

                      return (
                        <div key={customer.phone} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-slate-900 text-amber-500 rounded-[1.5rem] flex items-center justify-center flex-shrink-0">
                                <UserIcon className="w-8 h-8" />
                              </div>
                              <div>
                                <h5 className="text-lg font-black text-slate-900">{customer.name || 'Sin Nombre'}</h5>
                                <p className="text-sm font-bold text-slate-400">{customer.phone}</p>
                                <div className="flex gap-2 mt-2">
                                  <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded uppercase tracking-widest">
                                    {customerSessions.length} Visitas
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Prendas No Llevadas (Retargeting) */}
                              <div className="space-y-3">
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">No Llevó (Retargeting)</p>
                                <div className="flex flex-wrap gap-2">
                                  {notTakenSkus.length > 0 ? notTakenSkus.map(sku => (
                                    <div key={sku} className="group relative">
                                      <button 
                                        onClick={() => handleSendSMS(customer.phone as string, selectedStoreIdForDetail as string, 'retargeting', sku as string, `Hola ${customer.name || 'Cliente'}, ¡vimos que te gustó la referencia ${sku}! Llévatela hoy con un 10% de descuento en ${stores.find(s => s.id === selectedStoreIdForDetail)?.name}.`)}
                                        className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold border border-rose-100 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2"
                                      >
                                        {sku}
                                        <MessageSquare className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )) : <p className="text-xs text-slate-400 italic">Sin registros</p>}
                                </div>
                              </div>

                              {/* Prendas Llevadas (Cross-sell) */}
                              <div className="space-y-3">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Llevó (Cross-sell)</p>
                                <div className="flex flex-wrap gap-2">
                                  {soldSkus.length > 0 ? soldSkus.map(sku => (
                                    <div key={sku} className="group relative">
                                      <button 
                                        onClick={() => handleSendSMS(customer.phone as string, selectedStoreIdForDetail as string, 'cross_sell', sku as string, `Hola ${customer.name || 'Cliente'}, ¡gracias por tu compra de ${sku}! Te contamos que ya tenemos nuevas referencias y colores disponibles que te encantarán.`)}
                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
                                      >
                                        {sku}
                                        <MessageSquare className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )) : <p className="text-xs text-slate-400 italic">Sin registros</p>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Historial de Campañas Enviadas */}
                <div className="space-y-6">
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-widest">Campañas Enviadas</h4>
                  <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50">
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-8 py-6">Cliente</th>
                          <th className="px-8 py-6">Tipo</th>
                          <th className="px-8 py-6">Referencia</th>
                          <th className="px-8 py-6">Mensaje</th>
                          <th className="px-8 py-6">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {smsCampaigns.filter(camp => camp.storeId === selectedStoreIdForDetail).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-medium italic">No se han enviado campañas aún.</td>
                          </tr>
                        ) : (
                          [...smsCampaigns].filter(camp => camp.storeId === selectedStoreIdForDetail).reverse().map(camp => (
                            <tr key={camp.id} className="text-xs">
                              <td className="px-8 py-6 font-bold text-slate-800">
                                {customers.find(c => c.phone === camp.customerId)?.name || 'Desconocido'}
                              </td>
                              <td className="px-8 py-6">
                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                                  camp.type === 'retargeting' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                  {camp.type === 'retargeting' ? 'Retargeting' : 'Cross-sell'}
                                </span>
                              </td>
                              <td className="px-8 py-6 font-mono font-bold text-slate-500">{camp.sku}</td>
                              <td className="px-8 py-6 text-slate-500 max-w-xs truncate">{camp.message}</td>
                              <td className="px-8 py-6 text-slate-400">{new Date(camp.sentAt).toLocaleDateString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <ProductModal 
          isOpen={showProductModal}
          onClose={() => { setShowProductModal(false); setEditingProduct(null); }}
          product={editingProduct || newProduct}
          onSave={handleSaveProduct}
          onChange={(p) => editingProduct ? setEditingProduct(p) : setNewProduct(p)}
        />
        <SmartCampaignModal 
          isOpen={showCreateSmartCampaign}
          onClose={() => setShowCreateSmartCampaign(false)}
          campaign={newSmartCampaign}
          onSave={handleCreateSmartCampaign}
          onChange={(c) => setNewSmartCampaign(c)}
        />
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string, theme: any, badge?: number }> = ({ active, onClick, icon, label, theme, badge }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black transition-all group ${
      active 
        ? `${theme.primary} text-white shadow-2xl ${theme.shadow} scale-[1.02]`
        : 'text-slate-500 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className="flex items-center gap-4">
      {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 transition-transform group-hover:scale-110` })}
      <span className="text-[11px] uppercase tracking-widest">{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${active ? 'bg-white text-slate-900' : 'bg-rose-500 text-white'}`}>
        {badge}
      </span>
    )}
  </button>
);

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; theme: 'amber' | 'indigo' | 'emerald' }> = ({ label, value, icon, theme }) => {
  const styles = {
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', text: 'text-amber-600' },
    indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-600', text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', text: 'text-emerald-600' },
  };
  const s = styles[theme];
  
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${s.icon} text-white rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:rotate-6 transition-transform`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5 sm:w-6 h-6' })}
      </div>
      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <h4 className="text-2xl sm:text-3xl font-black text-slate-900">{value}</h4>
    </div>
  );
};

const InventoryMiniItem: React.FC<{ label: string; value: number; total: number }> = ({ label, value, total }) => {
  const percentage = (value / total) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-400">{label}</span>
        <span className={percentage < 20 ? 'text-rose-500' : 'text-emerald-400'}>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 rounded-full ${percentage < 20 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const ProductModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  product: Product | Partial<Product>;
  onSave: () => void;
  onChange: (p: any) => void;
}> = ({ isOpen, onClose, product, onSave, onChange }) => {
  if (!isOpen) return null;

  const addVariation = () => {
    const variations = [...(product.variations || []), { sku: '', size: '', color: '', stock: 0, isActive: true }];
    onChange({ ...product, variations });
  };

  const updateVariation = (index: number, field: string, value: any) => {
    const variations = [...(product.variations || [])];
    variations[index] = { ...variations[index], [field]: value };
    onChange({ ...product, variations });
  };

  const removeVariation = (index: number) => {
    const variations = product.variations?.filter((_, i) => i !== index);
    onChange({ ...product, variations });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        <div className="p-8 sm:p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {product.id ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Gestión de Inventario y Variaciones</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white rounded-full transition-all hover:shadow-lg text-slate-400 hover:text-slate-900">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Producto</label>
              <input 
                type="text" 
                value={product.name}
                onChange={(e) => onChange({ ...product, name: e.target.value })}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-700 transition-all outline-none"
                placeholder="Ej: Camisa Lino Blanca"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
              <input 
                type="text" 
                value={product.category}
                onChange={(e) => onChange({ ...product, category: e.target.value })}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-700 transition-all outline-none"
                placeholder="Ej: Tops, Pantalones..."
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Variaciones (Talla / Color / Stock)</h4>
              <button 
                onClick={addVariation}
                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl transition-all"
              >
                <Plus className="w-3 h-3" />
                Agregar Variación
              </button>
            </div>
            
            <div className="space-y-4">
              {product.variations?.map((v, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SKU</label>
                    <input 
                      type="text" 
                      value={v.sku}
                      onChange={(e) => updateVariation(i, 'sku', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700"
                      placeholder="SKU-123"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Talla</label>
                    <input 
                      type="text" 
                      value={v.size}
                      onChange={(e) => updateVariation(i, 'size', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700"
                      placeholder="S, M, L, 32..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Color</label>
                    <input 
                      type="text" 
                      value={v.color}
                      onChange={(e) => updateVariation(i, 'color', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700"
                      placeholder="Blanco, Azul..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stock</label>
                    <input 
                      type="number" 
                      value={v.stock}
                      onChange={(e) => updateVariation(i, 'stock', parseInt(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700"
                    />
                  </div>
                  <div className="flex items-end justify-end">
                    <button 
                      onClick={() => removeVariation(i)}
                      className="p-3 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {(!product.variations || product.variations.length === 0) && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No hay variaciones definidas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-white transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={onSave}
            className="flex-1 bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            Guardar Producto
          </button>
        </div>
      </div>
    </div>
  );
};

const SmartCampaignModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  campaign: Partial<SmartCampaign>;
  onSave: () => void;
  onChange: (c: any) => void;
}> = ({ isOpen, onClose, campaign, onSave, onChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nueva Automatización</h3>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Configura disparadores inteligentes</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white rounded-full transition-all text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evento Disparador</label>
              <select 
                value={campaign.event}
                onChange={(e) => onChange({ ...campaign, event: e.target.value })}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-700 transition-all outline-none"
              >
                <option value="abandonment">Abandono de Probador</option>
                <option value="purchase">Compra Realizada</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Acción Automática</label>
              <select 
                value={campaign.action}
                onChange={(e) => onChange({ ...campaign, action: e.target.value })}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-700 transition-all outline-none"
              >
                <option value="discount_coupon">Enviar Cupón de Descuento</option>
                <option value="complementary_suggestion">Sugerencia Complementaria</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiempo de Espera (Horas)</label>
              <input 
                type="number" 
                value={campaign.waitTimeHours}
                onChange={(e) => onChange({ ...campaign, waitTimeHours: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-700 transition-all outline-none"
              />
            </div>
            {campaign.action === 'discount_coupon' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">% de Descuento</label>
                <input 
                  type="number" 
                  value={campaign.discountPercent}
                  onChange={(e) => onChange({ ...campaign, discountPercent: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-700 transition-all outline-none"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requisito (Opcional)</label>
            <input 
              type="text" 
              value={campaign.requirement}
              onChange={(e) => onChange({ ...campaign, requirement: e.target.value })}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-700 transition-all outline-none"
              placeholder="Ej: price > 100"
            />
          </div>
        </div>

        <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          <button onClick={onClose} className="flex-1 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-white transition-all">Cancelar</button>
          <button onClick={onSave} className="flex-1 bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">Crear Automatización</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
