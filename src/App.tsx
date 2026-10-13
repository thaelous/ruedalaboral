import React, { useState, useEffect, useRef } from 'react';
import { ExecutiveReport, CompetencyScore } from './types/leadership';
import { BatchParticipantItem } from './types/batch';
import { Header, ActiveTab } from './components/Header';
import { ParticipantSwitcher } from './components/ParticipantSwitcher';
import { ExecutiveLetterSheet } from './components/ExecutiveLetterSheet';
import { OriginalSheetViewer } from './components/OriginalSheetViewer';
import { RadarInteractiveView } from './components/RadarInteractiveView';
import { EmptyState } from './components/EmptyState';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AnalysisProgressModal } from './components/AnalysisProgressModal';
import { DataAdjustmentModal } from './components/DataAdjustmentModal';
import { BatchManagerModal } from './components/BatchManagerModal';
import { CompetencyBankModal, getStoredCompetencyBank } from './components/CompetencyBankModal';
import { analyzeWheelImage, getStoredApiKey } from './services/geminiService';
import { printSingleExecutiveReport, printBatchExecutiveReports } from './services/printService';
import { SAMPLE_CLAUDIA_REPORT } from './data/sampleClaudia';
import { AlertCircle, CheckCircle, Sparkles, X } from 'lucide-react';

const DEFAULT_TEMPLATE_KEY = 'COMUNICACION_GLOBAL_DEFAULT_TEMPLATE_V1';
const THEME_STORAGE_KEY = 'APP_THEME_MODE';

function getDefaultReport(): ExecutiveReport {
  try {
    const stored = localStorage.getItem(DEFAULT_TEMPLATE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.metadata) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading default template', e);
  }
  return SAMPLE_CLAUDIA_REPORT;
}

