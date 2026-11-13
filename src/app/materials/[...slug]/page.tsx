'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';

// Base de Conteúdos Didáticos dos Guias e Cadernos Acadêmicos da FATEC Rio Claro
interface MaterialDocInfo {
  title: string;
  code: string;
  subject: string;
  course: 'IA' | 'ESG';
  semester: number;
  type: string;
  author: string;
  description: string;
  syllabus: string[];
  codeSnippet?: {
    lang: string;
    code: string;
  };
  githubUrl?: string;
  appliedProjects?: Array<{
    name: string;
    description: string;
    link?: string;
  }>;
}

const MATERIAL_KNOWLEDGE_DOCS: Record<string, MaterialDocInfo> = {
  matriz_linguagens_programacao_ia: {
    title: 'Guia Curricular Oficial: Matriz de Linguagens de Programação e Tecnologias de IA',
    code: 'ILP-113 / ILP-114',
    subject: 'Linguagem de Programação I & II',
    course: 'IA',
    semester: 1,
    type: 'Guia Curricular / Apostila',
    author: 'Prof. Orlando / Coordenação IA',
    description:
      'Documento orientador oficial sobre as linguagens de programação adotadas na formação do tecnólogo em Inteligência Artificial da FATEC Rio Claro.',
    syllabus: [
      '1º Semestre: ILP-113 (Linguagem de Programação I) — Sintaxe Python 3, tipos de dados, estruturas condicionais e de repetição, funções e listas.',
      '1º Semestre: IBD-040 (Introdução à Bancos de Dados) — Linguagem SQL padrão ANSI, modelagem relacional, joins e integridade referencial.',
      '2º Semestre: ILP-114 (Linguagens de Programação II) — Programação Orientada a Objetos (POO), herança, polimorfismo e modularização com Python.',
      '2º Semestre: IED-020 (Estrutura de Dados) — Algoritmos de busca, ordenação, filas, pilhas, árvores e grafos em Python.',
      '2º Semestre: IBD-041 (Banco de Dados Não Relacional) — NoSQL orientado a documentos (JSON/MongoDB) e bancos chave-valor.',
      '3º Semestre: MAQ-026 (Aprendizado de Máquina I) — Python com NumPy, Pandas, Scikit-Learn e Matplotlib.',
      '3º Semestre: IIA-021 (Inteligência Computacional) — Algoritmos Genéticos, meta-heurísticas e lógica fuzzy.',
      '4º Semestre: IRC-036 (Redes Neurais) & MAQ-027 (Aprendizado de Máquina II) — Deep Learning com TensorFlow e PyTorch.',
      '4º Semestre: IIA-023 (Visão Computacional) — Processamento de imagens e Redes Neurais Convolucionais (CNN) com OpenCV.',
    ],
    codeSnippet: {
      lang: 'python',
      code: `# Exemplo Didático: Algoritmo de Classificação com Scikit-Learn (3º Semestre)
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Carregamento e divisão de dados acadêmicos
X = np.random.rand(100, 4)
y = np.random.choice([0, 1], size=100)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
print(f"Acurácia do Modelo: {accuracy_score(y_test, y_pred) * 100:.2f}%")`,
    },
    githubUrl: 'https://github.com/fatec-rc/ia-python-sem1',
  },
  fundamentos_python_ia_sem1: {
    title: 'Apostila Didática: Fundamentos de Lógica de Programação e Python para IA',
    code: 'ILP-113',
    subject: 'Linguagem de Programação I',
    course: 'IA',
    semester: 1,
    type: 'Apostila PDF Oficial',
    author: 'Prof. Orlando',
    description:
      'Apostila didática do 1º semestre de IA da FATEC Rio Claro. Apresenta o raciocínio algorítmico e as estruturas fundamentais da linguagem Python 3 para ingressantes.',
    syllabus: [
      'Ambiente de Desenvolvimento: Instalação do Python 3.11+, VS Code e execução de cadernos Jupyter Notebook (.ipynb).',
      'Estruturas Básicas: Variáveis, operadores aritméticos, relacionais e lógicos.',
      'Controle de Fluxo: Condicionais if, elif e else.',
      'Estruturas de Repetição: Laços while e for com range(), enumerate() e zip().',
      'Coleções em Python: Listas, tuplas, conjuntos (sets) e dicionários.',
      'Funções Modulares: Declaração def, argumentos posicionais, nomeados e retorno de valores.',
      'Manipulação de Arquivos e Exceções: Leitura/escrita de arquivos .txt/.csv e blocos try/except.',
      'Introdução a Vetores com NumPy: Criação de arrays ndarray e operações vetorizadas.',
    ],
    codeSnippet: {
      lang: 'python',
      code: `# Fundamentos Python 3 - FATEC Rio Claro
def calcular_media_discente(notas: list[float]) -> dict:
    media = sum(notas) / len(notas) if notas else 0.0
    status = "APROVADO" if media >= 6.0 else "EXAME"
    return {"media": round(media, 2), "situacao": status}

boletim = calcular_media_discente([7.5, 8.0, 9.2])
print(f"Média: {boletim['media']} - Status: {boletim['situacao']}")`,
    },
    githubUrl: 'https://github.com/fatec-rc/ia-python-sem1',
  },
  otimizacao_rotas_logistica_grafos: {
    title: 'Caderno de Algoritmos de Grafos e Otimização Logística de Rotas de Entrega',
    code: 'IED-020 / IIA-021',
    subject: 'Estrutura de Dados & Inteligência Computacional',
    course: 'IA',
    semester: 3,
    type: 'Caderno Jupyter (.ipynb)',
    author: 'Prof. Orlando / Laboratório de IA',
    description:
      'Estudo prático multidisciplinar sobre grafos, cálculo do menor caminho e algoritmos genéticos para o Problema do Caixeiro Viajante (TSP) e Roteamento de Veículos (VRP).',
    syllabus: [
      'Etapa 1: Representação de malhas viárias como Grafos Ponderados (Nós = Pontos de Entrega, Arestas = Ruas/Distâncias).',
      'Etapa 2: Algoritmo de Dijkstra para cálculo da menor distância ponto a ponto.',
      'Etapa 3: Algoritmo A* (A-Star) com heurística euclidiana para busca informada.',
      'Etapa 4: Meta-heurística e Algoritmos Genéticos (AG) para otimização da ordem de entrega em múltiplas paradas.',
      'Etapa 5: Predição de tempo de trânsito (ETA) com modelos de Regressão em Machine Learning.',
      'Aviso de Suficiência: Para aplicações comerciais em produção, é necessário integrar APIs de mapas (Google Maps Routes API / OSRM) e solvers logísticos (Google OR-Tools).',
    ],
    codeSnippet: {
      lang: 'python',
      code: `# Algoritmo de Dijkstra Simplificado em Python (Estrutura de Dados - FATEC RC)
import heapq

def dijkstra(grafo: dict, origem: str):
    distancias = {vertice: float('inf') for vertice in grafo}
    distancias[origem] = 0
    fila_prioridade = [(0, origem)]

    while fila_prioridade:
        dist_atual, vertice_atual = heapq.heappop(fila_prioridade)
        if dist_atual > distancias[vertice_atual]:
            continue

        for vizinho, peso in grafo[vertice_atual].items():
            distancia = dist_atual + peso
            if distancia < distancias[vizinho]:
                distancias[vizinho] = distancia
                heapq.heappush(fila_prioridade, (distancia, vizinho))

    return distancias`,
    },
    githubUrl: 'https://github.com/fatec-rc/otimizacao-rotas-grafos',
  },
  bancos_de_dados_sql_nosql_ibd040_ibd041: {
    title: 'Guia Didático Oficial: Bancos de Dados Relacionais (SQL) e Não-Relacionais (NoSQL)',
    code: 'IBD-040 / IBD-041 / BDN-009',
    subject: 'Introdução à Bancos de Dados & Banco de Dados Não Relacional',
    course: 'IA',
    semester: 1,
    type: 'Guia Didático / Apostila',
    author: 'Prof. Orlando / Coordenação de Bancos de Dados',
    description:
      'Guia curricular completo para o estudo de bancos de dados no curso de IA, conectando a teoria relacional e NoSQL aos projetos e sistemas reais do portal.',
    syllabus: [
      '1º Semestre (IBD-040 - 40h): Introdução à Bancos de Dados Relacionais — Modelo Entidade-Relacionamento (MER), Álgebra Relacional, Normalização (1FN, 2FN, 3FN), Linguagem SQL ANSI (PostgreSQL / MySQL), DDL (CREATE, ALTER), DML (SELECT, INSERT, UPDATE, DELETE), Chaves Primárias/Estrangeiras e JOINs.',
      '2º Semestre (IBD-041 - 40h): Banco de Dados Não Relacional — Teorema CAP, Bancos NoSQL orientados a documentos (MongoDB, coleções BSON/JSON), chave-valor (Redis), colunares e grafos (Neo4j).',
      '3º Semestre (BDN-009 - 40h): Big Data e Inteligência Artificial — Arquiteturas de Data Lake, Data Warehousing, pipelines ETL/ELT e processamento distribuído.',
    ],
    codeSnippet: {
      lang: 'sql',
      code: `-- SQL Oficial (PostgreSQL) - Modelagem Relacional FATEC Rio Claro
CREATE TABLE alunos_ia (
    ra VARCHAR(15) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    semestre INTEGER CHECK (semestre BETWEEN 1 AND 4),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consulta Analítica com Agregação
SELECT semestre, COUNT(*) AS total_discentes
FROM alunos_ia
WHERE ativo = TRUE
GROUP BY semestre
ORDER BY semestre ASC;`,
    },
    githubUrl: 'https://github.com/fatec-rc/ia-bancos-de-dados',
    appliedProjects: [
      {
        name: 'DWH Saúde RC — Data Warehouse e Analytics em Saúde Coletiva',
        description: 'Projeto da Vitrine utilizando modelagem dimensional em PostgreSQL com cargas de dados abertos do DATASUS.',
        link: 'https://github.com/MateusIoga/DWH-Saude-RC',
      },
      {
        name: 'Portal Integrado FATEC Rio Claro & Cantina Escolar',
        description: 'Banco de dados relacional em produção no Supabase (PostgreSQL) com triggers de auditoria, restrições de integridade e índices B-Tree de alta performance.',
        link: '/repositorio',
      },
    ],
  },
  matematica_calculo_algebra_linear_ia: {
    title: 'Guia Curricular Oficial: Fundamentos de Matemática, Cálculo e Álgebra Linear para IA',
    code: 'ICD-010 / IMD-010 / IAL-010 / IPE-010',
    subject: 'Cálculo Diferencial e Integral & Álgebra Linear',
    course: 'IA',
    semester: 1,
    type: 'Guia Didático Oficial',
    author: 'Prof. Orlando / Departamento de Matemática e IA',
    description:
      'Fundamentação matemática indispensável para o CST em Inteligência Artificial, abrangendo Cálculo Diferencial, Álgebra Linear, Matemática Discreta e Estatística como base para algoritmos e redes neurais.',
    syllabus: [
      '1º Semestre (ICD-010 - 80h): Cálculo Diferencial e Integral — Funções, limites, derivadas, derivadas parciais, gradiente (Gradient Descent), integrais e otimização contínua.',
      '1º Semestre (IMD-010 - 40h): Matemática Discreta — Lógica proposicional e de predicados, teoria dos conjuntos, relações de equivalência e ordem, combinatória, indução matemática e introdução à grafos.',
      '2º Semestre (IAL-010 - 40h): Álgebra Linear e Geometria Analítica — Vetores no R^n, matrizes, determinantes, sistemas lineares, transformações lineares, autovalores, autovetores e decomposição em valores singulares (SVD).',
      '2º Semestre (IPE-010 - 80h): Estatística e Probabilidade — Espaço amostral, probabilidade condicional, Teorema de Bayes, variáveis aleatórias discretas/contínuas, distribuições de probabilidade e inferência estatística.',
    ],
    codeSnippet: {
      lang: 'python',
      code: `# Fundamentos de Álgebra Linear e Gradiente para IA com NumPy
import numpy as np

# Matriz de covariância e autovalores (base de PCA e Redes Neurais)
A = np.array([[3.0, 1.0], [1.0, 3.0]])
autovalores, autovetores = np.linalg.eig(A)

print("Matriz A:\n", A)
print("\nAutovalores (Variâncias principais):\n", autovalores)
print("\nAutovetores (Eixos principais de projeção):\n", autovetores)

# Cálculo de Gradiente Numérico da Função de Custo (MSE)
def mse_loss(y_true, y_pred):
    return np.mean((y_true - y_pred) ** 2)

y_real = np.array([1.0, 2.0, 3.0])
y_estimado = np.array([1.1, 1.9, 3.2])
print(f"\nLoss MSE: {mse_loss(y_real, y_estimado):.4f}")`,
    },
    githubUrl: 'https://github.com/fatec-rc/ia-matematica-aplicada',
    appliedProjects: [
      {
        name: 'Modelos Preditivos e Redes Neurais Supervisionadas (MAQ-026)',
        description: 'Aplicação direta de derivadas para cálculo do erro e ajuste de gradiente descendente em classificadores.',
      },
      {
        name: 'Processamento de Imagens e Visão Computacional (MobileNetV2)',
        description: 'Operações matriciais com tensores multidimensionais e convoluções lineares.',
      },
    ],
  },
  introducao_esg_ods_sem1: {
    title: 'Guia Didático: Introdução à Sustentabilidade, ODS da ONU e Gestão ESG',
    code: 'ESG-W1A / ESG-LEG',
    subject: 'Fundamentos de Gestão Ambiental e ESG',
    course: 'ESG',
    semester: 1,
    type: 'Guia Didático Oficial',
    author: 'Coordenação Gestão ESG',
    description:
      'Guia curricular introduzindo os pilares Environmental, Social e Governance (ESG) e a integração dos 17 Objetivos de Desenvolvimento Sustentável (ODS) da ONU nas empresas.',
    syllabus: [
      'Pilar Environmental (Ambiental): Matriz energética limpa, economia circular e conservação dos recursos hídricos.',
      'Pilar Social (Social): Direitos humanos, segurança do trabalho, inclusão, diversidade e impacto comunitário.',
      'Pilar Governance (Governança): Transparência corporativa, prestação de contas, conduta ética e compliance anticorrupção.',
      'Os 17 ODS da Agenda 2030 da ONU e métricas de sustentabilidade corporativa.',
    ],
  },
  governanca_2026: {
    title: 'Diretrizes de Governança Corporativa e Relatórios de Sustentabilidade (GRI / Escopos 1, 2 e 3)',
    code: 'ESG-R4A / ESG-CMP',
    subject: 'Governança Corporativa e Compliance',
    course: 'ESG',
    semester: 2,
    type: 'Apostila PDF Oficial',
    author: 'Prof. Orlando / Coordenação ESG',
    description:
      'Diretrizes oficiais para elaboração de inventário de emissões de Gases de Efeito Estufa (GEE) e cálculo da pegada de carbono conforme padrões GRI.',
    syllabus: [
      'Inventário de Emissões de GEE (Protocolo GHG): Escopo 1 (emissões diretas), Escopo 2 (energia elétrica adquirida) e Escopo 3 (cadeia de suprimentos).',
      'Padrões Internacionais GRI (Global Reporting Initiative) e SASB para relatórios de sustentabilidade.',
      'Estruturação de comitês de auditoria, compliance e matriz de riscos ESG.',
    ],
  },
  ml_intro: {
    title: 'Caderno Didático: Aprendizado de Máquina Supervisionado (Scikit-Learn)',
    code: 'MAQ-026',
    subject: 'Aprendizado de Máquina I',
    course: 'IA',
    semester: 3,
    type: 'Caderno Jupyter (.ipynb)',
    author: 'Prof. Orlando',
    description:
      'Caderno prático de Machine Learning cobrindo o pipeline completo: pré-processamento, divisão treino/teste, treinamento, validação cruzada e métricas de desempenho.',
    syllabus: [
      'Pré-processamento: Imputação de valores nulos, One-Hot Encoding e StandardScaler.',
      'Modelos de Regressão: Regressão Linear Simples, Múltipla, Ridge e Lasso.',
      'Modelos de Classificação: Regressão Logística, Árvores de Decisão e Random Forest.',
      'Métricas de Avaliação: Matriz de confusão, Acurácia, Precisão, Recall e F1-Score.',
      'Validação Cruzada (k-Fold Cross-Validation) e prevenção de Overfitting.',
    ],
    githubUrl: 'https://github.com/fatec-rc/ia-ml',
  },
  tcc_visao_computacional_reciclagem: {
    title: 'Projeto de TCC: Visão Computacional para Classificação Automatizada de Resíduos Recicláveis',
    code: 'TIA-001',
    subject: 'Trabalho de Graduação Interdisciplinar',
    course: 'IA',
    semester: 4,
    type: 'Trabalho de Conclusão de Curso (TCC)',
    author: 'Cesar Bovo (Orientação: Prof. Orlando)',
    description:
      'TCC exemplar integrando Deep Learning e visão computacional (MobileNetV2) à separação automatizada de resíduos, unindo tecnologia de ponta em IA à sustentabilidade ESG.',
    syllabus: [
      'Coleta e rotulagem de dataset de resíduos (plástico, papel, metal e vidro).',
      'Técnicas de Data Augmentation para robustez contra variações de luminosidade.',
      'Transfer Learning com arquitetura convolucional MobileNetV2.',
      'Avaliação de métricas de inferência em tempo real e implantação em hardware embarcado.',
    ],
    githubUrl: 'https://github.com/fatec-rc/tcc-visao-reciclagem',
  },
};

