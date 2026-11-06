'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogoFatec } from '@/components/brand/LogoFatec';
import { EcoTechBackground } from '@/components/layout/EcoTechBackground';
import { EmailVerificationScreen } from '@/components/auth/EmailVerificationScreen';

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState<'formulario' | 'verificacao'>('formulario');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [ra, setRa] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmSenha, setShowConfirmSenha] = useState(false);
  const [curso, setCurso] = useState<'IA' | 'ESG'>('IA');
  const [semestre, setSemestre] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Restaura rascunho de dados digitados se o discente recarregar a página
  useEffect(() => {
    try {
      const draft = sessionStorage.getItem('fatec_cadastro_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.nome) setNome(parsed.nome);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.recoveryEmail) setRecoveryEmail(parsed.recoveryEmail);
        if (parsed.ra) setRa(parsed.ra);
        if (parsed.senha) setSenha(parsed.senha);
        if (parsed.confirmSenha) setConfirmSenha(parsed.confirmSenha);
        if (parsed.curso) setCurso(parsed.curso);
        if (parsed.semestre) setSemestre(parsed.semestre);
      }
    } catch {}
  }, []);

  const cleanEmail = email.toLowerCase().trim();
  const isEmailValid = cleanEmail.endsWith('@aluno.cps.sp.gov.br') || cleanEmail.endsWith('@fatec.sp.gov.br');

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
      setErrorMsg('O e-mail principal deve ser institucional obrigatório (@aluno.cps.sp.gov.br ou @fatec.sp.gov.br).');
      return;
    }

    const cleanRecovery = recoveryEmail.trim().toLowerCase();
    if (!cleanRecovery || !/\S+@\S+\.\S+/.test(cleanRecovery)) {
      setErrorMsg('O e-mail de recuperação/segurança é obrigatório para envio do código de confirmação.');
      return;
    }

    setLoading(true);

    try {
      // 1. Despacha o código de confirmação de 6 dígitos diretamente para o e-mail de recuperação
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          recoveryEmail: cleanRecovery,
          purpose: 'ACCOUNT_ACTIVATION',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível despachar o código de confirmação.');
      }

      // Salva rascunho dos dados preenchidos no sessionStorage para que "Voltar e Corrigir" mantenha 100% dos dados
      try {
        sessionStorage.setItem(
          'fatec_cadastro_draft',
          JSON.stringify({ nome, email, recoveryEmail: cleanRecovery, ra, curso, semestre, senha, confirmSenha })
        );
      } catch {}

      setStep('verificacao');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar envio do código de confirmação.');
    } finally {
      setLoading(false);
    }
  };

  // Se o cadastro foi enviado, exibe a Tela de Verificação com validação estrita do código de 6 dígitos
  if (step === 'verificacao') {
    return (
      <EmailVerificationScreen
        nome={nome || 'Estudante'}
        email={cleanEmail || 'aluno@aluno.cps.sp.gov.br'}
        recoveryEmail={recoveryEmail.trim().toLowerCase()}
        ra={ra}
        curso={curso}
        semestre={semestre}
        onBackToRegister={() => setStep('formulario')}
        onConfirmCode={async (code: string) => {
          // A conta só é criada se o código recebido no e-mail de recuperação estiver correto
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: nome.trim(),
              email: cleanEmail,
              recoveryEmail: recoveryEmail.trim().toLowerCase(),
              ra: ra.trim() || undefined,
              password: senha,
              course: curso,
              semester: Number(semestre),
              verificationCode: code.trim(),
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            return {
              success: false,
              error: data.error || 'Código incorreto ou falha ao criar conta.',
            };
          }

          try {
            sessionStorage.removeItem('fatec_cadastro_draft');
          } catch {}

          return { success: true };
        }}
      />
    );
  }

  return (
    <div className="auth-page-container">
      {/* Fundo de Rede Neuronal e Ecológica */}
      <EcoTechBackground />

      <div
        className="animate-fade-in auth-card"
        style={{
          width: '100%',
          maxWidth: '560px',
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

          {/* E-mail de Recuperação Obrigatório (Receberá o Código OTP de 6 dígitos) */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="recoveryEmail">
                E-mail de Segurança & Recuperação (Obrigatório)
              </label>
              {recoveryEmail && /\S+@\S+\.\S+/.test(recoveryEmail) && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  ✓ Válido
                </span>
              )}
            </div>
            <input
              id="recoveryEmail"
              type="email"
              className="form-input"
              placeholder="ex: seu.email.pessoal@gmail.com"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              required
            />
            <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block', lineHeight: 1.4 }}>
              ✉️ Aceita qualquer domínio pessoal (ex: <strong>@gmail.com</strong>, <strong>@outlook.com</strong>, etc.). O <strong>código de 6 dígitos</strong> para confirmação e ativação da conta será enviado para este endereço.
            </small>
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
              <div style={{ position: 'relative' }}>
                <input
                  id="senha"
                  type={showSenha ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Crie sua senha segura"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  aria-label={showSenha ? 'Ocultar senha' : 'Exibir senha'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showSenha ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
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
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmSenha"
                  type={showConfirmSenha ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Repita sua senha"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmSenha(!showConfirmSenha)}
                  aria-label={showConfirmSenha ? 'Ocultar senha' : 'Exibir senha'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showConfirmSenha ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', fontSize: '0.95rem' }}
          >
            {loading ? 'Despachando código de verificação...' : 'Receber Código de Ativação por E-mail'}
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
