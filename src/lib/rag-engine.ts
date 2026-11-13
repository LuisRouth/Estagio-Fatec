// ====================================================================
// MOTOR RAG "ZERO ALUCINAÇÃO" DO REPOSITÓRIO ACADÊMICO — FATEC RIO CLARO
// --------------------------------------------------------------------
// PRINCÍPIOS DE PROJETO (resposta ao problema de respostas inventadas):
//  1. Fontes de verdade ÚNICAS e verificáveis:
//       (a) Matriz curricular oficial  -> src/lib/curriculum.ts
//       (b) Materiais realmente cadastrados e aprovados no Repositório / Vitrine
//     Não existe mais nenhuma "base de conhecimento" escrita à mão com PDFs,
//     links ou ementas que não existam de fato.
//  2. O texto da resposta é MONTADO a partir desses dados (determinístico).
//     Nenhum modelo generativo escreve o texto exibido ao aluno.
//  3. Disciplinas só são citadas se existirem na matriz (código validado).
//  4. Sem correspondência confiável => admite que não entendeu, pede para
//     reformular e dá exemplos. Nunca "força" um material para responder.
//  5. Fora do escopo da unidade (só IA e Gestão ESG) => diz isso claramente.
// ====================================================================

import { OFFICIAL_PPC_DISCIPLINES, type PPCDiscipline } from './curriculum';
import type { AcademicMaterial, CourseType, MaterialType, RAGSourceCitation } from './types';

// --------------------------------------------------------------------
// NORMALIZAÇÃO E COMPARAÇÃO TOLERANTE A ERROS DE DIGITAÇÃO
// --------------------------------------------------------------------

