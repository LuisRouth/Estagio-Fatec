/**
 * SCRIPT DE IMPORTAÇÃO AUTOMATIZADA DE MATERIAIS DE AULA (IA - FATEC RIO CLARO)
 * Cadastra os 39 arquivos organizados nas pastas de matérias diretamente no Banco PostgreSQL
 * e copia os arquivos com nomes limpos e padronizados para public/uploads/materials/
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const TARGET_DIR = path.join(process.cwd(), 'public', 'uploads', 'materials');
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 39 Materiais Mapeados Rigorosamente para a Matriz Curricular Oficial (PPC) de IA
const MATERIALS_MANIFEST = [
  // 1. INTRODUÇÃO À INTELIGÊNCIA ARTIFICIAL (1º Semestre)
  {
    srcDir: 'introduçãoIA',
    srcFile: 'Aula 1 - Fatec.pdf',
    targetFile: 'ia_sem1_iia020_aula01_fundamentos.pdf',
    title: 'Aula 01 – Introdução à Inteligência Artificial e Fundamentos',
    description: 'Apresentação geral da disciplina de Introdução à IA, histórico da área, conceitos de computação cognitiva e escopo do curso na FATEC.',
    subject: 'Introdução à Inteligência Artificial',
    course: 'IA',
    semester: 1,
    material_type: 'SLIDE',
    tags: 'introducao, conceitos, fundamentos, ia, fati',
  },
  {
    srcDir: 'introduçãoIA',
    srcFile: 'slides.pdf',
    targetFile: 'ia_sem1_iia020_slides_gerais.pdf',
    title: 'Slides Gerais – Visão Geral de Inteligência Artificial',
    description: 'Conjunto de slides introdutórios abordando o panorama da inteligência artificial moderna, aplicações no mercado e desafios éticos.',
    subject: 'Introdução à Inteligência Artificial',
    course: 'IA',
    semester: 1,
    material_type: 'SLIDE',
    tags: 'slides, conceitos, ia, panorama',
  },
  {
    srcDir: 'introduçãoIA',
    srcFile: 'slides (1).pdf',
    targetFile: 'ia_sem1_iia020_agentes_inteligentes.pdf',
    title: 'Slides – Agentes Inteligentes e Ambientes (Módulo 1)',
    description: 'Conceituação de agentes inteligentes, ciclo de percepção-ação, ambientes determinísticos, estocásticos e agentes baseados em metas.',
    subject: 'Introdução à Inteligência Artificial',
    course: 'IA',
    semester: 1,
    material_type: 'SLIDE',
    tags: 'agentes, ambientes, percepcao-acao, ia',
  },
  {
    srcDir: 'introduçãoIA',
    srcFile: 'slides (2).pdf',
    targetFile: 'ia_sem1_iia020_resolucao_problemas_busca.pdf',
    title: 'Slides – Resolução de Problemas e Algoritmos de Busca (Módulo 2)',
    description: 'Modelagem de espaço de estados, algoritmos de busca cega (largura, profundidade) e introdução à busca heurística (A*).',
    subject: 'Introdução à Inteligência Artificial',
    course: 'IA',
    semester: 1,
    material_type: 'SLIDE',
    tags: 'busca, espaco-estados, heuristica, ia',
  },
  {
    srcDir: 'introduçãoIA',
    srcFile: 'slides (3).pdf',
    targetFile: 'ia_sem1_iia020_representacao_conhecimento.pdf',
    title: 'Slides – Representação de Conhecimento e Lógica Proposicional (Módulo 3)',
    description: 'Bases de conhecimento, inferência lógica, lógica de primeira ordem e modelagem de regras para tomada de decisão em IA.',
    subject: 'Introdução à Inteligência Artificial',
    course: 'IA',
    semester: 1,
    material_type: 'SLIDE',
    tags: 'logica, representacao-conhecimento, inferencia, regras',
  },

  // 2. APRENDIZADO DE MÁQUINA I (3º Semestre)
  {
    srcDir: 'aprendizado de maquinaI',
    srcFile: 'Aprendizado de máquina -I.pptx (1).pdf',
    targetFile: 'ia_sem3_maq026_fundamentos_machine_learning.pdf',
    title: 'Apostila e Slides – Fundamentos de Aprendizado de Máquina I',
    description: 'Material teórico completo sobre Machine Learning supervisionado e não-supervisionado, overfitting, underfitting e divisão treino/teste.',
    subject: 'Aprendizado de Máquina I',
    course: 'IA',
    semester: 3,
    material_type: 'SLIDE',
    tags: 'machine-learning, aprendizado-supervisionado, classificacao, regressao',
  },
  {
    srcDir: 'aprendizado de maquinaI',
    srcFile: 'Exercicio_-_Classificacao-IRIS.pdf',
    targetFile: 'ia_sem3_maq026_exercicio_classificacao_iris.pdf',
    title: 'Roteiro Prático – Classificação de Flores com Dataset Iris',
    description: 'Atividade prática de laboratório para implementação de algoritmos de classificação supervisionada em Python utilizando o clássico dataset Iris.',
    subject: 'Aprendizado de Máquina I',
    course: 'IA',
    semester: 3,
    material_type: 'APOSTILA',
    tags: 'exercicio, iris, python, scikit-learn, classificacao',
  },

  // 3. PROJETO 3 – GESTÃO DE PROJETOS ÁGEIS (3º Semestre)
  {
    srcDir: 'projetrosIII gestão',
    srcFile: 'Plano de ensino - GPA III IS2026.pdf',
    targetFile: 'ia_sem3_eia005_plano_ensino_gpa3.pdf',
    title: 'Plano de Ensino Oficial – Gestão de Projetos Ágeis III (2026)',
    description: 'Ementa oficial, objetivos pedagógicos, metodologia de avaliação e cronograma semestral da disciplina de Projeto Ágil III.',
    subject: 'Projeto 3 – Gestão de Projetos Ágeis',
    course: 'IA',
    semester: 3,
    material_type: 'APOSTILA',
    tags: 'plano-de-ensino, ementa, scrum, gpa-iii, fatec',
  },
  {
    srcDir: 'projetrosIII gestão',
    srcFile: 'CARVALHO; RABECHINI JR. Rumo à maturudidade em gestão de projetos - 5 ed.pdf',
    targetFile: 'ia_sem3_eia005_livro_maturidade_gestao_projetos.pdf',
    title: 'Livro – Rumo à Maturidade em Gestão de Projetos (5ª Edição - Carvalho & Rabechini)',
    description: 'Referência bibliográfica fundamental cobrindo modelos de maturidade, governança corporativa em projetos, PMO e boas práticas ágeis.',
    subject: 'Projeto 3 – Gestão de Projetos Ágeis',
    course: 'IA',
    semester: 3,
    material_type: 'APOSTILA',
    tags: 'livro, gestao-projetos, maturidade, pmo, carvalho-rabechini',
  },
  {
    srcDir: 'projetrosIII gestão',
    srcFile: 'Aulas.zip',
    targetFile: 'ia_sem3_eia005_pacote_aulas_projetos3.zip',
    title: 'Pacote Completo de Aulas e Roteiros – Projetos Ágeis III (ZIP)',
    description: 'Arquivo ZIP contendo apresentações, cerimônias Scrum, templates de Sprint Backlog e dinâmicas de equipe para o Projeto III.',
    subject: 'Projeto 3 – Gestão de Projetos Ágeis',
    course: 'IA',
    semester: 3,
    material_type: 'APOSTILA',
    tags: 'zip, aulas, sprints, scrum, backlog',
  },

  // 4. ANÁLISE PREDITIVA (4º Semestre)
  {
    srcDir: 'analise preditiva',
    srcFile: 'AULA 04 ANALISE PREDITIVA  FATEC RIO CLARO 06 10 26.pdf',
    targetFile: 'ia_sem4_iia022_aula04_modelagem_preditiva.pdf',
    title: 'Aula 04 – Modelagem Preditiva e Regressão Linear Aplicada',
    description: 'Conceitos matemáticos e computacionais de regressão linear simples e múltipla, cálculo de resíduos e métrica R² para predição.',
    subject: 'Análise Preditiva',
    course: 'IA',
    semester: 4,
    material_type: 'SLIDE',
    tags: 'analise-preditiva, regressao, modelagem, python',
  },
  {
    srcDir: 'analise preditiva',
    srcFile: 'AULA 05 ANALISE PREDITIVA  FATEC RIO CLARO 13 10 26.pdf',
    targetFile: 'ia_sem4_iia022_aula05_regressao_logistica.pdf',
    title: 'Aula 05 – Regressão Logística e Probabilidade Preditiva',
    description: 'Função sigmoide, modelagem probabilística binária e multiclasse, matriz de confusão e limiares de decisão preditiva.',
    subject: 'Análise Preditiva',
    course: 'IA',
    semester: 4,
    material_type: 'SLIDE',
    tags: 'analise-preditiva, regressao-logistica, probabilidade, metricas',
  },
  {
    srcDir: 'analise preditiva',
    srcFile: 'AULA 06 ANALISE PREDITIVA  FATEC RIO CLARO 20 10 26.pdf',
    targetFile: 'ia_sem4_iia022_aula06_arvores_decisao.pdf',
    title: 'Aula 06 – Árvores de Decisão e Ensemble Learning',
    description: 'Critérios de divisão (entropia, ganho de informação, índice Gini), poda de árvores e conceitos fundamentais de Random Forest.',
    subject: 'Análise Preditiva',
    course: 'IA',
    semester: 4,
    material_type: 'SLIDE',
    tags: 'arvores-decisao, gini, entropia, random-forest, ensemble',
  },
  {
    srcDir: 'analise preditiva',
    srcFile: 'AULA 07 ANALISE PREDITIVA  FATEC RIO CLARO 26 10 26.pdf',
    targetFile: 'ia_sem4_iia022_aula07_validacao_cruzada_roc.pdf',
    title: 'Aula 07 – Validação Cruzada, Otimização e Curvas ROC/AUC',
    description: 'Técnicas de K-Fold Cross Validation, busca em grade de hiperparâmetros (GridSearch) e avaliação avançada com Curvas ROC e Precision-Recall.',
    subject: 'Análise Preditiva',
    course: 'IA',
    semester: 4,
    material_type: 'SLIDE',
    tags: 'validacao-cruzada, roc, auc, gridsearch, hiperparametros',
  },
  {
    srcDir: 'analise preditiva',
    srcFile: 'AULA 08 ANALISE PREDITIVA  FATEC RIO CLARO 03 11 26.pdf',
    targetFile: 'ia_sem4_iia022_aula08_series_temporais.pdf',
    title: 'Aula 08 – Séries Temporais e Previsão de Tendências em IA',
    description: 'Análise de sazonalidade, tendência e ruído em séries temporais, modelos autorregressivos (ARIMA) e previsões dinâmicas.',
    subject: 'Análise Preditiva',
    course: 'IA',
    semester: 4,
    material_type: 'SLIDE',
    tags: 'series-temporais, forecasting, tendencias, arima',
  },

  // 5. APRENDIZADO DE MÁQUINA II (4º Semestre)
  {
    srcDir: 'aprejndizado de maquinaII',
    srcFile: 'Apresentação da Disciplina - Aprendizado de Máquina II (MAQ-027).pdf',
    targetFile: 'ia_sem4_maq027_apresentacao_disciplina.pdf',
    title: 'Apresentação da Disciplina – Aprendizado de Máquina II (MAQ-027)',
    description: 'Visão geral do conteúdo programático de Aprendizado de Máquina II: Deep Learning, AutoML, MLOps e pipelines de produção.',
    subject: 'Aprendizado de Máquina II',
    course: 'IA',
    semester: 4,
    material_type: 'SLIDE',
    tags: 'ementa, apresentacao, ml-ii, maq-027, deep-learning',
  },
  {
    srcDir: 'aprejndizado de maquinaII',
    srcFile: 'ENCONTRO_03_-SPRINT PLANNING.pdf',
    targetFile: 'ia_sem4_maq027_sprint_planning_ml.pdf',
    title: 'Encontro 03 – Sprint Planning em Engenharia de Machine Learning',
    description: 'Planejamento ágil para entregas iterativas de modelos de IA, definição de DoD (Definition of Done) para dados e modelos preditivos.',
    subject: 'Aprendizado de Máquina II',
    course: 'IA',
    semester: 4,
    material_type: 'SLIDE',
    tags: 'sprint-planning, agil, ml-engineering, dod',
  },
  {
    srcDir: 'aprejndizado de maquinaII',
    srcFile: 'Framework SEMMA_ Metodologia e Aplicação Prática em Machine Learning.pdf',
    targetFile: 'ia_sem4_maq027_metodologia_semma.pdf',
    title: 'Metodologia SEMMA – Aplicação Prática em Mineração e Machine Learning',
    description: 'Guia completo do framework SEMMA (Sample, Explore, Modify, Model, Assess) desenvolvido pelo SAS Institute para ciência de dados industrial.',
    subject: 'Aprendizado de Máquina II',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'semma, sas, metodologia, data-mining, pipeline',
  },

  // 6. PROJETO 4 – GESTÃO DE PROJETOS ÁGEIS (4º Semestre)
  {
    srcDir: 'projetosiV gestão',
    srcFile: 'Plano de ensino - GPA IV IIS2026.pdf',
    targetFile: 'ia_sem4_eia007_plano_ensino_gpa4.pdf',
    title: 'Plano de Ensino Oficial – Gestão de Projetos Ágeis IV (2026)',
    description: 'Ementa oficial e critérios do projeto final integrador de IA: governança, liderança ágil e entrega de produto tecnológico.',
    subject: 'Projeto 4 – Gestão de Projetos Ágeis',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'plano-de-ensino, gpa-iv, gestao-agil, projeto-integrador',
  },
  {
    srcDir: 'projetosiV gestão',
    srcFile: 'Aulas.zip',
    targetFile: 'ia_sem4_eia007_pacote_aulas_projetos4.zip',
    title: 'Pacote Completo de Aulas e Documentação – Projetos Ágeis IV (ZIP)',
    description: 'Arquivos de apoio para condução de projetos complexos, métricas de fluxo (Lead Time, Cycle Time) e roadmaps de produto.',
    subject: 'Projeto 4 – Gestão de Projetos Ágeis',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'zip, aulas, gpa-iv, roadmaps, kanban',
  },
  {
    srcDir: 'projetosiV gestão',
    srcFile: 'Estudo de caso - escalonando o ágil no ING Bank.pdf',
    targetFile: 'ia_sem4_eia007_caso_ing_bank_agile.pdf',
    title: 'Estudo de Caso – Escalonamento Ágil Corporativo no ING Bank',
    description: 'Transformação ágil de larga escala inspirada no modelo Spotify, reestruturação organizacional em Squads, Tribos e Chapters.',
    subject: 'Projeto 4 – Gestão de Projetos Ágeis',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'estudo-de-caso, ing-bank, agile-scale, spotify-model, squads',
  },
  {
    srcDir: 'projetosiV gestão',
    srcFile: 'Estudo de caso - modelo de microempresas e a descentralização organizacional.pdf',
    targetFile: 'ia_sem4_eia007_caso_microempresas_descentralizacao.pdf',
    title: 'Estudo de Caso – Modelo de Microempresas e Descentralização Organizacional',
    description: 'Análise de modelos organizacionais descentralizados (ex: Haier/Rendanheyi) com foco em autonomia de equipes e inovação contínua.',
    subject: 'Projeto 4 – Gestão de Projetos Ágeis',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'estudo-de-caso, descentralizacao, microempresas, inovacao',
  },
  {
    srcDir: 'projetosiV gestão',
    srcFile: 'Estudo de caso - O DBS e a importância do foco.pdf',
    targetFile: 'ia_sem4_eia007_caso_dbs_foco.pdf',
    title: 'Estudo de Caso – O DBS e a Importância Estratégica do Foco',
    description: 'Estudo de caso sobre priorização estratégica, eliminação de desperdícios e alinhamento executivo em projetos de tecnologia.',
    subject: 'Projeto 4 – Gestão de Projetos Ágeis',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'estudo-de-caso, dbs, foco-estrategico, priorizacao',
  },
  {
    srcDir: 'projetosiV gestão',
    srcFile: 'Os renegados da Nasa e o paradigma dos piratas - MIT Sloan Management Review Brasil.pdf',
    targetFile: 'ia_sem4_eia007_mit_sloan_renegados_nasa.pdf',
    title: 'Artigo MIT Sloan – Os Renegados da NASA e o Paradigma da Inovação Ágil',
    description: 'Artigo clássico do MIT Sloan discutindo a cultura "Skunk Works" e mentalidade pirata para desbloqueio de inovação radical em tecnologia.',
    subject: 'Projeto 4 – Gestão de Projetos Ágeis',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'mit-sloan, nasa, inovacao, gestao, cultura-agil',
  },
  {
    srcDir: 'projetosiV gestão',
    srcFile: 'Sá, Luiz Fernando (2025) Com famílias de robôs e lógica de iPhone, Solinftec.pdf',
    targetFile: 'ia_sem4_eia007_caso_solinftec_robotica_ia.pdf',
    title: 'Artigo de Inovação – Robótica Autônoma e Plataformas AgTech (Solinftec)',
    description: 'Reportagem analítica sobre robôs agrícolas autônomos operando com visão computacional e Inteligência Artificial no agronegócio moderno.',
    subject: 'Projeto 4 – Gestão de Projetos Ágeis',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'agtech, robotica, inovacao, solinftec, ia-agronegocio',
  },

  // 7. REDES NEURAIS (4º Semestre)
  {
    srcDir: 'redes neurais',
    srcFile: 'RNAP - Aula 1.pdf',
    targetFile: 'ia_sem4_irc036_aula01_perceptron.pdf',
    title: 'Aula 01 – Introdução a Redes Neurais Artificiais e Neurônio de McCulloch-Pitts',
    description: 'Origens biológicas das redes neurais, arquitetura do Perceptron simples, pesos sinápticos e limiar de ativação.',
    subject: 'Redes Neurais',
    course: 'IA',
    semester: 4,
    material_type: 'SLIDE',
    tags: 'redes-neurais, rnap, perceptron, mcculloch-pitts, fundamentos',
  },
  {
    srcDir: 'redes neurais',
    srcFile: 'RNAP - Aula 2.pdf',
    targetFile: 'ia_sem4_irc036_aula02_mlp_backpropagation.pdf',
    title: 'Aula 02 – Perceptron Multicamadas (MLP) e Algoritmo Backpropagation',
    description: 'Camadas ocultas, problemas linearmente não separáveis (XOR) e derivação do algoritmo de retropropagação do erro via Regra da Cadeia.',
    subject: 'Redes Neurais',
    course: 'IA',
    semester: 4,
    material_type: 'SLIDE',
    tags: 'mlp, backpropagation, gradiente-descendente, regra-cadeia',
  },
  {
    srcDir: 'redes neurais',
    srcFile: 'RNAP - Aula 3.pdf',
    targetFile: 'ia_sem4_irc036_aula03_funcoes_ativacao_otimizadores.pdf',
    title: 'Aula 03 – Funções de Ativação, Otimizadores e Regularização',
    description: 'Comparativo entre Sigmoide, ReLU, LeakyReLU, Softmax e otimizadores modernos (SGD com Momentum, RMSProp, Adam).',
    subject: 'Redes Neurais',
    course: 'IA',
    semester: 4,
    material_type: 'SLIDE',
    tags: 'funcoes-ativacao, relu, softmax, adam, regularizacao, dropout',
  },
  {
    srcDir: 'redes neurais',
    srcFile: 'Aula 4 - Modelos de Redes Neurais_ Recorrentes,  Competitivas.pdf',
    targetFile: 'ia_sem4_irc036_aula04_redes_recorrentes_competitivas.pdf',
    title: 'Aula 04 – Redes Neurais Recorrentes (RNN) e Mapas Auto-Organizáveis (SOM)',
    description: 'Modelos para dados sequenciais (RNN, LSTM, GRU) e aprendizado competitivo não supervisionado com Mapas de Kohonen (SOM).',
    subject: 'Redes Neurais',
    course: 'IA',
    semester: 4,
    material_type: 'SLIDE',
    tags: 'rnn, lstm, som, kohonen, redes-competitivas',
  },
  {
    srcDir: 'redes neurais',
    srcFile: 'Aula 9 - Redes Neurais Convolucionais.pdf',
    targetFile: 'ia_sem4_irc036_aula09_cnn_visao_computacional.pdf',
    title: 'Aula 09 – Redes Neurais Convolucionais (CNN) e Visão Computacional',
    description: 'Arquitetura profunda de CNNs: filtros de convolução, pooling (max-pooling), stride, padding e classificação de imagens.',
    subject: 'Redes Neurais',
    course: 'IA',
    semester: 4,
    material_type: 'SLIDE',
    tags: 'cnn, convolucao, pooling, visao-computacional, deep-learning',
  },

  // 8. ESTÁGIO CURRICULAR SUPERVISIONADO (IA) (Complementar / 5º Semestre)
  {
    srcDir: 'estagio',
    srcFile: 'apresentação_estagio.pdf',
    targetFile: 'ia_sem4_eia100_apresentacao_diretrizes_estagio.pdf',
    title: 'Manual e Apresentação das Diretrizes de Estágio Supervisionado',
    description: 'Regulamento oficial do estágio da FATEC Rio Claro, carga horária obrigatória (240h), documentação necessária e prazos de entrega.',
    subject: 'Estágio Curricular Supervisionado (IA)',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'estagio, diretrizes, regulamento, carga-horaria, fatec',
  },
  {
    srcDir: 'estagio',
    srcFile: 'MODELO.docx',
    targetFile: 'ia_sem4_eia100_modelo_editavel_relatorio_estagio.docx',
    title: 'Modelo Editável de Relatório Final de Estágio Supervisionado (.DOCX)',
    description: 'Template oficial formatado nas normas ABNT / FATEC para elaboração e redação do Relatório Final de Estágio.',
    subject: 'Estágio Curricular Supervisionado (IA)',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'modelo, docx, relatorio, abnt, estagio',
  },
  {
    srcDir: 'estagio',
    srcFile: 'MODELO_ESTAGIO.pdf',
    targetFile: 'ia_sem4_eia100_modelo_relatorio_empresa_privada.pdf',
    title: 'Modelo Padrão – Relatório de Estágio em Empresa Privada / Corporativo',
    description: 'Guia de preenchimento para discentes com contrato de estágio firmado em empresas privadas de tecnologia ou indústria.',
    subject: 'Estágio Curricular Supervisionado (IA)',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'modelo, empresa, estagio, relatorio, contrato',
  },
  {
    srcDir: 'estagio',
    srcFile: 'MODELO_EMPREENDEDOR.pdf',
    targetFile: 'ia_sem4_eia100_modelo_aproveitamento_empreendedor.pdf',
    title: 'Modelo de Aproveitamento de Atividades – Perfil Empreendedor / Startup',
    description: 'Formulário de equivalência de estágio para alunos sócios-proprietários ou fundadores de empresas e startups em tecnologia.',
    subject: 'Estágio Curricular Supervisionado (IA)',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'modelo, empreendedorismo, startup, estagio, equivalencia',
  },
  {
    srcDir: 'estagio',
    srcFile: 'MODELO_MONITORIA.pdf',
    targetFile: 'ia_sem4_eia100_modelo_aproveitamento_monitoria.pdf',
    title: 'Modelo de Equivalência de Estágio – Atividades de Monitoria Acadêmica',
    description: 'Solicitação de aproveitamento de carga horária cumprida como monitor oficial de disciplinas da FATEC para fins de estágio.',
    subject: 'Estágio Curricular Supervisionado (IA)',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'modelo, monitoria, equivalencia, estagio, docente',
  },
  {
    srcDir: 'estagio',
    srcFile: 'MODELO_PESQUISA.pdf',
    targetFile: 'ia_sem4_eia100_modelo_iniciacao_cientifica.pdf',
    title: 'Modelo de Equivalência de Estágio – Iniciação Científica e Pesquisa',
    description: 'Formulário para validação de projetos de Iniciação Científica (PIBIC/CNPq/FAPESP) como horas de estágio curricular.',
    subject: 'Estágio Curricular Supervisionado (IA)',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'modelo, pesquisa, iniciacao-cientifica, cnpq, fapesp, estagio',
  },
  {
    srcDir: 'estagio',
    srcFile: 'MODELO_SERVIDOR_PUBLICO.pdf',
    targetFile: 'ia_sem4_eia100_modelo_aproveitamento_servidor_publico.pdf',
    title: 'Modelo de Aproveitamento de Estágio – Servidor Público e Órgãos Estatais',
    description: 'Equivalência de estágio curricular para servidores públicos estatutários ou celetistas com atuação compatível com IA.',
    subject: 'Estágio Curricular Supervisionado (IA)',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'modelo, servidor-publico, estagio, servico-publico',
  },
  {
    srcDir: 'estagio',
    srcFile: 'MODELO_VOLUNTARIADO.pdf',
    targetFile: 'ia_sem4_eia100_modelo_aproveitamento_voluntariado_esg.pdf',
    title: 'Modelo de Aproveitamento de Estágio – Ações Sociais e Voluntariado ESG',
    description: 'Validação de horas práticas desenvolvidas em ONGs, projetos sociais ou iniciativas de governança sustentável e ESG.',
    subject: 'Estágio Curricular Supervisionado (IA)',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'modelo, voluntariado, esg, acoes-sociais, estagio',
  },

  // 9. TRABALHO DE GRADUAÇÃO (TCC IA) (Complementar / 5º Semestre)
  {
    srcDir: 'tccI',
    srcFile: 'Trilhas_de_TCC_FATEC_Rio_Claro_IA_Manual_Norteador_FINAL_28-08-26.docx',
    targetFile: 'ia_sem4_tia001_manual_norteador_trilhas_tcc.docx',
    title: 'Manual Norteador Oficial das Trilhas de TCC – CST Inteligência Artificial',
    description: 'Documento oficial homologado pela coordenação detalhando as 4 trilhas de pesquisa aplicada, normas de redação e prazos de banca do TCC.',
    subject: 'Trabalho de Graduação (TCC IA)',
    course: 'IA',
    semester: 4,
    material_type: 'APOSTILA',
    tags: 'tcc, manual-norteador, trilhas, diretrizes, fatec, graduacao',
  },
];

async function runImport() {
  console.log('===================================================================');
  console.log('🚀 INICIANDO IMPORTAÇÃO AUTOMATIZADA DOS 39 MATERIAIS DE IA');
  console.log('===================================================================');

  // Buscar usuário autor (Luis Otavio - Admin ou Admin FATEC)
  let authorId = 'a0000000-0000-0000-0000-000000000007'; // Luis Otavio
  let authorName = 'Luis Otavio (Coordenação IA)';

  const userCheck = await pool.query('SELECT id, name FROM users WHERE id = $1', [authorId]);
  if (userCheck.rows.length === 0) {
    const adminUser = await pool.query("SELECT id, name FROM users WHERE role = 'ADMIN' LIMIT 1");
    if (adminUser.rows.length > 0) {
      authorId = adminUser.rows[0].id;
      authorName = adminUser.rows[0].name;
    }
  }

  console.log(`👤 Autor vinculado: ${authorName} (ID: ${authorId})\n`);

  let successCount = 0;
  let copiedCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < MATERIALS_MANIFEST.length; i++) {
    const item = MATERIALS_MANIFEST[i];
    const itemIndex = i + 1;
    const sourcePath = path.join(process.cwd(), 'materiais_aulas', item.srcDir, item.srcFile);
    const destinationPath = path.join(TARGET_DIR, item.targetFile);
    const fileUrl = `/uploads/materials/${item.targetFile}`;

    // 1. Copiar arquivo para public/uploads/materials se existir
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destinationPath);
      copiedCount++;
    } else {
      console.warn(`⚠️ Arquivo de origem não encontrado: ${sourcePath}`);
    }

    // 2. Inserir ou atualizar registro no PostgreSQL
    const existing = await pool.query(
      'SELECT id FROM academic_materials WHERE title = $1 OR file_url = $2',
      [item.title, fileUrl]
    );

    if (existing.rows.length > 0) {
      const materialId = existing.rows[0].id;
      await pool.query(
        `UPDATE academic_materials 
         SET description = $1, subject = $2, course = $3, semester = $4,
             material_type = $5, file_url = $6, tags = $7, is_approved = TRUE,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $8`,
        [
          item.description,
          item.subject,
          item.course,
          item.semester,
          item.material_type,
          fileUrl,
          item.tags,
          materialId,
        ]
      );
      updatedCount++;
      console.log(`[${itemIndex}/39] 🔄 Atualizado: ${item.title}`);
    } else {
      await pool.query(
        `INSERT INTO academic_materials (
           title, description, subject, course, semester,
           author_id, author_name, material_type, file_url,
           tags, is_approved
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)`,
        [
          item.title,
          item.description,
          item.subject,
          item.course,
          item.semester,
          authorId,
          authorName,
          item.material_type,
          fileUrl,
          item.tags,
        ]
      );
      successCount++;
      console.log(`[${itemIndex}/39] ✅ Cadastrado: ${item.title}`);
    }
  }

  console.log('\n===================================================================');
  console.log(`🎉 SUCESSO: ${successCount} novos materiais inseridos, ${updatedCount} atualizados.`);
  console.log(`📁 ${copiedCount} arquivos copiados com sucesso para public/uploads/materials/`);
  console.log('===================================================================');

  await pool.end();
}

runImport().catch((err) => {
  console.error('❌ Falha na importação:', err);
  pool.end();
  process.exit(1);
});
