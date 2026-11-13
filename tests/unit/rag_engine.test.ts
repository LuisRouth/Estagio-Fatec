// ====================================================================
// TESTES DO MOTOR RAG "ZERO ALUCINAÇÃO" (src/lib/rag-engine.ts)
// Cobrem os erros reais reportados em produção: construção civil, inglês,
// banco de dados, matemática, perguntas sem sentido e cards falsos.
// ====================================================================

import { describe, it, expect } from 'vitest';
import { queryAcademicRAG } from '@/lib/gemini';
import { OFFICIAL_PPC_DISCIPLINES } from '@/lib/curriculum';
import { CONCEPT_CATALOG, RECIPE_CATALOG, detectOutOfScopeDomain, buildCorpus } from '@/lib/rag-engine';
import type { AcademicMaterial } from '@/lib/types';

function mat(p: Partial<AcademicMaterial> & { id: string; title: string; subject: string }): AcademicMaterial {
  return {
    description: '',
    course: 'IA',
    semester: 1,
    author_id: 'u1',
    author_name: 'Docente',
    material_type: 'APOSTILA',
    file_url: `/materials/${p.id}.pdf`,
    tags: '',
    download_count: 0,
    is_approved: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...p,
  } as AcademicMaterial;
}

// Espelha o tipo de material realmente cadastrado em produção
const REAL_LIKE: AcademicMaterial[] = [
  mat({
    id: 'dwh', title: 'DWH Saúde RC — Data Warehouse e Analytics em Saúde Coletiva', subject: 'Bancos de Dados Analíticos & Data Warehousing',
    semester: 3, material_type: 'PROJETO', file_url: 'https://github.com/MateusIoga/DWH-Saude-RC',
    description: 'Data Warehouse voltado à gestão de dados da saúde pública de Rio Claro utilizando cargas de dados do DATASUS.',
    tags: 'Saude, Data Warehouse, DATASUS, ETL, TypeScript, PostgreSQL',
  }),
  mat({
    id: 'sentinela', title: 'Sentinela Verde — Monitoramento Ambiental e Qualidade do Ar', subject: 'Inteligência Artificial Aplicada ao Meio Ambiente & ESG',
    semester: 2, material_type: 'PROJETO', file_url: 'https://github.com/nicolassilv04/SentinelaAI',
    description: 'Sistema de telemetria ambiental com ESP32, MQTT e árvores de decisão.', tags: 'ESG, Qualidade do Ar, ESP32, MQTT, Machine Learning, Python',
  }),
  mat({
    id: 'foodyze', title: 'FoodYze — Monitoramento Inteligente de Geladeiras & Despensa', subject: 'Visão Computacional & Internet das Coisas',
    semester: 2, material_type: 'PROJETO', file_url: 'https://github.com/FoodYze/FoodYze',
    description: 'Aplicativo de monitoramento de estoque de mantimentos com IA.', tags: 'Visao Computacional, IoT, Python, Despensa Inteligente, Mobile',
  }),
  mat({
    id: 'agil4', title: 'Pacote Completo de Aulas e Documentação – Projetos Ágeis IV (ZIP)', subject: 'Projeto 4 – Gestão de Projetos Ágeis',
    semester: 4, file_url: '/materials/agil4.zip', description: 'Arquivos de apoio para condução de projetos complexos, métricas de fluxo e roadmaps.', tags: 'zip, aulas, gpa-iv, roadmaps, kanban',
  }),
];

const ask = (question: string, materials = REAL_LIKE, extra: Record<string, unknown> = {}) =>
  queryAcademicRAG({ question, ...extra } as any, materials);

