'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogoFatec } from '@/components/brand/LogoFatec';
import { EcoTechBackground } from '@/components/layout/EcoTechBackground';
import { CampusDoorTransition } from '@/components/auth/CampusDoorTransition';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const cleanEmail = email.toLowerCase().trim();
  const isEmailValid = cleanEmail.endsWith('@aluno.cps.sp.gov.br') || cleanEmail.endsWith('@fatec.sp.gov.br');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError('');

    if (!isEmailValid) {
      setFieldError('E-mail institucional inválido');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Credenciais de acesso incorretas');
      }

      // Ativa a animação rápida do personagem entrando na porta no botão
      setIsEntering(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 700);
    } catch (err: any) {
      setFieldError('E-mail ou senha incorretos');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Fundo de Rede Neuronal e Ecológica */}
      <EcoTechBackground />

      <div
        className="animate-fade-in auth-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: '20px',
          padding: '2.5rem 2.25rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Botão Voltar para a Página Inicial sem fazer login */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="auth-back-btn">
            ← Voltar ao Início
          </Link>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FATEC Rio Claro</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <LogoFatec height={44} />
          </div>

          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Portal do Aluno
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Identifique-se com suas credenciais institucionais
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Campo E-mail Institucional */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
              <label className="form-label" htmlFor="email">
                E-mail Institucional
              </label>
              {fieldError ? (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                  ⚠ {fieldError}
                </span>
              ) : isEmailValid ? (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  ✓ E-mail oficial verificado
                </span>
              ) : null}
            </div>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="ex: seu.nome@aluno.cps.sp.gov.br"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldError) setFieldError('');
              }}
              style={{
                borderColor: fieldError ? 'var(--accent-rose)' : isEmailValid ? 'var(--accent-emerald)' : undefined,
                boxShadow: fieldError ? '0 0 0 3px rgba(225, 29, 72, 0.12)' : isEmailValid ? '0 0 0 3px rgba(5, 150, 105, 0.12)' : undefined,
              }}
              required
              autoFocus
            />
          </div>

          {/* Campo Senha */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
              <label className="form-label" htmlFor="senha">
                Senha de Acesso
              </label>
              <Link
                href="/recuperar-senha"
                style={{ fontSize: '0.775rem', color: 'var(--accent-blue)', fontWeight: 600 }}
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="senha"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Sua senha segura"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  if (fieldError) setFieldError('');
                }}
                style={{
                  paddingRight: '4.5rem',
                  borderColor: fieldError ? 'var(--accent-rose)' : undefined,
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.775rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  padding: '0.25rem 0.5rem',
                }}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || isEntering}
            style={{
              width: '100%',
              marginTop: '0.75rem',
              padding: '0.75rem',
              fontSize: '0.95rem',
              minHeight: '48px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isEntering ? (
              <CampusDoorTransition active={true} />
            ) : loading ? (
              'Validando acesso...'
            ) : (
              'Acessar Portal'
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-light)',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-sub)',
          }}
        >
          Primeiro acesso no campus?{' '}
          <Link href="/cadastro" style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
            Criar meu cadastro discente
          </Link>
        </div>
      </div>
    </div>
  );
}
