import { ExecutiveReport } from '../types/leadership';

export const SAMPLE_CLAUDIA_REPORT: ExecutiveReport = {
  metadata: {
    nombre: 'Claudia A. Virgen Sosa',
    puesto: 'Coordinación de Operaciones y Liderazgo de Equipo',
    fechaAplicacion: '22 / Jul / 2026',
    fechaSeguimiento: '22 / Oct / 2026',
    facilitador: 'Facilitación de Desarrollo Organizacional (SLII®)'
  },
  competencias: [
    {
      id: 'credibilidad_integridad',
      name: 'Credibilidad e Integridad',
      actual: 8.0,
      meta: 9.0
    },
    {
      id: 'toma_decisiones',
      name: 'Toma de decisiones estratégicas',
      actual: 8.0,
      meta: 9.0
    },
    {
      id: 'comunicacion_efectiva',
      name: 'Comunicación efectiva',
      actual: 9.0,
      meta: 9.5
    },
    {
      id: 'brindar_reconocimiento',
      name: 'Brindar reconocimiento',
      actual: 9.0,
      meta: 9.5
    },
    {
      id: 'inteligencia_emocional',
      name: 'Inteligencia emocional',
      actual: 8.0,
      meta: 9.0
    },
    {
      id: 'vision_sistemica',
      name: 'Visión sistémica',
      actual: 5.0,
      meta: 7.0,
      isPuntoImpacto: true
    },
    {
      id: 'manejo_conflictos',
      name: 'Manejo de conflictos',
      actual: 6.0,
      meta: 8.0,
      isPuntoPalanca: true
    },
    {
      id: 'feedback_desarrollo',
      name: 'Feedback y desarrollo de otros',
      actual: 5.0,
      meta: 8.0
    }
  ],
  puntosClaveManuscritos: {
    puntoPalanca: {
      competencia: 'Manejo de conflictos (P.P.)',
      anotaciones: [
        'No involucrarme personalmente ante discrepancias',
        'Entender la causa raíz objetiva del desacuerdo',
        'Tener firmeza en acuerdos sin caer en complacencia'
      ]
    },
    puntoImpacto: {
      competencia: 'Visión sistémica (P.I.)',
      anotaciones: [
        'Tener a tiempo los productos y entregables inter-área',
        'Fomentar solidaridad y sincronía con otras áreas',
        'Dar soporte y coordinación cruzada a otros líderes'
      ]
    }
  },
  lecturaBreve: {
    fortalezas: [
      'Comunicación efectiva y reconocimiento (9.0/10) constituyen el motor relacional del líder, generando canales abiertos y valoración genuina del esfuerzo diario.',
      'Credibilidad e integridad sólidas (8.0/10), fundamentadas en el cumplimiento riguroso de compromisos y consistencia entre discurso y acción.'
    ],
    oportunidades: [
      'Visión sistémica (5.0/10 - Punto Impacto): Se identifican desfases en la entrega interdepartamental que requieren anticipar el impacto cruzado en los procesos de otros equipos.',
      'Manejo de conflictos y feedback (5.0–6.0/10 - Punto Palanca): Requiere desacoplar la carga emocional personal y abordar causas raíz con firmeza respetuosa y sin complacencia.'
    ]
  },
  acciones: [
    {
      id: 'acc_1',
      proposito: 'Sostener fortalezas',
      accionSugerida: 'Documentar y comunicar quincenalmente reconocimientos específicos basados en resultados e impacto verificable del equipo.',
      evidencia: 'Minuta de retroalimentación mensual con 3 reconocimientos de mérito explícito registrados.',
      competenciaRelacionada: 'Brindar reconocimiento',
      estiloSLII: 'E4 - Delegar'
    },
    {
      id: 'acc_2',
      proposito: 'Sostener fortalezas',
      accionSugerida: 'Modelar transparencia en reuniones semanales compartiendo fundamentos de decisiones estratégicas y distinguiendo hechos de supuestos.',
      evidencia: 'Resumen ejecutivo de acuerdos enviado a colaboradores tras el comité semanal.',
      competenciaRelacionada: 'Credibilidad e Integridad',
      estiloSLII: 'E3 - Apoyar'
    },
    {
      id: 'acc_3',
      proposito: 'Sostener fortalezas',
      accionSugerida: 'Parafrasear acuerdos clave en diálogos individuales para validar entendimiento mutuo antes de ejecutar tareas críticas.',
      evidencia: 'Registro de confirmación de expectativas y alcance en el gestor de tareas del proyecto.',
      competenciaRelacionada: 'Comunicación efectiva',
      estiloSLII: 'E3 - Apoyar'
    },
    {
      id: 'acc_4',
      proposito: 'Desarrollar áreas de oportunidad',
      accionSugerida: 'Implementar una matriz de causas raíz en desacuerdos operativos, manteniendo neutralidad emocional y firmeza en los acuerdos pactados.',
      evidencia: 'Plan de conciliación documentado para 2 incidentes críticos, con seguimiento a 15 días.',
      competenciaRelacionada: 'Manejo de conflictos',
      estiloSLII: 'E2 - Guiar'
    },
    {
      id: 'acc_5',
      proposito: 'Desarrollar áreas de oportunidad',
      accionSugerida: 'Establecer reuniones quincenales de sincronización con líderes de áreas adyacentes para monitorear entregables y cuellos de botella.',
      evidencia: 'Calendario compartido de entregables inter-área con semáforo de cumplimiento a tiempo.',
      competenciaRelacionada: 'Visión sistémica',
      estiloSLII: 'E2 - Guiar'
    },
    {
      id: 'acc_6',
      proposito: 'Desarrollar áreas de oportunidad',
      accionSugerida: 'Aplicar el modelo SCI (Situación-Conducta-Impacto) en 2 sesiones mensuales de retroalimentación, acordando planes de práctica guiada.',
      evidencia: 'Bitácora de 2 conversaciones de desarrollo registradas con compromisos y fecha de revisión.',
      competenciaRelacionada: 'Feedback y desarrollo de otros',
      estiloSLII: 'E1 - Dirigir'
    }
  ],
  seguimiento: {
    evidenciaPrincipal: 'Entrega del semáforo de visión sistémica inter-área y bitácora de 2 sesiones de feedback estructurado con modelo SCI.',
    fechaProximoEncuentro: '22 / Octubre / 2026',
    plazoSemanas: 5,
    enfoqueSLII: 'Ajuste de estilo directivo hacia Guiar (E2) en procesos inter-área y Apoyar (E3) en resolución de conflictos.'
  }
};
