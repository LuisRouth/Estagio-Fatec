// ====================================================================
// TESTES DE INTEGRAÇÃO — CAMADA DE DADOS HÍBRIDA & RBAC (VITEST)
// Responsável: Guilherme (DevOps, IA & QA)
// ====================================================================

import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db';

describe('Camada de Dados Híbrida e Perfis RBAC (src/lib/db.ts)', () => {
  it('deve localizar os usuários seed da equipe (Cesar, Luis, Guilherme e Prof. Orlando)', async () => {
    const guilherme = await db.users.findByEmail('guilherme.devops@aluno.cps.sp.gov.br');
    expect(guilherme).not.toBeNull();
    expect(guilherme?.role).toBe('CA_MEMBRO');
    expect(guilherme?.course).toBe('IA');

    const orlando = await db.users.findByEmail('orlando.docente@aluno.cps.sp.gov.br');
    expect(orlando).not.toBeNull();
    expect(orlando?.role).toBe('PROFESSOR');
  });

  it('deve listar produtos disponíveis na Cantina Discente com estoque positivo', async () => {
    const products = await db.products.listAvailable();
    expect(products.length).toBeGreaterThanOrEqual(5);
    expect(products.every((p) => p.is_available && p.price > 0)).toBe(true);
  });

  it('deve listar comunicados ativos no Mural de Avisos', async () => {
    const announcements = await db.announcements.listActive();
    expect(announcements.length).toBeGreaterThanOrEqual(1);
    expect(announcements[0].is_pinned).toBe(true);
  });
});
