'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { AcademicMaterial, CourseType, MaterialType } from '@/lib/types';
import ToastNotification from '@/components/ui/ToastNotification';

interface RAGSource {
  id: string;
  title: string;
  subject: string;
  course: 'IA' | 'ESG';
  semester: number;
  materialType: string;
  fileUrl: string;
  githubUrl?: string | null;
  authorName?: string;
  relevanceScore: number;
  excerpt: string;
}

interface RAGResponseData {
  question: string;
  answer: string;
  sources: RAGSource[];
  confidence: number;
  mode: string;
  latencyMs: number;
}

export default function RepositorioPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'acervo' | 'meus' | 'moderacao'>('acervo');

  // Materiais Gerais (Aprovados)
  const [materials, setMaterials] = useState<AcademicMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  // Meus Materiais
  const [myMaterials, setMyMaterials] = useState<AcademicMaterial[]>([]);
  const [loadingMyMaterials, setLoadingMyMaterials] = useState(false);

  // Moderação CA & ADM
  const [pendingMaterials, setPendingMaterials] = useState<AcademicMaterial[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // Filtros
  const [selectedCourse, setSelectedCourse] = useState<'TODOS' | 'IA' | 'ESG'>('TODOS');
  const [selectedSemester, setSelectedSemester] = useState<number | 'TODOS'>('TODOS');
  const [selectedType, setSelectedType] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // RAG AI
  const [ragQuestion, setRagQuestion] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState<RAGResponseData | null>(null);
  const [ragError, setRagError] = useState('');

  // Modais
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<AcademicMaterial | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<AcademicMaterial | null>(null);

  // Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadCourse, setUploadCourse] = useState<'IA' | 'ESG'>('IA');
  const [uploadSemester, setUploadSemester] = useState<number>(1);
  const [uploadType, setUploadType] = useState<MaterialType>('APOSTILA');
  const [uploadFileUrl, setUploadFileUrl] = useState('');
  const [uploadGithubUrl, setUploadGithubUrl] = useState('');
  const [uploadAuthorName, setUploadAuthorName] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string | null; type: 'success' | 'error' | 'info' }>({
    message: null,
    type: 'success',
  });

  const isPrivileged = currentUser?.role === 'ADMIN' || currentUser?.role === 'CA_MEMBRO' || currentUser?.role === 'PROFESSOR';
  const isCaOrAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'CA_MEMBRO';

  // Buscar usuário logado
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setCurrentUser(d.data);
          setUploadAuthorName(d.data.name || '');
        }
      })
      .catch(() => {});
  }, []);

  // Buscar acervo geral aprovado
  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const params = new URLSearchParams();
      if (selectedCourse !== 'TODOS') params.append('course', selectedCourse);
      if (selectedSemester !== 'TODOS') params.append('semester', selectedSemester.toString());
      if (selectedType !== 'TODOS') params.append('type', selectedType);

      const res = await fetch(`/api/materials?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setMaterials(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar materiais do repositório:', err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  // Buscar materiais do usuário logado
  const fetchMyMaterials = async () => {
    if (!currentUser?.id) return;
    setLoadingMyMaterials(true);
    try {
      const res = await fetch(`/api/materials?author_id=${currentUser.id}&all=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setMyMaterials(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar meus materiais:', err);
    } finally {
      setLoadingMyMaterials(false);
    }
  };

  // Buscar materiais pendentes para CA & ADM
  const fetchPendingMaterials = async () => {
    if (!isCaOrAdmin) return;
    setLoadingPending(true);
    try {
      const res = await fetch('/api/materials?pending=true');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setPendingMaterials(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar materiais pendentes:', err);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [selectedCourse, selectedSemester, selectedType]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchMyMaterials();
      if (isCaOrAdmin) {
        fetchPendingMaterials();
      }
    }
  }, [currentUser, isCaOrAdmin]);

  // Consulta IA RAG
  const handleAskRAG = async (customQuestion?: string) => {
    const q = (customQuestion ?? ragQuestion).trim();
    if (!q) return;
    if (customQuestion) setRagQuestion(customQuestion);

    setRagLoading(true);
    setRagError('');
    try {
      const res = await fetch('/api/ai/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          course: selectedCourse,
          semester: selectedSemester === 'TODOS' ? null : Number(selectedSemester),
          topK: 3,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível consultar o motor RAG.');
      }
      setRagResult(data.data);
    } catch (err: any) {
      setRagError(err.message || 'Erro na consulta ao motor de IA RAG.');
    } finally {
      setRagLoading(false);
    }
  };

  // Download
  const handleDownload = async (id: string, fileUrl: string) => {
    try {
      await fetch(`/api/materials/${id}/download`, { method: 'POST' });
      window.open(fileUrl, '_blank');
      setMaterials((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            const currentCount = m.download_count ?? 0;
            return { ...m, download_count: currentCount + 1 };
          }
          return m;
        })
      );
    } catch {
      window.open(fileUrl, '_blank');
    }
  };

  // Submissão de novo material
  const handleOpenUploadModal = () => {
    setUploadTitle('');
    setUploadDesc('');
    setUploadSubject('');
    setUploadCourse(currentUser?.course === 'ESG' ? 'ESG' : 'IA');
    setUploadSemester(1);
    setUploadType('APOSTILA');
    setUploadFileUrl('');
    setUploadGithubUrl('');
    setUploadAuthorName(currentUser?.name || '');
    setUploadTags('');
    setUploadError('');
    setIsUploadModalOpen(true);
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setToast({ message: 'Efetue login com seu e-mail institucional para submeter materiais.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setUploadError('');

    try {
      const payload = {
        title: uploadTitle,
        description: uploadDesc || null,
        subject: uploadSubject,
        course: uploadCourse,
        semester: Number(uploadSemester),
        material_type: uploadType,
        file_url: uploadFileUrl.trim() || uploadGithubUrl.trim() || '#',
        github_url: uploadGithubUrl.trim() || null,
        author_name: uploadAuthorName.trim() || currentUser.name,
        tags: uploadTags.trim() || null,
      };

      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível cadastrar o material.');
      }

      setIsUploadModalOpen(false);
      setToast({
        message: isPrivileged
          ? 'Material publicado com sucesso no Acervo!'
          : 'Material submetido com sucesso! Aguardando validação do CA.',
        type: 'success',
      });

      fetchMaterials();
      fetchMyMaterials();
      if (isCaOrAdmin) fetchPendingMaterials();
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao submeter material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edição de material existente
  const handleOpenEditModal = (m: AcademicMaterial) => {
    setEditingMaterial(m);
    setUploadTitle(m.title);
    setUploadDesc(m.description || '');
    setUploadSubject(m.subject);
    setUploadCourse(m.course);
    setUploadSemester(m.semester);
    setUploadType(m.material_type);
    setUploadFileUrl(m.file_url === '#' ? '' : m.file_url);
    setUploadGithubUrl(m.github_url || '');
    setUploadAuthorName(m.author_name || '');
    setUploadTags(m.tags || '');
    setUploadError('');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;

    setIsSubmitting(true);
    setUploadError('');

    try {
      const payload = {
        title: uploadTitle,
        description: uploadDesc || null,
        subject: uploadSubject,
        semester: Number(uploadSemester),
        material_type: uploadType,
        file_url: uploadFileUrl.trim() || uploadGithubUrl.trim() || '#',
        github_url: uploadGithubUrl.trim() || null,
        author_name: uploadAuthorName.trim() || currentUser.name,
        tags: uploadTags.trim() || null,
      };

      const res = await fetch(`/api/materials/${editingMaterial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível atualizar o material.');
      }

      setIsEditModalOpen(false);
      setEditingMaterial(null);
      setToast({ message: 'Material acadêmico atualizado com sucesso!', type: 'success' });

      fetchMaterials();
      fetchMyMaterials();
      if (isCaOrAdmin) fetchPendingMaterials();
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao atualizar material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exclusão de material
  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;

    try {
      const res = await fetch(`/api/materials/${deleteConfirmTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao excluir material.');
      }

      setToast({ message: 'Material removido do acervo.', type: 'info' });
      setDeleteConfirmTarget(null);
      fetchMaterials();
      fetchMyMaterials();
      if (isCaOrAdmin) fetchPendingMaterials();
    } catch (err: any) {
      setToast({ message: err.message || 'Erro ao remover material.', type: 'error' });
    }
  };

  // Aprovar publicação (Moderação CA & ADM)
  const handleApproveMaterial = async (m: AcademicMaterial) => {
    try {
      const res = await fetch(`/api/materials/${m.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao aprovar material.');
      }

      setToast({ message: `Material "${m.title}" aprovado e publicado no Acervo!`, type: 'success' });
      fetchMaterials();
      fetchMyMaterials();
      fetchPendingMaterials();
    } catch (err: any) {
      setToast({ message: err.message || 'Erro ao aprovar material.', type: 'error' });
    }
  };

  // Filtro por busca
  const filteredMaterials = materials.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.title.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      (m.description && m.description.toLowerCase().includes(q)) ||
      (m.tags && m.tags.toLowerCase().includes(q)) ||
      (m.author_name && m.author_name.toLowerCase().includes(q))
    );
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'CODIGO':
        return { label: 'Código / Notebook', className: 'material-badge material-badge-codigo' };
      case 'APOSTILA':
        return { label: 'Apostila / PDF', className: 'material-badge material-badge-apostila' };
      case 'SLIDE':
        return { label: 'Apresentação Slide', className: 'material-badge material-badge-slide' };
      case 'TCC':
        return { label: 'Projeto TCC', className: 'material-badge material-badge-tcc' };
      case 'PROJETO':
        return { label: 'Projeto Prático', className: 'material-badge material-badge-codigo' };
      case 'DATASET':
        return { label: 'Conjunto de Dados', className: 'material-badge material-badge-dataset' };
      default:
        return { label: type, className: 'material-badge' };
    }
  };

  return (
    <AppLayout activePath="/repositorio">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Cabeçalho do Repositório Acadêmico */}
        <div
          className="repositorio-header-card"
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
              <span className="badge badge-blue">Central Didática Unificada</span>
              <span className="badge badge-emerald">IA & Gestão ESG</span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Repositório Acadêmico & Acervo Didático
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '720px', lineHeight: 1.6 }}>
              Acesso centralizado a notas de aula, códigos no GitHub, apostilas e projetos práticos. Fim dos materiais dispersos em pastas isoladas do Teams ou Classroom.
            </p>
          </div>

          <button
            onClick={handleOpenUploadModal}
            className="btn btn-emerald"
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
            Enviar Material / Anexo
          </button>
        </div>

        {/* Barra de Navegação em 3 Abas */}
        <div
          className="repositorio-tabs-container"
          style={{
            display: 'flex',
            gap: '0.75rem',
            borderBottom: '2px solid var(--border-light)',
            paddingBottom: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Aba 1: Acervo Geral */}
          <button
            onClick={() => setActiveTab('acervo')}
            className={`repositorio-tab-btn ${activeTab === 'acervo' ? 'active' : ''}`}
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
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            Acervo Didático Geral ({materials.length})
          </button>

          {/* Aba 2: Meus Materiais */}
          <button
            onClick={() => setActiveTab('meus')}
            className={`repositorio-tab-btn ${activeTab === 'meus' ? 'active' : ''}`}
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
            Meus Materiais & Anexos {currentUser && `(${myMaterials.length})`}
          </button>

          {/* Aba 3: Moderação CA & ADM */}
          {isCaOrAdmin && (
            <button
              onClick={() => setActiveTab('moderacao')}
              className={`repositorio-tab-btn ${activeTab === 'moderacao' ? 'active' : ''}`}
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
              {pendingMaterials.length > 0 && (
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
                  {pendingMaterials.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* CONTEÚDO DA ABA 1: ACERVO GERAL */}
        {activeTab === 'acervo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Motor de IA RAG — Tira-Dúvidas Baseado nos PDFs */}
            <div
              className="repositorio-rag-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-blue">Motor de IA RAG (Google Gemini)</span>
                    <span className="badge badge-emerald">Leitura de PDFs & Notebooks</span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Assistente Acadêmico Inteligente — Tire Dúvidas sobre o Acervo
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
                    Pergunte sobre conteúdos das disciplinas do 1º ao 4º semestre. O motor RAG busca nos PDFs, apostilas e códigos do repositório e cita as fontes.
                  </p>
                </div>
              </div>

              {/* Sugestões Rápidas */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  'O que aprendemos em Python no 1º semestre de IA?',
                  'O que significa a sigla ESG e os ODS da ONU no 1º semestre?',
                  'Quais são os 3 escopos de pegada de carbono nos relatórios ESG?',
                  'Como funciona Machine Learning Supervisionado e validação cruzada?',
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAskRAG(sample)}
                    className="repositorio-sample-pill"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskRAG();
                }}
                style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
              >
                <input
                  type="text"
                  value={ragQuestion}
                  onChange={(e) => setRagQuestion(e.target.value)}
                  placeholder="Digite sua dúvida acadêmica (ex.: Como calcular pegada de carbono ou configurar Python no 1º semestre?)"
                  className="form-input"
                  style={{ flex: '1 1 280px', padding: '0.75rem 1rem', borderRadius: '10px' }}
                />
                <button
                  type="submit"
                  disabled={ragLoading || !ragQuestion.trim()}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.4rem', fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  {ragLoading ? 'Consultando PDFs...' : 'Perguntar à IA RAG'}
                </button>
              </form>

              {ragError && (
                <div className="alert-box alert-error" style={{ marginTop: '0.25rem' }}>
                  <div>{ragError}</div>
                </div>
              )}

              {ragResult && (
                <div
                  className="repositorio-rag-result"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                      Resposta Fundamentada nos Arquivos do Repositório ({ragResult.sources.length} fontes citadas)
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Modo: {ragResult.mode} • {ragResult.latencyMs}ms
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                    {ragResult.answer}
                  </div>

                  {ragResult.sources.length > 0 && (
                    <div style={{ borderTop: '1px dashed var(--border-light)', paddingTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Fontes e PDFs Consultados pelo RAG:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
                        {ragResult.sources.map((src) => (
                          <div
                            key={src.id}
                            style={{
                              padding: '0.65rem 0.85rem',
                              borderRadius: '10px',
                              backgroundColor: 'var(--bg-muted)',
                              border: '1px solid var(--border-light)',
                              fontSize: '0.78rem',
                            }}
                          >
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{src.title}</div>
                            <div style={{ color: 'var(--accent-emerald)', fontWeight: 600, marginTop: '0.15rem' }}>
                              {src.subject} • {src.course} ({src.semester}º Sem)
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                              Arquivo: {src.fileUrl}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Barra de Filtros */}
            <div
              className="repositorio-filter-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(['TODOS', 'IA', 'ESG'] as const).map((course) => {
                    const isSelected = selectedCourse === course;
                    const label = course === 'TODOS' ? 'Todos os Cursos' : course === 'IA' ? 'Inteligência Artificial' : 'Gestão ESG';
                    return (
                      <button
                        key={course}
                        onClick={() => setSelectedCourse(course)}
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
                    placeholder="Buscar disciplina, matéria, código, tag..."
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
                    const isSelected = selectedSemester === sem;
                    return (
                      <button
                        key={String(sem)}
                        onClick={() => setSelectedSemester(sem)}
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
                    { id: 'APOSTILA', label: 'Apostilas' },
                    { id: 'CODIGO', label: 'Códigos' },
                    { id: 'TCC', label: 'TCCs' },
                    { id: 'SLIDE', label: 'Slides' },
                  ].map((t) => {
                    const isSelected = selectedType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={`repositorio-type-btn ${isSelected ? 'active' : ''}`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Grade de Materiais */}
            {loadingMaterials ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                Sincronizando acervo acadêmico com a base de dados...
              </div>
            ) : filteredMaterials.length === 0 ? (
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
                  Nenhum material didático encontrado para estes filtros
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                  Compartilhe uma apostila, código ou projeto de aula com a comunidade acadêmica!
                </p>
                <button
                  onClick={handleOpenUploadModal}
                  className="btn btn-primary"
                  style={{ marginTop: '1.25rem', padding: '0.6rem 1.25rem' }}
                >
                  Publicar Material
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {filteredMaterials.map((mat) => {
                  const typeBadge = getTypeBadge(mat.material_type);
                  const dlCount = mat.download_count ?? 0;

                  return (
                    <div
                      key={mat.id}
                      className="card-interactive"
                      style={{
                        padding: '1.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '1px solid var(--border-light)',
                        borderRadius: '16px',
                        backgroundColor: 'var(--bg-primary)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <span className={typeBadge.className}>
                            {typeBadge.label}
                          </span>

                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <span className="badge badge-blue">{mat.course}</span>
                            <span className="badge" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                              {mat.semester}º Sem
                            </span>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {mat.subject}
                        </div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem', lineHeight: 1.35 }}>
                          {mat.title}
                        </h3>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.65rem', lineHeight: 1.5, minHeight: '3.6rem' }}>
                          {mat.description || 'Material acadêmico disponibilizado para consulta discente da FATEC Rio Claro.'}
                        </p>

                        {mat.tags && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.85rem' }}>
                            {mat.tags.split(',').map((tag, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '0.72rem',
                                  backgroundColor: 'var(--bg-muted)',
                                  color: 'var(--text-muted)',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                }}
                              >
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          {dlCount} downloads
                        </span>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {mat.github_url && (
                            <a
                              href={mat.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary"
                              style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                              title="Repositório no GitHub"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                              </svg>
                              Git
                            </a>
                          )}
                          <button
                            onClick={() => handleDownload(mat.id, mat.file_url)}
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1.15rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Baixar Arquivo
                          </button>

                          {/* Controles para CA, ADM ou Autor */}
                          {(isCaOrAdmin || (currentUser && currentUser.id === mat.author_id)) && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(mat)}
                                className="btn btn-secondary"
                                style={{
                                  padding: '0.45rem 0.75rem',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                                title="Editar material (Acesso CA / ADM / Autor)"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 20h9"></path>
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                                Editar
                              </button>
                              <button
                                onClick={() => setDeleteConfirmTarget(mat)}
                                className="btn btn-danger-outline"
                                style={{
                                  padding: '0.45rem 0.75rem',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                                title="Excluir material (Acesso CA / ADM / Autor)"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Excluir
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CONTEÚDO DA ABA 2: MEUS MATERIAIS */}
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
                  Efetue login com seu e-mail institucional @fatec.sp.gov.br para gerenciar suas apostilas e anexos submetidos.
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
                      Gerencie seus materiais acadêmicos enviados e acompanhe o status de moderação.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenUploadModal}
                    className="btn btn-emerald"
                    style={{ padding: '0.65rem 1.25rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Novo Material
                  </button>
                </div>

                {loadingMyMaterials ? (
                  <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                    Buscando seus materiais submetidos...
                  </div>
                ) : myMaterials.length === 0 ? (
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
                      Você ainda não submeteu nenhum material didático
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                      Compartilhe apostilas, resumos e códigos com seus colegas de curso.
                    </p>
                    <button
                      onClick={handleOpenUploadModal}
                      className="btn btn-primary"
                      style={{ marginTop: '1.25rem', padding: '0.65rem 1.4rem' }}
                    >
                      Publicar Primeiro Material
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {myMaterials.map((m) => {
                      const isApproved = m.is_approved;
                      return (
                        <div
                          key={m.id}
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

                              <span className="badge badge-blue">{m.course}</span>
                              <span className="badge" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                                {m.semester}º Sem
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {m.material_type}
                              </span>
                            </div>

                            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                              {m.title}
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', lineHeight: 1.4, maxWidth: '640px' }}>
                              {m.description || m.subject}
                            </p>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                              onClick={() => handleOpenEditModal(m)}
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
                              onClick={() => setDeleteConfirmTarget(m)}
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
                <span className="badge badge-amber">Fila de Curadoria de Conteúdo</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Exclusivo: Centro Acadêmico (CA) & Administração</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Moderação de Materiais Didáticos e Anexos
              </h3>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '780px', lineHeight: 1.5 }}>
                Avalie materiais, apostilas e anexos enviados pelos estudantes antes que sejam liberados no acervo público. Submissões do CA ou Docentes são aprovadas automaticamente.
              </p>
            </div>

            {loadingPending ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                Carregando materiais pendentes de aprovação...
              </div>
            ) : pendingMaterials.length === 0 ? (
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
                  Fila Limpa! Nenhum material pendente de moderação
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                  Todos os materiais submetidos foram devidamente revisados e publicados.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingMaterials.map((m) => (
                  <div
                    key={m.id}
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
                          <span className="badge badge-blue">{m.course}</span>
                          <span className="badge" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                            {m.semester}º Semestre
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {m.material_type}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {m.title}
                        </h4>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '0.15rem' }}>
                          Disciplina: {m.subject}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <div><strong>Enviado por:</strong> {m.author_name || 'Aluno'}</div>
                        <div style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>
                          {new Date(m.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      {m.description || 'Sem descrição fornecida.'}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--bg-muted)', fontSize: '0.8rem' }}>
                      {m.file_url && m.file_url !== '#' && (
                        <div>
                          <strong>Arquivo / Anexo:</strong>{' '}
                          <a href={m.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-emerald)', textDecoration: 'underline' }}>
                            {m.file_url}
                          </a>
                        </div>
                      )}
                      {m.github_url && (
                        <div>
                          <strong>GitHub:</strong>{' '}
                          <a href={m.github_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
                            {m.github_url}
                          </a>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleOpenEditModal(m)}
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
                        onClick={() => setDeleteConfirmTarget(m)}
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
                        onClick={() => handleApproveMaterial(m)}
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

        {/* MODAL DE SUBMISSÃO / ENVIO DE MATERIAL */}
        {isUploadModalOpen && (
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
              className="card repositorio-upload-modal"
              style={{
                width: '100%',
                maxWidth: '580px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '20px',
                padding: '2.25rem 2rem',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid var(--border-light)',
              }}
            >
              <button
                onClick={() => setIsUploadModalOpen(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>

              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-emerald">Submissão Acadêmica</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                  Publicar Material Didático ou Anexo
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {isPrivileged
                    ? 'Aprovação imediata: Como CA/Admin/Docente, o material será publicado instantaneamente.'
                    : 'Submissão discente: Seu arquivo passará pela moderação do CA antes de figurar no acervo público.'}
                </p>
              </div>

              {uploadError && (
                <div className="alert-box alert-error" style={{ marginBottom: '1rem' }}>
                  <div>{uploadError}</div>
                </div>
              )}

              <form onSubmit={handleCreateMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Título do Material *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Roteiro Prático: Regressão Linear com Scikit-Learn"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Disciplina / Matéria *</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Aprendizado de Máquina"
                      value={uploadSubject}
                      onChange={(e) => setUploadSubject(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Curso *</label>
                    <select
                      value={uploadCourse}
                      onChange={(e) => setUploadCourse(e.target.value as any)}
                      className="form-select"
                    >
                      <option value="IA">Inteligência Artificial (Mat.)</option>
                      <option value="ESG">Gestão ESG (Not.)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Semestre *</label>
                    <select
                      value={uploadSemester}
                      onChange={(e) => setUploadSemester(Number(e.target.value))}
                      className="form-select"
                    >
                      <option value={1}>1º Semestre</option>
                      <option value={2}>2º Semestre</option>
                      <option value={3}>3º Semestre</option>
                      <option value={4}>4º Semestre</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tipo de Material *</label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as any)}
                      className="form-select"
                    >
                      <option value="APOSTILA">Apostila / PDF</option>
                      <option value="CODIGO">Código-Fonte / Notebook</option>
                      <option value="TCC">Projeto de TCC / Artigo</option>
                      <option value="SLIDE">Slides de Aula</option>
                      <option value="DATASET">Dataset / CSV</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição Resumida</label>
                  <textarea
                    placeholder="Conteúdo abordado, objetivos ou instruções de execução..."
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    className="form-input"
                    style={{ height: '70px', resize: 'vertical' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Link do Arquivo (PDF / Drive / Nuvem) *</label>
                  <input
                    type="text"
                    required
                    placeholder="https://drive.google.com/... ou link direto do arquivo"
                    value={uploadFileUrl}
                    onChange={(e) => setUploadFileUrl(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Link do GitHub (Opcional)</label>
                    <input
                      type="url"
                      placeholder="https://github.com/usuario/repositorio"
                      value={uploadGithubUrl}
                      onChange={(e) => setUploadGithubUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Autor / Docente / Turma</label>
                    <input
                      type="text"
                      placeholder="ex: Prof. Carlos / Luis Otavio"
                      value={uploadAuthorName}
                      onChange={(e) => setUploadAuthorName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="python, machine-learning, scikit-learn"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-emerald"
                    style={{ flex: 1, padding: '0.8rem', fontWeight: 700 }}
                  >
                    {isSubmitting ? 'Salvando...' : 'Confirmar e Publicar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
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

        {/* MODAL DE EDIÇÃO DE MATERIAL EXISTENTE */}
        {isEditModalOpen && editingMaterial && (
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
              className="card repositorio-upload-modal"
              style={{
                width: '100%',
                maxWidth: '580px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '20px',
                padding: '2.25rem 2rem',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid var(--border-light)',
              }}
            >
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingMaterial(null);
                }}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>

              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-blue">Edição de Material</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                  Editar Informações do Material
                </h2>
              </div>

              {uploadError && (
                <div className="alert-box alert-error" style={{ marginBottom: '1rem' }}>
                  <div>{uploadError}</div>
                </div>
              )}

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Título do Material *</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Semestre *</label>
                    <select
                      value={uploadSemester}
                      onChange={(e) => setUploadSemester(Number(e.target.value))}
                      className="form-select"
                    >
                      <option value={1}>1º Semestre</option>
                      <option value={2}>2º Semestre</option>
                      <option value={3}>3º Semestre</option>
                      <option value={4}>4º Semestre</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tipo de Material *</label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as any)}
                      className="form-select"
                    >
                      <option value="APOSTILA">Apostila / PDF</option>
                      <option value="CODIGO">Código-Fonte / Notebook</option>
                      <option value="TCC">Projeto de TCC / Artigo</option>
                      <option value="SLIDE">Slides de Aula</option>
                      <option value="DATASET">Dataset / CSV</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição Resumida</label>
                  <textarea
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    className="form-input"
                    style={{ height: '70px', resize: 'vertical' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Link do Arquivo *</label>
                  <input
                    type="text"
                    required
                    value={uploadFileUrl}
                    onChange={(e) => setUploadFileUrl(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Link do GitHub</label>
                    <input
                      type="url"
                      value={uploadGithubUrl}
                      onChange={(e) => setUploadGithubUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Autor / Nome</label>
                    <input
                      type="text"
                      value={uploadAuthorName}
                      onChange={(e) => setUploadAuthorName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-emerald"
                    style={{ flex: 1, padding: '0.8rem', fontWeight: 700 }}
                  >
                    {isSubmitting ? 'Salvando...' : 'Atualizar Material'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingMaterial(null);
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
              className="card repositorio-upload-modal"
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
                Excluir Material Definitivamente?
              </h3>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                Tem certeza que deseja remover o material <strong>&ldquo;{deleteConfirmTarget.title}&rdquo;</strong> do repositório?
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
