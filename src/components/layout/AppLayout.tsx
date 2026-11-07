'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogoFatec } from '@/components/brand/LogoFatec';
import { GaloWidget } from '@/components/brand/GaloWidget';
import { EcoTechBackground } from './EcoTechBackground';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  userName?: string;
  userRole?: string;
}

// Cache em memória compartilhado entre trocas de páginas para eliminar o piscar da autenticação e do contraste
let cachedUser: { name: string; role: string; course?: string } | null = null;
let cachedHighContrast: boolean = false;
let lastAuthCheckTime = 0;
let hasHydrated = false;

if (typeof window !== 'undefined') {
  try {
    cachedHighContrast = localStorage.getItem('fatec_high_contrast') === 'true';
    const stored = sessionStorage.getItem('fatec_auth_user');
    if (stored) {
      cachedUser = JSON.parse(stored);
      lastAuthCheckTime = Date.now();
    }
  } catch {}
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activePath = '/',
  userName: propUserName,
  userRole: propUserRole,
}) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Inicialização segura com SSR: no primeiro render do cliente (hidratação), espelha o servidor para evitar Hydration Mismatch.
  // Em todas as navegações subsequentes (SPA), usa os caches em memória instantaneamente sem nenhum piscar.
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (!hasHydrated) return false;
    return cachedHighContrast;
  });

  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; course?: string } | null>(() => {
    if (!hasHydrated) return null;
    return cachedUser;
  });

  const [loadingAuth, setLoadingAuth] = useState<boolean>(() => {
    if (!hasHydrated) return !propUserName;
    return !cachedUser && !propUserName;
  });
  const [loggingOut, setLoggingOut] = useState(false);

  // Hidratação concluída: sincroniza os caches locais imediatamente após o primeiro render
  useEffect(() => {
    hasHydrated = true;
    if (cachedHighContrast && !highContrast) {
      setHighContrast(true);
    }
    if (cachedUser) {
      setCurrentUser(cachedUser);
      setLoadingAuth(false);
    } else {
      try {
        const stored = sessionStorage.getItem('fatec_auth_user');
        if (stored) {
          const user = JSON.parse(stored);
          cachedUser = user;
          setCurrentUser(user);
          setLoadingAuth(false);
        }
      } catch {}
    }
  }, []);
  
  // Sincronização imediata de classes no documentElement e body para eliminar qualquer tela branca
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (highContrast) {
        document.documentElement.classList.add('dark-high-contrast');
        document.body.classList.add('dark-high-contrast');
        document.documentElement.style.backgroundColor = '#0b1120';
      } else {
        document.documentElement.classList.remove('dark-high-contrast');
        document.body.classList.remove('dark-high-contrast');
        document.documentElement.style.backgroundColor = '#f8fafc';
      }
    }
  }, [highContrast]);

  // Sincronização em tempo real de eventos de contraste entre janelas e abas
  useEffect(() => {
    const handleContrastChange = () => {
      try {
        const saved = localStorage.getItem('fatec_high_contrast') === 'true';
        cachedHighContrast = saved;
        setHighContrast(saved);
      } catch {}
    };
    window.addEventListener('fatec_contrast_changed', handleContrastChange);
    return () => {
      window.removeEventListener('fatec_contrast_changed', handleContrastChange);
    };
  }, []);

  const toggleHighContrast = () => {
    const next = !highContrast;
    cachedHighContrast = next;
    setHighContrast(next);
    try {
      localStorage.setItem('fatec_high_contrast', String(next));
      if (typeof document !== 'undefined') {
        if (next) {
          document.documentElement.classList.add('dark-high-contrast');
          document.body.classList.add('dark-high-contrast');
          document.documentElement.style.backgroundColor = '#0b1120';
        } else {
          document.documentElement.classList.remove('dark-high-contrast');
          document.body.classList.remove('dark-high-contrast');
          document.documentElement.style.backgroundColor = '#f8fafc';
        }
      }
      setTimeout(() => {
        window.dispatchEvent(new Event('fatec_contrast_changed'));
      }, 0);
    } catch {}
  };

  // Fechamento automático do menu de usuário ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Consulta e sincronização de sessão ativa via /api/auth/me com debounce inteligente
  useEffect(() => {
    let isMounted = true;

    // Se já verificou a autenticação nos últimos 60 segundos e temos o usuário em cache, evita requisições lentas
    if (cachedUser && Date.now() - lastAuthCheckTime < 60000) {
      if (loadingAuth) setLoadingAuth(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && isMounted) {
            const userObj = {
              name: data.data.name,
              role: data.data.role,
              course: data.data.course,
            };
            cachedUser = userObj;
            lastAuthCheckTime = Date.now();
            try {
              sessionStorage.setItem('fatec_auth_user', JSON.stringify(userObj));
            } catch {}
            setCurrentUser(userObj);
          }
        } else if (isMounted) {
          cachedUser = null;
          try {
            sessionStorage.removeItem('fatec_auth_user');
          } catch {}
          setCurrentUser(null);
        }
      } catch (err) {
        if (isMounted) {
          cachedUser = null;
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) setLoadingAuth(false);
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Executa o logout no backend enquanto a animação do botão correndo para a direita completa (450ms)
      await Promise.all([
        fetch('/api/auth/logout', { method: 'POST' }),
        new Promise((resolve) => setTimeout(resolve, 450)),
      ]);
      cachedUser = null;
      try {
        sessionStorage.removeItem('fatec_auth_user');
      } catch {}
      setCurrentUser(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Erro ao deslogar:', err);
      setLoggingOut(false);
    }
  };

    const formatRole = (role?: string) => {
    if (!role) return 'Discente';
    const r = role.toUpperCase().trim();
    if (r === 'ADMIN') return 'Administrador';
    if (r === 'CA_MEMBRO' || r === 'CA MEMBRO') return 'CA MEMBRO';
    if (r === 'PROFESSOR') return 'Docente';
    if (r === 'ALUNO') return 'Discente';
    return role.replace(/_/g, ' ');
  };

  const displayName = currentUser?.name || propUserName;
  const displayRole = formatRole(currentUser?.role || propUserRole);

  // Itens da navegação limpos, sem emojis e sem termos em inglês
  const navItems = [
    { label: 'Início', href: '/' },
    { label: 'Mural de Avisos', href: '/avisos' },
    { label: 'Cantina Discente', href: '/cantina' },
    { label: 'Repositório Acadêmico', href: '/repositorio' },
    { label: 'Vitrine de Projetos', href: '/vitrine' },
    { label: 'Extrato de Consumo', href: '/historico' },
    ...(currentUser?.role === 'ADMIN'
      ? [{ label: 'Gestão de Usuários', href: '/admin/usuarios' }]
      : []),
  ];

  return (
    <div
      className={highContrast ? 'dark-high-contrast' : ''}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: highContrast ? '#0b1120' : 'transparent',
        color: highContrast ? '#f8fafc' : 'var(--text-main)',
        position: 'relative',
      }}
    >
      {/* Fundo Dinâmico Simbiótico: IA e ESG (Neurônios e conexões sempre visíveis) */}
      <EcoTechBackground />
      {/* Header Institucional Fixo no Topo Absoluto (Sem faixas extras sobrepondo) */}
      <header
        style={{
          height: 'var(--header-height)',
          backgroundColor: highContrast ? '#0f172a' : '#ffffff',
          borderBottom: highContrast ? '1px solid #334155' : '1px solid var(--border-light)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Botão Menu Hambúrguer (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="hamburger-btn"
            style={{
              background: 'none',
              border: '1px solid var(--border-light)',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0.45rem 0.65rem',
              borderRadius: '8px',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
            }}
            aria-label="Abrir menu lateral"
          >
            ☰
          </button>

          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <LogoFatec height={48} />
          </Link>
        </div>

        {/* Bloco da Direita: Autenticação Dinâmica (Perfil & Configurações / Sair vs Entrar / Cadastro) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {displayName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {/* Menu Dropdown de Perfil & Configurações com Engrenagem Rítmica */}
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '260px',
                    background: userMenuOpen ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
                    border: '1px solid',
                    borderColor: userMenuOpen ? 'var(--accent-blue)' : (highContrast ? '#334155' : 'var(--border-light)'),
                    borderRadius: '10px',
                    padding: '0.35rem 0.65rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  title="Menu do Perfil e Configurações"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: highContrast ? '#243044' : 'var(--accent-blue-light)',
                        color: highContrast ? '#38bdf8' : 'var(--accent-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        border: '1px solid',
                        borderColor: highContrast ? '#3b4a63' : 'var(--border-light)',
                        flexShrink: 0,
                      }}
                      title={displayName}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: highContrast ? '#f8fafc' : 'var(--text-main)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {displayName}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--accent-emerald)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {displayRole || 'Discente'}
                      </div>
                    </div>
                  </div>

                  {/* Mecanismo de Engrenagens Interconectadas (Somente 1 visível quando fechado, as outras 2 conectam ao abrir) */}
                  <div
                    style={{
                      position: 'relative',
                      width: '40px',
                      height: '30px',
                      flexShrink: 0,
                    }}
                    title="Configurações e Acessibilidade"
                  >
                    {/* Engrenagem 1: Principal (Sempre visível, Azul Institucional) */}
                    <div
                      className={userMenuOpen ? 'gear-spin-cw' : ''}
                      style={{
                        position: 'absolute',
                        right: '1px',
                        top: '5px',
                        width: '20px',
                        height: '20px',
                        color: userMenuOpen ? 'var(--accent-blue)' : 'var(--text-muted)',
                        transition: 'color 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    </div>

                    {/* As outras 2 engrenagens conectadas SOMENTE aparecem enquanto o menu estiver aberto */}
                    {userMenuOpen && (
                      <>
                        {/* Engrenagem 2: Superior Conectada (Aumentada 16px, Azul Céu #38bdf8, rotação anti-horária sincronizada) */}
                        <div
                          className="gear-spin-ccw"
                          style={{
                            position: 'absolute',
                            left: '9px',
                            top: '0px',
                            width: '16px',
                            height: '16px',
                            color: '#38bdf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1,
                            animation: 'fadeIn 0.2s ease, gearSpinCCW 2.4s steps(12, end) infinite',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                        </div>

                        {/* Engrenagem 3: Inferior Conectada (Aumentada 14px, Azul Oceano #0369a1, rotação horária acelerada) */}
                        <div
                          className="gear-spin-cw-fast"
                          style={{
                            position: 'absolute',
                            left: '3px',
                            bottom: '1px',
                            width: '14px',
                            height: '14px',
                            color: '#0369a1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1,
                            animation: 'fadeIn 0.2s ease, gearSpinCW 1.8s steps(12, end) infinite',
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                        </div>
                      </>
                    )}
                  </div>
                </button>

                {/* Dropdown Menu Flutuante Perfeitamente Alinhado com o Botão Superior */}
                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      width: '260px',
                      backgroundColor: highContrast ? '#1e293b' : '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: highContrast ? '#334155' : 'var(--border-light)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '0.75rem',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      color: highContrast ? '#f8fafc' : 'var(--text-main)',
                    }}
                  >
                    <div style={{ padding: '0.35rem 0.5rem 0.65rem', borderBottom: '1px solid', borderColor: highContrast ? '#334155' : 'var(--border-light)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: highContrast ? '#f8fafc' : 'var(--text-main)' }}>{displayName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>{displayRole}</div>
                    </div>

                    <Link
                      href="/configuracoes"
                      prefetch={true}
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        color: activePath === '/configuracoes'
                          ? (highContrast ? '#38bdf8' : 'var(--accent-blue-hover)')
                          : (highContrast ? '#f8fafc' : 'var(--text-main)'),
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: activePath === '/configuracoes'
                          ? (highContrast ? '#243044' : 'var(--accent-blue-light)')
                          : 'transparent',
                        border: activePath === '/configuracoes' && highContrast ? '1px solid #38bdf8' : '1px solid transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      <span>Perfil & Configurações</span>
                    </Link>

                    {currentUser?.role === 'ADMIN' && (
                      <Link
                        href="/admin/usuarios"
                        prefetch={true}
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          color: activePath === '/admin/usuarios'
                            ? (highContrast ? '#38bdf8' : 'var(--accent-blue-hover)')
                            : '#b91c1c',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          backgroundColor: activePath === '/admin/usuarios'
                            ? (highContrast ? '#243044' : 'var(--accent-blue-light)')
                            : '#fef2f2',
                          border: '1px solid #fecaca',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>👥</span>
                        <span>Gestão de Usuários (ADM)</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={toggleHighContrast}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: highContrast ? '#f8fafc' : 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', whiteSpace: 'nowrap' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a10 10 0 0 1 0 20Z" fill="currentColor" />
                        </svg>
                        <span>Alto Contraste</span>
                      </span>
                      <div
                        style={{
                          width: '32px',
                          height: '18px',
                          borderRadius: '999px',
                          backgroundColor: highContrast ? '#0284c7' : '#cbd5e1',
                          position: 'relative',
                          transition: 'background-color 0.2s ease',
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            position: 'absolute',
                            top: '2px',
                            left: highContrast ? '16px' : '2px',
                            transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
                          }}
                        />
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Contêiner isolado com overflow hidden APENAS para a corrida do botão Sair */}
              <div style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', paddingRight: '2px' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.42rem 0.8rem',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    color: 'var(--accent-rose)',
                    borderColor: 'rgba(225, 29, 72, 0.25)',
                    backgroundColor: loggingOut ? 'rgba(255, 241, 242, 0.95)' : 'rgba(255, 241, 242, 0.6)',
                    cursor: loggingOut ? 'default' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease, background-color 0.2s ease',
                    transform: loggingOut ? 'translateX(140px) skewX(-14deg) scale(0.9)' : 'translateX(0)',
                    opacity: loggingOut ? 0 : 1,
                    pointerEvents: loggingOut ? 'none' : 'auto',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                  title="Encerrar sessão acadêmica"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: loggingOut ? 'translateX(6px) rotate(15deg)' : 'none',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
                    <path d="M11 11l3-3-3-3" />
                    <path d="M14 8H6" />
                  </svg>
                  <span>{loggingOut ? 'Saindo...' : 'Sair'}</span>
                </button>
              </div>
            </div>
          ) : loadingAuth ? (
            <div style={{ width: '130px', height: '36px', opacity: 0 }} />
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Link href="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                Entrar
              </Link>
              <Link href="/cadastro" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                Criar Acesso
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Estrutura Principal do Site (Sidebar Fixa + Área de Conteúdo) */}
      <div className="site-body">
        {/* Backdrop no mobile */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="sidebar-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              zIndex: 90,
              backdropFilter: 'blur(3px)',
            }}
          />
        )}

        {/* Barra Lateral Fixa Alinhada com o Header */}
        <aside className={`layout-sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem 1.25rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                  Portal FATEC Rio Claro
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Inteligência Artificial & Gestão ESG
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-close-btn"
                style={{
                  background: 'none',
                  border: '1px solid var(--border-light)',
                  borderRadius: '6px',
                  padding: '0.3rem 0.5rem',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
                aria-label="Fechar menu"
              >
                ✕
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {navItems.map((item) => {
                const isActive = activePath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.925rem',
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive
                        ? highContrast
                          ? '#243044'
                          : 'var(--accent-blue-light)'
                        : 'transparent',
                      color: isActive
                        ? highContrast
                          ? '#38bdf8'
                          : 'var(--accent-blue-hover)'
                        : highContrast
                          ? '#cbd5e1'
                          : 'var(--text-main)',
                      border: isActive && highContrast ? '1px solid #38bdf8' : '1px solid transparent',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Área de Conteúdo + Footer Integrado */}
        <div className="layout-content-wrapper">
          <main
            style={{
              flex: 1,
              padding: '2.5rem 1.75rem',
              maxWidth: '1240px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            {children}
          </main>

          {/* Footer Institucional Oficial com Link Correto do SIGA */}
          <footer
            style={{
              borderTop: '1px solid var(--border-light)',
              backgroundColor: '#ffffff',
              padding: '2.5rem 1.75rem 2rem',
              color: 'var(--text-sub)',
              fontSize: '0.85rem',
              marginTop: 'auto',
            }}
          >
            <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                <div style={{ maxWidth: '440px' }}>
                  <LogoFatec height={44} />
                  <p style={{ marginTop: '1rem', fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                    Portal Integrado FATEC Rio Claro.<br />
                    Ambiente digital para os estudantes dos cursos de Inteligência Artificial e Gestão ESG.<br />
                    Faculdade de Tecnologia de Rio Claro — Prof. Álvares Gracioli.
                  </p>
                </div>

                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                    Sistemas Institucionais
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
                    <li>
                      <a href="https://siga.cps.sp.gov.br/sigaaluno/applogin.aspx" target="_blank" rel="noopener noreferrer">
                        SIGA Aluno (Acesso ao Sistema Acadêmico)
                      </a>
                    </li>
                    <li>
                      <a href="https://www.cps.sp.gov.br/" target="_blank" rel="noopener noreferrer">
                        Portal Centro Paula Souza
                      </a>
                    </li>
                    <li>
                      <a href="https://www.vestibularfatec.com.br" target="_blank" rel="noopener noreferrer">
                        Vestibular FATEC
                      </a>
                    </li>
                    <li>
                      <a href="https://fatecrioclaro.cps.sp.gov.br/" target="_blank" rel="noopener noreferrer">
                        Site FATEC Rio Claro
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                    Unidade FATEC Rio Claro
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                    Av. 46, 177 - Santa Cruz<br />
                    Rio Claro - SP, CEP 13500-000<br />
                    Telefone: (19) 3524-7474<br />
                    E-mail: contato@fatecrioclaro.edu.br
                  </div>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  fontSize: '0.775rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div>
                  Portal Acadêmico dos Estudantes • FATEC Rio Claro • Centro Paula Souza
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span>Termos de Uso</span>
                  <span>•</span>
                  <span>Contato da Coordenação</span>
                  <span>•</span>
                  <span>Suporte ao Estudante</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Galo Fixo na Base Inferior da Tela (Alinhado com a barra lateral no canto inferior) */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '24px',
          zIndex: 50,
        }}
      >
        <GaloWidget />
      </div>
    </div>
  );
};

export default AppLayout;