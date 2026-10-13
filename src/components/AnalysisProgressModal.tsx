import React from 'react';
import { Compass, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  currentStepMessage: string;
}

const STEPS = [
  'Analizando rueda con IA... (esto toma unos 5-10 segundos)',
  'Inspeccionando trazos y geometría de la rueda...',
  'Estructurando acciones bajo modelo de Liderazgo Situacional (SLII)...'
];

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  isOpen,
  currentStepMessage
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-7 text-white shadow-2xl relative overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#8CC63F]/10 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-[#8CC63F] flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
            <Compass className="w-7 h-7 text-slate-950 font-bold" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8CC63F] font-mono">
              Comunicación Global • Multimodal SDK
            </span>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              Análisis Visual de Rueda de Liderazgo
            </h3>
          </div>
        </div>

        {/* CURRENT STATUS HIGHLIGHT */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl mb-6 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-[#8CC63F] animate-spin shrink-0" />
          <span className="text-sm font-semibold text-slate-200">
            {currentStepMessage || 'Analizando rueda con IA... (esto toma unos 5-10 segundos)'}
          </span>
        </div>

        {/* 3 STEPS PROGRESS BAR */}
        <div className="space-y-3 mb-6">
          {STEPS.map((stepText, idx) => (
            <div
              key={`step-${idx}`}
              className="flex items-center gap-3 p-2.5 rounded-lg border bg-slate-950/40 border-slate-800 text-slate-300"
            >
              <div className="shrink-0">
                {idx === 0 ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[#8CC63F] border-t-transparent animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] text-slate-500">
                    {idx + 1}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium leading-snug">
                  {stepText}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 text-center font-serif italic">
          Extrayendo geometría octagonal, autoevaluaciones, meta acordada y anotaciones de P.P. y P.I. según el estándar oficial.
        </p>
      </div>
    </div>
  );
};
