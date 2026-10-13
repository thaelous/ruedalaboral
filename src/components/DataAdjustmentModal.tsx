import React, { useState } from 'react';
import { ExecutiveReport, RecommendedAction } from '../types/leadership';
import { X, Save, Edit3, Check, Trash2, Plus } from 'lucide-react';

interface DataAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ExecutiveReport;
  onSave: (updated: ExecutiveReport) => void;
}

export const DataAdjustmentModal: React.FC<DataAdjustmentModalProps> = ({
  isOpen,
  onClose,
  report,
  onSave
}) => {
  const [formData, setFormData] = useState<ExecutiveReport>(JSON.parse(JSON.stringify(report)));
  const [activeSubTab, setActiveSubTab] = useState<'meta' | 'lectura' | 'acciones' | 'seguimiento'>('lectura');

  if (!isOpen) return null;

  const handleMetadataChange = (field: keyof typeof formData.metadata, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value }
    }));
  };

  const handleLecturaChange = (category: 'fortalezas' | 'oportunidades', index: number, value: string) => {
    setFormData(prev => {
      const updatedList = [...prev.lecturaBreve[category]];
      updatedList[index] = value;
      return {
        ...prev,
        lecturaBreve: {
          ...prev.lecturaBreve,
          [category]: updatedList
        }
      };
    });
  };

  const handleActionChange = (index: number, field: keyof RecommendedAction, value: string) => {
    setFormData(prev => {
      const updatedActions = [...prev.acciones];
      updatedActions[index] = { ...updatedActions[index], [field]: value };
      return { ...prev, acciones: updatedActions };
    });
  };

  const handleSeguimientoChange = (field: keyof typeof formData.seguimiento, value: any) => {
    setFormData(prev => ({
      ...prev,
      seguimiento: { ...prev.seguimiento, [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col text-white shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Ajustar Cuartilla Oficial</h3>
              <p className="text-xs text-slate-400">Edición manual de textos ejecutivos y tabla de compromisos</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUBTABS */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('lectura')}
            className={`py-3 px-3 border-b-2 transition ${
              activeSubTab === 'lectura' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Lectura Breve (Hallazgos)
          </button>
          <button
            onClick={() => setActiveSubTab('acciones')}
            className={`py-3 px-3 border-b-2 transition ${
              activeSubTab === 'acciones' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Tabla de 6 Acciones (SLII)
          </button>
          <button
            onClick={() => setActiveSubTab('meta')}
            className={`py-3 px-3 border-b-2 transition ${
              activeSubTab === 'meta' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Metadatos y Evaluado
          </button>
          <button
            onClick={() => setActiveSubTab('seguimiento')}
            className={`py-3 px-3 border-b-2 transition ${
              activeSubTab === 'seguimiento' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Seguimiento a 5 Semanas
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* TAB 1: LECTURA BREVE */}
          {activeSubTab === 'lectura' && (
            <div className="space-y-4">
              <div className="bg-blue-950/30 border border-blue-900/60 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-cyan-300 mb-2">
                  Fortalezas Prioritarias (Puntos Palanca - P.P.)
                </h4>
                <p className="text-slate-400 text-[11px] mb-3">
                  Frases de alto impacto explicando cómo la competencia potencia el desempeño actual.
                </p>
                {formData.lecturaBreve.fortalezas.map((frase, idx) => (
                  <div key={`fort-${idx}`} className="mb-2.5">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Fortaleza #{idx + 1}:
                    </label>
                    <textarea
                      rows={2}
                      value={frase}
                      onChange={(e) => handleLecturaChange('fortalezas', idx, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-rose-950/30 border border-rose-900/60 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-rose-300 mb-2">
                  Áreas de Oportunidad Prioritarias (Puntos Impacto - P.I.)
                </h4>
                <p className="text-slate-400 text-[11px] mb-3">
                  Frases explicando el punto de indagación, riesgo operativo o delegación.
                </p>
                {formData.lecturaBreve.oportunidades.map((frase, idx) => (
                  <div key={`opor-${idx}`} className="mb-2.5">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Oportunidad #{idx + 1}:
                    </label>
                    <textarea
                      rows={2}
                      value={frase}
                      onChange={(e) => handleLecturaChange('oportunidades', idx, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ACCIONES TABLE */}
          {activeSubTab === 'acciones' && (
            <div className="space-y-3">
              <div className="text-[11px] text-slate-400">
                Cada acción debe incluir: un verbo observable, una situación de aplicación y una frecuencia o plazo concreto.
              </div>
              <div className="space-y-3">
                {formData.acciones.map((acc, idx) => (
                  <div key={acc.id || idx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-cyan-300 text-xs">
                        Acción #{idx + 1} ({acc.proposito})
                      </span>
                      <select
                        value={acc.estiloSLII || 'E2 - Guiar'}
                        onChange={(e) => handleActionChange(idx, 'estiloSLII', e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200"
                      >
                        <option value="E1 - Dirigir">E1 - Dirigir</option>
                        <option value="E2 - Guiar">E2 - Guiar</option>
                        <option value="E3 - Apoyar">E3 - Apoyar</option>
                        <option value="E4 - Delegar">E4 - Delegar</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Acción sugerida (Observable):
                        </label>
                        <textarea
                          rows={2}
                          value={acc.accionSugerida}
                          onChange={(e) => handleActionChange(idx, 'accionSugerida', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Evidencia de aplicación:
                        </label>
                        <textarea
                          rows={2}
                          value={acc.evidencia}
                          onChange={(e) => handleActionChange(idx, 'evidencia', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: METADATOS */}
          {activeSubTab === 'meta' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre Evaluado(a):</label>
                <input
                  type="text"
                  value={formData.metadata.nombre}
                  onChange={(e) => handleMetadataChange('nombre', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Puesto / Rol:</label>
                <input
                  type="text"
                  value={formData.metadata.puesto}
                  onChange={(e) => handleMetadataChange('puesto', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Fecha de Aplicación:</label>
                <input
                  type="text"
                  value={formData.metadata.fechaAplicacion}
                  onChange={(e) => handleMetadataChange('fechaAplicacion', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Fecha de Seguimiento (5 semanas):</label>
                <input
                  type="text"
                  value={formData.metadata.fechaSeguimiento}
                  onChange={(e) => handleMetadataChange('fechaSeguimiento', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>
            </div>
          )}

          {/* TAB 4: SEGUIMIENTO */}
          {activeSubTab === 'seguimiento' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Evidencia Principal que se Revisará:
                </label>
                <textarea
                  rows={2}
                  value={formData.seguimiento.evidenciaPrincipal}
                  onChange={(e) => handleSeguimientoChange('evidenciaPrincipal', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Fecha Próximo Encuentro:
                </label>
                <input
                  type="text"
                  value={formData.seguimiento.fechaProximoEncuentro}
                  onChange={(e) => handleSeguimientoChange('fechaProximoEncuentro', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Integración Enfoque SLII®:
                </label>
                <textarea
                  rows={2}
                  value={formData.seguimiento.enfoqueSLII}
                  onChange={(e) => handleSeguimientoChange('enfoqueSLII', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-900/30"
          >
            <Save className="w-4 h-4" />
            <span>Guardar y Actualizar Cuartilla</span>
          </button>
        </div>
      </div>
    </div>
  );
};
