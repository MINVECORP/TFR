import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, ChevronRight } from 'lucide-react';

interface MarketingNotificationPreviewProps {
  storeName: string;
  productName?: string;
  productImage?: string;
  title?: string;
  message?: string;
  buttonText?: string;
}

export const MarketingNotificationPreview: React.FC<MarketingNotificationPreviewProps> = ({
  storeName,
  productName = "Vestido Floral",
  productImage = "https://images.unsplash.com/photo-1539109132384-361555754525?auto=format&fit=crop&w=300&q=80",
  title = "¡Vuelve por lo que amas!",
  message,
  buttonText = "Comprar Ahora"
}) => {
  const defaultMessage = `Tu probador en ${storeName} sigue guardando tus favoritos.`;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={title} // Force re-animation on title change
      className="w-full max-w-[320px] bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl border border-slate-200/50 overflow-hidden font-sans"
    >
      {/* Notification Header */}
      <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-indigo-600 rounded-md flex items-center justify-center">
            <ShoppingBag className="w-3 h-3 text-white" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notificación</span>
        </div>
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Ahora</span>
      </div>

      {/* Notification Content */}
      <div className="p-5 space-y-4">
        <div className="flex gap-4">
          {/* Garment Thumbnail */}
          <div className="relative group">
            <div className="w-20 h-24 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <img 
                src={productImage} 
                alt={productName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 bg-white rounded-full"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-black text-slate-900 leading-tight">
              {title}
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              {message || defaultMessage}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group shadow-xl shadow-slate-200">
          {buttonText}
          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Footer Hint */}
      <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-center">
        <div className="w-12 h-1 bg-slate-200 rounded-full" />
      </div>
    </motion.div>
  );
};
