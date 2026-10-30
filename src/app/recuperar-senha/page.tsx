'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LogoFatec } from '@/components/brand/LogoFatec';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.toLowerCase().endsWith('@aluno.cps.sp.gov.br')) {
      setErrorMsg('Informe seu e-mail institucional oficial (@aluno.cps.sp.gov.br).');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-light)',
          padding: '2.75rem 2.25rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <LogoFatec height={44} />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Recuperação de Acesso
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Instruções enviadas para seu e-mail institucional
          </p>
        </div>

        {errorMsg && (
          <div className="alert-box alert-error" style={{ marginBottom: '1.25rem' }}>
            <div>{errorMsg}</div>
          </div>
        )}

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div className="alert-box alert-success" style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
              <div>
                Caso o e-mail <strong>{email}</strong> conste no sistema acadêmico discente, enviamos as orientações de redefinição de senha para sua caixa postal.
              </div>
            </div>
            <Link href="/login" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
              Retornar para o Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="email" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                E-mail Institucional (@aluno.cps.sp.gov.br)
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="nome.sobrenome@aluno.cps.sp.gov.br"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem 0.9rem', fontSize: '0.9rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
              disabled={loading}
            >
              {loading ? 'Consultando sistema discente...' : 'Enviar Instruções'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
          <Link href="/login" style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}