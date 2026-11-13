const { queryAcademicRAG, detectOutOfScopeDomain } = require('../src/lib/gemini');

async function testRAGCases() {
  console.log('=== TESTES DE FIDELIDADE DO RAG E CONTROLE DE ESCOPO FATEC RIO CLARO ===\n');

  let passed = 0;
  let failed = 0;

  function assert(cond, name, details) {
    if (cond) {
      console.log(`✓ [PASSOU] ${name}`);
      passed++;
    } else {
      console.error(`✗ [FALHOU] ${name}`);
      if (details) console.error(`  Detalhes: ${details}`);
      failed++;
    }
  }

  // Caso 1: Pergunta do usuário sobre Construção Civil
  const q1 = 'no curso temos material sobre construção civil';
  const res1 = await queryAcademicRAG({ question: q1 });
  assert(
    res1.sources.length === 0,
    'Construção civil: sources deve ser estritamente vazio ([])',
    `sources.length = ${res1.sources.length}`
  );
  assert(
    res1.answer.includes('Inteligência Artificial') &&
    res1.answer.includes('Gestão ESG') &&
    res1.answer.includes('Construção Civil'),
    'Construção civil: resposta deve esclarecer cursos da FATEC RC e negar materiais sobre construção civil',
    res1.answer.slice(0, 200)
  );

  // Caso 2: Pergunta sobre Medicina/Saúde fora de escopo
  const q2 = 'temos aulas práticas de odontologia e medicina';
  const res2 = await queryAcademicRAG({ question: q2 });
  assert(
    res2.sources.length === 0,
    'Odontologia/Medicina: sources deve ser vazio ([])',
    `sources.length = ${res2.sources.length}`
  );
  assert(
    res2.answer.includes('Inteligência Artificial') && res2.answer.includes('Gestão ESG'),
    'Odontologia/Medicina: resposta deve citar exclusivamente IA e ESG',
    res2.answer.slice(0, 200)
  );

  // Caso 3: Pergunta confusa / termo inexistente
  const q3 = 'como consertar um aspirador de po modelo qwerty99';
  const res3 = await queryAcademicRAG({ question: q3 });
  assert(
    res3.sources.length === 0,
    'Termo sem correspondência: sources deve ser vazio ([])',
    `sources.length = ${res3.sources.length}`
  );
  assert(
    res3.answer.includes('Não compreendi sua dúvida acadêmica') &&
    res3.answer.includes('Exemplos de perguntas que posso responder'),
    'Termo sem correspondência: deve pedir reformulação e dar exemplos práticos',
    res3.answer.slice(0, 200)
  );

  // Caso 4: Pergunta canônica de Banco de Dados
  const q4 = 'onde estudar material sobre banco de dados';
  const res4 = await queryAcademicRAG({ question: q4 });
  assert(
    res4.sources.length > 0 && res4.sources.some(s => s.title.includes('DWH Saúde RC')),
    'Banco de Dados: deve indicar o projeto DWH Saúde RC',
    JSON.stringify(res4.sources.map(s => s.title))
  );
  assert(
    res4.answer.includes('IBD-040') && res4.answer.includes('IBD-041'),
    'Banco de Dados: deve citar as matérias da grade (IBD-040, IBD-041)',
    res4.answer.slice(0, 200)
  );

  // Caso 5: Pergunta canônica de Matemática
  const q5 = 'onde estudar matemática';
  const res5 = await queryAcademicRAG({ question: q5 });
  assert(
    res5.answer.includes('ICD-010') && res5.answer.includes('IAL-010'),
    'Matemática: deve citar Cálculo e Álgebra Linear com códigos',
    res5.answer.slice(0, 200)
  );
  assert(
    res5.answer.includes('não há apostilas ou slides teóricos de Matemática cadastrados no Repositório Acadêmico'),
    'Matemática: deve avisar com sinceridade a ausência de apostilas teóricas cadastradas pelos docentes',
    res5.answer.slice(0, 200)
  );

  // Caso 6: Pergunta de Linguagens de Programação
  const q6 = 'Aprendemos linguagem de programação no curso de IA?';
  const res6 = await queryAcademicRAG({ question: q6 });
  assert(
    res6.answer.includes('Python 3 e SQL') && res6.answer.includes('ILP-113'),
    'Linguagens de Programação: deve detalhar Python 3 e SQL por semestre',
    res6.answer.slice(0, 200)
  );

  // Caso 7: Pergunta de Rotas de Entrega
  const q7 = 'Para criar uma aplicação de rotas de entrega de mercadorias, quais matérias e materiais devo estudar?';
  const res7 = await queryAcademicRAG({ question: q7 });
  assert(
    res7.answer.includes('Dijkstra') && res7.answer.includes('Aviso sobre a Suficiência do Material & Leituras Complementares'),
    'Rotas de entrega: deve estruturar a trilha e avisar sobre APIs externas',
    res7.answer.slice(0, 200)
  );

  console.log(`\nTOTAL: ${passed} passaram, ${failed} falharam.`);
  if (failed > 0) {
    process.exit(1);
  }
}

testRAGCases().catch((err) => {
  console.error(err);
  process.exit(1);
});

