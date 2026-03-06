
import React, { useState, useMemo } from 'react';
import { User, Product, InventoryLog, FittingSession, TimeRange, Role } from '../types';
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
  Store,
  MapPin,
  Activity,
  Layers,
  History,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line } from 'recharts';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  logs: InventoryLog[];
  sessions: FittingSession[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, products, setProducts, logs, sessions }) => {
  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  
  // Tabs diferenciadas por rol
  const [activeTab, setActiveTab] = useState<string>(isSuperAdmin ? 'global' : 'overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('day');

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

  const COLORS = ['#6366f1', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR DIFERENCIADO */}
      <aside className={`hidden lg:flex w-80 flex-col transition-all duration-500 ${isSuperAdmin ? 'bg-slate-950 shadow-[20px_0_60px_rgba(0,0,0,0.4)]' : 'bg-slate-900 shadow-xl'}`}>
        <div className="p-8">
           <div className="flex items-center gap-4 mb-10">
              <div className={`${theme.primary} p-3 rounded-2xl shadow-2xl transform hover:rotate-6 transition-all`}>
                 {isSuperAdmin ? <Crown className="w-6 h-6 text-white" /> : <Store className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight leading-none">FittingPro</h1>
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 ${theme.text}`}>
                   {isSuperAdmin ? 'Plataforma Global' : 'Gestor Local'}
                </p>
              </div>
           </div>
           
           <nav className="space-y-2">
             {isSuperAdmin ? (
               <>
                 <SidebarItem active={activeTab === 'global'} onClick={() => setActiveTab('global')} icon={<Activity />} label="Visión Global" theme={theme} />
                 <SidebarItem active={activeTab === 'stores'} onClick={() => setActiveTab('stores')} icon={<Building2 />} label="Sedes / Tiendas" theme={theme} />
                 <SidebarItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users />} label="Directorio Admin" theme={theme} />
                 <SidebarItem active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<ShieldCheck />} label="Seguridad" theme={theme} />
               </>
             ) : (
               <>
                 <SidebarItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 />} label="Mi Tienda" theme={theme} />
                 <SidebarItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package />} label="Control Stock" theme={theme} />
                 <SidebarItem active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon={<Users />} label="Mi Equipo" theme={theme} />
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
                <StatCard label="Tiendas Activas" value="12" icon={<Building2 />} theme="amber" />
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
                    <BarChart data={[
                      { name: 'Tienda Sur', ventas: 450, visitas: 1200 },
                      { name: 'Tienda Norte', ventas: 380, visitas: 950 },
                      { name: 'Online Pick', ventas: 520, visitas: 1400 },
                      { name: 'Sede Este', ventas: 290, visitas: 800 },
                    ]}>
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

          {isSuperAdmin && activeTab === 'stores' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[1,2,3].map(i => (
                 <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-amber-500/40 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-amber-500">
                          <Store className="w-8 h-8" />
                       </div>
                       <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg uppercase tracking-widest">En Línea</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900">Tienda Regional {i}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium italic">Calle Principal #123, Ciudad Capital</p>
                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gerente</p>
                          <p className="text-sm font-bold text-slate-700">Usuario Tienda {i}</p>
                       </div>
                       <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-amber-500 transition-colors">
                          <Settings className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
               ))}
               <button className="border-2 border-dashed border-slate-200 p-8 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 hover:border-amber-500 hover:text-amber-500 transition-all group">
                  <Plus className="w-10 h-10 mb-4 transform group-hover:scale-110 transition-transform" />
                  <span className="font-black text-xs uppercase tracking-widest">Dar de alta nueva sede</span>
               </button>
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
                    <h3 className="text-xl font-black text-slate-900 mb-8">Flujo de Probadores (Últimas 24h)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { h: '09:00', v: 4 }, { h: '11:00', v: 12 }, { h: '13:00', v: 18 }, { h: '15:00', v: 15 }, { h: '17:00', v: 22 }, { h: '19:00', v: 9 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 0 }} />
                        </LineChart>
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
                    <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                      Ver Reporte Detallado
                    </button>
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
                  <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200">Exportar Stock</button>
                </div>
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

          {/* TAB COMÚN (PARA AMBOS ADMINS PERO CON DATOS FILTRADOS) */}
          {(activeTab === 'users' || activeTab === 'staff') && (
            <div className="space-y-6">
              <div className="flex justify-between items-end mb-4">
                 <h3 className="text-2xl font-black text-slate-900">
                    {isSuperAdmin ? 'Administradores del Sistema' : 'Personal de Piso (Staff)'}
                 </h3>
                 <button className={`px-6 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all ${theme.primary}`}>
                    Registrar Nuevo
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center gap-5 hover:shadow-lg transition-all">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ${theme.primary}`}>
                      U
                    </div>
                    <div>
                      <p className="font-black text-slate-900">Usuario {i}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {isSuperAdmin ? 'Admin Nivel Tienda' : 'Asesor de Ventas'}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-[9px] font-black text-slate-400 uppercase">Activo</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
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
