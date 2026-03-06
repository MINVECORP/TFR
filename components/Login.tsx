
import React, { useState } from 'react';
import { User, Role } from '../types';
import { 
  LogIn, Mail, Lock, ShieldCheck, Eye, EyeOff, 
  Loader2, Crown, Store, UserCircle, ChevronLeft 
} from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [view, setView] = useState<'portals' | 'form'>('portals');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          u.email.toLowerCase() === email.toLowerCase() && 
          u.password === password &&
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

  const getPortalInfo = () => {
    switch(selectedRole) {
      case Role.SUPER_ADMIN: return { title: 'Plataforma Global', color: 'text-amber-500', bg: 'bg-amber-500' };
      case Role.STORE_ADMIN: return { title: 'Gestión de Tienda', color: 'text-indigo-500', bg: 'bg-indigo-600' };
      case Role.STAFF: return { title: 'Terminal de Staff', color: 'text-emerald-500', bg: 'bg-emerald-600' };
      default: return { title: 'Acceso', color: 'text-slate-400', bg: 'bg-slate-900' };
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617] px-4 selection:bg-indigo-500/30">
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
        <div className="bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-500">
          
          {/* VISTA 1: SELECCIÓN DE PORTALES */}
          {view === 'portals' && (
            <div className="p-10 md:p-16 animate-in fade-in zoom-in duration-700">
              <div className="text-center mb-16">
                <div className="w-20 h-20 bg-slate-950 rounded-[2.2rem] flex items-center justify-center shadow-2xl mx-auto mb-8 transform hover:scale-110 transition-transform">
                  <ShieldCheck className="w-10 h-10 text-indigo-400" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">FittingPro</h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Selecciona tu portal de acceso</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <PortalButton 
                  icon={<Crown className="w-8 h-8" />} 
                  label="Plataforma" 
                  role="Maestro" 
                  color="amber" 
                  onClick={() => handlePortalSelect(Role.SUPER_ADMIN)} 
                />
                <PortalButton 
                  icon={<Store className="w-8 h-8" />} 
                  label="Tienda" 
                  role="Gerencia" 
                  color="indigo" 
                  onClick={() => handlePortalSelect(Role.STORE_ADMIN)} 
                />
                <PortalButton 
                  icon={<UserCircle className="w-8 h-8" />} 
                  label="Operativo" 
                  role="Staff Piso" 
                  color="emerald" 
                  onClick={() => handlePortalSelect(Role.STAFF)} 
                />
              </div>
            </div>
          )}

          {/* VISTA 2: FORMULARIO DE CREDENCIALES */}
          {view === 'form' && (
            <div className="p-10 md:p-16 animate-in slide-in-from-right duration-500">
              <button 
                onClick={() => setView('portals')}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest mb-12 transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Cambiar de Portal
              </button>

              <div className="flex items-center gap-6 mb-12">
                <div className={`w-16 h-16 ${getPortalInfo().bg} text-white rounded-2xl flex items-center justify-center shadow-2xl`}>
                   {selectedRole === Role.SUPER_ADMIN ? <Crown /> : selectedRole === Role.STORE_ADMIN ? <Store /> : <UserCircle />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{getPortalInfo().title}</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Ingresa tus credenciales</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Correo Corporativo</label>
                  <div className="relative group">
                    <Mail className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:${getPortalInfo().color} transition-colors`} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@fittingpro.com"
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] text-slate-900 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

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
            </div>
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
  color: 'amber' | 'indigo' | 'emerald';
  onClick: () => void;
}

const PortalButton: React.FC<PortalButtonProps> = ({ icon, label, role, color, onClick }) => {
  const styles = {
    amber: 'bg-amber-500 hover:shadow-amber-500/40',
    indigo: 'bg-indigo-600 hover:shadow-indigo-600/40',
    emerald: 'bg-emerald-600 hover:shadow-emerald-600/40'
  };

  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center p-8 bg-slate-50 hover:bg-white rounded-[2.5rem] border-2 border-slate-50 hover:border-slate-100 transition-all hover:shadow-2xl group"
    >
      <div className={`w-16 h-16 ${styles[color]} text-white rounded-2xl flex items-center justify-center mb-5 shadow-xl transition-all group-hover:scale-110 group-hover:rotate-3`}>
        {icon}
      </div>
      <span className="text-sm font-black text-slate-900 tracking-tight">{label}</span>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{role}</span>
    </button>
  );
};

export default Login;
