import React from 'react';
import { motion } from 'motion/react';
import { User, ShoppingCart, Clock, Smartphone, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const TriggerWorkflow: React.FC = () => {
  const steps = [
    {
      id: 'start',
      title: 'Cliente sale del probador',
      icon: <User className="w-5 h-5" />,
      color: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'decision',
      title: '¿Compró la prenda?',
      isDecision: true,
    },
    {
      id: 'no',
      title: 'Abandono de Interés',
      icon: <XCircle className="w-5 h-5" />,
      color: 'bg-rose-100 text-rose-600',
      parent: 'decision',
    },
    {
      id: 'yes',
      title: 'Compra Exitosa',
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'bg-emerald-100 text-emerald-600',
      parent: 'decision',
    },
    {
      id: 'sms1',
      title: 'SMS 1: Retargeting (2h)',
      icon: <Smartphone className="w-5 h-5" />,
      color: 'bg-indigo-100 text-indigo-600',
      parent: 'no',
    },
    {
      id: 'sms2',
      title: 'SMS 2: Urgencia (48h)',
      icon: <Smartphone className="w-5 h-5" />,
      color: 'bg-amber-100 text-amber-600',
      parent: 'sms1',
      condition: 'Si no hizo clic',
    },
    {
      id: 'sms3',
      title: 'SMS 3: Cross-selling (24h)',
      icon: <Smartphone className="w-5 h-5" />,
      color: 'bg-indigo-100 text-indigo-600',
      parent: 'yes',
    }
  ];

  return (
    <div className="p-8 bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      
      <div className="flex items-center justify-between mb-10">
        <div>
          <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Flujo Lógico de Disparo</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Automatización basada en estados</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activo</span>
          </div>
        </div>
      </div>

      <div className="relative space-y-12">
        {/* Step: Start */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl z-10">
            <User className="w-6 h-6" />
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Salida de Probador</p>
          </div>
          <div className="h-12 w-0.5 bg-slate-200 mt-2"></div>
        </div>

        {/* Step: Decision */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-white border-2 border-slate-900 rotate-45 flex items-center justify-center shadow-lg z-10">
            <div className="-rotate-45 text-center">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">¿Compró?</p>
            </div>
          </div>
          
          <div className="relative w-full h-24 mt-4">
            {/* Lines to branches */}
            <div className="absolute top-0 left-1/2 w-0.5 h-12 bg-slate-200 -translate-x-1/2"></div>
            <div className="absolute top-12 left-1/4 right-1/4 h-0.5 bg-slate-200"></div>
            <div className="absolute top-12 left-1/4 w-0.5 h-12 bg-slate-200"></div>
            <div className="absolute top-12 right-1/4 w-0.5 h-12 bg-slate-200"></div>
            
            {/* Labels */}
            <div className="absolute top-8 left-[35%] -translate-x-1/2 bg-white px-2 text-[10px] font-black text-rose-500 uppercase tracking-widest">NO</div>
            <div className="absolute top-8 right-[35%] translate-x-1/2 bg-white px-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">SÍ</div>
          </div>
        </div>

        {/* Branches */}
        <div className="grid grid-cols-2 gap-8">
          {/* Branch: NO */}
          <div className="space-y-8 flex flex-col items-center">
            <div className="w-full bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Estado</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Abandono</p>
              </div>
            </div>
            
            <div className="h-8 w-0.5 bg-slate-200"></div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="w-full bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-4 relative"
            >
              <div className="absolute -top-3 left-4 bg-indigo-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">2h después</div>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">SMS 1</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Retargeting</p>
              </div>
            </motion.div>

            <div className="h-8 w-0.5 bg-slate-200"></div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="w-full bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4 relative"
            >
              <div className="absolute -top-3 left-4 bg-amber-500 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">48h después</div>
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">SMS 2</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Urgencia</p>
              </div>
            </motion.div>
          </div>

          {/* Branch: YES */}
          <div className="space-y-8 flex flex-col items-center">
            <div className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Estado</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Compra</p>
              </div>
            </div>

            <div className="h-8 w-0.5 bg-slate-200"></div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="w-full bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-4 relative"
            >
              <div className="absolute -top-3 left-4 bg-indigo-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">24h después</div>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">SMS 3</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Cross-selling</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