export default function App() {
  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  // Initialize with default template visible immediately on start
  const [batchItems, setBatchItems] = useState<BatchParticipantItem[]>(() => {
    const defaultRep = getDefaultReport();
    return [{
      id: 'default-participant-1',
      fileName: 'Cuartilla_Ejecutiva_Modelo.jpg',
      imageSrc: '',
      base64: '',
      mimeType: 'image/jpeg',
      status: 'completed',
      report: defaultRep,
      createdAt: Date.now()
    }];
  });

  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>('default-participant-1');
  const [activeTab, setActiveTab] = useState<ActiveTab>('split');
  
  // Modals & progress state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [isCompetencyBankOpen, setIsCompetencyBankOpen] = useState<boolean>(false);
  
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string | null>(null);

  // Active Competency Bank
  const [competencyBank, setCompetencyBank] = useState(() => getStoredCompetencyBank());

  // Concurrent lock to prevent duplicate executions
  const isAnalyzingRef = useRef<boolean>(false);

  // Batch execution state
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchCurrentIndex, setBatchCurrentIndex] = useState<number>(0);
  const [batchTotalCount, setBatchTotalCount] = useState<number>(0);
  const [currentStepMessage, setCurrentStepMessage] = useState<string>('Inspeccionando trazos...');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = () => {
    const key = getStoredApiKey();
    setHasApiKey(Boolean(key && key.trim().length > 0));
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const currentParticipant = batchItems.find(item => item.id === selectedParticipantId) || null;
  const hasReport = Boolean(currentParticipant && currentParticipant.report && currentParticipant.status === 'completed');

  const handleAddFiles = (filesInput: FileList | File[]) => {
    const files = Array.from(filesInput).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) {
      showToast('Por favor selecciona archivos de imagen válidos (JPG, PNG o WEBP).', 'error');
      return;
    }

    setToastMessage(null);

    const readers: Promise<BatchParticipantItem>[] = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const cleanBase64 = result.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

          const newItem: BatchParticipantItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            fileName: file.name,
            imageSrc: result,
            base64: cleanBase64,
            mimeType: file.type || 'image/jpeg',
            status: 'pending',
            report: {
              metadata: {
                nombre: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                puesto: 'Pendiente de análisis',
                fechaAplicacion: '—',
                fechaSeguimiento: '—',
                facilitador: 'Facilitación de Desarrollo Organizacional • Comunicación Global'
              },
              competencias: [],
              lecturaBreve: { fortalezas: [], oportunidades: [] },
              puntosClaveManuscritos: {
                puntoPalanca: { competencia: '—', anotaciones: [] },
                puntoImpacto: { competencia: '—', anotaciones: [] }
              },
              acciones: [],
              seguimiento: {
                evidenciaPrincipal: '—',
                fechaProximoEncuentro: '—',
                plazoSemanas: 5,
                enfoqueSLII: '—'
              }
            },
            createdAt: Date.now()
          };
          resolve(newItem);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(newItems => {
      setBatchItems(prev => [...prev, ...newItems]);
      if (!selectedParticipantId || batchItems.length === 0) {
        setSelectedParticipantId(newItems[0].id);
      }
      showToast(`Se agregaron ${newItems.length} rueda(s) al lote. Listas para procesar.`, 'success');
      
      if (newItems.length > 1) {
        setIsBatchModalOpen(true);
      }
    });
  };

  const handleRemoveItem = (id: string) => {
    const updated = batchItems.filter(item => item.id !== id);
    setBatchItems(updated);
    if (selectedParticipantId === id) {
      setSelectedParticipantId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleStartBatchProcessing = async () => {
    if (isAnalyzingRef.current) return;

    const currentKey = getStoredApiKey();
    if (!currentKey) {
      setIsApiKeyModalOpen(true);
      showToast('Ingresa tu API Key de Gemini para procesar el lote.', 'info');
      return;
    }

    const pendingItems = batchItems.filter(it => it.status === 'pending' || it.status === 'error');
    if (pendingItems.length === 0) {
      showToast('Todos los participantes del lote ya fueron procesados.', 'info');
      return;
    }

    isAnalyzingRef.current = true;
    setToastMessage(null);
    setIsBatchProcessing(true);
    setBatchTotalCount(pendingItems.length);

    let processedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < pendingItems.length; i++) {
      const targetItem = pendingItems[i];
      setBatchCurrentIndex(i);
      setCurrentStepMessage(`Iniciando análisis de "${targetItem.fileName}"...`);

      setBatchItems(prev => prev.map(item => 
        item.id === targetItem.id ? { ...item, status: 'analyzing', errorMessage: undefined } : item
      ));

      try {
        const generatedReport = await analyzeWheelImage(
          targetItem.base64,
          targetItem.mimeType,
          competencyBank,
          (step) => setCurrentStepMessage(`[${i + 1}/${pendingItems.length}] ${step}`)
        );

        setBatchItems(prev => prev.map(item => 
          item.id === targetItem.id ? { 
            ...item, 
            status: 'completed', 
            errorMessage: undefined,
            report: generatedReport 
          } : item
        ));
        processedCount++;

        if (!selectedParticipantId || selectedParticipantId === targetItem.id) {
          setSelectedParticipantId(targetItem.id);
        }

        if (i < pendingItems.length - 1) {
          await new Promise(r => setTimeout(r, 800));
        }
      } catch (err: any) {
        console.error(`Error processing item ${targetItem.fileName}:`, err);
        setBatchItems(prev => prev.map(item => 
          item.id === targetItem.id ? { 
            ...item, 
            status: 'error', 
            errorMessage: err?.message || 'Error en análisis multimodal' 
          } : item
        ));
        failedCount++;
      }
    }

    isAnalyzingRef.current = false;
    setIsBatchProcessing(false);

    if (failedCount === 0) {
      showToast(`¡Lote completado! ${processedCount} participantes procesados con éxito.`, 'success');
    } else {
      showToast(`Procesamiento finalizado: ${processedCount} exitosos, ${failedCount} con error.`, 'info');
    }
  };

  const handleAnalyzeCurrentOnly = async () => {
    if (!currentParticipant) return;
    if (isAnalyzingRef.current) return;

    const currentKey = getStoredApiKey();
    if (!currentKey) {
      setIsApiKeyModalOpen(true);
      showToast('Ingresa tu API Key de Gemini para realizar el análisis.', 'info');
      return;
    }

    if (!currentParticipant.base64) {
      showToast('Carga primero una imagen para este participante.', 'info');
      fileInputRef.current?.click();
      return;
    }

    isAnalyzingRef.current = true;
    setToastMessage(null);
    setIsBatchProcessing(true);
    setBatchTotalCount(1);
    setBatchCurrentIndex(0);
    setCurrentStepMessage('Inspeccionando trazos y geometría de la rueda...');

    setBatchItems(prev => prev.map(item => 
      item.id === currentParticipant.id ? { ...item, status: 'analyzing', errorMessage: undefined } : item
    ));

    try {
      const generatedReport = await analyzeWheelImage(
        currentParticipant.base64,
        currentParticipant.mimeType,
        competencyBank,
        (step) => setCurrentStepMessage(step)
      );

      setToastMessage(null);

      setBatchItems(prev => prev.map(item => 
        item.id === currentParticipant.id ? { 
          ...item, 
          status: 'completed', 
          errorMessage: undefined,
          report: generatedReport 
        } : item
      ));

      showToast(`¡Cuartilla de ${generatedReport.metadata.nombre} generada con éxito!`, 'success');
    } catch (err: any) {
      console.error('Error analyzing wheel:', err);
      setBatchItems(prev => prev.map(item => 
        item.id === currentParticipant.id ? { 
          ...item, 
          status: hasReport ? 'completed' : 'error', 
          errorMessage: err.message 
        } : item
      ));
    } finally {
      isAnalyzingRef.current = false;
      setIsBatchProcessing(false);
    }
  };

  const handleCopyReport = () => {
    if (!hasReport || !currentParticipant) {
      showToast('No hay reporte activo para copiar.', 'info');
      return;
    }

    const rep = currentParticipant.report;
    const formatText = `
================================================================================
COMUNICACIÓN GLOBAL • DESARROLLO ORGANIZACIONAL (SLII®)
REPORTE INDIVIDUAL DE RESULTADOS Y RECOMENDACIONES — CUARTILLA OFICIAL
================================================================================

DATOS DEL PARTICIPANTE:
• Evaluado(a): ${rep.metadata.nombre}
• Puesto / Rol: ${rep.metadata.puesto}
• Fecha de Aplicación: ${rep.metadata.fechaAplicacion}
• Fecha de Seguimiento (5 semanas): ${rep.metadata.fechaSeguimiento}

--------------------------------------------------------------------------------
GRÁFICA DE ARAÑA — RESULTADOS Y PROYECCIÓN (Escala 1 a 10)
--------------------------------------------------------------------------------
${rep.competencias.map(c => `• ${c.name.padEnd(35)} : Actual: ${c.actual.toFixed(1)} / 10 | Meta Acordada: ${c.meta.toFixed(1)} / 10${c.isPuntoPalanca ? ' [★ P.P.]' : ''}${c.isPuntoImpacto ? ' [▲ P.I.]' : ''}`).join('\n')}

* Nota: Resultados basados en autoevaluación y diálogo individual; no constituyen una evaluación de desempeño de terceros.

--------------------------------------------------------------------------------
LECTURA BREVE DE HALLAZGOS PRIORITARIOS (MÁXIMO 4 POSTULADOS)
--------------------------------------------------------------------------------
FORTALEZAS PRIORITARIAS (PUNTOS PALANCA - P.P.):
${rep.lecturaBreve.fortalezas.map((f, i) => `${i + 1}. ${f}`).join('\n')}

ÁREAS DE OPORTUNIDAD PRIORITARIAS (PUNTOS IMPACTO - P.I.):
${rep.lecturaBreve.oportunidades.map((o, i) => `${i + 1}. ${o}`).join('\n')}

--------------------------------------------------------------------------------
TABLA DE ACCIONES RECOMENDADAS (COMPROMISOS OBSERVABLES)
--------------------------------------------------------------------------------
${rep.acciones.map((a, i) => `[${i + 1}] ${a.proposito.toUpperCase()} (${a.estiloSLII || 'SLII'})
    Acción: ${a.accionSugerida}
    Evidencia: ${a.evidencia}
`).join('\n')}

--------------------------------------------------------------------------------
SEGUIMIENTO Y METODOLOGÍA
--------------------------------------------------------------------------------
• Evidencia a revisar: ${rep.seguimiento.evidenciaPrincipal}
• Próximo encuentro: ${rep.seguimiento.fechaProximoEncuentro} (${rep.seguimiento.plazoSemanas} semanas)
• Integración SLII®: ${rep.seguimiento.enfoqueSLII}
================================================================================
`.trim();

    navigator.clipboard.writeText(formatText).then(() => {
      setCopiedSuccess(true);
      showToast('Reporte ejecutivo copiado al portapapeles.', 'success');
      setTimeout(() => setCopiedSuccess(false), 2500);
    });
  };

  const handlePrintSingle = () => {
    if (!currentParticipant) return;
    const participantName = currentParticipant.report.metadata.nombre || 'Participante';
    printSingleExecutiveReport('cuartilla-reporte', participantName);
  };

  const handlePrintEntireBatch = () => {
    const completedItems = batchItems.filter((i) => i.status === 'completed');
    if (completedItems.length === 0) {
      showToast('No hay cuartillas completadas para imprimir en paquete.', 'error');
      return;
    }

    const sheetElements = completedItems
      .map((item) => document.getElementById(`cuartilla-sheet-${item.id}`))
      .filter((el): el is HTMLElement => el !== null);

    if (sheetElements.length === 0) {
      const fallbackElements = Array.from(
        document.querySelectorAll<HTMLElement>('#cuartilla-paquete-completo .cuartilla-container')
      );
      if (fallbackElements.length > 0) {
        printBatchExecutiveReports(
          fallbackElements,
          `Paquete de Reportes de Liderazgo (${completedItems.length} Participantes) — Comunicación Global`
        );
        return;
      }
      showToast('No se encontraron las cuartillas del paquete para imprimir.', 'error');
      return;
    }

    printBatchExecutiveReports(
      sheetElements,
      `Paquete de Reportes de Liderazgo (${completedItems.length} Participantes) — Comunicación Global`
    );
  };

  const handleUpdateCompetencies = (updated: CompetencyScore[]) => {
    if (!selectedParticipantId) return;
    setBatchItems(prev => prev.map(item => {
      if (item.id === selectedParticipantId) {
        return {
          ...item,
          report: {
            ...item.report,
            competencias: updated
          }
        };
      }
      return item;
    }));
  };

  const handleSaveAdjustedReport = (updatedReport: ExecutiveReport) => {
    if (!selectedParticipantId) return;
    setBatchItems(prev => prev.map(item => {
      if (item.id === selectedParticipantId) {
        return {
          ...item,
          report: updatedReport
        };
      }
      return item;
    }));
    showToast('Cuartilla actualizada correctamente.', 'success');
  };

  const handleSaveAsDefault = (report: ExecutiveReport) => {
    localStorage.setItem(DEFAULT_TEMPLATE_KEY, JSON.stringify(report));
    showToast('¡Estructura guardada como Cuartilla por Default exitosamente!', 'success');
  };

  const handleRestoreDefault = () => {
    localStorage.removeItem(DEFAULT_TEMPLATE_KEY);
    const defaultRep = SAMPLE_CLAUDIA_REPORT;
    if (selectedParticipantId) {
      setBatchItems(prev => prev.map(item => 
        item.id === selectedParticipantId ? { ...item, report: defaultRep } : item
      ));
    }
    showToast('Plantilla restaurada a valores de fábrica.', 'success');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} flex flex-col font-sans selection:bg-[#8CC63F] selection:text-slate-950 transition-colors`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleAddFiles(e.target.files);
          }
        }}
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {/* TOP HEADER */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onUploadClick={() => fileInputRef.current?.click()}
        onOpenAdjustModal={() => {
          if (hasReport) setIsAdjustModalOpen(true);
          else showToast('Primero sube y procesa una rueda.', 'info');
        }}
        onOpenCompetencyBankModal={() => setIsCompetencyBankOpen(true)}
        onCopyReport={handleCopyReport}
        onPrintReport={handlePrintSingle}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        hasApiKey={hasApiKey}
        copiedSuccess={copiedSuccess}
        hasReport={hasReport}
      />

      {/* BATCH PARTICIPANT SWITCHER TABS & SHORTCUTS */}
      {batchItems.length > 1 && (
        <ParticipantSwitcher
          items={batchItems}
          selectedId={selectedParticipantId || ''}
          onSelectParticipant={(id) => setSelectedParticipantId(id)}
          onOpenBatchModal={() => setIsBatchModalOpen(true)}
          onPrintEntireBatch={handlePrintEntireBatch}
          isProcessing={isBatchProcessing}
          onAddFilesClick={() => fileInputRef.current?.click()}
        />
      )}

      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce print:hidden">
          <div
            className={`px-4 py-3 rounded-lg shadow-xl border flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-600 text-rose-200'
                : 'bg-blue-950/90 border-blue-600 text-blue-200'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col">
        {currentParticipant ? (
          <>
            {/* VIEW 1: SPLIT VIEW (HOJA + CUARTILLA) */}
            {activeTab === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
                {/* LEFT: ORIGINAL SHEET VIEWER */}
                <div className="visor-izquierdo lg:col-span-5 h-[760px] sticky top-28 print:hidden">
                  <OriginalSheetViewer
                    imageSrc={currentParticipant.imageSrc || null}
                    onImageSelected={handleAddFiles}
                    report={currentParticipant.report}
                    onAnalyzeTriggered={handleAnalyzeCurrentOnly}
                    isAnalyzing={isBatchProcessing && currentParticipant.status === 'analyzing'}
                  />
                </div>

                {/* RIGHT: OFFICIAL EXECUTIVE LETTER SHEET (ALWAYS PURE WHITE DOCUMENT) */}
                <div id="cuartilla-single-wrapper" className="lg:col-span-7 flex justify-center overflow-y-auto">
                  <ExecutiveLetterSheet
                    id="cuartilla-reporte"
                    report={currentParticipant.report}
                    onEditRequested={() => setIsAdjustModalOpen(true)}
                    selectedCompetencyId={selectedCompetencyId}
                    onSelectCompetency={(id) => setSelectedCompetencyId(id)}
                    onReportChange={handleSaveAdjustedReport}
                    onSaveAsDefault={handleSaveAsDefault}
                    onRestoreDefault={handleRestoreDefault}
                  />
                </div>
              </div>
            )}

            {/* VIEW 2: DEDICATED CUARTILLA OFICIAL (HOJA CARTA) */}
            {activeTab === 'cuartilla' && (
              <div id="cuartilla-single-wrapper" className="flex flex-col items-center justify-center py-2">
                <div className={`w-full max-w-[850px] mb-3 flex items-center justify-between text-xs px-2 print:hidden ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8CC63F]"></span>
                    <span>
                      Cuartilla de: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{currentParticipant.report.metadata.nombre}</strong> (Hoja Carta 8.5" × 11")
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePrintSingle}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                    >
                      Imprimir / Guardar PDF de esta cuartilla
                    </button>
                    {batchItems.filter(i => i.status === 'completed').length > 1 && (
                      <button
                        onClick={handlePrintEntireBatch}
                        className="text-[#8CC63F] hover:underline font-semibold"
                      >
                        Imprimir todo el paquete ({batchItems.filter(i => i.status === 'completed').length})
                      </button>
                    )}
                  </div>
                </div>
                <ExecutiveLetterSheet
                  id="cuartilla-reporte"
                  report={currentParticipant.report}
                  onEditRequested={() => setIsAdjustModalOpen(true)}
                  selectedCompetencyId={selectedCompetencyId}
                  onSelectCompetency={(id) => setSelectedCompetencyId(id)}
                  onReportChange={handleSaveAdjustedReport}
                  onSaveAsDefault={handleSaveAsDefault}
                  onRestoreDefault={handleRestoreDefault}
                />
              </div>
            )}

            {/* VIEW 3: RADAR INTERACTIVO Y DICCIONARIO */}
            {activeTab === 'radar' && (
              <div className="flex-1 print:hidden">
                <RadarInteractiveView
                  report={currentParticipant.report}
                  onUpdateCompetencies={handleUpdateCompetencies}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            onUploadClick={() => fileInputRef.current?.click()}
            onDropFiles={handleAddFiles}
          />
        )}

        {/* HIDDEN IN SCREEN: ENTIRE BATCH CONTAINER USED BY NATIVE PRINT */}
        <div id="cuartilla-paquete-completo" className="hidden">
          {batchItems
            .filter(item => item.status === 'completed')
            .map((item) => (
              <div key={`batch-print-${item.id}`} className="cuartilla-paquete-item">
                <ExecutiveLetterSheet
                  report={item.report}
                  id={`cuartilla-sheet-${item.id}`}
                  isBatchMode={true}
                />
              </div>
            ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className={`${isDark ? 'bg-slate-950 border-slate-900 text-slate-500' : 'bg-white border-slate-200 text-slate-600'} border-t py-3 px-6 text-center text-xs print:hidden transition-colors`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Comunicación Global • Rueda de Liderazgo — Cuartilla Ejecutiva Oficial • Modelo SLII® & CCL
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>100% Client-Side</span>
            <span>·</span>
            <button
              onClick={() => setIsCompetencyBankOpen(true)}
              className="text-[#8CC63F] hover:underline font-medium"
            >
              Banco de Competencias ({competencyBank.length})
            </button>
            <span>·</span>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              {hasApiKey ? 'API Key Configurada' : 'Configurar API Key'}
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={checkApiKeyStatus}
      />

      <CompetencyBankModal
        isOpen={isCompetencyBankOpen}
        onClose={() => setIsCompetencyBankOpen(false)}
        onBankUpdated={(newBank) => setCompetencyBank(newBank)}
        theme={theme}
      />

      <AnalysisProgressModal
        isOpen={isBatchProcessing && batchTotalCount === 1}
        currentStepMessage={currentStepMessage}
      />

      <BatchManagerModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        items={batchItems}
        selectedId={selectedParticipantId || ''}
        onSelectParticipant={(id) => {
          setSelectedParticipantId(id);
          setIsBatchModalOpen(false);
        }}
        onAddFiles={handleAddFiles}
        onRemoveItem={handleRemoveItem}
        onStartBatchProcessing={handleStartBatchProcessing}
        isProcessing={isBatchProcessing}
        currentIndex={batchCurrentIndex}
        totalCount={batchTotalCount}
        currentStepMessage={currentStepMessage}
      />

      {currentParticipant && (
        <DataAdjustmentModal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          report={currentParticipant.report}
          onSave={handleSaveAdjustedReport}
        />
      )}
    </div>
  );
}
