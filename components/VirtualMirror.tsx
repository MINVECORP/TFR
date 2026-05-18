
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Sparkles, RotateCcw, Palette } from 'lucide-react';
import { Product } from '../types';

interface VirtualMirrorProps {
  product: Product;
  onClose: () => void;
}

const VirtualMirror: React.FC<VirtualMirrorProps> = ({ product, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [activeColor, setActiveColor] = useState(product.variations[0]?.color);
  const [overlaySize, setOverlaySize] = useState(60); // Percentage
  const [overlayPos, setOverlayPos] = useState({ x: 50, y: 50 }); // Percentage

  const colors = Array.from(new Set(product.variations.map(v => v.color)));

  useEffect(() => {
    async function setupCamera() {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        setStream(userStream);
        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Video Background */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover grayscale-[0.2]"
      />

      {/* Decorative Mirror Overlays */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 opacity-40"></div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>

      {/* Product Overlay (The "Magic" Part) */}
      <motion.div 
        drag
        dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
        className="absolute z-20 cursor-move active:scale-105 transition-all"
        style={{ 
          width: `${overlaySize}%`,
          top: `${overlayPos.y}%`,
          left: `${overlayPos.x}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.img 
            key={activeColor}
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
            src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/800`}
            className="w-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
            alt={product.name}
          />
        </AnimatePresence>
      </motion.div>

      {/* Controls Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col gap-8">
        <div className="max-w-lg mx-auto w-full space-y-6">
          
          {/* Color Selector */}
          {colors.length > 1 && (
            <div className="flex justify-center gap-3">
              {colors.map(color => (
                <button 
                  key={color}
                  onClick={() => setActiveColor(color)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeColor === color 
                    ? 'bg-white text-black shadow-xl ring-2 ring-white/50' 
                    : 'bg-black/40 text-white backdrop-blur-md hover:bg-black/60'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          )}

          {/* Sizing Controls */}
          <div className="flex items-center justify-between bg-black/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-black text-sm uppercase tracking-tight">Espejo Mágico</h4>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Ajusta la prenda a tu medida</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setOverlaySize(prev => Math.max(20, prev - 5))}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                title="Reducir"
              >
                -
              </button>
              <div className="w-1 bg-white/20 h-6 rounded-full"></div>
              <button 
                onClick={() => setOverlaySize(prev => Math.min(100, prev + 5))}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                title="Aumentar"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Header */}
      <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
          <div>
            <h3 className="text-white font-black uppercase tracking-[0.2em] text-xs">Probando: {product.name}</h3>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">Vista en Tiempo Real</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            setOverlayPos({ x: 50, y: 50 });
            setOverlaySize(60);
          }}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-[10px] font-black text-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reiniciar Vista
        </button>
      </div>

      {/* Camera Access Animation */}
      {!isCameraReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-50">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6"></div>
          <p className="font-black text-xs uppercase tracking-[0.3em] animate-pulse">Encendiendo Espejo...</p>
        </div>
      )}
    </motion.div>
  );
};

export default VirtualMirror;