function strip(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** Texto minúsculo, sem acentos/pontuação e com espaços normalizados */
export function norm(s: string): string {
  return strip(s || '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** "cursoo" -> "curso"; "classe" -> "clase" (aplicado dos dois lados, então é consistente) */
function collapse(w: string): string {
  return w.replace(/(.)\1+/g, '$1');
}

function stem(w: string): string {
  return w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w;
}

function key(w: string): string {
  return stem(collapse(w));
}

const STOP_WORDS = new Set(
  [
    'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'com', 'para', 'por', 'que', 'um', 'uma',
    'uns', 'umas', 'os', 'as', 'ao', 'aos', 'ou', 'se', 'me', 'eu', 'ha', 'tem', 'temos', 'tinha', 'ter', 'tenho',
    'existe', 'existem', 'possui', 'possuem', 'onde', 'como', 'quando', 'qual', 'quais', 'quem', 'porque', 'sobre',
    'estudar', 'estudo', 'estudos', 'aprender', 'aprendemos', 'aprende', 'aprendo', 'saber', 'conteudo', 'conteudos',
    'material', 'materiais', 'disciplina', 'disciplinas', 'materia', 'materias', 'curso', 'cursos', 'semestre',
    'semestres', 'grade', 'matriz', 'posso', 'devo', 'deve', 'consigo', 'encontro', 'encontrar', 'achar',
    'disponivel', 'disponiveis', 'ver', 'isso', 'esse', 'essa', 'este', 'esta', 'ensina', 'ensinam', 'falar', 'fala',
    'sao', 'ser', 'foi', 'algum', 'alguma', 'alguns', 'algumas', 'mais', 'muito', 'tipo', 'oi', 'ola', 'favor',
    'gostaria', 'queria', 'preciso', 'quero', 'aula', 'aulas', 'fatec', 'rio', 'claro', 'unidade', 'faculdade',
    'tambem', 'ainda', 'mesmo', 'sim', 'nao', 'voce', 'vocês', 'pode', 'poderia', 'indicar', 'indica', 'indique',
    'funciona', 'funcionamento', 'vitrine', 'repositorio', 'academico', 'portal',
  ].map(key)
);

/** Tokens de conteúdo (sem stop words), já colapsados e sem plural */
export function contentTokens(s: string): string[] {
  return norm(s)
    .split(' ')
    .map(key)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}

/** Dois tokens (já normalizados com key()) são "o mesmo termo"? */
export function tokMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const min = Math.min(a.length, b.length);
  if (min >= 5 && (a.startsWith(b) || b.startsWith(a))) return true;
  if (min >= 5 && Math.abs(a.length - b.length) <= 2 && editDistance(a, b) <= (min >= 9 ? 2 : 1)) return true;
  return false;
}

function queryHas(qTokens: string[], keyword: string): boolean {
  const kt = contentTokens(keyword);
  return kt.length > 0 && kt.every((t) => qTokens.some((q) => tokMatch(q, t)));
}

function hasPhrasePrefix(hayNorm: string, kw: string): boolean {
  const k = norm(kw);
  if (!k) return false;
  // plural opcional em cada palavra; palavras curtas (sql, etl...) exigem fronteira final
  const body = k.split(' ').map((w) => w + 's?').join('\\s+');
  const tail = k.length <= 3 ? '(\\s|$)' : '';
  return new RegExp('(^|\\s)' + body + tail).test(hayNorm);
}

// --------------------------------------------------------------------
// ESCOPO INSTITUCIONAL: A UNIDADE SÓ TEM IA E GESTÃO ESG
// --------------------------------------------------------------------

const OUT_OF_SCOPE_RULES: Array<{ topic: string; re: RegExp; unless?: RegExp }> = [
  {
    topic: 'Construção Civil e Edificações',
    re: /\b(construcao civil|engenharia civil|edificac\w*|alvenaria|canteiro de obra\w*|concreto armado|instalac\w* predia\w*|topografia|pedreiro|urbanismo)\b/,
  },
  { topic: 'Construção Civil e Edificações', re: /\bconstrucao\b.*\b(civil|predial|obra|obras|casa|edificio)\b/ },
  {
    topic: 'Ciências da Saúde',
    re: /\b(medicina|enfermagem|odontologia|fisioterapia|farmacia|veterinaria|nutricao|biomedicina|clinica medica)\b/,
    unless: /\b(dwh|datasus|saude rc|analytics)\b/,
  },
  {
    topic: 'Direito e Ciências Jurídicas',
    re: /\b(direito penal|direito civil|direito trabalhista|advocacia|processo penal|processo civil|ciencias juridicas|oab)\b/,
  },
  {
    topic: 'Engenharias Tradicionais e Agronomia',
    re: /\b(engenharia mecanica|engenharia eletrica|engenharia quimica|mecanica pesada|metalurgia|aeronautica|agronomia|zootecnia|agropecuaria)\b/,
  },
  { topic: 'Pedagogia, Letras, Gastronomia ou Moda', re: /\b(pedagogia|letras|culinaria|gastronomia|corte e costura|moda)\b/ },
];

export function detectOutOfScopeDomain(question: string): { isOutOfScope: boolean; topic?: string } {
  const n = norm(question);
  for (const rule of OUT_OF_SCOPE_RULES) {
    if (rule.re.test(n) && !(rule.unless && rule.unless.test(n))) {
      return { isOutOfScope: true, topic: rule.topic };
    }
  }
  return { isOutOfScope: false };
}

// --------------------------------------------------------------------
// CONCEITOS -> DISCIPLINAS REAIS DA MATRIZ (códigos validados em testes)
// --------------------------------------------------------------------

export interface Concept {
  id: string;
  label: string;
  keywords: string[];
  codes: string[];
  materialKeywords: string[];
  note?: string;
}

export const CONCEPT_CATALOG: Concept[] = [
  { id: 'ingles', label: 'Inglês', keywords: ['ingles', 'english', 'idioma', 'lingua inglesa'], codes: ['ING-297', 'ING-298', 'ESG-IN1', 'ESG-IN2'], materialKeywords: ['ingles', 'english'] },
  { id: 'espanhol', label: 'Espanhol', keywords: ['espanhol', 'spanish'], codes: ['ESG-ESP'], materialKeywords: ['espanhol'] },
  { id: 'banco_dados', label: 'Banco de Dados', keywords: ['banco dados', 'sql', 'nosql', 'mongodb', 'postgresql', 'modelagem relacional'], codes: ['IBD-040', 'IBD-041'], materialKeywords: ['banco de dados', 'sql', 'nosql', 'postgresql', 'mongodb', 'modelagem dimensional'] },
  { id: 'big_data', label: 'Big Data e Data Warehouse', keywords: ['big data', 'bigdata', 'data warehouse', 'dwh', 'etl', 'data lake'], codes: ['BDN-009'], materialKeywords: ['big data', 'data warehouse', 'dwh', 'etl', 'datasus'] },
  { id: 'matematica', label: 'Matemática, Álgebra e Estatística', keywords: ['matematica', 'calculo', 'derivada', 'integral', 'algebra', 'estatistica', 'probabilidade', 'geometria'], codes: ['MAT-052', 'MAG-020', 'EST-069'], materialKeywords: ['matematica', 'calculo', 'algebra', 'estatistica', 'probabilidade'], note: 'A matriz curricular não possui uma disciplina com o nome "Cálculo"; os conteúdos matemáticos estão nas disciplinas Matemática, Álgebra Linear e Estatística acima.' },
  { id: 'programacao', label: 'Programação', keywords: ['programacao', 'programar', 'python', 'linguagem programacao', 'algoritmo', 'java', 'javascript'], codes: ['ILP-113', 'ILP-114'], materialKeywords: ['python', 'programacao', 'algoritmo'] },
  { id: 'estrutura_dados', label: 'Estrutura de Dados e Algoritmos', keywords: ['estrutura dados', 'grafo', 'pilha', 'arvore binaria', 'ordenacao'], codes: ['IED-020'], materialKeywords: ['estrutura de dados', 'grafo'] },
  { id: 'machine_learning', label: 'Aprendizado de Máquina', keywords: ['aprendizado maquina', 'machine learning', 'ml', 'classificacao', 'regressao', 'scikit'], codes: ['MAQ-026', 'MAQ-027', 'IIA-022'], materialKeywords: ['machine learning', 'aprendizado de maquina', 'scikit', 'classificacao', 'regressao'] },
  { id: 'redes_neurais', label: 'Redes Neurais e Deep Learning', keywords: ['redes neurais', 'deep learning', 'aprendizado profundo', 'cnn', 'tensorflow', 'pytorch', 'neural'], codes: ['IRC-036', 'MAQ-027'], materialKeywords: ['neural', 'deep learning', 'cnn', 'tensorflow', 'pytorch'] },
  { id: 'visao', label: 'Visão Computacional', keywords: ['visao computacional', 'opencv', 'processamento imagens', 'reconhecimento imagens'], codes: ['IIA-023'], materialKeywords: ['visao computacional', 'opencv', 'imagem', 'cnn'] },
  { id: 'pln', label: 'Processamento de Linguagem Natural', keywords: ['pln', 'nlp', 'processamento linguagem natural', 'chatbot', 'llm'], codes: ['MAQ-027', 'IRC-036'], materialKeywords: ['nlp', 'linguagem natural', 'chatbot', 'llm'], note: 'A matriz curricular não possui uma disciplina específica de Processamento de Linguagem Natural; as disciplinas acima são as mais próximas pelo nome.' },
  { id: 'inteligencia_computacional', label: 'Inteligência Computacional e Otimização', keywords: ['inteligencia computacional', 'algoritmo genetico', 'logica fuzzy', 'otimizacao', 'heuristica'], codes: ['IIA-021'], materialKeywords: ['algoritmo genetico', 'otimizacao', 'heuristica'] },
  { id: 'ia_intro', label: 'Introdução à Inteligência Artificial', keywords: ['introducao inteligencia artificial', 'conceitos inteligencia artificial', 'agentes inteligentes'], codes: ['IIA-020', 'COM-084'], materialKeywords: ['agente inteligente', 'introducao a inteligencia artificial'] },
  { id: 'mineracao', label: 'Mineração de Dados', keywords: ['mineracao dados', 'data mining', 'mineracao'], codes: ['IED-021'], materialKeywords: ['mineracao'] },
  { id: 'nuvem', label: 'Computação em Nuvem', keywords: ['nuvem', 'cloud', 'aws', 'azure'], codes: ['ISW-052'], materialKeywords: ['nuvem', 'cloud'] },
  { id: 'iot', label: 'Internet das Coisas', keywords: ['iot', 'internet coisas', 'esp32', 'sensor', 'arduino', 'telemetria'], codes: ['ISW-053'], materialKeywords: ['iot', 'esp32', 'sensor', 'telemetria', 'mqtt'] },
  { id: 'redes_comp', label: 'Redes de Computadores', keywords: ['redes computadores', 'tcp', 'protocolo rede'], codes: ['IRC-035'], materialKeywords: ['redes de computadores', 'tcp'] },
  { id: 'seguranca', label: 'Segurança da Informação', keywords: ['seguranca informacao', 'ciberseguranca', 'criptografia', 'seguranca'], codes: ['ISG-030'], materialKeywords: ['seguranca da informacao', 'criptografia'] },
  { id: 'etica_ia', label: 'Ética em IA', keywords: ['etica'], codes: ['HIA-001'], materialKeywords: ['etica'] },
  { id: 'gestao_projetos', label: 'Gestão de Projetos', keywords: ['gestao projetos', 'agil', 'ageis', 'scrum', 'kanban', 'roadmap'], codes: ['GPJ-022', 'ESG-GPJ', 'EIA-001', 'EIA-003', 'EIA-005', 'EIA-007'], materialKeywords: ['projetos ageis', 'scrum', 'kanban', 'gestao de projetos'] },
  { id: 'empreendedorismo', label: 'Empreendedorismo e Inovação', keywords: ['empreendedorismo', 'inovacao', 'startup'], codes: ['CEE-070', 'ESG-INO'], materialKeywords: ['empreendedorismo', 'inovacao'] },
  { id: 'tcc', label: 'Trabalho de Graduação (TCC)', keywords: ['tcc', 'trabalho graduacao', 'monografia'], codes: ['TIA-001', 'ESG-TCC'], materialKeywords: ['tcc', 'trabalho de graduacao'] },
  { id: 'estagio', label: 'Estágio Supervisionado', keywords: ['estagio', 'estagiario'], codes: ['EIA-100', 'ESG-EST'], materialKeywords: ['estagio'] },
  { id: 'comunicacao', label: 'Leitura e Escrita Profissional', keywords: ['escrita profissional', 'leitura critica', 'redacao', 'portugues', 'comunicacao'], codes: ['ESG-COM', 'ILP-115'], materialKeywords: ['escrita profissional', 'redacao'] },
  { id: 'cognitiva', label: 'Ciência Cognitiva', keywords: ['ciencia cognitiva', 'cognicao'], codes: ['COM-084'], materialKeywords: ['cognitiva'] },
  { id: 'esg_geral', label: 'Sustentabilidade e ODS', keywords: ['sustentabilidade', 'sustentavel', 'ods', 'objetivos desenvolvimento sustentavel'], codes: ['ESG-W1A', 'ESG-AMB', 'ESG-CIR'], materialKeywords: ['esg', 'sustentabilidade', 'ods'] },
  { id: 'ambiental', label: 'Gestão Ambiental', keywords: ['gestao ambiental', 'meio ambiente', 'ambiental', 'poluicao', 'qualidade ar'], codes: ['ESG-AMB', 'ESG-RSK', 'ESG-W1A', 'ESG-P2A'], materialKeywords: ['ambiental', 'meio ambiente', 'qualidade do ar', 'ecolog'] },
  { id: 'residuos', label: 'Gestão de Resíduos', keywords: ['residuos', 'reciclagem', 'lixo'], codes: ['ESG-RES', 'ESG-CIR'], materialKeywords: ['residuo', 'reciclagem'] },
  { id: 'circular', label: 'Economia Circular', keywords: ['economia circular'], codes: ['ESG-CIR'], materialKeywords: ['economia circular'] },
  { id: 'carbono', label: 'Emissões e Pegada de Carbono', keywords: ['carbono', 'emissoes', 'gee', 'pegada', 'escopo'], codes: ['ESG-AMB', 'ESG-R4A', 'ESG-DAT'], materialKeywords: ['carbono', 'emissoes', 'gee'], note: 'A matriz curricular não possui uma disciplina exclusiva de inventário de carbono; as disciplinas acima são as mais próximas pelo nome.' },
  { id: 'compliance', label: 'Governança e Compliance', keywords: ['compliance', 'governanca', 'anticorrupcao', 'integridade'], codes: ['ESG-C4B', 'ESG-CMP', 'ESG-LEG'], materialKeywords: ['compliance', 'governanca'] },
  { id: 'reporting', label: 'Relatórios de Sustentabilidade (Reporting)', keywords: ['reporting', 'relatorio sustentabilidade', 'gri', 'relato integrado'], codes: ['ESG-R4A'], materialKeywords: ['reporting', 'relatorio de sustentabilidade', 'gri'] },
  { id: 'legal', label: 'Aspectos Legais', keywords: ['legislacao', 'aspectos legais'], codes: ['ESG-LEG'], materialKeywords: ['legislacao', 'aspectos legais'] },
  { id: 'financas', label: 'Finanças Sustentáveis e Mercado de Capitais', keywords: ['financas', 'mercado capitais', 'investimento'], codes: ['ESG-FIN', 'ESG-CAP'], materialKeywords: ['financas', 'mercado de capitais'] },
  { id: 'diversidade', label: 'Gestão da Diversidade', keywords: ['diversidade', 'inclusao'], codes: ['ESG-D3A', 'ESG-DIV'], materialKeywords: ['diversidade', 'inclusao'] },
  { id: 'cadeias', label: 'Cadeias Globais de Valor', keywords: ['cadeia valor', 'cadeias globais', 'supply chain', 'fornecedores'], codes: ['ESG-CAD', 'ESG-I3B'], materialKeywords: ['cadeia', 'supply chain'] },
  { id: 'psico_org', label: 'Psicologia Organizacional', keywords: ['psicologia organizacional', 'autogestao', 'lideranca'], codes: ['ESG-PSI'], materialKeywords: ['psicologia organizacional', 'lideranca'] },
  { id: 'dados_analise', label: 'Análise de Dados', keywords: ['analise dados', 'ciencia dados', 'data science'], codes: ['ESG-DAT', 'IED-021', 'EST-069', 'BDN-009'], materialKeywords: ['analise de dados', 'ciencia de dados'] },
];

// --------------------------------------------------------------------
// RECEITAS DE PROJETO ("para criar X, o que devo estudar?")
// Cada etapa descreve a NECESSIDADE do projeto e aponta disciplinas reais.
// --------------------------------------------------------------------

interface RecipeStep { need: string; codes: string[] }
export interface Recipe {
  id: string;
  label: string;
  keywords: string[];
  steps: RecipeStep[];
  external: string[];
  materialKeywords: string[];
}

export const RECIPE_CATALOG: Recipe[] = [
  {
    id: 'rotas',
    label: 'uma aplicação de rotas de entrega de mercadorias',
    keywords: ['rota', 'entrega', 'mercadoria', 'logistica', 'frete', 'roteirizacao', 'caminho minimo'],
    steps: [
      { need: 'Programar a aplicação e manipular coordenadas e distâncias', codes: ['ILP-113', 'ILP-114'] },
      { need: 'Modelar o mapa como grafo e calcular o menor caminho', codes: ['IED-020'] },
      { need: 'Otimizar a ordem de várias paradas (heurísticas de otimização)', codes: ['IIA-021'] },
      { need: 'Estimar tempos de entrega a partir de dados históricos', codes: ['MAQ-026', 'IIA-022'] },
      { need: 'Armazenar pedidos, clientes e endereços', codes: ['IBD-040'] },
    ],
    external: ['APIs de mapas e rotas (ex.: Google Maps Routes API, OpenStreetMap/OSRM)', 'bibliotecas de roteirização (ex.: OR-Tools, VROOM)'],
    materialKeywords: ['rota', 'roteirizacao', 'grafo', 'logistica', 'entrega'],
  },
  {
    id: 'chatbot',
    label: 'um chatbot / assistente com processamento de linguagem natural',
    keywords: ['chatbot', 'assistente virtual', 'nlp', 'pln', 'processamento linguagem natural', 'llm'],
    steps: [
      { need: 'Programar a aplicação', codes: ['ILP-113', 'ILP-114'] },
      { need: 'Treinar e avaliar modelos de aprendizado de máquina', codes: ['MAQ-026', 'MAQ-027'] },
      { need: 'Entender redes neurais, base dos modelos de linguagem', codes: ['IRC-036'] },
      { need: 'Armazenar conversas e conhecimento', codes: ['IBD-040', 'IBD-041'] },
    ],
    external: ['bibliotecas e APIs de PLN/LLM (ex.: spaCy, Hugging Face, APIs de LLM)', 'a matriz não possui disciplina específica de Processamento de Linguagem Natural'],
    materialKeywords: ['chatbot', 'nlp', 'linguagem natural', 'llm'],
  },
  {
    id: 'visao',
    label: 'uma aplicação de visão computacional / reconhecimento de imagens',
    keywords: ['visao computacional', 'reconhecimento imagens', 'imagens', 'opencv', 'deteccao objetos', 'camera'],
    steps: [
      { need: 'Programar o processamento de dados', codes: ['ILP-113'] },
      { need: 'Treinar modelos de classificação', codes: ['MAQ-026'] },
      { need: 'Construir redes neurais para imagens', codes: ['IRC-036', 'MAQ-027'] },
      { need: 'Aplicar técnicas de visão computacional', codes: ['IIA-023'] },
    ],
    external: ['datasets de imagens e recursos de treino (GPU/Colab)'],
    materialKeywords: ['visao computacional', 'opencv', 'imagem', 'cnn'],
  },
  {
    id: 'previsao',
    label: 'um modelo de previsão / análise preditiva',
    keywords: ['previsao', 'prever', 'predicao', 'preditivo', 'forecast', 'demanda'],
    steps: [
      { need: 'Programar a coleta e o tratamento dos dados', codes: ['ILP-113', 'ILP-114'] },
      { need: 'Fundamentos de estatística e matemática', codes: ['EST-069', 'MAT-052'] },
      { need: 'Explorar grandes volumes de dados', codes: ['IED-021', 'BDN-009'] },
      { need: 'Construir e validar os modelos preditivos', codes: ['MAQ-026', 'IIA-022'] },
      { need: 'Armazenar os dados', codes: ['IBD-040'] },
    ],
    external: [],
    materialKeywords: ['previsao', 'preditiv', 'machine learning'],
  },
  {
    id: 'dashboard',
    label: 'um dashboard / painel de dados',
    keywords: ['dashboard', 'painel', 'visualizacao dados'],
    steps: [
      { need: 'Modelar e consultar os dados', codes: ['IBD-040', 'IBD-041'] },
      { need: 'Preparar e analisar os dados', codes: ['BDN-009', 'IED-021', 'EST-069'] },
      { need: 'Programar a aplicação', codes: ['ILP-113'] },
    ],
    external: ['ferramentas de visualização/BI e desenvolvimento web/front-end (não constam como disciplinas dedicadas na matriz)'],
    materialKeywords: ['dashboard', 'analytics', 'data warehouse'],
  },
  {
    id: 'iot',
    label: 'uma solução de IoT / monitoramento com sensores',
    keywords: ['iot', 'sensor', 'esp32', 'arduino', 'telemetria', 'monitoramento', 'automacao'],
    steps: [
      { need: 'Conceitos de Internet das Coisas', codes: ['ISW-053'] },
      { need: 'Programar o dispositivo e a aplicação', codes: ['ILP-113'] },
      { need: 'Enviar e armazenar dados na nuvem', codes: ['ISW-052', 'IBD-040'] },
      { need: 'Redes de comunicação entre dispositivos', codes: ['IRC-035'] },
      { need: 'Analisar os dados coletados', codes: ['MAQ-026'] },
    ],
    external: ['hardware (ESP32/Arduino), eletrônica básica e protocolos como MQTT (não constam como disciplinas dedicadas)'],
    materialKeywords: ['iot', 'esp32', 'sensor', 'telemetria', 'mqtt'],
  },
  {
    id: 'webapp',
    label: 'um site / aplicativo / sistema web',
    keywords: ['site', 'app', 'aplicativo', 'web', 'mobile', 'frontend', 'backend', 'api', 'sistema'],
    steps: [
      { need: 'Programar a lógica da aplicação', codes: ['ILP-113', 'ILP-114'] },
      { need: 'Modelar o banco de dados', codes: ['IBD-040', 'IBD-041'] },
      { need: 'Hospedar na nuvem', codes: ['ISW-052'] },
      { need: 'Proteger a aplicação e os dados', codes: ['ISG-030'] },
      { need: 'Gerir o projeto de forma ágil', codes: ['GPJ-022', 'EIA-001'] },
    ],
    external: ['a matriz não possui disciplinas específicas de desenvolvimento web/mobile (HTML/CSS/JavaScript e frameworks) — será necessário estudo complementar externo'],
    materialKeywords: ['web', 'aplicativo', 'portal'],
  },
  {
    id: 'esg_relatorio',
    label: 'um relatório / diagnóstico de sustentabilidade ESG',
    keywords: ['relatorio sustentabilidade', 'relatorio esg', 'auditoria esg', 'diagnostico esg', 'inventario emissoes'],
    steps: [
      { need: 'Diagnóstico ambiental', codes: ['ESG-AMB'] },
      { need: 'Análise dos dados', codes: ['ESG-DAT'] },
      { need: 'Elaboração do relatório (reporting)', codes: ['ESG-R4A'] },
      { need: 'Conformidade e aspectos legais', codes: ['ESG-C4B', 'ESG-CMP', 'ESG-LEG'] },
    ],
    external: ['normas e padrões (ex.: GRI, GHG Protocol) devem ser consultados nas fontes oficiais'],
    materialKeywords: ['relatorio de sustentabilidade', 'reporting', 'gri'],
  },
];

// --------------------------------------------------------------------
// CORPUS: SOMENTE MATERIAIS REAIS, APROVADOS E CADASTRADOS NO SITE
// --------------------------------------------------------------------

export interface CorpusDoc {
  id: string;
  title: string;
  subject: string;
  course: CourseType;
  semester: number;
  materialType: MaterialType;
  fileUrl: string;
  githubUrl?: string | null;
  authorName: string;
  tags: string;
  description: string;
  links?: Array<{ label: string; url: string }> | null;
  attachments?: Array<{ title: string; url: string; type?: string }> | null;
}

export function buildCorpus(materials: AcademicMaterial[] = []): CorpusDoc[] {
  const seen = new Set<string>();
  const out: CorpusDoc[] = [];
  for (const m of materials || []) {
    if (!m || m.is_approved === false) continue;
    const k = norm(m.title);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push({
      id: m.id,
      title: m.title,
      subject: m.subject || '',
      course: m.course,
      semester: m.semester,
      materialType: m.material_type,
      fileUrl: m.file_url,
      githubUrl: m.github_url || null,
      authorName: m.author_name || 'Docente FATEC Rio Claro',
      tags: m.tags || '',
      description: (m.description || '').trim(),
      links: Array.isArray(m.links) && m.links.length ? m.links.map((l) => ({ label: l.label, url: l.url })) : null,
      attachments: Array.isArray(m.attachments) && m.attachments.length ? m.attachments.map((a) => ({ title: a.title, url: a.url, type: a.type })) : null,
    });
  }
  return out;
}

// --------------------------------------------------------------------
// ENTENDIMENTO DA PERGUNTA
// --------------------------------------------------------------------

const BY_CODE = new Map<string, PPCDiscipline>(OFFICIAL_PPC_DISCIPLINES.map((d) => [d.code, d]));

export interface EngineHints {
  conceptIds?: string[];
  recipeId?: string | null;
}

export interface EngineOptions {
  course?: CourseType | 'TODOS';
  semester?: number | null;
  limit?: number;
}

export interface EngineResult {
  answer: string;
  sources: RAGSourceCitation[];
  grounded: boolean;
  kind: 'EMPTY' | 'OUT_OF_SCOPE' | 'CURRICULUM' | 'RECIPE' | 'MATERIALS' | 'LISTING' | 'NOT_UNDERSTOOD';
}

const SEMESTER_WORDS: Record<string, number> = { primeiro: 1, segundo: 2, terceiro: 3, quarto: 4, quinto: 5 };

function detectSemester(n: string): number | null {
  const m = n.match(/\b([1-6])\s*(?:o|a)?\s*semestre\b/);
  if (m) return Number(m[1]);
  const w = n.match(/\b(primeiro|segundo|terceiro|quarto|quinto)\s+semestre\b/);
  return w ? SEMESTER_WORDS[w[1]] : null;
}

function detectCourse(n: string, qTokens: string[]): CourseType | null {
  const hasIA = qTokens.includes('ia') || /\binteligencia artificial\b/.test(n);
  const hasESG = qTokens.includes('esg') || /\bgestao esg\b/.test(n);
  if (hasIA && !hasESG) return 'IA';
  if (hasESG && !hasIA) return 'ESG';
  return null;
}

function disciplineMentioned(d: PPCDiscipline, qTokens: string[], qNorm: string): boolean {
  if (qNorm.includes(norm(d.code))) return true;
  const nameTokens = Array.from(new Set(contentTokens(d.name)));
  if (nameTokens.length === 0) return false;
  const matched = nameTokens.filter((t) => qTokens.some((q) => tokMatch(q, t)));
  const coverage = matched.length / nameTokens.length;
  return coverage >= 0.99 && matched.some((t) => t.length >= 4);
}

// --------------------------------------------------------------------
// FORMATAÇÃO DAS RESPOSTAS (TUDO A PARTIR DE DADOS VERIFICADOS)
// --------------------------------------------------------------------

function fmtDiscipline(d: PPCDiscipline): string {
  return `**${d.name}** (${d.code}) — ${d.course} · ${d.semester}º semestre · ${d.hours ?? '?'}h · ${d.mode ?? ''}`.trim();
}

const TYPE_LABEL: Record<MaterialType, string> = {
  SLIDE: 'Slides', APOSTILA: 'Apostila/Documento', CODIGO: 'Código', TCC: 'TCC', PROJETO: 'Projeto', DATASET: 'Dataset',
};

function isWork(t: MaterialType): boolean {
  return t === 'PROJETO' || t === 'TCC';
}

function excerpt(text: string, max = 220): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max).trimEnd() + '…' : clean;
}

