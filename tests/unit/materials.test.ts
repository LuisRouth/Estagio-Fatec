// ====================================================================
// TESTES UNITÁRIOS: REPOSITÓRIO ACADÊMICO & PROJETOS TCC (SPRINT 2)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// ====================================================================

import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db';

describe('Repositório Acadêmico & Vitrine de TCC (src/lib/db.ts)', () => {
  it('deve listar materiais filtrados por curso (IA e ESG)', async () => {
    const iaMaterials = await db.materials.list({ course: 'IA' });
    expect(iaMaterials.length).toBeGreaterThanOrEqual(1);
    expect(iaMaterials.every((m) => m.course === 'IA')).toBe(true);

    const esgMaterials = await db.materials.list({ course: 'ESG' });
    expect(esgMaterials.length).toBeGreaterThanOrEqual(1);
    expect(esgMaterials.every((m) => m.course === 'ESG')).toBe(true);
  });

  it('deve filtrar materiais por tipo específico (TCC, CODIGO, APOSTILA)', async () => {
    const tccs = await db.materials.list({ materialType: 'TCC' });
    expect(tccs.length).toBeGreaterThanOrEqual(1);
    expect(tccs[0].material_type).toBe('TCC');
  });

  it('deve buscar materiais por palavra-chave no título, tags ou disciplina', async () => {
    const results = await db.materials.list({ search: 'machine-learning' });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].title.toLowerCase()).toContain('machine learning');
  });

  it('deve cadastrar novo material didático e incrementar download count', async () => {
    const newMat = await db.materials.create({
      title: 'Apostila de Deep Learning e Visão Computacional',
      description: 'Fundamentos de CNNs e YOLOv8 com exemplos práticos.',
      subject: 'Visão Computacional',
      course: 'IA',
      semester: 4,
      author_id: 'a0000000-0000-0000-0000-000000000004', // Prof. Orlando
      material_type: 'SLIDE',
      file_url: '/materials/ia/visao_computacional.pdf',
      github_url: 'https://github.com/fatec-rc/visao-ia',
      tags: 'visao-computacional, yolo, deep-learning',
      is_approved: true,
    });

    expect(newMat.id).toBeDefined();
    expect(newMat.download_count).toBe(0);

    const updatedCount = await db.materials.incrementDownloadCount(newMat.id);
    expect(updatedCount).toBe(1);
  });
});

