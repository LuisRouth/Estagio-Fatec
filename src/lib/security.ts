// ====================================================================
// UTILITÁRIOS DE SEGURANÇA — PORTAL FATEC RIO CLARO
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
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
 * Sanitização de Strings contra XSS Básico
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove caracteres HTML diretos
    .slice(0, 1000);     // Previne ataques de payload excessivo (DoS)
}

/**
 * Rate Limiter Simples em Memória
 * Protege rotas críticas como /api/auth/login contra ataques de força bruta.
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count };
}

/**
 * Headers de Segurança Padrão (OWASP)
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
