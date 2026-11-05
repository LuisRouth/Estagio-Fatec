'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';

interface AcademicMaterial {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  course: 'IA' | 'ESG';
  semester: number;
  material_type: 'SLIDE' | 'APOSTILA' | 'CODIGO' | 'TCC' | 'DATASET';
  file_url: string;
  github_url: string | null;
  tags: string | null;
  downloads_count: number;
  author_name?: string;
  created_at: string;
}

export default function RepositorioPage() {
  const [materials, setMaterials] = useState<AcademicMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [selectedCourse, setSelectedCourse] = useState<'TODOS' | 'IA' | 'ESG'>('TODOS');
  const [selectedSemester, setSelectedSemester] = useState<number | 'TODOS'>('TODOS');
  const [selectedType, setSelectedType] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal de Upload / Submissão
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadCourse, setUploadCourse] = useState<'IA' | 'ESG'>('IA');
  const [uploadSemester, setUploadSemester] = useState<number>(1);
  const [uploadType, setUploadType] = useState<'SLIDE' | 'APOSTILA' | 'CODIGO' | 'TCC' | 'DATASET'>('APOSTILA');
  const [uploadFileUrl, setUploadFileUrl] = useState('');
  const [uploadGithubUrl, setUploadGithubUrl] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, [selectedCourse, selectedSemester, selectedType]);

  const fetchMaterials = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleDownload = async (id: string, fileUrl: string) => {
    try {
      await fetch(`/api/materials/${id}/download`, { method: 'POST' });
      // Abre o arquivo ou simula download
      window.open(fileUrl, '_blank');
      // Atualiza contador local
      setMaterials((prev) =>
        prev.map((m) => (m.id === id ? { ...m, downloads_count: (m.downloads_count || 0) + 1 } : m))
      );
    } catch {
      window.open(fileUrl, '_blank');
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadError('');

    try {
      const payload = {
        title: uploadTitle,
        description: uploadDesc,
        subject: uploadSubject,
        course: uploadCourse,
        semester: Number(uploadSemester),
        material_type: uploadType,
        file_url: uploadFileUrl || `https://fatec.rc.gov.br/materials/${uploadTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        github_url: uploadGithubUrl || null,
        tags: uploadTags || null,
      };

      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível cadastrar o material. Verifique seu login.');
      }

      setUploadSuccess(true);
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess(false);
        fetchMaterials();
      }, 1500);
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao submeter material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.tags && m.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'CODIGO':
        return { label: 'Código / Notebook', color: '#0284c7', bg: '#e0f2fe', icon: '💻' };
      case 'APOSTILA':
        return { label: 'Apostila / PDF', color: '#059669', bg: '#d1fae5', icon: '📄' };
      case 'SLIDE':
        return { label: 'Apresentação Slide', color: '#d97706', bg: '#fef3c7', icon: '📊' };
      case 'TCC':
        return { label: 'Projeto TCC', color: '#7c3aed', bg: '#ede9fe', icon: '🎓' };
      case 'DATASET':
        return { label: 'Conjunto de Dados', color: '#0891b2', bg: '#cffafe', icon: '🗄️' };
      default:
        return { label: type, color: '#64748b', bg: '#f1f5f9', icon: '📁' };
    }
  };

  return (
    <AppLayout activePath="/repositorio">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Cabeçalho do Repositório Acadêmico */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            padding: '2.25rem 2rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">Central Didática Unificada</span>
              <span className="badge badge-emerald">IA & Gestão ESG</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Acervo Atualizado 2026</span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Repositório Acadêmico & Vitrine de Projetos
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '720px', lineHeight: 1.6 }}>
              Acesso centralizado a notas de aula, códigos no GitHub, apostilas e projetos práticos de conclusão de curso. Fim dos materiais dispersos em pastas isoladas do Teams ou Classroom.
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn btn-emerald"
            style={{ padding: '0.8rem 1.4rem', fontSize: '0.95rem', fontWeight: 700 }}
          >
            📤 Enviar Novo Material / TCC
          </button>
        </div>

        {/* Barra de Filtros Multifatoriais (Curso, Semestre, Tipo e Busca) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Seletor Superior: Curso e Semestre */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['TODOS', 'IA', 'ESG'] as const).map((course) => {
                const isSelected = selectedCourse === course;
                const label = course === 'TODOS' ? 'Todos os Cursos' : course === 'IA' ? '🤖 Inteligência Artificial' : '🌱 Gestão ESG';
                return (
                  <button
                    key={course}
                    onClick={() => setSelectedCourse(course)}
                    style={{
                      border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--accent-blue-light)' : '#ffffff',
                      color: isSelected ? 'var(--accent-blue-hover)' : 'var(--text-main)',
                      fontWeight: isSelected ? 700 : 500,
                      padding: '0.55rem 1.15rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Campo de Busca Livre */}
            <div style={{ minWidth: '280px', flex: '1 1 280px', maxWidth: '420px' }}>
              <input
                type="text"
                placeholder="🔍 Buscar disciplina, matéria, TCC, tag..."
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.65rem 1rem', borderRadius: '10px' }}
              />
            </div>
          </div>

          {/* Seletor Inferior: Semestre e Tipo de Material */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
            {/* Semestres */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Semestre:</span>
              {(['TODOS', 1, 2, 3, 4] as const).map((sem) => {
                const isSelected = selectedSemester === sem;
                return (
                  <button
                    key={String(sem)}
                    onClick={() => setSelectedSemester(sem)}
                    style={{
                      border: isSelected ? '1px solid var(--accent-emerald)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--accent-emerald-light)' : '#ffffff',
                      color: isSelected ? 'var(--accent-emerald)' : 'var(--text-main)',
                      fontWeight: isSelected ? 700 : 500,
                      padding: '0.35rem 0.85rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    {sem === 'TODOS' ? 'Todos' : `${sem}º Sem`}
                  </button>
                );
              })}
            </div>

            {/* Formato / Tipo */}
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
                    style={{
                      border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--bg-muted)' : '#ffffff',
                      color: isSelected ? 'var(--accent-blue)' : 'var(--text-sub)',
                      fontWeight: isSelected ? 700 : 500,
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lista / Grade de Materiais */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s infinite linear' }}>📚</div>
            Sincronizando repositório acadêmico com a base de dados...
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '4rem 2rem',
              textAlign: 'center',
              border: '1px dashed var(--border-light)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Nenhum material didático encontrado para estes filtros
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
              Seja o primeiro a compartilhar uma apostila, código ou projeto de TCC!
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
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

              return (
                <div
                  key={mat.id}
                  className="card-interactive"
                  style={{
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Header do Card com Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <span
                        className="badge"
                        style={{ backgroundColor: typeBadge.bg, color: typeBadge.color, fontWeight: 700 }}
                      >
                        {typeBadge.icon} {typeBadge.label}
                      </span>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <span className="badge badge-blue">{mat.course}</span>
                        <span className="badge" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                          {mat.semester}º Sem
                        </span>
                      </div>
                    </div>

                    {/* Disciplina e Título */}
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {mat.subject}
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem', lineHeight: 1.35 }}>
                      {mat.title}
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.65rem', lineHeight: 1.5, minHeight: '3.6rem' }}>
                      {mat.description || 'Material acadêmico disponibilizado para consulta discente da FATEC Rio Claro.'}
                    </p>

                    {/* Tags */}
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

                  {/* Rodapé com Download e GitHub */}
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      📥 {mat.downloads_count || 0} downloads
                    </span>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {mat.github_url && (
                        <a
                          href={mat.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
                          title="Repositório no GitHub"
                        >
                          🐙 Git
                        </a>
                      )}
                      <button
                        onClick={() => handleDownload(mat.id, mat.file_url)}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1.15rem', fontSize: '0.825rem' }}
                      >
                        Baixar Arquivo
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Envio / Cadastro de Material */}
        {isUploadModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              zIndex: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '560px',
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '2.25rem 2rem',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <button
                onClick={() => setIsUploadModalOpen(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>

              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-emerald">Submissão Discente / Docente</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                  Publicar Material ou TCC
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Compartilhe apostilas, códigos e projetos com a comunidade acadêmica.
                </p>
              </div>

              {uploadSuccess ? (
                <div className="alert-box alert-success" style={{ textAlign: 'center', display: 'block', padding: '2rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Material Publicado com Sucesso!</div>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    O material já está catalogado e disponível para consulta discente.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateMaterial}>
                  {uploadError && (
                    <div className="alert-box alert-error">
                      <span>⚠️</span>
                      <div>{uploadError}</div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Título do Material / Projeto *</label>
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
                      style={{ height: '70px', resize: 'none' }}
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

                  <div className="form-group">
                    <label className="form-label">Link do GitHub (Opcional para códigos)</label>
                    <input
                      type="url"
                      placeholder="https://github.com/usuario/repositorio"
                      value={uploadGithubUrl}
                      onChange={(e) => setUploadGithubUrl(e.target.value)}
                      className="form-input"
                    />
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

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-emerald"
                      style={{ flex: 1, padding: '0.8rem' }}
                    >
                      {isSubmitting ? 'Salvando...' : 'Confirmar e Publicar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      className="btn btn-secondary"
                      style={{ padding: '0.8rem 1.25rem' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
