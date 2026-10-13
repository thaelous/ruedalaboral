import React, { useState } from 'react';
import { ExecutiveReport, RecommendedAction } from '../types/leadership';
import { RadarChart } from './RadarChart';
import {
  Award,
  Target,
  Calendar,
  User,
  Briefcase,
  Compass,
  FileCheck,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  Save
} from 'lucide-react';

interface ExecutiveLetterSheetProps {
  report: ExecutiveReport;
  onEditRequested?: () => void;
  selectedCompetencyId?: string | null;
  onSelectCompetency?: (id: string) => void;
  onReportChange?: (updatedReport: ExecutiveReport) => void;
  onSaveAsDefault?: (report: ExecutiveReport) => void;
  onRestoreDefault?: () => void;
  id?: string;
  isBatchMode?: boolean;
}

const DEFAULT_TEMPLATE_KEY = 'COMUNICACION_GLOBAL_DEFAULT_TEMPLATE_V1';

export const ExecutiveLetterSheet: React.FC<ExecutiveLetterSheetProps> = ({
  report,
  selectedCompetencyId,
  onSelectCompetency,
  onReportChange,
  onSaveAsDefault,
  onRestoreDefault,
  id = 'cuartilla-reporte',
  isBatchMode = false
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [hasEdits, setHasEdits] = useState<boolean>(false);
  const [logoError, setLogoError] = useState<boolean>(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  const labels = report.customLabels || {};

  // Helper to update metadata fields
  const handleMetadataBlur = (field: keyof typeof report.metadata, value: string) => {
    if (!onReportChange) return;
    const trimmed = value.trim();
    if (trimmed !== report.metadata[field]) {
      setHasEdits(true);
      onReportChange({
        ...report,
        metadata: {
          ...report.metadata,
          [field]: trimmed
        }
      });
    }
  };

  // Helper to update custom layout texts & labels
  const handleCustomLabelBlur = (key: string, value: string) => {
    if (!onReportChange) return;
    const trimmed = value.trim();
    if (trimmed !== (labels as any)[key]) {
      setHasEdits(true);
      onReportChange({
        ...report,
        customLabels: {
          ...labels,
          [key]: trimmed
        }
      });
    }
  };

  // Helper to update brief findings (fortalezas / oportunidades)
  const handleLecturaBlur = (category: 'fortalezas' | 'oportunidades', index: number, value: string) => {
    if (!onReportChange) return;
    const trimmed = value.trim();
    const currentList = [...report.lecturaBreve[category]];
    if (trimmed !== currentList[index]) {
      currentList[index] = trimmed;
      setHasEdits(true);
      onReportChange({
        ...report,
        lecturaBreve: {
          ...report.lecturaBreve,
          [category]: currentList
        }
      });
    }
  };

  // Helper to update action row
  const handleActionBlur = (index: number, field: keyof RecommendedAction, value: string) => {
    if (!onReportChange) return;
    const trimmed = value.trim();
    const currentActions = [...report.acciones];
    if (trimmed !== (currentActions[index][field] || '')) {
      currentActions[index] = {
        ...currentActions[index],
        [field]: trimmed
      };
      setHasEdits(true);
      onReportChange({
        ...report,
        acciones: currentActions
      });
    }
  };

  // Helper to update follow-up fields
  const handleSeguimientoBlur = (field: keyof typeof report.seguimiento, value: string) => {
    if (!onReportChange) return;
    const trimmed = value.trim();
    if (trimmed !== String(report.seguimiento[field] || '')) {
      setHasEdits(true);
      onReportChange({
        ...report,
        seguimiento: {
          ...report.seguimiento,
          [field]: trimmed
        }
      });
    }
  };

  const handleSaveAsDefaultClick = () => {
    if (onSaveAsDefault) {
      onSaveAsDefault(report);
    } else {
      localStorage.setItem(DEFAULT_TEMPLATE_KEY, JSON.stringify(report));
    }
    setSavedSuccessMsg('¡Plantilla y textos guardados por defecto exitosamente!');
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  const handleRestoreDefaultClick = () => {
    if (onRestoreDefault) {
      onRestoreDefault();
    }
    setSavedSuccessMsg('Valores restaurados a fábrica.');
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  const editableClass = isEditing
    ? 'outline-none hover:bg-emerald-50/70 focus:bg-white focus:ring-1 focus:ring-[#8CC63F] rounded px-1 transition-all cursor-text text-inherit'
    : 'outline-none cursor-default';

  return (
    <div className="w-full flex flex-col items-center py-2 print:p-0">
      {/* IN-SITU EDIT & TEMPLATE SAVE BAR */}
      {!isBatchMode && onReportChange && (
        <div className="w-full max-w-[850px] mb-2 px-1 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isEditing
                  ? 'bg-[#8CC63F] text-slate-950 ring-2 ring-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title={isEditing ? 'Desactivar edición in-situ' : 'Activar modo de edición absoluta sobre toda la cuartilla'}
            >
              {isEditing ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                  <span>Edición Absoluta Activa</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-3.5 h-3.5 text-[#8CC63F]" />
                  <span>Editar Toda la Cuartilla In-Situ</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveAsDefaultClick}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#8CC63F] border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="Guardar todos los textos, títulos, firmas y estructura actual como plantilla predeterminada"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar como Cuartilla por Default</span>
            </button>

            <button
              type="button"
              onClick={handleRestoreDefaultClick}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
              title="Restaurar plantilla predeterminada original"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Restaurar</span>
            </button>

            {savedSuccessMsg && (
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 animate-bounce">
                <Sparkles className="w-3.5 h-3.5" />
                {savedSuccessMsg}
              </span>
            )}
          </div>

          {isEditing && (
            <span className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Haz clic sobre cualquier título, etiqueta, firma o texto para editarlo
            </span>
          )}
        </div>
      )}

      {/* Letter sheet container: 8.5 x 11 inch proportions */}
      <article
        id={id}
        className="cuartilla-container cuartilla-print-target w-full max-w-[850px] bg-white text-slate-900 shadow-2xl rounded-sm print:shadow-none print:rounded-none border border-slate-200 print:border-none p-6 md:p-8 font-sans leading-tight print:p-0 min-h-[1000px] print:min-h-0"
      >
        {/* INSTITUTIONAL HEADER */}
        <header className="border-b-2 border-slate-900 pb-2 mb-6 avoid-page-break">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center border border-slate-300 shrink-0 overflow-hidden shadow-sm">
                {!logoError ? (
                  <img
                    src="/comgico.png"
                    alt="Comunicación Global"
                    onError={() => setLogoError(true)}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-[#8CC63F] flex items-center justify-center text-slate-950 font-black text-xs">
                    CG
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleCustomLabelBlur('supratitulo', e.currentTarget.textContent || '')}
                    className={`text-[10px] font-extrabold tracking-wider text-[#6B9E2B] uppercase ${editableClass}`}
                    title={isEditing ? 'Editar supratítulo' : undefined}
                  >
                    {labels.supratitulo || 'DESARROLLO ORGANIZACIONAL • FACILITACIÓN DE LIDERAZGO (SLII®)'}
                  </span>
                </div>
                <h1
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleCustomLabelBlur('tituloPrincipal', e.currentTarget.textContent || '')}
                  className={`text-lg md:text-xl font-black tracking-tight text-slate-900 uppercase mt-0.5 ${editableClass}`}
                  title={isEditing ? 'Editar título principal' : undefined}
                >
                  {labels.tituloPrincipal || 'Reporte Individual de Resultados y Recomendaciones'}
                </h1>
                <p
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleCustomLabelBlur('subtitulo', e.currentTarget.textContent || '')}
                  className={`text-[10px] text-slate-500 font-medium ${editableClass}`}
                  title={isEditing ? 'Editar subtítulo' : undefined}
                >
                  {labels.subtitulo || 'Herramienta diagnóstica de autoevaluación, alineación y desarrollo de competencias directivas'}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleCustomLabelBlur('badgeCuartilla', e.currentTarget.textContent || '')}
                className={`inline-block bg-slate-900 text-white text-[9.5px] font-bold px-2 py-0.5 tracking-wider uppercase rounded-xs ${editableClass}`}
                title={isEditing ? 'Editar insignia' : undefined}
              >
                {labels.badgeCuartilla || 'Cuartilla Oficial'}
              </span>
              <p
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleCustomLabelBlur('refText', e.currentTarget.textContent || '')}
                className={`text-[8.5px] text-slate-400 mt-1 font-mono ${editableClass}`}
                title={isEditing ? 'Editar referencia' : undefined}
              >
                {labels.refText || `REF: SLII-CG-${report.metadata.fechaAplicacion.replace(/[^a-zA-Z0-9]/g, '') || '2026'}`}
              </p>
            </div>
          </div>

          {/* METADATA STRIP */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-2.5 border-t border-slate-200 text-xs">
            {/* 1. Evaluado */}
            <div className="flex items-start gap-2 min-w-0">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleCustomLabelBlur('labelEvaluado', e.currentTarget.textContent || '')}
                  className={`block text-[8.5px] uppercase font-bold text-slate-400 tracking-wider ${editableClass}`}
                  title={isEditing ? 'Editar etiqueta evaluado' : undefined}
                >
                  {labels.labelEvaluado || 'Evaluado(a)'}
                </span>
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleMetadataBlur('nombre', e.currentTarget.textContent || '')}
                  className={`font-bold text-slate-900 block text-[11px] break-words ${editableClass}`}
                  title={isEditing ? 'Editar nombre del evaluado' : undefined}
                >
                  {report.metadata.nombre || '—'}
                </span>
              </div>
            </div>

            {/* 2. Puesto / Rol */}
            <div className="flex items-start gap-2 min-w-0">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleCustomLabelBlur('labelPuesto', e.currentTarget.textContent || '')}
                  className={`block text-[8.5px] uppercase font-bold text-slate-400 tracking-wider ${editableClass}`}
                  title={isEditing ? 'Editar etiqueta puesto' : undefined}
                >
                  {labels.labelPuesto || 'Puesto / Rol'}
                </span>
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleMetadataBlur('puesto', e.currentTarget.textContent || '')}
                  className={`font-semibold text-slate-800 block text-[11px] break-words ${editableClass}`}
                  title={isEditing ? 'Editar puesto o rol' : undefined}
                >
                  {report.metadata.puesto || '—'}
                </span>
              </div>
            </div>

            {/* 3. Fecha Aplicación */}
            <div className="flex items-start gap-2 min-w-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleCustomLabelBlur('labelFechaApp', e.currentTarget.textContent || '')}
                  className={`block text-[8.5px] uppercase font-bold text-slate-400 tracking-wider ${editableClass}`}
                  title={isEditing ? 'Editar etiqueta fecha' : undefined}
                >
                  {labels.labelFechaApp || 'Fecha Aplicación'}
                </span>
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleMetadataBlur('fechaAplicacion', e.currentTarget.textContent || '')}
                  className={`font-semibold text-slate-800 block text-[11px] break-words ${editableClass}`}
                  title={isEditing ? 'Editar fecha de aplicación' : undefined}
                >
                  {report.metadata.fechaAplicacion || '—'}
                </span>
              </div>
            </div>

            {/* 4. Seguimiento */}
            <div className="flex items-start gap-2 min-w-0">
              <Target className="w-3.5 h-3.5 text-[#6B9E2B] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleCustomLabelBlur('labelSeguimiento', e.currentTarget.textContent || '')}
                  className={`block text-[8.5px] uppercase font-bold text-[#6B9E2B] tracking-wider ${editableClass}`}
                  title={isEditing ? 'Editar etiqueta seguimiento' : undefined}
                >
                  {labels.labelSeguimiento || 'Seguimiento (5 semanas)'}
                </span>
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleMetadataBlur('fechaSeguimiento', e.currentTarget.textContent || '')}
                  className={`font-bold text-slate-900 block text-[11px] break-words ${editableClass}`}
                  title={isEditing ? 'Editar fecha de seguimiento' : undefined}
                >
                  {report.metadata.fechaSeguimiento || '—'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* SECTION 1: RADAR CHART */}
        <section className="mb-3 bg-slate-50/70 p-2 rounded border border-slate-200/90 avoid-page-break">
          <div className="flex items-center justify-between mb-0.5">
            <h2
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleCustomLabelBlur('tituloRadar', e.currentTarget.textContent || '')}
              className={`text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 ${editableClass}`}
              title={isEditing ? 'Editar título de gráfica' : undefined}
            >
              <span className="w-2 h-2 rounded-full bg-[#8CC63F]"></span>
              {labels.tituloRadar || 'Gráfica de Araña — Competencias del Liderazgo (Comunicación Global)'}
            </h2>
            <div
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleCustomLabelBlur('subtituloRadar', e.currentTarget.textContent || '')}
              className={`text-[9.5px] text-slate-500 font-medium ${editableClass}`}
              title={isEditing ? 'Editar subtítulo de gráfica' : undefined}
            >
              {labels.subtituloRadar || 'Escala de 1 a 10 · 8 Dimensiones Clave'}
            </div>
          </div>

          <div className="flex justify-center items-center py-0.5 radar-chart-print-container">
            <RadarChart
              data={report.competencias}
              size={330}
              isPrintMode={true}
              selectedId={selectedCompetencyId}
              onSelectCompetency={onSelectCompetency}
            />
          </div>

          <p
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onBlur={(e) => handleCustomLabelBlur('notaPieRadar', e.currentTarget.textContent || '')}
            className={`text-center text-[9.5px] text-slate-500 italic mt-0.5 font-serif border-t border-slate-200/60 pt-1 ${editableClass}`}
            title={isEditing ? 'Editar nota al pie de gráfica' : undefined}
          >
            {labels.notaPieRadar || '"Resultados basados en autoevaluación y diálogo individual; no constituyen una evaluación de desempeño de terceros."'}
          </p>
        </section>

        {/* SECTION 2: LECTURA BREVE */}
        <section className="mb-3 avoid-page-break">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1.5">
            <h2
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleCustomLabelBlur('tituloHallazgos', e.currentTarget.textContent || '')}
              className={`text-[11px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 ${editableClass}`}
              title={isEditing ? 'Editar título de hallazgos' : undefined}
            >
              <Award className="w-3.5 h-3.5 text-[#6B9E2B]" />
              {labels.tituloHallazgos || 'Lectura Breve de Hallazgos Prioritarios'}
            </h2>
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleCustomLabelBlur('subtituloHallazgos', e.currentTarget.textContent || '')}
              className={`text-[9.5px] font-bold text-slate-400 ${editableClass}`}
              title={isEditing ? 'Editar subtítulo de hallazgos' : undefined}
            >
              {labels.subtituloHallazgos || 'Máximo 4 postulados ejecutivos'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* Fortalezas */}
            <div className="box-fortalezas bg-emerald-50/70 border border-emerald-200 border-l-4 border-l-[#8CC63F] p-2 rounded-r">
              <span
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleCustomLabelBlur('tituloFortalezas', e.currentTarget.textContent || '')}
                className={`text-[9.5px] uppercase font-bold tracking-wider text-emerald-900 block mb-1 ${editableClass}`}
                title={isEditing ? 'Editar título fortalezas' : undefined}
              >
                {labels.tituloFortalezas || 'Fortalezas Prioritarias (Puntos Palanca - P.P.)'}
              </span>
              <ul className="space-y-1 text-[10.5px] text-slate-800 leading-snug">
                {report.lecturaBreve.fortalezas.map((frase, idx) => (
                  <li key={`fort-${idx}`} className="flex items-start gap-1.5">
                    <span className="text-[#6B9E2B] font-bold shrink-0 mt-0.5">•</span>
                    <span
                      contentEditable={isEditing}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleLecturaBlur('fortalezas', idx, e.currentTarget.textContent || '')}
                      className={`flex-1 ${editableClass}`}
                      title={isEditing ? 'Editar hallazgo de fortaleza' : undefined}
                    >
                      {frase}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Oportunidades */}
            <div className="box-oportunidades bg-rose-50/70 border border-rose-200 border-l-4 border-l-rose-600 p-2 rounded-r">
              <span
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleCustomLabelBlur('tituloOportunidades', e.currentTarget.textContent || '')}
                className={`text-[9.5px] uppercase font-bold tracking-wider text-rose-900 block mb-1 ${editableClass}`}
                title={isEditing ? 'Editar título oportunidades' : undefined}
              >
                {labels.tituloOportunidades || 'Áreas de Oportunidad Prioritarias (Puntos Impacto - P.I.)'}
              </span>
              <ul className="space-y-1 text-[10.5px] text-slate-800 leading-snug">
                {report.lecturaBreve.oportunidades.map((frase, idx) => (
                  <li key={`opo-${idx}`} className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold shrink-0 mt-0.5">•</span>
                    <span
                      contentEditable={isEditing}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleLecturaBlur('oportunidades', idx, e.currentTarget.textContent || '')}
                      className={`flex-1 ${editableClass}`}
                      title={isEditing ? 'Editar hallazgo de oportunidad' : undefined}
                    >
                      {frase}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 3: ACCIONES RECOMENDADAS */}
        <section className="mb-3 avoid-page-break">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1.5">
            <h2
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleCustomLabelBlur('tituloAcciones', e.currentTarget.textContent || '')}
              className={`text-[11px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 ${editableClass}`}
              title={isEditing ? 'Editar título acciones' : undefined}
            >
              <FileCheck className="w-3.5 h-3.5 text-[#6B9E2B]" />
              {labels.tituloAcciones || 'Acciones Recomendadas (Compromiso a Plazo Acordado)'}
            </h2>
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleCustomLabelBlur('subtituloAcciones', e.currentTarget.textContent || '')}
              className={`text-[9.5px] text-slate-500 font-medium ${editableClass}`}
              title={isEditing ? 'Editar subtítulo acciones' : undefined}
            >
              {labels.subtituloAcciones || 'Verbo observable + Situación + Plazo / Frecuencia'}
            </span>
          </div>

          <div className="overflow-hidden border border-slate-300 rounded text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-800 text-[9.5px] font-bold uppercase tracking-wider">
                  <th className="py-1 px-2.5 w-1/4 border-r border-slate-700 bg-slate-900 text-white">
                    <span
                      contentEditable={isEditing}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleCustomLabelBlur('thProposito', e.currentTarget.textContent || '')}
                      className={editableClass}
                      title={isEditing ? 'Editar encabezado columna' : undefined}
                    >
                      {labels.thProposito || 'Propósito'}
                    </span>
                  </th>
                  <th className="py-1 px-2.5 w-1/2 border-r border-slate-700 bg-slate-900 text-white">
                    <span
                      contentEditable={isEditing}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleCustomLabelBlur('thAccion', e.currentTarget.textContent || '')}
                      className={editableClass}
                      title={isEditing ? 'Editar encabezado columna' : undefined}
                    >
                      {labels.thAccion || 'Acción sugerida (Observable)'}
                    </span>
                  </th>
                  <th className="py-1 px-2.5 w-1/4 bg-slate-900 text-white">
                    <span
                      contentEditable={isEditing}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleCustomLabelBlur('thEvidencia', e.currentTarget.textContent || '')}
                      className={editableClass}
                      title={isEditing ? 'Editar encabezado columna' : undefined}
                    >
                      {labels.thEvidencia || 'Evidencia de aplicación'}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {report.acciones.map((acc, index) => {
                  const isSostener = acc.proposito === 'Sostener fortalezas';
                  return (
                    <tr
                      key={acc.id || index}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSostener ? 'bg-white' : 'bg-slate-50/40'
                      }`}
                    >
                      <td className="py-1 px-2.5 border-r border-slate-200 align-top">
                        <span
                          className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isSostener
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {acc.proposito}
                        </span>
                        <div
                          contentEditable={isEditing}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => handleActionBlur(index, 'estiloSLII', e.currentTarget.textContent || '')}
                          className={`text-[8px] text-slate-500 font-mono mt-0.5 ${editableClass}`}
                          title={isEditing ? 'Editar estilo SLII' : undefined}
                        >
                          {acc.estiloSLII || 'SLII®'}
                        </div>
                      </td>
                      <td className="py-1 px-2.5 border-r border-slate-200 align-top text-slate-900 leading-snug text-[10.5px]">
                        <span className="font-semibold text-slate-950 mr-1">{index + 1}.</span>
                        <span
                          contentEditable={isEditing}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => handleActionBlur(index, 'accionSugerida', e.currentTarget.textContent || '')}
                          className={editableClass}
                          title={isEditing ? 'Editar acción observable' : undefined}
                        >
                          {acc.accionSugerida}
                        </span>
                      </td>
                      <td className="py-1 px-2.5 align-top text-slate-600 text-[10px] leading-snug font-serif italic">
                        <span
                          contentEditable={isEditing}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => handleActionBlur(index, 'evidencia', e.currentTarget.textContent || '')}
                          className={editableClass}
                          title={isEditing ? 'Editar evidencia verificable' : undefined}
                        >
                          {acc.evidencia}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 4: SEGUIMIENTO & ENFOQUE SLII */}
        <footer className="pt-2 border-t border-slate-300 mt-2 avoid-page-break">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-2">
            <div className="bg-slate-100/70 p-2 rounded border border-slate-200">
              <span
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleCustomLabelBlur('tituloCompromisoSeguimiento', e.currentTarget.textContent || '')}
                className={`text-[9.5px] uppercase font-bold text-slate-700 block mb-0.5 ${editableClass}`}
                title={isEditing ? 'Editar título seguimiento' : undefined}
              >
                {labels.tituloCompromisoSeguimiento || 'Compromiso de Seguimiento (Evidencia a Revisar)'}
              </span>
              <p
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleSeguimientoBlur('evidenciaPrincipal', e.currentTarget.textContent || '')}
                className={`text-[10.5px] text-slate-800 leading-snug ${editableClass}`}
                title={isEditing ? 'Editar compromiso de seguimiento' : undefined}
              >
                {report.seguimiento.evidenciaPrincipal}
              </p>
            </div>
            <div className="bg-slate-100/70 p-2 rounded border border-slate-200">
              <span
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleCustomLabelBlur('tituloProximoEncuentro', e.currentTarget.textContent || '')}
                className={`text-[9.5px] uppercase font-bold text-slate-700 block mb-0.5 ${editableClass}`}
                title={isEditing ? 'Editar título próximo encuentro' : undefined}
              >
                {labels.tituloProximoEncuentro || 'Próximo Encuentro & Integración SLII®'}
              </span>
              <div className="text-[10.5px] text-slate-800 leading-snug">
                <span>
                  <strong>Fecha:</strong>{' '}
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleSeguimientoBlur('fechaProximoEncuentro', e.currentTarget.textContent || '')}
                    className={`inline font-semibold ${editableClass}`}
                    title={isEditing ? 'Editar fecha próximo encuentro' : undefined}
                  >
                    {report.seguimiento.fechaProximoEncuentro}
                  </span>
                  {' '}({report.seguimiento.plazoSemanas || 5} semanas).
                </span>
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleSeguimientoBlur('enfoqueSLII', e.currentTarget.textContent || '')}
                  className={`text-slate-600 block mt-0.5 ${editableClass}`}
                  title={isEditing ? 'Editar enfoque SLII' : undefined}
                >
                  {report.seguimiento.enfoqueSLII}
                </span>
              </div>
            </div>
          </div>

          {/* SIGNATURE BLOCKS */}
          <div className="grid grid-cols-2 gap-8 pt-4 text-center text-[10px]">
            <div>
              <div className="border-t border-slate-400 w-3/4 mx-auto pt-1">
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleMetadataBlur('nombre', e.currentTarget.textContent || '')}
                  className={`font-bold text-slate-900 block ${editableClass}`}
                  title={isEditing ? 'Editar nombre para firma' : undefined}
                >
                  {report.metadata.nombre}
                </span>
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleCustomLabelBlur('labelFirmaEvaluado', e.currentTarget.textContent || '')}
                  className={`text-slate-500 block ${editableClass}`}
                  title={isEditing ? 'Editar leyenda firma' : undefined}
                >
                  {labels.labelFirmaEvaluado || 'Firma del Líder Evaluado'}
                </span>
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 w-3/4 mx-auto pt-1">
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleMetadataBlur('facilitador', e.currentTarget.textContent || '')}
                  className={`font-bold text-slate-900 block ${editableClass}`}
                  title={isEditing ? 'Editar nombre o entidad del facilitador' : undefined}
                >
                  {report.metadata.facilitador || 'Facilitación de Desarrollo Organizacional • Comunicación Global'}
                </span>
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleCustomLabelBlur('labelFirmaFacilitador', e.currentTarget.textContent || '')}
                  className={`text-slate-500 block ${editableClass}`}
                  title={isEditing ? 'Editar leyenda acreditación' : undefined}
                >
                  {labels.labelFirmaFacilitador || 'Acreditación Liderazgo Situacional (SLII®)'}
                </span>
              </div>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
};
