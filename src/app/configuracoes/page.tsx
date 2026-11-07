'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { UserSecurityAudit } from '@/lib/types';

interface StudentConfig {
  name: string;
  ra: string;
  course: 'IA' | 'ESG';
  semester: number;
  primaryEmail: string;
  recoveryEmail: string;
  isEmailVerified: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'comfort' | 'large';
  reduceMotion: boolean;
  feedFilter: 'my_course' | 'all';
}

const DEFAULT_CONFIG: StudentConfig = {
  name: 'Estudante FATEC',
  ra: '20241001001',
  course: 'IA',
  semester: 4,
  primaryEmail: 'estudante@aluno.cps.sp.gov.br',
  recoveryEmail: '',
  isEmailVerified: false,
  highContrast: false,
  fontSize: 'normal',
  reduceMotion: false,
  feedFilter: 'my_course',
};

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguranca' | 'acessibilidade' | 'historico'>('perfil');
  const [config, setConfig] = useState<StudentConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  // Estados de Senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Estados de Verificação de E-mail
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Estados de Auditoria de Segurança
  const [securityLogs, setSecurityLogs] = useState<UserSecurityAudit[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Carrega configurações do Banco de Dados / Sessão
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const u = json.data.user;
            const p = json.data.preferences || {};
            const loadedConfig: StudentConfig = {
              name: u.name || DEFAULT_CONFIG.name,
              ra: u.ra || DEFAULT_CONFIG.ra,
              course: u.course || DEFAULT_CONFIG.course,
              semester: u.semester || DEFAULT_CONFIG.semester,
              primaryEmail: u.email || DEFAULT_CONFIG.primaryEmail,
              recoveryEmail: u.recoveryEmail || '',
              isEmailVerified: Boolean(u.isEmailVerified),
              highContrast: p.highContrast ?? false,
              fontSize: p.fontSize || 'normal',
              reduceMotion: p.reduceMotion ?? false,
              feedFilter: p.feedFilter || 'my_course',
            };
            setConfig(loadedConfig);
            applyAccessibilityDOM(loadedConfig.highContrast, loadedConfig.fontSize);
          }
        } else {
          // Fallback para cache local caso sessão esteja mock
          const saved = localStorage.getItem('fatec_student_config');
          if (saved) {
            const parsed = JSON.parse(saved);
            setConfig((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    loadSecurityAudit();
  }, []);

  const loadSecurityAudit = async () => {
    try {
      const res = await fetch('/api/user/security-audit');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSecurityLogs(json.data);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar auditoria de segurança:', err);
    }
  };

  const applyAccessibilityDOM = (contrast: boolean, size: string) => {
    if (typeof document === 'undefined') return;
    if (contrast) {
      document.documentElement.classList.add('dark-high-contrast');
      document.body.classList.add('dark-high-contrast');
      document.documentElement.style.backgroundColor = '#0b1120';
    } else {
      document.documentElement.classList.remove('dark-high-contrast');
      document.body.classList.remove('dark-high-contrast');
      document.documentElement.style.backgroundColor = '#f8fafc';
    }

    localStorage.setItem('fatec_high_contrast', String(contrast));
    window.dispatchEvent(new Event('fatec_contrast_changed'));
  };

  // 1. Salvar Dados Acadêmicos (Perfil)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.name,
          course: config.course,
          semester: Number(config.semester),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast('✓ Dados acadêmicos atualizados no banco de dados e auditados!');
        loadSecurityAudit();
      } else {
        showToast(json.error || 'Erro ao salvar dados acadêmicos.', 'error');
      }
    } catch (err) {
      localStorage.setItem('fatec_student_config', JSON.stringify(config));
      showToast('✓ Dados acadêmicos atualizados localmente no dispositivo!');
    }
  };

  // 2. Salvar E-mails (Institucional & Recuperação)
  const handleSaveEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrimary = config.primaryEmail.toLowerCase().trim();
    const isDomainValid =
      cleanPrimary.endsWith('@aluno.cps.sp.gov.br') || cleanPrimary.endsWith('@fatec.sp.gov.br');

    if (!isDomainValid) {
      showToast('O e-mail institucional principal DEVE ter extensão @aluno.cps.sp.gov.br ou @fatec.sp.gov.br.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryEmail: cleanPrimary,
          recoveryEmail: config.recoveryEmail ? config.recoveryEmail.trim() : null,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast('✓ E-mails atualizados no banco e registrados na trilha de auditoria!');
        loadSecurityAudit();
      } else {
        showToast(json.error || 'Erro ao salvar e-mails.', 'error');
      }
    } catch {
      localStorage.setItem('fatec_student_config', JSON.stringify(config));
      showToast('✓ E-mails atualizados no dispositivo!');
    }
  };

  // 3. Enviar Código de Verificação OTP para o E-mail
  const handleSendVerificationCode = async () => {
    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: config.primaryEmail, purpose: 'EMAIL_CHANGE' }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setOtpSent(true);
        showToast(`✓ Código de verificação despachado para ${config.primaryEmail}`);
      } else {
        setOtpError(json.error || 'Não foi possível despachar o código.');
      }
    } catch (err: any) {
      setOtpError('Falha de rede ao solicitar código.');
    } finally {
      setOtpLoading(false);
    }
  };

  // 4. Validar Código OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setOtpError('Digite o código numérico de 6 dígitos.');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: config.primaryEmail, code: otpCode.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setConfig((prev) => ({ ...prev, isEmailVerified: true }));
        setOtpSent(false);
        setOtpCode('');
        showToast('✓ E-mail institucional validado com sucesso!');
        loadSecurityAudit();
      } else {
        setOtpError(json.error || 'Código inválido ou expirado.');
      }
    } catch {
      setOtpError('Erro ao validar código.');
    }
  };

  // 5. Alteração de Senha Segura
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Preencha todos os campos de senha.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('A nova senha deve possuir pelo menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação não coincide com a nova senha digitada.');
      return;
    }

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPasswordSuccess('✓ Senha alterada com sucesso! Histórico registrado.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        loadSecurityAudit();
      } else {
        setPasswordError(json.error || 'Falha ao redefinir senha.');
      }
    } catch {
      setPasswordError('Erro de conexão com o servidor de autenticação.');
    }
  };

  // 6. Salvar Preferências de Acessibilidade & Interface no Banco
  const handleSaveAccessibility = async (updates: Partial<StudentConfig>) => {
    const nextConfig = { ...config, ...updates };
    setConfig(nextConfig);
    applyAccessibilityDOM(nextConfig.highContrast, nextConfig.fontSize);

    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          highContrast: nextConfig.highContrast,
          fontSize: nextConfig.fontSize,
          reduceMotion: nextConfig.reduceMotion,
          feedFilter: nextConfig.feedFilter,
        }),
      });
      showToast('✓ Preferências salvas no banco de dados da sua conta!');
    } catch {
      localStorage.setItem('fatec_student_config', JSON.stringify(nextConfig));
      showToast('✓ Preferências salvas no navegador!');
    }
  };

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateDarkState = () => {
      if (typeof document === 'undefined') return;
      const hasClass = document.documentElement.classList.contains('dark-high-contrast') || document.body.classList.contains('dark-high-contrast');
      const hasStorage = localStorage.getItem('fatec_high_contrast') === 'true';
      setIsDark(Boolean(hasClass || hasStorage || config.highContrast));
    };

    updateDarkState();
    const observer = new MutationObserver(updateDarkState);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [config.highContrast]);

  const getPasswordStrength = () => {
    if (!newPassword) return null;
    if (newPassword.length < 6) return { label: 'Fraca', color: '#e11d48', width: '33%' };
    if (newPassword.length < 10) return { label: 'Moderada', color: '#d97706', width: '66%' };
    return { label: 'Forte & Segura', color: '#059669', width: '100%' };
  };

  const strength = getPasswordStrength();

  return (
    <AppLayout activePath="/configuracoes">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '980px', margin: '0 auto', width: '100%' }}>
        
        {/* Cabeçalho da Página */}
        <div
          style={{
            backgroundColor: isDark ? '#151e2e' : '#ffffff',
            borderRadius: '16px',
            padding: '2rem',
            border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-blue">Área do Discente</span>
              <span className="badge badge-emerald">FATEC Rio Claro</span>
              {config.isEmailVerified ? (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                  ✓ E-mail Institucional Verificado
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
                  ⏳ Verificação Pendente
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: isDark ? '#f8fafc' : 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Perfil & Configurações da Conta
            </h1>
            <p style={{ color: isDark ? '#94a3b8' : 'var(--text-sub)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
              Gerencie sua identidade acadêmica, e-mails de segurança, preferências persistidas de interface e trilha de auditoria.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: isDark ? '#243044' : 'var(--bg-primary)',
              padding: '0.6rem 1rem',
              borderRadius: '12px',
              border: isDark ? '1px solid #3b4a63' : '1px solid var(--border-light)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: isDark ? 'rgba(2, 132, 199, 0.25)' : 'var(--accent-blue-light)',
                color: isDark ? '#38bdf8' : 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
              }}
            >
              {config.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#f8fafc' : 'var(--text-main)' }}>{config.name}</div>
              <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : 'var(--text-muted)' }}>RA: {config.ra} • {config.course} ({config.semester}º Sem)</div>
            </div>
          </div>
        </div>

        {/* Toast Notificação */}
        {toastMessage && (
          <div
            style={{
              backgroundColor: toastType === 'success' ? '#ecfdf5' : '#fff1f2',
              border: `1px solid ${toastType === 'success' ? '#a7f3d0' : '#fecdd3'}`,
              color: toastType === 'success' ? '#065f46' : '#9f1239',
              borderRadius: '10px',
              padding: '0.85rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Abas Unificadas */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: isDark ? '2px solid #2b3a4f' : '2px solid var(--border-light)',
            paddingBottom: '0.25rem',
            flexWrap: 'wrap',
          }}
        >
          {[
            { id: 'perfil', label: 'Perfil Acadêmico', icon: '👤' },
            { id: 'seguranca', label: 'E-mails & Segurança', icon: '🔒' },
            { id: 'acessibilidade', label: 'Acessibilidade & Interface', icon: '⚙️' },
            { id: 'historico', label: 'Histórico & Auditoria', icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '8px 8px 0 0',
                fontWeight: 700,
                fontSize: '0.925rem',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === tab.id ? (isDark ? '#243044' : '#ffffff') : 'transparent',
                color: activeTab === tab.id ? (isDark ? '#38bdf8' : 'var(--accent-blue)') : (isDark ? '#94a3b8' : 'var(--text-muted)'),
                borderBottom: activeTab === tab.id ? `3px solid ${isDark ? '#38bdf8' : 'var(--accent-blue)'}` : '3px solid transparent',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: PERFIL ACADÊMICO */}
        {activeTab === 'perfil' && (
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="settings-card" style={{ backgroundColor: isDark ? '#151e2e' : '#ffffff', borderRadius: '16px', padding: '2rem', border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                Dados do Estudante
              </h2>
              <p style={{ color: isDark ? '#94a3b8' : 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Identificação pessoal e parâmetros acadêmicos utilizados para personalizar seus comunicados e grade curricular.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)',
                      backgroundColor: isDark ? '#101726' : '#ffffff',
                      color: isDark ? '#f8fafc' : 'var(--text-main)',
                      fontSize: '0.925rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Registro de Aluno (RA)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={config.ra}
                      readOnly
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)',
                        backgroundColor: isDark ? '#182232' : 'var(--bg-primary)',
                        color: isDark ? '#94a3b8' : 'var(--text-muted)',
                        fontSize: '0.925rem',
                        cursor: 'not-allowed',
                      }}
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '0.75rem', color: isDark ? '#94a3b8' : 'var(--text-muted)' }}>
                      🔒 Prontuário CPS
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Curso Principal
                  </label>
                  <select
                    value={config.course}
                    onChange={(e) => setConfig({ ...config, course: e.target.value as 'IA' | 'ESG' })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)',
                      fontSize: '0.925rem',
                      backgroundColor: isDark ? '#101726' : '#ffffff',
                      color: isDark ? '#f8fafc' : 'var(--text-main)',
                      outline: 'none',
                    }}
                  >
                    <option value="IA">Inteligência Artificial (Matutino)</option>
                    <option value="ESG">Gestão ESG (Noturno)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Semestre Atual de Matrícula
                  </label>
                  <select
                    value={config.semester}
                    onChange={(e) => setConfig({ ...config, semester: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)',
                      fontSize: '0.925rem',
                      backgroundColor: isDark ? '#101726' : '#ffffff',
                      color: isDark ? '#f8fafc' : 'var(--text-main)',
                      outline: 'none',
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <option key={s} value={s}>{s}º Semestre</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                Salvar Dados Acadêmicos
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: E-MAILS & SEGURANÇA */}
        {activeTab === 'seguranca' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Bloco de E-mails */}
            <form onSubmit={handleSaveEmails} className="settings-card" style={{ backgroundColor: isDark ? '#151e2e' : '#ffffff', borderRadius: '16px', padding: '2rem', border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                Gerenciamento de E-mails Institucional & Segurança
              </h2>
              <p style={{ color: isDark ? '#94a3b8' : 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Configure seu endereço oficial da FATEC/CPS e seu e-mail de recuperação pessoal.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                {/* E-mail Institucional */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)' }}>
                      E-mail Institucional Principal (Obrigatório)
                    </label>
                    {config.isEmailVerified ? (
                      <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        ✓ Verificado
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={otpLoading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-blue)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {otpLoading ? 'Despachando...' : 'Enviar Código de Validação'}
                      </button>
                    )}
                  </div>

                  <input
                    type="email"
                    value={config.primaryEmail}
                    onChange={(e) => setConfig({ ...config, primaryEmail: e.target.value })}
                    required
                    placeholder="nome.sobrenome@aluno.cps.sp.gov.br"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)',
                      backgroundColor: isDark ? '#101726' : '#ffffff',
                      color: isDark ? '#f8fafc' : 'var(--text-main)',
                      fontSize: '0.925rem',
                      outline: 'none',
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Extensão restrita obrigatória: <b>@aluno.cps.sp.gov.br</b> ou <b>@fatec.sp.gov.br</b>
                  </div>

                  {/* Painel de Validação de Código OTP */}
                  {otpSent && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        borderRadius: '10px',
                        backgroundColor: isDark ? '#1c283d' : '#f0f9ff',
                        border: isDark ? '1px solid #0369a1' : '1px solid #bae6fd',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#38bdf8' : '#0369a1', marginBottom: '0.5rem' }}>
                        ✉️ Código de Verificação Enviado (Validade: 15 min)
                      </div>
                      <p style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#0c4a6e', marginBottom: '0.75rem' }}>
                        Digite o código de 6 dígitos enviado para validar a existência da conta:
                      </p>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="Ex: 849201"
                          style={{
                            width: '140px',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)',
                            fontSize: '1rem',
                            fontWeight: 700,
                            letterSpacing: '0.15em',
                            textAlign: 'center',
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="btn btn-primary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }}
                        >
                          Confirmar Código
                        </button>
                      </div>
                      {otpError && <div style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>{otpError}</div>}
                    </div>
                  )}
                </div>

                {/* E-mail de Recuperação */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                    E-mail de Segurança & Recuperação (Extensão Livre)
                  </label>
                  <input
                    type="email"
                    value={config.recoveryEmail}
                    onChange={(e) => setConfig({ ...config, recoveryEmail: e.target.value })}
                    placeholder="exemplo.pessoal@gmail.com, outlook.com, etc."
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)',
                      backgroundColor: isDark ? '#101726' : '#ffffff',
                      color: isDark ? '#f8fafc' : 'var(--text-main)',
                      fontSize: '0.925rem',
                      outline: 'none',
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Pode ter extensão diversa (@gmail, @outlook, @yahoo) para resgate de conta de emergência.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                  Salvar E-mails no Banco
                </button>
              </div>
            </form>

            {/* Bloco de Alteração de Senha */}
            <form onSubmit={handleChangePassword} className="settings-card" style={{ backgroundColor: isDark ? '#151e2e' : '#ffffff', borderRadius: '16px', padding: '2rem', border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                Alteração de Senha de Acesso (Auditada)
              </h2>
              <p style={{ color: isDark ? '#94a3b8' : 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Toda alteração de senha é criptografada com Bcrypt e registrada no banco de dados com autor, data, hora e IP.
              </p>

              {passwordError && (
                <div style={{ padding: '0.65rem 1rem', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', borderRadius: '8px', fontSize: '0.825rem', marginBottom: '1rem', fontWeight: 600 }}>
                  ⚠ {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div style={{ padding: '0.65rem 1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '8px', fontSize: '0.825rem', marginBottom: '1rem', fontWeight: 600 }}>
                  {passwordSuccess}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Senha Atual
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.5rem 0.75rem 1rem',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)',
                        backgroundColor: isDark ? '#101726' : '#ffffff',
                        color: isDark ? '#f8fafc' : 'var(--text-main)',
                        fontSize: '0.925rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? 'Ocultar senha' : 'Exibir senha'}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: isDark ? '#94a3b8' : 'var(--text-muted)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showCurrentPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Nova Senha Forte
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.5rem 0.75rem 1rem',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)',
                        backgroundColor: isDark ? '#101726' : '#ffffff',
                        color: isDark ? '#f8fafc' : 'var(--text-main)',
                        fontSize: '0.925rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? 'Ocultar senha' : 'Exibir senha'}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: isDark ? '#94a3b8' : 'var(--text-muted)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showNewPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  {strength && (
                    <div style={{ marginTop: '0.4rem' }}>
                      <div style={{ height: '4px', width: '100%', backgroundColor: isDark ? '#2b3a4f' : 'var(--border-light)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: strength.width, backgroundColor: strength.color, transition: 'all 0.3s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.725rem', color: strength.color, fontWeight: 700, marginTop: '0.2rem', display: 'block' }}>
                        Força: {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Confirmar Nova Senha
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.5rem 0.75rem 1rem',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)',
                        backgroundColor: isDark ? '#101726' : '#ffffff',
                        color: isDark ? '#f8fafc' : 'var(--text-main)',
                        fontSize: '0.925rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Ocultar senha' : 'Exibir senha'}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: isDark ? '#94a3b8' : 'var(--text-muted)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showConfirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                  Atualizar Senha & Registrar Auditoria
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: ACESSIBILIDADE & INTERFACE (PERSISTÊNCIA NO BANCO) */}
        {activeTab === 'acessibilidade' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="settings-card" style={{ backgroundColor: isDark ? '#151e2e' : '#ffffff', borderRadius: '16px', padding: '2rem', border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: isDark ? '#f8fafc' : 'var(--text-main)' }}>
                  Diretrizes de Acessibilidade & Interface (e-MAG / WCAG)
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                  ☁️ Sincronizado com seu Login no Banco de Dados
                </span>
              </div>
              <p style={{ color: isDark ? '#94a3b8' : 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
                Ao alterar as opções abaixo, suas escolhas são gravadas no seu usuário e lembradas automaticamente em qualquer navegador.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Alto Contraste */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#f8fafc' : 'var(--text-main)' }}>
                      Modo Alto Contraste Institucional
                    </div>
                    <div style={{ fontSize: '0.825rem', color: isDark ? '#94a3b8' : 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Aumenta a distinção de elementos para pessoas com baixa visão ou fotossensibilidade.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveAccessibility({ highContrast: !config.highContrast })}
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: config.highContrast ? 'var(--accent-emerald)' : (isDark ? '#3b4a63' : 'var(--border-light)'),
                      backgroundColor: config.highContrast ? 'var(--accent-emerald)' : (isDark ? '#243044' : '#ffffff'),
                      color: config.highContrast ? '#ffffff' : (isDark ? '#e2e8f0' : 'var(--text-main)'),
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {config.highContrast ? '✓ Ativado' : 'Desativado'}
                  </button>
                </div>

                {/* Tamanho da Fonte */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#f8fafc' : 'var(--text-main)' }}>
                      Escala Tipográfica (Tamanho dos Textos)
                    </div>
                    <div style={{ fontSize: '0.825rem', color: isDark ? '#94a3b8' : 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Ajuste o tamanho base da leitura de apostilas e comunicados.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {(['normal', 'comfort', 'large'] as const).map((size) => {
                      const isSelected = config.fontSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSaveAccessibility({ fontSize: size })}
                          style={{
                            padding: '0.45rem 0.95rem',
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--accent-blue)' : (isDark ? '#3b4a63' : 'var(--border-light)'),
                            backgroundColor: isSelected ? 'var(--accent-blue)' : (isDark ? '#243044' : '#ffffff'),
                            color: isSelected ? '#ffffff' : (isDark ? '#e2e8f0' : 'var(--text-main)'),
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.825rem',
                            cursor: 'pointer',
                          }}
                        >
                          {size === 'normal' ? 'Padrão (100%)' : size === 'comfort' ? 'Confortável (115%)' : 'Ampliado (130%)'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Redução de Movimento */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#f8fafc' : 'var(--text-main)' }}>
                      Reduzir Animações da Interface
                    </div>
                    <div style={{ fontSize: '0.825rem', color: isDark ? '#94a3b8' : 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Desativa transições dinâmicas para menor sobrecarga visual.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveAccessibility({ reduceMotion: !config.reduceMotion })}
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: config.reduceMotion ? 'var(--accent-emerald)' : (isDark ? '#3b4a63' : 'var(--border-light)'),
                      backgroundColor: config.reduceMotion ? 'var(--accent-emerald)' : (isDark ? '#243044' : '#ffffff'),
                      color: config.reduceMotion ? '#ffffff' : (isDark ? '#e2e8f0' : 'var(--text-main)'),
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                    }}
                  >
                    {config.reduceMotion ? '✓ Reduzidas' : 'Normais'}
                  </button>
                </div>

                {/* Filtro do Mural */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#f8fafc' : 'var(--text-main)' }}>
                      Filtro Padrão do Feed de Avisos
                    </div>
                    <div style={{ fontSize: '0.825rem', color: isDark ? '#94a3b8' : 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Priorizar comunicados direcionados ao seu curso ({config.course}) e semestre ({config.semester}º).
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => handleSaveAccessibility({ feedFilter: 'my_course' })}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: config.feedFilter === 'my_course' ? 'var(--accent-blue)' : (isDark ? '#3b4a63' : 'var(--border-light)'),
                        backgroundColor: config.feedFilter === 'my_course' ? 'var(--accent-blue)' : (isDark ? '#243044' : '#ffffff'),
                        color: config.feedFilter === 'my_course' ? '#ffffff' : (isDark ? '#e2e8f0' : 'var(--text-main)'),
                        fontWeight: config.feedFilter === 'my_course' ? 700 : 500,
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                      }}
                    >
                      Apenas Meu Curso/Semestre
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveAccessibility({ feedFilter: 'all' })}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: config.feedFilter === 'all' ? 'var(--accent-blue)' : (isDark ? '#3b4a63' : 'var(--border-light)'),
                        backgroundColor: config.feedFilter === 'all' ? 'var(--accent-blue)' : (isDark ? '#243044' : '#ffffff'),
                        color: config.feedFilter === 'all' ? '#ffffff' : (isDark ? '#e2e8f0' : 'var(--text-main)'),
                        fontWeight: config.feedFilter === 'all' ? 700 : 500,
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                      }}
                    >
                      Todos os Comunicados
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HISTÓRICO & AUDITORIA DE SEGURANÇA */}
        {activeTab === 'historico' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* CARD 1: ATALHO PARA EXTRATO E COMPRAS NA CANTINA */}
            <div
              className="settings-card"
              style={{
                backgroundColor: isDark ? '#151e2e' : '#ffffff',
                borderRadius: '16px',
                padding: '1.75rem 2rem',
                border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem',
              }}
            >
              <div style={{ maxWidth: '640px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="21" r="1"/>
                    <circle cx="19" cy="21" r="1"/>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                  </svg>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: isDark ? '#f8fafc' : 'var(--text-main)', margin: 0 }}>
                    Extrato e Histórico de Compras na Cantina
                  </h2>
                </div>
                <p style={{ color: isDark ? '#94a3b8' : 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                  Consulte comprovantes Pix, detalhamento de pedidos, bebidas, lanches e total consumido nos intervalos acadêmicos através da Cantina Discente.
                </p>
              </div>

              <Link
                href="/historico"
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', padding: '0.65rem 1.35rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <span>Ver Extrato da Cantina</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>

            {/* CARD 2: TRILHA DE AUDITORIA & HISTÓRICO DE ALTERAÇÕES */}
            <div className="settings-card" style={{ backgroundColor: isDark ? '#151e2e' : '#ffffff', borderRadius: '16px', padding: '2rem', border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.25rem' }}>
                  Trilha de Auditoria & Histórico de Alterações
                </h2>
                <p style={{ color: isDark ? '#94a3b8' : 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Registro imutável no PostgreSQL com data, hora, campo alterado e autor responsável.
                </p>
              </div>
              <button
                type="button"
                onClick={loadSecurityAudit}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #3b4a63' : '1px solid var(--border-light)',
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  color: isDark ? '#f8fafc' : 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>Atualizar Logs</span>
              </button>
            </div>

            {securityLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: isDark ? '#94a3b8' : 'var(--text-muted)' }}>
                Nenhuma alteração de segurança registrada até o momento.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)', textAlign: 'left', color: isDark ? '#94a3b8' : 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>Data & Hora</th>
                      <th style={{ padding: '0.75rem' }}>Tipo de Evento</th>
                      <th style={{ padding: '0.75rem' }}>Campo</th>
                      <th style={{ padding: '0.75rem' }}>Valor Anterior</th>
                      <th style={{ padding: '0.75rem' }}>Novo Valor</th>
                      <th style={{ padding: '0.75rem' }}>IP / Origem</th>
                      <th style={{ padding: '0.75rem' }}>Autor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: isDark ? '1px solid #1f293d' : '1px solid #f1f5f9', color: isDark ? '#f8fafc' : 'var(--text-main)' }}>
                        <td style={{ padding: '0.75rem', whiteSpace: 'nowrap', fontSize: '0.8rem', color: isDark ? '#94a3b8' : 'var(--text-muted)' }}>
                          {new Date(log.createdAt).toLocaleString('pt-BR')}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span
                            className={`audit-badge ${
                              log.action === 'PASSWORD_CHANGE'
                                ? 'audit-badge-password'
                                : log.action === 'PRIMARY_EMAIL_CHANGE' || log.action === 'RECOVERY_EMAIL_CHANGE'
                                ? 'audit-badge-email'
                                : 'audit-badge-profile'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{log.fieldName}</td>
                        <td style={{ padding: '0.75rem', color: isDark ? '#94a3b8' : 'var(--text-muted)' }}>{log.oldValueMasked || '—'}</td>
                        <td style={{ padding: '0.75rem', color: '#059669', fontWeight: 600 }}>{log.newValueMasked || '—'}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.78rem', color: isDark ? '#94a3b8' : 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: isDark ? '#94a3b8' : 'var(--text-muted)' }}>
                          {log.changedByName || 'Próprio Usuário'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
