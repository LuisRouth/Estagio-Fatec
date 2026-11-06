'use client';

import React from 'react';
import { Announcement } from '@/lib/types';

interface AnnouncementCardProps {
  announcement: Announcement;
  onOpenDetail: (announcement: Announcement) => void;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
  canManage?: boolean;
}

export default function AnnouncementCard({
  announcement,
  onOpenDetail,
  onEdit,
  onDelete,
  canManage = false,
}: AnnouncementCardProps) {
  const isUrgent = announcement.priority === 'URGENTE';
  const isHigh = announcement.priority === 'ALTA';

  // Formatador amigável de data
  const formattedDate = new Date(announcement.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Badge do Curso
  const getCourseBadge = () => {
    if (!announcement.target_course || announcement.target_course === ('TODOS' as any)) {
      return { label: '🌐 Todos os Cursos', bg: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', border: 'rgba(2, 132, 199, 0.25)' };
    }
    if (announcement.target_course === 'IA') {
      return { label: '🤖 Inteligência Artificial', bg: 'rgba(14, 165, 233, 0.12)', color: '#0369a1', border: 'rgba(14, 165, 233, 0.3)' };
    }
    return { label: '🌱 Gestão ESG', bg: 'rgba(16, 185, 129, 0.12)', color: '#047857', border: 'rgba(16, 185, 129, 0.3)' };
  };

  // Badge do Semestre
  const getSemesterBadge = () => {
    if (!announcement.target_semester || announcement.target_semester === 0) {
      return 'Todos os Semestres';
    }
    return `${announcement.target_semester}º Semestre`;
  };

  const courseBadge = getCourseBadge();

  return (
    <div
      onClick={() => onOpenDetail(announcement)}
      className="card-interactive announcement-card-standardized"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '16px',
        border: isUrgent ? '2px solid rgba(239, 68, 68, 0.65)' : '1px solid var(--border-light)',
        background: 'var(--card-bg, #ffffff)',
        boxShadow: isUrgent ? '0 8px 24px rgba(239, 68, 68, 0.15)' : 'var(--shadow-sm)',
        overflow: 'hidden',
        cursor: 'pointer',
        height: '430px',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Indicador de Fixado no Topo */}
      {announcement.is_pinned && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 3,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#fbbf24',
            backdropFilter: 'blur(4px)',
            borderRadius: '20px',
            padding: '0.2rem 0.65rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          📌 Fixado
        </div>
      )}

      {/* Capa Padronizada do Anúncio (Imagem ou Gradiente FATEC) */}
      <div
        style={{
          width: '100%',
          height: '160px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          flexShrink: 0,
        }}
      >
        {announcement.image_url ? (
          <img
            src={announcement.image_url}
            alt={announcement.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.35s ease',
            }}
            className="announcement-card-img"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background:
                announcement.target_course === 'IA'
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%)'
                  : announcement.target_course === 'ESG'
                  ? 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)'
                  : 'linear-gradient(135deg, #0284c7 0%, #059669 50%, #0f172a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '0.4rem',
              color: '#ffffff',
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>
              {announcement.target_course === 'IA' ? '🤖' : announcement.target_course === 'ESG' ? '🌱' : '🏛️'}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', opacity: 0.85, textTransform: 'uppercase' }}>
              Comunicado FATEC Rio Claro
            </span>
          </div>
        )}

        {/* Badge Flutuante de Prioridade */}
        <div style={{ position: 'absolute', bottom: '10px', left: '12px', zIndex: 2 }}>
          {isUrgent ? (
            <span
              style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.7rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                letterSpacing: '0.03em',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              🚨 URGENTE
            </span>
          ) : isHigh ? (
            <span
              style={{
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.7rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.4)',
              }}
            >
              ⚠️ IMPORTANTE
            </span>
          ) : null}
        </div>
      </div>

      {/* Conteúdo Central do Card (Tamanho Padronizado) */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Linha de Badges de Segmentação (Curso + Semestre) */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: courseBadge.bg,
                color: courseBadge.color,
                border: `1px solid ${courseBadge.border}`,
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
              }}
            >
              {courseBadge.label}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                backgroundColor: 'var(--bg-muted, #f1f5f9)',
                color: 'var(--text-sub, #475569)',
                border: '1px solid var(--border-light, #e2e8f0)',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
              }}
            >
              🎓 {getSemesterBadge()}
            </span>
          </div>

          {/* Título Padronizado (Máximo 2 Linhas) */}
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.35,
              marginBottom: '0.45rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.7rem',
            }}
          >
            {announcement.title}
          </h3>

          {/* Conteúdo Resumido (Máximo 3 Linhas) */}
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: 0,
            }}
          >
            {announcement.content}
          </p>
        </div>

        {/* Rodapé Padronizado: Autor, Data e Ações */}
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient, linear-gradient(135deg, #0284c7, #0369a1))',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {(announcement.author_name || 'F')[0].toUpperCase()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                {announcement.author_name || 'Coordenação FATEC'}
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formattedDate}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.825rem',
                fontWeight: 700,
                color: 'var(--accent-primary, #0284c7)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              Ler mais ➔
            </span>

            {/* Menu Administrativo Rápido (Se for ADM ou CA) */}
            {canManage && (
              <div
                style={{ display: 'flex', gap: '0.35rem' }}
                onClick={(e) => e.stopPropagation()} // Evita abrir o modal de detalhes
              >
                {onEdit && (
                  <button
                    onClick={() => onEdit(announcement)}
                    className="btn btn-outline"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', borderRadius: '6px' }}
                    title="Editar comunicado"
                  >
                    ✏️ Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(announcement)}
                    className="btn btn-danger"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', borderRadius: '6px' }}
                    title="Excluir comunicado"
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
