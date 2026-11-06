'use client';

import React, { useState, useEffect } from 'react';
import {
  Announcement,
  AnnouncementPriority,
  AnnouncementBannerType,
  AnnouncementLink,
  AnnouncementAttachment,
  CourseType,
} from '@/lib/types';

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Announcement>) => Promise<void>;
  editingAnnouncement?: Announcement | null;
}

const BANNER_PRESETS: Array<{
  id: AnnouncementBannerType;
  label: string;
  gradient: string;
  desc: string;
}> = [
  {
    id: 'PADRAO_AZUL',
    label: 'Azul Institucional',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%)',
    desc: 'FATEC & Geral',
  },
  {
    id: 'PADRAO_VERDE',
    label: 'Verde ESG',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)',
    desc: 'Sustentabilidade',
  },
  {
    id: 'PADRAO_ROXO',
    label: 'Roxo IA & Tech',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #1e1b4b 100%)',
    desc: 'Inteligência Artificial',
  },
  {
    id: 'PADRAO_AMBAR',
    label: 'Âmbar Destaque',
    gradient: 'linear-gradient(135deg, #d97706 0%, #ea580c 50%, #451a03 100%)',
    desc: 'Atenção & Prazos',
  },
  {
    id: 'PADRAO_GRAFITE',
    label: 'Grafite Neutro',
    gradient: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
    desc: 'Formal & Geral',
  },
];

