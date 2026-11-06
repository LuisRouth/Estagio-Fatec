'use client';

import React, { useState, useEffect } from 'react';
import { Announcement, CourseType, AnnouncementPriority } from '@/lib/types';

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Announcement>) => Promise<void>;
  editingAnnouncement?: Announcement | null;
}

export default function AnnouncementFormModal({
  isOpen,
  onClose,
  onSave,
  editingAnnouncement,
}: AnnouncementFormModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetCourse, setTargetCourse] = useState<CourseType | 'TODOS'>('TODOS');
  const [targetSemester, setTargetSemester] = useState<number>(0); // 0 = Todos
  const [priority, setPriority] = useState<AnnouncementPriority>('MEDIA');
  const [authorRole, setAuthorRole] = useState('Centro Acadêmico (CA)');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Carregar dados ao editar ou limpar ao criar
  useEffect(() => {
    if (editingAnnouncement) {
      setTitle(editingAnnouncement.title || '');
      setContent(editingAnnouncement.content || '');
      setTargetCourse((editingAnnouncement.target_course as any) || 'TODOS');
      setTargetSemester(editingAnnouncement.target_semester || 0);
      setPriority(editingAnnouncement.priority || 'MEDIA');
      setAuthorRole(editingAnnouncement.author_role || 'Centro Acadêmico (CA)');
      setImageUrl(editingAnnouncement.image_url || '');
      setLinkUrl(editingAnnouncement.link_url || '');
      setLinkLabel(editingAnnouncement.link_label || '');
      setIsPinned(editingAnnouncement.is_pinned || false);
    } else {
      setTitle('');
      setContent('');
      setTargetCourse('TODOS');
      setTargetSemester(0);
      setPriority('MEDIA');
      setAuthorRole('Centro Acadêmico (CA)');
      setImageUrl('');
      setLinkUrl('');
      setLinkLabel('');
      setIsPinned(false);
    }
    setError('');
  }, [editingAnnouncement, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe o título do comunicado.');
      return;
    }
    if (!content.trim()) {
      setError('Por favor, escreva o conteúdo detalhado do comunicado.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        target_course: targetCourse === 'TODOS' ? null : targetCourse,
        target_semester: targetSemester === 0 ? null : targetSemester,
        priority,
        author_role: authorRole.trim(),
        image_url: imageUrl.trim() || null,
        link_url: linkUrl.trim() || null,
        link_label: linkLabel.trim() || null,
        is_pinned: isPinned,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar comunicado.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          maxWidth: '740px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
        }}
      >
        {/* Cabeçalho do Modal */}
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
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {editingAnnouncement ? 'Editar Comunicado Oficial' : 'Publicar Novo Comunicado Oficial'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              Painel de Emissão de Avisos (CA, Coordenação e Secretaria FATEC)
            </p>
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
            }}
          >
            ✕
          </button>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Título */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                Título do Comunicado *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Inscrições para o Hackathon de IA / Semana de Sustentabilidade"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.95rem' }}
              />
            </div>

            {/* Segmentação: Curso e Semestre */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Público-alvo (Curso) */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Destinado ao Curso *
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'TODOS', label: '🌐 Todos' },
                    { id: 'IA', label: '🤖 IA' },
                    { id: 'ESG', label: '🌱 ESG' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setTargetCourse(c.id as any)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '8px',
                        border: targetCourse === c.id ? '2px solid var(--accent-primary, #0284c7)' : '1px solid var(--border-light)',
                        backgroundColor: targetCourse === c.id ? 'rgba(2, 132, 199, 0.1)' : '#ffffff',
                        color: targetCourse === c.id ? 'var(--accent-primary, #0284c7)' : 'var(--text-sub)',
                        fontWeight: targetCourse === c.id ? 800 : 500,
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Público-alvo (Semestre) */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Destinado ao Semestre *
                </label>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {[
                    { val: 0, label: 'Todos' },
                    { val: 1, label: '1º' },
                    { val: 2, label: '2º' },
                    { val: 3, label: '3º' },
                    { val: 4, label: '4º' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setTargetSemester(s.val)}
                      style={{
                        padding: '0.4rem 0.65rem',
                        borderRadius: '8px',
                        border: targetSemester === s.val ? '2px solid var(--accent-primary, #0284c7)' : '1px solid var(--border-light)',
                        backgroundColor: targetSemester === s.val ? 'rgba(2, 132, 199, 0.1)' : '#ffffff',
                        color: targetSemester === s.val ? 'var(--accent-primary, #0284c7)' : 'var(--text-sub)',
                        fontWeight: targetSemester === s.val ? 800 : 500,
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Prioridade e Órgão Emissor */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Nível de Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                  className="form-input"
                  style={{ fontSize: '0.875rem' }}
                >
                  <option value="BAIXA">🔵 Informativo / Baixa</option>
                  <option value="MEDIA">🟡 Padrão / Média</option>
                  <option value="ALTA">🟠 Importante / Alta</option>
                  <option value="URGENTE">🔴 Urgente / Imediata</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Órgão / Emissor
                </label>
                <input
                  type="text"
                  placeholder="Ex: Centro Acadêmico (CA), Coordenação..."
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* Imagem de Capa (URL) */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                Imagem / Banner do Anúncio (URL)
              </label>
              <input
                type="url"
                placeholder="https://exemplo.com/banner-hackathon.jpg (ou deixe em branco para gradiente padrão)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.875rem' }}
              />
              {imageUrl && (
                <div style={{ marginTop: '0.5rem', maxHeight: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                  <img src={imageUrl} alt="Pré-visualização" style={{ width: '100%', height: '100px', objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>

            {/* Link Adicional (Botão de Ação) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Link de Acesso (URL Externa / Formulário)
                </label>
                <input
                  type="url"
                  placeholder="https://forms.gle/... ou edital em PDF"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.875rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Texto do Botão
                </label>
                <input
                  type="text"
                  placeholder="Ex: Inscrever-se / Acessar"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* Conteúdo Detalhado */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                Conteúdo do Comunicado Oficial *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Escreva as instruções, datas, horários, locais e orientações completas para os estudantes..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.9rem', resize: 'vertical' }}
              />
            </div>

            {/* Opção Fixar no Topo */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                📌 Fixar este comunicado no topo do mural
              </span>
            </label>
          </div>

          {/* Rodapé com Botões de Ação */}
          <div
            style={{
              padding: '1.25rem 1.75rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-muted, #f8fafc)',
            }}
          >
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn btn-outline">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ minWidth: '150px' }}
            >
              {isSubmitting ? 'Salvando...' : editingAnnouncement ? 'Salvar Alterações' : 'Publicar Comunicado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
