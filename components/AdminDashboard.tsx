
import React, { useState, useMemo } from 'react';
import { User, Product, InventoryLog, FittingSession, TimeRange, Role, Customer, StoreConfig, Store, BillingStatus, Invoice, Brand, AdRequest } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
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
  Plus,
  Home,
  Smartphone,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Megaphone,
  Download,
  PieChart as PieChartIcon
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
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, onLogout, products, setProducts, logs, sessions, storeConfig, setStoreConfig, customers, users, setUsers, stores, setStores, brands, setBrands, adRequests, setAdRequests 
}) => {
  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  
  // Tabs diferenciadas por rol
  const [activeTab, setActiveTab] = useState<string>(isSuperAdmin ? 'global' : 'overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [showCreateBrand, setShowCreateBrand] = useState(false);
  const [showAdRequestModal, setShowAdRequestModal] = useState(false);
  const [editingStoreBilling, setEditingStoreBilling] = useState<Store | null>(null);
  const [newStore, setNewStore] = useState({ name: '', location: '', adminEmail: '', plan: 'pro' as const, brandId: '' });
  const [newBrand, setNewBrand] = useState({ name: '', billingType: 'per_store' as const, price: 150 });
  const [newAdRequest, setNewAdRequest] = useState({ title: '', description: '', storeId: '' });
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [showStoreSuccess, setShowStoreSuccess] = useState(false);

  const currentStore = stores.find(s => s.adminId === user.id) || stores[0];

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
      status: 'pending',
      requestedAt: Date.now()
    };
    setAdRequests([...adRequests, ad]);
    setShowAdRequestModal(false);
    setNewAdRequest({ title: '', description: '', storeId: '' });
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
        
        const newProducts: Product[] = data.map((row: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: String(row.Nombre || row.name || row.Name || 'Producto Sin Nombre'),
          sku: String(row.SKU || row.sku || Math.random().toString(36).substr(2, 6).toUpperCase()),
          stock: Number(row.Stock || row.stock || row.Cantidad || 0),
          price: Number(row.Precio || row.price || row.Price || 0),
          category: String(row.Categoria || row.category || row.Category || 'General'),
          image: String(row.Imagen || row.image || row.Image || 'https://picsum.photos/seed/product/200')
        }));

        setProducts(prev => [...prev, ...newProducts]);
        setShowUploadSuccess(true);
        setTimeout(() => setShowUploadSuccess(false), 3000);
      } catch (error) {
        console.error('Error parsing Excel:', error);
      }
    };
    reader.readAsBinaryString(file);
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

      {/* SIDEBAR DIFERENCIADO */}
      <aside className={`hidden lg:flex w-80 flex-col transition-all duration-500 ${isSuperAdmin ? 'bg-slate-950 shadow-[20px_0_60px_rgba(0,0,0,0.4)]' : 'bg-slate-900 shadow-xl'}`}>
        <div className="p-8">
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
              <button 
                onClick={onLogout}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
                title="Volver al Inicio"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
           </div>
           
           <nav className="space-y-2">
             {isSuperAdmin ? (
               <>
                 <SidebarItem active={activeTab === 'global'} onClick={() => setActiveTab('global')} icon={<Activity />} label="Visión Global" theme={theme} />
                 <SidebarItem active={activeTab === 'brands'} onClick={() => setActiveTab('brands')} icon={<Crown />} label="Marcas / Clientes" theme={theme} />
                 <SidebarItem active={activeTab === 'stores'} onClick={() => setActiveTab('stores')} icon={<Building2 />} label="Sedes / Tiendas" theme={theme} />
                 <SidebarItem active={activeTab === 'ads'} onClick={() => setActiveTab('ads')} icon={<Megaphone />} label="Publicidad" theme={theme} />
                 <SidebarItem active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={<CreditCard />} label="Facturación" theme={theme} />
                 <SidebarItem active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} icon={<Users />} label="Clientes Global" theme={theme} />
                 <SidebarItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users />} label="Directorio Admin" theme={theme} />
                 <SidebarItem active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<ShieldCheck />} label="Seguridad" theme={theme} />
               </>
             ) : (
               <>
                 <SidebarItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 />} label="Mi Tienda" theme={theme} />
                 <SidebarItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package />} label="Control Stock" theme={theme} />
                 <SidebarItem active={activeTab === 'ads'} onClick={() => setActiveTab('ads')} icon={<Megaphone />} label="Publicidad" theme={theme} />
                 <SidebarItem active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} icon={<Users />} label="Clientes" theme={theme} />
                  <SidebarItem active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon={<Users />} label="Mi Equipo" theme={theme} />
                 <SidebarItem active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Settings />} label="Configuración" theme={theme} />
                  <SidebarItem active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={<CreditCard />} label="Mi Factura" theme={theme} />
                  <SidebarItem active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<History />} label="Arqueo Diario" theme={theme} />
               </>
             )}
           </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-white/5 bg-black/20">
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
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-10 py-6 sticky top-0 z-30 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className={`p-2 rounded-lg ${isSuperAdmin ? 'bg-amber-50' : 'bg-indigo-50'}`}>
                {isSuperAdmin ? <Layers className="w-5 h-5 text-amber-600" /> : <MapPin className="w-5 h-5 text-indigo-600" />}
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none capitalize">
                   {activeTab.replace('_', ' ')}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">
                  {isSuperAdmin ? 'Consola de Administración Central' : 'Panel de Control Local'}
                </p>
             </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60">
             {(['day', 'week', 'month'] as TimeRange[]).map(range => (
               <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${timeRange === range ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {range.toUpperCase()}
               </button>
             ))}
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
          
          {/* VISTAS PARA SUPER ADMIN */}
          {isSuperAdmin && activeTab === 'global' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                {!isSuperAdmin && (
                  <button 
                    onClick={() => setShowAdRequestModal(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    <Megaphone className="w-4 h-4" />
                    Solicitar Campaña
                  </button>
                )}
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
                            <p className="font-bold text-slate-800">{ad.title}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-xs">{ad.description}</p>
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
                              ad.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 
                              ad.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                            }`}>
                              {ad.status}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-sm text-slate-500">{new Date(ad.requestedAt).toLocaleDateString()}</td>
                          <td className="px-10 py-6 text-right">
                            {isSuperAdmin && ad.status === 'pending' && (
                              <button 
                                onClick={() => setAdRequests(prev => prev.map(a => a.id === ad.id ? {...a, status: 'active'} : a))}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                              >
                                Publicar
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
                          <p className="text-sm font-bold text-slate-700 uppercase">{s.billing.plan}</p>
                       </div>
                       <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-amber-500 transition-colors">
                          <Settings className="w-5 h-5" />
                       </button>
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
                  <button className="text-xs font-black uppercase tracking-widest text-amber-500 hover:underline">Descargar Reporte Global</button>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-10 py-6">Sede</th>
                      <th className="px-10 py-6">Plan</th>
                      <th className="px-10 py-6">Estado</th>
                      <th className="px-10 py-6">Próximo Cobro</th>
                      <th className="px-10 py-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stores.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-10 py-6 font-bold text-slate-800">{s.name}</td>
                        <td className="px-10 py-6 text-xs font-black uppercase text-slate-500">{s.billing.plan}</td>
                        <td className="px-10 py-6">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                            s.billing.status === BillingStatus.PAID ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {s.billing.status}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-sm text-slate-500">{new Date(s.billing.nextBillingDate).toLocaleDateString()}</td>
                        <td className="px-10 py-6 text-right">
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
          )}

          {/* VISTAS PARA STORE ADMIN */}
          {!isSuperAdmin && activeTab === 'overview' && (
             <div className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <StatCard label="Visitas Hoy" value={stats.totalSessions.toString()} icon={<Users />} theme="indigo" />
                 <StatCard label="En Probador" value={stats.activeSessions.toString()} icon={<Clock />} theme="indigo" />
                 <StatCard label="Ventas Sede" value={stats.sales.toString()} icon={<Plus />} theme="emerald" />
                 <StatCard label="Conversión" value={`${stats.conversion}%`} icon={<TrendingUp />} theme="indigo" />
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
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-10 py-6">Producto</th>
                        <th className="px-10 py-6">Referencia</th>
                        <th className="px-10 py-6 text-center">Disponible</th>
                        <th className="px-10 py-6 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-5 font-black text-slate-800">{p.name}</td>
                          <td className="px-10 py-5 font-mono text-xs text-slate-400">{p.sku}</td>
                          <td className="px-10 py-5 text-center">
                            <span className={`px-4 py-1.5 rounded-lg text-xs font-black ${p.stock < 10 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                              {p.stock} Uds
                            </span>
                          </td>
                          <td className="px-10 py-5 text-right">
                             <button className="p-2 text-slate-300 hover:text-indigo-600"><Settings className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          )}

          {(activeTab === 'users' || activeTab === 'staff') && (
            <div className="space-y-8">
              <div className="flex justify-between items-end mb-4">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900">
                       {isSuperAdmin ? 'Directorio de Usuarios' : 'Mi Equipo de Trabajo'}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">Gestión de accesos y roles del personal</p>
                 </div>
                 <button className={`px-6 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all ${theme.primary}`}>
                    Registrar Nuevo
                 </button>
              </div>

              {/* Resumen Visual por Rol */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {Object.values(Role).map(role => {
                  const count = users.filter(u => u.role === role).length;
                  if (count === 0 && !isSuperAdmin) return null;
                  return (
                    <div key={role} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                      <div className={`absolute top-0 right-0 w-24 h-24 ${theme.primary} opacity-5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150`}></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{role.replace('_', ' ')}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black text-slate-900">{count}</p>
                        <p className="text-xs font-bold text-slate-400">Usuarios</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Agrupación por Rol */}
              {Object.values(Role).map(role => {
                const usersInRole = users.filter(u => u.role === role);
                if (usersInRole.length === 0) return null;
                
                return (
                  <div key={role} className="space-y-4">
                    <div className="flex items-center gap-3 ml-4">
                      <div className={`w-2 h-2 rounded-full ${theme.primary}`}></div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{role.replace('_', ' ')}</h4>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">{usersInRole.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {usersInRole.map(u => (
                        <div key={u.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex items-center gap-5 hover:shadow-2xl hover:-translate-y-1 transition-all group">
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
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-10 py-6">Teléfono del Cliente</th>
                        <th className="px-10 py-6 text-center">Visitas Totales</th>
                        <th className="px-10 py-6 text-center">Prendas Probadas</th>
                        <th className="px-10 py-6 text-center">Prendas Compradas</th>
                        <th className="px-10 py-6 text-right">Tasa de Conversión</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-10 py-20 text-center">
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
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-10 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <Smartphone className="w-5 h-5" />
                                  </div>
                                  <span className="font-black text-slate-800">{c.phone}</span>
                                </div>
                              </td>
                              <td className="px-10 py-6 text-center font-bold text-slate-600">{c.history.length}</td>
                              <td className="px-10 py-6 text-center font-medium text-slate-500">{totalEntered}</td>
                              <td className="px-10 py-6 text-center font-medium text-emerald-600">{totalSold}</td>
                              <td className="px-10 py-6 text-right">
                                <span className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-50 text-indigo-600 border border-indigo-100">
                                  {conversion}%
                                </span>
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
                  <button className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all active:scale-95">
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isSuperAdmin && activeTab === 'billing' && (
            <div className="max-w-4xl space-y-8">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Estado de Suscripción</p>
                      <h3 className="text-3xl font-black">Plan {currentStore?.billing.plan.toUpperCase()} Activo</h3>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${
                      currentStore?.billing.status === BillingStatus.PAID 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {currentStore?.billing.status === BillingStatus.PAID ? 'Al día' : 'Pendiente / Trial'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Próximo Pago</p>
                      <p className="text-xl font-bold">{currentStore ? new Date(currentStore.billing.nextBillingDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Mensual</p>
                      <p className="text-xl font-bold">$49.00</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Método de Pago</p>
                      <p className="text-xl font-bold flex items-center gap-2">•••• 4242 <CreditCard className="w-4 h-4 text-indigo-400" /></p>
                    </div>
                  </div>
                </div>
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

        </div>

        {/* MODAL CREAR MARCA */}
        {showCreateBrand && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
              <h3 className="text-2xl font-black text-slate-900 mb-8">Nueva Marca</h3>
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
        {showAdRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
              <h3 className="text-2xl font-black text-slate-900 mb-8">Solicitar Campaña Publicitaria</h3>
              <div className="space-y-6">
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
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Descripción / Objetivo</label>
                  <textarea 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold outline-none transition-all h-32 resize-none"
                    placeholder="Describe el contenido y dónde quieres que se muestre..."
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
                    {stores.filter(s => s.brandId === brands.find(b => b.ownerId === user.id)?.id).map(s => (
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
                    Enviar Solicitud
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string, theme: any }> = ({ active, onClick, icon, label, theme }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all group ${
      active 
        ? `${theme.primary} text-white shadow-2xl ${theme.shadow} scale-[1.02]`
        : 'text-slate-500 hover:text-white hover:bg-white/5'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 transition-transform group-hover:scale-110` })}
    <span className="text-[11px] uppercase tracking-widest">{label}</span>
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
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
      <div className={`w-12 h-12 ${s.icon} text-white rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:rotate-6 transition-transform`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <h4 className="text-3xl font-black text-slate-900">{value}</h4>
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

export default AdminDashboard;
