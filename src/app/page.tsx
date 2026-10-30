'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { HeroVisualWidget } from '@/components/home/HeroVisualWidget';

export default function HomePage() {
  const [selectedCourse, setSelectedCourse] = useState<'IA' | 'ESG'>('IA');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideTimerKey, setSlideTimerKey] = useState(0);

  // Slides dinâmicos do Hero com auto-slide
  const heroSlides = [
    {
      tag: 'Ambiente Discente Oficial',
      badge: 'FATEC Rio Claro',
      title: 'Portal Integrado dos Estudantes — Ensino, Cantina e Comunicação',
      description: 'Plataforma unificada para atendimento da comunidade discente dos cursos de Inteligência Artificial e Gestão ESG. Centralize o acesso às aulas, consulte a cantina e acompanhe comunicados institucionais.',
      primaryBtn: { label: 'Acessar Cantina Discente', href: '/cantina' },
      secondaryBtn: { label: 'Repositório de Aulas', href: '/repositorio' },
    },
    {
      tag: 'Convivência e Autoatendimento',
      badge: 'Intervalos do Campus',
      title: 'Cantina Discente: Agilidade e Pagamento Autônomo via Pix',
      description: 'Espaço discente dedicado para consulta de itens e valores nos intervalos da manhã e da noite. Pagamentos rápidos via Pix sem necessidade de anotações em pranchetas de papel.',
      primaryBtn: { label: 'Ir para a Cantina', href: '/cantina' },
      secondaryBtn: { label: 'Mural de Avisos', href: '/avisos' },
    },
    {
      tag: 'Acervo Acadêmico 2026',
      badge: '1º ao 4º Semestre',
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
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '20px',
            padding: '3rem 2.75rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden',
          }}
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

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '2.5rem',
              position: 'relative',
              zIndex: 2,
              flexWrap: 'wrap',
            }}
          >
            {/* Lado Esquerdo: Textos, Cursos e Ações do Slide (Altura padronizada para eliminar saltos de layout) */}
            <div style={{ flex: '1 1 520px', minWidth: '290px', minHeight: '380px' }}>
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
              className="animate-fade-in"
              key={`title-${currentSlide}`}
              style={{
                fontSize: '2.3rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.03em',
                lineHeight: 1.25,
                marginBottom: '1rem',
                minHeight: '6.2rem',
              }}
            >
              {heroSlides[currentSlide].title}
            </h1>

            <p
              className="animate-fade-in"
              key={`desc-${currentSlide}`}
              style={{
                color: 'var(--text-sub)',
                fontSize: '1.025rem',
                lineHeight: 1.7,
                marginBottom: '2rem',
                minHeight: '4.8rem',
              }}
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
                  backgroundColor: selectedCourse === 'IA' ? '#ffffff' : 'transparent',
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
                  backgroundColor: selectedCourse === 'ESG' ? '#ffffff' : 'transparent',
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

          {/* Lado Direito: Widget Ilustrativo Dinâmico (Livros, Xícara de Café, Explorador) */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
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
                  backgroundColor: '#ffffff',
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
                  backgroundColor: '#ffffff',
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

        {/* 1. MURAL DE AVISOS — ACIMA & EM ESTADO VAZIO */}
        <section
          className="card-interactive"
          style={{
            padding: '2.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Mural de Avisos e Comunicados Oficiais
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Informativos da Coordenação, Secretaria Acadêmica e Centro Acadêmico (CA)
              </p>
            </div>

            <Link href="/avisos" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.15rem' }}>
              Abrir Mural de Avisos
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
                Nenhum comunicado urgente registrado no momento
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.55 }}>
                Novos avisos da coordenação de Inteligência Artificial e Gestão ESG, datas de avaliações e eventos acadêmicos serão publicados aqui em tempo real.
              </p>
            </div>
          </div>
        </section>

        {/* 2. CANTINA DISCENTE — SEÇÃO EXISTENTE & EM ESTADO VAZIO */}
        <section
          className="card-interactive"
          style={{
            padding: '2.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Cantina Discente
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Consulte os preços e realize o pagamento via Pix no intervalo
              </p>
            </div>

            <Link href="/cantina" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.15rem' }}>
              Abrir Painel da Cantina
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
                Catálogo em sincronização pela comissão discente
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.55 }}>
                Os itens disponíveis, valores e a chave Pix estão sendo cadastrados pela comissão. Consulte os preços afixados no expositor físico durante o intervalo.
              </p>
            </div>
          </div>
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
                Os arquivos didáticos, apostilas e códigos dos semestres vigentes (1º ao 4º) estão catalogados na íntegra através do acervo completo.
              </p>
            </div>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}