function fmtMaterial(d: CorpusDoc): string {
  const desc = d.description ? ` ${excerpt(d.description)}` : '';
  return `  - **${d.title}** — ${TYPE_LABEL[d.materialType] || d.materialType} · ${d.course}, ${d.semester}º semestre · Disciplina: ${d.subject || 'não informada'}.${desc}`;
}

function toCitation(d: CorpusDoc, score: number): RAGSourceCitation {
  return {
    id: d.id,
    title: d.title,
    subject: d.subject,
    course: d.course,
    semester: d.semester,
    materialType: d.materialType,
    fileUrl: d.fileUrl,
    githubUrl: d.githubUrl,
    authorName: d.authorName,
    relevanceScore: score,
    excerpt: excerpt(d.description || d.title, 240),
    links: d.links || null,
    attachments: d.attachments || null,
  };
}

const SYLLABUS_NOTE =
  'ℹ️ **Sobre o conteúdo das disciplinas:** o portal registra nome, código, semestre, carga horária e modalidade de cada disciplina. A ementa detalhada só é apresentada quando um docente cadastra o plano de ensino ou o material no Repositório. Para o conteúdo programático completo, consulte o plano de ensino oficial ou o professor da disciplina.';

export const NOT_UNDERSTOOD_EXAMPLES = [
  'Há disciplina de Inglês no curso de IA?',
  'Onde estudar Banco de Dados?',
  'Quais disciplinas existem no 3º semestre de IA?',
  'Para criar uma aplicação de rotas de entrega, quais matérias devo estudar?',
  'Quais materiais existem sobre Visão Computacional?',
  'Quais disciplinas de Gestão ESG falam sobre compliance?',
];

