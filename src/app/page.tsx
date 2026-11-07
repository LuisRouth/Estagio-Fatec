'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { Announcement, CourseType } from '@/lib/types';
import AnnouncementCard from '@/components/announcements/AnnouncementCard';
import AnnouncementDetailModal from '@/components/announcements/AnnouncementDetailModal';
import AnnouncementFormModal from '@/components/announcements/AnnouncementFormModal';
import ToastNotification from '@/components/ui/ToastNotification';
import { HeroVisualWidget } from '@/components/home/HeroVisualWidget';

export default function HomePage() {
  const [selectedCourse, setSelectedCourse] = useState<'IA' | 'ESG'>('IA');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideTimerKey, setSlideTimerKey] = useState(0);
  // Comunicados Oficiais no Mural da Home
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [homeCourseFilter, setHomeCourseFilter] = useState<CourseType | 'TODOS'>('TODOS');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string | null; type: 'success' | 'error' | 'info' }>({ message: null, type: 'success' });

  // Carregar usuário logado e comunicados oficiais
  const fetchHomeAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setAnnouncements(data.data);
        }
      }
    } catch (e) {
      console.error('Erro ao buscar avisos na home:', e);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeAnnouncements();
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setCurrentUser(d.data);
      })
      .catch(() => {});
  }, []);

  const canManage = currentUser?.role === 'ADMIN' || currentUser?.role === 'CA_MEMBRO' || currentUser?.role === 'PROFESSOR';

  // Slides dinâmicos do Hero com auto-slide
  const heroSlides = [
    {
      tag: 'Ambiente Discente Oficial',
      badge: 'FATEC Rio Claro',
      title: 'Portal Integrado dos Estudantes — Ensino, Projetos e Comunicação',
      description: 'Plataforma unificada para atendimento da comunidade discente dos cursos de Inteligência Artificial e Gestão ESG. Centralize o acesso às aulas, comunicados institucionais e projetos acadêmicos.',
      primaryBtn: { label: 'Mural de Avisos', href: '/avisos' },
      secondaryBtn: { label: 'Repositório de Aulas', href: '/repositorio' },
    },
    {
      tag: 'Inovação e Pesquisa Aplicada',
      badge: 'Inteligência Artificial & ESG',
      title: 'Vitrine de Projetos: Portfólio Tecnológico e Inovação',
      description: 'Espaço discente para divulgação dos projetos interdisciplinares, modelos de Machine Learning, soluções ambientais e pesquisas desenvolvidas nos cursos de IA e Gestão ESG.',
      primaryBtn: { label: 'Conhecer Projetos', href: '/vitrine' },
      secondaryBtn: { label: 'Mural de Avisos', href: '/avisos' },
    },
    {
      tag: 'Repositório Didático',
      badge: 'FATEC Rio Claro',
      title: 'Repositório Didático: Notas de Aula, Códigos e Roteiros',
      description: 'Centralização definitiva dos materiais didáticos dos cursos de IA e ESG. Encontre slides, códigos no GitHub e listas de exercícios organizados por matéria e semestre.',
      primaryBtn: { label: 'Explorar Disciplinas', href: '/repositorio' },
      secondaryBtn: { label: 'Vitrine de Projetos', href: '/vitrine' },
    },
  ];

  // Navegação manual com reinício imediato do cronômetro
  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
    setSlideTimerKey((k) => k + 1);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setSlideTimerKey((k) => k + 1);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
    setSlideTimerKey((k) => k + 1);
  };

  // Auto-slide controlado com tempo ampliado para 9 segundos e reinício ao trocar manualmente
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [isPaused, heroSlides.length, slideTimerKey]);

  return (
    <AppLayout activePath="/">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* Hero Dinâmico com Carrossel Automático Sofisticado */}
        <section
          className="hero-card"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Efeito Visual de Luz em Gradiente Mesh */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              right: '-5%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(2, 132, 199, 0.08) 0%, rgba(5, 150, 105, 0.04) 50%, transparent 70%)',
              pointerEvents: 'none',
              borderRadius: '50%',
            }}
          />

          <div className="hero-content-row">
            {/* Lado Esquerdo: Textos, Cursos e Ações do Slide */}
            <div className="hero-text-col">
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">
                {heroSlides[currentSlide].badge}
              </span>
              <span className="badge badge-emerald">
                {heroSlides[currentSlide].tag}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Slide {currentSlide + 1} de {heroSlides.length}
              </span>
            </div>

            <h1
              className="animate-fade-in hero-title"
              key={`title-${currentSlide}`}
            >
              {heroSlides[currentSlide].title}
            </h1>

            <p
              className="animate-fade-in hero-desc"
              key={`desc-${currentSlide}`}
            >
              {heroSlides[currentSlide].description}
            </p>

            {/* Alternador de Cursos */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'var(--bg-muted)',
                padding: '0.35rem',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '0.25rem',
              }}
            >
              <button
                onClick={() => setSelectedCourse('IA')}
                style={{
                  border: 'none',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '9px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  backgroundColor: selectedCourse === 'IA' ? 'var(--bg-card)' : 'transparent',
                  color: selectedCourse === 'IA' ? 'var(--accent-blue)' : 'var(--text-muted)',
                  boxShadow: selectedCourse === 'IA' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                Inteligência Artificial (Matutino)
              </button>
              <button
                onClick={() => setSelectedCourse('ESG')}
                style={{
                  border: 'none',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '9px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  backgroundColor: selectedCourse === 'ESG' ? 'var(--bg-card)' : 'transparent',
                  color: selectedCourse === 'ESG' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  boxShadow: selectedCourse === 'ESG' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                Gestão ESG (Noturno)
              </button>
            </div>

            {/* Ações Primárias */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href={heroSlides[currentSlide].primaryBtn.href} className="btn btn-primary" style={{ padding: '0.8rem 1.6rem', fontSize: '0.95rem' }}>
                {heroSlides[currentSlide].primaryBtn.label}
              </Link>
              <Link href={heroSlides[currentSlide].secondaryBtn.href} className="btn btn-secondary" style={{ padding: '0.8rem 1.4rem', fontSize: '0.95rem' }}>
                {heroSlides[currentSlide].secondaryBtn.label}
              </Link>
            </div>
          </div>

          {/* Lado Direito: Widget Ilustrativo Dinâmico */}
          <div className="hero-visual-col">
            <HeroVisualWidget currentSlide={currentSlide} selectedCourse={selectedCourse} />
          </div>
        </div>

          {/* Controles de Navegação e Barras de Paginação do Carrossel */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '2.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-light)',
            }}
          >
            {/* Barras Indicadoras */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  style={{
                    height: '6px',
                    width: currentSlide === idx ? '32px' : '12px',
                    borderRadius: '9999px',
                    backgroundColor: currentSlide === idx ? 'var(--accent-blue)' : '#cbd5e1',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0,
                  }}
                  aria-label={`Ir para o slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Botões Anterior / Próximo */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={prevSlide}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
                aria-label="Slide anterior"
              >
                ‹
              </button>
              <button
                onClick={nextSlide}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
                aria-label="Próximo slide"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        {/* 1. MURAL DE AVISOS E COMUNICADOS OFICIAIS — CONECTIVIDADE TOTAL COM O INÍCIO */}
        <section
          className="card-interactive"
          style={{
            padding: '2.25rem',
            borderRadius: '20px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light)',
          }}
        >
          {/* Cabeçalho da Seção */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-blue">Mural Oficial</span>
                <span className="badge badge-emerald">Tempo Real</span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                Mural de Avisos e Comunicados Oficiais
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Avisos prioritários, eventos acadêmicos, prazos e comunicados da Coordenação de IA, Gestão ESG e CA.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {canManage && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.825rem', fontWeight: 700 }}
                >
                  + Publicar Comunicado
                </button>
              )}

              <Link href="/avisos" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.15rem' }}>
                Abrir Mural Completo →
              </Link>
            </div>
          </div>

          {/* Filtro Rápido de Cursos na Home */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Filtrar no início:
            </span>
            {[
              { id: 'TODOS', label: 'Todos os Cursos' },
              { id: 'IA', label: 'Inteligência Artificial' },
              { id: 'ESG', label: 'Gestão ESG' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setHomeCourseFilter(c.id as any)}
                className={`announcement-filter-btn ${homeCourseFilter === c.id ? 'active' : ''}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Cards Padronizados de Comunicados na Home */}
          {announcementsLoading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="card-interactive"
                  style={{
                    height: '420px',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    border: '1px solid var(--border-light)',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div className="skeleton-shimmer" style={{ width: '100%', height: '160px', borderRadius: '10px', marginBottom: '1rem' }} />
                    <div className="skeleton-shimmer" style={{ width: '80px', height: '20px', borderRadius: '6px', marginBottom: '0.6rem' }} />
                    <div className="skeleton-shimmer" style={{ width: '90%', height: '20px', borderRadius: '6px', marginBottom: '0.5rem' }} />
                    <div className="skeleton-shimmer" style={{ width: '65%', height: '16px', borderRadius: '6px', marginBottom: '0.75rem' }} />
                    <div className="skeleton-shimmer" style={{ width: '95%', height: '14px', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                    <div className="skeleton-shimmer" style={{ width: '80px', height: '16px' }} />
                    <div className="skeleton-shimmer" style={{ width: '60px', height: '16px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div
              style={{
                padding: '3.5rem 1.5rem',
                backgroundColor: 'var(--bg-muted, #f8fafc)',
                borderRadius: '14px',
                border: '1px dashed var(--border-light)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "0.5rem", color: "var(--text-muted)" }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg></div>
              <div style={{ maxWidth: '480px' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem' }}>
                  Nenhum comunicado registrado no momento
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.55 }}>
                  Novos avisos da coordenação de Inteligência Artificial e Gestão ESG serão publicados aqui em tempo real.
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {announcements
                .filter((a) => {
                  if (homeCourseFilter === 'TODOS') return true;
                  return !a.target_course || a.target_course === homeCourseFilter;
                })
                .slice(0, 3)
                .map((ann) => (
                  <AnnouncementCard
                    key={ann.id}
                    announcement={ann}
                    onOpenDetail={(a) => {
                      setSelectedAnnouncement(a);
                      setIsDetailOpen(true);
                    }}
                    canManage={false}
                  />
                ))}
            </div>
          )}

          {/* Modal de Detalhes em Tela Cheia (Disponível direto da Home) */}
          <AnnouncementDetailModal
            announcement={selectedAnnouncement}
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
          />

          {/* Modal de Formulário direto da Home (Se for ADM ou CA) */}
          {canManage && (
            <AnnouncementFormModal
              isOpen={isFormOpen}
              onClose={() => setIsFormOpen(false)}
              onSave={async (formData) => {
                const res = await fetch('/api/announcements', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formData),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Erro ao publicar comunicado.');
                setToast({ message: 'Comunicado publicado com sucesso no início e no mural!', type: 'success' });
                await fetchHomeAnnouncements();
              }}
            />
          )}

          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ message: null, type: 'success' })}
          />
        </section>

        {/* 3. REPOSITÓRIO ACADÊMICO — SEÇÃO EM ESTADO VAZIO */}
        <section
          className="card-interactive"
          style={{
            padding: '2.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Repositório Acadêmico
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Notas de aula, roteiros de laboratório e acervo dos cursos de IA e ESG
              </p>
            </div>

            <Link href="/repositorio" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.15rem' }}>
              Abrir Repositório
            </Link>
          </div>

          <div
            style={{
              padding: '3.5rem 1.5rem',
              backgroundColor: 'var(--bg-muted)',
              borderRadius: '12px',
              border: '1px dashed var(--border-light)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
          >
            <div style={{ maxWidth: '480px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem' }}>
                Nenhum material pendente ou novo roteiro publicado
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.55 }}>
                Os arquivos didáticos, apostilas e códigos das disciplinas dos cursos de IA e ESG estão catalogados na íntegra no acervo.
              </p>
            </div>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}