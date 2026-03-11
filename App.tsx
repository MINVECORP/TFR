
import React, { useState, useEffect } from 'react';
import { Role, User, Product, FittingSession, InventoryLog, Customer, StoreConfig, SessionStatus, Store, BillingStatus, Brand, AdRequest, ItemExitDestination, ItemStatus } from './types';
import Login from './components/Login';
import WorkerApp from './components/WorkerApp';
import AdminDashboard from './components/AdminDashboard';
import { initialProducts, initialUsers, initialStores, initialBrands, initialAdRequests } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sessions, setSessions] = useState<FittingSession[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [adRequests, setAdRequests] = useState<AdRequest[]>(initialAdRequests);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>({ fittingRoomsCount: 5 });

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
  }, []);

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

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
        const itemsToSell = Object.keys(auditData).filter(sku => auditData[sku] === ItemExitDestination.PURCHASE);
        const missingItems = Object.keys(auditData).filter(sku => auditData[sku] === ItemExitDestination.MISSING);

        // Registrar ventas en logs
        itemsToSell.forEach(sku => addLog(sku, 'sold'));
        
        // Alerta de prendas faltantes
        if (missingItems.length > 0) {
          console.warn(`ALERTA: Prendas faltantes en sesión ${sessionId}: ${missingItems.join(', ')}`);
          // En una app real aquí dispararíamos una notificación push o SMS al gerente
        }

        // Actualizar base de datos de clientes
        const itemsEntered = s.items.map(i => i.sku);
        
        setCustomers(prevCust => {
          const existingCustIndex = prevCust.findIndex(c => c.phone === s.customerPhone);
          const historyEntry = {
            sessionId: s.id,
            fittingRoomId: s.fittingRoomId,
            itemsEntered,
            itemsSold: itemsToSell,
            timestamp
          };

          if (existingCustIndex > -1) {
            const updatedCusts = [...prevCust];
            updatedCusts[existingCustIndex] = {
              ...updatedCusts[existingCustIndex],
              history: [...updatedCusts[existingCustIndex].history, historyEntry]
            };
            return updatedCusts;
          } else {
            return [...prevCust, {
              phone: s.customerPhone,
              countryCode: '+57', // Default or from session if we added it there
              history: [historyEntry]
            }];
          }
        });

        // Update items in session with their exit status
        const updatedItems = s.items.map(item => ({
          ...item,
          exitDestination: auditData[item.sku] || ItemExitDestination.RELOCATION,
          status: auditData[item.sku] === ItemExitDestination.PURCHASE ? ItemStatus.SOLD : 
                  auditData[item.sku] === ItemExitDestination.MISSING ? ItemStatus.MISSING : ItemStatus.OUT
        }));

        return { ...s, items: updatedItems, status: SessionStatus.CLOSED, endTime: timestamp };
      }
      return s;
    }));
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  // Lógica de acceso según Rol
  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-500">
      {currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.STORE_ADMIN ? (
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
        />
      )}
    </div>
  );
};

export default App;
