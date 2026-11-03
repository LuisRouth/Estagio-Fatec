// ====================================================================
// CONTRATOS E TIPAGENS GLOBAIS DO SISTEMA (TYPESCRIPT STRICT)
// Projeto: Portal Integrado FATEC Rio Claro
// Compartilhado entre: Cesar (Backend), Luis (Frontend) e Guilherme (IA/DevOps/QA)
// ====================================================================

export type UserRole = 'ALUNO' | 'CA_MEMBRO' | 'PROFESSOR' | 'ADMIN';
export type CourseType = 'IA' | 'ESG';
export type ItemCategory = 'DOCE' | 'SALGADO' | 'BEBIDA' | 'CONGELADO' | 'OUTRO';
export type TransactionStatus = 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'EM_ANALISE';
export type AnnouncementPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type MaterialType = 'SLIDE' | 'APOSTILA' | 'CODIGO' | 'TCC' | 'DATASET';

export interface User {
  id: string;
  name: string;
  email: string;
  ra?: string | null;
  password_hash: string;
  role: UserRole;
  course: CourseType;
  semester: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SafeUser = Omit<User, 'password_hash'>;

export interface JWTPayload {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
  course: CourseType;
  semester: number;
  iat?: number;
  exp?: number;
}

export interface CanteenProduct {
  id: string;
  name: string;
  description?: string | null;
  category: ItemCategory;
  price: number;
  current_stock: number;
  min_stock_alert: number;
  image_url?: string | null;
  barcode?: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface CanteenTransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface CanteenTransaction {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  total_amount: number;
  status: TransactionStatus;
  payment_method: 'PIX';
  pix_copy_paste?: string | null;
  pix_qr_code_url?: string | null;
  pix_end_to_end_id?: string | null;
  proof_image_url?: string | null;
  notes?: string | null;
  validated_by?: string | null;
  validated_at?: string | null;
  created_at: string;
  updated_at: string;
  items?: CanteenTransactionItem[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  author_id: string;
  author_name?: string;
  target_course?: CourseType | null;
  target_semester?: number | null;
  is_pinned: boolean;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcademicMaterial {
  id: string;
  title: string;
  description?: string | null;
  subject: string;
  course: CourseType;
  semester: number;
  author_id: string;
  author_name?: string;
  material_type: MaterialType;
  file_url: string;
  github_url?: string | null;
  tags?: string | null;
  download_count: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_name: string;
  entity_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  payload?: Record<string, unknown> | null;
  created_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// ====================================================================
// TIPOS DO MÓDULO PIX DINÂMICO (PADRÃO BANCO CENTRAL DO BRASIL - EMV)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// ====================================================================

export interface PixPayloadParams {
  pixKey?: string;
  merchantName?: string;
  merchantCity?: string;
  amount: number;
  txid?: string;
  description?: string;
}

export interface PixPayloadResult {
  payload: string;
  txid: string;
  amount: number;
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  qrCodeUrl: string;
}

export interface PixValidationResult {
  isValid: boolean;
  error?: string;
  payloadFormatIndicator?: string;
  pixKey?: string;
  merchantName?: string;
  merchantCity?: string;
  amount?: number;
  txid?: string;
  description?: string;
  calculatedCrc?: string;
  expectedCrc?: string;
}

// ====================================================================
// TIPOS DO MÓDULO DE INTELIGÊNCIA ARTIFICIAL (GOOGLE GEMINI SDK)
// Responsável: Guilherme (DevOps, IA & QA)
// ====================================================================

export interface GeminiConnectivityResult {
  connected: boolean;
  mode: 'LIVE_API' | 'MOCK_FALLBACK';
  model: string;
  latencyMs: number;
  apiKeyConfigured: boolean;
  responsePreview?: string;
  timestamp: string;
  error?: string;
}

export interface PixReceiptOCRResult {
  isValidReceipt: boolean;
  confidence: number;
  extractedAmount: number | null;
  expectedAmount: number;
  amountMatches: boolean;
  transactionId?: string | null;
  payerName?: string | null;
  receiverName?: string | null;
  paymentDate?: string | null;
  status: 'APROVADO_IA' | 'DIVERGENTE' | 'REQUER_REVISAO_CA';
  analysisNotes: string;
}
