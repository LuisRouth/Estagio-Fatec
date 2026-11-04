'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';

interface StudentConfig {
  name: string;
  ra: string;
  course: 'IA' | 'ESG';
  semester: number;
  primaryEmail: string;
  recoveryEmail: string;
  highContrast: boolean;
  fontSize: 'normal' | 'comfort' | 'large';
  reduceMotion: boolean;
  feedFilter: 'my_course' | 'all';
}

const DEFAULT_CONFIG: StudentConfig = {
  name: 'Luis Otavio',
  ra: '2840002',
  course: 'IA',
  semester: 4,
  primaryEmail: 'luis.dev@aluno.cps.sp.gov.br',
  recoveryEmail: 'luis.pessoal@gmail.com',
  highContrast: false,
  fontSize: 'normal',
  reduceMotion: false,
  feedFilter: 'my_course',
};

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguranca' | 'acessibilidade'>('perfil');
  const [config, setConfig] = useState<StudentConfig>(DEFAULT_CONFIG);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Carrega configurações persistidas e sincroniza eventos de contraste
  useEffect(() => {
    try {
      const contrast = localStorage.getItem('fatec_high_contrast') === 'true';
      const saved = localStorage.getItem('fatec_student_config');
      if (saved) {
        setConfig((prev) => ({ ...prev, ...JSON.parse(saved), highContrast: contrast }));
      } else {
        setConfig((prev) => ({ ...prev, highContrast: contrast }));
      }
    } catch {}

    const handleContrastChange = () => {
      try {
        const saved = localStorage.getItem('fatec_high_contrast') === 'true';
        setConfig((prev) => ({ ...prev, highContrast: saved }));
      } catch {}
    };
    window.addEventListener('fatec_contrast_changed', handleContrastChange);
    return () => {
      window.removeEventListener('fatec_contrast_changed', handleContrastChange);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('fatec_student_config', JSON.stringify(config));
    showToast('✓ Dados acadêmicos atualizados com sucesso no dispositivo!');
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        setPasswordError('A nova senha deve possuir pelo menos 6 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('A confirmação não coincide com a nova senha digitada.');
        return;
      }
    }

    localStorage.setItem('fatec_student_config', JSON.stringify(config));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('✓ E-mails e credenciais de segurança atualizados com sucesso!');
  };

  const isDark = config.highContrast;

  const handleSaveAccessibility = (newConfig?: StudentConfig) => {
    const cfg = newConfig || config;
    try {
      localStorage.setItem('fatec_student_config', JSON.stringify(cfg));
      localStorage.setItem('fatec_high_contrast', String(cfg.highContrast));
      if (typeof document !== 'undefined') {
        if (cfg.highContrast) {
          document.documentElement.classList.add('dark-high-contrast');
          document.body.classList.add('dark-high-contrast');
          document.documentElement.style.backgroundColor = '#0b1120';
        } else {
          document.documentElement.classList.remove('dark-high-contrast');
          document.body.classList.remove('dark-high-contrast');
          document.documentElement.style.backgroundColor = '#f8fafc';
        }
      }
      setTimeout(() => { window.dispatchEvent(new Event('fatec_contrast_changed')); }, 0);
    } catch {}
    showToast('✓ Preferências de acessibilidade e interface salvas!');
  };

  // Cálculo visual de força de senha
  const getPasswordStrength = () => {
    if (!newPassword) return null;
    if (newPassword.length < 6) return { label: 'Fraca', color: '#e11d48', width: '33%' };
    if (newPassword.length < 10) return { label: 'Moderada', color: '#d97706', width: '66%' };
    return { label: 'Forte & Segura', color: '#059669', width: '100%' };
  };

  const strength = getPasswordStrength();

  return (
    <AppLayout activePath="/configuracoes">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        
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
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: isDark ? '#f8fafc' : 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Perfil & Configurações
            </h1>
            <p style={{ color: isDark ? '#94a3b8' : 'var(--text-sub)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
              Gerencie sua jornada acadêmica, credenciais de e-mail e preferências de acessibilidade do portal.
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
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: isDark ? 'rgba(2, 132, 199, 0.25)' : 'var(--accent-blue-light)',
                color: isDark ? '#38bdf8' : 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              {config.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#f8fafc' : 'var(--text-main)' }}>{config.name}</div>
              <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : 'var(--text-muted)' }}>RA: {config.ra} • {config.course} ({config.semester}º Sem)</div>
            </div>
          </div>
        </div>

        {/* Toast Notificação de Sucesso */}
        {toastMessage && (
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              borderRadius: '10px',
              padding: '0.85rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 700 }}
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
            borderBottom: '2px solid var(--border-light)',
            paddingBottom: '0.25rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px 8px 0 0',
              fontWeight: 700,
              fontSize: '0.925rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'perfil' ? (isDark ? '#243044' : '#ffffff') : 'transparent',
              color: activeTab === 'perfil' ? (isDark ? '#38bdf8' : 'var(--accent-blue)') : (isDark ? '#94a3b8' : 'var(--text-muted)'),
              borderBottom: activeTab === 'perfil' ? `3px solid ${isDark ? '#38bdf8' : 'var(--accent-blue)'}` : '3px solid transparent',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Perfil Acadêmico & Semestre
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seguranca')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px 8px 0 0',
              fontWeight: 700,
              fontSize: '0.925rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'seguranca' ? (isDark ? '#243044' : '#ffffff') : 'transparent',
              color: activeTab === 'seguranca' ? (isDark ? '#38bdf8' : 'var(--accent-blue)') : (isDark ? '#94a3b8' : 'var(--text-muted)'),
              borderBottom: activeTab === 'seguranca' ? `3px solid ${isDark ? '#38bdf8' : 'var(--accent-blue)'}` : '3px solid transparent',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            E-mails & Segurança
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('acessibilidade')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px 8px 0 0',
              fontWeight: 700,
              fontSize: '0.925rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'acessibilidade' ? (isDark ? '#243044' : '#ffffff') : 'transparent',
              color: activeTab === 'acessibilidade' ? (isDark ? '#38bdf8' : 'var(--accent-blue)') : (isDark ? '#94a3b8' : 'var(--text-muted)'),
              borderBottom: activeTab === 'acessibilidade' ? `3px solid ${isDark ? '#38bdf8' : 'var(--accent-blue)'}` : '3px solid transparent',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Acessibilidade & Interface
          </button>
        </div>

        {/* CONTEÚDO TAB 1: PERFIL ACADÊMICO */}
        {activeTab === 'perfil' && (
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: isDark ? '#151e2e' : '#ffffff', borderRadius: '16px', padding: '2rem', border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                Dados do Estudante
              </h2>
              <p style={{ color: isDark ? '#94a3b8' : 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Identificação pessoal e parâmetros acadêmicos utilizados para personalizar a sua grade e comunicados.
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
                    <option value="IA" style={{ backgroundColor: isDark ? '#101726' : '#ffffff', color: isDark ? '#f8fafc' : 'var(--text-main)' }}>Inteligência Artificial (Matutino)</option>
                    <option value="ESG" style={{ backgroundColor: isDark ? '#101726' : '#ffffff', color: isDark ? '#f8fafc' : 'var(--text-main)' }}>Gestão ESG (Noturno)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Semestre Atual do Curso
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
                      outline: 'none',
                      fontWeight: 600,
                      color: isDark ? '#38bdf8' : 'var(--accent-blue)',
                    }}
                  >
                    <option value={1} style={{ backgroundColor: isDark ? '#101726' : '#ffffff', color: isDark ? '#f8fafc' : 'var(--text-main)' }}>1º Semestre (Ingressante)</option>
                    <option value={2} style={{ backgroundColor: isDark ? '#101726' : '#ffffff', color: isDark ? '#f8fafc' : 'var(--text-main)' }}>2º Semestre</option>
                    <option value={3} style={{ backgroundColor: isDark ? '#101726' : '#ffffff', color: isDark ? '#f8fafc' : 'var(--text-main)' }}>3º Semestre</option>
                    <option value={4} style={{ backgroundColor: isDark ? '#101726' : '#ffffff', color: isDark ? '#f8fafc' : 'var(--text-main)' }}>4º Semestre</option>
                    <option value={5} style={{ backgroundColor: isDark ? '#101726' : '#ffffff', color: isDark ? '#f8fafc' : 'var(--text-main)' }}>5º Semestre</option>
                    <option value={6} style={{ backgroundColor: isDark ? '#101726' : '#ffffff', color: isDark ? '#f8fafc' : 'var(--text-main)' }}>6º Semestre (Concluinte)</option>
                  </select>
                </div>
              </div>

              {/* Box Explicativo de UX sobre o Semestre */}
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: isDark ? '#16263d' : 'var(--accent-blue-light)',
                  borderRadius: '10px',
                  border: isDark ? '1px solid rgba(2, 132, 199, 0.4)' : '1px solid rgba(2, 132, 199, 0.2)',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ fontSize: '1.25rem', lineHeight: 1 }}>💡</div>
                <div style={{ fontSize: '0.825rem', color: isDark ? '#7dd3fc' : '#0369a1', lineHeight: 1.5 }}>
                  <strong style={{ color: isDark ? '#bae6fd' : '#0369a1' }}>Por que o semestre pode ser alterado aqui?</strong> O sistema não avança automaticamente seu semestre pelo tempo corrido do relógio. Ao ser aprovado no período letivo, selecione seu novo semestre para que a grade didática e os prazos de estágio supervisionado do mural sejam atualizados imediatamente!
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

        {/* CONTEÚDO TAB 2: E-MAILS & SEGURANÇA */}
        {activeTab === 'seguranca' && (
          <form onSubmit={handleSaveSecurity} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: isDark ? '#151e2e' : '#ffffff', borderRadius: '16px', padding: '2rem', border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                Gerenciamento de E-mails Institucional & Segurança
              </h2>
              <p style={{ color: isDark ? '#94a3b8' : 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Mantenha seu e-mail institucional oficial atualizado e configure um endereço pessoal para recuperação de emergência.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                    E-mail Institucional Principal
                  </label>
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
                    Permite sufixos oficiais: @aluno.cps.sp.gov.br ou @fatec.sp.gov.br
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                    E-mail de Segurança / Recuperação (Pessoal)
                  </label>
                  <input
                    type="email"
                    value={config.recoveryEmail}
                    onChange={(e) => setConfig({ ...config, recoveryEmail: e.target.value })}
                    placeholder="exemplo.pessoal@gmail.com"
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
                    Utilizado caso você perca o acesso provisório ao seu e-mail do CPS.
                  </div>
                </div>
              </div>

              <div style={{ borderTop: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Alteração de Senha de Acesso
                </h3>
                <p style={{ color: isDark ? '#94a3b8' : 'var(--text-muted)', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
                  Preencha os campos abaixo apenas se desejar redefinir sua credencial.
                </p>

                {passwordError && (
                  <div style={{ padding: '0.65rem 1rem', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', borderRadius: '8px', fontSize: '0.825rem', marginBottom: '1rem', fontWeight: 600 }}>
                    ⚠ {passwordError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.35rem' }}>
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)',
                        backgroundColor: isDark ? '#101726' : '#ffffff',
                        color: isDark ? '#f8fafc' : 'var(--text-main)',
                        fontSize: '0.925rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.35rem' }}>
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)',
                        backgroundColor: isDark ? '#101726' : '#ffffff',
                        color: isDark ? '#f8fafc' : 'var(--text-main)',
                        fontSize: '0.925rem',
                      }}
                    />
                    {strength && (
                      <div style={{ marginTop: '0.4rem' }}>
                        <div style={{ height: '4px', width: '100%', backgroundColor: isDark ? '#2b3a4f' : 'var(--border-light)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: strength.width, backgroundColor: strength.color, transition: 'all 0.3s ease' }} />
                        </div>
                        <span style={{ fontSize: '0.725rem', color: strength.color, fontWeight: 700, marginTop: '0.2rem', display: 'block' }}>
                          Força da Senha: {strength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.35rem' }}>
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)',
                        backgroundColor: isDark ? '#101726' : '#ffffff',
                        color: isDark ? '#f8fafc' : 'var(--text-main)',
                        fontSize: '0.925rem',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                Salvar E-mails & Credenciais
              </button>
            </div>
          </form>
        )}

        {/* CONTEÚDO TAB 3: ACESSIBILIDADE & INTERFACE */}
        {activeTab === 'acessibilidade' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: isDark ? '#151e2e' : '#ffffff', borderRadius: '16px', padding: '2rem', border: isDark ? '1px solid #2b3a4f' : '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: isDark ? '#f8fafc' : 'var(--text-main)', marginBottom: '0.4rem' }}>
                Diretrizes de Acessibilidade & Interface (e-MAG / WCAG)
              </h2>
              <p style={{ color: isDark ? '#94a3b8' : 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
                Recursos para tornar a navegação mais inclusiva e adaptável às suas necessidades de visão e conforto.
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
                    onClick={() => {
                      const next = !config.highContrast;
                      const updated = { ...config, highContrast: next };
                      setConfig(updated);
                      handleSaveAccessibility(updated);
                    }}
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
                          onClick={() => {
                            const updated = { ...config, fontSize: size };
                            setConfig(updated);
                            handleSaveAccessibility(updated);
                          }}
                          style={{
                            padding: '0.45rem 0.95rem',
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: isSelected
                              ? 'var(--accent-blue)'
                              : (isDark ? '#3b4a63' : 'var(--border-light)'),
                            backgroundColor: isSelected
                              ? 'var(--accent-blue)'
                              : (isDark ? '#243044' : '#ffffff'),
                            color: isSelected
                              ? '#ffffff'
                              : (isDark ? '#e2e8f0' : 'var(--text-main)'),
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.825rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
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
                      Ideal para quem tem sensibilidade a movimentos contínuos ou prefere transições estáticas.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...config, reduceMotion: !config.reduceMotion };
                      setConfig(updated);
                      handleSaveAccessibility(updated);
                    }}
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
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {config.reduceMotion ? '✓ Reduzidas' : 'Normais'}
                  </button>
                </div>

                {/* Filtro do Mural */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#f8fafc' : 'var(--text-main)' }}>
                      Visualização Padrão do Mural
                    </div>
                    <div style={{ fontSize: '0.825rem', color: isDark ? '#94a3b8' : 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Escolha quais comunicados aparecem pré-selecionados ao abrir o Mural de Avisos.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...config, feedFilter: 'my_course' as const };
                        setConfig(updated);
                        handleSaveAccessibility(updated);
                      }}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: config.feedFilter === 'my_course'
                          ? 'var(--accent-blue)'
                          : (isDark ? '#3b4a63' : 'var(--border-light)'),
                        backgroundColor: config.feedFilter === 'my_course'
                          ? 'var(--accent-blue)'
                          : (isDark ? '#243044' : '#ffffff'),
                        color: config.feedFilter === 'my_course'
                          ? '#ffffff'
                          : (isDark ? '#e2e8f0' : 'var(--text-main)'),
                        fontWeight: config.feedFilter === 'my_course' ? 700 : 500,
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Apenas Meu Curso
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...config, feedFilter: 'all' as const };
                        setConfig(updated);
                        handleSaveAccessibility(updated);
                      }}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: config.feedFilter === 'all'
                          ? 'var(--accent-blue)'
                          : (isDark ? '#3b4a63' : 'var(--border-light)'),
                        backgroundColor: config.feedFilter === 'all'
                          ? 'var(--accent-blue)'
                          : (isDark ? '#243044' : '#ffffff'),
                        color: config.feedFilter === 'all'
                          ? '#ffffff'
                          : (isDark ? '#e2e8f0' : 'var(--text-main)'),
                        fontWeight: config.feedFilter === 'all' ? 700 : 500,
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Mural Integrado (IA + ESG)
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
