import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Upload, FileImage, Sparkles, Layers } from 'lucide-react';
import { ExecutiveReport } from '../types/leadership';

interface OriginalSheetViewerProps {
  imageSrc: string | null;
  onImageSelected: (files: File[]) => void;
  report: ExecutiveReport;
  onAnalyzeTriggered?: () => void;
  isAnalyzing?: boolean;
}

export const OriginalSheetViewer: React.FC<OriginalSheetViewerProps> = ({
  imageSrc,
  onImageSelected,
  report,
  onAnalyzeTriggered,
  isAnalyzing
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showDetectedAnnotations, setShowDetectedAnnotations] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.6));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (validFiles.length > 0) {
        onImageSelected(validFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      if (validFiles.length > 0) {
        onImageSelected(validFiles);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <FileImage className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Visor de Hoja Manuscrita</span>
          <span className="text-[11px] text-slate-500 font-mono">({Math.round(zoom * 100)}%)</span>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowDetectedAnnotations(!showDetectedAnnotations)}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
              showDetectedAnnotations
                ? 'bg-blue-900/60 text-cyan-300 border border-blue-700/50'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Alternar etiquetas flotantes de Puntos Palanca e Impacto"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">Etiquetas P.P. / P.I.</span>
          </button>

          <button
            onClick={handleZoomOut}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Alejar (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Acercar (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Restablecer (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="ml-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1 transition"
          >
            <Upload className="w-3 h-3" />
            <span>Cargar JPG/PNG</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />
        </div>
      </div>

      {/* VIEWPORT CANVAS / DRAG AREA */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative flex-1 overflow-hidden select-none bg-slate-950/90 flex items-center justify-center cursor-${
          isDragging ? 'grabbing' : 'grab'
        }`}
        style={{ minHeight: '480px' }}
      >
        {/* Background grid texture */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />

        {imageSrc ? (
          /* DISPLAY LOADED / UPLOADED IMAGE */
          <div
            className="relative transition-transform duration-75"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            <img
              src={imageSrc}
              alt="Rueda de Liderazgo manuscrita"
              className="max-h-[680px] w-auto object-contain rounded shadow-2xl border border-slate-700/80 pointer-events-none"
            />

            {/* FLOATING OVERLAY DETECTED BADGES ON THE IMAGE */}
            {showDetectedAnnotations && (
              <>
                {/* Punto Palanca (P.P.) Bottom Left */}
                <div
                  className="absolute bottom-6 left-6 z-10 bg-amber-950/90 border-2 border-amber-500/80 text-amber-200 px-3 py-2 rounded-lg shadow-xl backdrop-blur-sm pointer-events-auto max-w-[280px]"
                  style={{ transform: 'translate(0, 0)' }}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase">
                    <span>★ P.P. (Punto Palanca)</span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      · {report.puntosClaveManuscritos.puntoPalanca.competencia}
                    </span>
                  </div>
                  <ul className="text-[10px] text-amber-100/90 mt-1 space-y-0.5 list-disc list-inside">
                    {report.puntosClaveManuscritos.puntoPalanca.anotaciones.map((an, i) => (
                      <li key={`pp-${i}`} className="truncate">{an}</li>
                    ))}
                  </ul>
                </div>

                {/* Punto Impacto (P.I.) Bottom Right */}
                <div
                  className="absolute bottom-6 right-6 z-10 bg-rose-950/90 border-2 border-rose-500/80 text-rose-200 px-3 py-2 rounded-lg shadow-xl backdrop-blur-sm pointer-events-auto max-w-[280px]"
                  style={{ transform: 'translate(0, 0)' }}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 uppercase">
                    <span>▲ P.I. (Punto Impacto)</span>
                    <span className="text-[10px] text-rose-400 font-mono">
                      · {report.puntosClaveManuscritos.puntoImpacto.competencia}
                    </span>
                  </div>
                  <ul className="text-[10px] text-rose-100/90 mt-1 space-y-0.5 list-disc list-inside">
                    {report.puntosClaveManuscritos.puntoImpacto.anotaciones.map((an, i) => (
                      <li key={`pi-${i}`} className="truncate">{an}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        ) : (
          /* HIGH-FIDELITY VECTOR SIMULATION OF CLAUDIA'S HANDWRITTEN SHEET */
          <div
            className="relative transition-transform duration-75"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            {/* Sheet frame */}
            <div className="w-[520px] bg-amber-50 text-slate-800 p-6 rounded shadow-2xl border-2 border-slate-300 font-sans relative">
              {/* Header handwriting */}
              <div className="text-center font-serif text-sm font-bold text-slate-700 tracking-wide mb-3">
                Rueda laboral aplicada en Liderazgo
              </div>

              <div className="flex justify-between items-center text-xs text-slate-700 border-b border-slate-300 pb-2 mb-3 font-mono">
                <div>
                  <span className="font-semibold text-slate-500">Nombre: </span>
                  <span className="font-bold text-blue-900 text-sm">{report.metadata.nombre}</span>
                </div>
                <div className="flex gap-3 text-[11px]">
                  <span><strong>Fecha 1:</strong> {report.metadata.fechaAplicacion}</span>
                  <span><strong>Fecha 2:</strong> {report.metadata.fechaSeguimiento}</span>
                </div>
              </div>

              {/* Hand-drawn styled Wheel with ink lines */}
              <div className="relative my-4 flex justify-center">
                <svg width="340" height="340" viewBox="0 0 340 340" className="overflow-visible">
                  {/* Concentric circles 50% and 100% */}
                  <circle cx="170" cy="170" r="140" fill="none" stroke="#1e293b" strokeWidth="2.5" />
                  <circle cx="170" cy="170" r="90" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
                  <circle cx="170" cy="170" r="40" fill="none" stroke="#94a3b8" strokeWidth="1" />

                  {/* 4 dividing cross axes (8 sectors) */}
                  <line x1="170" y1="30" x2="170" y2="310" stroke="#1e293b" strokeWidth="2" />
                  <line x1="30" y1="170" x2="310" y2="170" stroke="#1e293b" strokeWidth="2" />
                  <line x1="71" y1="71" x2="269" y2="269" stroke="#1e293b" strokeWidth="2" />
                  <line x1="269" y1="71" x2="71" y2="269" stroke="#1e293b" strokeWidth="2" />

                  {/* Handwritten ink curves (Blue pen simulated) */}
                  <path
                    d="M 170 58 Q 230 70 240 100 Q 255 155 255 170 Q 250 245 225 255 Q 170 235 170 252 Q 135 235 120 220 Q 95 180 95 170 Q 110 135 125 105 Z"
                    fill="rgba(37,99,235,0.12)"
                    stroke="#1d4ed8"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />

                  {/* Handwritten percentages on axes */}
                  <text x="175" y="52" fill="#1e40af" fontSize="11" fontWeight="bold">80%</text>
                  <text x="245" y="95" fill="#1e40af" fontSize="11" fontWeight="bold">80%</text>
                  <text x="260" y="180" fill="#1e40af" fontSize="11" fontWeight="bold">90%</text>
                  <text x="225" y="270" fill="#1e40af" fontSize="11" fontWeight="bold">90%</text>
                  <text x="175" y="260" fill="#1e40af" fontSize="11" fontWeight="bold">80%</text>
                  <text x="105" y="225" fill="#be123c" fontSize="11" fontWeight="bold">50%</text>
                  <text x="80" y="165" fill="#b45309" fontSize="11" fontWeight="bold">60%</text>
                  <text x="110" y="95" fill="#1e40af" fontSize="11" fontWeight="bold">50%</text>
                </svg>
              </div>

              {/* Bottom handwriting boxes: P.P. and P.I. */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] font-sans">
                <div className="border-2 border-amber-500/80 bg-amber-100/60 p-2 rounded">
                  <div className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                    <span>★ Punto Palanca (P.P)</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-[10.5px]">Manejo de conflictos</div>
                  <ul className="text-slate-700 text-[10px] space-y-0.5 mt-1">
                    <li>- No involucrarme personalmente</li>
                    <li>- Entender la causa raíz</li>
                    <li>- Tener firmeza no tener complacencia</li>
                  </ul>
                </div>

                <div className="border-2 border-rose-500/80 bg-rose-100/60 p-2 rounded">
                  <div className="font-bold text-rose-900 flex items-center gap-1 mb-1">
                    <span>▲ Punto Impacto (P.I)</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-[10.5px]">Visión Sistémica</div>
                  <ul className="text-slate-700 text-[10px] space-y-0.5 mt-1">
                    <li>- Tener a tiempo los productos</li>
                    <li>- Solidaridad en otras áreas</li>
                    <li>- Dar soporte a otro líder</li>
                  </ul>
                </div>
              </div>

              <div className="mt-3 text-[9px] text-slate-400 text-center font-mono">
                vivo Y35 · 22 jul 2026, 13:13
              </div>
            </div>
          </div>
        )}

        {/* DRAG-AND-DROP CALLOUT IF NOT DRAGGING */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="text-[10px] bg-slate-900/90 text-slate-400 border border-slate-700 px-2 py-1 rounded shadow">
            Arrastra para mover · Usa zoom · Haz clic en "Cargar JPG/PNG" para subir tu imagen
          </span>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          {imageSrc ? 'Imagen cargada en memoria del cliente' : 'Visualizando muestra manuscrita de referencia'}
        </div>
        {onAnalyzeTriggered && (
          <button
            onClick={onAnalyzeTriggered}
            disabled={isAnalyzing}
            className="px-3 py-1.5 rounded bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-900/40 transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Analizando con Gemini...' : 'Analizar Hoja con Gemini'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
