'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';

export default function AvisosPage() {
  return (
    <AppLayout activePath="/avisos">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            Mural de Comunicados e Avisos Oficiais
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem' }}>
            Informativos da Coordenação dos Cursos de IA e Gestão ESG, Secretaria Acadêmica e Centro Acadêmico (CA).
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
              Nenhum comunicado urgente registrado
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem', lineHeight: 1.5 }}>
              Novos informativos da coordenação de cursos, editais e datas importantes de avaliações serão publicados aqui em tempo real.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}