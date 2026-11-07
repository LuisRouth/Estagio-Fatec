'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { AcademicMaterial, CourseType, AnnouncementLink, AnnouncementAttachment } from '@/lib/types';

// Presets de Capa / Banner para Projetos
const PROJECT_BANNER_PRESETS = [
  {
    id: 'PADRAO_AGRO',
    label: 'Agro & Campo Inteligente',
    gradient: 'linear-gradient(135deg, #065f46 0%, #059669 50%, #022c22 100%)',
    desc: 'Agronegócio & Visão (Foco 4º Sem)',
  },
  {
    id: 'PADRAO_SAUDE',
    label: 'Saúde, Bio & Diagnóstico',
    gradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #082f49 100%)',
    desc: 'Medicina & Imagens (Foco 3º Sem)',
  },
  {
    id: 'PADRAO_DEEPTECH',
    label: 'IA, Deep Learning & NLP',
    gradient: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #1e1b4b 100%)',
    desc: 'Redes Neurais & Modelos',
  },
  {
    id: 'PADRAO_VISAO',
    label: 'Visão Computacional & Robótica',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 50%, #0f172a 100%)',
    desc: 'OpenCV, Deteccao & Backend',
  },
  {
    id: 'PADRAO_ESG',
    label: 'Gestão ESG & Governança',
    gradient: 'linear-gradient(135deg, #047857 0%, #0d9488 50%, #134e4a 100%)',
    desc: 'Sustentabilidade & ODS',
  },
];

// Sugestões Rápidas de Tags
const TAG_SUGGESTIONS = [
  'Agro',
  'Saude',
  'Visao Computacional',
  'Deep Learning',
  'NLP',
  'OpenCV',
  'YOLO',
  'Python',
  'PyTorch',
  'Scikit-Learn',
  'Streamlit',
  'IoT',
  'PostgreSQL',
  'ESG',
  'TCC',
];

