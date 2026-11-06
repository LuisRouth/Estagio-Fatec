import fs from 'fs';
import path from 'path';
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
  CanteenFinancialAnalytics,
  ProductSalesRankingItem,
  AuditAnalyticsReport,
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
    id: 'a0000000-0000-0000-0000-000000000007',
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
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Cesar Silva (Líder CA)',
    email: 'cesar.dev@aluno.cps.sp.gov.br',
    ra: '20241001001',
    password_hash: DEFAULT_HASH,
    role: 'ADMIN',
    course: 'IA',
    semester: 4,
    is_active: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000008',
    name: 'Guilherme Romanzotti',
    email: 'guilherme.dev@aluno.cps.sp.gov.br',
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
    name: 'Lucas Mendes (Aluno IA)',
    email: 'lucas.mendes@aluno.cps.sp.gov.br',
    ra: '20241001002',
    password_hash: DEFAULT_HASH,
    role: 'ALUNO',
    course: 'IA',
    semester: 3,
    is_active: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    name: 'Beatriz Santos (Aluna ESG)',
    email: 'beatriz.santos@aluno.cps.sp.gov.br',
    ra: '20242001001',
    password_hash: DEFAULT_HASH,
    role: 'ALUNO',
    course: 'ESG',
    semester: 2,
    is_active: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    name: 'Prof. Orlando Saraiva Jr.',
    email: 'orlando.saraiva@fatec.sp.gov.br',
    ra: '10000000001',
    password_hash: DEFAULT_HASH,
    role: 'PROFESSOR',
    course: 'IA',
    semester: 4,
    is_active: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Admin FATEC',
    email: 'admin@fatec.sp.gov.br',
    ra: '000000000000',
    password_hash: DEFAULT_HASH,
    role: 'ADMIN',
    course: 'IA',
    semester: 4,
    is_active: true,
    created_at: new Date('2026-10-27T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-27T10:00:00Z').toISOString(),
  },
];

const PRODUCTS_STORAGE_FILE = path.join(process.cwd(), 'data', 'canteen_products.json');

function saveMockProductsToDisk() {
  try {
    const dir = path.dirname(PRODUCTS_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRODUCTS_STORAGE_FILE, JSON.stringify(mockProducts, null, 2), 'utf8');
  } catch (err) {
    console.error('Falha ao persistir data/canteen_products.json:', err);
  }
}

