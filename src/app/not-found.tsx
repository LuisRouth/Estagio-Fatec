'use client';

import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';

export default function NotFound() {
  return (
    <AppLayout activePath="">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '55vh',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '3rem 2rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              color: 'var(--accent-blue)',
              lineHeight: 1,
              marginBottom: '1rem',
              letterSpacing: '-0.03em',
            }}
          >
            404
          </div>
          <h1
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginBottom: '0.75rem',
            }}
          >
            Página não encontrada
          </h1>
          <p
            style={{
              fontSize: '0.925rem',
              color: 'var(--text-sub)',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            O endereço acessado não está disponível ou foi movido. Utilize os links da navegação para retornar às seções do portal.
          </p>
          <Link href="/" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            Retornar ao Início
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}