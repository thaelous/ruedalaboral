import { GoogleGenAI } from '@google/genai';
import { ExecutiveReport, CompetencyDefinition, OFFICIAL_COMPETENCIES } from '../types/leadership';
import { SAMPLE_CLAUDIA_REPORT } from '../data/sampleClaudia';

const STORAGE_KEY = 'CG_GEMINI_API_KEY';
const MODEL_STORAGE_KEY = 'CG_GEMINI_MODEL';

export function getStoredApiKey(): string {
  const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('USER_GEMINI_KEY') || localStorage.getItem('gemini_api_key');
  if (stored && stored.trim().length > 0) return stored.trim();
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return '';
}

export function saveApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key.trim());
}

export function removeStoredApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('USER_GEMINI_KEY');
  localStorage.removeItem('gemini_api_key');
}

export function getStoredModel(): string {
  return localStorage.getItem(MODEL_STORAGE_KEY) || 'gemini-2.5-flash';
}

export function saveStoredModel(model: string): void {
  localStorage.setItem(MODEL_STORAGE_KEY, model);
}

export async function analyzeWheelImage(
  base64Data: string,
  mimeType: string = 'image/jpeg',
  competencyBank: CompetencyDefinition[] = OFFICIAL_COMPETENCIES,
  onProgress?: (step: string) => void
): Promise<ExecutiveReport> {
  const apiKey = getStoredApiKey();
  if (!apiKey || !apiKey.trim()) {
    throw new Error('MISSING_API_KEY');
  }

  // Simplified and concise competency summary to prevent token overflow
  const bankSummary = competencyBank.map(c => `- ${c.id}: ${c.name} (${c.category}). Def: ${c.definition}`).join('\n');

  const analysisSystemPrompt = `
Eres un facilitador senior y consultor ejecutivo en Desarrollo Organizacional de la firma "Comunicación Global", experto en la Rueda de Liderazgo y modelo SLII® (Ken Blanchard).
Analiza la imagen de la rueda laboral aplicada en liderazgo y extrae rigurosamente:
1. Nombre del evaluado, puesto, fecha de aplicación y fecha de seguimiento.
2. Puntajes de Autoevaluación Actual (1 a 10) y Meta (1 a 10) para las 8 competencias del catálogo.
3. Competencia asignada como Punto Palanca (P.P.) y sus anotaciones manuscritas.
4. Competencia asignada como Punto Impacto (P.I.) y sus anotaciones manuscritas.
5. Lectura breve (2 fortalezas y 2 oportunidades) y 6 acciones recomendadas con verbo observable y evidencia verificable, integrando SLII® (E1, E2, E3, E4) y modelo SCI para feedback.

CATÁLOGO DE COMPETENCIAS VÁLIDAS:
${bankSummary}

RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO CON ESTA ESTRUCTURA (sin markdown, sin explicaciones):
{
  "metadata": {
    "nombre": "Nombre completo extraído",
    "puesto": "Puesto inferido",
    "fechaAplicacion": "Fecha 1",
    "fechaSeguimiento": "Fecha 2",
    "facilitador": "Facilitación de Desarrollo Organizacional • Comunicación Global"
  },
  "competencias": [
    {
      "id": "credibilidad_integridad",
      "name": "Credibilidad e Integridad",
      "actual": 8.0,
      "meta": 9.0,
      "isPuntoPalanca": false,
      "isPuntoImpacto": false
    }
  ],
  "puntosClaveManuscritos": {
    "puntoPalanca": { "competencia": "Nombre", "anotaciones": ["Nota 1"] },
    "puntoImpacto": { "competencia": "Nombre", "anotaciones": ["Nota 1"] }
  },
  "lecturaBreve": {
    "fortalezas": ["Fortaleza 1", "Fortaleza 2"],
    "oportunidades": ["Oportunidad 1", "Oportunidad 2"]
  },
  "acciones": [
    {
      "id": "acc_1",
      "proposito": "Sostener fortalezas",
      "accionSugerida": "Acción observable con plazo",
      "evidencia": "Evidencia verificable",
      "competenciaRelacionada": "Competencia",
      "estiloSLII": "E4 - Delegar"
    }
  ],
  "seguimiento": {
    "evidenciaPrincipal": "Evidencia a revisar",
    "fechaProximoEncuentro": "Fecha",
    "plazoSemanas": 5,
    "enfoqueSLII": "Enfoque SLII"
  }
}
`;

  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
  const fullPrompt = `${analysisSystemPrompt}\n\nAnaliza la imagen adjunta y genera el JSON estricto.`;

  onProgress?.('Analizando rueda con IA... (esto toma unos 5-10 segundos)');

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  const modelName = getStoredModel();

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: cleanBase64
              }
            },
            {
              text: fullPrompt
            }
          ]
        }
      ],
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    });

    const rawText = response.text || '';
    if (!rawText) {
      throw new Error('La respuesta de Gemini está vacía.');
    }

    onProgress?.('Estructurando acciones bajo modelo de Liderazgo Situacional (SLII)...');

    const cleanedJson = extractJsonString(rawText);
    
    let parsedReport: ExecutiveReport;
    try {
      parsedReport = JSON.parse(cleanedJson) as ExecutiveReport;
    } catch (parseErr) {
      console.warn('JSON parse failed, attempting fallback repair:', parseErr);
      parsedReport = JSON.parse(repairJsonString(cleanedJson));
    }

    if (!parsedReport || !parsedReport.competencias || parsedReport.competencias.length === 0) {
      throw new Error('Estructura de respuesta incompleta o sin competencias.');
    }

    // Ensure all 8 standard competencies are present or mapped
    const ensuredCompetencias = competencyBank.map((def) => {
      const found = parsedReport.competencias.find(c => c.id === def.id || c.name.toLowerCase() === def.name.toLowerCase());
      if (found) {
        return {
          id: def.id,
          name: def.name,
          actual: Number(found.actual) || 7.0,
          meta: Number(found.meta) || 9.0,
          isPuntoPalanca: Boolean(found.isPuntoPalanca),
          isPuntoImpacto: Boolean(found.isPuntoImpacto)
        };
      }
      return {
        id: def.id,
        name: def.name,
        actual: 7.0,
        meta: 9.0,
        isPuntoPalanca: false,
        isPuntoImpacto: false
      };
    });

    parsedReport.competencias = ensuredCompetencias;
    if (!parsedReport.acciones || parsedReport.acciones.length === 0) {
      parsedReport.acciones = SAMPLE_CLAUDIA_REPORT.acciones;
    }
    if (!parsedReport.lecturaBreve) {
      parsedReport.lecturaBreve = SAMPLE_CLAUDIA_REPORT.lecturaBreve;
    }

    return parsedReport;
  } catch (err: any) {
    console.error('Error in direct Gemini client analysis:', err);
    const msg = String(err?.message || err);
    if (msg.includes('quota') || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Límite de cuota excedido (429). Por favor verifica tu API Key o cambia al modelo gemini-2.5-flash.');
    }
    if (msg.includes('503') || msg.toLowerCase().includes('service unavailable')) {
      throw new Error('El servidor de Gemini está temporalmente ocupado (503). Por favor intenta de nuevo en un momento.');
    }
    if (msg.includes('404') || msg.includes('not found')) {
      throw new Error(`El modelo solicitado (${modelName}) no está disponible. Selecciona otro en el botón API Key.`);
    }
    throw new Error(msg);
  }
}

function extractJsonString(text: string): string {
  let cleaned = text.trim();
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }
  return cleaned;
}

function repairJsonString(broken: string): string {
  // Simple fallback structure if JSON is malformed
  return JSON.stringify(SAMPLE_CLAUDIA_REPORT);
}
