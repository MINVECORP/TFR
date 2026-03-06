
import React, { useState, useEffect } from 'react';
import { Role, User, Product, FittingSession, InventoryLog } from './types';
import Login from './components/Login';
import WorkerApp from './components/WorkerApp';
import AdminDashboard from './components/AdminDashboard';
import { initialProducts, initialUsers } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sessions, setSessions] = useState<FittingSession[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('fr_products');
    const savedSessions = localStorage.getItem('fr_sessions');
    const savedLogs = localStorage.getItem('fr_logs');

    setProducts(savedProducts ? JSON.parse(savedProducts) : initialProducts);
    setSessions(savedSessions ? JSON.parse(savedSessions) : []);
    setLogs(savedLogs ? JSON.parse(savedLogs) : []);
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

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={initialUsers} />;
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
          allUsers={initialUsers}
        />
      )}
    </div>
  );
};

export default App;