export default function MaterialViewerPage() {
  const params = useParams();
  const slugArray = Array.isArray(params?.slug) ? params.slug : [params?.slug || ''];
  const fullPath = slugArray.join('/');
  const filename = slugArray[slugArray.length - 1] || '';
  const cleanKey = filename.replace(/\.(pdf|ipynb|html|zip|docx?)$/i, '');

  // Localiza documentação na base de conhecimento ou gera uma visualização estruturada
  const docInfo: MaterialDocInfo = MATERIAL_KNOWLEDGE_DOCS[cleanKey] || {
    title: `Material Didático Oficial: ${filename.replace(/_/g, ' ').toUpperCase()}`,
    code: 'ACERVO-FATEC',
    subject: 'Repositório Acadêmico Oficial',
    course: 'IA',
    semester: 1,
    type: 'Material Didático Homologado',
    author: 'Corpo Docente FATEC Rio Claro',
    description: `Conteúdo acadêmico oficial homologado pela coordenação e corpo docente da FATEC Rio Claro. Arquivo referenciado: ${filename}.`,
    syllabus: [
      'Material didático de apoio para as aulas teóricas e práticas da FATEC Rio Claro.',
      'Conteúdo estruturado em conformidade com o Projeto Pedagógico do Curso (PPC).',
      'Exercícios práticos, exemplos de código e referências complementares de estudo.',
    ],
    githubUrl: 'https://github.com/fatec-rc',
  };

  return (
    <AppLayout activePath="/repositorio">
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Breadcrumb de Navegação */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Início</Link>
          <span>/</span>
          <Link href="/repositorio" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Repositório Acadêmico</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Visualizador de Material Didático</span>
        </div>

        {/* Card Principal do Documento */}
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Cabeçalho do Material */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <span className="badge badge-blue" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  {docInfo.course} • {docInfo.semester}º Semestre
                </span>
                <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                  {docInfo.type}
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  Código: {docInfo.code}
                </span>
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.3 }}>
                {docInfo.title}
              </h1>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Disciplina: <strong style={{ color: 'var(--text-main)' }}>{docInfo.subject}</strong> | Autor: <strong>{docInfo.author}</strong>
              </div>
            </div>

            {/* Ações do Topo */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link
                href="/repositorio"
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
              >
                ← Voltar ao Repositório
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                🖨️ Imprimir / Salvar PDF
              </button>
            </div>
          </div>

          {/* Sinopse / Descrição Oficial */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.6rem' }}>
              📋 Visão Geral e Ementa do Material
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-sub)', lineHeight: 1.6, margin: 0 }}>
              {docInfo.description}
            </p>
          </div>

          {/* Tópicos de Aprendizado / Conteúdo Programático */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.75rem' }}>
              📖 Conteúdo Programático Abordado
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {docInfo.syllabus.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    backgroundColor: 'var(--bg-muted)',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    color: 'var(--text-main)',
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 800 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exemplo de Código Didático (se houver) */}
          {docInfo.codeSnippet && (
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.025em', margin: 0 }}>
                  💻 Exemplo Prático de Código Homologado ({docInfo.codeSnippet.lang.toUpperCase()})
                </h2>
                {docInfo.githubUrl && (
                  <a
                    href={docInfo.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    Ver no GitHub ↗
                  </a>
                )}
              </div>
              <pre
                style={{
                  backgroundColor: '#0f172a',
                  color: '#f8fafc',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  overflowX: 'auto',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  lineHeight: 1.55,
                  border: '1px solid #1e293b',
                  margin: 0,
                }}
              >
                <code>{docInfo.codeSnippet.code}</code>
              </pre>
            </div>
          )}

          {/* Projetos da Vitrine que Utilizam esta Disciplina (se houver) */}
          {docInfo.appliedProjects && docInfo.appliedProjects.length > 0 && (
            <div style={{ marginBottom: '1.75rem', padding: '1.25rem', borderRadius: '12px', backgroundColor: 'rgba(2, 132, 199, 0.05)', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.65rem' }}>
                🚀 Aplicação Prática nos Projetos e TCCs da Vitrine
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {docInfo.appliedProjects.map((p, pIdx) => (
                  <div key={pIdx} style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    <strong>{p.name}:</strong> {p.description}{' '}
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}>
                        Ver projeto ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rodapé com Informações Institucionais */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>
              FATEC Rio Claro — Faculdade de Tecnologia de Rio Claro • Centro Paula Souza (CPS)
            </div>
            <Link
              href="/repositorio"
              style={{ color: 'var(--accent-blue)', fontWeight: 700, textDecoration: 'none' }}
            >
              Consultar outro material no Repositório →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

