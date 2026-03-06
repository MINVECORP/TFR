
import React, { useState, useMemo } from 'react';
import { Role, User, Product, FittingSession, SessionStatus, ItemStatus, SessionItem } from '../types';
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
}

const WorkerApp: React.FC<WorkerAppProps> = ({ 
  user, onLogout, products, setProducts, sessions, setSessions, addLog, allUsers 
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [lastNewProduct, setLastNewProduct] = useState<string | null>(null);

  const activeSessions = useMemo(() => 
    sessions.filter(s => s.status === SessionStatus.ACTIVE && s.workerId === user.id),
    [sessions, user.id]
  );

  const startNewSession = (name: string) => {
    const finalName = name.trim() || `Cliente #${activeSessions.length + 1}`;
    const newSession: FittingSession = {
      id: Math.random().toString(36).substr(2, 9),
      customerName: finalName,
      workerId: user.id,
      status: SessionStatus.ACTIVE,
      items: [],
      startTime: Date.now(),
    };
    setSessions(prev => [...prev, newSession]);
    setNewCustomerName('');
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

  const handleCloseSession = (sessionId: string, itemsToSell: string[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        itemsToSell.forEach(sku => addLog(sku, 'sold'));
        return { ...s, status: SessionStatus.CLOSED, endTime: Date.now() };
      }
      return s;
    }));
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
           <button onClick={() => setIsTransferring(true)} className="w-12 h-12 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all">
            <ArrowRightLeft className="w-6 h-6 mx-auto" />
          </button>
          <button onClick={onLogout} className="w-12 h-12 text-slate-400 hover:text-red-600 rounded-2xl transition-all">
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
                onClose={(soldItems) => handleCloseSession(session.id, soldItems)}
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
              <h3 className="text-2xl font-black text-slate-900 mb-6 text-center">¿Quién ingresa?</h3>
              <input 
                type="text" 
                autoFocus
                placeholder="Nombre o Probador #..."
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startNewSession(newCustomerName)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-6 text-xl font-bold mb-6 text-center focus:border-indigo-600 outline-none"
              />
              <div className="flex gap-4">
                <button onClick={() => setIsNewSessionModalOpen(false)} className="flex-1 font-bold text-slate-400">Cancelar</button>
                <button onClick={() => startNewSession(newCustomerName)} className="flex-[2] bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl">CONTINUAR</button>
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
