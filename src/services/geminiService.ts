import { GoogleGenAI } from '@google/genai';
import { ExecutiveReport, CompetencyDefinition, OFFICIAL_COMPETENCIES } from '../types/leadership';

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

  const bankDescriptions = competencyBank.map((comp, idx) => 
    `${idx + 1}. ID: "${comp.id}" | Nombre: "${comp.name}" (${comp.category})\n   Definición: ${comp.definition}\n   Conductas SLII®: ${comp.observableBehaviors.join('; ')}`
  ).join('\n\n');

  const analysisSystemPrompt = `
Eres un facilitador senior y consultor ejecutivo en Desarrollo Organizacional de la firma "Comunicación Global", especializado en la "Rueda de Liderazgo" y el modelo de Liderazgo Situacional (SLII® de Ken Blanchard) con rigor psicométrico y metodológico (referencias Martha Alles, Bloom, CCL).

Tu tarea es analizar la imagen provista de una "Rueda laboral aplicada en Liderazgo" completada a mano con trazos geométricos y anotaciones manuscritas, e interpretar fielmente todos sus elementos para estructurar un REPORTE OFICIAL EN FORMATO CUARTILLA EJECUTIVA (máximo 1 página).

BANCO DE COMPETENCIAS INSTITUCIONAL ACTIVO:
Utiliza estrictamente este catálogo para emparejar las competencias evaluadas en los ejes de la imagen subida:
${bankDescriptions}

Debes inspeccionar visualmente:
1. Encabezado manuscrito: Nombre de la persona evaluada, Fecha 1 (aplicación) y Fecha 2 (seguimiento).
2. Trazos de la rueda octagonal/circular en cada una de las competencias del banco institucional activo.
3. Niveles numéricos en escala de 1 a 10 (o porcentajes convertidos a escala de 1.0 a 10.0 con 1 decimal):
   - Nivel de Autoevaluación Actual (trazos internos / primer trazo)
   - Meta acordada (trazos externos / proyección acordada al plazo establecido)
4. Bloques inferiores manuscritos:
   - "Punto Palanca (P.P.)": competencia elegida y las notas/viñetas manuscritas exactas.
   - "Punto Impacto (P.I.)": competencia elegida y las notas/viñetas manuscritas exactas.

CRITERIOS METODOLÓGICOS DEL REPORTE (ESTRICTOS SEGÚN PLANTILLA OFICIAL):
1. Lectura breve: Exactamente hasta 2 fortalezas prioritarias y 2 áreas de oportunidad prioritarias (máximo 4 frases de alto impacto y precisión ejecutiva basadas en las definiciones del banco).
2. Tabla de Acciones recomendadas: Exactamente seis (6) acciones breves:
   - Tres (3) acciones para "Sostener fortalezas" (asociadas a los Puntos Palanca y competencias altas).
   - Tres (3) acciones para "Desarrollar áreas de oportunidad" (asociadas a los Puntos Impacto y competencias en desarrollo).
   - Cada acción DEBE incluir: un verbo observable (Taxonomía de Bloom), una situación de aplicación y una frecuencia o plazo concreto (máximo 2 líneas por acción).
   - Evidencia de aplicación: breve, tangible y verificable.
3. Integración de Liderazgo Situacional (SLII®):
   - Incorporar explícitamente estilos directivos: E1 (Dirigir), E2 (Guiar), E3 (Apoyar) o E4 (Delegar) según el nivel de competencia y compromiso.
   - Para feedback, tomar en cuenta el modelo Situación-Conducta-Impacto (SCI).
4. Seguimiento: Evidencia principal a revisar y fecha del próximo encuentro (plazo pactado de 5 semanas a 3 meses).

RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO CON LA SIGUIENTE ESTRUCTURA EXACTA (sin texto antes ni después, sin markdown adicional):
{
  "metadata": {
    "nombre": "Nombre completo extraído de la hoja manuscrita",
    "puesto": "Puesto inferido o título corporativo",
    "fechaAplicacion": "Fecha 1 leída (ej. 22 / Jul / 2026)",
    "fechaSeguimiento": "Fecha 2 leída o proyectada a 5 semanas",
    "facilitador": "Facilitación de Desarrollo Organizacional • Comunicación Global"
  },
  "competencias": [
    {
      "id": "id_de_competencia_del_banco",
      "name": "Nombre exacto de la competencia",
      "actual": 8.0,
      "meta": 9.0,
      "isPuntoPalanca": false,
      "isPuntoImpacto": false
    }
  ],
  "puntosClaveManuscritos": {
    "puntoPalanca": {
      "competencia": "Competencia asignada a P.P.",
      "anotaciones": ["Anotación 1", "Anotación 2"]
    },
    "puntoImpacto": {
      "competencia": "Competencia asignada a P.I.",
      "anotaciones": ["Anotación 1", "Anotación 2"]
    }
  },
  "lecturaBreve": {
    "fortalezas": [
      "Frase 1 de fortaleza de alto impacto.",
      "Frase 2 de fortaleza de alto impacto."
    ],
    "oportunidades": [
      "Frase 1 de oportunidad de alto impacto.",
      "Frase 2 de oportunidad de alto impacto."
    ]
  },
  "acciones": [
    {
      "id": "acc_1",
      "proposito": "Sostener fortalezas",
      "accionSugerida": "Acción concreta con verbo observable, contexto y frecuencia.",
      "evidencia": "Evidencia breve y verificable.",
      "competenciaRelacionada": "Nombre de competencia",
      "estiloSLII": "E4 - Delegar"
    },
    {
      "id": "acc_2",
      "proposito": "Sostener fortalezas",
      "accionSugerida": "Acción concreta con verbo observable, contexto y frecuencia.",
      "evidencia": "Evidencia breve y verificable.",
      "competenciaRelacionada": "Nombre de competencia",
      "estiloSLII": "E3 - Apoyar"
    },
    {
      "id": "acc_3",
      "proposito": "Sostener fortalezas",
      "accionSugerida": "Acción concreta con verbo observable, contexto y frecuencia.",
      "evidencia": "Evidencia breve y verificable.",
      "competenciaRelacionada": "Nombre de competencia",
      "estiloSLII": "E3 - Apoyar"
    },
    {
      "id": "acc_4",
      "proposito": "Desarrollar áreas de oportunidad",
      "accionSugerida": "Acción concreta con verbo observable, contexto y frecuencia.",
      "evidencia": "Evidencia breve y verificable.",
      "competenciaRelacionada": "Nombre de competencia",
      "estiloSLII": "E2 - Guiar"
    },
    {
      "id": "acc_5",
      "proposito": "Desarrollar áreas de oportunidad",
      "accionSugerida": "Acción concreta con verbo observable, contexto y frecuencia.",
      "evidencia": "Evidencia breve y verificable.",
      "competenciaRelacionada": "Nombre de competencia",
      "estiloSLII": "E2 - Guiar"
    },
    {
      "id": "acc_6",
      "proposito": "Desarrollar áreas de oportunidad",
      "accionSugerida": "Acción concreta con verbo observable, contexto y frecuencia.",
      "evidencia": "Evidencia breve y verificable.",
      "competenciaRelacionada": "Nombre de competencia",
      "estiloSLII": "E1 - Dirigir"
    }
  ],
  "seguimiento": {
    "evidenciaPrincipal": "Descripción concisa de la evidencia que se revisará.",
    "fechaProximoEncuentro": "Fecha exacta acordada.",
    "plazoSemanas": 5,
    "enfoqueSLII": "Resumen de adaptación del estilo de facilitación/liderazgo."
  }
}
`;

  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
  const fullPrompt = `${analysisSystemPrompt}\n\nAnaliza detenidamente la imagen adjunta y genera el objeto JSON completo según el Banco de Competencias y las instrucciones.`;

  onProgress?.('Inspeccionando trazos y geometría de la rueda...');

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  const modelName = getStoredModel();

  // ONE SINGLE CLEAN CALL - NO RETRY LOOPS, NO FALLBACK CASCADES
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
    const parsedReport = JSON.parse(cleanedJson) as ExecutiveReport;

    if (!parsedReport.competencias || !parsedReport.acciones || !parsedReport.metadata) {
      throw new Error('Estructura de respuesta incompleta');
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
  const trimmed = text.trim();
  if (trimmed.startsWith('```json')) {
    return trimmed.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
  }
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
  }
  return trimmed;
}
