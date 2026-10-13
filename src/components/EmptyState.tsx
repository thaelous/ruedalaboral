import React from 'react';
import { Upload, Compass, Layers, ShieldCheck, Sparkles, FileText } from 'lucide-react';

interface EmptyStateProps {
  onUploadClick: () => void;
  onDropFiles: (files: FileList | File[]) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onUploadClick,
  onDropFiles
}) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[600px] select-none">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="w-full max-w-2xl bg-slate-900/90 border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-2xl p-8 md:p-12 text-center transition-all shadow-2xl relative overflow-hidden group"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/30 mx-auto mb-5 group-hover:scale-105 transition-transform">
          <Compass className="w-9 h-9 text-white" />
        </div>

        <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 font-mono">
          Desarrollo Organizacional • Modelo SLII®
        </span>
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-1 mb-3">
          Comienza subiendo la Rueda de Liderazgo
        </h2>
        <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
          Arrastra aquí una o varias fotografías de las ruedas completadas a mano por tus participantes, o haz clic en el botón inferior para seleccionarlas.
        </p>

        {/* Action Button */}
        <button
          onClick={onUploadClick}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition flex items-center gap-2 mx-auto active:scale-95"
        >
          <Upload className="w-4 h-4" />
          <span>Seleccionar Imágenes (Individual o Lote)</span>
        </button>

        {/* Feature Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8 pt-8 border-t border-slate-800/80 text-left">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
            <div className="w-6 h-6 rounded-lg bg-blue-950 text-cyan-300 flex items-center justify-center text-xs font-bold font-mono mb-2">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-200">Inspección de Trazos</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Lectura visual de niveles del 0 al 100% y autoevaluación actual vs. meta.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
            <div className="w-6 h-6 rounded-lg bg-amber-950 text-amber-300 flex items-center justify-center text-xs font-bold font-mono mb-2">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-200">Puntos P.P. y P.I.</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Identificación de Puntos Palanca y Puntos Impacto manuscritos.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
            <div className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-300 flex items-center justify-center text-xs font-bold font-mono mb-2">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-200">Cuartilla Oficial PDF</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Generación de informe en hoja carta con 6 acciones SLII y descarga en PDF.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
