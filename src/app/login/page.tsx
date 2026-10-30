'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogoFatec } from '@/components/brand/LogoFatec';
import { EcoTechBackground } from '@/components/layout/EcoTechBackground';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isEmailValid = email.toLowerCase().endsWith('@aluno.cps.sp.gov.br');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isEmailValid) {
      setErrorMsg('Utilize seu e-mail institucional oficial (@aluno.cps.sp.gov.br).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Falha na autenticação. Verifique seu e-mail e senha.');
      }

      setSuccessMsg('Login realizado com sucesso. Redirecionando...');
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        position: 'relative',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Fundo de Rede Neuronal e Ecológica */}
      <EcoTechBackground />

      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-light)',
          padding: '2.5rem 2.25rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Botão Voltar para a Página Inicial sem fazer login */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-sub)',
              textDecoration: 'none',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(241, 245, 249, 0.8)',
              border: '1px solid var(--border-light)',
              transition: 'all 0.15s ease',
            }}
          >
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

        {errorMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--accent-rose-light)',
              color: 'var(--accent-rose)',
              borderRadius: '9px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              border: '1px solid rgba(225, 29, 72, 0.2)',
            }}
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--accent-emerald-light)',
              color: 'var(--accent-emerald)',
              borderRadius: '9px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              border: '1px solid rgba(5, 150, 105, 0.2)',
            }}
          >
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo E-mail Institucional */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="email">
                E-mail Institucional
              </label>
              {isEmailValid && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  ✓ E-mail oficial verificado
                </span>
              )}
            </div>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="ex: seu.nome@aluno.cps.sp.gov.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                borderColor: isEmailValid ? 'var(--accent-emerald)' : undefined,
                boxShadow: isEmailValid ? '0 0 0 3px rgba(5, 150, 105, 0.12)' : undefined,
              }}
              required
              autoFocus
            />
          </div>

          {/* Campo Senha */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                onChange={(e) => setSenha(e.target.value)}
                style={{ paddingRight: '4.5rem' }}
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
            disabled={loading}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', fontSize: '0.95rem' }}
          >
            {loading ? 'Validando acesso...' : 'Acessar Portal'}
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
