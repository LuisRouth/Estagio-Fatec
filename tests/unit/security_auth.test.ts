// ====================================================================
// SUÍTE DE TESTES UNITÁRIOS (VITEST): SEGURANÇA, RBAC E AUTENTICAÇÃO
// Responsável: Guilherme (Inteligência Artificial, DevOps & QA)
// ====================================================================

import { describe, it, expect } from 'vitest';
import { validatePasswordStrength, sanitizeInput, checkRateLimit } from '@/lib/security';
import { hashPassword, verifyPassword, generateToken, verifyToken } from '@/lib/auth';

describe('Segurança da Informação & Criptografia (OWASP)', () => {
  it('deve validar corretamente regras de força de senha', () => {
    expect(validatePasswordStrength('12345').isValid).toBe(false);
    expect(validatePasswordStrength('semmaiuscula1!').isValid).toBe(false);
    expect(validatePasswordStrength('SemNumero!').isValid).toBe(false);
    expect(validatePasswordStrength('Fatec@2026').isValid).toBe(true);
  });

  it('deve sanitizar entradas contra ataques XSS básicos', () => {
    const dirty = '  <script>alert("xss")</script>Portal FATEC  ';
    const clean = sanitizeInput(dirty);
    expect(clean).not.toContain('<');
    expect(clean).not.toContain('>');
    expect(clean).toContain('Portal FATEC');
  });

  it('deve aplicar rate limiting contra força bruta por IP', () => {
    const ip = `test-ip-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(ip, 5, 60).allowed).toBe(true);
    }
    const blocked = checkRateLimit(ip, 5, 60);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('deve gerar hash Bcrypt seguro e verificar senha em tempo constante', async () => {
    const hash = await hashPassword('Fatec@2026');
    expect(hash).toMatch(/^\$2[ab]\$/);
    expect(await verifyPassword('Fatec@2026', hash)).toBe(true);
    expect(await verifyPassword('SenhaErrada@123', hash)).toBe(false);
  });

  it('deve assinar e validar token JWT com claims RBAC', async () => {
    const token = await generateToken({
      id: 'a0000000-0000-0000-0000-000000000003',
      name: 'Guilherme DevOps',
      email: 'guilherme.devops@aluno.cps.sp.gov.br',
      role: 'CA_MEMBRO',
      course: 'IA',
      semester: 4,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const payload = await verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.role).toBe('CA_MEMBRO');
    expect(payload?.course).toBe('IA');
  });
});
