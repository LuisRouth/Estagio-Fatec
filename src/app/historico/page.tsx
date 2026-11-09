'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import CanteenStatementView from '@/components/canteen/CanteenStatementView';

export default function HistoricoPage() {
  return (
    <AppLayout activePath="/historico">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Cabeçalho do Painel */}
        <div
          className="canteen-statement-header card-interactive"
          style={{
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            padding: '2.25rem 2rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-emerald">Extrato Financeiro Transparente</span>
              <span className="badge badge-blue">Cantina Discente</span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Meu Histórico de Compras na Cantina
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '680px', lineHeight: 1.6 }}>
              Acompanhe seu consumo pessoal, valide seus pagamentos Pix com conferência automática via IA OCR e tenha controle total dos seus gastos nos intervalos da faculdade.
            </p>
          </div>

          <Link href="/cantina" className="btn btn-primary" style={{ padding: '0.75rem 1.35rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Comprar na Cantina
          </Link>
        </div>

        <CanteenStatementView />
      </div>
    </AppLayout>
  );
}
