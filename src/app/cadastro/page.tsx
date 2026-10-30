'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogoFatec } from '@/components/brand/LogoFatec';
import { EcoTechBackground } from '@/components/layout/EcoTechBackground';

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ra, setRa] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [curso, setCurso] = useState<'IA' | 'ESG'>('IA');
  const [semestre, setSemestre] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isEmailValid = email.toLowerCase().endsWith('@aluno.cps.sp.gov.br');

  // Cálculo da força da senha
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '#cbd5e1' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Fraca', color: '#e11d48' };
    if (score === 2) return { score: 2, label: 'Média', color: '#d97706' };
    if (score >= 3) return { score: 3, label: 'Forte e Segura', color: '#059669' };
    return { score: 0, label: '', color: '#cbd5e1' };
  };

  const passwordStrength = getPasswordStrength(senha);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (senha !== confirmSenha) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    if (senha.length < 8) {
      setErrorMsg('A senha de acesso deve ter pelo menos 8 caracteres.');
      return;
    }

    if (!isEmailValid) {
      setErrorMsg('O cadastro discente requer e-mail institucional oficial (@aluno.cps.sp.gov.br).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nome.trim(),
          email: email.trim().toLowerCase(),
          ra: ra.trim() || undefined,
          password: senha,
          course: curso,
          semester: Number(semestre),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Falha ao registrar novo estudante.');
      }

      setSuccessMsg('Cadastro realizado com sucesso. Redirecionando para o login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado ao realizar cadastro.');
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
          maxWidth: '560px',
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
            Cadastro de Estudante
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Preencha seus dados para unificar seu acesso acadêmico
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
          <div className="form-group">
            <label className="form-label" htmlFor="nome">
              Nome Completo do Estudante
            </label>
            <input
              id="nome"
              type="text"
              className="form-input"
              placeholder="ex: Carlos Eduardo da Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="email">
                  E-mail Institucional
                </label>
                {isEmailValid && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    ✓ Oficial
                  </span>
                )}
              </div>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="usuario@aluno.cps.sp.gov.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  borderColor: isEmailValid ? 'var(--accent-emerald)' : undefined,
                  boxShadow: isEmailValid ? '0 0 0 3px rgba(5, 150, 105, 0.12)' : undefined,
                }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ra">
                Registro Acadêmico (RA) <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Opcional)</span>
              </label>
              <input
                id="ra"
                type="text"
                className="form-input"
                placeholder="ex: 123456789"
                value={ra}
                onChange={(e) => setRa(e.target.value)}
              />
            </div>
          </div>

          {/* Seleção do Curso */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label">Curso de Graduação</label>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: curso === 'IA' ? 'var(--accent-blue)' : 'var(--accent-emerald)' }}>
                {curso === 'IA' ? 'Período Matutino (Manhã)' : 'Período Noturno (Noite)'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCurso('IA')}
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  border: curso === 'IA' ? '2px solid var(--accent-blue)' : '1px solid var(--border-light)',
                  backgroundColor: curso === 'IA' ? 'var(--accent-blue-light)' : '#ffffff',
                  color: curso === 'IA' ? 'var(--accent-blue)' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                }}
              >
                Inteligência Artificial
              </button>
              <button
                type="button"
                onClick={() => setCurso('ESG')}
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  border: curso === 'ESG' ? '2px solid var(--accent-emerald)' : '1px solid var(--border-light)',
                  backgroundColor: curso === 'ESG' ? 'var(--accent-emerald-light)' : '#ffffff',
                  color: curso === 'ESG' ? 'var(--accent-emerald)' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                }}
              >
                Gestão ESG
              </button>
            </div>
          </div>

          {/* Semestre (1º ao 4º) */}
          <div className="form-group">
            <label className="form-label" htmlFor="semestre">
              Semestre Letivo Atual (Grade Vigente)
            </label>
            <select
              id="semestre"
              className="form-select"
              value={semestre}
              onChange={(e) => setSemestre(Number(e.target.value))}
            >
              <option value={1}>1º Semestre</option>
              <option value={2}>2º Semestre</option>
              <option value={3}>3º Semestre</option>
              <option value={4}>4º Semestre</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="senha">
                Senha de Acesso (Mín. 8 dígitos)
              </label>
              <input
                id="senha"
                type="password"
                className="form-input"
                placeholder="Crie sua senha segura"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              {/* Barra de Força da Senha */}
              {senha.length > 0 && (
                <div style={{ marginTop: '0.35rem' }}>
                  <div style={{ height: '4px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(passwordStrength.score / 3) * 100}%`,
                        backgroundColor: passwordStrength.color,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: passwordStrength.color, fontWeight: 700, marginTop: '2px', textAlign: 'right' }}>
                    {passwordStrength.label}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmSenha">
                Confirmar Senha
              </label>
              <input
                id="confirmSenha"
                type="password"
                className="form-input"
                placeholder="Repita sua senha"
                value={confirmSenha}
                onChange={(e) => setConfirmSenha(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', fontSize: '0.95rem' }}
          >
            {loading ? 'Criando conta discente...' : 'Finalizar Cadastro Discente'}
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
          Já possui conta no portal?{' '}
          <Link href="/login" style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
            Fazer login institucional
          </Link>
        </div>
      </div>
    </div>
  );
}
