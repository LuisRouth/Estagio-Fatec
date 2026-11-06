'use client';

import React, { useEffect } from 'react';
import { Announcement } from '@/lib/types';

interface AnnouncementDetailModalProps {
  announcement: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
  canManage?: boolean;
}

export default function AnnouncementDetailModal({
  announcement,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  canManage = false,
}: AnnouncementDetailModalProps) {
  // Fechar com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !announcement) return null;

  const isUrgent = announcement.priority === 'URGENTE';
  const isHigh = announcement.priority === 'ALTA';

  const formattedDate = new Date(announcement.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getCourseBadge = () => {
    if (!announcement.target_course || announcement.target_course === ('TODOS' as any)) {
      return { label: '🌐 Todos os Cursos da FATEC', bg: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' };
    }
    if (announcement.target_course === 'IA') {
      return { label: '🤖 Inteligência Artificial (Matutino)', bg: 'rgba(14, 165, 233, 0.12)', color: '#0369a1' };
    }
    return { label: '🌱 Gestão Empresarial / ESG (Noturno)', bg: 'rgba(16, 185, 129, 0.12)', color: '#047857' };
  };

  const getSemesterBadge = () => {
    if (!announcement.target_semester || announcement.target_semester === 0) {
      return 'Todos os Semestres (1º ao 4º)';
    }
    return `${announcement.target_semester}º Semestre`;
  };

  const courseBadge = getCourseBadge();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderRadius: '20px',
          maxWidth: '820px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: isUrgent ? '2px solid #ef4444' : '1px solid var(--border-light)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Barra de Topo do Modal (Status e Fechar) */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-muted, #f8fafc)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                backgroundColor: courseBadge.bg,
                color: courseBadge.color,
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
              }}
            >
              {courseBadge.label}
            </span>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#ffffff',
                color: 'var(--text-sub)',
                border: '1px solid var(--border-light)',
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
              }}
            >
              🎓 {getSemesterBadge()}
            </span>

            {isUrgent ? (
              <span
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                🚨 COMUNICADO URGENTE
              </span>
            ) : isHigh ? (
              <span
                style={{
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '8px',
                }}
              >
                ⚠️ IMPORTANTE
              </span>
            ) : null}

            {announcement.is_pinned && (
              <span
                style={{
                  backgroundColor: 'rgba(251, 191, 36, 0.15)',
                  color: '#b45309',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '8px',
                }}
              >
                📌 Fixado no Topo
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(0, 0, 0, 0.06)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              color: 'var(--text-muted)',
              transition: 'background-color 0.15s ease',
            }}
            title="Fechar (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Corpo Rolável do Comunicado em Tela Cheia */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Imagem de Capa em Alta Resolução (se houver) */}
          {announcement.image_url && (
            <div
              style={{
                width: '100%',
                maxHeight: '340px',
                borderRadius: '14px',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                border: '1px solid var(--border-light)',
              }}
            >
              <img
                src={announcement.image_url}
                alt={announcement.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Título Principal */}
          <div>
            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                color: 'var(--text-main)',
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}
            >
              {announcement.title}
            </h1>

            {/* Metadados do Autor e Data */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-light)',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient, linear-gradient(135deg, #0284c7, #0369a1))',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {(announcement.author_name || 'F')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {announcement.author_name || 'Coordenação FATEC'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {announcement.author_role || 'Emissor Oficial'} • Publicado em {formattedDate}
                </div>
              </div>
            </div>
          </div>

          {/* Texto Completo do Comunicado */}
          <div
            style={{
              fontSize: '1rem',
              color: 'var(--text-main)',
              lineHeight: 1.75,
              whiteSpace: 'pre-line',
            }}
          >
            {announcement.content}
          </div>

          {/* Botão de Link / Anexo / Edital (Se houver link) */}
          {announcement.link_url && (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(2, 132, 199, 0.06)',
                border: '1px solid rgba(2, 132, 199, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0369a1' }}>
                  🔗 Acesso Externo / Documento Oficial
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Clique no botão para abrir o edital, formulário ou link correspondente.
                </div>
              </div>
              <a
                href={announcement.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.35rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                {announcement.link_label || 'Acessar Link Oficial'} ↗
              </a>
            </div>
          )}
        </div>

        {/* Rodapé de Ações do Modal */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-muted, #f8fafc)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            {canManage && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {onEdit && (
                  <button
                    onClick={() => {
                      onClose();
                      onEdit(announcement);
                    }}
                    className="btn btn-outline"
                    style={{ fontSize: '0.825rem' }}
                  >
                    ✏️ Editar Comunicado
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onClose();
                      onDelete(announcement);
                    }}
                    className="btn btn-danger"
                    style={{ fontSize: '0.825rem' }}
                  >
                    🗑️ Excluir
                  </button>
                )}
              </div>
            )}
          </div>

          <button onClick={onClose} className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
}
