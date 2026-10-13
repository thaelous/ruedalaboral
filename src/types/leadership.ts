export interface CompetencyDefinition {
  id: string;
  name: string;
  definition: string;
  observableBehaviors: string[];
  evidenceExamples: string;
  category: 'Estratégica' | 'Interpersonal' | 'Gestión y Liderazgo';
}

export interface CompetencyScore {
  id: string;
  name: string;
  actual: number; // 1 to 10 scale
  meta: number;   // 1 to 10 scale
  isPuntoPalanca?: boolean; // P.P.
  isPuntoImpacto?: boolean; // P.I.
}

export interface RecommendedAction {
  id: string;
  proposito: 'Sostener fortalezas' | 'Desarrollar áreas de oportunidad';
  accionSugerida: string;
  evidencia: string;
  competenciaRelacionada?: string;
  estiloSLII?: 'E1 - Dirigir' | 'E2 - Guiar' | 'E3 - Apoyar' | 'E4 - Delegar';
}

export interface ExecutiveReport {
  metadata: {
    nombre: string;
    puesto: string;
    fechaAplicacion: string;
    fechaSeguimiento: string;
    facilitador?: string;
  };
  customLabels?: {
    supratitulo?: string;
    tituloPrincipal?: string;
    subtitulo?: string;
    badgeCuartilla?: string;
    refText?: string;
    labelEvaluado?: string;
    labelPuesto?: string;
    labelFechaApp?: string;
    labelSeguimiento?: string;
    tituloRadar?: string;
    subtituloRadar?: string;
    notaPieRadar?: string;
    tituloHallazgos?: string;
    subtituloHallazgos?: string;
    tituloFortalezas?: string;
    tituloOportunidades?: string;
    tituloAcciones?: string;
    subtituloAcciones?: string;
    thProposito?: string;
    thAccion?: string;
    thEvidencia?: string;
    tituloCompromisoSeguimiento?: string;
    tituloProximoEncuentro?: string;
    labelFirmaEvaluado?: string;
    labelFirmaFacilitador?: string;
  };
  competencias: CompetencyScore[];
  lecturaBreve: {
    fortalezas: string[];
    oportunidades: string[];
  };
  puntosClaveManuscritos: {
    puntoPalanca: {
      competencia: string;
      anotaciones: string[];
    };
    puntoImpacto: {
      competencia: string;
      anotaciones: string[];
    };
  };
  acciones: RecommendedAction[];
  seguimiento: {
    evidenciaPrincipal: string;
    fechaProximoEncuentro: string;
    plazoSemanas: number;
    enfoqueSLII: string;
  };
}