describe('Integridade das fontes de verdade do motor RAG', () => {
  const codes = new Set(OFFICIAL_PPC_DISCIPLINES.map((d) => d.code));

  it('todo código de disciplina usado em conceitos existe na matriz curricular real', () => {
    for (const c of CONCEPT_CATALOG) for (const code of c.codes) expect(codes.has(code), `${c.id} -> ${code}`).toBe(true);
  });

  it('todo código de disciplina usado em trilhas de projeto existe na matriz curricular real', () => {
    for (const r of RECIPE_CATALOG) for (const s of r.steps) for (const code of s.codes) expect(codes.has(code), `${r.id} -> ${code}`).toBe(true);
  });

  it('o corpus contém apenas materiais reais aprovados (sem documentos fictícios embutidos)', () => {
    expect(buildCorpus([])).toHaveLength(0);
    const unapproved = [mat({ id: 'x', title: 'Rascunho', subject: 'Teste', is_approved: false })];
    expect(buildCorpus(unapproved)).toHaveLength(0);
  });

  it('não existem mais códigos inventados (ICD-010, IMD-010, IAL-010, IPE-010) na matriz', () => {
    for (const bad of ['ICD-010', 'IMD-010', 'IAL-010', 'IPE-010']) expect(codes.has(bad)).toBe(false);
  });
});

describe('Escopo institucional (somente IA e Gestão ESG)', () => {
  it('construção civil: nega, explica os cursos da unidade e não mostra cards', async () => {
    const r = await ask('no curso temos material sobre construção civil');
    expect(r.sources).toHaveLength(0);
    expect(r.answer).toContain('Inteligência Artificial');
    expect(r.answer).toContain('Gestão ESG');
    expect(r.answer).toContain('Construção Civil');
  });

  it('medicina/odontologia: fora de escopo, sem cards', async () => {
    const r = await ask('temos aulas de odontologia e medicina?');
    expect(r.sources).toHaveLength(0);
    expect(r.answer).toContain('exclusivamente');
  });

  it('"modalidade" não é confundida com "moda" (falso positivo corrigido)', () => {
    expect(detectOutOfScopeDomain('qual a modalidade da disciplina de Redes Neurais').isOutOfScope).toBe(false);
  });

  it('projeto DWH Saúde não é tratado como curso de saúde', () => {
    expect(detectOutOfScopeDomain('como funciona o projeto DWH Saúde RC').isOutOfScope).toBe(false);
  });
});

describe('Respostas ancoradas na matriz curricular real', () => {
  it('Inglês (com erro de digitação "cursoo"): cita ING-297/298 e ESG-IN1/IN2 e não inventa ementa', async () => {
    const r = await ask('Há materia de ingles no cursoo que aprendemos na materia de inglês');
    for (const code of ['ING-297', 'ING-298', 'ESG-IN1', 'ESG-IN2']) expect(r.answer).toContain(code);
    expect(r.answer).toContain('Sim.');
    expect(r.answer).not.toMatch(/NumPy|PyTorch|papers|abstracts|GHG Protocol/i);
    expect(r.answer).toContain('não há apostilas');
    expect(r.sources).toHaveLength(0);
  });

  it('Inglês restrito ao curso de IA: não mistura disciplinas de ESG', async () => {
    const r = await ask('Há disciplina de inglês no curso de IA?');
    expect(r.answer).toContain('ING-297');
    expect(r.answer).not.toContain('ESG-IN1');
  });

  it('Banco de dados: indica IBD-040/041 e mostra o projeto real DWH (sem duplicar nem inventar)', async () => {
    const r = await ask('onde estudar material sobre banco de dados');
    expect(r.answer).toContain('IBD-040');
    expect(r.answer).toContain('IBD-041');
    expect(r.answer).toContain('DWH Saúde RC');
    expect(r.sources.map((s) => s.id)).toEqual(['dwh']);
    expect(r.answer).not.toContain('BDN-009'); // Big Data só aparece quando a pergunta é sobre Big Data/DWH
  });

  it('Matemática: usa Matemática/Álgebra/Estatística reais e esclarece que não existe "Cálculo" na matriz', async () => {
    const r = await ask('onde estudar matemática');
    for (const code of ['MAT-052', 'MAG-020', 'EST-069']) expect(r.answer).toContain(code);
    expect(r.answer).toContain('não possui uma disciplina com o nome "Cálculo"');
    expect(r.answer).not.toMatch(/ICD-010|IPE-010/);
  });

  it('Programação no 1º semestre: restringe a ILP-113 (sem inventar o conteúdo)', async () => {
    const r = await ask('O que aprendemos na disciplina de Linguagem de Programação I no 1º semestre de IA?');
    expect(r.answer).toContain('ILP-113');
    expect(r.answer).not.toContain('ILP-114');
    expect(r.answer).toContain('ementa detalhada');
  });

  it('listagem de semestre usa apenas a matriz real', async () => {
    const r = await ask('Quais disciplinas existem no 3º semestre de IA?');
    expect(r.answer).toContain('MAQ-026');
    expect(r.answer).toContain('ING-297');
    expect(r.answer).not.toContain('MAQ-027');
    expect(r.sources).toHaveLength(0);
  });
});

