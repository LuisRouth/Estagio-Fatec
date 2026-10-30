'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';

export default function VitrinePage() {
  return (
    <AppLayout activePath="/vitrine">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            Vitrine de Projetos Práticos e TCC
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem' }}>
            Galeria de trabalhos de graduação, protótipos de IA e iniciativas sustentáveis de ESG da FATEC Rio Claro.
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '4rem 2rem',
            border: '1px dashed var(--border-light)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
          }}
        >
          <div style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Projetos em fase de submissão
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem', lineHeight: 1.5 }}>
              A vitrine de Trabalhos de Conclusão de Curso (TCC) e artigos discentes será aberta ao final do ciclo letivo.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}