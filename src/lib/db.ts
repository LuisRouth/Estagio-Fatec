// ====================================================================
// CAMADA DE ACESSO A DADOS (POSTGRESQL + MOCK HÍBRIDO)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Sprint 2: Módulos Centrais (Catálogo Honest Market, Estoque, Pix,
// Histórico de Compras e Repositório Acadêmico / TCC)
// ====================================================================

import { Pool } from 'pg';
import {
  User,
  CanteenProduct,
  CanteenTransaction,
  CanteenTransactionItem,
  AcademicMaterial,
  Announcement,
  AuditLog,
  SafeUser,
  ItemCategory,
  TransactionStatus,
  CourseType,
  MaterialType,
} from './types';
import bcrypt from 'bcryptjs';

const isMock = process.env.USE_MOCK_DB === 'true' || !process.env.DATABASE_URL;

// Pool de conexão PostgreSQL real (para ambiente de produção ou banco local ativo)
let pool: Pool | null = null;

if (!isMock && process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

// ====================================================================
// ESTADO EM MEMÓRIA (SEED MOCK DETERMINÍSTICO PARA DESENVOLVIMENTO & TESTES)
// ====================================================================
const DEFAULT_HASH = bcrypt.hashSync('Fatec@2026', 10);

const mockUsers: User[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000006',
    name: 'Luis Otavio',
    email: 'luis.dev@fatec.sp.gov.br',
    ra: '2840002',
    password_hash: DEFAULT_HASH,
    role: 'ADMIN',
    course: 'IA',
    semester: 4,
    is_active: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000007',
    name: 'Cesar Bovo',
    email: 'cesar.admin@fatec.sp.gov.br',
    ra: '2840001',
    password_hash: DEFAULT_HASH,
    role: 'ADMIN',
    course: 'IA',
    semester: 4,
    is_active: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Cesar Bovo',
    email: 'cesar.admin@aluno.cps.sp.gov.br',
    ra: '2840001',
    password_hash: DEFAULT_HASH,
    role: 'ADMIN',
    course: 'IA',
    semester: 4,
    is_active: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Luis Otavio',
    email: 'luis.dev@aluno.cps.sp.gov.br',
    ra: '2840002',
    password_hash: DEFAULT_HASH,
    role: 'ADMIN',
    course: 'IA',
    semester: 4,
    is_active: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    name: 'Guilherme Romanzotti',
    email: 'guilherme.devops@aluno.cps.sp.gov.br',
    ra: '2840003',
    password_hash: DEFAULT_HASH,
    role: 'ADMIN',
    course: 'IA',
    semester: 4,
    is_active: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    name: 'Prof. Orlando',
    email: 'orlando.docente@aluno.cps.sp.gov.br',
    ra: '2849999',
    password_hash: DEFAULT_HASH,
    role: 'PROFESSOR',
    course: 'IA',
    semester: 4,
    is_active: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    name: 'Mariana ESG Silva',
    email: 'mariana.esg@aluno.cps.sp.gov.br',
    ra: '2841005',
    password_hash: DEFAULT_HASH,
    role: 'ALUNO',
    course: 'ESG',
    semester: 2,
    is_active: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
];

const mockProducts: CanteenProduct[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Refrigerante Coca-Cola Lata 350ml',
    description: 'Bebida gelada na geladeira da cantina discente',
    category: 'BEBIDA',
    price: 5.50,
    current_stock: 24,
    min_stock_alert: 6,
    image_url: '/images/products/coca_cola.png',
    barcode: '7894900010015',
    is_available: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Suco Del Valle Uva 290ml',
    description: 'Lata 290ml gelada',
    category: 'BEBIDA',
    price: 4.50,
    current_stock: 18,
    min_stock_alert: 5,
    image_url: '/images/products/suco_uva.png',
    barcode: '7894900530018',
    is_available: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    name: 'Água Mineral sem Gás 500ml',
    description: 'Garrafa 500ml gelada',
    category: 'BEBIDA',
    price: 3.00,
    current_stock: 30,
    min_stock_alert: 10,
    image_url: '/images/products/agua.png',
    barcode: '7896052600019',
    is_available: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    name: 'Salgadinho Doritos 55g',
    description: 'Nacho crocante tradicional',
    category: 'SALGADO',
    price: 6.00,
    current_stock: 15,
    min_stock_alert: 5,
    image_url: '/images/products/doritos.png',
    barcode: '7892840222949',
    is_available: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    name: 'Salgadinho Fandangos Queijo 45g',
    description: 'Snack assado sabor queijo',
    category: 'SALGADO',
    price: 4.50,
    current_stock: 12,
    min_stock_alert: 4,
    image_url: '/images/products/fandangos.png',
    barcode: '7892840813734',
    is_available: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000006',
    name: 'Salgado Assado Congelado (Esfiha de Carne)',
    description: 'Pronto para aquecer no micro-ondas do campus',
    category: 'CONGELADO',
    price: 7.00,
    current_stock: 10,
    min_stock_alert: 3,
    image_url: '/images/products/esfiha.png',
    barcode: '7891000100066',
    is_available: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000007',
    name: 'Chocolate KitKat 41,5g',
    description: 'Wafer coberto com chocolate ao leite',
    category: 'DOCE',
    price: 4.50,
    current_stock: 20,
    min_stock_alert: 5,
    image_url: '/images/products/kitkat.png',
    barcode: '7891000248881',
    is_available: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000008',
    name: 'Paçoca Rolha Tradicional',
    description: 'Doce tradicional de amendoim',
    category: 'DOCE',
    price: 1.50,
    current_stock: 45,
    min_stock_alert: 10,
    image_url: '/images/products/pacoca.png',
    barcode: '7896001200081',
    is_available: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'b0000000-0000-0000-0000-000000000009',
    name: 'Barra de Cereal Banana e Aveia',
    description: 'Opção rápida e saudável para o intervalo',
    category: 'DOCE',
    price: 3.00,
    current_stock: 16,
    min_stock_alert: 5,
    image_url: '/images/products/barra_cereal.png',
    barcode: '7891000300091',
    is_available: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
];

const mockTransactions: CanteenTransaction[] = [
  {
    id: 't0000000-0000-0000-0000-000000000001',
    user_id: 'a0000000-0000-0000-0000-000000000005',
    user_name: 'Mariana ESG Silva',
    user_email: 'mariana.esg@aluno.cps.sp.gov.br',
    total_amount: 11.50,
    status: 'PAGO',
    payment_method: 'PIX',
    pix_copy_paste: '00020126580014br.gov.bcb.pix0136ca.fatec.rc@aluno.cps.sp.gov.br520400005303986540511.505802BR5918FATEC RIO CLARO CA6009RIO CLARO62190515FAT202611030016304E8A2',
    pix_qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020126580014br.gov.bcb.pix0136ca.fatec.rc%40aluno.cps.sp.gov.br520400005303986540511.505802BR5918FATEC%20RIO%20CLARO%20CA6009RIO%20CLARO62190515FAT202611030016304E8A2',
    pix_end_to_end_id: 'E00038166202611031000001',
    notes: 'Compra confirmada via IA Gemini OCR',
    validated_by: 'a0000000-0000-0000-0000-000000000001',
    validated_at: new Date('2026-11-03T09:30:00Z').toISOString(),
    created_at: new Date('2026-11-03T09:25:00Z').toISOString(),
    updated_at: new Date('2026-11-03T09:30:00Z').toISOString(),
  },
  {
    id: 't0000000-0000-0000-0000-000000000002',
    user_id: 'a0000000-0000-0000-0000-000000000005',
    user_name: 'Mariana ESG Silva',
    user_email: 'mariana.esg@aluno.cps.sp.gov.br',
    total_amount: 6.00,
    status: 'PENDENTE',
    payment_method: 'PIX',
    pix_copy_paste: '00020126580014br.gov.bcb.pix0136ca.fatec.rc@aluno.cps.sp.gov.br52040000530398654046.005802BR5918FATEC RIO CLARO CA6009RIO CLARO62190515FAT202611030026304F1B3',
    pix_qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020126580014br.gov.bcb.pix0136ca.fatec.rc%40aluno.cps.sp.gov.br52040000530398654046.005802BR5918FATEC%20RIO%20CLARO%20CA6009RIO%20CLARO62190515FAT202611030026304F1B3',
    created_at: new Date('2026-11-03T10:15:00Z').toISOString(),
    updated_at: new Date('2026-11-03T10:15:00Z').toISOString(),
  },
];

const mockTransactionItems: CanteenTransactionItem[] = [
  {
    id: 'i0000000-0000-0000-0000-000000000001',
    transaction_id: 't0000000-0000-0000-0000-000000000001',
    product_id: 'b0000000-0000-0000-0000-000000000001',
    product_name: 'Refrigerante Coca-Cola Lata 350ml',
    quantity: 1,
    unit_price: 5.50,
    subtotal: 5.50,
    created_at: new Date('2026-11-03T09:25:00Z').toISOString(),
  },
  {
    id: 'i0000000-0000-0000-0000-000000000002',
    transaction_id: 't0000000-0000-0000-0000-000000000001',
    product_id: 'b0000000-0000-0000-0000-000000000004',
    product_name: 'Salgadinho Doritos 55g',
    quantity: 1,
    unit_price: 6.00,
    subtotal: 6.00,
    created_at: new Date('2026-11-03T09:25:00Z').toISOString(),
  },
  {
    id: 'i0000000-0000-0000-0000-000000000003',
    transaction_id: 't0000000-0000-0000-0000-000000000002',
    product_id: 'b0000000-0000-0000-0000-000000000004',
    product_name: 'Salgadinho Doritos 55g',
    quantity: 1,
    unit_price: 6.00,
    subtotal: 6.00,
    created_at: new Date('2026-11-03T10:15:00Z').toISOString(),
  },
];

const mockMaterials: AcademicMaterial[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    title: 'Slides e Caderno Jupyter: Machine Learning Supervisionado',
    description: 'Apostila e códigos práticos em Python cobrindo regressão linear, logística e árvores de decisão.',
    subject: 'Aprendizado de Máquina',
    course: 'IA',
    semester: 3,
    author_id: 'a0000000-0000-0000-0000-000000000004',
    author_name: 'Prof. Orlando',
    material_type: 'CODIGO',
    file_url: '/materials/ia/ml_intro.ipynb',
    github_url: 'https://github.com/fatec-rc/ia-ml',
    tags: 'machine-learning, python, scikit-learn, ia',
    download_count: 42,
    is_approved: true,
    created_at: new Date('2026-10-28T14:00:00Z').toISOString(),
    updated_at: new Date('2026-10-28T14:00:00Z').toISOString(),
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    title: 'Diretrizes de Governança e Relatórios de Sustentabilidade',
    description: 'Apostila em PDF com modelos de auditoria ambiental e cálculo de pegada de carbono para empresas.',
    subject: 'Governança Corporativa',
    course: 'ESG',
    semester: 2,
    author_id: 'a0000000-0000-0000-0000-000000000004',
    author_name: 'Prof. Orlando',
    material_type: 'APOSTILA',
    file_url: '/materials/esg/governanca_2026.pdf',
    github_url: null,
    tags: 'esg, sustentabilidade, governanca, relatorios',
    download_count: 19,
    is_approved: true,
    created_at: new Date('2026-10-29T16:00:00Z').toISOString(),
    updated_at: new Date('2026-10-29T16:00:00Z').toISOString(),
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    title: 'Projeto de TCC: Visão Computacional para Classificação de Resíduos',
    description: 'Trabalho de Conclusão de Curso integrando Redes Neurais Convolucionais (CNN) à separação automatizada de lixo reciclável.',
    subject: 'Trabalho de Graduação Interdisciplinar',
    course: 'IA',
    semester: 4,
    author_id: 'a0000000-0000-0000-0000-000000000001',
    author_name: 'Cesar Bovo',
    material_type: 'TCC',
    file_url: '/materials/tcc/tcc_visao_computacional_reciclagem.pdf',
    github_url: 'https://github.com/fatec-rc/tcc-visao-reciclagem',
    tags: 'tcc, visao-computacional, cnn, reciclagem, esg',
    download_count: 58,
    is_approved: true,
    created_at: new Date('2026-10-30T11:00:00Z').toISOString(),
    updated_at: new Date('2026-10-30T11:00:00Z').toISOString(),
  },
];