describe('Cruzamento de informações (trilhas de estudo)', () => {
  it('rotas de entrega: monta trilha com disciplinas reais e avisa leituras complementares', async () => {
    const r = await ask('Para criar uma aplicação de rotas de entrega de mercadorias, quais matérias e materiais devo estudar?');
    for (const code of ['ILP-113', 'IED-020', 'IIA-021', 'MAQ-026']) expect(r.answer).toContain(code);
    expect(r.answer).toContain('Aviso sobre a Suficiência');
    expect(r.answer).toMatch(/OR-Tools|OSRM/);
    // não existe material de rotas cadastrado: não pode inventar cards
    expect(r.sources).toHaveLength(0);
  });

  it('chatbot/PLN: avisa que a matriz não tem disciplina específica de PLN', async () => {
    const r = await ask('quero criar um chatbot, o que devo estudar?');
    expect(r.answer).toContain('MAQ-026');
    expect(r.answer).toMatch(/não possui disciplina específica de Processamento de Linguagem Natural/);
  });
});

describe('Honestidade quando não há resposta', () => {
  it.each([
    'como fazer um bolo de chocolate',
    'qual o preço da passagem de ônibus intermunicipal',
    'como consertar uma geladeira quebrada',
    'asdfgh qwerty',
  ])('"%s" => admite que não entendeu, dá exemplos e não exibe cards', async (q) => {
    const r = await ask(q);
    expect(r.sources).toHaveLength(0);
    expect(r.answer).toContain('Não compreendi');
    expect(r.answer).toContain('refaça a pergunta');
    expect(r.answer).toContain('Exemplos');
  });

  it('pergunta vazia não gera resposta inventada', async () => {
    const r = await ask('   ');
    expect(r.sources).toHaveLength(0);
  });

  it('busca por nome de projeto real retorna somente esse material', async () => {
    const r = await ask('FoodYze');
    expect(r.sources.map((s) => s.id)).toEqual(['foodyze']);
  });

  it('pergunta sobre projeto citado pelo nome começa pelo material real (não por disciplina genérica)', async () => {
    const r = await ask('Como funciona o projeto DWH Saúde RC na Vitrine de Projetos?');
    expect(r.answer.startsWith('**Encontrei o material cadastrado')).toBe(true);
    expect(r.sources.map((s) => s.id)).toEqual(['dwh']);
  });

  it('ESG: traz a definição geral rotulada como tal e as disciplinas reais mais próximas', async () => {
    const r = await ask('O que significa a sigla ESG e como são calculados os escopos de pegada de carbono?');
    expect(r.answer).toContain('Environmental, Social and Governance');
    expect(r.answer).toContain('não extraído de material do acervo');
    expect(r.answer).toContain('ESG-AMB');
    expect(r.sources).toHaveLength(0);
  });

  it('sem materiais cadastrados, nunca exibe cards (mesmo para temas da grade)', async () => {
    const r = await ask('onde estudar banco de dados', []);
    expect(r.sources).toHaveLength(0);
    expect(r.answer).toContain('IBD-040');
    expect(r.answer).toContain('não há apostilas');
  });
});
