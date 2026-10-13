import React, { useRef } from 'react';
import { BatchParticipantItem } from '../types/batch';
import { 
  X, 
  Upload, 
  Play, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Layers, 
  UserCheck, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

interface BatchManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: BatchParticipantItem[];
  selectedId: string;
  onSelectParticipant: (id: string) => void;
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveItem: (id: string) => void;
  onStartBatchProcessing: () => void;
  isProcessing: boolean;
  currentIndex: number;
  totalCount: number;
  currentStepMessage: string;
}

export const BatchManagerModal: React.FC<BatchManagerModalProps> = ({
  isOpen,
  onClose,
  items,
  selectedId,
  onSelectParticipant,
  onAddFiles,
  onRemoveItem,
  onStartBatchProcessing,
  isProcessing,
  currentIndex,
  totalCount,
  currentStepMessage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const pendingCount = items.filter(it => it.status === 'pending').length;
  const completedCount = items.filter(it => it.status === 'completed').length;
  const errorCount = items.filter(it => it.status === 'error').length;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
    }
  };

  const progressPercent = totalCount > 0 ? Math.round(((currentIndex) / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 print:hidden">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col text-white shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Lote de Ruedas de Liderazgo</h3>
                <span className="text-[10px] font-mono bg-blue-950 text-cyan-300 border border-blue-800/60 px-2 py-0.5 rounded">
                  {items.length} participantes
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Carga masiva, procesamiento secuencial con Gemini y generación de paquetes individuales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BATCH PROGRESS BAR (IF PROCESSING) */}
        {isProcessing && (
          <div className="px-6 py-3 bg-blue-950/40 border-b border-blue-900/60 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Analizando participante {currentIndex + 1} de {totalCount}...</span>
              </span>
              <span className="font-mono text-slate-300">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 truncate font-mono">
              {currentStepMessage}
            </div>
          </div>
        )}

        {/* METRICS STRIP */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Pendientes: <strong className="text-white">{pendingCount}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Completados: <strong className="text-white">{completedCount}</strong></span>
            </span>
            {errorCount > 0 && (
              <span className="flex items-center gap-1.5 text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Con error: <strong className="text-white">{errorCount}</strong></span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Agregar más imágenes</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />

            <button
              onClick={onStartBatchProcessing}
              disabled={isProcessing || pendingCount === 0}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/40 transition disabled:opacity-40"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Procesar Lote ({pendingCount})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* DROP ZONE & GALLERY LIST */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Quick upload drop banner if empty or to add more */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 bg-slate-950/60 rounded-xl p-4 text-center cursor-pointer transition group"
          >
            <Upload className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 mx-auto mb-1.5 transition" />
            <div className="text-xs font-semibold text-slate-300">
              Arrastra aquí múltiples imágenes o haz clic para seleccionarlas
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              JPG, PNG o WEBP · Puedes subir todas las ruedas de tu equipo simultáneamente
            </div>
          </div>

          {/* GALLERY GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item, idx) => {
              const isSelected = item.id === selectedId;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectParticipant(item.id)}
                  className={`group relative bg-slate-950 border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition ${
                    isSelected
                      ? 'border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-950/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.imageSrc ? (
                        <img
                          src={item.imageSrc}
                          alt={item.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-6 h-6 text-slate-600" />
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">
                          #{idx + 1}
                        </span>
                        {/* Status badge */}
                        {item.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Listo</span>
                          </span>
                        )}
                        {item.status === 'analyzing' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/60">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Analizando</span>
                          </span>
                        )}
                        {item.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/60">
                            <Clock className="w-3 h-3" />
                            <span>Pendiente</span>
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800/60">
                            <AlertCircle className="w-3 h-3" />
                            <span>Error</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-200 truncate mt-1">
                        {item.report?.metadata?.nombre || item.fileName}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {item.fileName}
                      </p>
                    </div>
                  </div>

                  {/* Actions / Details */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                    <span className="text-slate-400 truncate">
                      {item.report?.metadata?.puesto || 'Evaluación individual'}
                    </span>

                    {/* Delete button (except if analyzing) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item.id);
                      }}
                      disabled={isProcessing && item.status === 'analyzing'}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition disabled:opacity-30"
                      title="Eliminar de la lista"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Selecciona cualquier participante para previsualizar su cuartilla y hoja original.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Cerrar y Ver Resultados
          </button>
        </div>
      </div>
    </div>
  );
};