function loadMockProductsFromDisk(initial: CanteenProduct[]): CanteenProduct[] {
  try {
    if (fs.existsSync(PRODUCTS_STORAGE_FILE)) {
      const data = fs.readFileSync(PRODUCTS_STORAGE_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Falha ao carregar data/canteen_products.json:', err);
  }
  try {
    const dir = path.dirname(PRODUCTS_STORAGE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PRODUCTS_STORAGE_FILE, JSON.stringify(initial, null, 2), 'utf8');
  } catch {}
  return [...initial];
}

const initialMockProducts: CanteenProduct[] = [
  {
    "id": "b0000000-0000-0000-0000-000000000001",
    "name": "Salgadinho Torcida Churrasco 70g",
    "description": "Petisco crocante sabor churrasco tradicional com pacote vermelho",
    "category": "SALGADO",
    "price": 3.5,
    "current_stock": 18,
    "min_stock_alert": 5,
    "image_url": "/images/products/torcida_churrasco.jpg",
    "barcode": "7892840817077",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000002",
    "name": "Salgadinho Torcida Queijo 70g",
    "description": "Petisco crocante sabor queijo suave no pacote amarelo",
    "category": "SALGADO",
    "price": 3.5,
    "current_stock": 16,
    "min_stock_alert": 5,
    "image_url": "/images/products/torcida_queijo.jpg",
    "barcode": "7892840817084",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000003",
    "name": "Salgadinho Fofura Assado Presunto 70g",
    "description": "Salgadinho assado clássico crocante sabor presunto",
    "category": "SALGADO",
    "price": 4,
    "current_stock": 14,
    "min_stock_alert": 4,
    "image_url": "/images/products/fofura_presunto.png",
    "barcode": "7892840823207",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000004",
    "name": "Amendoim Crokíssimo Salsa e Cebola 90g",
    "description": "Amendoim crocante verde Santa Helena",
    "category": "SALGADO",
    "price": 4.5,
    "current_stock": 12,
    "min_stock_alert": 3,
    "image_url": "/images/products/crokissimo_salsa.jpg",
    "barcode": "7896336000213",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000005",
    "name": "Biscoito Salgado Club Social Original 144g",
    "description": "Biscoito salgado crocante e leve em pacote individual",
    "category": "SALGADO",
    "price": 3.5,
    "current_stock": 20,
    "min_stock_alert": 5,
    "image_url": "/images/products/club_social_original.jpg",
    "barcode": "7622300990749",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000006",
    "name": "Coxinha de Frango Artesanal (Delícias da Vanuza)",
    "description": "Feito com amor, massa levinha e recheio farto de frango desfiado",
    "category": "CONGELADO",
    "price": 8.9,
    "current_stock": 8,
    "min_stock_alert": 3,
    "image_url": "/images/products/coxinha_frango.jpg",
    "barcode": "7899990000011",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000007",
    "name": "Enrolado de Presunto e Queijo (Delícias da Vanuza)",
    "description": "Salgado artesanal assado recheado com queijo derretido e presunto",
    "category": "CONGELADO",
    "price": 8.9,
    "current_stock": 10,
    "min_stock_alert": 3,
    "image_url": "/images/products/enrolado_presunto_queijo.jpg",
    "barcode": "7899990000028",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000008",
    "name": "Hambúrguer com Bacon Artesanal (Delícias da Vanuza)",
    "description": "Lanche completo assado, hambúrguer suculento e fatias de bacon crocante",
    "category": "CONGELADO",
    "price": 9.9,
    "current_stock": 6,
    "min_stock_alert": 2,
    "image_url": "/images/products/hamburguer_bacon.jpg",
    "barcode": "7899990000035",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000009",
    "name": "Chocolate Tortuguita Brigadeiro",
    "description": "Chocolate com a casquinha da tartaruga e recheio cremoso de brigadeiro",
    "category": "DOCE",
    "price": 2.5,
    "current_stock": 30,
    "min_stock_alert": 8,
    "image_url": "/images/products/tortuguita_brigadeiro.jpg",
    "barcode": "7891008123456",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000010",
    "name": "Chocolate Trento Wafer Chocolate 32g",
    "description": "Wafer crocante coberto com chocolate 38% cacau",
    "category": "DOCE",
    "price": 3,
    "current_stock": 24,
    "min_stock_alert": 6,
    "image_url": "/images/products/trento_chocolate.jpg",
    "barcode": "7896306612345",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000011",
    "name": "Pão de Mel Bauducco Especial",
    "description": "Pão de mel macio com especiarias e cobertura de chocolate",
    "category": "DOCE",
    "price": 5,
    "current_stock": 12,
    "min_stock_alert": 4,
    "image_url": "/images/products/pao_de_mel_bauducco.jpg",
    "barcode": "7891962054321",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000012",
    "name": "Energético X-UP Energy Drink Lata 473ml",
    "description": "Bebida energética gaseificada e refrescante, direto da geladeira",
    "category": "BEBIDA",
    "price": 8,
    "current_stock": 16,
    "min_stock_alert": 4,
    "image_url": "/images/products/xup_energetico.jpg",
    "barcode": "7896186305243",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000013",
    "name": "Refrigerante Coca-Cola Lata 350ml",
    "description": "Lata vermelha tradicional trincando de gelada",
    "category": "BEBIDA",
    "price": 5.5,
    "current_stock": 24,
    "min_stock_alert": 6,
    "image_url": "/images/products/coca_cola_lata.jpg",
    "barcode": "7894900010015",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000014",
    "name": "Refrigerante Fanta Laranja Lata 350ml",
    "description": "Fanta Laranja lata gelada",
    "category": "BEBIDA",
    "price": 5,
    "current_stock": 15,
    "min_stock_alert": 5,
    "image_url": "/images/products/fanta_laranja_lata.jpg",
    "barcode": "7894900030013",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000015",
    "name": "Água Mineral Minalba sem Gás 510ml",
    "description": "Garrafa de água mineral natural geladinha",
    "category": "BEBIDA",
    "price": 3,
    "current_stock": 28,
    "min_stock_alert": 8,
    "image_url": "/images/products/minalba_sem_gas.jpg",
    "barcode": "7896052600019",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000016",
    "name": "Sanduíche Hot Pocket Sadia X-Burguer",
    "description": "Lanche congelado pronto para aquecer no micro-ondas em 1 minuto e meio",
    "category": "CONGELADO",
    "price": 7.5,
    "current_stock": 14,
    "min_stock_alert": 4,
    "image_url": "/images/products/hot_pocket_sadia.jpg",
    "barcode": "7891515432101",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000017",
    "name": "Pipoca para Micro-Ondas Yoki Manteiga",
    "description": "Pacote individual 100g para estourar no micro-ondas discente",
    "category": "SALGADO",
    "price": 6.0,
    "current_stock": 20,
    "min_stock_alert": 5,
    "image_url": "/images/products/pipoca_microondas_yoki.jpg",
    "barcode": "7891000301010",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000018",
    "name": "Bolinho de Carne Artesanal (Delícias da Vanuza)",
    "description": "Salgado frito artesanal com recheio farto de carne moída temperada",
    "category": "CONGELADO",
    "price": 8.9,
    "current_stock": 8,
    "min_stock_alert": 3,
    "image_url": "/images/products/bolinho_carne.jpg",
    "barcode": "7899990000042",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000019",
    "name": "Esfiha de Carne Artesanal (Delícias da Vanuza)",
    "description": "Salgado assado fechado tradicional com recheio suculento de carne",
    "category": "CONGELADO",
    "price": 8.9,
    "current_stock": 7,
    "min_stock_alert": 2,
    "image_url": "/images/products/esfiha_carne.jpg",
    "barcode": "7899990000059",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000020",
    "name": "Pão de Queijo de Minas (04 unid.) (Delícias da Vanuza)",
    "description": "Porção com 4 pães de queijo tradicionais quentinhos do freezer",
    "category": "CONGELADO",
    "price": 8.9,
    "current_stock": 10,
    "min_stock_alert": 3,
    "image_url": "/images/products/pao_de_queijo.jpg",
    "barcode": "7899990000066",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000021",
    "name": "Amendoim Mendorato Japonês Santa Helena 70g",
    "description": "Amendoim crocante sabor clássico assado original Santa Helena",
    "category": "SALGADO",
    "price": 5.0,
    "current_stock": 25,
    "min_stock_alert": 6,
    "image_url": "/images/products/amendoim_mendorato.jpg",
    "barcode": "7896336016074",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000022",
    "name": "Biscoito Teens Wafer Chocolate Marilan 30g",
    "description": "Wafer recheado com creme de chocolate e casquinha crocante",
    "category": "DOCE",
    "price": 4.0,
    "current_stock": 18,
    "min_stock_alert": 5,
    "image_url": "/images/products/biscoito_teens_chocolate.webp",
    "barcode": "7891118025800",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000023",
    "name": "Chiclete Poosh Recheado Sortido Arcor",
    "description": "Chiclete com casquinha crocante e recheio líquido (Tutti-Frutti e Uva)",
    "category": "DOCE",
    "price": 0.5,
    "current_stock": 60,
    "min_stock_alert": 15,
    "image_url": "/images/products/chiclete_poosh.png",
    "barcode": "7891118025879",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000024",
    "name": "Pé de Moleque Crocante DaColônia",
    "description": "Pé de moleque artesanal crocante tradicional do pote DaColônia",
    "category": "DOCE",
    "price": 1.5,
    "current_stock": 35,
    "min_stock_alert": 10,
    "image_url": "/images/products/pe_de_moleque_dacolonia.jpg",
    "barcode": "7896012300044",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000025",
    "name": "Bala de Goma Tubo Gomets Dori Frutas 32g",
    "description": "Tubo colorido com balas de goma açucaradas nos sabores de frutas",
    "category": "DOCE",
    "price": 2.0,
    "current_stock": 40,
    "min_stock_alert": 10,
    "image_url": "/images/products/bala_goma_tubo_dori.png",
    "barcode": "7896001234567",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000026",
    "name": "Pastilha Drops Freegells Extra Forte Riclan",
    "description": "Drops refrescante mentolado e cereja clássico de balcão",
    "category": "DOCE",
    "price": 3.0,
    "current_stock": 25,
    "min_stock_alert": 8,
    "image_url": "/images/products/drops_freegells.png",
    "barcode": "7891234567890",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000027",
    "name": "Salgadinho Torcida Sabor Cebola 70g",
    "description": "Aperitivo de trigo crocante e assado no sabor clássico de cebola",
    "category": "SALGADO",
    "price": 3.5,
    "current_stock": 22,
    "min_stock_alert": 5,
    "image_url": "/images/products/torcida_cebola.jpg",
    "barcode": "7892840812423",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000028",
    "name": "Salgadinho Torcida Costelinha com Limão 70g",
    "description": "Aperitivo crocante de trigo temperado no sabor costelinha com limão",
    "category": "SALGADO",
    "price": 3.5,
    "current_stock": 20,
    "min_stock_alert": 5,
    "image_url": "/images/products/torcida_costelinha.jpg",
    "barcode": "7892840812430",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000029",
    "name": "Paçoquita Tradicional Rolha Santa Helena",
    "description": "Doce de amendoim tradicional prensado em formato rolha clássico",
    "category": "DOCE",
    "price": 1.0,
    "current_stock": 50,
    "min_stock_alert": 15,
    "image_url": "/images/products/pacoquita.jpg",
    "barcode": "7896336005511",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000030",
    "name": "Bala Regaliz Tubo Gigante Morango Dori 70g",
    "description": "Canudo longo de regaliz sabor morango com recheio cremoso para dividir com os amigos",
    "category": "DOCE",
    "price": 3.5,
    "current_stock": 16,
    "min_stock_alert": 4,
    "image_url": "/images/products/bala_tubo_gigante_dori.png",
    "barcode": "7896001234988",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000031",
    "name": "Trança de Calabresa Artesanal (Delícias da Vanuza)",
    "description": "Salgado assado em trança macia recheado com calabresa moída bem temperada",
    "category": "CONGELADO",
    "price": 8.9,
    "current_stock": 6,
    "min_stock_alert": 2,
    "image_url": null,
    "barcode": "7899990000073",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000032",
    "name": "Esfiha de Frango Artesanal (Delícias da Vanuza)",
    "description": "Salgado assado fechado recheado com peito de frango desfiado temperado",
    "category": "CONGELADO",
    "price": 8.9,
    "current_stock": 6,
    "min_stock_alert": 2,
    "image_url": null,
    "barcode": "7899990000080",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000033",
    "name": "Pão de Batata c/ Requeijão Artesanal (Delícias da Vanuza)",
    "description": "Pão de massa de batata fofinha e dourada com recheio cremoso de requeijão",
    "category": "CONGELADO",
    "price": 8.9,
    "current_stock": 8,
    "min_stock_alert": 2,
    "image_url": null,
    "barcode": "7899990000097",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  },
  {
    "id": "b0000000-0000-0000-0000-000000000034",
    "name": "Bolinha de Queijo Artesanal (Delícias da Vanuza)",
    "description": "Salgado frito crocante por fora com queijo derretido por dentro",
    "category": "CONGELADO",
    "price": 8.9,
    "current_stock": 10,
    "min_stock_alert": 3,
    "image_url": null,
    "barcode": "7899990000103",
    "is_available": true,
    "created_at": "2026-10-27T10:00:00.000Z",
    "updated_at": "2026-10-27T10:00:00.000Z"
  }
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

// Carrega os produtos salvos em disco (mantém fotos e edições permanentemente)
const mockProducts: CanteenProduct[] = loadMockProductsFromDisk(initialMockProducts);

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

const ANNOUNCEMENTS_STORAGE_FILE = path.join(process.cwd(), 'data', 'announcements.json');

function saveMockAnnouncementsToDisk() {
  try {
    const dir = path.dirname(ANNOUNCEMENTS_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ANNOUNCEMENTS_STORAGE_FILE, JSON.stringify(mockAnnouncements, null, 2), 'utf8');
  } catch (err) {
    console.error('Falha ao persistir data/announcements.json:', err);
  }
}

function loadMockAnnouncementsFromDisk(initial: Announcement[]): Announcement[] {
  try {
    if (fs.existsSync(ANNOUNCEMENTS_STORAGE_FILE)) {
      const data = fs.readFileSync(ANNOUNCEMENTS_STORAGE_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Falha ao carregar data/announcements.json:', err);
  }
  return initial;
}

let mockAnnouncements: Announcement[] = loadMockAnnouncementsFromDisk([
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    title: 'Portal Integrado FATEC Rio Claro: Mural Oficial no Ar!',
    content: 'Sejam bem-vindos ao novo Portal Integrado dos Cursos de Inteligência Artificial e Gestão ESG da FATEC Rio Claro! Por aqui você confere comunicados oficiais, eventos do campus, novidades didáticas e cardápio da cantina em tempo real.',
    priority: 'ALTA',
    author_id: 'a0000000-0000-0000-0000-000000000007',
    author_name: 'Luis Otavio',
    author_role: 'Desenvolvimento & Administração',
    target_course: null, // Todos os cursos
    target_semester: null, // Todos os semestres
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
    link_url: 'https://fatecrioclaro.cps.sp.gov.br',
    link_label: 'Acessar Portal Institucional',
    is_pinned: true,
    created_at: new Date('2026-11-06T10:00:00Z').toISOString(),
    updated_at: new Date('2026-11-06T10:00:00Z').toISOString(),
  },
]);

const mockAuditLogs: AuditLog[] = [];

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
        saveMockProductsToDisk();
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
        saveMockProductsToDisk();
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
        saveMockProductsToDisk();
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
          saveMockProductsToDisk();
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
          saveMockProductsToDisk();
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
    listActive: async (filters?: { course?: CourseType | string; semester?: number; search?: string }): Promise<Announcement[]> => {
      if (isMock || !pool) {
        let items = [...mockAnnouncements];
        if (filters?.course && filters.course !== 'TODOS') {
          items = items.filter((a) => !a.target_course || a.target_course === filters.course);
        }
        if (filters?.semester && filters.semester > 0) {
          items = items.filter((a) => !a.target_semester || a.target_semester === filters.semester);
        }
        if (filters?.search) {
          const s = filters.search.toLowerCase().trim();
          items = items.filter((a) => a.title.toLowerCase().includes(s) || a.content.toLowerCase().includes(s));
        }
        return items.sort((a, b) => {
          if (b.is_pinned !== a.is_pinned) return b.is_pinned ? 1 : -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      }

      let query = `
        SELECT a.*, u.name as author_name
        FROM announcements a
        LEFT JOIN users u ON u.id = a.author_id
        WHERE 1=1
      `;
      const params: any[] = [];
      let pIdx = 1;

      if (filters?.course && filters.course !== 'TODOS') {
        query += ` AND (a.target_course IS NULL OR a.target_course = $${pIdx++})`;
        params.push(filters.course);
      }
      if (filters?.semester && filters.semester > 0) {
        query += ` AND (a.target_semester IS NULL OR a.target_semester = $${pIdx++})`;
        params.push(filters.semester);
      }
      if (filters?.search) {
        query += ` AND (a.title ILIKE $${pIdx} OR a.content ILIKE $${pIdx})`;
        params.push(`%${filters.search}%`);
        pIdx++;
      }
      query += ` ORDER BY a.is_pinned DESC, a.created_at DESC LIMIT 50`;

      const res = await pool.query(query, params);
      return res.rows;
    },

    listAll: async (): Promise<Announcement[]> => {
      if (isMock || !pool) {
        return [...mockAnnouncements].sort((a, b) => {
          if (b.is_pinned !== a.is_pinned) return b.is_pinned ? 1 : -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      }
      const res = await pool.query('SELECT a.*, u.name as author_name FROM announcements a LEFT JOIN users u ON u.id = a.author_id ORDER BY a.is_pinned DESC, a.created_at DESC');
      return res.rows;
    },

    findById: async (id: string): Promise<Announcement | null> => {
      if (isMock || !pool) {
        return mockAnnouncements.find((a) => a.id === id) || null;
      }
      const res = await pool.query('SELECT a.*, u.name as author_name FROM announcements a LEFT JOIN users u ON u.id = a.author_id WHERE a.id = $1 LIMIT 1', [id]);
      return res.rows[0] || null;
    },

    create: async (data: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<Announcement> => {
      const now = new Date().toISOString();
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ann-${Date.now()}`;
      const author = mockUsers.find((u) => u.id === data.author_id);
      const newAnn: Announcement = {
        ...data,
        id,
        author_name: data.author_name || author?.name || 'Comissão FATEC',
        author_role: data.author_role || (author?.role === 'ADMIN' ? 'Administração' : author?.role === 'CA_MEMBRO' ? 'Centro Acadêmico' : 'Docente FATEC'),
        created_at: now,
        updated_at: now,
      };

      if (isMock || !pool) {
        mockAnnouncements.unshift(newAnn);
        saveMockAnnouncementsToDisk();
        return newAnn;
      }

      const res = await pool.query(
        `INSERT INTO announcements (id, title, content, priority, author_id, target_course, target_semester, image_url, link_url, link_label, is_pinned, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [id, data.title, data.content, data.priority, data.author_id, data.target_course || null, data.target_semester || null, data.image_url || null, data.link_url || null, data.link_label || null, data.is_pinned || false, data.expires_at || null]
      );
      return res.rows[0];
    },

    update: async (id: string, data: Partial<Announcement>): Promise<Announcement | null> => {
      const now = new Date().toISOString();

      if (isMock || !pool) {
        const idx = mockAnnouncements.findIndex((a) => a.id === id);
        if (idx === -1) return null;
        const current = mockAnnouncements[idx];
        const updated: Announcement = {
          ...current,
          ...data,
          updated_at: now,
        };
        mockAnnouncements[idx] = updated;
        saveMockAnnouncementsToDisk();
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
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const res = await pool.query(`UPDATE announcements SET ${fields.join(', ')} WHERE id = $${pIdx} RETURNING *`, values);
      return res.rows[0] || null;
    },

    delete: async (id: string): Promise<boolean> => {
      if (isMock || !pool) {
        const idx = mockAnnouncements.findIndex((a) => a.id === id);
        if (idx === -1) return false;
        mockAnnouncements.splice(idx, 1);
        saveMockAnnouncementsToDisk();
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

  // ------------------------------------------------------------------
  // 7. ANÁLISE DE DADOS E RELATÓRIOS DO CENTRO ACADÊMICO (SPRINT 3 - CESAR)
  // ------------------------------------------------------------------
  analytics: {
    getFinancial: async (filters?: { startDate?: string; endDate?: string }): Promise<CanteenFinancialAnalytics> => {
      if (isMock || !pool) {
        let txs = [...mockTransactions];

        if (filters?.startDate) {
          const start = new Date(filters.startDate).getTime();
          txs = txs.filter((t) => new Date(t.created_at).getTime() >= start);
        }
        if (filters?.endDate) {
          const end = new Date(filters.endDate).getTime();
          txs = txs.filter((t) => new Date(t.created_at).getTime() <= end);
        }

        const paidTxs = txs.filter((t) => t.status === 'PAGO');
        const totalRevenue = Number(paidTxs.reduce((sum, t) => sum + Number(t.total_amount), 0).toFixed(2));
        const totalOrders = txs.length;
        const paidOrdersCount = paidTxs.length;
        const pendingOrdersCount = txs.filter((t) => t.status === 'PENDENTE').length;
        const cancelledOrdersCount = txs.filter((t) => t.status === 'CANCELADO').length;
        const inAnalysisOrdersCount = txs.filter((t) => t.status === 'EM_ANALISE').length;
        const averageTicket = paidOrdersCount > 0 ? Number((totalRevenue / paidOrdersCount).toFixed(2)) : 0;
        const conversionRatePercent = totalOrders > 0 ? Number(((paidOrdersCount / totalOrders) * 100).toFixed(1)) : 0;

        const now = Date.now();
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

        const todayRevenue = Number(
          paidTxs
            .filter((t) => new Date(t.created_at).getTime() >= startOfToday)
            .reduce((sum, t) => sum + Number(t.total_amount), 0)
            .toFixed(2)
        );

        const last7DaysRevenue = Number(
          paidTxs
            .filter((t) => new Date(t.created_at).getTime() >= sevenDaysAgo)
            .reduce((sum, t) => sum + Number(t.total_amount), 0)
            .toFixed(2)
        );

        const last30DaysRevenue = Number(
          paidTxs
            .filter((t) => new Date(t.created_at).getTime() >= thirtyDaysAgo)
            .reduce((sum, t) => sum + Number(t.total_amount), 0)
            .toFixed(2)
        );

        const revenueByCategory: Record<ItemCategory, number> = {
          DOCE: 0,
          SALGADO: 0,
          BEBIDA: 0,
          CONGELADO: 0,
          OUTRO: 0,
        };

        const paidTxIds = new Set(paidTxs.map((t) => t.id));
        mockTransactionItems.forEach((item) => {
          if (paidTxIds.has(item.transaction_id)) {
            const product = mockProducts.find((p) => p.id === item.product_id);
            if (product && revenueByCategory[product.category] !== undefined) {
              revenueByCategory[product.category] = Number(
                (revenueByCategory[product.category] + Number(item.subtotal)).toFixed(2)
              );
            }
          }
        });

        return {
          totalRevenue,
          totalOrders,
          paidOrdersCount,
          pendingOrdersCount,
          cancelledOrdersCount,
          inAnalysisOrdersCount,
          averageTicket,
          conversionRatePercent,
          revenueByPeriod: {
            today: todayRevenue,
            last7Days: last7DaysRevenue,
            last30Days: last30DaysRevenue,
          },
          revenueByCategory,
        };
      }

      // Conexão PostgreSQL com agregação analítica otimizada
      const financialRes = await pool.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'PAGO' THEN total_amount ELSE 0 END), 0) as total_revenue,
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'PAGO' THEN 1 END) as paid_count,
          COUNT(CASE WHEN status = 'PENDENTE' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'CANCELADO' THEN 1 END) as cancelled_count,
          COUNT(CASE WHEN status = 'EM_ANALISE' THEN 1 END) as in_analysis_count,
          COALESCE(SUM(CASE WHEN status = 'PAGO' AND created_at >= CURRENT_DATE THEN total_amount ELSE 0 END), 0) as today_revenue,
          COALESCE(SUM(CASE WHEN status = 'PAGO' AND created_at >= CURRENT_DATE - INTERVAL '7 days' THEN total_amount ELSE 0 END), 0) as last7_revenue,
          COALESCE(SUM(CASE WHEN status = 'PAGO' AND created_at >= CURRENT_DATE - INTERVAL '30 days' THEN total_amount ELSE 0 END), 0) as last30_revenue
        FROM canteen_transactions
      `);

      const row = financialRes.rows[0];
      const totalRevenue = Number(parseFloat(row.total_revenue).toFixed(2));
      const totalOrders = parseInt(row.total_orders, 10);
      const paidOrdersCount = parseInt(row.paid_count, 10);
      const pendingOrdersCount = parseInt(row.pending_count, 10);
      const cancelledOrdersCount = parseInt(row.cancelled_count, 10);
      const inAnalysisOrdersCount = parseInt(row.in_analysis_count, 10);

      const averageTicket = paidOrdersCount > 0 ? Number((totalRevenue / paidOrdersCount).toFixed(2)) : 0;
      const conversionRatePercent = totalOrders > 0 ? Number(((paidOrdersCount / totalOrders) * 100).toFixed(1)) : 0;

      const categoryRes = await pool.query(`
        SELECT p.category, COALESCE(SUM(ti.subtotal), 0) as cat_revenue
        FROM canteen_transaction_items ti
        JOIN canteen_transactions t ON t.id = ti.transaction_id
        JOIN canteen_products p ON p.id = ti.product_id
        WHERE t.status = 'PAGO'
        GROUP BY p.category
      `);

      const revenueByCategory: Record<ItemCategory, number> = {
        DOCE: 0,
        SALGADO: 0,
        BEBIDA: 0,
        CONGELADO: 0,
        OUTRO: 0,
      };

      categoryRes.rows.forEach((r: any) => {
        if (r.category in revenueByCategory) {
          revenueByCategory[r.category as ItemCategory] = Number(parseFloat(r.cat_revenue).toFixed(2));
        }
      });

      return {
        totalRevenue,
        totalOrders,
        paidOrdersCount,
        pendingOrdersCount,
        cancelledOrdersCount,
        inAnalysisOrdersCount,
        averageTicket,
        conversionRatePercent,
        revenueByPeriod: {
          today: Number(parseFloat(row.today_revenue).toFixed(2)),
          last7Days: Number(parseFloat(row.last7_revenue).toFixed(2)),
          last30Days: Number(parseFloat(row.last30_revenue).toFixed(2)),
        },
        revenueByCategory,
      };
    },

    getProductRanking: async (limit = 10): Promise<ProductSalesRankingItem[]> => {
      if (isMock || !pool) {
        const rankingMap = new Map<string, { unitsSold: number; totalRevenue: number }>();

        const paidTxIds = new Set(mockTransactions.filter((t) => t.status === 'PAGO').map((t) => t.id));

        mockTransactionItems.forEach((item) => {
          if (paidTxIds.has(item.transaction_id)) {
            const current = rankingMap.get(item.product_id) || { unitsSold: 0, totalRevenue: 0 };
            current.unitsSold += item.quantity;
            current.totalRevenue += Number(item.subtotal);
            rankingMap.set(item.product_id, current);
          }
        });

        const ranking: ProductSalesRankingItem[] = mockProducts.map((p) => {
          const stats = rankingMap.get(p.id) || { unitsSold: 0, totalRevenue: 0 };
          return {
            productId: p.id,
            productName: p.name,
            category: p.category,
            unitsSold: stats.unitsSold,
            totalRevenue: Number(stats.totalRevenue.toFixed(2)),
            currentStock: p.current_stock,
            minStockAlert: p.min_stock_alert,
            isLowStock: p.current_stock <= p.min_stock_alert,
          };
        });

        ranking.sort((a, b) => b.unitsSold - a.unitsSold || b.totalRevenue - a.totalRevenue);
        return ranking.slice(0, limit);
      }

      const res = await pool.query(
        `
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.category,
          p.current_stock,
          p.min_stock_alert,
          COALESCE(SUM(CASE WHEN t.status = 'PAGO' THEN ti.quantity ELSE 0 END), 0) as units_sold,
          COALESCE(SUM(CASE WHEN t.status = 'PAGO' THEN ti.subtotal ELSE 0 END), 0) as total_revenue
        FROM canteen_products p
        LEFT JOIN canteen_transaction_items ti ON ti.product_id = p.id
        LEFT JOIN canteen_transactions t ON t.id = ti.transaction_id
        GROUP BY p.id, p.name, p.category, p.current_stock, p.min_stock_alert
        ORDER BY units_sold DESC, total_revenue DESC
        LIMIT $1
      `,
        [limit]
      );

      return res.rows.map((r: any) => ({
        productId: r.product_id,
        productName: r.product_name,
        category: r.category,
        unitsSold: parseInt(r.units_sold, 10),
        totalRevenue: Number(parseFloat(r.total_revenue).toFixed(2)),
        currentStock: parseInt(r.current_stock, 10),
        minStockAlert: parseInt(r.min_stock_alert, 10),
        isLowStock: parseInt(r.current_stock, 10) <= parseInt(r.min_stock_alert, 10),
      }));
    },

    getAuditReport: async (limit = 100): Promise<AuditAnalyticsReport> => {
      if (isMock || !pool) {
        const logs = [...mockAuditLogs];
        const uniqueUsers = new Set(logs.map((l) => l.user_id).filter(Boolean));
        const actionsBreakdown: Record<string, number> = {};

        logs.forEach((l) => {
          actionsBreakdown[l.action] = (actionsBreakdown[l.action] || 0) + 1;
        });

        const criticalSecurityEvents = logs.filter((l) =>
          /DELETED|ADJUSTED|FAILED|BRUTE|BLOCKED|SECURITY|ROLE/i.test(l.action)
        );

        return {
          totalEvents: logs.length,
          uniqueUsersCount: uniqueUsers.size,
          actionsBreakdown,
          criticalSecurityEvents: criticalSecurityEvents.slice(-20).reverse(),
          recentLogs: logs.slice(-limit).reverse(),
        };
      }

      const totalRes = await pool.query('SELECT COUNT(*) as total, COUNT(DISTINCT user_id) as unique_users FROM audit_logs');
      const actionsRes = await pool.query('SELECT action, COUNT(*) as count FROM audit_logs GROUP BY action ORDER BY count DESC');
      const recentRes = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1', [limit]);
      const criticalRes = await pool.query(
        `SELECT * FROM audit_logs 
         WHERE action ~* 'DELETED|ADJUSTED|FAILED|BRUTE|BLOCKED|SECURITY|ROLE' 
         ORDER BY created_at DESC LIMIT 20`
      );

      const actionsBreakdown: Record<string, number> = {};
      actionsRes.rows.forEach((r: any) => {
        actionsBreakdown[r.action] = parseInt(r.count, 10);
      });

      return {
        totalEvents: parseInt(totalRes.rows[0].total, 10),
        uniqueUsersCount: parseInt(totalRes.rows[0].unique_users, 10),
        actionsBreakdown,
        criticalSecurityEvents: criticalRes.rows,
        recentLogs: recentRes.rows,
      };
    },

    exportFinancialCsv: async (): Promise<string> => {
      let txsWithItems: Array<CanteenTransaction & { items: CanteenTransactionItem[] }> = [];

      if (isMock || !pool) {
        txsWithItems = mockTransactions.map((tx) => ({
          ...tx,
          items: mockTransactionItems.filter((i) => i.transaction_id === tx.id),
        }));
      } else {
        txsWithItems = await db.transactions.listAll({ limit: 1000 });
      }

      const header = ['ID_Transacao', 'Data_Hora', 'Usuario', 'Email', 'Valor_Total_BRL', 'Status', 'Metodo', 'Qtd_Itens', 'Itens_Discriminados'];
      const rows = txsWithItems.map((tx) => {
        const itemSummary = (tx.items || [])
          .map((i) => `${i.quantity}x ${i.product_name || 'Produto'} (R$ ${Number(i.unit_price).toFixed(2)})`)
          .join('; ');

        return [
          `"${tx.id}"`,
          `"${new Date(tx.created_at).toLocaleString('pt-BR')}"`,
          `"${tx.user_name || 'Aluno FATEC'}"`,
          `"${tx.user_email || ''}"`,
          `"${Number(tx.total_amount).toFixed(2)}"`,
          `"${tx.status}"`,
          `"${tx.payment_method}"`,
          `"${tx.items?.length || 0}"`,
          `"${itemSummary.replace(/"/g, '""')}"`,
        ].join(',');
      });

      return [header.join(','), ...rows].join('\r\n');
    },
  },
};
