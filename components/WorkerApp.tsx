
import React, { useState, useMemo } from 'react';
import { Role, User, Product, FittingSession, SessionStatus, ItemStatus, SessionItem, StoreConfig, ItemExitDestination, InventoryAlert, AdRequest } from '../types';
import { 
  LogOut, 
  Plus, 
  Scan, 
  User as UserIcon, 
  ArrowRightLeft, 
  Smartphone,
  Sparkles,
  Bell,
  X,
  AlertTriangle
} from 'lucide-react';
import ScannerOverlay from './ScannerOverlay';
import SessionCard from './SessionCard';

interface WorkerAppProps {
  user: User;
  onLogout: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sessions: FittingSession[];
  setSessions: React.Dispatch<React.SetStateAction<FittingSession[]>>;
  addLog: (sku: string, action: 'tried_on' | 'sold') => void;
  allUsers: User[];
  storeConfig: StoreConfig;
  onCloseSession: (sessionId: string, auditData: Record<string, ItemExitDestination>) => void;
  inventoryAlerts: InventoryAlert[];
  setInventoryAlerts: React.Dispatch<React.SetStateAction<InventoryAlert[]>>;
  adRequests: AdRequest[];
}

const WorkerApp: React.FC<WorkerAppProps> = ({ 
  user, onLogout, products, setProducts, sessions, setSessions, addLog, allUsers, storeConfig, onCloseSession, inventoryAlerts, setInventoryAlerts, adRequests
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerCountryCode, setNewCustomerCountryCode] = useState('+57');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [lastNewProduct, setLastNewProduct] = useState<string | null>(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const unreadAlertsCount = useMemo(() => 
    inventoryAlerts.filter(a => !a.isRead && a.workerId === user.id).length,
    [inventoryAlerts, user.id]
  );

  const myAlerts = useMemo(() => 
    inventoryAlerts.filter(a => a.workerId === user.id),
    [inventoryAlerts, user.id]
  );

  const markAlertsAsRead = () => {
    setInventoryAlerts(prev => prev.map(a => 
      a.workerId === user.id ? { ...a, isRead: true } : a
    ));
  };

  const shiftStats = useMemo(() => {
    const myClosedSessions = sessions.filter(s => s.status === SessionStatus.CLOSED && s.workerId === user.id);
    let missing = 0;
    let relocation = 0;
    let purchase = 0;

    myClosedSessions.forEach(s => {
      s.items.forEach(item => {
        if (item.exitDestination === ItemExitDestination.MISSING) missing += item.quantity;
        if (item.exitDestination === ItemExitDestination.RELOCATION) relocation += item.quantity;
        if (item.exitDestination === ItemExitDestination.PURCHASE) purchase += item.quantity;
      });
    });

    return { missing, relocation, purchase };
  }, [sessions, user.id]);

  const activeSessions = useMemo(() => 
    sessions.filter(s => s.status === SessionStatus.ACTIVE && s.workerId === user.id),
    [sessions, user.id]
  );

  const activeAds = useMemo(() => 
    adRequests.filter(ad => (ad.status === 'running' || ad.status === 'active') && (!ad.storeId || ad.storeId === user.storeId)),
    [adRequests, user.storeId]
  );

  const occupiedRooms = useMemo(() => 
    sessions.filter(s => s.status === SessionStatus.ACTIVE).map(s => s.fittingRoomId),
    [sessions]
  );

  const startNewSession = () => {
    if (!newCustomerPhone.trim() || selectedRoomId === null) return;

    const newSession: FittingSession = {
      id: Math.random().toString(36).substr(2, 9),
      customerPhone: newCustomerPhone.trim(),
      customerName: newCustomerName.trim(),
      fittingRoomId: selectedRoomId,
      workerId: user.id,
      status: SessionStatus.ACTIVE,
      items: [],
      startTime: Date.now(),
    };
    setSessions(prev => [...prev, newSession]);
    setNewCustomerPhone('');
    setNewCustomerName('');
    setSelectedRoomId(null);
    setActiveSessionId(newSession.id);
    setIsNewSessionModalOpen(false);
    setIsScannerOpen(true);
  };

  const handleScanSuccess = (sku: string) => {
    if (!activeSessionId || !sku) return;
    
    // Normalizar SKU para evitar espacios
    const cleanSku = sku.trim();
    
    const productExists = products.some(p => p.sku === cleanSku);
    
    // Si el producto no existe (nuevo código de barras no cargado), lo creamos al vuelo
    if (!productExists) {
      const newAutoProduct: Product = {
        sku: cleanSku,
        name: `Producto ${cleanSku.slice(-6)}`,
        category: 'Ingreso Temporal',
        price: 0,
        stock: 1
      };
      setProducts(prev => [...prev, newAutoProduct]);
      setLastNewProduct(cleanSku);
      setTimeout(() => setLastNewProduct(null), 3000);
    }

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const existingItemIndex = s.items.findIndex(i => i.sku === cleanSku && i.status === ItemStatus.IN);
        
        if (existingItemIndex > -1) {
          const updatedItems = [...s.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1
          };
          return { ...s, items: updatedItems };
        }
        
        return {
          ...s,
          items: [...s.items, { sku: cleanSku, quantity: 1, status: ItemStatus.IN }]
        };
      }
      return s;
    }));
    
    addLog(cleanSku, 'tried_on');
  };

  const handleCloseSession = (sessionId: string, auditData: Record<string, ItemExitDestination>) => {
    onCloseSession(sessionId, auditData);
  };

  return (
    <div className="pb-32 bg-slate-50 min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-black shadow-lg text-sm sm:text-base">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate max-w-[120px] sm:max-w-none">{user.name}</h1>
            <span className="text-[9px] sm:text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1">
               <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
               En Turno
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
           <button 
            onClick={() => {
              setIsAlertsOpen(true);
              markAlertsAsRead();
            }} 
            className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 hover:text-indigo-600 rounded-xl sm:rounded-2xl transition-all relative" 
            title="Alertas"
          >
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {unreadAlertsCount}
              </span>
            )}
          </button>
           <button onClick={onLogout} className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 hover:text-indigo-600 rounded-xl sm:rounded-2xl transition-all" title="Volver al Inicio">
            <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" />
          </button>
           <button onClick={() => setIsTransferring(true)} className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 hover:text-indigo-600 rounded-xl sm:rounded-2xl transition-all">
            <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" />
          </button>
          <button onClick={onLogout} className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 hover:text-red-600 rounded-xl sm:rounded-2xl transition-all" title="Cerrar Sesión">
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" />
          </button>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex sm:flex-col items-center sm:items-start justify-between sm:justify-start">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-0 sm:mb-1">Faltantes</p>
            <p className="text-xl font-black text-slate-900">{shiftStats.missing}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex sm:flex-col items-center sm:items-start justify-between sm:justify-start">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-0 sm:mb-1">Reubicación</p>
            <p className="text-xl font-black text-slate-900">{shiftStats.relocation}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex sm:flex-col items-center sm:items-start justify-between sm:justify-start">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0 sm:mb-1">Ventas</p>
            <p className="text-xl font-black text-slate-900">{shiftStats.purchase}</p>
          </div>
        </div>
      </div>

      {lastNewProduct && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
           <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-bold">¡Nuevo SKU registrado: {lastNewProduct}!</span>
           </div>
        </div>
      )}

      <main className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Banner Publicitario */}
        {activeAds.length > 0 && (
          <div className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl shadow-indigo-200/50">
            <div className="flex animate-in fade-in duration-1000">
              {activeAds.map((ad, idx) => (
                <div key={ad.id} className={`${idx === 0 ? 'block' : 'hidden'} w-full relative h-48 sm:h-56 overflow-hidden`}>
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.title} 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.3em]">Campaña Destacada</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">{ad.title}</h2>
                    <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-xl line-clamp-2">{ad.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {activeAds.length > 1 && (
              <div className="absolute top-4 right-6 flex gap-1.5">
                {activeAds.map((_, i) => (
                  <div key={i} className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/30'}`}></div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-end mb-8">
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Probadores</h2>
              <p className="text-sm font-medium text-slate-500">Sesiones en curso</p>
           </div>
           <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-slate-100 text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Activos</span>
              <span className="text-xl font-black text-indigo-600">{activeSessions.length}</span>
           </div>
        </div>

        {activeSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-slate-100">
              <Smartphone className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Listo para escanear</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-[200px]">Inicia una nueva entrada para registrar prendas.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {activeSessions.map(session => (
              <SessionCard 
                key={session.id} 
                session={session} 
                products={products}
                onAddItems={() => {
                  setActiveSessionId(session.id);
                  setIsScannerOpen(true);
                }}
                onClose={(auditData) => handleCloseSession(session.id, auditData)}
              />
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-6 sm:bottom-8 left-0 right-0 px-4 sm:px-6 flex justify-center z-30">
          <button 
            onClick={() => setIsNewSessionModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-16 sm:h-20 w-full max-w-md rounded-2xl sm:rounded-[2rem] flex items-center justify-center gap-3 sm:gap-4 shadow-2xl transition-all active:scale-95"
          >
            <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-lg sm:text-xl tracking-tight">NUEVA ENTRADA</span>
          </button>
      </div>

      {isNewSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
           <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-300">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 text-center">Nueva Entrada</h3>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Nombre del Cliente (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-lg font-bold outline-none transition-all"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Teléfono del Cliente</label>
                  <div className="flex gap-3">
                    <select 
                      value={newCustomerCountryCode}
                      onChange={(e) => setNewCustomerCountryCode(e.target.value)}
                      className="w-24 px-4 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-sm font-bold outline-none transition-all appearance-none"
                    >
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+54">🇦🇷 +54</option>
                      <option value="+56">🇨🇱 +56</option>
                      <option value="+51">🇵🇪 +51</option>
                    </select>
                    <input 
                      type="tel" 
                      autoFocus
                      placeholder="Ej: 300 123 4567"
                      className="flex-1 px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-lg font-bold outline-none transition-all"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Asignar Probador</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {Array.from({ length: storeConfig.fittingRoomsCount }).map((_, i) => {
                      const roomId = i + 1;
                      const isOccupied = occupiedRooms.includes(roomId);
                      return (
                        <button
                          key={roomId}
                          disabled={isOccupied}
                          onClick={() => setSelectedRoomId(roomId)}
                          className={`h-12 rounded-xl font-black text-sm transition-all ${
                            selectedRoomId === roomId 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                              : isOccupied 
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {roomId}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsNewSessionModalOpen(false)}
                    className="flex-1 py-5 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    CANCELAR
                  </button>
                  <button 
                    onClick={startNewSession}
                    disabled={!newCustomerPhone.trim() || selectedRoomId === null}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-200 transition-all"
                  >
                    INICIAR
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {isScannerOpen && (
        <ScannerOverlay 
          onClose={() => setIsScannerOpen(false)} 
          onScan={handleScanSuccess} 
          customerName={sessions.find(s => s.id === activeSessionId)?.customerName || ''}
          products={products}
        />
      )}

      {isTransferring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-center mb-8">Transferir a compañero</h3>
            <div className="space-y-3">
              {allUsers.filter(u => u.id !== user.id && u.role === Role.STAFF).map(otherUser => (
                <button
                  key={otherUser.id}
                  onClick={() => {
                    if(confirm(`Transferir sesiones activas a ${otherUser.name}?`)) {
                      setSessions(prev => prev.map(s => (s.status === SessionStatus.ACTIVE && s.workerId === user.id) ? { ...s, workerId: otherUser.id } : s));
                      setIsTransferring(false);
                      onLogout();
                    }
                  }}
                  className="w-full flex items-center gap-4 p-5 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all group border border-slate-100"
                >
                  <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center font-black shadow-sm">
                    {otherUser.name.charAt(0)}
                  </div>
                  <span className="font-bold">{otherUser.name}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setIsTransferring(false)} className="w-full mt-6 py-4 text-slate-400 font-bold">Cerrar</button>
          </div>
        </div>
      )}

      {isAlertsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
           <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] h-[80vh] sm:h-auto sm:max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">Alertas de Inventario</h3>
                <button onClick={() => setIsAlertsOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {myAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-bold">No tienes alertas pendientes</p>
                  </div>
                ) : (
                  myAlerts.map(alert => (
                    <div key={alert.id} className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex gap-4">
                      <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-1">Producto Faltante</p>
                        <h4 className="text-sm font-black text-slate-900">{alert.productName}</h4>
                        <p className="text-[10px] font-bold text-slate-500 mt-1">SKU: {alert.sku}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-6 border-t border-slate-100">
                <button 
                  onClick={() => setIsAlertsOpen(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest"
                >
                  Entendido
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default WorkerApp;
