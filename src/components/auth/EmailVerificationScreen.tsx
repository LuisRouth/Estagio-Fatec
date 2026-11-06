'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogoFatec } from '@/components/brand/LogoFatec';
import { EcoTechBackground } from '@/components/layout/EcoTechBackground';

interface EmailVerificationScreenProps {
  nome: string;
  email: string;
  ra?: string;
  curso?: 'IA' | 'ESG';
  semestre?: number;
  onBackToRegister?: () => void;
  onConfirmed?: () => void;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  nome = 'Estudante',
  email = 'aluno@aluno.cps.sp.gov.br',
  ra,
  curso = 'IA',
  semestre = 1,
  onBackToRegister,
  onConfirmed,
}) => {
  const router = useRouter();
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  // Solicita disparo do código de verificação ao montar a tela
  useEffect(() => {
    async function triggerCode() {
      try {
        await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, purpose: 'ACCOUNT_ACTIVATION' }),
        });
      } catch {}
    }
    if (email) triggerCode();
  }, [email]);

  const handleVerifyOtpReal = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    if (!otpInput || otpInput.trim().length < 6) {
      setOtpError('Digite o código de 6 dígitos enviado por e-mail.');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpInput.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setConfirmed(true);
        setTimeout(() => {
          if (onConfirmed) onConfirmed();
          else router.push('/login');
        }, 1500);
      } else {
        setOtpError(json.error || 'Código incorreto ou expirado.');
      }
    } catch {
      setOtpError('Falha ao validar código com o servidor.');
    } finally {
      setVerifying(false);
    }
  };

  // Contador regressivo para reenvio de e-mail (60 segundos)
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setCooldown(60);
    try {
      await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'ACCOUNT_ACTIVATION' }),
      });
      setToastMsg(`✓ Um novo código de confirmação foi despachado para ${email}`);
    } catch {
      setToastMsg(`✓ Solicitação de reenvio despachada para ${email}`);
    }
    setTimeout(() => setToastMsg(null), 4500);
  };

  const handleCopyEmail = () => {
    try {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Simulação de confirmação do e-mail (Frontend Interativo)
  const handleSimulateVerification = () => {
    setVerifying(true);

    setTimeout(() => {
      setVerifying(false);
      setConfirmed(true);

      // Salva a sessão ativa autenticada para ir direto ao início sem precisar logar de novo
      const userSession = {
        name: nome,
        role: 'Discente',
        course: curso,
        email: email,
        ra: ra || '2840000',
        semester: semestre,
      };

      try {
        sessionStorage.setItem('fatec_auth_user', JSON.stringify(userSession));
        localStorage.setItem(
          'fatec_student_config',
          JSON.stringify({
            name: nome,
            ra: ra || '2840000',
            course: curso,
            semester: semestre,
            primaryEmail: email,
            recoveryEmail: '',
            highContrast: localStorage.getItem('fatec_high_contrast') === 'true',
            fontSize: 'normal',
            reduceMotion: false,
            feedFilter: 'my_course',
          })
        );
      } catch {}

      setTimeout(() => {
        if (onConfirmed) {
          onConfirmed();
        } else {
          router.push('/');
        }
      }, 1400);
    }, 1200);
  };

  return (
    <div className="auth-page-container">
      <EcoTechBackground />

      <div
        className="animate-fade-in auth-card card-verification"
        style={{
          width: '100%',
          maxWidth: '540px',
          borderRadius: '24px',
          padding: '2.5rem 2.25rem',
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
        }}
      >
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          {onBackToRegister ? (
            <button
              type="button"
              onClick={onBackToRegister}
              className="auth-back-btn"
              title="Voltar ao formulário com todos os seus dados preservados"
            >
              ← Voltar e Corrigir
            </button>
          ) : (
            <Link
              href="/cadastro"
              className="auth-back-btn"
            >
              ← Voltar ao Cadastro
            </Link>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-blue">Área do Discente</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FATEC Rio Claro</span>
          </div>
        </div>

        {/* Logo FATEC / CPS */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <LogoFatec height={44} />
        </div>

        {/* ============================================================== */}
        {/* ANIMAÇÃO BESPOKE DE E-MAIL RECEBENDO O CERTIFICADO DE ACESSO   */}
        {/* ============================================================== */}
        <div
          style={{
            position: 'relative',
            width: '130px',
            height: '110px',
            margin: '0 auto 1.5rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Ondas Digitais Circulares (Pulsos de Rede FATEC/CPS) */}
          <div
            style={{
              position: 'absolute',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '2px solid rgba(2, 132, 199, 0.25)',
              animation: 'mailPulseWave 2.8s ease-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '1.5px solid rgba(5, 150, 105, 0.2)',
              animation: 'mailPulseWave 2.8s ease-out 1.2s infinite',
            }}
          />

          {/* Envelope Institucional com Carta Deslizando para Dentro */}
          <svg width="90" height="74" viewBox="0 0 90 74" fill="none" style={{ position: 'relative', zIndex: 2 }}>
            {/* Sombra suave */}
            <ellipse cx="45" cy="70" rx="36" ry="4" fill="rgba(15, 23, 42, 0.1)" />

            {/* Carta / Credencial Acadêmica Deslizando */}
            <g
              style={{
                animation: confirmed
                  ? 'none'
                  : 'letterSlideIn 2.6s ease-in-out infinite alternate',
                transform: confirmed ? 'translateY(12px)' : 'none',
                transition: 'transform 0.5s ease',
              }}
            >
              <rect x="22" y="8" width="46" height="34" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="1.8" className="mail-svg-letter" />
              {/* Linhas de texto simuladas na carta */}
              <line x1="28" y1="16" x2="52" y2="16" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
              <line x1="28" y1="22" x2="62" y2="22" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="28" y1="28" x2="56" y2="28" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
              {/* Selo FATEC Vermelho Institucional */}
              <circle cx="58" cy="16" r="3" fill="#b20000" />
            </g>

            {/* Corpo do Envelope (Atrás) */}
            <rect x="10" y="24" width="70" height="44" rx="6" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" className="mail-svg-envelope" />

            {/* Aba do Envelope (Frente/Fundo) */}
            <path
              d="M10 28L45 49L80 28"
              stroke="#0284c7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="mail-svg-fold"
            />
            {/* Dobra inferior */}
            <path
              d="M10 68L36 44M80 68L54 44"
              stroke="#0284c7"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="mail-svg-fold"
            />

            {/* Badge de Status: Confirmado (Verde) ou Pendente (Azul/Giratória) */}
            {confirmed ? (
              <g style={{ animation: 'stampPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
                <circle cx="45" cy="46" r="14" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                <path d="M40 46L44 50L51 43" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            ) : verifying ? (
              <circle cx="45" cy="46" r="10" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            ) : (
              <g>
                <circle cx="45" cy="46" r="11" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <path d="M45 40V46L49 48" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            )}
          </svg>
        </div>

        {/* Título de Confirmação */}
        {confirmed ? (
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              ✓ E-mail Confirmado com Sucesso!
            </h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Identidade acadêmica ativada no campus digital. Redirecionando diretamente para o Início...
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Quase lá! Verifique seu E-mail
            </h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', lineHeight: 1.55 }}>
              Enviamos um link de confirmação institucional para ativar sua matrícula e credenciais de acesso discente:
            </p>

            {/* Bloco de Destaque do E-mail */}
            <div
              className="email-highlight-box"
              style={{
                margin: '1.25rem 0',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--accent-blue-light)',
                borderRadius: '12px',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div style={{ textAlign: 'left', minWidth: 0 }}>
                <div
                  className="email-highlight-title"
                  style={{ fontSize: '0.725rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}
                >
                  E-mail Institucional do Aluno
                </div>
                <div
                  className="email-highlight-address"
                  style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0369a1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {email}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="copy-btn"
                style={{
                  padding: '0.4rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid rgba(2, 132, 199, 0.3)',
                  backgroundColor: '#ffffff',
                  color: 'var(--accent-blue)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>

            {/* Caixa Informativa sobre Caixa de Entrada e Spam */}
            <div
              className="tip-box"
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
                fontSize: '0.825rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                textAlign: 'left',
                marginBottom: '1.75rem',
              }}
            >
              💡 <strong>Dica:</strong> Acesse sua caixa de entrada no Webmail do CPS. Caso a mensagem não apareça em até 2 minutos, verifique sua pasta de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.
            </div>

            {/* Toast de Notificação */}
            {toastMsg && (
              <div
                style={{
                  padding: '0.65rem 1rem',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  borderRadius: '8px',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem',
                }}
              >
                {toastMsg}
              </div>
            )}

            {/* Formulário de Digitação do Código OTP de 6 dígitos */}
            <form
              onSubmit={handleVerifyOtpReal}
              style={{
                marginBottom: '1.25rem',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                🔑 Digite o Código de Validação de 6 Dígitos
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Enviado para seu e-mail institucional para confirmar a existência da conta:
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="000000"
                  style={{
                    width: '180px',
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    letterSpacing: '0.25em',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={verifying}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.25rem', fontWeight: 700, fontSize: '0.875rem' }}
                >
                  {verifying ? 'Validando...' : 'Validar Código'}
                </button>
              </div>

              {otpError && (
                <div style={{ color: '#e11d48', fontSize: '0.775rem', fontWeight: 600, marginTop: '0.35rem' }}>
                  {otpError}
                </div>
              )}
            </form>

            {/* Ações: Botão de Simulação (Frontend) + Reenvio + Voltar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Botão de Simulação da Confirmação (Atende o pedido do usuário para teste visual imediato) */}
              <button
                type="button"
                onClick={handleSimulateVerification}
                disabled={verifying}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: '10px',
                }}
              >
                {verifying ? 'Validando token de e-mail...' : '✓ Validar com 1 Clique (Link Direto)'}
              </button>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend}
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    borderRadius: '9px',
                    cursor: canResend ? 'pointer' : 'not-allowed',
                    opacity: canResend ? 1 : 0.65,
                  }}
                >
                  {canResend ? '✉ Reenviar E-mail' : `Reenviar em ${cooldown}s`}
                </button>

                {onBackToRegister && (
                  <button
                    type="button"
                    onClick={onBackToRegister}
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      padding: '0.65rem 1rem',
                      fontSize: '0.85rem',
                      borderRadius: '9px',
                    }}
                    title="Retorna ao formulário de cadastro com tudo preenchido"
                  >
                    ✏ Corrigir Cadastro
                  </button>
                )}
              </div>
            </div>

            {/* Rodapé Alternativo para Login */}
            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Prefere confirmar mais tarde?{' '}
              <Link href="/login" style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
                Ir para o Login Discente
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Estilos de Animação em Linha para a Carta e as Ondas Digitais */}
      <style jsx>{`
        @keyframes mailPulseWave {
          0% {
            transform: scale(0.7);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        @keyframes letterSlideIn {
          0% {
            transform: translateY(-8px);
          }
          50% {
            transform: translateY(2px);
          }
          100% {
            transform: translateY(-8px);
          }
        }
        @keyframes stampPop {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          70% {
            transform: scale(1.15);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        :global(.dark-high-contrast) .card-verification {
          background-color: rgba(21, 30, 46, 0.95) !important;
          border-color: #2b3a4f !important;
          box-shadow: 0 16px 32px -6px rgba(0, 0, 0, 0.6) !important;
        }
        :global(.dark-high-contrast) .email-highlight-box {
          background-color: #16263d !important;
          border-color: rgba(2, 132, 199, 0.4) !important;
        }
        :global(.dark-high-contrast) .email-highlight-title {
          color: #38bdf8 !important;
        }
        :global(.dark-high-contrast) .email-highlight-address {
          color: #f0f9ff !important;
        }
        :global(.dark-high-contrast) .tip-box {
          background-color: #243044 !important;
          border-color: #3b4a63 !important;
          color: #cbd5e1 !important;
        }
        :global(.dark-high-contrast) .copy-btn {
          background-color: #243044 !important;
          border-color: #3b4a63 !important;
          color: #38bdf8 !important;
        }
        :global(.dark-high-contrast) .back-btn {
          background-color: #243044 !important;
          border-color: #3b4a63 !important;
          color: #f8fafc !important;
        }
        :global(.dark-high-contrast) .mail-svg-envelope {
          fill: #1e293b !important;
          stroke: #38bdf8 !important;
        }
        :global(.dark-high-contrast) .mail-svg-letter {
          fill: #0f172a !important;
          stroke: #38bdf8 !important;
        }
        :global(.dark-high-contrast) .mail-svg-fold {
          stroke: #38bdf8 !important;
        }
      `}</style>
    </div>
  );
};

export default EmailVerificationScreen;
