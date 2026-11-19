'use client';

import React, { useEffect, useState } from 'react';

export interface FilePreviewTarget {
  url: string;
  title?: string;
  subtitle?: string;
}

interface FilePreviewModalProps {
  file: FilePreviewTarget | null;
  onClose: () => void;
}

export function getFilePreviewKind(url?: string | null): 'pdf' | 'image' | 'other' {
  if (!url) return 'other';
  const clean = url.split('?')[0].split('#')[0].toLowerCase();
  if (clean.endsWith('.pdf')) return 'pdf';
  if (/\.(png|jpe?g|webp|gif|svg|bmp|avif)$/i.test(clean)) return 'image';
  return 'other';
}

export function isPreviewableFile(url?: string | null): boolean {
  const kind = getFilePreviewKind(url);
  return kind === 'pdf' || kind === 'image';
}

export default function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setZoom(1);
  }, [file?.url]);

  useEffect(() => {
    if (!file) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, onClose]);

  if (!file) return null;

  const kind = getFilePreviewKind(file.url);
  const badgeLabel = kind === 'pdf' ? 'PDF' : kind === 'image' ? 'IMAGEM' : 'ARQUIVO';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.78)',
        backdropFilter: 'blur(6px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '1080px',
          height: kind === 'pdf' ? '90vh' : 'auto',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Cabeçalho do Visualizador */}
        <div
          style={{
            padding: '0.9rem 1.25rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            backgroundColor: 'var(--bg-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
            <span
              className="badge badge-blue"
              style={{ fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}
            >
              {badgeLabel}
            </span>
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={file.title || 'Visualização de Arquivo'}
              >
                {file.title || 'Visualização de Arquivo'}
              </h3>
              {file.subtitle && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {file.subtitle}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {kind === 'image' && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.25).toFixed(2)))}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', fontWeight: 700 }}
                  title="Diminuir zoom"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}
                  title="Restaurar zoom 100%"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', fontWeight: 700 }}
                  title="Aumentar zoom"
                >
                  +
                </button>
              </div>
            )}

            <a
              href={file.url}
              download
              className="btn btn-secondary"
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Baixar
            </a>

            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
              }}
            >
              Nova Aba
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 700 }}
              title="Fechar visualizador (Esc)"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Área de Conteúdo */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: kind === 'pdf' ? '#1e293b' : 'var(--bg-primary)',
            display: 'flex',
            alignItems: kind === 'pdf' ? 'stretch' : 'center',
            justifyContent: 'center',
            minHeight: kind === 'image' ? '360px' : undefined,
          }}
        >
          {kind === 'pdf' ? (
            <iframe
              src={`${file.url}#view=FitH&toolbar=1&navpanes=1`}
              title={file.title || 'Visualizador de PDF'}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                minHeight: '72vh',
              }}
            />
          ) : kind === 'image' ? (
            <div style={{ padding: '1.5rem', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              <img
                src={file.url}
                alt={file.title || 'Imagem anexa'}
                style={{
                  maxWidth: zoom === 1 ? '100%' : 'none',
                  maxHeight: zoom === 1 ? '74vh' : 'none',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-md)',
                }}
              />
            </div>
          ) : (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '460px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Pré-visualização direta indisponível para este formato
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                Arquivos compactados ou editáveis (como `.docx` e `.zip`) podem ser baixados diretamente para o seu dispositivo abaixo.
              </p>
              <a
                href={file.url}
                download
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.4rem', fontWeight: 700, textDecoration: 'none' }}
              >
                Baixar Arquivo Agora
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
