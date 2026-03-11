
import React, { useState, useMemo } from 'react';
import { Role, User, Product, FittingSession, SessionStatus, ItemStatus, SessionItem, StoreConfig, ItemExitDestination } from '../types';
import { 
  LogOut, 
  Plus, 
  Scan, 
  User as UserIcon, 
  ArrowRightLeft, 
  Smartphone,
  Sparkles
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
}

const WorkerApp: React.FC<WorkerAppProps> = ({ 
  user, onLogout, products, setProducts, sessions, setSessions, addLog, allUsers, storeConfig, onCloseSession
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerCountryCode, setNewCustomerCountryCode] = useState('+57');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [lastNewProduct, setLastNewProduct] = useState<string | null>(null);

  const activeSessions = useMemo(() => 
    sessions.filter(s => s.status === SessionStatus.ACTIVE && s.workerId === user.id),
    [sessions, user.id]
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
      customerName: '', // Optional name
      fittingRoomId: selectedRoomId,
      workerId: user.id,
      status: SessionStatus.ACTIVE,
      items: [],
      startTime: Date.now(),
    };
    setSessions(prev => [...prev, newSession]);
    setNewCustomerPhone('');
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 leading-tight">{user.name}</h1>
            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
               En Turno
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={onLogout} className="w-12 h-12 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all" title="Volver al Inicio">
            <Smartphone className="w-6 h-6 mx-auto" />
          </button>
           <button onClick={() => setIsTransferring(true)} className="w-12 h-12 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all">
            <ArrowRightLeft className="w-6 h-6 mx-auto" />
          </button>
          <button onClick={onLogout} className="w-12 h-12 text-slate-400 hover:text-red-600 rounded-2xl transition-all" title="Cerrar Sesión">
            <LogOut className="w-6 h-6 mx-auto" />
          </button>
        </div>
      </header>

      {lastNewProduct && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
           <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-bold">¡Nuevo SKU registrado: {lastNewProduct}!</span>
           </div>
        </div>
      )}

      <main className="p-6 max-w-4xl mx-auto">
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

      <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-30">
          <button 
            onClick={() => setIsNewSessionModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-20 w-full max-w-md rounded-[2rem] flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95"
          >
            <Plus className="w-8 h-8" />
            <span className="text-xl tracking-tight">NUEVA ENTRADA</span>
          </button>
      </div>

      {isNewSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
              <h3 className="text-2xl font-black text-slate-900 mb-6 text-center">Nueva Entrada</h3>
              
              <div className="space-y-6">
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
                  <div className="grid grid-cols-4 gap-3">
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
    </div>
  );
};

export default WorkerApp;
