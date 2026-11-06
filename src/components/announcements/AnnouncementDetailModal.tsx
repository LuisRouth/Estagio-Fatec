'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Announcement,
  AnnouncementBannerType,
  CourseType,
} from '@/lib/types';

interface AnnouncementDetailModalProps {
  isOpen: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
  canManage?: boolean;
}

const BANNER_PRESET_GRADIENTS: Record<AnnouncementBannerType, string> = {
  PADRAO_AZUL: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%)',
  PADRAO_VERDE: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)',
  PADRAO_ROXO: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #1e1b4b 100%)',
  PADRAO_AMBAR: 'linear-gradient(135deg, #d97706 0%, #ea580c 50%, #451a03 100%)',
  PADRAO_GRAFITE: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
  CUSTOM: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
};

export default function AnnouncementDetailModal({
  isOpen,
  announcement,
  onClose,
  onEdit,
  onDelete,
  canManage = false,
}: AnnouncementDetailModalProps) {
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloqueia o scroll da página enquanto o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !announcement || !mounted) return null;

  const isUrgent = announcement.priority === 'URGENTE';
  const isHigh = announcement.priority === 'ALTA';

  const formattedDate = new Date(announcement.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const getCourseLabel = () => {
    if (!announcement.target_course) return 'Todos os Cursos';
    if (announcement.target_course === 'IA') return 'Inteligência Artificial';
    if (announcement.target_course === 'ESG') return 'Gestão ESG';
    return announcement.target_course;
  };

  const getSemesterLabel = () => {
    if (!announcement.target_semester) return 'Todos os Semestres';
    return `${announcement.target_semester}º Semestre`;
  };

  const bannerTypeKey = announcement.banner_type || 'PADRAO_AZUL';
  const fallbackGradient = BANNER_PRESET_GRADIENTS[bannerTypeKey] || BANNER_PRESET_GRADIENTS.PADRAO_AZUL;

  // Unifica links legados e lista dinâmica
  const allLinks = (announcement.links && announcement.links.length > 0)
    ? announcement.links
    : announcement.link_url
    ? [{ id: 'legacy-link', label: announcement.link_label || 'Acessar Link', url: announcement.link_url }]
    : [];

  const allAttachments = announcement.attachments || [];

  return createPortal(

    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
        overscrollBehavior: 'contain',
      }}
      onClick={onClose}
    >
      <div
        className="announcement-modal-card card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-light)',
          backgroundColor: '#ffffff',
          color: 'var(--text-main, #0f172a)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Botão Fechar Flutuante */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1rem',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
          title="Fechar visualização"
        >
          ✕
        </button>

        {/* Capa de Alta Resolução / Banner Gradiente */}
        <div
          style={{
            width: '100%',
            height: '240px',
            position: 'relative',
            backgroundColor: '#0f172a',
            overflow: 'hidden',
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
              }}
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
                padding: '2rem',
                color: '#ffffff',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.08,
                  backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '0.3rem 0.85rem',
                  borderRadius: '20px',
                  marginBottom: '0.5rem',
                }}
              >
                FATEC Rio Claro
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                Mural Oficial de Comunicados
              </span>
            </div>
          )}

          {/* Badges no Banner */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '20px',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                backgroundColor: isUrgent ? '#ef4444' : isHigh ? '#f59e0b' : '#0284c7',
                color: '#ffffff',
                padding: '0.25rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {isUrgent ? 'Urgente' : isHigh ? 'Importante' : 'Informativo'}
            </span>

            {announcement.is_pinned && (
              <span
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  color: '#fbbf24',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                Fixado no Topo
              </span>
            )}
          </div>
        </div>

        {/* Conteúdo com rolagem */}
        <div style={{ overflowY: 'auto', padding: '1.75rem 2rem', flex: 1, overscrollBehavior: 'contain' }}>
          {/* Metadados: Curso, Semestre e Data */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1rem',
              paddingBottom: '0.85rem',
              borderBottom: '1px solid var(--border-light)',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span
                style={{
                  backgroundColor: 'rgba(2, 132, 199, 0.1)',
                  color: 'var(--accent-blue)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                {getCourseLabel()}
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(100, 116, 139, 0.1)',
                  color: 'var(--text-sub)',
                  border: '1px solid rgba(100, 116, 139, 0.2)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                {getSemesterLabel()}
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Publicado em {formattedDate}
            </div>
          </div>

          {/* Título Principal */}
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.3,
              marginBottom: '1.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            {announcement.title}
          </h1>

          {/* Dados do Autor e Órgão */}
          <div
            className="announcement-detail-author-box"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary, #0284c7)',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {announcement.author_name ? announcement.author_name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {announcement.author_name || 'Comissão FATEC'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {announcement.author_role || 'Administração & Centro Acadêmico'}
              </div>
            </div>
          </div>

          {/* Texto Completo do Comunicado */}
          <div
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'var(--text-main)',
              whiteSpace: 'pre-line',
              marginBottom: '2rem',
            }}
          >
            {announcement.content}
          </div>

          {/* SEÇÃO DE LINKS DE ACESSO */}
          {allLinks.length > 0 && (
            <div
              className="announcement-detail-section"
              style={{
                marginBottom: '1.75rem',
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1px solid var(--border-light)',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Links e Formulários Oficiais
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {allLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      padding: '0.65rem 1.25rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none',
                    }}
                  >
                    <span>{link.label}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* SEÇÃO DE ANEXOS E DOCUMENTOS */}
          {allAttachments.length > 0 && (
            <div
              className="announcement-detail-section"
              style={{
                marginBottom: '1.5rem',
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1px solid var(--border-light)',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Arquivos e Anexos Complementares
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {allAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="announcement-detail-card"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: att.type === 'IMAGEM' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                          color: att.type === 'IMAGEM' ? 'var(--accent-emerald)' : 'var(--accent-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {att.type === 'IMAGEM' ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        )}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {att.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {att.type === 'IMAGEM' ? 'Imagem / Foto' : 'Documento / Arquivo'}
                        </div>
                      </div>
                    </div>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: 700, textDecoration: 'none' }}
                    >
                      Abrir
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Ações Administrativas */}
        <div
          className="announcement-modal-footer"
          style={{
            padding: '1rem 2rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
          >
            Voltar ao Mural
          </button>

          {canManage && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(announcement);
                  }}
                  className="btn btn-outline"
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.5rem 1rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Editar
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(announcement);
                  }}
                  className="btn"
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.5rem 1rem',
                    fontWeight: 600,
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: 'var(--accent-rose)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Excluir
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  ,
    document.body
  );
}
