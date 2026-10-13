import React from 'react';
import { BatchParticipantItem } from '../types/batch';
import { 
  Users, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Printer, 
  ChevronRight 
} from 'lucide-react';

interface ParticipantSwitcherProps {
  items: BatchParticipantItem[];
  selectedId: string;
  onSelectParticipant: (id: string) => void;
  onOpenBatchModal: () => void;
  onPrintEntireBatch: () => void;
  isProcessing: boolean;
  onAddFilesClick: () => void;
}

export const ParticipantSwitcher: React.FC<ParticipantSwitcherProps> = ({
  items,
  selectedId,
  onSelectParticipant,
  onOpenBatchModal,
  onPrintEntireBatch,
  isProcessing,
  onAddFilesClick
}) => {
  const completedCount = items.filter(i => i.status === 'completed').length;

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2 print:hidden backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* PARTICIPANT TABS SCROLLER */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar flex-1 min-w-0">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mr-1 shrink-0 uppercase tracking-wider font-mono">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Lote ({items.length}):</span>
          </div>

          {items.map((item, idx) => {
            const isSelected = item.id === selectedId;
            const name = item.report?.metadata?.nombre || item.fileName || `Participante ${idx + 1}`;

            return (
              <button
                key={item.id}
                onClick={() => onSelectParticipant(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 border border-blue-500'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Status icon indicator */}
                {item.status === 'completed' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                {item.status === 'analyzing' && (
                  <Loader2 className="w-3.5 h-3.5 text-cyan-300 animate-spin shrink-0" />
                )}
                {item.status === 'pending' && (
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                {item.status === 'error' && (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}

                <span className="truncate max-w-[140px] md:max-w-[180px]">{name}</span>
              </button>
            );
          })}

          {/* Quick add file pill */}
          <button
            onClick={onAddFilesClick}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-800 border border-dashed border-slate-700 transition shrink-0"
            title="Subir más ruedas al lote"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Agregar</span>
          </button>
        </div>

        {/* BATCH ACTIONS (MANAGE & PRINT ENTIRE BATCH) */}
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <button
            onClick={onOpenBatchModal}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition flex items-center gap-1.5"
            title="Ver galería y cola de procesamiento"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Gestionar Lote</span>
            {isProcessing && <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />}
          </button>

          {/* Print Entire Batch Button */}
          <button
            onClick={onPrintEntireBatch}
            disabled={completedCount === 0}
            className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white font-semibold transition flex items-center gap-1.5 shadow-md shadow-indigo-950/40 disabled:opacity-40"
            title="Mandar a imprimir todas las cuartillas juntas en un solo trabajo de impresión con salto de página"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-200" />
            <span className="hidden md:inline">Imprimir todo el paquete ({completedCount})</span>
            <span className="md:hidden">Paquete ({completedCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
