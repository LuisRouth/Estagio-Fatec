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
  recovery_email?: string | null;
  ra?: string | null;
  password_hash: string;
  role: UserRole;
  course: CourseType;
  semester: number;
  is_active: boolean;
  is_email_verified?: boolean;
  email_verified_at?: string | null;
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
  author_role?: string | null;
  target_course?: CourseType | null; // null = Todos os cursos
  target_semester?: number | null; // null = Todos os semestres (1, 2, 3, 4)
  image_url?: string | null;
  link_url?: string | null;
  link_label?: string | null;
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
// TIPOS ANALÍTICOS DO CENTRO ACADÊMICO (SPRINT 3 - CESAR)
// ====================================================================

export interface CanteenFinancialAnalytics {
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  cancelledOrdersCount: number;
  inAnalysisOrdersCount: number;
  averageTicket: number;
  conversionRatePercent: number;
  revenueByPeriod: {
    today: number;
    last7Days: number;
    last30Days: number;
  };
  revenueByCategory: Record<ItemCategory, number>;
}

export interface ProductSalesRankingItem {
  productId: string;
  productName: string;
  category: ItemCategory;
  unitsSold: number;
  totalRevenue: number;
  currentStock: number;
  minStockAlert: number;
  isLowStock: boolean;
}

export interface AuditAnalyticsReport {
  totalEvents: number;
  uniqueUsersCount: number;
  actionsBreakdown: Record<string, number>;
  criticalSecurityEvents: AuditLog[];
  recentLogs: AuditLog[];
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

// ====================================================================
// PERFIL, SEGURANÇA, ACESSIBILIDADE E NOTIFICAÇÕES SEGMENTADAS
// ====================================================================

export interface UserPreferences {
  userId: string;
  highContrast: boolean;
  fontSize: 'normal' | 'comfort' | 'large';
  reduceMotion: boolean;
  feedFilter: 'my_course' | 'all';
  updatedAt?: string;
}

export interface UserSecurityAudit {
  id: string;
  userId: string;
  changedBy?: string | null;
  changedByName?: string | null;
  action: 'PASSWORD_CHANGE' | 'PRIMARY_EMAIL_CHANGE' | 'RECOVERY_EMAIL_CHANGE' | 'PROFILE_UPDATE';
  fieldName: string;
  oldValueMasked?: string | null;
  newValueMasked?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface EmailVerificationRecord {
  id: string;
  userId: string;
  email: string;
  verificationCode: string;
  token: string;
  purpose: 'ACCOUNT_ACTIVATION' | 'EMAIL_CHANGE';
  expiresAt: string;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface UserNotificationItem {
  id: string;
  userId: string;
  announcementId: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  targetCourse?: CourseType | null;
  targetSemester?: number | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}
