// ====================================================================
// MATRIZ CURRICULAR OFICIAL (PPC) — FATEC RIO CLARO (IA e Gestão ESG)
// FONTE ÚNICA DA VERDADE: usada pela tela do Repositório e pelo Motor RAG.
// O assistente de IA só pode citar disciplinas que existam nesta lista.
// ====================================================================

import type { CourseType } from './types';

// Componente Curricular Oficial da FATEC Rio Claro (PPC)
export interface PPCDiscipline {
  code: string;
  name: string;
  course: CourseType;
  semester: number; // 1 a 4, ou 5 para TCC / Estágio
  hours?: number;
  mode?: 'Presencial' | 'On-line';
}

// Matriz Curricular Completa dos Cursos da FATEC Rio Claro (IA e Gestão ESG)
export const OFFICIAL_PPC_DISCIPLINES: PPCDiscipline[] = [
  // ==========================================
  // CST EM INTELIGÊNCIA ARTIFICIAL (38 componentes)
  // ==========================================
  // 1º Semestre IA (9 disciplinas)
  { code: 'EIA-001', name: 'Projeto 1 – Gestão de Projetos Ágeis', course: 'IA', semester: 1, hours: 120, mode: 'Presencial' },
  { code: 'EIA-002', name: 'Projeto 1 – Execução de Projetos', course: 'IA', semester: 1, hours: 120, mode: 'Presencial' },
  { code: 'ILP-113', name: 'Linguagem de Programação I', course: 'IA', semester: 1, hours: 80, mode: 'Presencial' },
  { code: 'CEE-070', name: 'Empreendedorismo e Inovação', course: 'IA', semester: 1, hours: 40, mode: 'Presencial' },
  { code: 'IIA-020', name: 'Introdução à Inteligência Artificial', course: 'IA', semester: 1, hours: 80, mode: 'Presencial' },
  { code: 'IBD-040', name: 'Introdução à Bancos de Dados', course: 'IA', semester: 1, hours: 40, mode: 'On-line' },
  { code: 'GPJ-022', name: 'Gestão de Projetos', course: 'IA', semester: 1, hours: 40, mode: 'On-line' },
  { code: 'ISW-052', name: 'Introdução à Computação em Nuvem', course: 'IA', semester: 1, hours: 40, mode: 'On-line' },
  { code: 'ISW-053', name: 'Introdução à Internet das Coisas', course: 'IA', semester: 1, hours: 40, mode: 'Presencial' },

  // 2º Semestre IA (9 disciplinas)
  { code: 'EIA-003', name: 'Projeto 2 – Gestão de Projetos Ágeis', course: 'IA', semester: 2, hours: 120, mode: 'Presencial' },
  { code: 'EIA-004', name: 'Projeto 2 – Execução de Projetos', course: 'IA', semester: 2, hours: 120, mode: 'Presencial' },
  { code: 'IBD-041', name: 'Banco de Dados Não Relacional', course: 'IA', semester: 2, hours: 40, mode: 'On-line' },
  { code: 'ILP-114', name: 'Linguagens de Programação II', course: 'IA', semester: 2, hours: 40, mode: 'Presencial' },
  { code: 'IED-020', name: 'Estrutura de Dados', course: 'IA', semester: 2, hours: 80, mode: 'Presencial' },
  { code: 'IED-021', name: 'Mineração de Dados', course: 'IA', semester: 2, hours: 80, mode: 'Presencial' },
  { code: 'IRC-035', name: 'Redes de Computadores', course: 'IA', semester: 2, hours: 40, mode: 'On-line' },
  { code: 'ILP-115', name: 'Linguagem e seus Códigos', course: 'IA', semester: 2, hours: 40, mode: 'On-line' },
  { code: 'MAT-052', name: 'Matemática', course: 'IA', semester: 2, hours: 40, mode: 'Presencial' },

  // 3º Semestre IA (9 disciplinas)
  { code: 'EIA-005', name: 'Projeto 3 – Gestão de Projetos Ágeis', course: 'IA', semester: 3, hours: 120, mode: 'Presencial' },
  { code: 'EIA-006', name: 'Projeto 3 – Execução de Projetos', course: 'IA', semester: 3, hours: 120, mode: 'Presencial' },
  { code: 'EST-069', name: 'Estatística', course: 'IA', semester: 3, hours: 80, mode: 'Presencial' },
  { code: 'MAQ-026', name: 'Aprendizado de Máquina I', course: 'IA', semester: 3, hours: 80, mode: 'Presencial' },
  { code: 'IIA-021', name: 'Inteligência Computacional', course: 'IA', semester: 3, hours: 40, mode: 'On-line' },
  { code: 'ING-297', name: 'Inglês I', course: 'IA', semester: 3, hours: 40, mode: 'Presencial' },
  { code: 'MAG-020', name: 'Álgebra Linear', course: 'IA', semester: 3, hours: 40, mode: 'Presencial' },
  { code: 'HIA-001', name: 'Ética na Inteligência Artificial', course: 'IA', semester: 3, hours: 40, mode: 'On-line' },
  { code: 'BDN-009', name: 'Big Data e Inteligência Artificial', course: 'IA', semester: 3, hours: 40, mode: 'On-line' },

  // 4º Semestre IA (9 disciplinas)
  { code: 'EIA-007', name: 'Projeto 4 – Gestão de Projetos Ágeis', course: 'IA', semester: 4, hours: 120, mode: 'Presencial' },
  { code: 'EIA-008', name: 'Projeto 4 – Execução de Projetos', course: 'IA', semester: 4, hours: 120, mode: 'Presencial' },
  { code: 'MAQ-027', name: 'Aprendizado de Máquina II', course: 'IA', semester: 4, hours: 80, mode: 'Presencial' },
  { code: 'IIA-022', name: 'Análise Preditiva', course: 'IA', semester: 4, hours: 40, mode: 'Presencial' },
  { code: 'IRC-036', name: 'Redes Neurais', course: 'IA', semester: 4, hours: 80, mode: 'Presencial' },
  { code: 'ING-298', name: 'Inglês II', course: 'IA', semester: 4, hours: 40, mode: 'Presencial' },
  { code: 'COM-084', name: 'Ciência Cognitiva', course: 'IA', semester: 4, hours: 40, mode: 'On-line' },
  { code: 'IIA-023', name: 'Visão Computacional', course: 'IA', semester: 4, hours: 40, mode: 'On-line' },
  { code: 'ISG-030', name: 'Segurança da Informação', course: 'IA', semester: 4, hours: 40, mode: 'On-line' },

  // Complementares IA (2 componentes)
  { code: 'TIA-001', name: 'Trabalho de Graduação (TCC IA)', course: 'IA', semester: 4, hours: 160, mode: 'Presencial' },
  { code: 'EIA-100', name: 'Estágio Curricular Supervisionado (IA)', course: 'IA', semester: 4, hours: 240, mode: 'Presencial' },

  // ==========================================
  // CST EM GESTÃO DA SUSTENTABILIDADE & ESG (29 componentes)
  // ==========================================
  // 1º Semestre ESG (7 disciplinas)
  { code: 'ESG-W1A', name: 'Workshop de Práticas: Projetos Ambiental 1A', course: 'ESG', semester: 1, hours: 80, mode: 'Presencial' },
  { code: 'ESG-W1B', name: 'Workshop de Práticas: Projetos Social 1B', course: 'ESG', semester: 1, hours: 100, mode: 'Presencial' },
  { code: 'ESG-W1C', name: 'Workshop de Práticas: Projetos Governança 1C', course: 'ESG', semester: 1, hours: 100, mode: 'Presencial' },
  { code: 'ESG-LEG', name: 'Aspectos Legais em ESG', course: 'ESG', semester: 1, hours: 80, mode: 'On-line' },
  { code: 'ESG-INO', name: 'Gestão da Inovação e Empreendedorismo', course: 'ESG', semester: 1, hours: 40, mode: 'Presencial' },
  { code: 'ESG-GPJ', name: 'Gestão de Projetos', course: 'ESG', semester: 1, hours: 40, mode: 'Presencial' },
  { code: 'ESG-COM', name: 'Leitura Crítica e Escrita Profissional', course: 'ESG', semester: 1, hours: 40, mode: 'On-line' },

  // 2º Semestre ESG (6 disciplinas)
  { code: 'ESG-P2A', name: 'Práticas Ambientais 2A', course: 'ESG', semester: 2, hours: 280, mode: 'Presencial' },
  { code: 'ESG-AMB', name: 'Gestão Ambiental', course: 'ESG', semester: 2, hours: 40, mode: 'Presencial' },
  { code: 'ESG-RSK', name: 'Gestão de Riscos Ambientais', course: 'ESG', semester: 2, hours: 40, mode: 'Presencial' },
  { code: 'ESG-RES', name: 'Gestão de Resíduos', course: 'ESG', semester: 2, hours: 40, mode: 'Presencial' },
  { code: 'ESG-CIR', name: 'Economia Circular e Oportunidades Limpas', course: 'ESG', semester: 2, hours: 40, mode: 'On-line' },
  { code: 'ESG-ESP', name: 'Espanhol para ESG – Aplicações em Projetos', course: 'ESG', semester: 2, hours: 40, mode: 'On-line' },

  // 3º Semestre ESG (7 disciplinas)
  { code: 'ESG-D3A', name: 'Gestão da Diversidade 3A', course: 'ESG', semester: 3, hours: 140, mode: 'Presencial' },
  { code: 'ESG-I3B', name: 'Gestão da Inovação para Cadeias Globais 3B', course: 'ESG', semester: 3, hours: 140, mode: 'Presencial' },
  { code: 'ESG-DIV', name: 'Gestão da Diversidade (Inclusão e Desenvolvimento Social)', course: 'ESG', semester: 3, hours: 40, mode: 'Presencial' },
  { code: 'ESG-PSI', name: 'Psicologia Organizacional (Gestão e Autogestão)', course: 'ESG', semester: 3, hours: 40, mode: 'Presencial' },
  { code: 'ESG-CAD', name: 'Cadeias Globais de Valor', course: 'ESG', semester: 3, hours: 40, mode: 'On-line' },
  { code: 'ESG-DAT', name: 'Análise de Dados para ESG', course: 'ESG', semester: 3, hours: 40, mode: 'Presencial' },
  { code: 'ESG-IN1', name: 'Inglês 1 para ESG – Fundamentos', course: 'ESG', semester: 3, hours: 40, mode: 'On-line' },

  // 4º Semestre ESG (7 disciplinas)
  { code: 'ESG-R4A', name: 'Reporting 4A', course: 'ESG', semester: 4, hours: 140, mode: 'Presencial' },
  { code: 'ESG-C4B', name: 'Compliance 4B', course: 'ESG', semester: 4, hours: 140, mode: 'Presencial' },
  { code: 'ESG-REL', name: 'Relações Institucionais', course: 'ESG', semester: 4, hours: 40, mode: 'On-line' },
  { code: 'ESG-CMP', name: 'Compliance', course: 'ESG', semester: 4, hours: 40, mode: 'On-line' },
  { code: 'ESG-CAP', name: 'Mercado de Capitais', course: 'ESG', semester: 4, hours: 40, mode: 'Presencial' },
  { code: 'ESG-FIN', name: 'Finanças Sustentáveis', course: 'ESG', semester: 4, hours: 40, mode: 'Presencial' },
  { code: 'ESG-IN2', name: 'Inglês 2 para ESG – Aplicações em Projetos', course: 'ESG', semester: 4, hours: 40, mode: 'On-line' },

  // Componentes Complementares ESG (2 componentes)
  { code: 'ESG-TCC', name: 'Trabalho de Graduação (TCC ESG)', course: 'ESG', semester: 4, hours: 160, mode: 'Presencial' },
  { code: 'ESG-EST', name: 'Estágio Curricular Supervisionado (ESG)', course: 'ESG', semester: 4, hours: 160, mode: 'Presencial' },
];
