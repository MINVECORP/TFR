
import React, { useMemo } from 'react';
import { User, Customer, Product, Brand, Store, ItemExitDestination } from '../types';
import { 
  Smartphone, 
  History, 
  ShoppingBag, 
  LogOut, 
  Star, 
  TrendingUp, 
  Tag, 
  Sparkles, 
  ArrowRight,
  Store as StoreIcon,
  Ticket
} from 'lucide-react';
import { motion } from 'motion/react';

interface CustomerProfileProps {
  user: User;
  customerData?: Customer;
  products: Product[];
  brands: Brand[];
  stores: Store[];
  onLogout: () => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ 
  user, 
  customerData, 
  products, 
  brands,
  stores,
  onLogout 
}) => {
  // 1. Calculate Recommended Offers (Items tried but not bought)
  const offers = useMemo(() => {
    if (!customerData) return [];
    const leftSkus = new Set(customerData.history.flatMap(h => h.itemsLeft || []));
    return products.filter(p => p.variations.some(v => leftSkus.has(v.sku))).slice(0, 4);
  }, [customerData, products]);

  // 2. Calculate Complementary Items (Simplified logic: same category as items bought)
  const complementary = useMemo(() => {
    if (!customerData) return [];
    const soldSkus = new Set(customerData.history.flatMap(h => h.itemsSold || []));
    const boughtCategories = new Set(
      products
        .filter(p => p.variations.some(v => soldSkus.has(v.sku)))
        .map(p => p.category)
    );
    return products
      .filter(p => boughtCategories.has(p.category) && !p.variations.some(v => soldSkus.has(v.sku)))
      .slice(0, 4);
  }, [customerData, products]);

  // 3. User's visited Brands
  const visitedBrands = useMemo(() => {
    if (!customerData) return [];
    const visitedStoreIds = new Set(customerData.history.map(h => h.storeId));
    const brandIds = new Set(
      stores
        .filter(s => visitedStoreIds.has(s.id))
        .map(s => s.brandId)
    );
    return brands.filter(b => brandIds.has(b.id));
  }, [customerData, stores, brands]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-32 transition-colors duration-500">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-8 shadow-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Mi Probador</h1>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">{user.email}</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-6 max-w-xl mx-auto space-y-12 mt-4">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">¡Hola, {user.name}!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tu closet digital está listo con ofertas exclusivas.</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 px-6 py-3 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
             <Ticket className="w-5 h-5 text-amber-500" />
             <div className="text-left">
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">Puntos acumulados</p>
                <p className="text-lg font-black text-amber-600 dark:text-amber-400">1,250</p>
             </div>
          </div>
        </div>

        {/* MARKETPLACE: Offers for left items */}
        {offers.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-rose-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Ofertas para Ti</h3>
              </div>
              <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Ver Todo</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {offers.map((product, idx) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-4 shadow-sm group cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden relative mb-4">
                    <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                    <div className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg">
                      -20% OFF
                    </div>
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white text-xs truncate">{product.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-900 dark:text-white font-extrabold text-sm">${product.price * 0.8}</span>
                    <span className="text-slate-400 dark:text-slate-500 font-bold text-[10px] line-through">${product.price}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* MARKETPLACE: Visited Brands (Sub-stores) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <StoreIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Mis Tiendas</h3>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar no-scrollbar">
            {visitedBrands.length === 0 ? (
               <div className="text-center w-full py-8 bg-slate-100 dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Aún no visitas marcas registradas</p>
               </div>
            ) : (
              visitedBrands.map(brand => (
                <div key={brand.id} className="flex-shrink-0 w-32 group cursor-pointer">
                   <div className="w-full aspect-square bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center justify-center p-6 shadow-sm group-hover:shadow-indigo-500/10 group-hover:border-indigo-200 dark:group-hover:border-indigo-500 transition-all">
                      {brand.logoUrl ? (
                         <img src={brand.logoUrl} className="max-w-full h-auto dark:invert dark:brightness-100" />
                      ) : (
                         <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{brand.name[0]}</span>
                      )}
                   </div>
                   <p className="mt-3 text-center text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest truncate">{brand.name}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Complementary Products */}
        {complementary.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 ml-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Combinan con tu estilo</h3>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar">
              {complementary.map((product, idx) => (
                <div key={product.id} className="flex-shrink-0 w-44 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-4 shadow-sm hover:shadow-xl transition-all">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4">
                    <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name} />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white text-[10px] truncate">{product.name}</h4>
                  <p className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm mt-1">${product.price}</p>
                  <button className="w-full mt-3 py-2 bg-slate-50 dark:bg-slate-800 text-[9px] font-black dark:text-white uppercase tracking-widest rounded-lg hover:bg-slate-900 dark:hover:bg-slate-100 hover:text-white dark:hover:text-slate-900 transition-all">
                    Ver más
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classic History View */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <History className="w-5 h-5 text-slate-400 dark:text-slate-600" />
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Todas mis visitas</h3>
          </div>

          {!customerData || customerData.history.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
              <p className="text-slate-400 dark:text-slate-600 font-bold text-sm">Aún no tienes visitas registradas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customerData.history.slice().reverse().map((visit, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={visit.sessionId}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700">
                          <StoreIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                             {brands.find(b => b.id === stores.find(s => s.id === visit.storeId)?.brandId)?.name || 'Tienda Partner'}
                          </p>
                          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">{new Date(visit.timestamp).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                      <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">{visit.itemsSold.length} Comprados</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {visit.itemsSold.map((sku, sIdx) => {
                       const product = products.find(p => p.sku === sku || p.variations?.some(v => v.sku === sku));
                       return (
                         <div key={`${sku}-${sIdx}`} className="w-12 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform">
                            {product?.imageUrl ? (
                              <img src={product.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-[8px] font-black text-slate-300 dark:text-slate-700">ITEM</div>
                            )}
                         </div>
                       );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Shop Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
         <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 group active:scale-95 transition-all">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] pt-0.5">Tienda Online</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
         </button>
      </div>
    </div>
  );
};

export default CustomerProfile;