export const OFFICIAL_COMPETENCIES: CompetencyDefinition[] = [
  {
    id: 'credibilidad_integridad',
    name: 'Credibilidad e Integridad',
    category: 'Estratégica',
    definition: 'Actúa de manera congruente con lo que comunica, los compromisos que acepta y las normas de conducta aplicables. Asume responsabilidad por sus decisiones y errores.',
    observableBehaviors: [
      'Cumple los compromisos acordados o informa oportunamente cuando necesita renegociarlos.',
      'Explica sus decisiones con información verificable y distingue lo que sabe de lo que desconoce.',
      'Reconoce sus errores y realiza acciones para corregirlos.'
    ],
    evidenceExamples: 'Compromiso cumplido o renegociado; error reconocido y corregido.'
  },
  {
    id: 'toma_decisiones',
    name: 'Toma de decisiones estratégicas',
    category: 'Estratégica',
    definition: 'Selecciona y justifica acciones considerando los objetivos de la organización, la información disponible, los riesgos y las consecuencias a corto y largo plazo, dentro de su ámbito de responsabilidad.',
    observableBehaviors: [
      'Analiza la situación y distingue hechos, supuestos e información faltante antes de decidir.',
      'Compara alternativas considerando su contribución a los objetivos, sus riesgos y los recursos necesarios.',
      'Evalúa los resultados de la decisión y ajusta las acciones cuando la evidencia lo requiere.'
    ],
    evidenceExamples: 'Decisión con alternativas consideradas, razones de elección y revisión de resultados.'
  },
  {
    id: 'comunicacion_efectiva',
    name: 'Comunicación efectiva',
    category: 'Interpersonal',
    definition: 'Intercambia información, instrucciones y expectativas de forma comprensible, escucha las perspectivas de los demás y verifica que exista un entendimiento compartido.',
    observableBehaviors: [
      'Explica qué se requiere, para qué, quién lo realizará y cuándo, según corresponda.',
      'Parafrasea lo que escucha y confirma si interpretó correctamente el mensaje.',
      'Verifica la comprensión mediante preguntas o solicitando que la otra persona explique lo acordado.'
    ],
    evidenceExamples: 'Instrucción o conversación en la que se verificó la comprensión.'
  },
  {
    id: 'brindar_reconocimiento',
    name: 'Brindar reconocimiento',
    category: 'Interpersonal',
    definition: 'Identifica y comunica aportaciones, esfuerzos o resultados específicos de los colaboradores, explicando su contribución al equipo o al trabajo.',
    observableBehaviors: [
      'Identifica la conducta, el esfuerzo o el resultado que reconoce, evitando elogios genéricos.',
      'Explica cómo esa aportación contribuyó al trabajo o a los objetivos del equipo.',
      'Expresa el reconocimiento oportunamente y atribuye el mérito a quienes realizaron la aportación.'
    ],
    evidenceExamples: 'Reconocimiento que identifica una aportación y explica su contribución.'
  },
  {
    id: 'inteligencia_emocional',
    name: 'Inteligencia emocional',
    category: 'Interpersonal',
    definition: 'Identifica sus emociones y considera las de otras personas para regular su respuesta y sostener conversaciones y decisiones respetuosas, incluso bajo presión.',
    observableBehaviors: [
      'Identifica qué emoción experimenta y cómo influye en su manera de responder.',
      'Aplica una estrategia para regular su respuesta antes de actuar impulsivamente, como pausar, ordenar sus ideas o solicitar tiempo.',
      'Pregunta y escucha cómo vive la situación la otra persona, sin dar por hecho lo que siente o necesita.'
    ],
    evidenceExamples: 'Situación de presión en la que identifica su emoción, explica cómo reguló su respuesta y qué hizo.'
  },
  {
    id: 'vision_sistemica',
    name: 'Visión sistémica',
    category: 'Estratégica',
    definition: 'Analiza cómo se relacionan las personas, las áreas y los procesos, y considera cómo una acción en su ámbito puede afectar al conjunto de la organización.',
    observableBehaviors: [
      'Identifica qué personas, áreas o procesos influyen en una situación y cuáles resultan afectados.',
      'Analiza cómo una acción modifica el trabajo de otras áreas y qué efectos adicionales puede producir.',
      'Propone acciones que atienden el problema considerando las dependencias entre áreas, en lugar de trasladar la dificultad a otra parte del proceso.'
    ],
    evidenceExamples: 'Caso en el que identificó efectos entre áreas y ajustó una propuesta para atenderlos.'
  },
  {
    id: 'manejo_conflictos',
    name: 'Manejo de conflictos',
    category: 'Gestión y Liderazgo',
    definition: 'Aborda desacuerdos identificando hechos, intereses y necesidades, y facilita soluciones o acuerdos que permitan continuar el trabajo con respeto.',
    observableBehaviors: [
      'Describe el desacuerdo con hechos y escucha la perspectiva de las partes sin descalificarlas.',
      'Identifica intereses, necesidades y restricciones, y compara alternativas de solución.',
      'Acuerda compromisos, responsables y seguimiento; solicita la intervención correspondiente cuando la situación rebasa su autoridad.'
    ],
    evidenceExamples: 'Desacuerdo abordado, perspectivas escuchadas y acuerdo o canalización realizada.'
  },
  {
    id: 'feedback_desarrollo',
    name: 'Feedback y desarrollo de otros',
    category: 'Gestión y Liderazgo',
    definition: 'Proporciona retroalimentación específica y acuerda oportunidades de aprendizaje para mejorar el desempeño y la autonomía de los colaboradores, ajustando la dirección y el apoyo a sus necesidades.',
    observableBehaviors: [
      'Describe una situación, la conducta observada y su impacto, y escucha la explicación del colaborador (Modelo SCI).',
      'Identifica con el colaborador qué necesita desarrollar para una tarea y acuerda una acción de aprendizaje o práctica.',
      'Ajusta la dirección y el apoyo según la competencia y el compromiso para esa tarea (SLII), y revisa avances con evidencias.'
    ],
    evidenceExamples: 'Conversación de retroalimentación, acción de desarrollo acordada y seguimiento de la práctica.'
  }
];
