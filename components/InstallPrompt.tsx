import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Check if we've already shown the prompt in this session or if it's the first time
      const hasBeenShown = localStorage.getItem('pwa_prompt_shown');
      if (!hasBeenShown) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_shown', 'true');
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_shown', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-10 md:w-96 z-[100] animate-in slide-in-from-bottom-10 duration-700">
      <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl border border-white/10 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
        
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 flex-shrink-0">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black tracking-tight mb-1">FittingPro en tu Inicio</h3>
            <p className="text-white/60 text-xs font-medium leading-relaxed mb-4">
              Instala la aplicación en tu pantalla de inicio para un acceso rápido y una experiencia fluida.
            </p>
            <button 
              onClick={handleInstallClick}
              className="w-full py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Instalar Aplicación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