export default function VitrinePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'explorar' | 'meus' | 'moderacao'>('explorar');

  // Galeria de Projetos
  const [projects, setProjects] = useState<AcademicMaterial[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Meus Projetos
  const [myProjects, setMyProjects] = useState<AcademicMaterial[]>([]);
  const [loadingMyProjects, setLoadingMyProjects] = useState(false);

  // Moderação (CA e ADM)
  const [pendingProjects, setPendingProjects] = useState<AcademicMaterial[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // Filtros da Galeria
  const [courseFilter, setCourseFilter] = useState<'TODOS' | CourseType>('TODOS');
  const [semesterFilter, setSemesterFilter] = useState<number | 'TODOS'>('TODOS');
  const [typeFilter, setTypeFilter] = useState<'TODOS' | 'PROJETO' | 'TCC'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Modais de Criação / Edição / Confirmação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AcademicMaterial | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<AcademicMaterial | null>(null);

  // Form State Dinâmico (Similar ao AnnouncementFormModal)
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formCourse, setFormCourse] = useState<CourseType>('IA');
  const [formSemester, setFormSemester] = useState<number>(1);
  const [formType, setFormType] = useState<'PROJETO' | 'TCC'>('PROJETO');
  const [formAuthorName, setFormAuthorName] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formGithubUrl, setFormGithubUrl] = useState('');

  // Banner & Capa Dinâmicos
  const [formBannerType, setFormBannerType] = useState('PADRAO_DEEPTECH');
  const [formUseCustomImage, setFormUseCustomImage] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState('');

  // Links Dinâmicos Adicionais
  const [formLinks, setFormLinks] = useState<AnnouncementLink[]>([]);

  // Anexos Dinâmicos Adicionais
  const [formAttachments, setFormAttachments] = useState<AnnouncementAttachment[]>([]);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Identifica papel do usuário logado
  const isPrivileged = currentUser?.role === 'ADMIN' || currentUser?.role === 'CA_MEMBRO' || currentUser?.role === 'PROFESSOR';
  const isCaOrAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'CA_MEMBRO';

  // Carregar usuário logado
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setCurrentUser(d.data);
          setFormAuthorName(d.data.name || '');
        }
      })
      .catch(() => {});
  }, []);

  // Fechar modal ao pressionar tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) handleCloseModal();
        if (deleteConfirmTarget) setDeleteConfirmTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, deleteConfirmTarget]);

  // Carregar projetos da galeria pública
  const fetchPublicProjects = async () => {
    setLoadingProjects(true);
    try {
      const params = new URLSearchParams();
      params.append('scope', 'vitrine');
      if (courseFilter !== 'TODOS') params.append('course', courseFilter);
      if (semesterFilter !== 'TODOS') params.append('semester', semesterFilter.toString());
      if (typeFilter !== 'TODOS') {
        params.append('type', typeFilter);
      }

      const res = await fetch(`/api/materials?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const vitrineOnly = data.data.filter(
            (m: AcademicMaterial) => m.material_type === 'PROJETO' || m.material_type === 'TCC'
          );
          setProjects(vitrineOnly);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar projetos da vitrine:', e);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Carregar meus projetos
  const fetchMyProjects = async () => {
    if (!currentUser?.id) return;
    setLoadingMyProjects(true);
    try {
      const res = await fetch(`/api/materials?author_id=${currentUser.id}&scope=vitrine&all=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const myVitrine = data.data.filter(
            (m: AcademicMaterial) => m.material_type === 'PROJETO' || m.material_type === 'TCC'
          );
          setMyProjects(myVitrine);
        }
      }
    } catch (e) {
      console.error('Erro ao buscar meus projetos:', e);
    } finally {
      setLoadingMyProjects(false);
    }
  };

  // Carregar fila de moderação para CA e ADM
  const fetchPendingProjects = async () => {
    if (!isCaOrAdmin) return;
    setLoadingPending(true);
    try {
      const res = await fetch('/api/materials?pending=true&scope=vitrine');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const pendingVitrine = data.data.filter(
            (m: AcademicMaterial) => m.material_type === 'PROJETO' || m.material_type === 'TCC'
          );
          setPendingProjects(pendingVitrine);
        }
      }
    } catch (e) {
      console.error('Erro ao buscar projetos pendentes:', e);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    fetchPublicProjects();
  }, [courseFilter, semesterFilter, typeFilter]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchMyProjects();
      if (isCaOrAdmin) {
        fetchPendingProjects();
      }
    }
  }, [currentUser, isCaOrAdmin]);

  // Abertura do modal para novo projeto
  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setFormTitle('');
    setFormDesc('');
    setFormSubject('');
    setFormCourse(currentUser?.course === 'ESG' ? 'ESG' : 'IA');
    setFormSemester(1);
    setFormType('PROJETO');
    setFormAuthorName(currentUser?.name || '');
    setFormTags('');
    setFormGithubUrl('');
    setFormBannerType('PADRAO_DEEPTECH');
    setFormUseCustomImage(false);
    setFormImageUrl('');
    setFormLinks([]);
    setFormAttachments([]);
    setFormError('');
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Abertura do modal para edição de projeto existente
  const handleOpenEditModal = (p: AcademicMaterial) => {
    setEditingProject(p);
    setFormTitle(p.title || '');
    setFormDesc(p.description || '');
    setFormSubject(p.subject || '');
    setFormCourse(p.course);
    setFormSemester(p.semester);
    setFormType(p.material_type === 'TCC' ? 'TCC' : 'PROJETO');
    setFormAuthorName(p.author_name || currentUser?.name || '');
    setFormTags(p.tags || '');
    setFormGithubUrl(p.github_url || '');

    if (p.image_url) {
      setFormUseCustomImage(true);
      setFormImageUrl(p.image_url);
      setFormBannerType('CUSTOM');
    } else {
      setFormUseCustomImage(false);
      setFormImageUrl('');
      setFormBannerType(p.banner_type || 'PADRAO_DEEPTECH');
    }

    // Links múltiplos
    if (Array.isArray(p.links) && p.links.length > 0) {
      setFormLinks(p.links);
    } else if (p.demo_url) {
      setFormLinks([
        {
          id: `link-${Date.now()}`,
          label: 'Demonstração Web / App',
          url: p.demo_url,
        },
      ]);
    } else {
      setFormLinks([]);
    }

    // Anexos múltiplos
    if (Array.isArray(p.attachments) && p.attachments.length > 0) {
      setFormAttachments(p.attachments);
    } else if (p.file_url && p.file_url !== '#') {
      setFormAttachments([
        {
          id: `att-${Date.now()}`,
          title: 'Documentação / Artigo PDF',
          url: p.file_url,
          type: 'DOCUMENTO',
        },
      ]);
    } else {
      setFormAttachments([]);
    }

    setFormError('');
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    document.body.style.overflow = '';
  };

  // Adicionar / Remover Links Dinâmicos
  const handleAddLink = () => {
    setFormLinks([
      ...formLinks,
      {
        id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        label: '',
        url: '',
      },
    ]);
  };

  const handleUpdateLink = (id: string, field: 'label' | 'url', value: string) => {
    setFormLinks(formLinks.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const handleRemoveLink = (id: string) => {
    setFormLinks(formLinks.filter((l) => l.id !== id));
  };

  // Adicionar / Remover Anexos Dinâmicos
  const handleAddAttachment = () => {
    setFormAttachments([
      ...formAttachments,
      {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: '',
        url: '',
        type: 'DOCUMENTO',
      },
    ]);
  };

  const handleUpdateAttachment = (id: string, field: 'title' | 'url', value: string) => {
    setFormAttachments(formAttachments.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const handleRemoveAttachment = (id: string) => {
    setFormAttachments(formAttachments.filter((a) => a.id !== id));
  };

  // Alternar tag com 1 clique nos chips sugeridos
  const handleToggleTag = (tag: string) => {
    const currentTags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const exists = currentTags.some((t) => t.toLowerCase() === tag.toLowerCase());
    let updated: string[];
    if (exists) {
      updated = currentTags.filter((t) => t.toLowerCase() !== tag.toLowerCase());
    } else {
      updated = [...currentTags, tag];
    }
    setFormTags(updated.join(', '));
  };

  // Submissão do Formulário Dinâmico (Criação ou Edição)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setFormError('Efetue login institucional para salvar projetos.');
      return;
    }
    if (!formTitle.trim()) {
      setFormError('Por favor, informe o título do projeto.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');

    try {
      const validLinks = formLinks
        .filter((l) => l.url.trim().length > 0)
        .map((l) => ({
          ...l,
          label: l.label.trim() || 'Link Adicional',
          url: l.url.trim(),
        }));

      const validAttachments = formAttachments
        .filter((a) => a.url.trim().length > 0)
        .map((a) => ({
          ...a,
          title: a.title.trim() || 'Documento Anexo',
          url: a.url.trim(),
          type: 'DOCUMENTO',
        }));

      const finalImageUrl = formUseCustomImage && formImageUrl.trim() ? formImageUrl.trim() : null;
      const finalBannerType = finalImageUrl ? 'CUSTOM' : formBannerType;

      const primaryDemo = validLinks.find((l) => l.label.toLowerCase().includes('demo') || l.label.toLowerCase().includes('app'))?.url || validLinks[0]?.url || null;
      const primaryDoc = validAttachments[0]?.url || validLinks.find((l) => l.label.toLowerCase().includes('doc') || l.label.toLowerCase().includes('pdf') || l.label.toLowerCase().includes('artigo'))?.url || formGithubUrl.trim() || '#';

      const payload: any = {
        title: formTitle.trim(),
        description: formDesc.trim() || null,
        subject: formSubject.trim() || 'Geral',
        course: formCourse,
        semester: Number(formSemester),
        material_type: formType,
        banner_type: finalBannerType,
        github_url: formGithubUrl.trim() || null,
        file_url: primaryDoc,
        demo_url: primaryDemo,
        image_url: finalImageUrl,
        author_name: formAuthorName.trim() || currentUser.name,
        tags: formTags.trim() || null,
        links: validLinks,
        attachments: validAttachments,
      };

      if (editingProject) {
        // Atualização
        const res = await fetch(`/api/materials/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Falha ao atualizar o projeto.');
        }
      } else {
        // Criação
        const res = await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Falha ao submeter o projeto.');
        }
      }

      handleCloseModal();
      fetchPublicProjects();
      fetchMyProjects();
      if (isCaOrAdmin) fetchPendingProjects();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao processar projeto.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Exclusão de projeto
  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;

    try {
      const res = await fetch(`/api/materials/${deleteConfirmTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao excluir projeto.');
      }

      setDeleteConfirmTarget(null);
      fetchPublicProjects();
      fetchMyProjects();
      if (isCaOrAdmin) fetchPendingProjects();
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
    }
  };

  // Aprovar publicação (Moderação CA & ADM)
  const handleApproveProject = async (p: AcademicMaterial) => {
    try {
      const res = await fetch(`/api/materials/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao aprovar projeto.');
      }

      fetchPublicProjects();
      fetchMyProjects();
      fetchPendingProjects();
    } catch (err: any) {
      console.error('Erro ao aprovar:', err);
    }
  };

  // Filtragem local por busca
  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.tags && p.tags.toLowerCase().includes(q)) ||
      (p.author_name && p.author_name.toLowerCase().includes(q))
    );
  });

  // Determinar o gradiente ativo para o banner
  const getBannerGradient = (p: AcademicMaterial) => {
    if (p.image_url) return `url(${p.image_url}) center/cover no-repeat`;
    const preset = PROJECT_BANNER_PRESETS.find((b) => b.id === p.banner_type);
    if (preset) return preset.gradient;

    // Fallbacks inteligentes baseados no semestre e curso
    if (p.course === 'ESG') return 'linear-gradient(135deg, #047857 0%, #0d9488 50%, #134e4a 100%)';
    if (p.semester === 4) return 'linear-gradient(135deg, #065f46 0%, #059669 50%, #022c22 100%)'; // Foco Agro
    if (p.semester === 3) return 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #082f49 100%)'; // Foco Saude
    return 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 50%, #0f172a 100%)';
  };

  return (
    <AppLayout activePath="/vitrine">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Cabeçalho da Vitrine de Projetos */}
        <div
          className="vitrine-header-card"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            padding: '2rem',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">Vitrine Acadêmica & TCC</span>
              <span className="badge badge-emerald">IA & Gestão ESG</span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Vitrine de Projetos Práticos & TCC
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '720px', lineHeight: 1.6 }}>
              Galeria discente de trabalhos práticos, modelos de Machine Learning, visão computacional, diagnósticos ESG e TCCs da FATEC Rio Claro. Conecte repositórios do GitHub, PDFs e protótipos em um só lugar.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="btn btn-primary"
            style={{
              padding: '0.8rem 1.4rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Submeter Projeto
          </button>
        </div>

        {/* Barra de Navegação em 3 Abas */}
        <div
          className="vitrine-tabs-container"
          style={{
            display: 'flex',
            gap: '0.75rem',
            borderBottom: '2px solid var(--border-light)',
            paddingBottom: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Aba 1: Explorar Projetos */}
          <button
            onClick={() => setActiveTab('explorar')}
            className={`vitrine-tab-btn ${activeTab === 'explorar' ? 'active' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px 10px 0 0',
              fontWeight: 700,
              fontSize: '0.925rem',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
            Explorar Projetos ({projects.length})
          </button>

          {/* Aba 2: Meus Projetos */}
          <button
            onClick={() => setActiveTab('meus')}
            className={`vitrine-tab-btn ${activeTab === 'meus' ? 'active' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px 10px 0 0',
              fontWeight: 700,
              fontSize: '0.925rem',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Meus Projetos & Anexos {currentUser && `(${myProjects.length})`}
          </button>

          {/* Aba 3: Moderação (CA e ADM) */}
          {isCaOrAdmin && (
            <button
              onClick={() => setActiveTab('moderacao')}
              className={`vitrine-tab-btn ${activeTab === 'moderacao' ? 'active' : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px 10px 0 0',
                fontWeight: 700,
                fontSize: '0.925rem',
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
              Moderação CA & ADM
              {pendingProjects.length > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--accent-amber)',
                    color: '#0f172a',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {pendingProjects.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* CONTEÚDO DA ABA 1: EXPLORAR PROJETOS */}
        {activeTab === 'explorar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Barra de Filtros */}
            <div
              className="vitrine-filter-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                padding: '1.5rem',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(['TODOS', 'IA', 'ESG'] as const).map((course) => {
                    const isSelected = courseFilter === course;
                    const label = course === 'TODOS' ? 'Todos os Cursos' : course === 'IA' ? 'Inteligência Artificial' : 'Gestão ESG';
                    return (
                      <button
                        key={course}
                        onClick={() => setCourseFilter(course)}
                        className={`repositorio-course-btn ${isSelected ? 'active' : ''}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ minWidth: '280px', flex: '1 1 280px', maxWidth: '420px', position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Buscar projeto, tecnologia, autor..."
                    className="form-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '0.65rem 1rem 0.65rem 2.4rem', borderRadius: '10px', width: '100%' }}
                  />
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Semestre:</span>
                  {(['TODOS', 1, 2, 3, 4] as const).map((sem) => {
                    const isSelected = semesterFilter === sem;
                    return (
                      <button
                        key={String(sem)}
                        onClick={() => setSemesterFilter(sem)}
                        className={`repositorio-sem-btn ${isSelected ? 'active' : ''}`}
                      >
                        {sem === 'TODOS' ? 'Todos' : `${sem}º Sem`}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tipo:</span>
                  {[
                    { id: 'TODOS', label: 'Todos' },
                    { id: 'PROJETO', label: 'Projetos Práticos' },
                    { id: 'TCC', label: 'TCCs & Artigos' },
                  ].map((t) => {
                    const isSelected = typeFilter === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTypeFilter(t.id as any)}
                        className={`repositorio-type-btn ${isSelected ? 'active' : ''}`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Grid de Projetos */}
            {loadingProjects ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                Sincronizando vitrine de projetos da FATEC Rio Claro...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div
                className="vitrine-empty-card"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '16px',
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  border: '1px dashed var(--border-light)',
                }}
              >
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Nenhum projeto cadastrado no momento
                </h3>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', marginTop: '0.35rem', maxWidth: '520px', margin: '0.35rem auto 1.25rem' }}>
                  Compartilhe os trabalhos práticos, repositórios do GitHub e TCCs desenvolvidos pela turma!
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.4rem', fontWeight: 700 }}
                >
                  Submeter Projeto
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {filteredProjects.map((p) => {
                  const isIA = p.course === 'IA';
                  const bannerBg = getBannerGradient(p);

                  // Destaque temático sutil se tags contêm Agro ou Saúde
                  const isAgro = p.tags?.toLowerCase().includes('agro');
                  const isSaude = p.tags?.toLowerCase().includes('saude') || p.tags?.toLowerCase().includes('saúde');

                  return (
                    <div
                      key={p.id}
                      className="card-interactive vitrine-project-card"
                      style={{
                        padding: '0',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-primary)',
                      }}
                    >
                      {/* Banner Superior */}
                      <div
                        className="vitrine-card-banner"
                        style={{
                          height: '135px',
                          background: bannerBg,
                          position: 'relative',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              backgroundColor: 'rgba(15, 23, 42, 0.85)',
                              color: isIA ? '#38bdf8' : '#34d399',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              padding: '3px 10px',
                              borderRadius: '20px',
                              backdropFilter: 'blur(4px)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                            }}
                          >
                            {p.course === 'IA' ? 'Inteligência Artificial' : 'Gestão ESG'}
                          </span>

                          <span
                            style={{
                              backgroundColor: 'rgba(15, 23, 42, 0.85)',
                              color: '#f8fafc',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              padding: '3px 10px',
                              borderRadius: '20px',
                              backdropFilter: 'blur(4px)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                            }}
                          >
                            {p.semester}º Semestre
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              backgroundColor: p.material_type === 'TCC' ? '#7c3aed' : '#0284c7',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {p.material_type === 'TCC' ? 'Trabalho de Conclusão (TCC)' : 'Projeto Prático'}
                          </span>

                          {isAgro && (
                            <span
                              style={{
                                backgroundColor: 'rgba(6, 95, 70, 0.9)',
                                color: '#a7f3d0',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                border: '1px solid #059669',
                              }}
                            >
                              Foco: Agro
                            </span>
                          )}

                          {isSaude && (
                            <span
                              style={{
                                backgroundColor: 'rgba(3, 105, 161, 0.9)',
                                color: '#bae6fd',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                border: '1px solid #0284c7',
                              }}
                            >
                              Foco: Saúde
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Corpo do Card */}
                      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {p.subject}
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.35 }}>
                          {p.title}
                        </h3>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', lineHeight: 1.5, minHeight: '3.6rem' }}>
                          {p.description || 'Projeto acadêmico desenvolvido no ciclo de formação da FATEC Rio Claro.'}
                        </p>

                        {/* Autores */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          <span><strong>Equipe:</strong> {p.author_name || 'Alunos da Turma'}</span>
                        </div>

                        {/* Tags */}
                        {p.tags && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                            {p.tags.split(',').map((tag, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '0.72rem',
                                  backgroundColor: 'var(--bg-muted)',
                                  color: 'var(--text-muted)',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontWeight: 600,
                                }}
                              >
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Rodapé Dinâmico com Links e Ações */}
                      <div
                        style={{
                          padding: '1rem 1.5rem',
                          borderTop: '1px solid var(--border-light)',
                          backgroundColor: 'var(--bg-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {/* GitHub Principal */}
                          {p.github_url && (
                            <a
                              href={p.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary"
                              style={{
                                padding: '0.42rem 0.8rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                              title="Repositório GitHub"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                              </svg>
                              GitHub
                            </a>
                          )}

                          {/* Links Dinâmicos Adicionais */}
                          {Array.isArray(p.links) &&
                            p.links.map((link, idx) => (
                              <a
                                key={link.id || idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{
                                  padding: '0.42rem 0.8rem',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                                title={link.label}
                              >
                                <span>{link.label || 'Link'}</span>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="7" y1="17" x2="17" y2="7"></line>
                                  <polyline points="7 7 17 7 17 17"></polyline>
                                </svg>
                              </a>
                            ))}

                          {/* Anexos Dinâmicos */}
                          {Array.isArray(p.attachments) &&
                            p.attachments.map((att, idx) => (
                              <a
                                key={att.id || idx}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{
                                  padding: '0.42rem 0.8rem',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                                title={att.title}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                  <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                {att.title || 'Anexo'}
                              </a>
                            ))}

                          {/* Fallback de Arquivo se não houver anexos múltiplos */}
                          {(!p.attachments || p.attachments.length === 0) && p.file_url && p.file_url !== '#' && (
                            <a
                              href={p.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary"
                              style={{
                                padding: '0.42rem 0.8rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                              title="Documento / Artigo"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                              </svg>
                              Docs / PDF
                            </a>
                          )}

                          {/* Fallback de Demo se não houver links dinâmicos */}
                          {(!p.links || p.links.length === 0) && p.demo_url && (
                            <a
                              href={p.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-emerald"
                              style={{
                                padding: '0.42rem 0.8rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                            >
                              Demo
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7 7 17 7 17 17"></polyline>
                              </svg>
                            </a>
                          )}
                        </div>

                        {/* Ações de Gestão para CA, ADM ou Autor */}
                        {(isCaOrAdmin || (currentUser && currentUser.id === p.author_id)) && (
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="btn btn-secondary"
                              style={{
                                padding: '0.4rem 0.75rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                              title="Editar projeto (Acesso CA / ADM / Autor)"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                              </svg>
                              Editar
                            </button>

                            <button
                              onClick={() => setDeleteConfirmTarget(p)}
                              className="btn btn-danger-outline"
                              style={{
                                padding: '0.4rem 0.75rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                              title="Excluir projeto (Acesso CA / ADM / Autor)"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CONTEÚDO DA ABA 2: MEUS PROJETOS & ANEXOS */}
        {activeTab === 'meus' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {!currentUser ? (
              <div
                style={{
                  padding: '3rem 2rem',
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px dashed var(--border-light)',
                  textAlign: 'center',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Acesso Restrito aos Alunos e Docentes Autenticados
                </h3>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: '520px', margin: '0.5rem auto 1.5rem' }}>
                  Efetue login com seu e-mail institucional @fatec.sp.gov.br para gerenciar suas submissões de projetos e links do GitHub.
                </p>
                <a href="/login" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
                  Acessar com E-mail FATEC
                </a>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem 1.75rem',
                    borderRadius: '14px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Painel do Autor: {currentUser.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
                      Gerencie suas submissões de projetos, links do GitHub, artigos e status de aprovação.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenCreateModal}
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 1.25rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Novo Projeto
                  </button>
                </div>

                {loadingMyProjects ? (
                  <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                    Buscando seus projetos e submissões...
                  </div>
                ) : myProjects.length === 0 ? (
                  <div
                    style={{
                      padding: '3.5rem 2rem',
                      borderRadius: '16px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px dashed var(--border-light)',
                      textAlign: 'center',
                    }}
                  >
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Você ainda não submeteu nenhum projeto
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                      Publique seus trabalhos práticos e projetos interdisciplinares dos cursos de IA e ESG.
                    </p>
                    <button
                      onClick={handleOpenCreateModal}
                      className="btn btn-primary"
                      style={{ marginTop: '1.25rem', padding: '0.65rem 1.4rem', fontWeight: 700 }}
                    >
                      Cadastrar Primeiro Projeto
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {myProjects.map((p) => {
                      const isApproved = p.is_approved;
                      return (
                        <div
                          key={p.id}
                          className="card-interactive"
                          style={{
                            padding: '1.5rem',
                            borderRadius: '14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1.25rem',
                            border: '1px solid var(--border-light)',
                            backgroundColor: 'var(--bg-primary)',
                          }}
                        >
                          <div style={{ flex: '1 1 300px' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  backgroundColor: isApproved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                  color: isApproved ? '#10b981' : '#f59e0b',
                                  border: `1px solid ${isApproved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                                  padding: '2px 10px',
                                  borderRadius: '20px',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                              >
                                {isApproved ? (
                                  <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Aprovado / Publicado
                                  </>
                                ) : (
                                  <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <line x1="12" y1="8" x2="12" y2="12"></line>
                                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    Pendente de Moderação pelo CA
                                  </>
                                )}
                              </span>

                              <span className="badge badge-blue">{p.course}</span>
                              <span className="badge" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                                {p.semester}º Semestre
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {p.material_type}
                              </span>
                            </div>

                            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                              {p.title}
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', lineHeight: 1.4, maxWidth: '640px' }}>
                              {p.description || p.subject}
                            </p>

                            <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.65rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                              {p.github_url && <span>GitHub: <a href={p.github_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>{p.github_url}</a></span>}
                              {Array.isArray(p.links) && p.links.length > 0 && <span>Links extras: {p.links.length}</span>}
                              {Array.isArray(p.attachments) && p.attachments.length > 0 && <span>Anexos: {p.attachments.length}</span>}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="btn btn-secondary"
                              style={{ padding: '0.55rem 0.95rem', fontSize: '0.825rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                              </svg>
                              Editar
                            </button>

                            <button
                              onClick={() => setDeleteConfirmTarget(p)}
                              className="btn btn-danger-outline"
                              style={{ padding: '0.55rem 0.95rem', fontSize: '0.825rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              Excluir
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* CONTEÚDO DA ABA 3: MODERAÇÃO CA & ADM */}
        {activeTab === 'moderacao' && isCaOrAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                padding: '1.5rem',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <span className="badge badge-amber">Fila de Curadoria e Aprovação</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Exclusivo: Centro Acadêmico (CA) & Administração</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Moderação de Trabalhos e Anexos Discentes
              </h3>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '780px', lineHeight: 1.5 }}>
                Revise os projetos e links submetidos antes de liberá-los para visualização pública na Vitrine. Projetos postados pelo CA ou Administradores são aprovados automaticamente.
              </p>
            </div>

            {loadingPending ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                Carregando submissões pendentes de aprovação...
              </div>
            ) : pendingProjects.length === 0 ? (
              <div
                style={{
                  padding: '3.5rem 2rem',
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px dashed var(--border-light)',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Fila Limpa! Nenhum projeto pendente de moderação
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                  Todas as submissões discentes recentes já foram avaliadas ou não há novos envios.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingProjects.map((p) => (
                  <div
                    key={p.id}
                    className="card-interactive"
                    style={{
                      padding: '1.75rem',
                      borderRadius: '16px',
                      border: '1px solid var(--accent-amber)',
                      backgroundColor: 'var(--bg-primary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span className="badge badge-amber">Aguardando Avaliação</span>
                          <span className="badge badge-blue">{p.course}</span>
                          <span className="badge" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                            {p.semester}º Semestre
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {p.material_type}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {p.title}
                        </h4>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '0.15rem' }}>
                          Disciplina: {p.subject}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <div><strong>Submetido por:</strong> {p.author_name || 'Aluno'}</div>
                        <div style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>
                          {new Date(p.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      {p.description || 'Sem descrição fornecida pelo autor.'}
                    </p>

                    {/* Links informados */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--bg-muted)', fontSize: '0.8rem' }}>
                      {p.github_url && (
                        <div>
                          <strong>GitHub:</strong>{' '}
                          <a href={p.github_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
                            {p.github_url}
                          </a>
                        </div>
                      )}
                      {Array.isArray(p.links) &&
                        p.links.map((l, idx) => (
                          <div key={idx}>
                            <strong>{l.label}:</strong>{' '}
                            <a href={l.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-purple)', textDecoration: 'underline' }}>
                              {l.url}
                            </a>
                          </div>
                        ))}
                      {p.file_url && p.file_url !== '#' && (
                        <div>
                          <strong>Arquivo / Docs:</strong>{' '}
                          <a href={p.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-emerald)', textDecoration: 'underline' }}>
                            {p.file_url}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Ações de Moderação */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="btn btn-secondary"
                        style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        title="Editar submissão antes de aprovar"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                        Editar Submissão
                      </button>

                      <button
                        onClick={() => setDeleteConfirmTarget(p)}
                        className="btn btn-danger-outline"
                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Rejeitar / Excluir
                      </button>

                      <button
                        onClick={() => handleApproveProject(p)}
                        className="btn btn-emerald"
                        style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Aprovar Publicação
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL DINÂMICO DE SUBMISSÃO / EDIÇÃO (ESTILO ANNOUNCEMENT FORMS) */}
        {isModalOpen && (
          <div
            onClick={handleCloseModal}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div
              className="card vitrine-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '680px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                maxHeight: '92vh',
                overflowY: 'auto',
                border: '1px solid var(--border-light)',
              }}
            >
              <button
                onClick={handleCloseModal}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                ✕
              </button>

              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-emerald">
                  {editingProject ? 'Edição de Projeto' : 'Galeria Discente & TCC'}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                  {editingProject ? 'Editar Informações do Projeto' : 'Submeter Novo Projeto'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {isPrivileged
                    ? 'Publicação imediata: Como CA/Admin/Docente, seu projeto ficará visível instantaneamente.'
                    : 'Submissão discente: Seu projeto passará pela curadoria do CA antes de ser liberado publicamente.'}
                </p>
              </div>

              {formError && (
                <div className="alert-box alert-error" style={{ marginBottom: '1.25rem' }}>
                  <div>{formError}</div>
                </div>
              )}

              <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* 1. SELETOR VISUAL DE CAPA / BANNER DO PROJETO */}
                <div style={{ padding: '1.25rem', borderRadius: '12px', backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-light)' }}>
                  <label className="form-label" style={{ fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>
                    Capa / Identidade Visual do Projeto
                  </label>

                  {/* Preview da Capa Selecionada */}
                  <div
                    style={{
                      height: '90px',
                      borderRadius: '10px',
                      background: formUseCustomImage && formImageUrl
                        ? `url(${formImageUrl}) center/cover no-repeat`
                        : PROJECT_BANNER_PRESETS.find((b) => b.id === formBannerType)?.gradient || PROJECT_BANNER_PRESETS[0].gradient,
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '1rem',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {formTitle.trim() ? formTitle : 'Pré-visualização da Capa do Projeto'}
                  </div>

                  {/* Botões de Presets Temáticos */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {PROJECT_BANNER_PRESETS.map((preset) => {
                      const isSelected = !formUseCustomImage && formBannerType === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setFormUseCustomImage(false);
                            setFormBannerType(preset.id);
                          }}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            background: preset.gradient,
                            color: '#ffffff',
                            border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            transform: isSelected ? 'scale(1.02)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div>{preset.label}</div>
                          <div style={{ fontSize: '0.65rem', opacity: 0.85, fontWeight: 500 }}>{preset.desc}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Opção de Print / Imagem Personalizada */}
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="url"
                        placeholder="Ou cole a URL direta de uma imagem/print do projeto (ex: https://...)"
                        value={formImageUrl}
                        onChange={(e) => {
                          setFormImageUrl(e.target.value);
                          if (e.target.value.trim()) {
                            setFormUseCustomImage(true);
                          }
                        }}
                        className="form-input"
                        style={{ fontSize: '0.8rem' }}
                      />
                      {formUseCustomImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormUseCustomImage(false);
                            setFormImageUrl('');
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                        >
                          Voltar ao Gradiente
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. DADOS BÁSICOS */}
                <div className="form-group">
                  <label className="form-label">Título do Projeto *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Sistema de Visão Computacional para Inspeção Automotiva"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Curso *</label>
                    <select
                      value={formCourse}
                      onChange={(e) => setFormCourse(e.target.value as CourseType)}
                      className="form-select"
                    >
                      <option value="IA">Inteligência Artificial (Mat.)</option>
                      <option value="ESG">Gestão ESG (Not.)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Semestre de Realização *</label>
                    <select
                      value={formSemester}
                      onChange={(e) => {
                        const sem = Number(e.target.value);
                        setFormSemester(sem);
                        // Sugestão visual inteligente do preset sem forçar restrição
                        if (!formUseCustomImage) {
                          if (sem === 4 && formCourse === 'IA') setFormBannerType('PADRAO_AGRO');
                          else if (sem === 3 && formCourse === 'IA') setFormBannerType('PADRAO_SAUDE');
                          else if (sem === 2) setFormBannerType('PADRAO_VISAO');
                          else if (sem === 1) setFormBannerType('PADRAO_DEEPTECH');
                        }
                      }}
                      className="form-select"
                    >
                      <option value={1}>1º Semestre (Fundamentos, Python & Lógica)</option>
                      <option value={2}>2º Semestre (Visão Computacional & Bancos)</option>
                      <option value={3}>3º Semestre (Foco Frequente: Saúde / Bio / Diagnósticos)</option>
                      <option value={4}>4º Semestre (Foco Frequente: Agro & Inteligência no Campo)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Disciplina / Matéria *</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Visão Computacional / Deep Learning"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Modalidade de Trabalho *</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="form-select"
                    >
                      <option value="PROJETO">Projeto Prático de Disciplina</option>
                      <option value="TCC">Trabalho de Conclusão de Curso (TCC)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição Resumida do Projeto</label>
                  <textarea
                    placeholder="Descreva os objetivos, arquitetura técnica, bibliotecas utilizadas e resultados obtidos..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="form-input"
                    style={{ height: '75px', resize: 'vertical' }}
                  />
                </div>

                {/* 3. REPOSITÓRIO GITHUB PRINCIPAL */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    Link do Repositório no GitHub
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/usuario/nome-do-repositorio"
                    value={formGithubUrl}
                    onChange={(e) => setFormGithubUrl(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* 4. LINKS DINÂMICOS MÚLTIPLOS (DEMO, STREAMLIT, ARTIGO, DASHBOARD) */}
                <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Links & Formulários Complementares
                      </span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Adicione links de demos (Streamlit, HuggingFace), dashboards ou documentações.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      + Adicionar Link
                    </button>
                  </div>

                  {formLinks.length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.75rem' }}>
                      Nenhum link adicional adicionado. Clique no botão acima para adicionar links de demonstrações ou dashboards.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {formLinks.map((link) => (
                        <div key={link.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Rótulo (ex: Demo Streamlit, Dashboard)"
                            value={link.label}
                            onChange={(e) => handleUpdateLink(link.id, 'label', e.target.value)}
                            className="form-input"
                            style={{ flex: '1 1 180px', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                          />
                          <input
                            type="url"
                            placeholder="https://..."
                            value={link.url}
                            onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                            className="form-input"
                            style={{ flex: '2 1 240px', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(link.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent-rose)',
                              cursor: 'pointer',
                              padding: '0.4rem',
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

                {/* 5. ANEXOS DINÂMICOS (PDFS, SLIDES, DOCS) */}
                <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Arquivos e Anexos (PDFs, Relatórios, Slides)
                      </span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Links diretos ou compartilhamentos do Google Drive / OneDrive.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      + Adicionar Anexo
                    </button>
                  </div>

                  {formAttachments.length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.75rem' }}>
                      Nenhum anexo de documento adicionado.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {formAttachments.map((att) => (
                        <div key={att.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Nome do arquivo (ex: Relatorio_Final.pdf)"
                            value={att.title}
                            onChange={(e) => handleUpdateAttachment(att.id, 'title', e.target.value)}
                            className="form-input"
                            style={{ flex: '1 1 180px', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                          />
                          <input
                            type="url"
                            placeholder="Link do arquivo (Google Drive, Dropbox, PDF...)"
                            value={att.url}
                            onChange={(e) => handleUpdateAttachment(att.id, 'url', e.target.value)}
                            className="form-input"
                            style={{ flex: '2 1 240px', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(att.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent-rose)',
                              cursor: 'pointer',
                              padding: '0.4rem',
                            }}
                            title="Remover anexo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. AUTORES / INTEGRANTES */}
                <div className="form-group">
                  <label className="form-label">Integrantes / Autores *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Luis Otavio, Cesar Silva & Turma IA"
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* 7. TAGS E SUGESTÕES RÁPIDAS EM 1 CLIQUE */}
                <div className="form-group">
                  <label className="form-label">Tecnologias / Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="python, opencv, agro, deep learning"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="form-input"
                    style={{ marginBottom: '0.5rem' }}
                  />

                  {/* Chips clicáveis */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Sugestões rápidas:</span>
                    {TAG_SUGGESTIONS.map((tag) => {
                      const isSelected = formTags.toLowerCase().includes(tag.toLowerCase());
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                            backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-muted)',
                            color: isSelected ? 'var(--accent-blue)' : 'var(--text-muted)',
                            fontWeight: isSelected ? 700 : 500,
                            transition: 'all 0.12s ease',
                          }}
                        >
                          {isSelected ? `✓ #${tag}` : `+ #${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.85rem', fontWeight: 700, fontSize: '0.95rem' }}
                  >
                    {formSubmitting
                      ? 'Salvando...'
                      : editingProject
                      ? 'Salvar Alterações do Projeto'
                      : 'Confirmar e Submeter Projeto'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-secondary"
                    style={{ padding: '0.85rem 1.4rem', fontWeight: 700 }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
        {deleteConfirmTarget && (
          <div
            onClick={() => setDeleteConfirmTarget(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              className="card vitrine-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '460px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: 'var(--shadow-lg)',
                textAlign: 'center',
                border: '1px solid var(--border-light)',
              }}
            >
              <div style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Excluir Projeto Definitivamente?
              </h3>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                Tem certeza que deseja remover o projeto <strong>&ldquo;{deleteConfirmTarget.title}&rdquo;</strong>? Esta ação não poderá ser desfeita.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  onClick={handleConfirmDelete}
                  className="btn btn-danger"
                  style={{ flex: 1, padding: '0.75rem', fontWeight: 700 }}
                >
                  Confirmar Exclusão
                </button>
                <button
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.75rem', fontWeight: 700 }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
