// ====================================================================
// TESTES UNITÁRIOS DE SEGURANÇA (VITEST)
// Responsável: Guilherme (DevOps, IA & QA)
// ====================================================================

import { describe, it, expect } from 'vitest';
import { validatePasswordStrength, sanitizeInput, checkRateLimit, SECURITY_HEADERS } from '@/lib/security';

describe('Módulo de Segurança OWASP (src/lib/security.ts)', () => {
  it('deve aprovar senhas fortes que cumprem todos os requisitos institucionais', () => {
    const res = validatePasswordStrength('Fatec@2026');
    expect(res.isValid).toBe(true);
  });

  it('deve rejeitar senhas curtas, sem maiúsculas, sem números ou sem caracteres especiais', () => {
    expect(validatePasswordStrength('12345').isValid).toBe(false);
    expect(validatePasswordStrength('fatec@2026').isValid).toBe(false);
    expect(validatePasswordStrength('FATEC@2026').isValid).toBe(false);
    expect(validatePasswordStrength('FatecRioClaro').isValid).toBe(false);
    expect(validatePasswordStrength('Fatec2026').isValid).toBe(false);
  });

  it('deve sanitizar tags HTML (< e >) para prevenção de ataques XSS', () => {
    const malicious = '  <script>alert("xss")</script>Guilherme QA  ';
    const clean = sanitizeInput(malicious);
    expect(clean).not.toContain('<');
    expect(clean).not.toContain('>');
    expect(clean).toContain('Guilherme QA');
  });

  it('deve aplicar Rate Limiting após exceder o limite de tentativas por janela', () => {
    const key = `test_ip_${Date.now()}`;
    expect(checkRateLimit(key, 3, 60).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 60).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 60).allowed).toBe(true);
    const blocked = checkRateLimit(key, 3, 60);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('deve conter todos os headers de segurança obrigatórios OWASP', () => {
    expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
    expect(SECURITY_HEADERS['X-XSS-Protection']).toBe('1; mode=block');
  });
});
