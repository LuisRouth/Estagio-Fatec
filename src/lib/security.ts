// ====================================================================
// UTILITÁRIOS DE SEGURANÇA AVANÇADA (OWASP TOP 10) — PORTAL FATEC RIO CLARO
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Sprint 3: Sanitização Profunda (Anti-XSS / Anti-SQLi) e Rate Limiting
// ====================================================================

/**
 * Validador de Força de Senha
 * Exige: Mínimo 8 caracteres, pelo menos uma letra maiúscula, uma minúscula,
 * um dígito numérico e um caractere especial.
 */
export function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'A senha deve conter no mínimo 8 caracteres.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos uma letra maiúscula.' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos uma letra minúscula.' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos um número.' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos um caractere especial (!@#$%...).' };
  }
  return { isValid: true };
}

/**
 * Sanitização Profunda contra Cross-Site Scripting (XSS) e Injeção
 * Neutraliza tags HTML, protocolos de script (javascript:, data:),
 * handlers de evento perigosos (onerror, onload, onclick) e trunca payloads excessivos.
 */
export function sanitizeInput(input: string, maxLen = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove blocos de script completos
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .replace(/javascript\s*:/gi, '')                                   // Remove pseudo-protocolo javascript:
    .replace(/data\s*:\s*text\/html/gi, '')                            // Remove data URIs HTML
    .replace(/on\w+\s*=/gi, '')                                       // Remove handlers onload=, onerror=, etc.
    .replace(/[<>]/g, '')                                             // Remove caracteres HTML diretos
    .slice(0, maxLen);                                                // Previne estouro de buffer / DoS
}

/**
 * Sanitiza recursivamente todas as strings de um payload de objeto ou array
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeInput(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }
  if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = sanitizeObject(value);
    }
    return cleaned;
  }
  return obj;
}

/**
 * Escapa caracteres curingas em consultas SQL LIKE / ILIKE para evitar DoS por wildcard
 * e manipulação de padrões em buscas.
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') return '';
  const sanitized = sanitizeInput(query, 100);
  return sanitized
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

/**
 * Validador rigoroso de identificadores SQL dinâmicos (tabelas e colunas).
 * Previne SQL Injection mesmo quando nomes de campos forem montados programaticamente.
 */
export function assertSafeSqlIdentifier(identifier: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new Error(`Identificador SQL inválido ou potencialmente inseguro: "${identifier}".`);
  }
  return identifier;
}

/**
 * Sistema de Rate Limiting em Memória com Limites Específicos por Ação
 * Protege rotas críticas contra ataques de força bruta, DoS e raspagem.
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export type RateLimitAction = 'auth_login' | 'auth_register' | 'canteen_checkout' | 'materials_upload' | 'api_general';

export const RATE_LIMIT_CONFIGS: Record<RateLimitAction, { maxAttempts: number; windowSeconds: number }> = {
  auth_login: { maxAttempts: 5, windowSeconds: 60 },          // 5 tentativas / min
  auth_register: { maxAttempts: 3, windowSeconds: 60 },       // 3 cadastros / min
  canteen_checkout: { maxAttempts: 10, windowSeconds: 60 },   // 10 pedidos / min
  materials_upload: { maxAttempts: 5, windowSeconds: 60 },    // 5 uploads / min
  api_general: { maxAttempts: 100, windowSeconds: 60 },       // 100 requisições / min
};

export function checkRateLimit(
  identifier: string,
  actionOrMaxAttempts: RateLimitAction | number = 'auth_login',
  customWindowOrMax?: number,
  customWindowSeconds?: number
): {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
  resetAt: number;
  headers: Record<string, string>;
} {
  let action: RateLimitAction = 'auth_login';
  let maxAttempts = 5;
  let windowSeconds = 60;

  if (typeof actionOrMaxAttempts === 'number') {
    // Assinatura legada Sprint 1: checkRateLimit(id, maxAttempts, windowSeconds)
    maxAttempts = actionOrMaxAttempts;
    windowSeconds = customWindowOrMax ?? 60;
  } else {
    // Nova assinatura Sprint 3: checkRateLimit(id, action, customMax, customWindow)
    action = actionOrMaxAttempts;
    const config = RATE_LIMIT_CONFIGS[action] || RATE_LIMIT_CONFIGS.api_general;
    maxAttempts = customWindowOrMax ?? config.maxAttempts;
    windowSeconds = customWindowSeconds ?? config.windowSeconds;
  }

  const key = `${action}:${identifier}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    const resetAt = now + windowSeconds * 1000;
    rateLimitStore.set(key, { count: 1, resetAt });
    const remaining = Math.max(0, maxAttempts - 1);
    return {
      allowed: true,
      remaining,
      resetAt,
      headers: {
        'X-RateLimit-Limit': maxAttempts.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(resetAt / 1000).toString(),
      },
    };
  }

  if (record.count >= maxAttempts) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      resetAt: record.resetAt,
      headers: {
        'X-RateLimit-Limit': maxAttempts.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(record.resetAt / 1000).toString(),
        'Retry-After': retryAfter.toString(),
      },
    };
  }

  record.count += 1;
  const remaining = Math.max(0, maxAttempts - record.count);
  return {
    allowed: true,
    remaining,
    resetAt: record.resetAt,
    headers: {
      'X-RateLimit-Limit': maxAttempts.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(record.resetAt / 1000).toString(),
    },
  };
}

/**
 * Headers de Segurança Padrão em Conformidade com OWASP
 */
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com;",
};
