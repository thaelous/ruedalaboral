import React, { useState, useEffect } from 'react';
import { CompetencyDefinition, OFFICIAL_COMPETENCIES } from '../types/leadership';
import { X, Plus, Trash2, Edit2, Upload, Download, RotateCcw, Check, BookOpen, Layers } from 'lucide-react';
import * as XLSX from 'xlsx';

const COMPETENCY_STORAGE_KEY = 'COMUNICACION_GLOBAL_COMPETENCY_BANK_V1';

export function getStoredCompetencyBank(): CompetencyDefinition[] {
  try {
    const stored = localStorage.getItem(COMPETENCY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading competency bank from localStorage', e);
  }
  return OFFICIAL_COMPETENCIES;
}

export function saveCompetencyBank(bank: CompetencyDefinition[]): void {
  localStorage.setItem(COMPETENCY_STORAGE_KEY, JSON.stringify(bank));
}

interface CompetencyBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBankUpdated: (bank: CompetencyDefinition[]) => void;
  theme?: 'dark' | 'light';
}

export const CompetencyBankModal: React.FC<CompetencyBankModalProps> = ({
  isOpen,
  onClose,
  onBankUpdated,
  theme = 'dark'
}) => {
  const [bank, setBank] = useState<CompetencyDefinition[]>(getStoredCompetencyBank());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const isDark = theme === 'dark';

  // Form state for adding/editing
  const [formData, setFormData] = useState<Partial<CompetencyDefinition>>({
    name: '',
    category: 'Estratégica',
    definition: '',
    observableBehaviors: ['', '', ''],
    evidenceExamples: ''
  });

  useEffect(() => {
    if (isOpen) {
      setBank(getStoredCompetencyBank());
    }
  }, [isOpen]);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveCompetency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.definition) {
      showNotification('El nombre y la definición son obligatorios.');
      return;
    }

    const behaviors = (formData.observableBehaviors || []).filter(b => b.trim().length > 0);

    let updated: CompetencyDefinition[];
    if (editingId) {
      updated = bank.map(item => 
        item.id === editingId
          ? {
              ...item,
              name: formData.name!,
              category: (formData.category as any) || 'Estratégica',
              definition: formData.definition!,
              observableBehaviors: behaviors.length > 0 ? behaviors : ['Conducta observable base'],
              evidenceExamples: formData.evidenceExamples || ''
            }
          : item
      );
      showNotification('Competencia actualizada exitosamente.');
    } else {
      const newId = `comp_${Date.now()}`;
      const newItem: CompetencyDefinition = {
        id: newId,
        name: formData.name!,
        category: (formData.category as any) || 'Estratégica',
        definition: formData.definition!,
        observableBehaviors: behaviors.length > 0 ? behaviors : ['Conducta observable base'],
        evidenceExamples: formData.evidenceExamples || ''
      };
      updated = [...bank, newItem];
      showNotification('Nueva competencia agregada al banco.');
    }

    setBank(updated);
    saveCompetencyBank(updated);
    onBankUpdated(updated);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'Estratégica',
      definition: '',
      observableBehaviors: ['', '', ''],
      evidenceExamples: ''
    });
  };

  const handleEditClick = (item: CompetencyDefinition) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      definition: item.definition,
      observableBehaviors: [...item.observableBehaviors, '', '', ''].slice(0, 3),
      evidenceExamples: item.evidenceExamples
    });
  };

  const handleDeleteClick = (id: string) => {
    if (bank.length <= 3) {
      showNotification('Se requiere mantener al menos 3 competencias en el banco.');
      return;
    }
    if (window.confirm('¿Estás seguro de eliminar esta competencia del banco?')) {
      const updated = bank.filter(b => b.id !== id);
      setBank(updated);
      saveCompetencyBank(updated);
      onBankUpdated(updated);
      showNotification('Competencia eliminada.');
    }
  };

  const handleResetToFactory = () => {
    if (window.confirm('¿Restaurar el Banco de Competencias a los valores estándar de Comunicación Global?')) {
      setBank(OFFICIAL_COMPETENCIES);
      saveCompetencyBank(OFFICIAL_COMPETENCIES);
      onBankUpdated(OFFICIAL_COMPETENCIES);
      showNotification('Banco restaurado a valores de fábrica.');
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        id: 'ejemplo_liderazgo',
        name: 'Nombre de la Competencia',
        category: 'Estratégica (o Interpersonal / Gestión y Liderazgo)',
        definition: 'Definición metodológica clara de la competencia según modelo de liderazgo.',
        observableBehaviors: 'Conducta 1 | Conducta 2 | Conducta 3 (separadas por pleca)',
        evidenceExamples: 'Ejemplo de evidencia verificable o tangible.'
      },
      {
        id: 'vision_sistemica',
        name: 'Visión sistémica',
        category: 'Estratégica',
        definition: 'Analiza cómo se relacionan las personas, las áreas y los procesos en la organización.',
        observableBehaviors: 'Identifica impacto cruzado | Propone acciones colaborativas | Monitorea dependencias',
        evidenceExamples: 'Matriz de entregables inter-área sincronizada.'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Banco Competencias');
    XLSX.writeFile(workbook, 'Plantilla_Banco_Competencias_Comunicacion_Global.xlsx');
    showNotification('Plantilla Excel descargada exitosamente.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (rows.length === 0) {
          showNotification('El archivo Excel está vacío o no tiene formato válido.');
          return;
        }

        const imported: CompetencyDefinition[] = rows.map((row, idx) => {
          let behaviors: string[] = [];
          const rawBehaviors = row.observableBehaviors || row.conductas || row.Comportamientos || '';
          if (typeof rawBehaviors === 'string') {
            behaviors = rawBehaviors.split('|').map(s => s.trim()).filter(Boolean);
          }
          if (behaviors.length === 0) {
            behaviors = ['Conducta observable importada'];
          }

          return {
            id: String(row.id || `imp_${Date.now()}_${idx}`),
            name: String(row.name || row.Competencia || `Competencia ${idx + 1}`),
            category: (['Estratégica', 'Interpersonal', 'Gestión y Liderazgo'].includes(row.category)
              ? row.category
              : 'Estratégica') as any,
            definition: String(row.definition || row.Definicion || 'Definición institucional importada.'),
            observableBehaviors: behaviors,
            evidenceExamples: String(row.evidenceExamples || row.Evidencia || 'Evidencia verificable.')
          };
        });

        if (imported.length > 0) {
          setBank(imported);
          saveCompetencyBank(imported);
          onBankUpdated(imported);
          showNotification(`¡Se importaron ${imported.length} competencias correctamente!`);
        }
      } catch (err) {
        console.error('Error parsing excel:', err);
        showNotification('Error al procesar el archivo Excel. Revisa el formato.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className={`${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'} border rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
        
        {/* MODAL HEADER */}
        <div className={`${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'} px-6 py-4 border-b flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Banco de Competencias — Comunicación Global
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Catálogo institucional con soporte para importación masiva vía Excel (.xlsx / .csv)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'} p-1.5 rounded-lg transition`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOOLBAR ACTIONS */}
        <div className={`${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'} px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3`}>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadTemplate}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-cyan-500" />
              <span>Descargar Plantilla Excel</span>
            </button>

            <label className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Excel / CSV</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToFactory}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span>Restaurar Fábrica</span>
            </button>
            <span className={`text-xs px-2.5 py-1 rounded-md font-mono ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
              Total: {bank.length} competencias
            </span>
          </div>
        </div>

        {/* TOAST MESSAGE */}
        {toast && (
          <div className="bg-emerald-950 border-b border-emerald-800 px-6 py-2 text-xs text-emerald-300 font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* MAIN BODY: SPLIT VIEW (FORM + LIST) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* LEFT: ADD / EDIT FORM */}
          <div className={`lg:col-span-5 p-6 border-r ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'} overflow-y-auto`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <Plus className="w-3.5 h-3.5 text-emerald-500" />
              {editingId ? 'Editar Competencia' : 'Agregar Nueva Competencia'}
            </h3>

            <form onSubmit={handleSaveCompetency} className="space-y-3 text-xs">
              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Nombre de la Competencia *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Pensamiento Analítico"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Categoría</label>
                <select
                  value={formData.category || 'Estratégica'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Estratégica">Estratégica</option>
                  <option value="Interpersonal">Interpersonal</option>
                  <option value="Gestión y Liderazgo">Gestión y Liderazgo</option>
                </select>
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Definición Metodológica *</label>
                <textarea
                  rows={3}
                  value={formData.definition || ''}
                  onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                  placeholder="Descripción detallada de la competencia..."
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 resize-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Conductas Observables (Criterios SLII®)</label>
                {(formData.observableBehaviors || ['', '', '']).map((behavior, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={behavior}
                    onChange={(e) => {
                      const list = [...(formData.observableBehaviors || ['', '', ''])];
                      list[idx] = e.target.value;
                      setFormData({ ...formData, observableBehaviors: list });
                    }}
                    placeholder={`Conducta ${idx + 1}`}
                    className={`w-full border rounded-lg px-3 py-1.5 mb-1.5 focus:outline-none focus:border-emerald-500 text-xs ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                ))}
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ejemplo de Evidencia</label>
                <input
                  type="text"
                  value={formData.evidenceExamples || ''}
                  onChange={(e) => setFormData({ ...formData, evidenceExamples: e.target.value })}
                  placeholder="Ej. Minuta registrada con acuerdos..."
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg transition shadow-sm"
                >
                  {editingId ? 'Actualizar Competencia' : 'Guardar en el Banco'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-3 py-2 rounded-lg transition ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT: COMPETENCY LIST */}
          <div className={`lg:col-span-7 p-6 overflow-y-auto space-y-3 ${isDark ? 'bg-slate-950/30' : 'bg-white'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span>Competencias Activas en el Banco</span>
              <span className="text-[10px] text-emerald-500 font-normal">Inyectadas automáticamente a Gemini</span>
            </h3>

            <div className="space-y-2">
              {bank.map((item) => (
                <div
                  key={item.id}
                  className={`border p-3.5 rounded-xl transition space-y-2 group ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          item.category === 'Estratégica'
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : item.category === 'Interpersonal'
                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.definition}</p>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleEditClick(item)}
                        className={`p-1.5 rounded-lg transition ${isDark ? 'hover:bg-slate-800 text-cyan-400' : 'hover:bg-slate-200 text-cyan-600'}`}
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        className={`p-1.5 rounded-lg transition ${isDark ? 'hover:bg-slate-800 text-rose-400' : 'hover:bg-slate-200 text-rose-600'}`}
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.observableBehaviors && item.observableBehaviors.length > 0 && (
                    <div className={`p-2 rounded-lg border text-[11px] space-y-1 ${
                      isDark
                        ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Conductas SLII®:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {item.observableBehaviors.map((b, bi) => (
                          <li key={bi}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
