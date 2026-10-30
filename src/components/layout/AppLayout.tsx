'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LogoFatec } from '@/components/brand/LogoFatec';
import { GaloWidget } from '@/components/brand/GaloWidget';
import { EcoTechBackground } from './EcoTechBackground';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  userName?: string;
  userRole?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activePath = '/',
  userName,
  userRole,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Itens da navegação limpos, sem emojis e sem termos em inglês
  const navItems = [
    { label: 'Início', href: '/' },
    { label: 'Mural de Avisos', href: '/avisos' },
    { label: 'Cantina Discente', href: '/cantina' },
    { label: 'Repositório Acadêmico', href: '/repositorio' },
    { label: 'Vitrine de Projetos', href: '/vitrine' },
    { label: 'Extrato de Consumo', href: '/historico' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: highContrast ? '#ffffff' : 'transparent',
        color: highContrast ? '#000000' : 'var(--text-main)',
        position: 'relative',
      }}
    >
      {/* Fundo Dinâmico Simbiótico: IA e ESG (Sem quadriculado) */}
      {!highContrast && <EcoTechBackground />}
      {/* Header Institucional Fixo no Topo Absoluto (Sem faixas extras sobrepondo) */}
      <header
        style={{
          height: 'var(--header-height)',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-light)',
          position: 'sticky',
          top: 0,
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

        {/* Bloco da Direita: Login / Cadastro */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {userName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{userName}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>{userRole || 'Discente'}</div>
              </div>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-blue-light)',
                  color: 'var(--accent-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: '1px solid var(--border-light)',
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
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
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.925rem',
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? 'var(--accent-blue-light)' : 'transparent',
                      color: isActive ? 'var(--accent-blue-hover)' : 'var(--text-main)',
                      transition: 'background-color 0.15s ease',
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