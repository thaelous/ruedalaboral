import React, { useState } from 'react';
import { Compass, Split, FileText, Sliders, Upload, Edit3, Copy, Printer, Key, CheckCircle, Download, Loader2, BookOpen, Sun, Moon, ShieldCheck } from 'lucide-react';

export type ActiveTab = 'split' | 'cuartilla' | 'radar';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onUploadClick: () => void;
  onOpenAdjustModal: () => void;
  onOpenCompetencyBankModal: () => void;
  onCopyReport: () => void;
  onPrintReport: () => void;
  onOpenApiKeyModal: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  hasApiKey: boolean;
  copiedSuccess: boolean;
  hasReport: boolean;
  isGeneratingPdf?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onUploadClick,
  onOpenAdjustModal,
  onOpenCompetencyBankModal,
  onCopyReport,
  onPrintReport,
  onOpenApiKeyModal,
  theme,
  onToggleTheme,
  hasApiKey,
  copiedSuccess,
  hasReport,
  isGeneratingPdf = false
}) => {
  const [logoError, setLogoError] = useState<boolean>(false);
  const isDark = theme === 'dark';

  return (
    <header className={`${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} border-b sticky top-0 z-40 print:hidden transition-colors`}>
      {/* TOP BRANDING BAR */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* BRAND & TITLES */}
        <div className="flex items-center gap-3">
          {/* LOGO CONTAINER WITH FALLBACK */}
          <div className={`w-11 h-11 rounded-lg ${isDark ? 'bg-white border-slate-800' : 'bg-slate-100 border-slate-200'} p-1 flex items-center justify-center shadow-lg border shrink-0 overflow-hidden`}>
            {!logoError ? (
              <img
                src="/comgico.png"
                alt="Comunicación Global Logo"
                onError={() => setLogoError(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#8CC63F] to-[#6B9E2B] flex items-center justify-center text-slate-950 font-black text-xs tracking-tighter">
                CG
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8CC63F] bg-emerald-950/80 text-emerald-300 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                Comunicación Global
              </span>
              <h1 className={`text-sm md:text-base font-black tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-950'}`}>
                Rueda de Liderazgo
              </h1>
              <span className="bg-[#8CC63F] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase shadow-sm">
                Cuartilla Ejecutiva
              </span>
            </div>
            <p className={`text-xs font-medium hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Análisis visual de trazos, Puntos Palanca / Impacto y Liderazgo Situacional (SLII®)
            </p>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTONS */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg border transition flex items-center justify-center ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* API Key Modal Button with Green Indicator */}
          <button
            onClick={onOpenApiKeyModal}
            className={`px-3 py-1.5 rounded-md border font-medium transition flex items-center gap-1.5 shadow-sm relative ${
              hasApiKey
                ? isDark
                  ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title={hasApiKey ? 'API Key configurada y activa' : 'Configurar API Key de Gemini'}
          >
            <Key className="w-3.5 h-3.5 text-[#8CC63F]" />
            <span>API Key</span>
            {hasApiKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="Activa" />
            )}
          </button>

          {/* Competency Bank Manager trigger */}
          <button
            onClick={onOpenCompetencyBankModal}
            className={`px-3 py-1.5 rounded-md border font-medium transition flex items-center gap-1.5 shadow-sm ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Gestionar Banco de Competencias (Excel / Manual)"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#8CC63F]" />
            <span>Banco de Competencias</span>
          </button>

          {/* Upload trigger */}
          <button
            onClick={onUploadClick}
            className="px-3 py-1.5 rounded-md bg-[#8CC63F] hover:bg-[#6B9E2B] text-slate-950 font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Rueda(s)</span>
          </button>

          {/* Adjust data */}
          <button
            onClick={onOpenAdjustModal}
            disabled={!hasReport}
            className={`px-2.5 py-1.5 rounded-md border transition flex items-center gap-1.5 font-medium ${
              hasReport
                ? isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : isDark
                ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
            }`}
            title={hasReport ? 'Ajustar datos manualmente' : 'Primero sube y procesa una rueda'}
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden md:inline">Ajustar</span>
          </button>

          {/* Copy report */}
          <button
            onClick={onCopyReport}
            disabled={!hasReport}
            className={`px-2.5 py-1.5 rounded-md border transition flex items-center gap-1.5 font-medium ${
              !hasReport
                ? isDark
                  ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                : copiedSuccess
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title={hasReport ? 'Copiar texto estructurado del informe al portapapeles' : 'Primero sube y procesa una rueda'}
          >
            {copiedSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Copiar Reporte</span>
              </>
            )}
          </button>

          {/* Download / Print PDF button */}
          <button
            onClick={onPrintReport}
            className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 shadow-md ${
              !hasReport
                ? isDark
                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                  : 'bg-slate-200 text-slate-500 border border-slate-300'
                : 'bg-gradient-to-r from-emerald-500 to-[#6B9E2B] hover:from-emerald-400 hover:to-[#5a8624] text-slate-950 shadow-emerald-950/40'
            }`}
            title={hasReport ? 'Imprimir o guardar en PDF (tamaño carta)' : 'Puedes imprimir o guardar la Cuartilla Oficial directamente'}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Descargar / Imprimir PDF</span>
          </button>
        </div>
      </div>

      {/* VIEW TABS SEGMENTED BAR */}
      <div className={`${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-100 border-slate-200'} border-t px-4 transition-colors`}>
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-1.5 text-xs">
          <button
            onClick={() => onTabChange('split')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-2 transition-all ${
              activeTab === 'split'
                ? 'bg-[#8CC63F] text-slate-950 font-bold shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Vista Dividida (Hoja + Cuartilla)</span>
          </button>

          <button
            onClick={() => onTabChange('cuartilla')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-2 transition-all ${
              activeTab === 'cuartilla'
                ? 'bg-[#8CC63F] text-slate-950 font-bold shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Cuartilla Oficial (Hoja Carta)</span>
          </button>

          <button
            onClick={() => onTabChange('radar')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-2 transition-all ${
              activeTab === 'radar'
                ? 'bg-[#8CC63F] text-slate-950 font-bold shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Radar Interactivo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
