// ====================================================================
// TESTES UNITÁRIOS DO MÓDULO GOOGLE GEMINI SDK, VISÃO OCR PIX & MOTOR RAG
// Responsável: Guilherme (DevOps, IA & QA)
// ====================================================================

import { describe, it, expect } from 'vitest';
import {
  getGeminiConfig,
  testGeminiConnectivity,
  validatePixReceiptWithGemini,
  analyzePixReceiptPipeline,
  summarizeAcademicMaterial,
  queryAcademicRAG,
  buildAcademicKnowledgeCorpus,
} from '@/lib/gemini';

describe('Módulo de Inteligência Artificial — Google Gemini SDK, OCR Visão & RAG (src/lib/gemini.ts)', () => {
  it('deve carregar a configuração padrão do modelo Gemini', () => {
    const config = getGeminiConfig();
    expect(config.model).toMatch(/^gemini-/);
    expect(typeof config.fallbackEnabled).toBe('boolean');
  });

  it('deve validar a conectividade com o serviço Gemini (Live ou Mock Fallback)', async () => {
    const status = await testGeminiConnectivity();
    expect(status.connected).toBe(true);
    expect(['LIVE_API', 'MOCK_FALLBACK']).toContain(status.mode);
    expect(status.latencyMs).toBeGreaterThan(0);
  });

  it('deve aprovar comprovante Pix válido quando o valor extraído coincide com o esperado', async () => {
    const receipt =
      'COMPROVANTE PIX - Valor: R$ 5,50 - Destinatário: CA FATEC RIO CLARO - ID: E12345678202611021200abcdefghijk';
    const result = await validatePixReceiptWithGemini(receipt, 5.5);
    expect(result.isValidReceipt).toBe(true);
    expect(result.amountMatches).toBe(true);
    expect(result.status).toBe('APROVADO_IA');
  });

  it('deve processar comprovante multimodal em Base64 no pipeline de Visão Computacional', async () => {
    const simulatedImagePayload = Buffer.from(
      'COMPROVANTE DE PAGAMENTO PIX - Recebedor: FATEC RIO CLARO CA - Valor: R$ 8,90 - ID: E00038166202611062000abc12345678',
      'utf8'
    ).toString('base64');

    const visionResult = await analyzePixReceiptPipeline({
      imageBase64: `data:image/png;base64,${simulatedImagePayload}`,
      expectedAmount: 8.9,
    });

    expect(visionResult.imageAnalyzed).toBe(true);
    expect(visionResult.ocrMethod).toBe('GEMINI_VISION_MULTIMODAL');
    expect(visionResult.extractedAmount).toBe(8.9);
    expect(visionResult.amountMatches).toBe(true);
    expect(visionResult.status).toBe('APROVADO_IA');
  });

  it('deve sinalizar DIVERGENTE quando o valor do comprovante difere do total da compra', async () => {
    const receipt = 'COMPROVANTE DE PAGAMENTO PIX - Valor pago: R$ 4,50';
    const result = await validatePixReceiptWithGemini(receipt, 10.0);
    expect(result.amountMatches).toBe(false);
    expect(result.status).toBe('DIVERGENTE');
  });

  it('deve encaminhar para revisão do CA quando o comprovante está vazio ou ilegível', async () => {
    const result = await validatePixReceiptWithGemini('', 6.0);
    expect(result.isValidReceipt).toBe(false);
    expect(result.status).toBe('REQUER_REVISAO_CA');
  });

  it('deve gerar resumo contextualizado para materiais dos cursos de IA e Gestão ESG', async () => {
    const iaSummary = await summarizeAcademicMaterial(
      'Redes Neurais Convolucionais',
      'Arquiteturas de visão computacional aplicadas a OCR.',
      'IA'
    );
    expect(iaSummary.summary).toContain('IA');
    expect(iaSummary.tags.length).toBeGreaterThan(0);

    const esgSummary = await summarizeAcademicMaterial(
      'Relatórios de Sustentabilidade GRI',
      'Métricas ambientais, sociais e de governança corporativa.',
      'ESG'
    );
    expect(esgSummary.summary).toContain('ESG');
  });

  it('deve responder dúvidas acadêmicas via motor RAG com citação dos PDFs do repositório', async () => {
    const corpus = buildAcademicKnowledgeCorpus();
    expect(corpus.length).toBeGreaterThanOrEqual(5);

    const ragIA = await queryAcademicRAG({
      question: 'O que aprendemos em Python no 1º semestre de IA?',
      course: 'IA',
      semester: 1,
    });
    expect(ragIA.sources.length).toBeGreaterThan(0);
    expect(ragIA.sources[0].course).toBe('IA');
    expect(ragIA.answer.toLowerCase()).toContain('python');

    const ragESG = await queryAcademicRAG({
      question: 'Como funciona o cálculo de pegada de carbono e relatórios de sustentabilidade ESG?',
      course: 'ESG',
    });
    expect(ragESG.sources.length).toBeGreaterThan(0);
    expect(ragESG.sources[0].course).toBe('ESG');
    expect(ragESG.answer.toLowerCase()).toContain('carbono');
  });

  it('deve identificar consultas fora de escopo (Construção Civil) e responder com fidelidade institucional sem cartões de fontes', async () => {
    const ragCivil = await queryAcademicRAG({
      question: 'no curso temos material sobre construção civil',
    });
    expect(ragCivil.sources).toHaveLength(0);
    expect(ragCivil.answer).toContain('Inteligência Artificial');
    expect(ragCivil.answer).toContain('Gestão ESG');
    expect(ragCivil.answer).toContain('Construção Civil');
  });

  it('deve identificar consultas fora de escopo de saúde/odontologia e retornar zero fontes', async () => {
    const ragMed = await queryAcademicRAG({
      question: 'onde encontro materiais sobre clínica médica e odontologia',
    });
    expect(ragMed.sources).toHaveLength(0);
    expect(ragMed.answer).toContain('Inteligência Artificial');
    expect(ragMed.answer).toContain('Gestão ESG');
  });

  it('deve informar incompreensão ou ausência de material com exemplos práticos quando a consulta for vaga/sem correspondência', async () => {
    const ragVaga = await queryAcademicRAG({
      question: 'qual o preco da passagem de onibus intermunicipal',
    });
    expect(ragVaga.sources).toHaveLength(0);
    expect(ragVaga.answer).toContain('Não compreendi sua dúvida acadêmica');
    expect(ragVaga.answer).toContain('Exemplos de perguntas que posso responder');
  });

  it('deve orientar sobre banco de dados citando matérias oficiais e o projeto DWH Saúde RC', async () => {
    const ragDb = await queryAcademicRAG({
      question: 'onde estudar material sobre banco de dados',
    });
    expect(ragDb.answer).toContain('IBD-040');
    expect(ragDb.answer).toContain('DWH Saúde RC');
    expect(ragDb.sources.length).toBeGreaterThan(0);
  });

  it('deve orientar sobre matemática citando disciplinas oficiais (Cálculo ICD-010) e informando a ausência de apostilas teóricas', async () => {
    const ragMath = await queryAcademicRAG({
      question: 'onde estudar matemática',
    });
    expect(ragMath.answer).toContain('ICD-010');
    expect(ragMath.answer).toContain('não há apostilas ou slides teóricos de Matemática');
  });
});
