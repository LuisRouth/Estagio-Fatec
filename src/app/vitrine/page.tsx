'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { AcademicMaterial, CourseType } from '@/lib/types';
import ToastNotification from '@/components/ui/ToastNotification';

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

  // Modais
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AcademicMaterial | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<AcademicMaterial | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formCourse, setFormCourse] = useState<CourseType>('IA');
  const [formSemester, setFormSemester] = useState<number>(1);
  const [formType, setFormType] = useState<'PROJETO' | 'TCC'>('PROJETO');
  const [formGithubUrl, setFormGithubUrl] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDemoUrl, setFormDemoUrl] = useState('');
  const [formAuthorName, setFormAuthorName] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string | null; type: 'success' | 'error' | 'info' }>({
    message: null,
    type: 'success',
  });

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

  // Carregar projetos da galeria pública
  const fetchPublicProjects = async () => {
    setLoadingProjects(true);
    try {
      const params = new URLSearchParams();
      if (courseFilter !== 'TODOS') params.append('course', courseFilter);
      if (semesterFilter !== 'TODOS') params.append('semester', semesterFilter.toString());
      if (typeFilter !== 'TODOS') {
        params.append('type', typeFilter);
      }

      const res = await fetch(`/api/materials?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          // Na vitrine, exibimos projetos e TCCs
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
      const res = await fetch(`/api/materials?author_id=${currentUser.id}&all=true`);
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
      const res = await fetch('/api/materials?pending=true');
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

  // Abertura do modal de criação
  const handleOpenSubmitModal = () => {
    setFormTitle('');
    setFormDesc('');
    setFormSubject('');
    setFormCourse(currentUser?.course === 'ESG' ? 'ESG' : 'IA');
    setFormSemester(1);
    setFormType('PROJETO');
    setFormGithubUrl('');
    setFormFileUrl('');
    setFormImageUrl('');
    setFormDemoUrl('');
    setFormAuthorName(currentUser?.name || '');
    setFormTags('');
    setFormError('');
    setIsSubmitModalOpen(true);
  };

  // Abertura do modal de edição
  const handleOpenEditModal = (p: AcademicMaterial) => {
    setEditingProject(p);
    setFormTitle(p.title);
    setFormDesc(p.description || '');
    setFormSubject(p.subject);
    setFormCourse(p.course);
    setFormSemester(p.semester);
    setFormType(p.material_type === 'TCC' ? 'TCC' : 'PROJETO');
    setFormGithubUrl(p.github_url || '');
    setFormFileUrl(p.file_url === '#' ? '' : p.file_url);
    setFormImageUrl(p.image_url || '');
    setFormDemoUrl(p.demo_url || '');
    setFormAuthorName(p.author_name || '');
    setFormTags(p.tags || '');
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Submissão de novo projeto
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setToast({ message: 'Efetue login com seu e-mail institucional para submeter projetos.', type: 'error' });
      return;
    }

    setFormSubmitting(true);
    setFormError('');

    try {
      const payload = {
        title: formTitle,
        description: formDesc || null,
        subject: formSubject,
        course: formCourse,
        semester: Number(formSemester),
        material_type: formType,
        github_url: formGithubUrl.trim() || null,
        file_url: formFileUrl.trim() || formGithubUrl.trim() || '#',
        image_url: formImageUrl.trim() || null,
        demo_url: formDemoUrl.trim() || null,
        author_name: formAuthorName.trim() || currentUser.name,
        tags: formTags.trim() || null,
      };

      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível cadastrar o projeto.');
      }

      setIsSubmitModalOpen(false);
      setToast({
        message: isPrivileged
          ? 'Projeto publicado com sucesso na Vitrine!'
          : 'Projeto submetido com sucesso! Aguardando validação do CA.',
        type: 'success',
      });

      fetchPublicProjects();
      fetchMyProjects();
      if (isCaOrAdmin) fetchPendingProjects();
    } catch (err: any) {
      setFormError(err.message || 'Falha ao cadastrar projeto.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Salvar edição de projeto existente
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setFormSubmitting(true);
    setFormError('');

    try {
      const payload = {
        title: formTitle,
        description: formDesc || null,
        subject: formSubject,
        semester: Number(formSemester),
        material_type: formType,
        github_url: formGithubUrl.trim() || null,
        file_url: formFileUrl.trim() || formGithubUrl.trim() || '#',
        image_url: formImageUrl.trim() || null,
        demo_url: formDemoUrl.trim() || null,
        author_name: formAuthorName.trim() || currentUser.name,
        tags: formTags.trim() || null,
      };

      const res = await fetch(`/api/materials/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível atualizar o projeto.');
      }

      setIsEditModalOpen(false);
      setEditingProject(null);
      setToast({ message: 'Projeto atualizado com sucesso!', type: 'success' });

      fetchPublicProjects();
      fetchMyProjects();
      if (isCaOrAdmin) fetchPendingProjects();
    } catch (err: any) {
      setFormError(err.message || 'Falha ao atualizar projeto.');
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

      setToast({ message: 'Projeto removido com sucesso.', type: 'info' });
      setDeleteConfirmTarget(null);
      fetchPublicProjects();
      fetchMyProjects();
      if (isCaOrAdmin) fetchPendingProjects();
    } catch (err: any) {
      setToast({ message: err.message || 'Erro ao remover projeto.', type: 'error' });
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

      setToast({ message: `Projeto "${p.title}" aprovado e publicado na Vitrine!`, type: 'success' });
      fetchPublicProjects();
      fetchMyProjects();
      fetchPendingProjects();
    } catch (err: any) {
      setToast({ message: err.message || 'Erro ao aprovar projeto.', type: 'error' });
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
            onClick={handleOpenSubmitModal}
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
            Submeter Projeto / Anexo
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
            {/* Barra de Filtros Multifatoriais */}
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
              {/* Cursos e Busca */}
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

              {/* Semestres e Tipo */}
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
                  Nenhum projeto encontrado para estes filtros
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                  Compartilhe os trabalhos práticos ou o TCC da sua turma com a comunidade acadêmica!
                </p>
                <button
                  onClick={handleOpenSubmitModal}
                  className="btn btn-primary"
                  style={{ marginTop: '1.25rem', padding: '0.6rem 1.25rem' }}
                >
                  Submeter Primeiro Projeto
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {filteredProjects.map((p) => {
                  const isIA = p.course === 'IA';
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
                      {/* Banner Superior Tecnológico */}
                      <div
                        className="vitrine-card-banner"
                        style={{
                          height: '130px',
                          background: p.image_url
                            ? `url(${p.image_url}) center/cover no-repeat`
                            : isIA
                            ? 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 50%, #0f172a 100%)'
                            : 'linear-gradient(135deg, #065f46 0%, #047857 50%, #0f172a 100%)',
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

                        <div>
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
                          {p.description || 'Projeto discente desenvolvido no ciclo de formação acadêmica da FATEC Rio Claro.'}
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

                      {/* Rodapé com Links de Acesso e Controles Administrativos */}
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
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {p.github_url && (
                            <a
                              href={p.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary"
                              style={{
                                padding: '0.45rem 0.85rem',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                              title="Ver código no GitHub"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                              </svg>
                              GitHub
                            </a>
                          )}

                          {p.file_url && p.file_url !== '#' && (
                            <a
                              href={p.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary"
                              style={{
                                padding: '0.45rem 0.85rem',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                              title="Acessar Documento / Artigo"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                              </svg>
                              Docs / PDF
                            </a>
                          )}

                          {p.demo_url && (
                            <a
                              href={p.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-emerald"
                              style={{
                                padding: '0.45rem 0.85rem',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              Demo
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7 7 17 7 17 17"></polyline>
                              </svg>
                            </a>
                          )}
                        </div>

                        {/* Controles de Gestão para CA, ADM ou Autor */}
                        {(isCaOrAdmin || (currentUser && currentUser.id === p.author_id)) && (
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="btn btn-secondary"
                              style={{
                                padding: '0.42rem 0.75rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
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
                                padding: '0.42rem 0.75rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
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
                  Efetue login com seu e-mail institucional @fatec.sp.gov.br para gerenciar seus projetos enviados, acompanhar aprovações e anexar links de repositórios.
                </p>
                <a href="/login" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
                  Acessar com E-mail FATEC
                </a>
              </div>
            ) : (
              <>
                {/* Resumo do Estudante */}
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
                    onClick={handleOpenSubmitModal}
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
                      Publique seus trabalhos práticos das disciplinas do 1º ao 4º semestre de IA ou ESG.
                    </p>
                    <button
                      onClick={handleOpenSubmitModal}
                      className="btn btn-primary"
                      style={{ marginTop: '1.25rem', padding: '0.65rem 1.4rem' }}
                    >
                      Cadastrar Meu Primeiro Projeto
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
                              {p.demo_url && <span>Demo: <a href={p.demo_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-emerald)', textDecoration: 'underline' }}>{p.demo_url}</a></span>}
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
                Revise os projetos e anexos enviados pelos estudantes antes que fiquem visíveis para o público geral na Vitrine. Projetos submetidos diretamente por membros do CA ou Administradores são aprovados automaticamente.
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
                      {p.file_url && p.file_url !== '#' && (
                        <div>
                          <strong>Arquivo / Docs:</strong>{' '}
                          <a href={p.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-emerald)', textDecoration: 'underline' }}>
                            {p.file_url}
                          </a>
                        </div>
                      )}
                      {p.demo_url && (
                        <div>
                          <strong>Demonstração:</strong>{' '}
                          <a href={p.demo_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-purple)', textDecoration: 'underline' }}>
                            {p.demo_url}
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

        {/* MODAL DE SUBMISSÃO / CADASTRO DE NOVO PROJETO */}
        {isSubmitModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              zIndex: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              className="card vitrine-modal"
              style={{
                width: '100%',
                maxWidth: '620px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '20px',
                padding: '2.25rem 2rem',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                maxHeight: '92vh',
                overflowY: 'auto',
                border: '1px solid var(--border-light)',
              }}
            >
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
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
                <span className="badge badge-emerald">Galeria Discente & TCC</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                  Submeter Projeto ou Trabalho
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {isPrivileged
                    ? 'Aprovação imediata: Como CA/Admin/Docente, seu projeto será publicado instantaneamente.'
                    : 'Submissão discente: Seu projeto passará pela curadoria do CA antes de ser exibido na galeria pública.'}
                </p>
              </div>

              {formError && (
                <div className="alert-box alert-error" style={{ marginBottom: '1rem' }}>
                  <div>{formError}</div>
                </div>
              )}

              <form onSubmit={handleSubmitProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                      onChange={(e) => setFormSemester(Number(e.target.value))}
                      className="form-select"
                    >
                      <option value={1}>1º Semestre</option>
                      <option value={2}>2º Semestre</option>
                      <option value={3}>3º Semestre</option>
                      <option value={4}>4º Semestre</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Disciplina / Matéria *</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Visão Computacional / Redes Neurais"
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
                  <label className="form-label">Descrição Resumida do Projeto *</label>
                  <textarea
                    required
                    placeholder="Descreva a motivação, arquitetura técnica, bibliotecas utilizadas e resultados alcançados..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="form-input"
                    style={{ height: '80px', resize: 'vertical' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Link do Repositório no GitHub (Recomendado)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/usuario/meu-projeto"
                    value={formGithubUrl}
                    onChange={(e) => setFormGithubUrl(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Link do PDF / Artigo / Docs</label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... ou link direto"
                      value={formFileUrl}
                      onChange={(e) => setFormFileUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Link da Demo / Aplicação Web</label>
                    <input
                      type="url"
                      placeholder="https://meu-app.streamlit.app"
                      value={formDemoUrl}
                      onChange={(e) => setFormDemoUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Banner / Imagem do Projeto (URL)</label>
                    <input
                      type="url"
                      placeholder="https://imgur.com/... ou imagem direta"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nome dos Autores / Integrantes *</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Luis Otavio & Turma IA"
                      value={formAuthorName}
                      onChange={(e) => setFormAuthorName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tecnologias / Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="python, scikit-learn, pytorch, opencv"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.8rem', fontWeight: 700 }}
                  >
                    {formSubmitting ? 'Salvando...' : 'Confirmar e Submeter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="btn btn-secondary"
                    style={{ padding: '0.8rem 1.25rem', fontWeight: 700 }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE EDIÇÃO DE PROJETO EXISTENTE */}
        {isEditModalOpen && editingProject && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              zIndex: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              className="card vitrine-modal"
              style={{
                width: '100%',
                maxWidth: '620px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '20px',
                padding: '2.25rem 2rem',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                maxHeight: '92vh',
                overflowY: 'auto',
                border: '1px solid var(--border-light)',
              }}
            >
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProject(null);
                }}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
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
                <span className="badge badge-blue">Edição de Projeto</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                  Editar Informações do Projeto
                </h2>
              </div>

              {formError && (
                <div className="alert-box alert-error" style={{ marginBottom: '1rem' }}>
                  <div>{formError}</div>
                </div>
              )}

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Título do Projeto *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Semestre *</label>
                    <select
                      value={formSemester}
                      onChange={(e) => setFormSemester(Number(e.target.value))}
                      className="form-select"
                    >
                      <option value={1}>1º Semestre</option>
                      <option value={2}>2º Semestre</option>
                      <option value={3}>3º Semestre</option>
                      <option value={4}>4º Semestre</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Modalidade *</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="form-select"
                    >
                      <option value="PROJETO">Projeto Prático</option>
                      <option value="TCC">Trabalho de Conclusão (TCC)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição Resumida</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="form-input"
                    style={{ height: '80px', resize: 'vertical' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Link do GitHub</label>
                  <input
                    type="url"
                    value={formGithubUrl}
                    onChange={(e) => setFormGithubUrl(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Link do Arquivo / PDF</label>
                    <input
                      type="url"
                      value={formFileUrl}
                      onChange={(e) => setFormFileUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Link da Demo</label>
                    <input
                      type="url"
                      value={formDemoUrl}
                      onChange={(e) => setFormDemoUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Banner / Imagem (URL)</label>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nome dos Integrantes</label>
                    <input
                      type="text"
                      value={formAuthorName}
                      onChange={(e) => setFormAuthorName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.8rem', fontWeight: 700 }}
                  >
                    {formSubmitting ? 'Salvando...' : 'Atualizar Projeto'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingProject(null);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.8rem 1.25rem', fontWeight: 700 }}
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
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              zIndex: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              className="card vitrine-modal"
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

        {/* Toast Notificação */}
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null, type: 'success' })}
        />

      </div>
    </AppLayout>
  );
}
