
import React, { useState, useEffect } from 'react';
import { FittingSession, Product, ItemStatus } from '../types';
// Fixed: Added missing Package and X icons to the lucide-react import
import { Clock, Plus, LogOut, CheckCircle2, ChevronRight, ShoppingBag, Trash2, Package, X } from 'lucide-react';

interface SessionCardProps {
  session: FittingSession;
  products: Product[];
  onAddItems: () => void;
  onClose: (soldItems: string[]) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, products, onAddItems, onClose }) => {
  const [elapsedMins, setElapsedMins] = useState(0);
  const [elapsedStr, setElapsedStr] = useState('00:00');
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [selectedForSale, setSelectedForSale] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const updateTimer = () => {
      const diff = Date.now() - session.startTime;
      const totalSecs = Math.floor(diff / 1000);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      setElapsedMins(mins);
      setElapsedStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };
    
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [session.startTime]);

  const getStatusStyle = () => {
    if (elapsedMins < 10) return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' };
    if (elapsedMins < 20) return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' };
    return { bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50' };
  };

  const style = getStatusStyle();

  const sessionItemsWithData = session.items.map(item => ({
    ...item,
    data: products.find(p => p.sku === item.sku)
  }));

  const toggleSale = (sku: string) => {
    setSelectedForSale(prev => ({ ...prev, [sku]: !prev[sku] }));
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-2 h-full ${style.bg}`}></div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{session.customerName}</h3>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mt-2 ${style.light} ${style.text}`}>
            <Clock className="w-3 h-3" />
            {elapsedStr}
          </div>
        </div>
        <button 
          onClick={onAddItems}
          className="p-3 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-2xl text-slate-400 transition-all active:scale-90"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-3 mb-8 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {sessionItemsWithData.length === 0 ? (
          <div className="flex flex-col items-center py-4 text-slate-300">
             <Package className="w-8 h-8 opacity-20 mb-2" />
             <p className="text-[10px] font-black uppercase tracking-widest">Sin prendas</p>
          </div>
        ) : (
          sessionItemsWithData.map((item, idx) => (
            <div key={`${item.sku}-${idx}`} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 group/item">
              <div className="flex flex-col max-w-[70%]">
                <span className="text-sm font-bold text-slate-800 truncate">
                  {item.data?.name || 'Item Desconocido'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white px-2.5 py-1 rounded-lg text-xs font-black text-indigo-600 shadow-sm border border-slate-100">
                  x{item.quantity}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <button 
        onClick={() => setIsClosingModal(true)}
        className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-black text-white py-5 rounded-[1.5rem] font-black transition-all text-sm shadow-lg shadow-slate-200"
      >
        <LogOut className="w-5 h-5" />
        ARQUEO Y SALIDA
      </button>

      {/* Close/Checkout Modal */}
      {isClosingModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl rounded-t-[3rem] sm:rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-900">Salida de Cliente</h3>
                <p className="text-slate-500 font-medium mt-1">Marca las prendas que se llevan a caja.</p>
              </div>
              <button 
                onClick={() => setIsClosingModal(false)}
                className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 mb-10 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {sessionItemsWithData.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => toggleSale(item.sku)}
                  className={`w-full flex items-center justify-between p-6 rounded-3xl transition-all border-2 text-left ${
                    selectedForSale[item.sku] 
                      ? 'border-indigo-600 bg-indigo-50 shadow-indigo-100' 
                      : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      selectedForSale[item.sku] ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300'
                    }`}>
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className={`font-black ${selectedForSale[item.sku] ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {item.data?.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.sku}</p>
                    </div>
                  </div>
                  {selectedForSale[item.sku] ? (
                    <div className="bg-indigo-600 p-1 rounded-full">
                       <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-slate-200"></div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => onClose(Object.keys(selectedForSale).filter(k => selectedForSale[k]))}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl shadow-indigo-900/40 text-lg transition-all active:scale-95"
              >
                <CheckCircle2 className="w-6 h-6" />
                CONFIRMAR ARQUEO
              </button>
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Esta acción liberará el probador y actualizará el inventario
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SessionCard;
