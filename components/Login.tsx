
import React, { useState } from 'react';
import { User, Role } from '../types';
import { 
  LogIn, Mail, Lock, ShieldCheck, Eye, EyeOff, 
  Loader2, Crown, Store, UserCircle, ChevronLeft, Smartphone,
  ArrowRight
} from 'lucide-react';
import { signInWithGoogle } from '../firebase';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [view, setView] = useState<'portals' | 'form' | 'register'>('portals');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePortalSelect = (role: Role) => {
    setSelectedRole(role);
    setView('form');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const user = users.find(
        (u) => 
          u.email.toLowerCase().trim() === email.toLowerCase().trim() && 
          u.password?.trim() === password.trim() &&
          u.role === selectedRole // Validación estricta de rol según portal
      );

      if (user) {
        onLogin(user);
      } else {
        const roleName = selectedRole === Role.SUPER_ADMIN ? 'Administrador' : 
                         selectedRole === Role.STORE_ADMIN ? 'Gerente' : 'Staff';
        setError(`Credenciales inválidas para el portal de ${roleName}.`);
        setIsLoading(false);
      }
    }, 800);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithGoogle();
      const googleUser = result.user;
      
      // Check if user exists in our local list or database
      const existingUser = users.find(u => u.email.toLowerCase() === googleUser.email?.toLowerCase());
      
      if (existingUser) {
        onLogin(existingUser);
      } else {
        // If not found, we could allow them to register
        setEmail(googleUser.email || '');
        setName(googleUser.displayName || '');
        setView('register');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError('Error al iniciar sesión con Google.');
      setIsLoading(false);
    }
  };

  const getPortalInfo = () => {
    switch(selectedRole) {
      case Role.SUPER_ADMIN: return { title: 'Plataforma Global', color: 'text-amber-500', bg: 'bg-amber-500' };
      case Role.STORE_ADMIN: return { title: 'Gestión de Tienda', color: 'text-indigo-500', bg: 'bg-indigo-600' };
      case Role.STAFF: return { title: 'Terminal de Staff', color: 'text-emerald-500', bg: 'bg-emerald-600' };
      case Role.CUSTOMER: return { title: 'Mi Probador Digital', color: 'text-rose-500', bg: 'bg-rose-500' };
      default: return { title: 'Acceso', color: 'text-slate-400', bg: 'bg-slate-900' };
    }
  };

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (email.length < 7) {
        setError('Por favor ingresa un número de teléfono válido.');
        setIsLoading(false);
        return;
      }
      
      // Check if user exists first
      const existingUser = users.find(u => u.email === email && u.role === Role.CUSTOMER);
      
      if (existingUser) {
        onLogin(existingUser);
      } else {
        // If it doesn't exist, we can either create it on the fly (convenience) 
        // or ask them to register. To be "independent", creating on the fly is good.
        const customerUser: User = {
          id: `cust-${email}`,
          name: name || 'Invitado',
          email: email, // used as phone
          role: Role.CUSTOMER
        };
        onLogin(customerUser);
      }
    }, 800);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#020617] px-4 selection:bg-indigo-500/30 transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-all duration-1000 ${
          view === 'portals' ? 'bg-indigo-500/10' : 
          selectedRole === Role.SUPER_ADMIN ? 'bg-amber-500/10' : 'bg-indigo-500/10'
        }`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-all duration-1000 ${
          view === 'portals' ? 'bg-emerald-500/10' : 
          selectedRole === Role.STAFF ? 'bg-emerald-500/10' : 'bg-slate-500/10'
        }`}></div>
      </div>

      <div className="w-full max-w-2xl z-10">
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-500 border border-slate-100 dark:border-slate-800">
          
          {/* VISTA 1: SELECCIÓN DE PORTALES */}
          {view === 'portals' && (
            <div className="p-6 sm:p-10 md:p-16 animate-in fade-in zoom-in duration-700">
              <div className="text-center mb-16">
                <div className="w-20 h-20 bg-slate-950 dark:bg-indigo-600 rounded-[2.2rem] flex items-center justify-center shadow-2xl mx-auto mb-8 transform hover:scale-110 transition-transform">
                  <ShieldCheck className="w-10 h-10 text-indigo-400 dark:text-white" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">FittingPro</h1>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Selecciona tu portal de acceso</p>
              </div>

              <div className="space-y-8">
                {/* PORTAL CLIENTE - PRODOMINANTE */}
                <div 
                  onClick={() => handlePortalSelect(Role.CUSTOMER)}
                  className="w-full relative overflow-hidden group p-1 flex items-center bg-rose-500 rounded-[2.5rem] shadow-2xl hover:shadow-rose-500/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                    <Smartphone className="w-32 h-32" />
                  </div>
                  <div className="relative w-full bg-white dark:bg-slate-800 rounded-[2.3rem] p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
                          <Smartphone className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Probador Digital</h2>
                          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Acceso para Clientes en Tienda</p>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-rose-500 group-hover:translate-x-2 transition-transform">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">¿Ya tienes una sesión activa?</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRole(Role.CUSTOMER);
                          setView('register');
                        }}
                        className="px-4 py-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        Crear mi cuenta
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                    <span className="bg-white dark:bg-slate-900 px-4 text-slate-300 dark:text-slate-600">Acceso Corporativo / Staff</span>
                  </div>
                </div>

                {/* PORTALES PROFESIONALES */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <PortalButton 
                    icon={<Crown className="w-6 h-6" />} 
                    label="Plataforma" 
                    role="Maestro" 
                    color="amber" 
                    onClick={() => handlePortalSelect(Role.SUPER_ADMIN)} 
                  />
                  <PortalButton 
                    icon={<Store className="w-6 h-6" />} 
                    label="Tienda" 
                    role="Gerencia" 
                    color="indigo" 
                    onClick={() => handlePortalSelect(Role.STORE_ADMIN)} 
                  />
                  <PortalButton 
                    icon={<UserCircle className="w-6 h-6" />} 
                    label="Operativo" 
                    role="Staff Piso" 
                    color="emerald" 
                    onClick={() => handlePortalSelect(Role.STAFF)} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* VISTA 2: FORMULARIO DE CREDENCIALES */}
          {view === 'form' && (
            <div className="p-6 sm:p-10 md:p-16 animate-in slide-in-from-right duration-500">
              <button 
                onClick={() => setView('portals')}
                className="flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white font-black text-[10px] uppercase tracking-widest mb-12 transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Cambiar de Portal
              </button>

              <div className="flex items-center gap-6 mb-12">
                <div className={`w-16 h-16 ${getPortalInfo().bg} text-white rounded-2xl flex items-center justify-center shadow-2xl`}>
                   {selectedRole === Role.SUPER_ADMIN ? <Crown /> : selectedRole === Role.STORE_ADMIN ? <Store /> : <UserCircle />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">{getPortalInfo().title}</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                    {selectedRole === Role.CUSTOMER ? 'Ingresa tu número registrado en tienda' : 'Ingresa tus credenciales'}
                  </p>
                </div>
              </div>

              {selectedRole !== Role.CUSTOMER && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full mb-8 flex items-center justify-center gap-4 py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[1.8rem] hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group disabled:opacity-50"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">Acceso Preferente con Google</span>
                  </button>

                  <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                      <span className="bg-white dark:bg-slate-900 px-4 text-slate-300 dark:text-slate-600">O usa tu correo corporativo</span>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={selectedRole === Role.CUSTOMER ? handleCustomerLogin : handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">
                    {selectedRole === Role.CUSTOMER ? 'Número de Teléfono' : 'Correo Corporativo'}
                  </label>
                  <div className="relative group">
                    {selectedRole === Role.CUSTOMER ? (
                       <Smartphone className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:${getPortalInfo().color} transition-colors`} />
                    ) : (
                       <Mail className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:${getPortalInfo().color} transition-colors`} />
                    )}
                    <input
                      type={selectedRole === Role.CUSTOMER ? 'tel' : 'email'}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={selectedRole === Role.CUSTOMER ? 'NÚMERO DE TELÉFONO' : 'ejemplo@fittingpro.com'}
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-[1.8rem] text-slate-900 dark:text-white font-bold outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {selectedRole === Role.CUSTOMER && (
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tu Nombre (Opcional)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ESCRIBE TU NOMBRE"
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] text-slate-900 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
                    />
                  </div>
                )}

                {selectedRole !== Role.CUSTOMER && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Contraseña</label>
                    <div className="relative group">
                      <Lock className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:${getPortalInfo().color} transition-colors`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-16 pr-14 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] text-slate-900 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-[11px] font-black text-center animate-in slide-in-from-top-2 uppercase tracking-wide">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${getPortalInfo().bg} text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group`}
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      Entrar al Sistema
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setView('register')}
                  className="text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  ¿No tienes una cuenta? <span className={getPortalInfo().color}>Regístrate aquí</span>
                </button>
              </div>
            </div>
          )}

          {/* VISTA 3: REGISTRO */}
          {view === 'register' && (
            <div className="p-10 md:p-16 animate-in slide-in-from-bottom duration-500">
              <button 
                onClick={() => setView('portals')}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest mb-12 transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Volver al Inicio
              </button>
              
              {!selectedRole && (
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <button 
                    onClick={() => setSelectedRole(Role.CUSTOMER)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === Role.CUSTOMER ? 'border-rose-500 bg-rose-50' : 'border-slate-100 bg-slate-50'}`}
                  >
                    <Smartphone className={`w-5 h-5 ${selectedRole === Role.CUSTOMER ? 'text-rose-500' : 'text-slate-400'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Cliente</span>
                  </button>
                  <button 
                    onClick={() => setSelectedRole(Role.STAFF)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === Role.STAFF ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}
                  >
                    <UserCircle className={`w-5 h-5 ${selectedRole === Role.STAFF ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Colaborador</span>
                  </button>
                </div>
              )}

              <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {selectedRole === Role.CUSTOMER ? 'Regístrate como Cliente' : 'Crea tu Cuenta'}
                </h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Únete a la red de FittingPro</p>
              </div>

              {selectedRole !== Role.CUSTOMER && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full mb-8 flex items-center justify-center gap-4 py-5 bg-white border-2 border-slate-100 rounded-[1.8rem] hover:border-indigo-500 hover:bg-slate-50 transition-all group disabled:opacity-50"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                    <span className="text-sm font-black text-slate-700">Regístrate con Google</span>
                  </button>

                  <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                      <span className="bg-white px-4 text-slate-300">O completa tus datos</span>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                setIsLoading(true);
                // Simulate registration
                setTimeout(() => {
                  const newUser: User = {
                    id: selectedRole === Role.CUSTOMER ? `cust-${email}` : Math.random().toString(36).substr(2, 9),
                    name,
                    email,
                    role: selectedRole || Role.STAFF,
                    isFirstLogin: true
                  };
                  // In a real app, we'd save this to Firestore
                  onLogin(newUser);
                }, 1000);
              }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Pérez"
                    className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] text-slate-900 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                    {selectedRole === Role.CUSTOMER ? 'Número de Teléfono' : 'Correo Electrónico'}
                  </label>
                  <input
                    type={selectedRole === Role.CUSTOMER ? 'tel' : 'email'}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === Role.CUSTOMER ? '300 123 4567' : 'ejemplo@correo.com'}
                    className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] text-slate-900 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${selectedRole === Role.CUSTOMER ? 'bg-rose-500' : 'bg-indigo-600'} text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3`}
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Completar Registro'}
                </button>
              </form>
            </div>
          )}
        </div>
        
        <div className="text-center mt-8">
          {view === 'portals' && (
            <button 
              onClick={() => setView('register')}
              className="text-indigo-400 hover:text-indigo-300 text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              ¿No tienes cuenta? Regístrate aquí
            </button>
          )}
        </div>

        <p className="text-center mt-10 text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
          Retail Intelligence v2.5.0
        </p>
      </div>
    </div>
  );
};

interface PortalButtonProps {
  icon: React.ReactNode;
  label: string;
  role: string;
  color: 'amber' | 'indigo' | 'emerald' | 'rose';
  onClick: () => void;
}

const PortalButton: React.FC<PortalButtonProps> = ({ icon, label, role, color, onClick }) => {
  const styles = {
    amber: 'bg-amber-500 hover:shadow-amber-500/40',
    indigo: 'bg-indigo-600 hover:shadow-indigo-600/40',
    emerald: 'bg-emerald-600 hover:shadow-emerald-600/40',
    rose: 'bg-rose-500 hover:shadow-rose-500/40'
  };

  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center p-8 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-700 hover:border-slate-100 dark:hover:border-slate-600 transition-all hover:shadow-2xl group"
    >
      <div className={`w-16 h-16 ${styles[color]} text-white rounded-2xl flex items-center justify-center mb-5 shadow-xl transition-all group-hover:scale-110 group-hover:rotate-3`}>
        {icon}
      </div>
      <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{label}</span>
      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{role}</span>
    </button>
  );
};

export default Login;
