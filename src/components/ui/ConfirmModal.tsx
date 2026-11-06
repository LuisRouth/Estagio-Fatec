'use client';

import React, { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  icon?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDanger = false,
  icon,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onCancel}
    >
      <div
        className="custom-confirm-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '2rem 1.75rem',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.35)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          textAlign: 'center',
          animation: 'popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Ícone de Destaque */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: isDanger ? '#fee2e2' : '#eff6ff',
            color: isDanger ? '#ef4444' : '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            margin: '0 auto 1.25rem auto',
            border: isDanger ? '2px solid #fecdd3' : '2px solid #bfdbfe',
          }}
        >
          {icon || (isDanger ? '⚠️' : 'ℹ️')}
        </div>

        {/* Título e Mensagem */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: '0.5rem',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '1.75rem',
          }}
        >
          {message}
        </p>

        {/* Botões de Ação */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              borderRadius: '10px',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              backgroundColor: isDanger ? '#ef4444' : 'var(--accent-blue)',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: isDanger
                ? '0 4px 12px rgba(239, 68, 68, 0.35)'
                : '0 4px 12px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.15s ease',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