const mockAnnouncements: Announcement[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    title: 'Portal Integrado FATEC Rio Claro no ar!',
    content: 'Acesse o catálogo da cantina, consulte materiais e registre seus comprovantes de forma digital.',
    priority: 'ALTA',
    author_id: 'a0000000-0000-0000-0000-000000000001',
    author_name: 'Cesar Bovo',
    is_pinned: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    title: 'Entrega do Projeto de Estágio - Prof. Orlando',
    content: 'Atenção alunos do 4º semestre: a entrega da documentação e testes finais será no dia 16/11/2026 impreterivelmente.',
    priority: 'URGENTE',
    author_id: 'a0000000-0000-0000-0000-000000000004',
    author_name: 'Prof. Orlando',
    target_course: 'IA',
    is_pinned: true,
    created_at: new Date('2026-10-28T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-28T10:00:00Z').toISOString(),
  },
];

const mockAuditLogs: AuditLog[] = [];

// ====================================================================
// FUNÇÕES DE ACESSO A DADOS (INTERFACE UNIFICADA)
// ====================================================================

export const db = {
  isMockMode: () => isMock,

  // ------------------------------------------------------------------
  // 1. USUÁRIOS
  // ------------------------------------------------------------------
  users: {
    findByEmail: async (email: string): Promise<User | null> => {
      const normalizedEmail = email.toLowerCase().trim();
      if (isMock || !pool) {
        return mockUsers.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
      }
      const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [normalizedEmail]);
      return res.rows[0] || null;
    },

    findById: async (id: string): Promise<User | null> => {
      if (isMock || !pool) {
        return mockUsers.find((u) => u.id === id) || null;
      }
      const res = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      return res.rows[0] || null;
    },

    findByRa: async (ra: string): Promise<User | null> => {
      if (isMock || !pool) {
        return mockUsers.find((u) => u.ra === ra) || null;
      }
      const res = await pool.query('SELECT * FROM users WHERE ra = $1 LIMIT 1', [ra]);
      return res.rows[0] || null;
    },

    create: async (data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
      const now = new Date().toISOString();
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`;
      const newUser: User = { ...data, id, created_at: now, updated_at: now };

      if (isMock || !pool) {
        mockUsers.push(newUser);
        return newUser;
      }

      const res = await pool.query(
        `INSERT INTO users (id, name, email, ra, password_hash, role, course, semester, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [id, data.name, data.email, data.ra, data.password_hash, data.role, data.course, data.semester, data.is_active]
      );
      return res.rows[0];
    },

    listAll: async (): Promise<SafeUser[]> => {
      if (isMock || !pool) {
        return mockUsers.map(({ password_hash: _, ...safe }) => safe);
      }
      const res = await pool.query('SELECT id, name, email, ra, role, course, semester, is_active, created_at, updated_at FROM users');
      return res.rows;
    },
  },

  // ------------------------------------------------------------------
  // 2. PRODUTOS DA CANTINA (HONEST MARKET & CONTROLE DE ESTOQUE)
  // ------------------------------------------------------------------
  products: {
    listAvailable: async (filters?: { category?: ItemCategory; search?: string }): Promise<CanteenProduct[]> => {
      if (isMock || !pool) {
        let items = mockProducts.filter((p) => p.is_available);
        if (filters?.category) {
          items = items.filter((p) => p.category === filters.category);
        }
        if (filters?.search) {
          const s = filters.search.toLowerCase().trim();
          items = items.filter((p) => p.name.toLowerCase().includes(s) || (p.description && p.description.toLowerCase().includes(s)));
        }
        return items.sort((a, b) => a.name.localeCompare(b.name));
      }

      let query = 'SELECT * FROM canteen_products WHERE is_available = TRUE';
      const params: any[] = [];
      let pIdx = 1;

      if (filters?.category) {
        query += ` AND category = $${pIdx++}`;
        params.push(filters.category);
      }
      if (filters?.search) {
        query += ` AND (name ILIKE $${pIdx} OR description ILIKE $${pIdx})`;
        params.push(`%${filters.search}%`);
        pIdx++;
      }
      query += ' ORDER BY category, name';

      const res = await pool.query(query, params);
      return res.rows;
    },

    listAll: async (filters?: { category?: ItemCategory; search?: string; onlyAvailable?: boolean }): Promise<CanteenProduct[]> => {
      if (isMock || !pool) {
        let items = [...mockProducts];
        if (filters?.onlyAvailable) {
          items = items.filter((p) => p.is_available);
        }
        if (filters?.category) {
          items = items.filter((p) => p.category === filters.category);
        }
        if (filters?.search) {
          const s = filters.search.toLowerCase().trim();
          items = items.filter((p) => p.name.toLowerCase().includes(s) || (p.description && p.description.toLowerCase().includes(s)));
        }
        return items.sort((a, b) => a.name.localeCompare(b.name));
      }

      let query = 'SELECT * FROM canteen_products WHERE 1=1';
      const params: any[] = [];
      let pIdx = 1;

      if (filters?.onlyAvailable) {
        query += ` AND is_available = TRUE`;
      }
      if (filters?.category) {
        query += ` AND category = $${pIdx++}`;
        params.push(filters.category);
      }
      if (filters?.search) {
        query += ` AND (name ILIKE $${pIdx} OR description ILIKE $${pIdx})`;
        params.push(`%${filters.search}%`);
        pIdx++;
      }
      query += ' ORDER BY category, name';

      const res = await pool.query(query, params);
      return res.rows;
    },

    findById: async (id: string): Promise<CanteenProduct | null> => {
      if (isMock || !pool) {
        return mockProducts.find((p) => p.id === id) || null;
      }
      const res = await pool.query('SELECT * FROM canteen_products WHERE id = $1', [id]);
      return res.rows[0] || null;
    },

    create: async (data: Omit<CanteenProduct, 'id' | 'created_at' | 'updated_at'>): Promise<CanteenProduct> => {
      const now = new Date().toISOString();
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prod-${Date.now()}`;
      const newProduct: CanteenProduct = {
        ...data,
        id,
        current_stock: Math.max(0, data.current_stock || 0),
        min_stock_alert: data.min_stock_alert ?? 5,
        is_available: data.is_available ?? true,
        created_at: now,
        updated_at: now,
      };

      if (isMock || !pool) {
        mockProducts.push(newProduct);
        return newProduct;
      }

      const res = await pool.query(
        `INSERT INTO canteen_products (id, name, description, category, price, current_stock, min_stock_alert, image_url, barcode, is_available)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          id,
          data.name,
          data.description || null,
          data.category,
          data.price,
          newProduct.current_stock,
          newProduct.min_stock_alert,
          data.image_url || null,
          data.barcode || null,
          newProduct.is_available,
        ]
      );
      return res.rows[0];
    },

    update: async (id: string, data: Partial<Omit<CanteenProduct, 'id' | 'created_at' | 'updated_at'>>): Promise<CanteenProduct | null> => {
      const now = new Date().toISOString();

      if (isMock || !pool) {
        const idx = mockProducts.findIndex((p) => p.id === id);
        if (idx === -1) return null;
        const current = mockProducts[idx];
        const updated: CanteenProduct = {
          ...current,
          ...data,
          current_stock: data.current_stock !== undefined ? Math.max(0, data.current_stock) : current.current_stock,
          updated_at: now,
        };
        mockProducts[idx] = updated;
        return updated;
      }

      const fields: string[] = [];
      const values: any[] = [];
      let pIdx = 1;

      Object.entries(data).forEach(([key, val]) => {
        fields.push(`${key} = $${pIdx++}`);
        values.push(val);
      });
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const res = await pool.query(
        `UPDATE canteen_products SET ${fields.join(', ')} WHERE id = $${pIdx} RETURNING *`,
        values
      );
      return res.rows[0] || null;
    },

    delete: async (id: string): Promise<boolean> => {
      if (isMock || !pool) {
        const idx = mockProducts.findIndex((p) => p.id === id);
        if (idx === -1) return false;
        mockProducts.splice(idx, 1);
        return true;
      }
      const res = await pool.query('DELETE FROM canteen_products WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    },

    updateStock: async (
      id: string,
      deltaOrExact: { quantityDelta?: number; exactStock?: number }
    ): Promise<{ product: CanteenProduct | null; lowStockAlert: boolean }> => {
      const now = new Date().toISOString();

      if (isMock || !pool) {
        const prod = mockProducts.find((p) => p.id === id);
        if (!prod) return { product: null, lowStockAlert: false };

        let nextStock = prod.current_stock;
        if (typeof deltaOrExact.exactStock === 'number') {
          nextStock = deltaOrExact.exactStock;
        } else if (typeof deltaOrExact.quantityDelta === 'number') {
          nextStock += deltaOrExact.quantityDelta;
        }

        if (nextStock < 0) {
          throw new Error(`Estoque insuficiente para o produto "${prod.name}". Saldo disponível: ${prod.current_stock}.`);
        }

        prod.current_stock = nextStock;
        prod.updated_at = now;
        const lowStockAlert = prod.current_stock <= prod.min_stock_alert;
        return { product: prod, lowStockAlert };
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const checkRes = await client.query('SELECT * FROM canteen_products WHERE id = $1 FOR UPDATE', [id]);
        if (checkRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return { product: null, lowStockAlert: false };
        }
        const currentProd = checkRes.rows[0] as CanteenProduct;
        let nextStock = currentProd.current_stock;

        if (typeof deltaOrExact.exactStock === 'number') {
          nextStock = deltaOrExact.exactStock;
        } else if (typeof deltaOrExact.quantityDelta === 'number') {
          nextStock += deltaOrExact.quantityDelta;
        }

        if (nextStock < 0) {
          await client.query('ROLLBACK');
          throw new Error(`Estoque insuficiente para o produto "${currentProd.name}". Saldo atual: ${currentProd.current_stock}.`);
        }

        const updateRes = await client.query(
          'UPDATE canteen_products SET current_stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          [nextStock, id]
        );
        await client.query('COMMIT');
        const updated = updateRes.rows[0] as CanteenProduct;
        return { product: updated, lowStockAlert: updated.current_stock <= updated.min_stock_alert };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },
  },

  // ------------------------------------------------------------------
  // 3. TRANSAÇÕES DA CANTINA & EXTRATO DE COMPRAS DO ALUNO
  // ------------------------------------------------------------------
  transactions: {
    create: async (
      txData: Omit<CanteenTransaction, 'id' | 'created_at' | 'updated_at'>,
      items: Array<{ productId: string; quantity: number; unitPrice: number; productName?: string }>,
      deductStock = true
    ): Promise<CanteenTransaction> => {
      const now = new Date().toISOString();
      const txId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tx-${Date.now()}`;

      if (isMock || !pool) {
        // Validação e baixa de estoque atômica no mock
        if (deductStock) {
          for (const item of items) {
            const p = mockProducts.find((prod) => prod.id === item.productId);
            if (!p) throw new Error(`Produto não localizado: ${item.productId}`);
            if (p.current_stock < item.quantity) {
              throw new Error(`Estoque insuficiente para "${p.name}". Solicitado: ${item.quantity}, Em estoque: ${p.current_stock}`);
            }
          }
          for (const item of items) {
            const p = mockProducts.find((prod) => prod.id === item.productId)!;
            p.current_stock -= item.quantity;
            p.updated_at = now;
          }
        }

        const user = mockUsers.find((u) => u.id === txData.user_id);
        const newTx: CanteenTransaction = {
          ...txData,
          id: txId,
          user_name: user?.name || txData.user_name || 'Discente FATEC',
          user_email: user?.email || txData.user_email || '',
          created_at: now,
          updated_at: now,
        };

        const createdItems: CanteenTransactionItem[] = [];
        for (const item of items) {
          const itemId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random()}`;
          const prod = mockProducts.find((p) => p.id === item.productId);
          const tItem: CanteenTransactionItem = {
            id: itemId,
            transaction_id: txId,
            product_id: item.productId,
            product_name: prod?.name || item.productName || 'Item Cantina',
            quantity: item.quantity,
            unit_price: item.unitPrice,
            subtotal: Number((item.quantity * item.unitPrice).toFixed(2)),
            created_at: now,
          };
          createdItems.push(tItem);
          mockTransactionItems.push(tItem);
        }

        newTx.items = createdItems;
        mockTransactions.unshift(newTx);
        return newTx;
      }

      // Conexão PostgreSQL com Transação ACID
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        if (deductStock) {
          for (const item of items) {
            const prodRes = await client.query('SELECT name, current_stock FROM canteen_products WHERE id = $1 FOR UPDATE', [item.productId]);
            if (prodRes.rows.length === 0) {
              throw new Error(`Produto não encontrado: ${item.productId}`);
            }
            const prod = prodRes.rows[0];
            if (prod.current_stock < item.quantity) {
              throw new Error(`Estoque insuficiente para "${prod.name}". Saldo: ${prod.current_stock}, Pedido: ${item.quantity}`);
            }
            await client.query('UPDATE canteen_products SET current_stock = current_stock - $1 WHERE id = $2', [item.quantity, item.productId]);
          }
        }

        const txRes = await client.query(
          `INSERT INTO canteen_transactions (
             id, user_id, total_amount, status, payment_method, pix_copy_paste,
             pix_qr_code_url, pix_end_to_end_id, proof_image_url, notes
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
          [
            txId,
            txData.user_id,
            txData.total_amount,
            txData.status,
            txData.payment_method || 'PIX',
            txData.pix_copy_paste || null,
            txData.pix_qr_code_url || null,
            txData.pix_end_to_end_id || null,
            txData.proof_image_url || null,
            txData.notes || null,
          ]
        );

        const createdTx = txRes.rows[0] as CanteenTransaction;
        const createdItems: CanteenTransactionItem[] = [];

        for (const item of items) {
          const itemRes = await client.query(
            `INSERT INTO canteen_transaction_items (transaction_id, product_id, quantity, unit_price)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [txId, item.productId, item.quantity, item.unitPrice]
          );
          createdItems.push(itemRes.rows[0]);
        }

        await client.query('COMMIT');
        createdTx.items = createdItems;
        return createdTx;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },

    findById: async (id: string): Promise<(CanteenTransaction & { items: CanteenTransactionItem[] }) | null> => {
      if (isMock || !pool) {
        const tx = mockTransactions.find((t) => t.id === id);
        if (!tx) return null;
        const items = mockTransactionItems.filter((i) => i.transaction_id === id);
        return { ...tx, items };
      }

      const txRes = await pool.query(
        `SELECT t.*, u.name as user_name, u.email as user_email
         FROM canteen_transactions t
         JOIN users u ON u.id = t.user_id
         WHERE t.id = $1`,
        [id]
      );
      if (txRes.rows.length === 0) return null;

      const itemsRes = await pool.query(
        `SELECT ti.*, p.name as product_name
         FROM canteen_transaction_items ti
         JOIN canteen_products p ON p.id = ti.product_id
         WHERE ti.transaction_id = $1`,
        [id]
      );

      return {
        ...txRes.rows[0],
        items: itemsRes.rows,
      };
    },

    findByUserId: async (
      userId: string,
      filters?: { status?: TransactionStatus; limit?: number; offset?: number }
    ): Promise<Array<CanteenTransaction & { items: CanteenTransactionItem[] }>> => {
      if (isMock || !pool) {
        let list = mockTransactions.filter((t) => t.user_id === userId);
        if (filters?.status) {
          list = list.filter((t) => t.status === filters.status);
        }
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        if (filters?.offset) {
          list = list.slice(filters.offset);
        }
        if (filters?.limit) {
          list = list.slice(0, filters.limit);
        }

        return list.map((tx) => ({
          ...tx,
          items: mockTransactionItems.filter((i) => i.transaction_id === tx.id),
        }));
      }

      let query = `
        SELECT t.*, u.name as user_name, u.email as user_email
        FROM canteen_transactions t
        JOIN users u ON u.id = t.user_id
        WHERE t.user_id = $1
      `;
      const params: any[] = [userId];
      let pIdx = 2;

      if (filters?.status) {
        query += ` AND t.status = $${pIdx++}`;
        params.push(filters.status);
      }
      query += ` ORDER BY t.created_at DESC`;

      if (filters?.limit) {
        query += ` LIMIT $${pIdx++}`;
        params.push(filters.limit);
      }
      if (filters?.offset) {
        query += ` OFFSET $${pIdx++}`;
        params.push(filters.offset);
      }

      const txs = (await pool.query(query, params)).rows;
      if (txs.length === 0) return [];

      const txIds = txs.map((t) => t.id);
      const itemsRes = await pool.query(
        `SELECT ti.*, p.name as product_name
         FROM canteen_transaction_items ti
         JOIN canteen_products p ON p.id = ti.product_id
         WHERE ti.transaction_id = ANY($1::uuid[])`,
        [txIds]
      );

      const itemsMap = new Map<string, CanteenTransactionItem[]>();
      itemsRes.rows.forEach((item) => {
        const arr = itemsMap.get(item.transaction_id) || [];
        arr.push(item);
        itemsMap.set(item.transaction_id, arr);
      });

      return txs.map((t) => ({
        ...t,
        items: itemsMap.get(t.id) || [],
      }));
    },

    listAll: async (
      filters?: { status?: TransactionStatus; userId?: string; limit?: number; offset?: number }
    ): Promise<Array<CanteenTransaction & { items: CanteenTransactionItem[] }>> => {
      if (isMock || !pool) {
        let list = [...mockTransactions];
        if (filters?.userId) {
          list = list.filter((t) => t.user_id === filters.userId);
        }
        if (filters?.status) {
          list = list.filter((t) => t.status === filters.status);
        }
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        if (filters?.offset) {
          list = list.slice(filters.offset);
        }
        if (filters?.limit) {
          list = list.slice(0, filters.limit);
        }

        return list.map((tx) => ({
          ...tx,
          items: mockTransactionItems.filter((i) => i.transaction_id === tx.id),
        }));
      }

      let query = `
        SELECT t.*, u.name as user_name, u.email as user_email
        FROM canteen_transactions t
        JOIN users u ON u.id = t.user_id
        WHERE 1=1
      `;
      const params: any[] = [];
      let pIdx = 1;

      if (filters?.userId) {
        query += ` AND t.user_id = $${pIdx++}`;
        params.push(filters.userId);
      }
      if (filters?.status) {
        query += ` AND t.status = $${pIdx++}`;
        params.push(filters.status);
      }
      query += ` ORDER BY t.created_at DESC`;

      if (filters?.limit) {
        query += ` LIMIT $${pIdx++}`;
        params.push(filters.limit);
      }
      if (filters?.offset) {
        query += ` OFFSET $${pIdx++}`;
        params.push(filters.offset);
      }

      const txs = (await pool.query(query, params)).rows;
      if (txs.length === 0) return [];

      const txIds = txs.map((t) => t.id);
      const itemsRes = await pool.query(
        `SELECT ti.*, p.name as product_name
         FROM canteen_transaction_items ti
         JOIN canteen_products p ON p.id = ti.product_id
         WHERE ti.transaction_id = ANY($1::uuid[])`,
        [txIds]
      );

      const itemsMap = new Map<string, CanteenTransactionItem[]>();
      itemsRes.rows.forEach((item) => {
        const arr = itemsMap.get(item.transaction_id) || [];
        arr.push(item);
        itemsMap.set(item.transaction_id, arr);
      });

      return txs.map((t) => ({
        ...t,
        items: itemsMap.get(t.id) || [],
      }));
    },

    updateStatus: async (
      id: string,
      status: TransactionStatus,
      options?: { validatedBy?: string; proofImageUrl?: string; notes?: string; endToEndId?: string }
    ): Promise<CanteenTransaction | null> => {
      const now = new Date().toISOString();

      if (isMock || !pool) {
        const tx = mockTransactions.find((t) => t.id === id);
        if (!tx) return null;

        // Se o pedido for cancelado, repor estoque
        if (status === 'CANCELADO' && tx.status !== 'CANCELADO') {
          const items = mockTransactionItems.filter((i) => i.transaction_id === id);
          for (const item of items) {
            const p = mockProducts.find((prod) => prod.id === item.product_id);
            if (p) p.current_stock += item.quantity;
          }
        }

        tx.status = status;
        if (options?.validatedBy) tx.validated_by = options.validatedBy;
        if (options?.proofImageUrl) tx.proof_image_url = options.proofImageUrl;
        if (options?.notes) tx.notes = options.notes;
        if (options?.endToEndId) tx.pix_end_to_end_id = options.endToEndId;
        if (status === 'PAGO') tx.validated_at = now;
        tx.updated_at = now;
        return tx;
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const currentTxRes = await client.query('SELECT * FROM canteen_transactions WHERE id = $1 FOR UPDATE', [id]);
        if (currentTxRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return null;
        }
        const currentTx = currentTxRes.rows[0] as CanteenTransaction;

        if (status === 'CANCELADO' && currentTx.status !== 'CANCELADO') {
          const items = await client.query('SELECT product_id, quantity FROM canteen_transaction_items WHERE transaction_id = $1', [id]);
          for (const item of items.rows) {
            await client.query('UPDATE canteen_products SET current_stock = current_stock + $1 WHERE id = $2', [item.quantity, item.product_id]);
          }
        }

        const updateRes = await client.query(
          `UPDATE canteen_transactions
           SET status = $1,
               validated_by = COALESCE($2, validated_by),
               proof_image_url = COALESCE($3, proof_image_url),
               notes = COALESCE($4, notes),
               pix_end_to_end_id = COALESCE($5, pix_end_to_end_id),
               validated_at = CASE WHEN $1 = 'PAGO' THEN CURRENT_TIMESTAMP ELSE validated_at END,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $6 RETURNING *`,
          [status, options?.validatedBy || null, options?.proofImageUrl || null, options?.notes || null, options?.endToEndId || null, id]
        );

        await client.query('COMMIT');
        return updateRes.rows[0];
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },

    getStudentStatement: async (userId: string) => {
      const txs = await db.transactions.findByUserId(userId);
      const totalSpent = txs
        .filter((t) => t.status === 'PAGO')
        .reduce((sum, t) => sum + Number(t.total_amount), 0);
      const paidCount = txs.filter((t) => t.status === 'PAGO').length;
      const pendingCount = txs.filter((t) => t.status === 'PENDENTE').length;
      const inAnalysisCount = txs.filter((t) => t.status === 'EM_ANALISE').length;

      return {
        userId,
        summary: {
          totalTransactions: txs.length,
          totalSpent: Number(totalSpent.toFixed(2)),
          paidCount,
          pendingCount,
          inAnalysisCount,
        },
        transactions: txs,
      };
    },
  },

  // ------------------------------------------------------------------
  // 4. REPOSITÓRIO ACADÊMICO & VITRINE DE PROJETOS DE TCC
  // ------------------------------------------------------------------
  materials: {
    list: async (filters?: {
      course?: CourseType;
      semester?: number;
      materialType?: MaterialType;
      subject?: string;
      search?: string;
      onlyApproved?: boolean;
    }): Promise<AcademicMaterial[]> => {
      if (isMock || !pool) {
        let items = [...mockMaterials];
        if (filters?.onlyApproved !== false) {
          items = items.filter((m) => m.is_approved);
        }
        if (filters?.course) {
          items = items.filter((m) => m.course === filters.course);
        }
        if (filters?.semester) {
          items = items.filter((m) => m.semester === filters.semester);
        }
        if (filters?.materialType) {
          items = items.filter((m) => m.material_type === filters.materialType);
        }
        if (filters?.subject) {
          const subj = filters.subject.toLowerCase();
          items = items.filter((m) => m.subject.toLowerCase().includes(subj));
        }
        if (filters?.search) {
          const s = filters.search.toLowerCase().trim();
          items = items.filter(
            (m) =>
              m.title.toLowerCase().includes(s) ||
              (m.description && m.description.toLowerCase().includes(s)) ||
              (m.tags && m.tags.toLowerCase().includes(s)) ||
              m.subject.toLowerCase().includes(s)
          );
        }
        return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      let query = `
        SELECT m.*, u.name as author_name
        FROM academic_materials m
        JOIN users u ON u.id = m.author_id
        WHERE 1=1
      `;
      const params: any[] = [];
      let pIdx = 1;

      if (filters?.onlyApproved !== false) {
        query += ` AND m.is_approved = TRUE`;
      }
      if (filters?.course) {
        query += ` AND m.course = $${pIdx++}`;
        params.push(filters.course);
      }
      if (filters?.semester) {
        query += ` AND m.semester = $${pIdx++}`;
        params.push(filters.semester);
      }
      if (filters?.materialType) {
        query += ` AND m.material_type = $${pIdx++}`;
        params.push(filters.materialType);
      }
      if (filters?.subject) {
        query += ` AND m.subject ILIKE $${pIdx++}`;
        params.push(`%${filters.subject}%`);
      }
      if (filters?.search) {
        query += ` AND (m.title ILIKE $${pIdx} OR m.description ILIKE $${pIdx} OR m.tags ILIKE $${pIdx} OR m.subject ILIKE $${pIdx})`;
        params.push(`%${filters.search}%`);
        pIdx++;
      }
      query += ` ORDER BY m.created_at DESC`;

      const res = await pool.query(query, params);
      return res.rows;
    },

    findById: async (id: string): Promise<AcademicMaterial | null> => {
      if (isMock || !pool) {
        return mockMaterials.find((m) => m.id === id) || null;
      }
      const res = await pool.query(
        `SELECT m.*, u.name as author_name
         FROM academic_materials m
         JOIN users u ON u.id = m.author_id
         WHERE m.id = $1`,
        [id]
      );
      return res.rows[0] || null;
    },

    create: async (data: Omit<AcademicMaterial, 'id' | 'download_count' | 'created_at' | 'updated_at'>): Promise<AcademicMaterial> => {
      const now = new Date().toISOString();
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mat-${Date.now()}`;
      const author = mockUsers.find((u) => u.id === data.author_id);
      const newMaterial: AcademicMaterial = {
        ...data,
        id,
        author_name: author?.name || data.author_name || 'Docente FATEC',
        download_count: 0,
        is_approved: data.is_approved ?? true,
        created_at: now,
        updated_at: now,
      };

      if (isMock || !pool) {
        mockMaterials.unshift(newMaterial);
        return newMaterial;
      }

      const res = await pool.query(
        `INSERT INTO academic_materials (
           id, title, description, subject, course, semester, author_id,
           material_type, file_url, github_url, tags, is_approved
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
          id,
          data.title,
          data.description || null,
          data.subject,
          data.course,
          data.semester,
          data.author_id,
          data.material_type,
          data.file_url,
          data.github_url || null,
          data.tags || null,
          newMaterial.is_approved,
        ]
      );
      return res.rows[0];
    },

    update: async (id: string, data: Partial<AcademicMaterial>): Promise<AcademicMaterial | null> => {
      const now = new Date().toISOString();

      if (isMock || !pool) {
        const idx = mockMaterials.findIndex((m) => m.id === id);
        if (idx === -1) return null;
        const current = mockMaterials[idx];
        const updated: AcademicMaterial = {
          ...current,
          ...data,
          updated_at: now,
        };
        mockMaterials[idx] = updated;
        return updated;
      }

      const fields: string[] = [];
      const values: any[] = [];
      let pIdx = 1;

      Object.entries(data).forEach(([key, val]) => {
        if (key !== 'id' && key !== 'created_at') {
          fields.push(`${key} = $${pIdx++}`);
          values.push(val);
        }
      });
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const res = await pool.query(`UPDATE academic_materials SET ${fields.join(', ')} WHERE id = $${pIdx} RETURNING *`, values);
      return res.rows[0] || null;
    },

    delete: async (id: string): Promise<boolean> => {
      if (isMock || !pool) {
        const idx = mockMaterials.findIndex((m) => m.id === id);
        if (idx === -1) return false;
        mockMaterials.splice(idx, 1);
        return true;
      }
      const res = await pool.query('DELETE FROM academic_materials WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    },

    incrementDownloadCount: async (id: string): Promise<number> => {
      if (isMock || !pool) {
        const mat = mockMaterials.find((m) => m.id === id);
        if (!mat) return 0;
        mat.download_count += 1;
        return mat.download_count;
      }
      const res = await pool.query('UPDATE academic_materials SET download_count = download_count + 1 WHERE id = $1 RETURNING download_count', [id]);
      return res.rows[0]?.download_count ?? 0;
    },
  },

  // ------------------------------------------------------------------
  // 5. AVISOS INSTITUCIONAIS (CARD #S2-C2)
  // ------------------------------------------------------------------
  announcements: {
    listActive: async (filters?: { course?: CourseType; semester?: number }): Promise<Announcement[]> => {
      if (isMock || !pool) {
        let items = [...mockAnnouncements];
        if (filters?.course) {
          items = items.filter((a) => !a.target_course || a.target_course === filters.course);
        }
        if (filters?.semester) {
          items = items.filter((a) => !a.target_semester || a.target_semester === filters.semester);
        }
        return items.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
      }

      let query = `
        SELECT a.*, u.name as author_name
        FROM announcements a
        JOIN users u ON u.id = a.author_id
        WHERE 1=1
      `;
      const params: any[] = [];
      let pIdx = 1;

      if (filters?.course) {
        query += ` AND (a.target_course IS NULL OR a.target_course = $${pIdx++})`;
        params.push(filters.course);
      }
      if (filters?.semester) {
        query += ` AND (a.target_semester IS NULL OR a.target_semester = $${pIdx++})`;
        params.push(filters.semester);
      }
      query += ` ORDER BY a.is_pinned DESC, a.created_at DESC LIMIT 20`;

      const res = await pool.query(query, params);
      return res.rows;
    },

    create: async (data: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<Announcement> => {
      const now = new Date().toISOString();
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ann-${Date.now()}`;
      const author = mockUsers.find((u) => u.id === data.author_id);
      const newAnn: Announcement = {
        ...data,
        id,
        author_name: author?.name || 'Comissão FATEC',
        created_at: now,
        updated_at: now,
      };

      if (isMock || !pool) {
        mockAnnouncements.unshift(newAnn);
        return newAnn;
      }

      const res = await pool.query(
        `INSERT INTO announcements (id, title, content, priority, author_id, target_course, target_semester, is_pinned, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [id, data.title, data.content, data.priority, data.author_id, data.target_course || null, data.target_semester || null, data.is_pinned || false, data.expires_at || null]
      );
      return res.rows[0];
    },

    delete: async (id: string): Promise<boolean> => {
      if (isMock || !pool) {
        const idx = mockAnnouncements.findIndex((a) => a.id === id);
        if (idx === -1) return false;
        mockAnnouncements.splice(idx, 1);
        return true;
      }
      const res = await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    },
  },

  // ------------------------------------------------------------------
  // 6. TRILHA DE AUDITORIA DE SEGURANÇA E CONFORMIDADE (OWASP)
  // ------------------------------------------------------------------
  audit: {
    log: async (log: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> => {
      const now = new Date().toISOString();
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`;
      const entry: AuditLog = { ...log, id, created_at: now };

      if (isMock || !pool) {
        mockAuditLogs.push(entry);
        return;
      }

      await pool.query(
        `INSERT INTO audit_logs (id, user_id, action, entity_name, entity_id, ip_address, user_agent, payload)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, log.user_id, log.action, log.entity_name, log.entity_id, log.ip_address, log.user_agent, JSON.stringify(log.payload || {})]
      );
    },

    listRecent: async (limit = 50): Promise<AuditLog[]> => {
      if (isMock || !pool) {
        return [...mockAuditLogs].reverse().slice(0, limit);
      }
      const res = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1', [limit]);
      return res.rows;
    },
  },
};
