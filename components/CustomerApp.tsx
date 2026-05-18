
import React, { useState, useMemo, useEffect } from 'react';
import { FittingSession, Product, ItemStatus, ItemExitDestination, SessionStatus } from '../types';
import { 
  ShoppingBag, 
  CreditCard, 
  Package, 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft,
  Smartphone,
  Star,
  Info,
  Clock,
  X,
  Palette,
  Maximize2,
  Camera,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VirtualMirror from './VirtualMirror';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onTryOn: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose, onTryOn }) => {
  const colors = Array.from(new Set(product.variations.map(v => v.color)));
  const sizes = Array.from(new Set(product.variations.map(v => v.size)));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-transparent dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors z-20 shadow-md transition-all"
        >
          <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </button>

        <div className="h-64 relative overflow-hidden group">
          <img 
            src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/400`} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={product.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
            <div className="w-full flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black text-white/80 uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-md mb-2 inline-block">
                  {product.category}
                </span>
                <h3 className="text-2xl font-black text-white leading-tight">{product.name}</h3>
              </div>
              <button 
                onClick={onTryOn}
                className="bg-rose-500 hover:bg-rose-600 text-white p-4 rounded-2xl shadow-xl transition-all active:scale-90 flex items-center gap-2 group/btn"
              >
                <Camera className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Espejo Virtual</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-black text-slate-900">${product.price}</span>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-black text-slate-600">4.9 (120 reviews)</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-rose-500" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Colores Disponibles</h4>
            </div>
            <div className="flex flex-wrap gap-3">
              {colors.map(color => (
                <div key={color} className="group relative">
                  <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-rose-500 hover:bg-rose-50 transition-all cursor-default">
                    {color}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-indigo-500" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tallas Disponibles</h4>
            </div>
            <div className="flex flex-wrap gap-3">
              {sizes.map(size => (
                <div key={size} className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900">
                  {size}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
              Si deseas probarte otro color o talla, por favor indícalo a nuestro staff a través de la pantalla de ayuda o solicítalo en la salida.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface CustomerAppProps {
  session: FittingSession;
  products: Product[];
  onPayment: (itemsToBuy: string[]) => void;
  onLogout: () => void;
  brandName?: string;
}

const CustomerApp: React.FC<CustomerAppProps> = ({ 
  session, 
  products, 
  onPayment, 
  onLogout,
  brandName = "Retail Store"
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isMirrorOpen, setIsMirrorOpen] = useState(false);
  const [mirrorProduct, setMirrorProduct] = useState<Product | null>(null);

  // Initialize selection based on audit if available
  useEffect(() => {
    if (session.status === SessionStatus.AWAITING_PAYMENT) {
      const auditedPurchaseItems = session.items
        .filter(i => i.exitDestination === ItemExitDestination.PURCHASE)
        .map(i => i.sku);
      setSelectedItems(new Set(auditedPurchaseItems));
      setStep('checkout'); // Go straight to checkout if staff finished audit
    } else {
      setSelectedItems(new Set(session.items.map(i => i.sku)));
    }
  }, [session.id, session.status]);

  const itemsWithData = useMemo(() => {
    return session.items.map(item => {
      const product = products.find(p => p.variations?.some(v => v.sku === item.sku));
      return {
        ...item,
        product
      };
    });
  }, [session.items, products]);

  const toggleItem = (sku: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(sku)) {
      newSelected.delete(sku);
    } else {
      newSelected.add(sku);
    }
    setSelectedItems(newSelected);
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    itemsWithData.forEach(item => {
      if (selectedItems.has(item.sku)) {
        subtotal += (item.product?.price || 0) * item.quantity;
      }
    });
    return { subtotal, total: subtotal };
  }, [itemsWithData, selectedItems]);

  const handlePay = async () => {
    setIsProcessing(true);
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    onPayment(Array.from(selectedItems));
    setStep('success');
    setIsProcessing(false);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-emerald-600 flex flex-col items-center justify-center p-8 text-white text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <h1 className="text-3xl font-black mb-4">¡Pago Exitoso!</h1>
        <p className="text-emerald-100 font-medium mb-12">Gracias por tu compra. Puedes retirar tus prendas en la salida del probador.</p>
        <button 
          onClick={onLogout}
          className="w-full max-w-xs bg-white text-emerald-600 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl"
        >
          Finalizar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-32 transition-colors duration-500">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-6 py-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{brandName}</h1>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Probador #{session.fittingRoomId}</p>
          </div>
        </div>
        <button onClick={onLogout} className="p-2 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-rose-500 transition-colors">
          Salir
        </button>
      </header>

      <main className="p-6 max-w-lg mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {step === 'cart' ? (
            <motion.div 
              key="cart"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tus Favoritos</h2>
                  <p className="text-sm font-medium text-slate-500">Selecciona lo que deseas llevar</p>
                </div>
                <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Items: {itemsWithData.length}</span>
                </div>
              </div>

              <div className="space-y-4">
                {itemsWithData.map((item) => (
                  <motion.div 
                    key={item.sku}
                    layout
                    className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center gap-5 ${
                      selectedItems.has(item.sku) 
                        ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100' 
                        : 'border-slate-100 bg-white opacity-60'
                    }`}
                    onClick={() => toggleItem(item.sku)}
                  >
                    <div className="w-20 h-24 rounded-2xl overflow-hidden shadow-sm relative">
                      <img 
                        src={item.product?.imageUrl || `https://picsum.photos/seed/${item.sku}/200`} 
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {selectedItems.has(item.sku) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.product?.category || 'General'}</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.product) setDetailProduct(item.product);
                          }}
                          className="p-1 px-2.5 bg-slate-100 rounded-lg text-slate-400 hover:bg-indigo-600 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest"
                        >
                          Ver Variaciones
                        </button>
                      </div>
                      <h4 className="font-black text-slate-900 text-lg leading-tight truncate">{item.product?.name || 'Producto sin nombre'}</h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-lg font-black text-indigo-600">${item.product?.price || 0}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {itemsWithData.length === 0 && (
                <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-[3rem]">
                  <Smartphone className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm">Escanea prendas para que aparezcan aquí.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <button 
                onClick={() => setStep('cart')}
                className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>

              {session.status === SessionStatus.AWAITING_PAYMENT && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-8 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-emerald-900 font-black text-sm uppercase tracking-tight">Arqueo Finalizado</h3>
                    <p className="text-emerald-700/60 text-[10px] font-bold uppercase tracking-widest">El staff ha verificado tus prendas. Completa el pago.</p>
                  </div>
                </motion.div>
              )}

              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Confirmar Pago</h2>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resumen de Compra</h4>
                  {Array.from(selectedItems).map(sku => {
                    const item = itemsWithData.find(i => i.sku === sku);
                    return (
                      <div key={sku} className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-600">{item?.product?.name} (x{item?.quantity})</span>
                        <span className="font-black text-slate-900">${(item?.product?.price || 0) * (item?.quantity || 1)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                      <p className="text-4xl font-black text-slate-900">${totals.total}</p>
                   </div>
                   <div className="bg-indigo-600/10 text-indigo-600 px-4 py-2 rounded-xl text-xs font-black">
                      IVA Incluido
                   </div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex items-start gap-4">
                <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                  Al confirmar, recibirás una factura digital y podrás retirar tus prendas con el sensor desactivado en la salida.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-6">
          <div className="hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</p>
            <p className="text-xl font-black text-slate-900">${totals.total}</p>
          </div>
          
          <button 
            disabled={selectedItems.size === 0 || isProcessing}
            onClick={() => step === 'cart' ? setStep('checkout') : handlePay()}
            className="flex-1 bg-slate-900 hover:bg-black text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                {step === 'cart' ? <ChevronRight className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                {step === 'cart' ? 'Continuar al Pago' : 'Confirmar y Pagar'}
              </>
            )}
          </button>
        </div>
      </footer>

      <AnimatePresence>
        {detailProduct && (
          <ProductDetail 
            product={detailProduct} 
            onClose={() => setDetailProduct(null)} 
            onTryOn={() => {
              setMirrorProduct(detailProduct);
              setIsMirrorOpen(true);
              setDetailProduct(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMirrorOpen && mirrorProduct && (
          <VirtualMirror 
            product={mirrorProduct} 
            onClose={() => setIsMirrorOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerApp;
