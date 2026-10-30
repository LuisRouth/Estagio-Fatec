// ====================================================================
// CAMADA DE ACESSO A DADOS (POSTGRESQL + MOCK HÍBRIDO)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// ====================================================================

import { Pool } from 'pg';
import { User, CanteenProduct, Announcement, AuditLog, SafeUser } from './types';
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
// ESTADO EM MEMÓRIA (SEED MOCK PARA TESTES RÁPIDOS DA EQUIPE)
// ====================================================================
// Hash correspondente a "Fatec@2026"
const DEFAULT_HASH = bcrypt.hashSync('Fatec@2026', 10);

const mockUsers: User[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Cesar Administrador',
    email: 'cesar.admin@aluno.cps.sp.gov.br',
    ra: '2840001',
    password_hash: DEFAULT_HASH,
    role: 'ADMIN',
    course: 'IA',
    semester: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Luis Desenvolvedor',
    email: 'luis.dev@aluno.cps.sp.gov.br',
    ra: '2840002',
    password_hash: DEFAULT_HASH,
    role: 'CA_MEMBRO',
    course: 'IA',
    semester: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    name: 'Guilherme DevOps',
    email: 'guilherme.devops@aluno.cps.sp.gov.br',
    ra: '2840003',
    password_hash: DEFAULT_HASH,
    role: 'CA_MEMBRO',
    course: 'IA',
    semester: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockAnnouncements: Announcement[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    title: 'Portal Integrado FATEC Rio Claro no ar!',
    content: 'Acesse o catálogo da cantina, consulte materiais e registre seus comprovantes de forma digital.',
    priority: 'ALTA',
    author_id: 'a0000000-0000-0000-0000-000000000001',
    author_name: 'Cesar Administrador',
    is_pinned: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockAuditLogs: AuditLog[] = [];

// ====================================================================
// FUNÇÕES DE ACESSO A DADOS (INTERFACE UNIFICADA)
// ====================================================================

export const db = {
  isMockMode: () => isMock,

  // Usuários
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

  // Produtos da Cantina
  products: {
    listAvailable: async (): Promise<CanteenProduct[]> => {
      if (isMock || !pool) {
        return mockProducts.filter((p) => p.is_available);
      }
      const res = await pool.query('SELECT * FROM canteen_products WHERE is_available = TRUE ORDER BY category, name');
      return res.rows;
    },

    findById: async (id: string): Promise<CanteenProduct | null> => {
      if (isMock || !pool) {
        return mockProducts.find((p) => p.id === id) || null;
      }
      const res = await pool.query('SELECT * FROM canteen_products WHERE id = $1', [id]);
      return res.rows[0] || null;
    },
  },

  // Avisos
  announcements: {
    listActive: async (): Promise<Announcement[]> => {
      if (isMock || !pool) {
        return mockAnnouncements;
      }
      const res = await pool.query('SELECT * FROM announcements ORDER BY is_pinned DESC, created_at DESC LIMIT 20');
      return res.rows;
    },
  },

  // Auditoria
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
  },
};
