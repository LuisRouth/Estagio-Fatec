'use client';

import React, { useState } from 'react';
import { Announcement, AnnouncementBannerType } from '@/lib/types';

interface AnnouncementCardProps {
  announcement: Announcement;
  onOpenDetail: (announcement: Announcement) => void;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
  canManage?: boolean;
}

const GRADIENTS: Record<AnnouncementBannerType | string, string> = {
  PADRAO_AZUL: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%)',
  PADRAO_VERDE: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)',
  PADRAO_ROXO: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #1e1b4b 100%)',
  PADRAO_AMBAR: 'linear-gradient(135deg, #d97706 0%, #ea580c 50%, #451a03 100%)',
  PADRAO_GRAFITE: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
  CUSTOM: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%)',
};

export default function AnnouncementCard({
  announcement,
  onOpenDetail,
  onEdit,
  onDelete,
  canManage = false,
}: AnnouncementCardProps) {
  const [imgError, setImgError] = useState(false);
  const isUrgent = announcement.priority === 'URGENTE';
  const isHigh = announcement.priority === 'ALTA';

  // Formatador amigável de data
  const formattedDate = new Date(announcement.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Badge do Curso (Zero Emojis)
  const getCourseBadge = () => {
    if (!announcement.target_course || announcement.target_course === ('TODOS' as any)) {
      return { label: 'Todos os Cursos', bg: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', border: 'rgba(2, 132, 199, 0.25)' };
    }
    if (announcement.target_course === 'IA') {
      return { label: 'Inteligência Artificial', bg: 'rgba(14, 165, 233, 0.1)', color: '#0369a1', border: 'rgba(14, 165, 233, 0.25)' };
    }
    return { label: 'Gestão ESG', bg: 'rgba(16, 185, 129, 0.1)', color: '#047857', border: 'rgba(16, 185, 129, 0.25)' };
  };

  // Badge do Semestre (Zero Emojis)
  const getSemesterBadge = () => {
    if (!announcement.target_semester || announcement.target_semester === 0) {
      return 'Todos os Semestres';
    }
    return `${announcement.target_semester}º Semestre`;
  };

  // Prioridade Badge (Zero Emojis)
  const getPriorityBadge = () => {
    if (isUrgent) {
      return { label: 'Urgente', bg: '#ef4444', color: '#ffffff' };
    }
    if (isHigh) {
      return { label: 'Importante', bg: '#f59e0b', color: '#ffffff' };
    }
    return { label: 'Informativo', bg: '#0284c7', color: '#ffffff' };
  };

  const courseBadge = getCourseBadge();
  const priorityBadge = getPriorityBadge();

  // Banner gradiente de fallback baseado na configuração ou curso
  const getFallbackGradient = () => {
    if (announcement.banner_type && GRADIENTS[announcement.banner_type]) {
      return GRADIENTS[announcement.banner_type];
    }
    if (announcement.target_course === 'IA') return GRADIENTS.PADRAO_ROXO;
    if (announcement.target_course === 'ESG') return GRADIENTS.PADRAO_VERDE;
    return GRADIENTS.PADRAO_AZUL;
  };

  const fallbackGradient = getFallbackGradient();
  const totalLinks = announcement.links?.length || (announcement.link_url ? 1 : 0);
  const totalAttachments = announcement.attachments?.length || 0;

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
        backgroundColor: '#ffffff',
        boxShadow: isUrgent ? '0 8px 24px rgba(239, 68, 68, 0.12)' : 'var(--shadow-sm)',
        overflow: 'hidden',
        cursor: 'pointer',
        height: '420px',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Indicador de Fixado no Topo (Sem Emojis, SVG limpo) */}
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
            padding: '0.25rem 0.75rem',
            fontSize: '0.72rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
          </svg>
          Fixado
        </div>
      )}

      {/* Capa Padronizada do Anúncio (Foto ou Gradiente Oficial FATEC) */}
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
        {announcement.image_url && !imgError ? (
          <img
            src={announcement.image_url}
            alt={announcement.title}
            onError={() => setImgError(true)}
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
              background: fallbackGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '1.25rem',
              color: '#ffffff',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* Padrão geométrico sutil em SVG */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.08,
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: '0.2rem 0.65rem',
                borderRadius: '12px',
                marginBottom: '0.35rem',
              }}
            >
              FATEC Rio Claro
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#ffffff',
                maxWidth: '90%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Mural Oficial de Comunicados
            </div>
          </div>
        )}

        {/* Badge Flutuante de Prioridade */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
            backgroundColor: priorityBadge.bg,
            color: priorityBadge.color,
            borderRadius: '6px',
            padding: '0.2rem 0.6rem',
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          {priorityBadge.label}
        </div>
      </div>

      {/* Corpo do Cartão Padronizado */}
      <div
        style={{
          padding: '1rem 1.25rem 0.65rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'flex-start',
          overflow: 'hidden',
        }}
      >
        {/* Badges de Segmentação (Curso e Semestre) - SEM EMOJIS */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
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
            {getSemesterBadge()}
          </span>
        </div>

        {/* Título Padronizado (Máximo 2 Linhas) */}
        <h3
          style={{
            fontSize: '1.025rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            lineHeight: 1.35,
            marginBottom: '0.45rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
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
            marginBottom: '0.6rem',
          }}
        >
          {announcement.content}
        </p>

        {/* Badges de Links e Anexos Anexados */}
        {(totalLinks > 0 || totalAttachments > 0) && (
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto', marginBottom: '0.25rem' }}>
            {totalLinks > 0 && (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(2, 132, 199, 0.08)',
                  color: '#0284c7',
                  padding: '0.12rem 0.45rem',
                  borderRadius: '4px',
                }}
              >
                {totalLinks} {totalLinks === 1 ? 'link' : 'links'}
              </span>
            )}
            {totalAttachments > 0 && (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  color: '#059669',
                  padding: '0.12rem 0.45rem',
                  borderRadius: '4px',
                }}
              >
                {totalAttachments} {totalAttachments === 1 ? 'anexo' : 'anexos'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Rodapé Padronizado: Autor, Data e Ações com suporte a Alto Contraste */}
      <div
        className="announcement-card-footer"
        style={{
          padding: '0.75rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--primary-gradient, linear-gradient(135deg, #0284c7, #0369a1))',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {(announcement.author_name || 'F')[0].toUpperCase()}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-sub)',
                fontWeight: 600,
                maxWidth: '140px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {announcement.author_name || 'Coordenação FATEC'}
            </div>
          </div>
          <span className="announcement-card-date" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {formattedDate}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
          <span
            className="announcement-card-read-more"
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--accent-primary, #0284c7)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            Ler comunicado →
          </span>

          {canManage && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(announcement)}
                  className="btn btn-outline"
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                  title="Editar comunicado"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(announcement)}
                  className="btn btn-outline"
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Excluir comunicado"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