function notUnderstoodAnswer(): string {
  return (
    'Não compreendi sua pergunta ou não encontrei, na matriz curricular nem nos materiais cadastrados da FATEC Rio Claro, nada que corresponda a esses termos.\n\n' +
    'Por favor, **refaça a pergunta de forma mais objetiva**, citando o nome de uma disciplina, tecnologia, tema ou projeto.\n\n' +
    '💡 **Exemplos de perguntas que eu consigo responder:**\n' +
    NOT_UNDERSTOOD_EXAMPLES.map((e) => `• "${e}"`).join('\n')
  );
}

export function outOfScopeAnswer(topic: string): string {
  return (
    `A FATEC Rio Claro oferece exclusivamente os cursos superiores de **Inteligência Artificial** (Matutino) e **Gestão ESG** (Noturno).\n\n` +
    `Portanto, **não possuímos cursos, disciplinas ou materiais didáticos sobre ${topic}** nesta unidade.\n\n` +
    `Eu só consulto a matriz curricular desses dois cursos e os materiais cadastrados no Repositório Acadêmico e na Vitrine de Projetos. Se quiser, pergunte sobre uma disciplina de IA ou de Gestão ESG.`
  );
}

// --------------------------------------------------------------------
// RECUPERAÇÃO DE MATERIAIS REAIS
// --------------------------------------------------------------------