export default function AnnouncementFormModal({
  isOpen,
  onClose,
  onSave,
  editingAnnouncement,
}: AnnouncementFormModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetCourse, setTargetCourse] = useState<'TODOS' | 'IA' | 'ESG'>('TODOS');
  const [targetSemester, setTargetSemester] = useState<number>(0); // 0 = Todos
  const [priority, setPriority] = useState<AnnouncementPriority>('MEDIA');
  const [authorRole, setAuthorRole] = useState('Centro Acadêmico (CA)');

  // Banners & Cores
  const [bannerType, setBannerType] = useState<AnnouncementBannerType>('PADRAO_AZUL');
  const [useCustomImage, setUseCustomImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Links Dinâmicos (Google Forms style)
  const [links, setLinks] = useState<AnnouncementLink[]>([]);

  // Anexos Dinâmicos (com Upload Físico de PDF/Documentos/Fotos)
  const [attachments, setAttachments] = useState<AnnouncementAttachment[]>([]);
  const [uploadingAttachmentId, setUploadingAttachmentId] = useState<string | null>(null);

  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingAnnouncement) {
      setTitle(editingAnnouncement.title || '');
      setContent(editingAnnouncement.content || '');
      setTargetCourse((editingAnnouncement.target_course as any) || 'TODOS');
      setTargetSemester(editingAnnouncement.target_semester || 0);
      setPriority(editingAnnouncement.priority || 'MEDIA');
      setAuthorRole(editingAnnouncement.author_role || 'Centro Acadêmico (CA)');

      // Tratar banner e imagem
      if (editingAnnouncement.image_url) {
        setUseCustomImage(true);
        setImageUrl(editingAnnouncement.image_url);
        setBannerType('CUSTOM');
      } else {
        setUseCustomImage(false);
        setImageUrl('');
        setBannerType(editingAnnouncement.banner_type || 'PADRAO_AZUL');
      }

      // Tratar links múltiplos
      if (editingAnnouncement.links && editingAnnouncement.links.length > 0) {
        setLinks(editingAnnouncement.links);
      } else if (editingAnnouncement.link_url) {
        setLinks([
          {
            id: 'link-legacy-1',
            label: editingAnnouncement.link_label || 'Acessar Link',
            url: editingAnnouncement.link_url,
          },
        ]);
      } else {
        setLinks([]);
      }

      // Tratar anexos múltiplos
      if (editingAnnouncement.attachments && editingAnnouncement.attachments.length > 0) {
        setAttachments(editingAnnouncement.attachments);
      } else {
        setAttachments([]);
      }

      setIsPinned(!!editingAnnouncement.is_pinned);
    } else {
      setTitle('');
      setContent('');
      setTargetCourse('TODOS');
      setTargetSemester(0);
      setPriority('MEDIA');
      setAuthorRole('Centro Acadêmico (CA)');
      setBannerType('PADRAO_AZUL');
      setUseCustomImage(false);
      setImageUrl('');
      setLinks([]);
      setAttachments([]);
      setIsPinned(false);
    }
    setError('');
  }, [editingAnnouncement, isOpen]);

  if (!isOpen) return null;

  // Gerenciadores de Links Dinâmicos
  const handleAddLink = () => {
    setLinks([
      ...links,
      {
        id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        label: '',
        url: '',
      },
    ]);
  };

  const handleUpdateLink = (id: string, field: 'label' | 'url', value: string) => {
    setLinks(links.map((lnk) => (lnk.id === id ? { ...lnk, [field]: value } : lnk)));
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter((lnk) => lnk.id !== id));
  };

  // Gerenciadores de Anexos Dinâmicos com Upload Real
  const handleAddAttachment = () => {
    setAttachments([
      ...attachments,
      {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: '',
        url: '',
        type: 'DOCUMENTO',
      },
    ]);
  };

  const handleUpdateAttachment = (
    id: string,
    field: 'title' | 'url' | 'type',
    value: any
  ) => {
    setAttachments(attachments.map((att) => (att.id === id ? { ...att, [field]: value } : att)));
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((att) => att.id !== id));
  };

  // Upload físico do anexo para o servidor
  const handleFileUploadForAttachment = async (id: string, file: File) => {
    setUploadingAttachmentId(id);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/announcements/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao realizar upload do arquivo.');

      setAttachments((prev) =>
        prev.map((att) =>
          att.id === id
            ? {
                ...att,
                url: data.data.url,
                title: att.title.trim() ? att.title : data.data.title,
                type: data.data.type,
              }
            : att
        )
      );
    } catch (err: any) {
      setError(err.message || 'Falha ao anexar arquivo.');
    } finally {
      setUploadingAttachmentId(null);
    }
  };

  // Upload da imagem do banner
  const handleBannerUpload = async (file: File) => {
    setIsUploadingBanner(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/announcements/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar imagem para o banner.');

      setImageUrl(data.data.url);
      setUseCustomImage(true);
      setBannerType('CUSTOM');
    } catch (err: any) {
      setError(err.message || 'Falha no upload do banner.');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Limpar imagem e voltar para o gradiente padrão
  const handleClearImageAndUseColor = (preset: AnnouncementBannerType = 'PADRAO_AZUL') => {
    setUseCustomImage(false);
    setImageUrl('');
    setBannerType(preset);
  };

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

    // Filtrar links válidos
    const validLinks = links.filter((l) => l.url.trim().length > 0).map((l) => ({
      ...l,
      label: l.label.trim() || 'Acessar Link',
      url: l.url.trim(),
    }));

    // Filtrar anexos válidos
    const validAttachments = attachments.filter((a) => a.url.trim().length > 0).map((a) => ({
      ...a,
      title: a.title.trim() || 'Arquivo Anexo',
      url: a.url.trim(),
    }));

    setIsSubmitting(true);
    setError('');

    try {
      const finalImageUrl = useCustomImage && imageUrl.trim().length > 0 ? imageUrl.trim() : null;
      const finalBannerType = finalImageUrl ? 'CUSTOM' : bannerType;

      await onSave({
        title: title.trim(),
        content: content.trim(),
        target_course: targetCourse === 'TODOS' ? null : (targetCourse as CourseType),
        target_semester: targetSemester === 0 ? null : targetSemester,
        priority,
        author_role: authorRole.trim(),
        banner_type: finalBannerType,
        image_url: finalImageUrl,
        link_url: validLinks.length > 0 ? validLinks[0].url : null,
        link_label: validLinks.length > 0 ? validLinks[0].label : null,
        links: validLinks,
        attachments: validAttachments,
        is_pinned: isPinned,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar comunicado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeGradient =
    BANNER_PRESETS.find((p) => p.id === bannerType)?.gradient || BANNER_PRESETS[0].gradient;

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
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="announcement-modal-card card"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-light)',
          backgroundColor: '#ffffff',
          color: 'var(--text-main, #0f172a)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Cabeçalho do Modal */}
        <div
          className="announcement-modal-header"
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {editingAnnouncement ? 'Editar Comunicado Oficial' : 'Publicar Novo Comunicado'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              Painel de Emissão de Avisos (CA, Coordenação e Secretaria FATEC)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              lineHeight: 1,
            }}
            title="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Formulário com Scroll Suave */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--accent-rose)',
                  borderRadius: '10px',
                  color: 'var(--accent-rose)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
            <div>
              <label className="label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>
                Título do Comunicado *
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Calendário Acadêmico do 1º Semestre de 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                style={{ fontSize: '0.95rem', padding: '0.65rem 0.85rem' }}
              />
            </div>

            {/* CONTEÚDO DETALHADO DO COMUNICADO - LOGO ABAIXO DO TÍTULO */}
            <div style={{ width: '100%' }}>
              <label className="label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>
                Conteúdo do Comunicado Oficial *
              </label>
              <textarea
                required
                className="form-textarea"
                rows={6}
                placeholder="Escreva as diretrizes, informativos ou avisos com clareza para a comunidade acadêmica..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  width: '100%',
                  minWidth: '100%',
                  minHeight: '140px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  fontSize: '0.925rem',
                  lineHeight: 1.6,
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                  resize: 'vertical',
                  display: 'block',
                }}
              />
            </div>

            {/* SEÇÃO 2: PÚBLICO-ALVO (CURSO E SEMESTRE) */}
            <div
              className="announcement-form-section"
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1px solid var(--border-light)',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                Destinatários do Comunicado
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {/* Curso */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.45rem' }}>
                    Destinado ao Curso *
                  </label>
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'TODOS', label: 'Todos os Cursos' },
                      { id: 'IA', label: 'Inteligência Artificial' },
                      { id: 'ESG', label: 'Gestão ESG' },
                    ].map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setTargetCourse(c.id as any)}
                        className={`announcement-form-btn-toggle ${targetCourse === c.id ? 'active' : ''}`}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontWeight: targetCourse === c.id ? 700 : 500,
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Semestre */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.45rem' }}>
                    Destinado ao Semestre *
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[
                      { val: 0, label: 'Todos' },
                      { val: 1, label: '1º' },
                      { val: 2, label: '2º' },
                      { val: 3, label: '3º' },
                      { val: 4, label: '4º' },
                    ].map((s) => (
                      <button
                        type="button"
                        key={s.val}
                        onClick={() => setTargetSemester(s.val)}
                        className={`announcement-form-btn-toggle ${targetSemester === s.val ? 'active' : ''}`}
                        style={{
                          padding: '0.45rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontWeight: targetSemester === s.val ? 700 : 500,
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: PRIORIDADE E ÓRGÃO EMISSOR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>
                  Nível de Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                  className="form-select"
                  style={{ fontSize: '0.875rem', padding: '0.6rem 0.85rem' }}
                >
                  <option value="BAIXA">Informativo Geral / Baixa</option>
                  <option value="MEDIA">Normal / Média</option>
                  <option value="ALTA">Importante / Alta</option>
                  <option value="URGENTE">Urgente / Alerta Imediato</option>
                </select>
              </div>

              <div>
                <label className="label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>
                  Órgão / Emissor
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Centro Acadêmico (CA), Coordenação..."
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  style={{ fontSize: '0.875rem', padding: '0.6rem 0.85rem' }}
                />
              </div>
            </div>

            {/* SEÇÃO 4: BANNERS PADRÃO EM CORES INSTITUCIONAIS */}
            <div
              className="announcement-form-section"
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1px solid var(--border-light)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Estilo do Banner do Comunicado
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Escolha uma cor institucional ou faça upload de imagem do seu computador.
                  </div>
                </div>

                {useCustomImage && (
                  <button
                    type="button"
                    onClick={() => handleClearImageAndUseColor('PADRAO_AZUL')}
                    className="btn btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '8px' }}
                  >
                    Remover Imagem e Usar Cor Padrão
                  </button>
                )}
              </div>

              {/* Seletor de Cores Padrão */}
              {!useCustomImage ? (
                <div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '0.65rem',
                      marginBottom: '1rem',
                    }}
                  >
                    {BANNER_PRESETS.map((preset) => {
                      const isSelected = bannerType === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => setBannerType(preset.id)}
                          className={`announcement-banner-choice-card ${isSelected ? 'selected' : ''}`}
                          style={{
                            borderRadius: '10px',
                            padding: '0.65rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              height: '36px',
                              borderRadius: '6px',
                              background: preset.gradient,
                              marginBottom: '0.5rem',
                            }}
                          />
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                            {preset.label}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {preset.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Opção para subir imagem ou link */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Deseja usar uma imagem personalizada?
                    </span>
                    <label
                      className="btn btn-outline"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      {isUploadingBanner ? 'Enviando imagem...' : 'Carregar Imagem do PC'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={isUploadingBanner}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBannerUpload(file);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomImage(true);
                        setBannerType('CUSTOM');
                      }}
                      className="btn btn-outline"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderRadius: '8px' }}
                    >
                      Colar Link Web
                    </button>
                  </div>
                </div>
              ) : (
                /* Imagem Customizada Ativa */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="URL da Imagem (Ex: https://images.unsplash.com/...)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                    />
                    <label
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      {isUploadingBanner ? 'Enviando...' : 'Trocar Foto (PC)'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={isUploadingBanner}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBannerUpload(file);
                        }}
                      />
                    </label>
                  </div>

                  {imageUrl && (
                    <div
                      style={{
                        position: 'relative',
                        height: '100px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-light)',
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt="Preview Banner"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '8px',
                          backgroundColor: 'rgba(0,0,0,0.65)',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        Pré-visualização do Banner
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SEÇÃO 5: LINKS DE AÇÃO (ESTILO GOOGLE FORMS) */}
            <div
              className="announcement-form-section"
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1px solid var(--border-light)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Links de Ação & Formulários
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Adicione links de acesso rápido para os alunos (inscrições, calendários, sites).
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderRadius: '8px', fontWeight: 700 }}
                >
                  + Adicionar Link
                </button>
              </div>

              {links.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                  Nenhum link adicional configurado.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {links.map((link, index) => (
                    <div
                      key={link.id}
                      className="announcement-form-row"
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: '20px' }}>
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Texto do Botão (Ex: Acessar Formulário)"
                        value={link.label}
                        onChange={(e) => handleUpdateLink(link.id, 'label', e.target.value)}
                        style={{ flex: '1 1 180px', fontSize: '0.825rem', padding: '0.45rem 0.75rem' }}
                      />
                      <input
                        type="url"
                        className="form-input"
                        placeholder="Endereço URL (https://...)"
                        value={link.url}
                        onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                        style={{ flex: '2 1 240px', fontSize: '0.825rem', padding: '0.45rem 0.75rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(link.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '0.4rem',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                        }}
                        title="Remover link"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SEÇÃO 6: ANEXOS DINÂMICOS (UPLOAD FÍSICO ESTILO GOOGLE FORMS) */}
            <div
              className="announcement-form-section"
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1px solid var(--border-light)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Anexos e Documentos Didáticos
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Anexe arquivos PDF, documentos ou fotos diretamente do seu dispositivo.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderRadius: '8px', fontWeight: 700 }}
                >
                  + Adicionar Anexo
                </button>
              </div>

              {attachments.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                  Nenhum anexo adicional incluído. Clique no botão acima para anexar PDFs ou imagens.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {attachments.map((att, index) => {
                    const isUploadingThis = uploadingAttachmentId === att.id;
                    return (
                      <div
                        key={att.id}
                        className="announcement-form-row"
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '12px',
                          border: '1px solid var(--border-light)',
                        }}
                      >
                        {!att.url ? (
                          /* Estado 1: Anexo sem arquivo carregado ainda */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                Anexo #{index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(att.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                }}
                              >
                                Cancelar
                              </button>
                            </div>

                            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                              <label
                                className="btn btn-primary"
                                style={{
                                  fontSize: '0.825rem',
                                  padding: '0.5rem 0.95rem',
                                  borderRadius: '8px',
                                  cursor: isUploadingThis ? 'not-allowed' : 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.45rem',
                                }}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="17 8 12 3 7 8" />
                                  <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                {isUploadingThis ? 'Enviando arquivo...' : 'Escolher Arquivo do Computador'}
                                <input
                                  type="file"
                                  style={{ display: 'none' }}
                                  disabled={isUploadingThis}
                                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUploadForAttachment(att.id, file);
                                  }}
                                />
                              </label>

                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ou</span>

                              <input
                                type="text"
                                className="form-input"
                                placeholder="Colar link institucional (Google Drive, URL...)"
                                value={att.url}
                                onChange={(e) => handleUpdateAttachment(att.id, 'url', e.target.value)}
                                style={{ flex: '1 1 220px', fontSize: '0.825rem', padding: '0.5rem 0.75rem' }}
                              />
                            </div>
                          </div>
                        ) : (
                          /* Estado 2: Arquivo já anexado */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span
                                  style={{
                                    fontSize: '0.725rem',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: att.type === 'IMAGEM' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                                    color: att.type === 'IMAGEM' ? 'var(--accent-emerald)' : 'var(--accent-blue)',
                                  }}
                                >
                                  {att.type === 'IMAGEM' ? 'FOTO / IMAGEM' : 'DOCUMENTO / PDF'}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                                  Arquivo Carregado
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(att.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                }}
                              >
                                Remover Anexo
                              </button>
                            </div>

                            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Nome / Título do Arquivo para Exibição"
                                value={att.title}
                                onChange={(e) => handleUpdateAttachment(att.id, 'title', e.target.value)}
                                style={{ flex: '2 1 240px', fontSize: '0.85rem', fontWeight: 600, padding: '0.45rem 0.75rem' }}
                              />

                              <label
                                className="btn btn-outline"
                                style={{
                                  fontSize: '0.78rem',
                                  padding: '0.45rem 0.75rem',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                }}
                              >
                                <span>Substituir</span>
                                <input
                                  type="file"
                                  style={{ display: 'none' }}
                                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUploadForAttachment(att.id, file);
                                  }}
                                />
                              </label>

                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline"
                                style={{
                                  fontSize: '0.78rem',
                                  padding: '0.45rem 0.75rem',
                                  borderRadius: '8px',
                                  textDecoration: 'none',
                                }}
                              >
                                Abrir Arquivo ↗
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SEÇÃO 7: DESTAQUE NO TOPO (PINNED) */}
            <div
              className="announcement-form-section"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
              }}
            >
              <input
                type="checkbox"
                id="isPinnedCheck"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
              />
              <label htmlFor="isPinnedCheck" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                Fixar este comunicado no topo do mural (Destaque Principal)
              </label>
            </div>

            </div>

          {/* Rodapé Fixo com Ações */}
          <div
            className="announcement-modal-footer"
            style={{
              padding: '1.25rem 1.75rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-outline"
              style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ fontSize: '0.875rem', padding: '0.6rem 1.5rem', fontWeight: 700 }}
            >
              {isSubmitting ? 'Salvando...' : editingAnnouncement ? 'Salvar Alterações' : 'Publicar Comunicado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
