
import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Check, Lightbulb, RefreshCw, AlertCircle, Camera } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Product } from '../types';

interface ScannerOverlayProps {
  onClose: () => void;
  onScan: (sku: string) => void;
  customerName: string;
  products: Product[];
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ onClose, onScan, customerName, products }) => {
  const [lastScanned, setLastScanned] = useState<{sku: string, timestamp: number, isNew: boolean}[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cameraError, setCameraError] = useState<{type: string, message: string} | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [manualSku, setManualSku] = useState('');
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "reader-container";

  const stopScannerSafe = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.warn("Error al detener scanner:", e);
      }
    }
  };

  const initHardware = async () => {
    setIsInitializing(true);
    setCameraError(null);
    setIsCameraReady(false);
    
    await stopScannerSafe();
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = "";

    try {
      // 1. Solicitar permiso explícito mediante API nativa
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: { ideal: "environment" } } 
        });
        stream.getTracks().forEach(track => track.stop());
      } catch (e) {
        console.warn("Permiso de cámara no obtenido vía getUserMedia");
      }

      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      // Configuración de escaneo optimizada para velocidad y precisión
      const config = {
        fps: 24, // Mayor tasa de cuadros para mejor captura de movimiento
        qrbox: (w: number, h: number) => {
          const width = Math.min(w, h) * 0.85;
          const height = width * 0.45; 
          return { width, height };
        },
        aspectRatio: 1.0,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true // ACTIVA EL MOTOR NATIVO DEL NAVEGADOR
        },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.ITF
        ]
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => handleScanAction(decodedText),
        () => {} // Ignorar errores de procesamiento de frame
      );

      // Verificar si el hardware soporta linterna (flash)
      try {
        const track = html5QrCode.getRunningTrack();
        if (track && (track.getCapabilities() as any).torch) {
          setHasFlash(true);
        }
      } catch (e) {
        // En algunos casos applyVideoConstraints es suficiente
        if (typeof html5QrCode.applyVideoConstraints === 'function') {
          setHasFlash(true);
        }
      }

      setIsCameraReady(true);
      setIsInitializing(false);

    } catch (err: any) {
      console.error("Critical Camera Error:", err);
      setIsInitializing(false);
      const errorMessage = err?.message || err || "Error desconocido";
      
      if (errorMessage.includes("NotAllowedError") || errorMessage.includes("Permission")) {
        setCameraError({
          type: 'permission',
          message: "Acceso denegado. Activa el permiso de cámara en la configuración de tu navegador."
        });
      } else {
        setCameraError({
          type: 'hardware',
          message: "No se pudo conectar con la cámara. Verifica que no esté en uso por otra pestaña."
        });
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      initHardware();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      stopScannerSafe();
    };
  }, []);

  const toggleFlash = async () => {
    if (!scannerRef.current || !hasFlash) return;
    try {
      const newState = !isFlashOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: newState }]
      } as any);
      setIsFlashOn(newState);
    } catch (e) {
      console.warn("Flash no soportado por este sensor.");
    }
  };

  const handleScanAction = (sku: string) => {
    const cleanSku = sku.trim();
    if (!cleanSku) return;

    // Debounce: No escanear el mismo código en menos de 2.5 segundos
    setLastScanned(prev => {
      const now = Date.now();
      if (prev.some(s => s.sku === cleanSku && (now - s.timestamp) < 2500)) return prev;
      
      onScan(cleanSku);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 250);
      
      const isNew = !products.some(p => p.sku === cleanSku);
      return [{sku: cleanSku, timestamp: now, isNew}, ...prev].slice(0, 5);
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualSku.trim()) {
      handleScanAction(manualSku.trim());
      setManualSku('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 flex items-center justify-between text-white bg-slate-900/90 backdrop-blur-2xl z-30 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${isCameraReady ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : cameraError ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`}></div>
          <div>
            <h2 className="text-xs font-black tracking-widest uppercase text-slate-100">Escáner Fitting</h2>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em]">{customerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasFlash && isCameraReady && (
            <button onClick={toggleFlash} className={`p-3 rounded-2xl transition-all ${isFlashOn ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30' : 'bg-white/10'}`}>
              <Lightbulb className="w-5 h-5" />
            </button>
          )}
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Camera Viewport Area */}
      <div className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden">
        
        <div id={containerId} className={`w-full h-full transition-opacity duration-700 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}></div>

        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#020617]">
            <div className="relative">
              <div className="w-20 h-20 border-[3px] border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <Camera className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-500 animate-pulse" />
            </div>
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] mt-10">Iniciando Sensor...</p>
          </div>
        )}

        {cameraError && !isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center z-40 bg-[#020617]">
            <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mb-10 border border-rose-500/20">
              <AlertCircle className="w-12 h-12 text-rose-500" />
            </div>
            <h3 className="text-xl font-black text-white mb-4 tracking-tight uppercase">Cámara Desconectada</h3>
            <p className="text-slate-400 text-sm mb-12 leading-relaxed">{cameraError.message}</p>
            <div className="flex flex-col w-full gap-4 max-w-xs">
              <button onClick={initHardware} className="bg-indigo-600 text-white font-black py-6 rounded-[2rem] uppercase text-xs tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                <RefreshCw className="w-5 h-5" /> REINTENTAR ACCESO
              </button>
              <button onClick={onClose} className="py-4 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Cerrar y usar manual</button>
            </div>
          </div>
        )}

        {/* HUD DE ESCANEO CON LÁSER */}
        {isCameraReady && (
          <div className="absolute inset-0 pointer-events-none z-20">
             <div className="absolute inset-0 bg-black/40"></div>
             
             {/* Caja de Enfoque */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[40%] max-h-[260px]">
                <div className="absolute inset-0 border-[3px] border-indigo-500/30 rounded-[2.5rem] shadow-[0_0_0_100vmax_rgba(2,6,23,0.7)]"></div>
                
                {/* LÍNEA LÁSER DINÁMICA */}
                <div className="absolute left-6 right-6 h-[2px] bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,1)] opacity-90 z-30 animate-laser"></div>
                
                {/* Esquinas de diseño */}
                <div className="absolute -top-1 -left-1 w-12 h-12 border-t-[6px] border-l-[6px] border-indigo-500 rounded-tl-[2rem]"></div>
                <div className="absolute -top-1 -right-1 w-12 h-12 border-t-[6px] border-r-[6px] border-indigo-500 rounded-tr-[2rem]"></div>
                <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-[6px] border-l-[6px] border-indigo-500 rounded-bl-[2rem]"></div>
                <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-[6px] border-r-[6px] border-indigo-500 rounded-br-[2rem]"></div>
                
                <div className="absolute -top-16 left-0 right-0 text-center animate-pulse">
                   <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] bg-indigo-600/20 px-5 py-2 rounded-full backdrop-blur-xl">Detectando Código...</span>
                </div>
             </div>
          </div>
        )}

        {/* Feedback de Éxito Flash */}
        {showSuccess && (
          <div className="absolute inset-0 z-50 bg-indigo-500/30 backdrop-blur-sm flex items-center justify-center animate-in zoom-in duration-100">
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl scale-110">
              <Check className="w-16 h-16 text-indigo-600 stroke-[5px]" />
            </div>
          </div>
        )}

        {/* Botón Flotante de Cierre */}
        <div className="absolute bottom-12 left-0 right-0 px-10 flex justify-center z-30">
          <button 
            onClick={onClose}
            className="w-full max-w-[300px] bg-emerald-500 text-white font-black py-6 rounded-[2.2rem] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all"
          >
            <Check className="w-7 h-7 stroke-[3px]" />
            <span className="text-base tracking-[0.15em] font-black uppercase">FINALIZAR</span>
          </button>
        </div>
      </div>

      {/* Footer para Ingreso Manual */}
      <div className="p-8 bg-slate-900 border-t border-white/5 z-30">
        <form onSubmit={handleManualSubmit} className="flex gap-4 max-w-lg mx-auto">
          <input 
            type="text" 
            inputMode="numeric"
            value={manualSku}
            onChange={(e) => setManualSku(e.target.value)}
            placeholder="Escribir SKU manual..."
            className="flex-1 bg-white/5 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-5 px-6 text-white text-lg font-bold outline-none transition-all"
          />
          <button type="submit" className="bg-indigo-600 p-5 rounded-2xl text-white shadow-xl active:scale-90 transition-all">
            <Zap className="w-7 h-7 fill-current" />
          </button>
        </form>
      </div>

      <style>{`
        #reader-container video { width: 100% !important; height: 100% !important; object-fit: cover !important; }
        #reader-container__dashboard, #reader-container__header_tag, #reader-container img { display: none !important; }
        #reader-container { border: none !important; background: transparent !important; }
        
        @keyframes laser-move {
          0% { top: 15%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 85%; opacity: 0; }
        }
        
        .animate-laser {
          position: absolute;
          animation: laser-move 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ScannerOverlay;
