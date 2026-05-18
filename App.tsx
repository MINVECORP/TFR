
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Role, User, Product, FittingSession, InventoryLog, Customer, StoreConfig, SessionStatus, Store, BillingStatus, Brand, AdRequest, ItemExitDestination, ItemStatus, InventoryAlert, SMSCampaign } from './types';
import Login from './components/Login';
import WorkerApp from './components/WorkerApp';
import AdminDashboard from './components/AdminDashboard';
import CustomerApp from './components/CustomerApp';
import CustomerProfile from './components/CustomerProfile';
import InstallPrompt from './components/InstallPrompt';
import { initialProducts, initialUsers, initialStores, initialBrands, initialAdRequests, initialCustomers } from './constants';
import { auth, logout } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Store as StoreIcon, CheckCircle2, AlertCircle, ArrowRight, Loader2, Smartphone, Moon, Sun, Monitor } from 'lucide-react';

const StoreCodePrompt: React.FC<{ 
  onJoin: (storeId: string) => void; 
  stores: Store[];
  onLogout: () => void;
}> = ({ onJoin, stores, onLogout }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const store = stores.find(s => s.code.toUpperCase() === code.toUpperCase());
    if (store) {
      onJoin(store.id);
    } else {
      setError('Código de tienda inválido. Por favor verifica con tu administrador.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000")' }}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl animate-in zoom-in duration-500 relative z-10 border border-slate-100 dark:border-slate-800">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 mb-8 mx-auto">
          <StoreIcon className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2">Vincular Tienda</h2>
        <p className="text-slate-400 text-center text-sm mb-8 font-medium">Ingresa el código proporcionado por tu gerente para comenzar a trabajar.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              placeholder="CÓDIGO DE TIENDA"
              className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-black text-center text-xl uppercase tracking-[0.2em] outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
              required
            />
            {error && (
              <div className="flex items-center gap-2 mt-4 text-rose-500 bg-rose-50 p-4 rounded-xl animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-wider leading-tight">{error}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Vincular Ahora
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <button 
          onClick={onLogout}
          className="w-full mt-8 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

const PlanSelection: React.FC<{ 
  onSelect: (plan: any) => void;
  onLogout: () => void;
  isLoading: boolean;
}> = ({ onSelect, onLogout, isLoading }) => {
  const plans = [
    { id: 'basic', name: 'Básico', price: 29, features: ['Hasta 3 Probadores', 'Reportes Básicos', 'Soporte Email'], color: 'bg-slate-50', border: 'border-slate-100' },
    { id: 'pro', name: 'Profesional', price: 49, features: ['Hasta 10 Probadores', 'Reportes Avanzados', 'Soporte 24/7'], color: 'bg-indigo-50', border: 'border-indigo-100', popular: true },
    { id: 'enterprise', name: 'Enterprise', price: 99, features: ['Probadores Ilimitados', 'API Access', 'Account Manager'], color: 'bg-amber-50', border: 'border-amber-100' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000")' }}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 md:p-16 shadow-2xl animate-in zoom-in duration-500 relative z-10 border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 mb-6 mx-auto">
            {isLoading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <CheckCircle2 className="w-8 h-8 text-white" />}
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Selecciona tu Plan de Licencia</h2>
          <p className="text-slate-400 font-medium">Comienza a transformar la experiencia de tus clientes hoy mismo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative p-8 rounded-[2.5rem] border-2 transition-all hover:scale-105 hover:shadow-2xl flex flex-col ${plan.popular ? 'border-indigo-500 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 dark:bg-slate-800' : 'border-slate-100 dark:border-slate-800 dark:bg-slate-800/50'} ${plan.popular ? '' : plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Más Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">${plan.price}</span>
                  <span className="text-sm font-bold text-slate-400">/mes</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onSelect(plan)}
                disabled={isLoading}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  plan.popular ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-600'
                } disabled:opacity-50`}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Seleccionar Plan'}
              </button>
            </div>
          ))}
        </div>

        <button 
          onClick={onLogout}
          disabled={isLoading}
          className="w-full mt-12 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors disabled:opacity-50"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

type Theme = 'light' | 'dark' | 'system';

const ThemeToggle: React.FC<{ theme: Theme; setTheme: (t: Theme) => void; isDark: boolean }> = ({ theme, setTheme, isDark }) => {
  const toggle = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <button 
      onClick={toggle}
      className="fixed bottom-6 left-6 z-[100] w-12 h-12 bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-400 rounded-2xl flex items-center justify-center shadow-2xl border border-slate-200 dark:border-slate-700 transition-all active:scale-95 group overflow-hidden"
      title={theme === 'system' ? "Modo: Sistema" : theme === 'dark' ? "Modo: Oscuro" : "Modo: Claro"}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {theme === 'system' && (
          <div className="flex flex-col items-center">
            <Monitor className="w-5 h-5" />
            <span className="text-[6px] font-black absolute -bottom-1">AUTO</span>
          </div>
        )}
        {theme === 'dark' && <Moon className="w-5 h-5" />}
        {theme === 'light' && <Sun className="w-5 h-5" />}
      </div>
    </button>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved as Theme) || 'system';
    }
    return 'system';
  });

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleThemeChange = () => {
      let isDark = false;
      if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = theme === 'dark';
      }
      
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    };

    handleThemeChange();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => handleThemeChange();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sessions, setSessions] = useState<FittingSession[]>([
    {
      id: 'demo-session',
      customerPhone: '3001234567',
      customerName: 'Cliente Demo',
      fittingRoomId: 3,
      workerId: 'santi-staff',
      storeId: 'store-1',
      status: SessionStatus.ACTIVE,
      startTime: Date.now(),
      items: [
        { sku: '770111222-M', quantity: 1, status: ItemStatus.IN }
      ]
    }
  ]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [adRequests, setAdRequests] = useState<AdRequest[]>(initialAdRequests);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>({ fittingRoomsCount: 5 });
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [smsCampaigns, setSmsCampaigns] = useState<SMSCampaign[]>([]);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [customerSessionId, setCustomerSessionId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    if (sessionId) {
      setCustomerSessionId(sessionId);
    }
  }, []);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await axios.get('/api/geo');
        setUserCountry(response.data.countryCode);
      } catch (error) {
        console.error("Geo detection error:", error);
      }
    };
    detectCountry();
  }, []);

  useEffect(() => {
    // Handle payment return
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    if (paymentStatus === 'success' && currentUser) {
      const storeId = urlParams.get('storeId');
      const planId = urlParams.get('planId') || 'pro';
      const price = Number(urlParams.get('price')) || 49;

      if (storeId && !currentUser.storeId) {
        // Crear la tienda si no existe en el estado local tras el retorno de Stripe/Wompi
        const newStore: Store = {
          id: storeId,
          brandId: brands[0]?.id || 'brand-1',
          name: `Tienda de ${currentUser.name}`,
          location: 'Por definir',
          adminId: currentUser.id,
          config: { fittingRoomsCount: 5 },
          code: `FP${Math.floor(1000 + Math.random() * 9000)}`,
          billing: {
            plan: planId as any,
            status: BillingStatus.PAID,
            nextBillingDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
            history: [],
            price: price
          }
        };
        
        setStores(prev => {
          if (prev.some(s => s.id === storeId)) return prev;
          return [...prev, newStore];
        });

        const updatedUser = { ...currentUser, storeId, isFirstLogin: false };
        setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
        setCurrentUser(updatedUser);
      }
      window.history.replaceState({}, document.title, "/");
    }
  }, [currentUser, brands]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('fr_products');
    const savedSessions = localStorage.getItem('fr_sessions');
    const savedLogs = localStorage.getItem('fr_logs');
    const savedCustomers = localStorage.getItem('fr_customers');
    const savedStores = localStorage.getItem('fr_stores');
    const savedBrands = localStorage.getItem('fr_brands');
    const savedAdRequests = localStorage.getItem('fr_ad_requests');
    const savedUsers = localStorage.getItem('fr_users');
    const savedConfig = localStorage.getItem('fr_config');
    const savedAlerts = localStorage.getItem('fr_alerts');
    const savedSms = localStorage.getItem('fr_sms_campaigns');

    // Merge initial users with saved users to ensure system accounts are always available
    const parsedSavedUsers: User[] = savedUsers ? JSON.parse(savedUsers) : [];
    const mergedUsers = [...initialUsers];
    
    parsedSavedUsers.forEach(savedUser => {
      if (!mergedUsers.find(u => u.id === savedUser.id)) {
        mergedUsers.push(savedUser);
      }
    });

    setProducts(savedProducts ? JSON.parse(savedProducts) : initialProducts);
    setSessions(savedSessions ? JSON.parse(savedSessions) : []);
    setLogs(savedLogs ? JSON.parse(savedLogs) : []);
    setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
    setStores(savedStores ? JSON.parse(savedStores) : initialStores);
    setBrands(savedBrands ? JSON.parse(savedBrands) : initialBrands);
    setAdRequests(savedAdRequests ? JSON.parse(savedAdRequests) : initialAdRequests);
    setUsers(mergedUsers);
    setStoreConfig(savedConfig ? JSON.parse(savedConfig) : { fittingRoomsCount: 5 });
    setInventoryAlerts(savedAlerts ? JSON.parse(savedAlerts) : []);
    setSmsCampaigns(savedSms ? JSON.parse(savedSms) : []);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userEmail = firebaseUser.email?.toLowerCase();
        const existingUser = users.find(u => u.email.toLowerCase() === userEmail);
        
        if (existingUser) {
          setCurrentUser(existingUser);
          setIsAuthLoading(false);
        } else {
          // If user doesn't exist in our list, we stay on Login screen
          // so they can complete registration via the Login component
          setCurrentUser(null);
          setIsAuthLoading(false);
        }
      } else {
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [users]);

  useEffect(() => {
    localStorage.setItem('fr_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('fr_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('fr_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('fr_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('fr_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('fr_brands', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('fr_ad_requests', JSON.stringify(adRequests));
  }, [adRequests]);

  useEffect(() => {
    localStorage.setItem('fr_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('fr_config', JSON.stringify(storeConfig));
  }, [storeConfig]);

  useEffect(() => {
    localStorage.setItem('fr_alerts', JSON.stringify(inventoryAlerts));
  }, [inventoryAlerts]);

  useEffect(() => {
    localStorage.setItem('fr_sms_campaigns', JSON.stringify(smsCampaigns));
  }, [smsCampaigns]);

  const handleLogin = (user: User) => {
    setUsers(prev => {
      if (!prev.find(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase())) {
        return [...prev, user];
      }
      return prev;
    });
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
  };

  const handleJoinStore = (storeId: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, storeId, isFirstLogin: false };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const handleSelectPlan = async (plan: any) => {
    if (!currentUser) return;
    setIsProcessingPayment(true);
    
    const storeId = `store-${Math.random().toString(36).substr(2, 5)}`;
    
    // Forzamos Stripe para asegurar que los ajustes del usuario funcionen
    const forceStripe = true;

    if (!forceStripe && userCountry === 'CO' && (window as any).WidgetCheckout) {
      console.log("Iniciando pago con Wompi para Colombia...");
      // Wompi Widget
      const checkout = new (window as any).WidgetCheckout({
        currency: 'COP',
        amountInCents: plan.price * 100 * 4000, // Convert USD to COP approx
        publicKey: 'pub_test_placeholder', 
        reference: `store_${storeId}_${Date.now()}`,
        customerEmail: currentUser.email,
        redirectUrl: `${window.location.origin}/?payment=success&storeId=${storeId}&planId=${plan.id}&price=${plan.price}`,
      });
      
      checkout.open((result: any) => {
        const transaction = result.transaction;
        if (transaction.status === 'APPROVED') {
          // Solo aquí creamos la tienda y actualizamos al usuario
          const newStore: Store = {
            id: storeId,
            brandId: brands[0]?.id || 'brand-1',
            name: `Tienda de ${currentUser.name}`,
            location: 'Por definir',
            adminId: currentUser.id,
            config: { fittingRoomsCount: 5 },
            code: `FP${Math.floor(1000 + Math.random() * 9000)}`,
            billing: {
              plan: plan.id,
              status: BillingStatus.PAID,
              nextBillingDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
              history: [],
              price: plan.price
            }
          };
          setStores(prev => [...prev, newStore]);
          const updatedUser = { ...currentUser, storeId, isFirstLogin: false };
          setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
          setCurrentUser(updatedUser);
        } else {
          alert("El pago no fue aprobado o fue cancelado. Por favor intenta de nuevo.");
        }
        setIsProcessingPayment(false);
      });
    } else {
      console.log(`Iniciando pago con Stripe para el plan: ${plan.id}...`);
      // Stripe Checkout
      try {
        const response = await axios.post('/api/create-checkout-session', {
          planId: plan.id,
          email: currentUser.email,
          storeId: storeId
        });
        
        if (response.data.url) {
          console.log("URL de Stripe obtenida:", response.data.url);
          window.location.href = response.data.url;
        } else {
          throw new Error("El servidor no devolvió una URL de pago. Revisa los logs del servidor.");
        }
      } catch (error: any) {
        console.error("Error detallado de Stripe:", error);
        const errorMsg = error.response?.data?.error || error.message;
        alert(`ERROR DE STRIPE:\n${errorMsg}\n\nAcción requerida:\n1. Ve a Settings.\n2. Verifica STRIPE_SECRET_KEY (debe empezar con sk_test_).\n3. Verifica que los IDs de precios (STRIPE_PRICE_...) sean correctos.`);
        setIsProcessingPayment(false);
      }
    }
  };

  const handleCustomerPayment = (itemsToBuy: string[]) => {
    if (!customerSessionId) return;
    
    setSessions(prev => prev.map(s => {
      if (s.id === customerSessionId) {
        const updatedItems = s.items.map(item => {
          if (itemsToBuy.includes(item.sku)) {
            addLog(item.sku, 'sold');
            return { ...item, status: ItemStatus.SOLD, exitDestination: ItemExitDestination.PURCHASE };
          }
          return item;
        });
        
        // Si pagó todo, cerramos la sesión automáticamente o la marcamos como "Pagada"
        // Para este flujo práctico, la dejaremos activa para que el staff verifique la salida
        // o podemos cerrarla si el cliente ya pagó y se va. 
        // El usuario dice "al finalizar la prueba... pueda hacer el Pago", implica que es lo último.
        return { 
          ...s, 
          items: updatedItems, 
          status: SessionStatus.CLOSED,
          endTime: Date.now()
        };
      }
      return s;
    }));
  };

  const addLog = (sku: string, action: 'tried_on' | 'sold') => {
    if (!currentUser) return;
    const newLog: InventoryLog = {
      id: Math.random().toString(36).substr(2, 9),
      sku,
      action,
      timestamp: Date.now(),
      workerId: currentUser.id
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleCloseSession = (sessionId: string, auditData: Record<string, ItemExitDestination>) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const timestamp = Date.now();
        const isManualPayment = Object.keys(auditData).length === 0 && s.status === SessionStatus.AWAITING_PAYMENT;
        
        // Si es pago manual, extraer info de los items ya auditados
        const effectiveAudit = isManualPayment 
          ? s.items.reduce((acc, item) => ({ ...acc, [item.sku]: item.exitDestination }), {} as Record<string, ItemExitDestination>)
          : auditData;

        const itemsToSell = Object.keys(effectiveAudit).filter(sku => effectiveAudit[sku] === ItemExitDestination.PURCHASE);
        const missingItems = Object.keys(effectiveAudit).filter(sku => effectiveAudit[sku] === ItemExitDestination.MISSING);
        const itemsLeft = Object.keys(effectiveAudit).filter(sku => effectiveAudit[sku] === ItemExitDestination.RELOCATION);

        // Registrar ventas en logs (solo si no se habían registrado)
        itemsToSell.forEach(sku => addLog(sku, 'sold'));
        
        // Alerta de prendas faltantes
        if (missingItems.length > 0) {
          const newAlerts: InventoryAlert[] = missingItems.map(sku => {
            const product = products.find(p => p.sku === sku);
            return {
              id: Math.random().toString(36).substr(2, 9),
              sku,
              productName: product?.name || 'Producto Desconocido',
              storeId: currentUser.storeId || '',
              workerId: currentUser.id,
              workerName: currentUser.name,
              timestamp,
              isRead: false,
              type: 'missing'
            };
          });
          setInventoryAlerts(prev => [...newAlerts, ...prev]);
        }

        // Actualizar base de datos de clientes
        const itemsEntered = s.items.map(i => i.sku);
        
        setCustomers(prevCust => {
          const existingCustIndex = prevCust.findIndex(c => c.phone === s.customerPhone);
          const historyEntry = {
            sessionId: s.id,
            storeId: s.storeId,
            fittingRoomId: s.fittingRoomId,
            itemsEntered,
            itemsSold: itemsToSell,
            itemsLeft,
            timestamp
          };

          if (existingCustIndex > -1) {
            const updatedCusts = [...prevCust];
            updatedCusts[existingCustIndex] = {
              ...updatedCusts[existingCustIndex],
              name: s.customerName || updatedCusts[existingCustIndex].name,
              history: [...updatedCusts[existingCustIndex].history, historyEntry]
            };
            return updatedCusts;
          } else {
            return [...prevCust, {
              phone: s.customerPhone,
              name: s.customerName,
              countryCode: '+57', // Default or from session if we added it there
              history: [historyEntry]
            }];
          }
        });

        // Update items in session with their exit status
        const updatedItems = s.items.map(item => ({
          ...item,
          exitDestination: effectiveAudit[item.sku] || ItemExitDestination.RELOCATION,
          status: effectiveAudit[item.sku] === ItemExitDestination.PURCHASE ? ItemStatus.SOLD : 
                  effectiveAudit[item.sku] === ItemExitDestination.MISSING ? ItemStatus.MISSING : ItemStatus.OUT
        }));

        // --- Marketing Automation Trigger ---
        const triggerMarketing = async () => {
          const store = stores.find(st => st.id === currentUser.storeId);
          if (!store) return;

          // 1. Abandono de Prenda (Retargeting)
          const abandonedItems = s.items.filter(item => 
            effectiveAudit[item.sku] === ItemExitDestination.RELOCATION || 
            effectiveAudit[item.sku] === ItemExitDestination.MISSING
          );

          for (const item of abandonedItems) {
            const product = products.find(p => p.sku === item.sku);
            if (product) {
              await axios.post('/api/marketing/trigger-automation', {
                customerPhone: s.customerPhone,
                customerName: s.customerName || 'Cliente',
                productName: product.name,
                storeName: store.name,
                productUrl: `${window.location.origin}/product/${product.id}`,
                scenario: 'retargeting',
                sessionId: s.id
              });
            }
          }

          // 2. Compra Exitosa (Cross-selling)
          const purchasedItems = s.items.filter(item => 
            effectiveAudit[item.sku] === ItemExitDestination.PURCHASE
          );

          for (const item of purchasedItems) {
            const product = products.find(p => p.sku === item.sku);
            if (product) {
              await axios.post('/api/marketing/trigger-automation', {
                customerPhone: s.customerPhone,
                customerName: s.customerName || 'Cliente',
                productName: product.name,
                storeName: store.name,
                productUrl: `${window.location.origin}/product/${product.id}`,
                scenario: 'cross_selling',
                sessionId: s.id
              });
            }
          }
        };

        triggerMarketing();

        const hasPurchaseItems = itemsToSell.length > 0;
        const newStatus = isManualPayment ? SessionStatus.CLOSED : (hasPurchaseItems ? SessionStatus.AWAITING_PAYMENT : SessionStatus.CLOSED);
        
        return { 
          ...s, 
          items: updatedItems, 
          status: newStatus, 
          endTime: newStatus === SessionStatus.CLOSED ? timestamp : s.endTime 
        };
      }
      return s;
    }));
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl animate-pulse mb-8">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-white font-black text-xl tracking-widest uppercase animate-pulse">FittingPro</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4">Verificando Credenciales...</p>
      </div>
    );
  }

  // Lógica de acceso según Rol
  if (customerSessionId) {
    const session = sessions.find(s => s.id === customerSessionId);
    if (session && (session.status === SessionStatus.ACTIVE || session.status === SessionStatus.AWAITING_PAYMENT)) {
      return (
        <CustomerApp 
          session={session} 
          products={products} 
          onPayment={handleCustomerPayment} 
          onLogout={() => setCustomerSessionId(null)}
          brandName={brands.find(b => b.id === stores.find(st => st.id === session.storeId)?.brandId)?.name || "Fashion Store"}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <InstallPrompt />
      <ThemeToggle theme={theme} setTheme={setTheme} isDark={darkMode} />
      {!currentUser ? (
        <Login onLogin={handleLogin} users={users} />
      ) : currentUser.role === Role.STAFF && !currentUser.storeId ? (
        <StoreCodePrompt onJoin={handleJoinStore} stores={stores} onLogout={handleLogout} />
      ) : currentUser.role === Role.STORE_ADMIN && !stores.find(s => s.adminId === currentUser.id) ? (
        <PlanSelection onSelect={handleSelectPlan} onLogout={handleLogout} isLoading={isProcessingPayment} />
      ) : currentUser.role === Role.CUSTOMER ? (
        (() => {
          const session = sessions.find(s => (s.id === customerSessionId || s.customerPhone === currentUser.email) && (s.status === SessionStatus.ACTIVE || s.status === SessionStatus.AWAITING_PAYMENT));
          if (session) {
            return (
              <CustomerApp 
                session={session} 
                products={products} 
                onPayment={(items) => {
                  setCustomerSessionId(session.id); // Ensure we keep track of which session was paid
                  handleCustomerPayment(items);
                }} 
                onLogout={handleLogout}
                brandName={brands.find(b => b.id === stores.find(st => st.id === session.storeId)?.brandId)?.name || "Fashion Store"}
              />
            );
          } else {
            const customerData = (customers as any).find((c: any) => c.phone === currentUser.email);
            return (
              <CustomerProfile 
                user={currentUser} 
                customerData={customerData}
                products={products}
                brands={brands}
                stores={stores}
                onLogout={handleLogout}
              />
            );
          }
        })()
      ) : (currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.STORE_ADMIN) ? (
        <AdminDashboard 
          user={currentUser} 
          onLogout={handleLogout} 
          products={products}
          setProducts={setProducts}
          logs={logs}
          sessions={sessions}
          storeConfig={storeConfig}
          setStoreConfig={setStoreConfig}
          customers={customers}
          users={users}
          setUsers={setUsers}
          stores={stores}
          setStores={setStores}
          brands={brands}
          setBrands={setBrands}
          adRequests={adRequests}
          setAdRequests={setAdRequests}
          inventoryAlerts={inventoryAlerts}
          setInventoryAlerts={setInventoryAlerts}
          smsCampaigns={smsCampaigns}
          setSmsCampaigns={setSmsCampaigns}
          darkMode={darkMode}
        />
      ) : (
        <WorkerApp 
          user={currentUser} 
          onLogout={handleLogout} 
          products={products}
          setProducts={setProducts}
          sessions={sessions}
          setSessions={setSessions}
          addLog={addLog}
          allUsers={users}
          storeConfig={storeConfig}
          onCloseSession={handleCloseSession}
          inventoryAlerts={inventoryAlerts}
          setInventoryAlerts={setInventoryAlerts}
          adRequests={adRequests}
        />
      )}
    </div>
  );
};

export default App;
