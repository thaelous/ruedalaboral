import React, { useState } from 'react';
import { CompetencyScore, OFFICIAL_COMPETENCIES, ExecutiveReport } from '../types/leadership';
import { RadarChart } from './RadarChart';
import { BookOpen, CheckCircle, Info, Sparkles, Sliders } from 'lucide-react';

interface RadarInteractiveViewProps {
  report: ExecutiveReport;
  onUpdateCompetencies: (updated: CompetencyScore[]) => void;
}

export const RadarInteractiveView: React.FC<RadarInteractiveViewProps> = ({
  report,
  onUpdateCompetencies
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string>(report.competencias[0]?.id || 'credibilidad_integridad');

  const selectedDef = OFFICIAL_COMPETENCIES.find(c => c.id === selectedCompId) || OFFICIAL_COMPETENCIES[0];
  const selectedScore = report.competencias.find(c => c.id === selectedCompId) || report.competencias[0];

  const handleScoreChange = (id: string, field: 'actual' | 'meta', value: number) => {
    const updated = report.competencias.map(comp => {
      if (comp.id === id) {
        return { ...comp, [field]: Number(value.toFixed(1)) };
      }
      return comp;
    });
    onUpdateCompetencies(updated);
  };

  const handleToggleBadge = (id: string, badgeType: 'isPuntoPalanca' | 'isPuntoImpacto') => {
    const updated = report.competencias.map(comp => {
      if (comp.id === id) {
        return {
          ...comp,
          [badgeType]: !comp[badgeType],
          // if toggling PP on, toggle PI off on the same competency
          ...(badgeType === 'isPuntoPalanca' && !comp.isPuntoPalanca ? { isPuntoImpacto: false } : {}),
          ...(badgeType === 'isPuntoImpacto' && !comp.isPuntoImpacto ? { isPuntoPalanca: false } : {})
        };
      }
      return comp;
    });
    onUpdateCompetencies(updated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      {/* LEFT COLUMN: RADAR CHART PREVIEW & SLIDERS */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Radar Interactivo & Ajuste de Niveles</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Haz clic en cualquier vértice o ajusta los controles para sincronizar la cuartilla en tiempo real.
            </p>
          </div>
          <span className="text-[11px] font-mono bg-blue-950 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded">
            Escala 1.0 - 10.0
          </span>
        </div>

        {/* RADAR CANVAS CONTAINER */}
        <div className="bg-white rounded-lg p-4 shadow-inner flex justify-center items-center my-2">
          <RadarChart
            data={report.competencias}
            size={400}
            selectedId={selectedCompId}
            onSelectCompetency={(id) => setSelectedCompId(id)}
          />
        </div>

        {/* ACTIVE COMPETENCY QUICK CONTROLLER */}
        <div className="mt-4 p-4 bg-slate-950/80 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-cyan-300">
              {selectedScore?.name}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleBadge(selectedCompId, 'isPuntoPalanca')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  selectedScore?.isPuntoPalanca
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-amber-300'
                }`}
              >
                ★ Punto Palanca (P.P.)
              </button>
              <button
                onClick={() => handleToggleBadge(selectedCompId, 'isPuntoImpacto')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  selectedScore?.isPuntoImpacto
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-rose-300'
                }`}
              >
                ▲ Punto Impacto (P.I.)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Autoevaluación Actual:</span>
                <span className="font-mono font-bold text-blue-400">{selectedScore?.actual.toFixed(1)} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={selectedScore?.actual || 5}
                onChange={(e) => handleScoreChange(selectedCompId, 'actual', parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Meta Acordada:</span>
                <span className="font-mono font-bold text-cyan-400">{selectedScore?.meta.toFixed(1)} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={selectedScore?.meta || 7}
                onChange={(e) => handleScoreChange(selectedCompId, 'meta', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 8 COMPETENCY SELECTOR PILLS */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {report.competencias.map((comp) => {
            const isSelected = comp.id === selectedCompId;
            return (
              <button
                key={comp.id}
                onClick={() => setSelectedCompId(comp.id)}
                className={`p-2 rounded text-left border transition-all ${
                  isSelected
                    ? 'bg-blue-900/40 border-cyan-500 text-white shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="text-[11px] font-semibold truncate">{comp.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Act: {comp.actual} · Meta: {comp.meta}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: OFFICIAL DICTIONARY & OBSERVABLE BEHAVIORS (DOCX REFERENCE) */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Diccionario de Competencias
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Adaptación Martha Alles • Taxonomía Bloom • SLII® Blanchard
            </span>
          </div>
        </div>

        {selectedDef ? (
          <div className="space-y-4 flex-1 text-xs">
            {/* Competency Card */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">
                {selectedDef.category}
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5 mb-2">
                {selectedDef.name}
              </h4>
              <p className="text-slate-300 leading-relaxed font-sans">
                {selectedDef.definition}
              </p>
            </div>

            {/* Three Observable Behaviors */}
            <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-lg">
              <h5 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                Tres Conductas Observables
              </h5>
              <ul className="space-y-2 text-slate-300">
                {selectedDef.observableBehaviors.map((beh, idx) => (
                  <li key={`beh-${idx}`} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-950 text-blue-300 border border-blue-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{beh}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evidence Examples for Session */}
            <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-lg">
              <h5 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                Ejemplo de Evidencia Concreta
              </h5>
              <p className="text-slate-300 italic font-serif">
                "{selectedDef.evidenceExamples}"
              </p>
            </div>

            {/* Methodological Guidance */}
            <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-lg text-slate-300 text-[11px] leading-relaxed">
              <strong className="text-cyan-300 block mb-1">Criterio de Evaluación:</strong>
              Un puntaje alto representa una fortaleza percibida que debe explorarse con evidencias; un puntaje bajo es un punto de indagación. La prioridad depende del impacto en el equipo y resultados.
            </div>
          </div>
        ) : (
          <div className="text-slate-500 text-center py-10">
            Selecciona una competencia para ver su definición metodológica.
          </div>
        )}
      </div>
    </div>
  );
};