interface MaterialContext {
  concepts: Concept[];
  discs: PPCDiscipline[];
  extraKeywords: string[];
  qTokens: string[];
  useGenericTokens: boolean;
  course: CourseType | null;
  semester: number | null;
}

function scoreMaterial(doc: CorpusDoc, ctx: MaterialContext): number {
  if (ctx.course && doc.course !== ctx.course) return 0;
  const hay = norm([doc.title, doc.subject, doc.tags, doc.description].join(' '));
  let score = 0;

  for (const c of ctx.concepts) {
    if (c.materialKeywords.some((kw) => hasPhrasePrefix(hay, kw))) score += 3;
  }
  for (const kw of ctx.extraKeywords) {
    if (hasPhrasePrefix(hay, kw)) score += 2;
  }
  const subjTokens = contentTokens(doc.subject);
  for (const d of ctx.discs) {
    if (hay.includes(norm(d.code))) score += 4;
    const nameTokens = Array.from(new Set(contentTokens(d.name)));
    if (nameTokens.length && subjTokens.length && nameTokens.every((t) => subjTokens.some((s) => tokMatch(s, t)))) score += 4;
  }

  if (ctx.useGenericTokens && ctx.qTokens.length) {
    const fieldTokens = contentTokens([doc.title, doc.subject, doc.tags].join(' '));
    const strong = ctx.qTokens.filter((t) => t.length >= 4);
    const matched = ctx.qTokens.filter((q) => fieldTokens.some((f) => tokMatch(q, f)));
    const matchedStrong = strong.filter((q) => matched.includes(q));
    const coverage = matched.length / ctx.qTokens.length;
    if (matchedStrong.length >= 1 && coverage >= 0.6) score += 3 * coverage;
  }
  return score;
}

function retrieveMaterials(corpus: CorpusDoc[], ctx: MaterialContext, limit: number): Array<{ doc: CorpusDoc; score: number }> {
  return corpus
    .map((doc) => ({ doc, score: scoreMaterial(doc, ctx) }))
    .filter((r) => r.score >= 2.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function materialsSection(
  found: Array<{ doc: CorpusDoc; score: number }>,
  subjectLabel: string,
  warnIfNoLessons = true
): { text: string; sources: RAGSourceCitation[] } {
  const lessons = found.filter((f) => !isWork(f.doc.materialType));
  const works = found.filter((f) => isWork(f.doc.materialType));
  const blocks: string[] = [];

  if (lessons.length) {
    blocks.push('• **Materiais de estudo cadastrados no Repositório Acadêmico:**\n' + lessons.map((f) => fmtMaterial(f.doc)).join('\n'));
  } else if (warnIfNoLessons) {
    blocks.push(`⚠️ **Aviso de Disponibilidade:** no momento **não há apostilas, slides ou códigos de aula cadastrados no Repositório Acadêmico** sobre ${subjectLabel}.`);
  }
  if (works.length) {
    blocks.push('• **Projetos e trabalhos da Vitrine que aplicam este conteúdo:**\n' + works.map((f) => fmtMaterial(f.doc)).join('\n'));
  }
  const sources = [...lessons, ...works].map((f) => toCitation(f.doc, Math.min(0.99, Number((0.5 + f.score / 20).toFixed(2)))));
  return { text: blocks.join('\n\n'), sources };
}

// Definições universais (não dependem de material do acervo) — sempre rotuladas como tal
const GLOSSARY: Array<{ keywords: string[]; text: string }> = [
  {
    keywords: ['esg', 'sigla esg'],
    text: '📖 **Definição geral (conceito amplamente conhecido, não extraído de material do acervo):** ESG vem do inglês *Environmental, Social and Governance* — Ambiental, Social e Governança —, o conjunto de critérios usado para avaliar o desempenho sustentável e a gestão responsável de uma organização.',
  },
  {
    keywords: ['escopo', 'escopos', 'pegada carbono'],
    text: '📖 **Definição geral (padrão GHG Protocol, não extraído de material do acervo):** Escopo 1 = emissões diretas da própria organização; Escopo 2 = emissões indiretas pela energia elétrica adquirida; Escopo 3 = demais emissões indiretas da cadeia de valor (fornecedores, transporte, uso dos produtos).',
  },
];

function glossaryLead(qNorm: string, qTokens: string[]): string {
  if (!/\b(o que e|o que significa|o que sao|significa|significado|sigla|definicao|conceito|como sao calculados)\b/.test(qNorm)) return '';
  return GLOSSARY.filter((g) => g.keywords.some((kw) => queryHas(qTokens, kw)))
    .map((g) => g.text)
    .join('\n\n');
}

/** Materiais cujo TÍTULO é citado pela pergunta (ex.: "projeto DWH Saúde RC", "FoodYze") */
function namedMaterials(corpus: CorpusDoc[], qTokens: string[], course: CourseType | null): CorpusDoc[] {
  if (!qTokens.length) return [];
  return corpus.filter((doc) => {
    if (course && doc.course !== course) return false;
    const titleTokens = contentTokens(doc.title);
    const matched = qTokens.filter((q) => titleTokens.some((t) => tokMatch(q, t)));
    if (!matched.length || matched.length / qTokens.length < 0.6) return false;
    return matched.some((t) => t.length >= 3) && (matched.length >= 2 || matched[0].length >= 6);
  });
}

function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(', ') + ' e ' + items[items.length - 1];
}

// --------------------------------------------------------------------
// MOTOR PRINCIPAL
// --------------------------------------------------------------------

export function answerQuestion(
  question: string,
  materials: AcademicMaterial[],
  options: EngineOptions = {},
  hints: EngineHints = {}
): EngineResult {
  const q = (question || '').trim();
  if (!q) {
    return { answer: 'Por favor, digite uma dúvida acadêmica sobre as disciplinas ou materiais do Repositório.', sources: [], grounded: false, kind: 'EMPTY' };
  }

  const oos = detectOutOfScopeDomain(q);
  if (oos.isOutOfScope) {
    return { answer: outOfScopeAnswer(oos.topic || 'o tema consultado'), sources: [], grounded: true, kind: 'OUT_OF_SCOPE' };
  }

  const corpus = buildCorpus(materials);
  const qNorm = norm(q);
  const qTokens = Array.from(new Set(contentTokens(q)));
  const limit = Math.min(Math.max(options.limit || 6, 1), 6);

  const course: CourseType | null = options.course && options.course !== 'TODOS' ? options.course : detectCourse(qNorm, qTokens);
  const semester: number | null = options.semester ?? detectSemester(qNorm);

  // 1) conceitos e disciplinas citadas
  const concepts = CONCEPT_CATALOG.filter((c) => c.keywords.some((kw) => queryHas(qTokens, kw)) || (hints.conceptIds || []).includes(c.id));
  const mentioned = OFFICIAL_PPC_DISCIPLINES.filter((d) => disciplineMentioned(d, qTokens, qNorm));

  // 2) receita de projeto (precisa de intenção de construir/estudar para algo)
  // Só ativa trilha de projeto quando há verbo de construção ("criar", "desenvolver"...)
  const projectIntent = /\b(criar|desenvolver|construir|montar|implementar|fazer|elaborar|produzir|projetar|programar|estudar para|aprender para)\b/.test(qNorm);
  const recipe =
    RECIPE_CATALOG.find((r) => r.id === hints.recipeId) ||
    (projectIntent ? RECIPE_CATALOG.find((r) => r.keywords.some((kw) => queryHas(qTokens, kw)) && !(r.id === 'webapp' && concepts.length > 0 && mentioned.length > 0)) : undefined);

  // 3) conjunto de disciplinas relevantes (apenas códigos existentes na matriz)
  const codeSet = new Set<string>();
  concepts.forEach((c) => c.codes.forEach((code) => codeSet.add(code)));
  mentioned.forEach((d) => codeSet.add(d.code));
  let discs = Array.from(codeSet).map((c) => BY_CODE.get(c)).filter((d): d is PPCDiscipline => Boolean(d));

  let courseNote = '';
  if (course && discs.length) {
    const filtered = discs.filter((d) => d.course === course);
    if (filtered.length) discs = filtered;
    else courseNote = `ℹ️ Não há disciplina relacionada no curso de ${course === 'IA' ? 'Inteligência Artificial' : 'Gestão ESG'}; as disciplinas acima pertencem ao outro curso da unidade.`;
  }
  if (semester && discs.length) {
    const filtered = discs.filter((d) => d.semester === semester);
    if (filtered.length) discs = filtered;
    else courseNote = (courseNote ? courseNote + '\n' : '') + `ℹ️ Nenhuma das disciplinas relacionadas é ministrada no ${semester}º semestre; mostrando todos os semestres.`;
  }
  discs.sort((a, b) => a.course.localeCompare(b.course) || a.semester - b.semester || a.code.localeCompare(b.code));

  const ctx: MaterialContext = {
    concepts,
    discs,
    extraKeywords: recipe ? recipe.materialKeywords : [],
    qTokens,
    useGenericTokens: concepts.length === 0 && mentioned.length === 0,
    course,
    semester,
  };
  const found = retrieveMaterials(corpus, ctx, limit);

  // 4) RESPOSTA: trilha de projeto
  if (recipe) {
    const steps = recipe.steps
      .map((s) => ({ need: s.need, discs: s.codes.map((c) => BY_CODE.get(c)).filter((d): d is PPCDiscipline => Boolean(d)) }))
      .filter((s) => s.discs.length > 0);
    const header = `**Para criar ${recipe.label}, esta é a trilha de estudo montada a partir da matriz curricular real da FATEC Rio Claro:**`;
    const stepsText = steps
      .map((s, i) => `• **Passo ${i + 1} — ${s.need}:**\n` + s.discs.map((d) => `  - ${fmtDiscipline(d)}`).join('\n'))
      .join('\n\n');
    const usedCodes = new Set(steps.flatMap((s) => s.discs.map((d) => d.code)));
    ctx.discs = Array.from(usedCodes).map((c) => BY_CODE.get(c)!).filter(Boolean);
    const recipeFound = retrieveMaterials(corpus, { ...ctx, concepts: [], discs: [], useGenericTokens: false }, limit);
    const mat = materialsSection(recipeFound, 'este tipo de projeto');
    const lessonCount = recipeFound.filter((f) => !isWork(f.doc.materialType)).length;
    const externals = recipe.external.length ? ` Para uma aplicação real também será necessário estudo complementar fora da grade: ${listJoin(recipe.external)}.` : '';
    const aviso =
      `⚠️ **Aviso sobre a Suficiência do Material & Leituras Complementares:** as disciplinas acima foram indicadas **pelo nome e pela necessidade do projeto**; o portal não possui as ementas detalhadas. ` +
      (lessonCount > 0 ? `Há ${lessonCount} material(is) de estudo cadastrado(s) relacionado(s), listado(s) acima.` : 'Hoje não há material de aula cadastrado no Repositório especificamente para este tipo de projeto, então o conteúdo deve ser obtido com os professores das disciplinas.') +
      externals;
    return {
      answer: [header, stepsText, mat.text, aviso].join('\n\n'),
      sources: mat.sources,
      grounded: true,
      kind: 'RECIPE',
    };
  }

  // 4b) RESPOSTA: a pergunta cita pelo nome um material/projeto real cadastrado
  const named = namedMaterials(corpus, qTokens, course);
  if (named.length > 0) {
    const namedFound = named.slice(0, limit).map((doc) => ({ doc, score: 8 }));
    const mat = materialsSection(namedFound, 'o assunto consultado', false);
    const parts = [`**Encontrei ${named.length === 1 ? 'o material cadastrado' : named.length + ' materiais cadastrados'} no Repositório/Vitrine que corresponde${named.length === 1 ? '' : 'm'} à sua pergunta:**`, mat.text];
    if (discs.length) {
      parts.push('• **Disciplinas da matriz curricular relacionadas ao tema:**\n' + discs.map((d) => `  - ${fmtDiscipline(d)}`).join('\n'));
    }
    parts.push('ℹ️ Exibo apenas o que está cadastrado: nome, disciplina, descrição e links informados pelos autores. Para detalhes de funcionamento, abra o material pelo botão abaixo.');
    return { answer: parts.join('\n\n'), sources: mat.sources, grounded: true, kind: 'MATERIALS' };
  }

  // 5) RESPOSTA: disciplinas da matriz (+ materiais reais)
  const lead = glossaryLead(qNorm, qTokens);
  if (discs.length === 0 && lead) {
    return { answer: [lead, 'Pergunte, por exemplo: "Quais disciplinas de Gestão ESG falam sobre compliance?" para ver as disciplinas e materiais cadastrados.'].join('\n\n'), sources: [], grounded: true, kind: 'CURRICULUM' };
  }
  if (discs.length > 0) {
    const label = concepts.length ? listJoin(concepts.map((c) => c.label)) : listJoin(discs.map((d) => d.name));
    const yesNo = /^(ha|tem|temos|existe|existem|aprendemos|ensinam|ensina|possui|possuem|vemos|estudamos|teremos|tinha)\b/.test(qNorm);
    const direct = `**${yesNo ? 'Sim. ' : ''}A matriz curricular oficial (PPC) da FATEC Rio Claro possui ${discs.length} disciplina${discs.length > 1 ? 's' : ''} relacionada${discs.length > 1 ? 's' : ''} a ${label}:**`;
    const list = discs.map((d) => `  - ${fmtDiscipline(d)}`).join('\n');
    const notes = [concepts.map((c) => c.note).filter(Boolean).join('\n'), courseNote].filter(Boolean);
    const mat = materialsSection(found, label);
    const parts = [...(lead ? [lead] : []), direct, '• **Disciplinas (matéria e código):**\n' + list, ...notes, mat.text, SYLLABUS_NOTE];
    return { answer: parts.join('\n\n'), sources: mat.sources, grounded: true, kind: 'CURRICULUM' };
  }

  // 6) RESPOSTA: apenas materiais reais correspondentes
  if (found.length > 0) {
    const mat = materialsSection(found, 'o assunto consultado');
    const direct = `**Encontrei ${found.length} material(is) cadastrado(s) no Repositório/Vitrine relacionado(s) à sua pergunta:**`;
    return { answer: [direct, mat.text].join('\n\n'), sources: mat.sources, grounded: true, kind: 'MATERIALS' };
  }

  // 7) RESPOSTA: listagem da grade por curso/semestre
  const listing = /\b(disciplina|disciplinas|materia|materias|grade|matriz|ementa|semestre)\b/.test(qNorm) && (course || semester);
  if (listing) {
    let list = OFFICIAL_PPC_DISCIPLINES.filter((d) => (!course || d.course === course) && (!semester || d.semester === semester));
    if (list.length) {
      list = [...list].sort((a, b) => a.course.localeCompare(b.course) || a.semester - b.semester || a.code.localeCompare(b.code));
      const where = `${course ? (course === 'IA' ? 'Inteligência Artificial' : 'Gestão ESG') : 'os cursos da unidade'}${semester ? `, ${semester}º semestre` : ''}`;
      return {
        answer: [`**Disciplinas da matriz curricular oficial (PPC) — ${where}:**`, list.map((d) => `  - ${fmtDiscipline(d)}`).join('\n'), SYLLABUS_NOTE].join('\n\n'),
        sources: [],
        grounded: true,
        kind: 'LISTING',
      };
    }
  }

  return { answer: notUnderstoodAnswer(), sources: [], grounded: false, kind: 'NOT_UNDERSTOOD' };
}
