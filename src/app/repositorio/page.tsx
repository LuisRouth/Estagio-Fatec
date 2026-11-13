'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { AcademicMaterial, CourseType, MaterialType, AnnouncementLink, AnnouncementAttachment, RAGQueryResult } from '@/lib/types';

// Presets de Capa / Banners com Gradientes Dinâmicos
const MATERIAL_BANNER_PRESETS = [
  {
    id: 'PADRAO_AZUL',
    label: 'Azul Institucional',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 50%, #0f172a 100%)',
    desc: 'Ciência de Dados & Fundamentos',
  },
  {
    id: 'PADRAO_AGRO',
    label: 'Agro & Visão Computacional',
    gradient: 'linear-gradient(135deg, #065f46 0%, #059669 50%, #022c22 100%)',
    desc: 'Agronegócio & Campo',
  },
  {
    id: 'PADRAO_SAUDE',
    label: 'Saúde, Bio & Imagens Médicas',
    gradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #082f49 100%)',
    desc: 'Medicina & Diagnóstico',
  },
  {
    id: 'PADRAO_DEEPTECH',
    label: 'IA, Deep Learning & Modelos',
    gradient: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #1e1b4b 100%)',
    desc: 'Redes Neurais, NLP & Notebooks',
  },
  {
    id: 'PADRAO_ESG',
    label: 'Gestão ESG & Sustentabilidade',
    gradient: 'linear-gradient(135deg, #047857 0%, #0d9488 50%, #134e4a 100%)',
    desc: 'Relatórios ODS & Governança',
  },
];

import { OFFICIAL_PPC_DISCIPLINES } from '@/lib/curriculum';

// Formatador leve de Markdown inline para respostas pedagógicas do RAG
function formatInlineMarkdown(content: string) {
  const parts = content.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: 'var(--text-main)', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// Renderizador estruturado da resposta RAG (Suporte a avisos, parágrafos e listas)
function renderRAGAnswer(text: string) {
  if (!text) return null;
  const blocks = text.split('\n\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', lineHeight: 1.65 }}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Bloco destacado de aviso de suficiência ou leituras complementares
        if (trimmed.startsWith('⚠️') || trimmed.includes('Aviso sobre a Suficiência')) {
          return (
            <div
              key={idx}
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '10px',
                padding: '0.85rem 1.1rem',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                boxShadow: '0 1px 2px rgba(245, 158, 11, 0.05)',
              }}
            >
              {formatInlineMarkdown(trimmed)}
            </div>
          );
        }

        // Parágrafo regular
        return (
          <div key={idx} style={{ color: 'var(--text-main)', fontSize: '0.925rem', whiteSpace: 'pre-wrap' }}>
            {formatInlineMarkdown(trimmed)}
          </div>
        );
      })}
    </div>
  );
}

export default function RepositorioPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'acervo' | 'meus' | 'moderacao'>('acervo');

  // Materiais do Acervo Geral
  const [materials, setMaterials] = useState<AcademicMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  // Minhas Contribuições
  const [myMaterials, setMyMaterials] = useState<AcademicMaterial[]>([]);
  const [loadingMyMaterials, setLoadingMyMaterials] = useState(false);

  // Moderação (CA e ADM)
  const [pendingMaterials, setPendingMaterials] = useState<AcademicMaterial[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // Filtros do Acervo
  const [selectedCourse, setSelectedCourse] = useState<'TODOS' | CourseType>('TODOS');
  const [selectedSemester, setSelectedSemester] = useState<number | 'TODOS'>('TODOS');
  const [selectedType, setSelectedType] = useState<'TODOS' | MaterialType>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('TODAS');

  // Controle de Expansão / Recolhimento da Grade Curricular
  const [showCurriculumExplorer, setShowCurriculumExplorer] = useState(false);
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({
    'IA-1': true,
    'IA-2': false,
    'IA-3': false,
    'IA-4': false,
    'IA-5': false,
    'ESG-1': true,
    'ESG-2': false,
    'ESG-3': false,
    'ESG-4': false,
    'ESG-5': false,
  });

  const toggleSemester = (key: string) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Expandir todas as 67 disciplinas simultaneamente
  const expandAllSemesters = () => {
    setShowCurriculumExplorer(true);
    setSelectedCourse('TODOS');
    setSelectedSemester('TODOS');
    setExpandedSemesters({
      'IA-1': true,
      'IA-2': true,
      'IA-3': true,
      'IA-4': true,
      'IA-5': true,
      'ESG-1': true,
      'ESG-2': true,
      'ESG-3': true,
      'ESG-4': true,
      'ESG-5': true,
    });
  };

  // Recolher todos os semestres
  const collapseAllSemesters = () => {
    setExpandedSemesters({
      'IA-1': false,
      'IA-2': false,
      'IA-3': false,
      'IA-4': false,
      'IA-5': false,
      'ESG-1': false,
      'ESG-2': false,
      'ESG-3': false,
      'ESG-4': false,
      'ESG-5': false,
    });
  };

  // Animação interativa do MEME 67 ("SIX-SEVEN!" sem áudio)
  const [isMeme67Active, setIsMeme67Active] = useState(false);

  const handleTriggerMeme67 = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (isMeme67Active) return;
    setIsMeme67Active(true);

    // A dancinha visual do meme dura 3.2 segundos (sem som)
    setTimeout(() => {
      setIsMeme67Active(false);
    }, 3200);
  };

  // Assistente Inteligente IA RAG
  const [isRagOpen, setIsRagOpen] = useState(false);
  const [ragQuestion, setRagQuestion] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState<RAGQueryResult | null>(null);
  const [ragError, setRagError] = useState('');

  // Modais de Criação / Edição / Confirmação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<AcademicMaterial | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<AcademicMaterial | null>(null);
  const [unavailableMaterialModal, setUnavailableMaterialModal] = useState<{
    title: string;
    subject: string;
    course: string;
    semester: number;
    materialType: string;
    fileUrl: string;
    githubUrl?: string | null;
    description?: string | null;
    authorName?: string | null;
  } | null>(null);
  const [checkingMaterialUrl, setCheckingMaterialUrl] = useState<string | null>(null);

  const handleOpenMaterial = async (
    rawUrl: string,
    info: {
      title: string;
      subject: string;
      course: string;
      semester: number;
      materialType: string;
      githubUrl?: string | null;
      description?: string | null;
      authorName?: string | null;
    }
  ) => {
    if (!rawUrl || rawUrl === '#') return;
    const targetUrl = rawUrl.startsWith('/materials/')
      ? rawUrl.replace(/\.(pdf|ipynb|html)$/i, '')
      : rawUrl;

    if (targetUrl.startsWith('/uploads/')) {
      setCheckingMaterialUrl(targetUrl);
      try {
        const res = await fetch(targetUrl, { method: 'HEAD' });
        if (res.ok) {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
          return;
        }
      } catch {
        // Arquivo indisponível no servidor -> exibe aviso informativo sem redirecionar para 404
      } finally {
        setCheckingMaterialUrl(null);
      }

      setUnavailableMaterialModal({
        ...info,
        fileUrl: rawUrl,
      });
      return;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Form State Dinâmico
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formCourse, setFormCourse] = useState<CourseType>('IA');
  const [formSemester, setFormSemester] = useState<number>(1);
  const [formType, setFormType] = useState<MaterialType>('APOSTILA');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formGithubUrl, setFormGithubUrl] = useState('');
  const [formAuthorName, setFormAuthorName] = useState('');
  const [formTags, setFormTags] = useState('');

  // Banner & Capa Dinâmicos
  const [formBannerType, setFormBannerType] = useState('PADRAO_AZUL');
  const [formUseCustomImage, setFormUseCustomImage] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState('');

  // Links & Anexos
  const [formLinks, setFormLinks] = useState<AnnouncementLink[]>([]);
  const [formAttachments, setFormAttachments] = useState<AnnouncementAttachment[]>([]);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState('');

  const handleMaterialFileUpload = async (file: File) => {
    setFormError('');
    setUploadFeedback('');
    setUploadingFile(true);
    try {
      // 1. Tenta upload direto via URL assinada (suporta arquivos até 25 MB sem limite de 4.5 MB da Vercel)
      const signRes = await fetch('/api/materials/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, sizeBytes: file.size }),
      });
      const signJson = await signRes.json();

      if (signRes.ok && signJson.success && signJson.data?.signedUploadUrl) {
        const putRes = await fetch(signJson.data.signedUploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': signJson.data.contentType || file.type || 'application/octet-stream',
          },
          body: file,
        });

        if (!putRes.ok) {
          throw new Error(`Falha ao enviar arquivo para o Supabase Storage (HTTP ${putRes.status}).`);
        }

        setFormFileUrl(signJson.data.publicUrl);
        setUploadFeedback(`Arquivo "${file.name}" enviado para a nuvem com sucesso!`);
        return;
      }

      // 2. Fallback para ambiente local (quando Supabase Storage não estiver configurado)
      if (signJson?.fallbackLocal) {
        const fd = new FormData();
        fd.append('file', file);
        const upRes = await fetch('/api/materials/upload', { method: 'POST', body: fd });
        const upJson = await upRes.json();
        if (!upRes.ok || !upJson.success) {
          throw new Error(upJson.error || 'Falha ao enviar arquivo.');
        }
        setFormFileUrl(upJson.data.fileUrl);
        setUploadFeedback(`Arquivo "${file.name}" salvo localmente com sucesso!`);
        return;
      }

      throw new Error(signJson.error || 'Não foi possível preparar o upload do arquivo.');
    } catch (err: any) {
      setFormError(err.message || 'Erro ao enviar arquivo.');
    } finally {
      setUploadingFile(false);
    }
  };

  // Papéis de acesso
  const isPrivileged = currentUser?.role === 'ADMIN' || currentUser?.role === 'CA_MEMBRO' || currentUser?.role === 'PROFESSOR';
  const isCaOrAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'CA_MEMBRO';

  // Carregar usuário logado
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setCurrentUser(d.data);
        }
      })
      .catch(() => {});
  }, []);

  // Lista dinâmica de matérias oficiais disponíveis conforme filtros de curso e semestre
  const availableDisciplines = useMemo(() => {
    return OFFICIAL_PPC_DISCIPLINES.filter((d) => {
      if (selectedCourse !== 'TODOS' && d.course !== selectedCourse) return false;
      if (selectedSemester !== 'TODOS' && d.semester !== selectedSemester) return false;
      return true;
    });
  }, [selectedCourse, selectedSemester]);

  // Se o usuário selecionou um semestre específico, garantir que ele esteja expandido
  useEffect(() => {
    if (selectedSemester !== 'TODOS') {
      const crsList = selectedCourse === 'TODOS' ? ['IA', 'ESG'] : [selectedCourse];
      setExpandedSemesters((prev) => {
        const next = { ...prev };
        crsList.forEach((c) => {
          next[`${c}-${selectedSemester}`] = true;
        });
        return next;
      });
    }
  }, [selectedSemester, selectedCourse]);

  // Buscar materiais aprovados (Acervo Geral - estritamente materiais didáticos de aula)
  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const params = new URLSearchParams();
      params.append('scope', 'repositorio');
      if (selectedCourse !== 'TODOS') params.append('course', selectedCourse);
      if (selectedSemester !== 'TODOS') params.append('semester', selectedSemester.toString());
      if (selectedType !== 'TODOS') params.append('material_type', selectedType);

      const res = await fetch(`/api/materials?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Garantia absoluta de separação: Repositório nunca exibe PROJETO nem TCC
        const acervoOnly = data.data.filter(
          (m: AcademicMaterial) => m.material_type !== 'PROJETO' && m.material_type !== 'TCC'
        );
        setMaterials(acervoOnly);
      }
    } catch (err) {
      console.error('Erro ao buscar materiais do acervo:', err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  // Buscar materiais do usuário logado (Minhas Contribuições de Aula)
  const fetchMyMaterials = async () => {
    if (!currentUser?.id) return;
    setLoadingMyMaterials(true);
    try {
      const res = await fetch(`/api/materials?author_id=${currentUser.id}&scope=repositorio&all=true`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const myAcervo = data.data.filter(
          (m: AcademicMaterial) => m.material_type !== 'PROJETO' && m.material_type !== 'TCC'
        );
        setMyMaterials(myAcervo);
      }
    } catch (err) {
      console.error('Erro ao buscar meus materiais:', err);
    } finally {
      setLoadingMyMaterials(false);
    }
  };

  // Buscar materiais pendentes de aula (Moderação)
  const fetchPendingMaterials = async () => {
    if (!isCaOrAdmin) return;
    setLoadingPending(true);
    try {
      const res = await fetch('/api/materials?pending=true&scope=repositorio');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const pendingAcervo = data.data.filter(
          (m: AcademicMaterial) => m.material_type !== 'PROJETO' && m.material_type !== 'TCC'
        );
        setPendingMaterials(pendingAcervo);
      }
    } catch (err) {
      console.error('Erro ao buscar moderação:', err);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [selectedCourse, selectedSemester, selectedType]);

  useEffect(() => {
    if (activeTab === 'meus') fetchMyMaterials();
    if (activeTab === 'moderacao') fetchPendingMaterials();
  }, [activeTab]);

  // Consulta ao Motor de IA RAG
  const handleAskRAG = async (overrideQuestion?: string) => {
    const q = overrideQuestion || ragQuestion;
    if (!q.trim()) return;

    setRagLoading(true);
    setRagError('');
    setRagResult(null);

    try {
      const res = await fetch('/api/ai/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          course: selectedCourse === 'TODOS' ? undefined : selectedCourse,
          semester: selectedSemester === 'TODOS' ? undefined : Number(selectedSemester),
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(
          res.status === 404
            ? 'Endpoint do Assistente IA não localizado (404).'
            : `Resposta inválida do servidor (HTTP ${res.status}).`
        );
      }

      if (res.ok && data.success) {
        setRagResult(data.data);
      } else {
        setRagError(data.error || 'Não foi possível encontrar respostas no acervo.');
      }
    } catch (err: any) {
      setRagError(err.message || 'Falha de conexão com o Assistente Gemini.');
    } finally {
      setRagLoading(false);
    }
  };

  // Abrir Modal para Publicar Novo Material
  const handleOpenCreateModal = () => {
    setEditingMaterial(null);
    setFormTitle('');
    setFormDesc('');
    setFormCourse(selectedCourse === 'TODOS' ? 'IA' : selectedCourse);
    setFormSemester(selectedSemester === 'TODOS' ? 1 : selectedSemester);
    setFormSubject('');
    setFormType('APOSTILA');
    setFormFileUrl('');
    setFormGithubUrl('');
    setFormAuthorName(currentUser?.name || '');
    setFormTags('');
    setFormBannerType('PADRAO_AZUL');
    setFormUseCustomImage(false);
    setFormImageUrl('');
    setFormLinks([]);
    setFormAttachments([]);
    setFormError('');
    setUploadFeedback('');
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar Material Existente
  const handleOpenEditModal = (m: AcademicMaterial) => {
    setEditingMaterial(m);
    setFormTitle(m.title);
    setFormDesc(m.description || '');
    setFormCourse(m.course);
    setFormSemester(m.semester);
    setFormSubject(m.subject);
    setFormType(m.material_type);
    setFormFileUrl(m.file_url || '');
    setFormGithubUrl(m.github_url || '');
    setFormAuthorName(m.author_name || '');
    setFormTags(m.tags || '');
    setFormBannerType(m.banner_type || 'PADRAO_AZUL');
    setFormUseCustomImage(Boolean(m.image_url));
    setFormImageUrl(m.image_url || '');
    setFormLinks(Array.isArray(m.links) ? m.links : []);
    setFormAttachments(Array.isArray(m.attachments) ? m.attachments : []);
    setFormError('');
    setUploadFeedback('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
    setFormError('');
  };

  // Salvar (Criar ou Atualizar) Material
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('O título do material é obrigatório.');
      setFormSubmitting(false);
      return;
    }

    if (!formSubject.trim()) {
      setFormError('A disciplina oficial do PPC é obrigatória.');
      setFormSubmitting(false);
      return;
    }

    const payload = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      subject: formSubject.trim(),
      course: formCourse,
      semester: formSemester,
      material_type: formType,
      file_url: formFileUrl.trim() || '#',
      github_url: formGithubUrl.trim() || undefined,
      author_name: formAuthorName.trim() || currentUser?.name || 'Aluno FATEC',
      tags: formTags.trim(),
      banner_type: formUseCustomImage ? undefined : formBannerType,
      image_url: formUseCustomImage ? formImageUrl.trim() : undefined,
      links: formLinks.filter((l) => l.url.trim() && l.label.trim()),
      attachments: formAttachments.filter((a) => a.url.trim() && a.title.trim()),
    };

    try {
      if (editingMaterial) {
        const res = await fetch(`/api/materials/${editingMaterial.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Erro ao atualizar o material didático.');
        }
      } else {
        const res = await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Erro ao cadastrar o material didático.');
        }
      }

      fetchMaterials();
      if (activeTab === 'meus') fetchMyMaterials();
      if (activeTab === 'moderacao') fetchPendingMaterials();
      handleCloseModal();
    } catch (err: any) {
      setFormError(err.message || 'Ocorreu um erro ao salvar o material.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Moderação: Aprovar Material (CA / ADM)
  const handleApproveMaterial = async (mat: AcademicMaterial) => {
    try {
      const res = await fetch(`/api/materials/${mat.id}/approve`, { method: 'POST' });
      if (res.ok) {
        setPendingMaterials((prev) => prev.filter((m) => m.id !== mat.id));
        fetchMaterials();
      } else {
        // Fallback de compatibilidade: PUT /api/materials/[id]
        const fallback = await fetch(`/api/materials/${mat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_approved: true }),
        });
        if (fallback.ok) {
          setPendingMaterials((prev) => prev.filter((m) => m.id !== mat.id));
          fetchMaterials();
        }
      }
    } catch (err) {
      console.error('Erro ao aprovar material:', err);
    }
  };

  // Excluir Material
  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    try {
      const res = await fetch(`/api/materials/${deleteConfirmTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setMaterials((prev) => prev.filter((m) => m.id !== deleteConfirmTarget.id));
        setMyMaterials((prev) => prev.filter((m) => m.id !== deleteConfirmTarget.id));
        setPendingMaterials((prev) => prev.filter((m) => m.id !== deleteConfirmTarget.id));
      }
    } catch (err) {
      console.error('Erro ao excluir material:', err);
    } finally {
      setDeleteConfirmTarget(null);
    }
  };

  // Filtragem dos materiais na aba "Acervo Geral"
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      // Repositório é estritamente para materiais de aula, nunca projetos da vitrine nem TCCs
      if (m.material_type === 'PROJETO' || m.material_type === 'TCC') return false;
      if (selectedCourse !== 'TODOS' && m.course !== selectedCourse) return false;
      if (selectedSemester !== 'TODOS' && m.semester !== selectedSemester) return false;
      if (selectedType !== 'TODOS' && m.material_type !== selectedType) return false;
      if (selectedSubject !== 'TODAS') {
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const sNorm = normalize(selectedSubject);
        const mNorm = normalize(m.subject);
        if (!mNorm.includes(sNorm) && !sNorm.includes(mNorm)) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(query);
        const matchSub = m.subject.toLowerCase().includes(query);
        const matchTags = m.tags ? m.tags.toLowerCase().includes(query) : false;
        const matchDesc = m.description ? m.description.toLowerCase().includes(query) : false;
        const matchAuthor = m.author_name ? m.author_name.toLowerCase().includes(query) : false;
        return matchTitle || matchSub || matchTags || matchDesc || matchAuthor;
      }
      return true;
    });
  }, [materials, selectedCourse, selectedSemester, selectedType, selectedSubject, searchQuery]);

  // Gradiente do Card
  const getBannerGradient = (m: AcademicMaterial) => {
    if (m.image_url) return `url(${m.image_url}) center/cover no-repeat`;
    const preset = MATERIAL_BANNER_PRESETS.find((b) => b.id === m.banner_type);
    if (preset) return preset.gradient;
    if (m.course === 'ESG') return 'linear-gradient(135deg, #047857 0%, #0d9488 50%, #134e4a 100%)';
    return 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 50%, #0f172a 100%)';
  };

  return (
    <AppLayout activePath="/repositorio">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* ============================================================== */}
        {/* CABEÇALHO DO REPOSITÓRIO ACADÊMICO                             */}
        {/* ============================================================== */}
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
            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '740px', lineHeight: 1.6 }}>
              Acesso centralizado a notas de aula, códigos no GitHub, apostilas e roteiros de laboratório organizados rigorosamente pela matriz curricular oficial do PPC da FATEC Rio Claro.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
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
            Publicar Material / Anexo
          </button>
        </div>

        {/* ============================================================== */}
        {/* NAVEGAÇÃO ENTRE ABAS (Acervo, Minhas Contribuições, Moderação) */}
        {/* ============================================================== */}
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
              backgroundColor: activeTab === 'acervo' ? 'var(--bg-primary)' : 'transparent',
              color: activeTab === 'acervo' ? 'var(--accent-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === 'acervo' ? '3px solid var(--accent-blue)' : '3px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            Acervo Didático Geral ({materials.length})
          </button>

          {/* Aba 2: Minhas Contribuições */}
          {currentUser && (
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
                backgroundColor: activeTab === 'meus' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'meus' ? 'var(--accent-blue)' : 'var(--text-muted)',
                borderBottom: activeTab === 'meus' ? '3px solid var(--accent-blue)' : '3px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Minhas Contribuições ({myMaterials.length})
            </button>
          )}

          {/* Aba 3: Moderação (CA e Admin) */}
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
                backgroundColor: activeTab === 'moderacao' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'moderacao' ? 'var(--accent-amber)' : 'var(--text-muted)',
                borderBottom: activeTab === 'moderacao' ? '3px solid var(--accent-amber)' : '3px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Fila de Moderação {pendingMaterials.length > 0 && `(${pendingMaterials.length})`}
            </button>
          )}
        </div>

        {/* ============================================================== */}
        {/* ABA 1: ACERVO GERAL                                            */}
        {/* ============================================================== */}
        {activeTab === 'acervo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            
            {/* 1. ASSISTENTE INTELIGENTE RAG (GEMINI) — COLAPSÁVEL */}
            <div
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '16px',
                border: '1px solid var(--border-light)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Barra de Ativação do Assistente */}
              <div
                onClick={() => setIsRagOpen(!isRagOpen)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  backgroundColor: isRagOpen ? 'var(--bg-muted)' : 'var(--bg-primary)',
                  borderBottom: isRagOpen ? '1px solid var(--border-light)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-blue)',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Assistente Acadêmico Inteligente
                      </span>
                      <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                        Somente fontes verificadas
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                      Consulte apostilas, resumos e fontes das disciplinas sem precisar folhear arquivo por arquivo.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {isRagOpen ? 'Ocultar Assistente' : 'Consultar via IA'}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: isRagOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>

              {/* Conteúdo Expandido do RAG */}
              {isRagOpen && (
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Exemplos Rápidos */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Sugestões de Dúvidas Acadêmicas:
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {[
                        'Aprendemos linguagem de programação no curso de IA?',
                        'Há disciplina de Inglês no curso de IA?',
                        'Onde estudar material sobre Banco de Dados?',
                        'Para criar uma aplicação de rotas de entrega de mercadorias, quais matérias e materiais devo estudar?',
                      ].map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleAskRAG(sug)}
                          className="repositorio-sample-pill"
                          type="button"
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-muted)',
                            border: '1px solid var(--border-light)',
                            color: 'var(--text-sub)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input de Busca do RAG */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Digite sua dúvida acadêmica (ex: Aprendemos linguagem de programação no curso de IA?)"
                      value={ragQuestion}
                      onChange={(e) => setRagQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAskRAG()}
                      className="form-input"
                      style={{ flex: '1 1 300px' }}
                    />
                    <button
                      onClick={() => handleAskRAG()}
                      disabled={ragLoading || !ragQuestion.trim()}
                      className="btn btn-primary"
                      style={{ padding: '0.75rem 1.4rem', fontWeight: 700 }}
                    >
                      {ragLoading ? 'Pesquisando no Acervo...' : 'Perguntar ao Assistente'}
                    </button>
                  </div>

                  {ragError && (
                    <div className="alert-box alert-error">
                      <div>{ragError}</div>
                    </div>
                  )}

                  {/* Resposta do RAG */}
                  {ragResult && (
                    <div
                      style={{
                        backgroundColor: 'var(--bg-muted)',
                        borderRadius: '12px',
                        padding: '1.4rem',
                        border: '1px solid var(--border-light)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            💡 Resposta Estruturada via RAG
                          </span>
                          <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>
                            {ragResult.mode === 'LIVE_GEMINI_RAG' ? 'Gemini (interpretação) + fontes verificadas' : 'Matriz PPC + acervo cadastrado'}
                          </span>
                        </div>
                        <button
                          onClick={() => setRagResult(null)}
                          style={{ background: 'none', border: 'none', fontSize: '0.825rem', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
                        >
                          ✕ Fechar Resposta
                        </button>
                      </div>

                      {/* Conteúdo Inteligível e Formatado */}
                      <div style={{ margin: '0.25rem 0 1rem' }}>
                        {renderRAGAnswer(ragResult.answer)}
                      </div>

                      {/* Materiais Didáticos Indicados (Acesso Direto com Botões Interativos) */}
                      {ragResult.sources && ragResult.sources.length > 0 && (
                        <div style={{ marginTop: '1.4rem', paddingTop: '1.1rem', borderTop: '1px solid var(--border-light)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                                📚 Materiais e Recursos Didáticos Indicados (Acesso Direto):
                              </span>
                              <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                                {ragResult.sources.length} encontrado{ragResult.sources.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Clique nos botões abaixo para abrir diretamente os materiais no acervo
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.9rem' }}>
                            {ragResult.sources.map((src, i) => {
                              const targetFileUrl = src.fileUrl || (src as any).file_url || '#';
                              const viewerUrl = targetFileUrl.startsWith('/materials/')
                                ? targetFileUrl.replace(/\.(pdf|ipynb|html)$/i, '')
                                : targetFileUrl;
                              const targetGithubUrl = src.githubUrl || (src as any).github_url || null;
                              const targetLinks = src.links || (src as any).links || [];

                              return (
                                <div
                                  key={i}
                                  style={{
                                    backgroundColor: 'var(--bg-primary)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gap: '0.85rem',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
                                      <span className="badge badge-blue" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                                        {src.course} • {src.semester}º Semestre
                                      </span>
                                      <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                                        {src.materialType}
                                      </span>
                                    </div>

                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.35, marginBottom: '0.35rem' }}>
                                      {src.title}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                      Disciplina: <strong style={{ color: 'var(--text-sub)' }}>{src.subject}</strong>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', paddingTop: '0.65rem', borderTop: '1px dashed var(--border-light)' }}>
                                    {viewerUrl && viewerUrl !== '#' && (
                                      <button
                                        type="button"
                                        disabled={checkingMaterialUrl === viewerUrl}
                                        onClick={() =>
                                          handleOpenMaterial(targetFileUrl, {
                                            title: src.title,
                                            subject: src.subject,
                                            course: src.course,
                                            semester: src.semester,
                                            materialType: src.materialType,
                                            githubUrl: targetGithubUrl,
                                            description: (src as any).excerpt || null,
                                          })
                                        }
                                        className="btn btn-primary"
                                        style={{
                                          fontSize: '0.78rem',
                                          padding: '0.45rem 0.85rem',
                                          fontWeight: 700,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.4rem',
                                          textDecoration: 'none',
                                          flex: '1 1 auto',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                        </svg>
                                        {checkingMaterialUrl === viewerUrl ? 'Verificando...' : 'Abrir Material'}
                                      </button>
                                    )}

                                    {targetGithubUrl && (
                                      <a
                                        href={targetGithubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                        style={{
                                          fontSize: '0.78rem',
                                          padding: '0.45rem 0.75rem',
                                          fontWeight: 600,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.4rem',
                                          textDecoration: 'none',
                                        }}
                                        title="Ver repositório no GitHub"
                                      >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                                        </svg>
                                        GitHub
                                      </a>
                                    )}

                                    {Array.isArray(targetLinks) && targetLinks.map((link: any, lIdx: number) => (
                                      <a
                                        key={lIdx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                        style={{
                                          fontSize: '0.74rem',
                                          padding: '0.4rem 0.65rem',
                                          fontWeight: 600,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.35rem',
                                          textDecoration: 'none',
                                        }}
                                      >
                                        🔗 {link.label || 'Link Oficial'}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. PAINEL DE FILTROS E BUSCA */}
            <div
              className="repositorio-filter-card"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '16px',
                border: '1px solid var(--border-light)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* LINHA 1: SELETOR DE CURSO & BUSCA GLOBAL */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                {/* Abas Segmentadas de Curso */}
                <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'var(--bg-muted)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourse('TODOS');
                      setSelectedSubject('TODAS');
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontWeight: selectedCourse === 'TODOS' ? 800 : 600,
                      fontSize: '0.85rem',
                      border: 'none',
                      backgroundColor: selectedCourse === 'TODOS' ? 'var(--accent-blue)' : 'transparent',
                      color: selectedCourse === 'TODOS' ? '#ffffff' : 'var(--text-main)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span>Todos os Cursos</span>
                    <span
                      onClick={handleTriggerMeme67}
                      title="6-7"
                      style={{
                        backgroundColor: selectedCourse === 'TODOS' ? 'rgba(255, 255, 255, 0.25)' : 'var(--border-light)',
                        color: selectedCourse === 'TODOS' ? '#ffffff' : 'var(--text-muted)',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease',
                        transform: isMeme67Active ? 'scale(1.2)' : 'scale(1)',
                      }}
                    >
                      {isMeme67Active ? '6-7' : OFFICIAL_PPC_DISCIPLINES.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourse('IA');
                      setSelectedSubject('TODAS');
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontWeight: selectedCourse === 'IA' ? 800 : 600,
                      fontSize: '0.85rem',
                      border: 'none',
                      backgroundColor: selectedCourse === 'IA' ? 'var(--accent-blue)' : 'transparent',
                      color: selectedCourse === 'IA' ? '#ffffff' : 'var(--text-main)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Inteligência Artificial (38)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourse('ESG');
                      setSelectedSubject('TODAS');
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontWeight: selectedCourse === 'ESG' ? 800 : 600,
                      fontSize: '0.85rem',
                      border: 'none',
                      backgroundColor: selectedCourse === 'ESG' ? 'var(--accent-emerald)' : 'transparent',
                      color: selectedCourse === 'ESG' ? '#ffffff' : 'var(--text-main)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Gestão ESG (29)
                  </button>
                </div>

                {/* Input de Busca Rápida */}
                <div style={{ flex: '1 1 280px', maxWidth: '420px', position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Buscar disciplina, código, título ou tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', paddingRight: searchQuery ? '2.2rem' : '1rem' }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* LINHA 2: FILTROS DE SEMESTRE E TIPO DE MATERIAL */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-light)' }}>
                {/* Semestres */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.2rem' }}>
                    Semestre:
                  </span>
                  {(['TODOS', 1, 2, 3, 4] as const).map((sem) => {
                    const label = sem === 'TODOS' ? 'Todos' : `${sem}º Sem`;
                    const isActive = selectedSemester === sem;
                    return (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => {
                          setSelectedSemester(sem as any);
                          setSelectedSubject('TODAS');
                        }}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: isActive ? 800 : 500,
                          border: isActive ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                          backgroundColor: isActive ? 'var(--accent-blue-light)' : 'transparent',
                          color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Tipo de Material de Aula (Sem TCC nem Projetos) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.2rem' }}>
                    Tipo:
                  </span>
                  {(['TODOS', 'APOSTILA', 'CODIGO', 'SLIDE', 'DATASET'] as const).map((t) => {
                    const label = t === 'TODOS' ? 'Todos' : t === 'APOSTILA' ? 'Apostilas' : t === 'CODIGO' ? 'Códigos' : t === 'SLIDE' ? 'Slides' : 'Datasets';
                    const isActive = selectedType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedType(t as any)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: isActive ? 800 : 500,
                          border: isActive ? '1px solid var(--text-muted)' : '1px solid var(--border-light)',
                          backgroundColor: isActive ? 'var(--bg-muted)' : 'transparent',
                          color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LINHA 3: FILTRO DE DISCIPLINA & GRADE CURRICULAR EXPANSÍVEL (SEM DROPDOWN REDUNDANTE) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-light)' }}>
                {/* Banner de Filtro Ativo quando uma disciplina da grade está selecionada */}
                {selectedSubject !== 'TODAS' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--accent-blue-light)',
                      border: '1px solid var(--accent-blue)',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: 'var(--accent-blue)',
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                      </svg>
                      Filtro Ativo: <strong>{selectedSubject}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedSubject('TODAS')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-blue)',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      ✕ Remover Filtro
                    </button>
                  </div>
                )}

                {/* ESTILOS DE ANIMAÇÃO DO MEME 67 ("AY, 6-7!" COM AS MÃOS ALTERNADAS) */}
                <style>{`
                  @keyframes memeHandLeft {
                    0% { transform: translateY(-10px) rotate(-12deg); }
                    50% { transform: translateY(0px) rotate(-3deg); }
                    100% { transform: translateY(10px) rotate(6deg); }
                  }
                  @keyframes memeHandRight {
                    0% { transform: translateY(10px) rotate(6deg); }
                    50% { transform: translateY(0px) rotate(-3deg); }
                    100% { transform: translateY(-10px) rotate(-12deg); }
                  }
                  @keyframes memeTextBob {
                    0% { transform: scale(0.92) rotate(-3deg); }
                    50% { transform: scale(1.14) rotate(3deg); }
                    100% { transform: scale(0.92) rotate(-3deg); }
                  }
                  @keyframes memeBadgeSeesaw {
                    0% { transform: rotate(-8deg) scale(1.08); }
                    50% { transform: rotate(8deg) scale(1.08); }
                    100% { transform: rotate(-8deg) scale(1.08); }
                  }
                  @keyframes memeCardPop {
                    0% { opacity: 0; transform: translate(-50%, 15px) scale(0.5); }
                    60% { opacity: 1; transform: translate(-50%, -4px) scale(1.06); }
                    100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
                  }
                  @keyframes memeGlowPulse {
                    0% { box-shadow: 0 0 10px rgba(56, 189, 248, 0.6), 0 0 20px rgba(245, 158, 11, 0.4); }
                    50% { box-shadow: 0 0 22px rgba(236, 72, 153, 0.7), 0 0 30px rgba(56, 189, 248, 0.5); }
                    100% { box-shadow: 0 0 10px rgba(56, 189, 248, 0.6), 0 0 20px rgba(245, 158, 11, 0.4); }
                  }
                `}</style>

                {/* BOTÃO PRINCIPAL: EXPANDIR GRADE CURRICULAR POR SEMESTRES */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCurriculumExplorer(!showCurriculumExplorer)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: showCurriculumExplorer ? 'var(--bg-muted)' : 'var(--bg-primary)',
                      color: 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                      </svg>
                      <span>
                        {showCurriculumExplorer ? 'Ocultar Grade Curricular por Semestres' : 'Expandir Grade Curricular por Semestres'}
                      </span>

                      {/* BADGE DO 67 COM ANIMAÇÃO COMPLETA DO MEME 67 */}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={handleTriggerMeme67}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleTriggerMeme67();
                          }
                        }}
                        title="AY, 6-7!"
                        style={{
                          position: 'relative',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: isMeme67Active ? '#0284c7' : 'var(--accent-blue)',
                          color: '#ffffff',
                          padding: '0.2rem 0.65rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.2s ease',
                          animation: isMeme67Active ? 'memeBadgeSeesaw 0.32s ease-in-out infinite, memeGlowPulse 0.8s ease-in-out infinite' : 'none',
                          boxShadow: isMeme67Active ? '0 0 16px rgba(56, 189, 248, 0.7)' : '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      >
                        {/* BALÃO FLUTUANTE DO MEME 67 (MÃOS DANDO RITMO + TEXTO VIBRANTE) */}
                        {isMeme67Active && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 'calc(100% + 12px)',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              backgroundColor: '#0f172a',
                              border: '2px solid #38bdf8',
                              borderRadius: '16px',
                              padding: '0.65rem 1.1rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.85rem',
                              boxShadow: '0 14px 35px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.5)',
                              zIndex: 60,
                              whiteSpace: 'nowrap',
                              animation: 'memeCardPop 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            }}
                          >
                            {/* Mão Esquerda (Palma para cima subindo/descendo) */}
                            <div style={{ animation: 'memeHandLeft 0.32s ease-in-out infinite alternate', color: '#f59e0b', display: 'flex', alignItems: 'center' }}>
                              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
                                <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5" />
                                <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7" />
                                <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v9" />
                                <path d="M6 13V9a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7a9 9 0 0 0 9 9h3a7 7 0 0 0 7-7v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v3" />
                              </svg>
                            </div>

                            {/* Texto do Meme 6-7 */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                              <span
                                style={{
                                  fontSize: '1.25rem',
                                  fontWeight: 900,
                                  fontStyle: 'italic',
                                  letterSpacing: '1px',
                                  background: 'linear-gradient(90deg, #38bdf8, #f59e0b, #ec4899)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  animation: 'memeTextBob 0.32s ease-in-out infinite alternate',
                                  textTransform: 'uppercase',
                                }}
                              >
                                SIX-SEVEN!
                              </span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.8px' }}>
                                6-7
                              </span>
                            </div>

                            {/* Mão Direita (Palma para cima ritmo alternado) */}
                            <div style={{ animation: 'memeHandRight 0.32s ease-in-out infinite alternate', color: '#f59e0b', display: 'flex', alignItems: 'center' }}>
                              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5" />
                                <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7" />
                                <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v9" />
                                <path d="M6 13V9a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7a9 9 0 0 0 9 9h3a7 7 0 0 0 7-7v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v3" />
                              </svg>
                            </div>

                            {/* Seta do balão */}
                            <div
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 0,
                                height: 0,
                                borderLeft: '7px solid transparent',
                                borderRight: '7px solid transparent',
                                borderTop: '7px solid #38bdf8',
                              }}
                            />
                          </div>
                        )}

                        {isMeme67Active ? (
                          <strong style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                            6-7
                          </strong>
                        ) : (
                          <>
                            <span style={{ fontWeight: 900 }}>67</span>
                            <span>Disciplinas Oficiais</span>
                          </>
                        )}
                      </span>
                    </span>

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ transform: showCurriculumExplorer ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {/* Conteúdo do Accordion por Semestre */}
                  {showCurriculumExplorer && (
                    <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Barra Superior de Ações Rápidas da Grade */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-light)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            Matriz Curricular Oficial (PPC):
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            67 disciplinas (38 Inteligência Artificial + 29 Gestão ESG)
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={expandAllSemesters}
                            style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-light)',
                              backgroundColor: 'var(--bg-muted)',
                              color: 'var(--text-main)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Expandir Todos os Semestres
                          </button>

                          <button
                            type="button"
                            onClick={collapseAllSemesters}
                            style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-light)',
                              backgroundColor: 'transparent',
                              color: 'var(--text-muted)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Recolher Todos
                          </button>
                        </div>
                      </div>
                      {/* Seção CST Inteligência Artificial */}
                      {(selectedCourse === 'TODOS' || selectedCourse === 'IA') && (
                        <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1rem', backgroundColor: 'var(--bg-muted)' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-blue)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>CST em Inteligência Artificial (38 Componentes Oficiais)</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Matutino</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {[1, 2, 3, 4].map((sem) => {
                              if (selectedSemester !== 'TODOS' && selectedSemester !== sem) return null;
                              const semKey = `IA-${sem}`;
                              const isExpanded = expandedSemesters[semKey];
                              const semLabel = sem === 5 ? 'Componentes Complementares (TCC & Estágio)' : `${sem}º Semestre`;
                              const semDiscs = OFFICIAL_PPC_DISCIPLINES.filter((d) => d.course === 'IA' && d.semester === sem);

                              return (
                                <div key={semKey} style={{ border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
                                  <button
                                    type="button"
                                    onClick={() => toggleSemester(semKey)}
                                    style={{
                                      width: '100%',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '0.6rem 0.85rem',
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--text-main)',
                                      fontWeight: 700,
                                      fontSize: '0.825rem',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <span>{semLabel} ({semDiscs.length} matérias)</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)' }}>
                                      {isExpanded ? 'Recolher ▲' : 'Expandir ▼'}
                                    </span>
                                  </button>

                                  {isExpanded && (
                                    <div
                                      style={{
                                        padding: '0.75rem',
                                        borderTop: '1px solid var(--border-light)',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                        gap: '0.45rem',
                                      }}
                                    >
                                      {semDiscs.map((item) => {
                                        const isSelected = selectedSubject === item.name;
                                        return (
                                          <button
                                            key={item.code}
                                            type="button"
                                            onClick={() => setSelectedSubject(isSelected ? 'TODAS' : item.name)}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '0.5rem',
                                              padding: '0.5rem 0.65rem',
                                              borderRadius: '8px',
                                              border: isSelected ? '2px solid var(--accent-blue)' : '1px solid var(--border-light)',
                                              backgroundColor: isSelected ? 'var(--accent-blue-light)' : 'var(--bg-muted)',
                                              color: isSelected ? 'var(--accent-blue)' : 'var(--text-main)',
                                              cursor: 'pointer',
                                              textAlign: 'left',
                                              fontSize: '0.78rem',
                                              fontWeight: isSelected ? 800 : 500,
                                              transition: 'all 0.15s ease',
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontSize: '0.68rem',
                                                fontWeight: 800,
                                                padding: '2px 5px',
                                                borderRadius: '4px',
                                                backgroundColor: isSelected ? 'var(--accent-blue)' : 'var(--border-light)',
                                                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                                              }}
                                            >
                                              {item.code}
                                            </span>
                                            <span style={{ flex: 1, whiteSpace: 'normal', lineHeight: 1.25 }}>
                                              {item.name}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Seção CST Gestão ESG */}
                      {(selectedCourse === 'TODOS' || selectedCourse === 'ESG') && (
                        <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1rem', backgroundColor: 'var(--bg-muted)' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>CST em Gestão da Sustentabilidade & ESG (29 Componentes Oficiais)</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Noturno</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {[1, 2, 3, 4].map((sem) => {
                              if (selectedSemester !== 'TODOS' && selectedSemester !== sem) return null;
                              const semKey = `ESG-${sem}`;
                              const isExpanded = expandedSemesters[semKey];
                              const semLabel = sem === 5 ? 'Componentes Complementares (TCC & Estágio)' : `${sem}º Semestre`;
                              const semDiscs = OFFICIAL_PPC_DISCIPLINES.filter((d) => d.course === 'ESG' && d.semester === sem);

                              return (
                                <div key={semKey} style={{ border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
                                  <button
                                    type="button"
                                    onClick={() => toggleSemester(semKey)}
                                    style={{
                                      width: '100%',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '0.6rem 0.85rem',
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--text-main)',
                                      fontWeight: 700,
                                      fontSize: '0.825rem',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <span>{semLabel} ({semDiscs.length} matérias)</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
                                      {isExpanded ? 'Recolher ▲' : 'Expandir ▼'}
                                    </span>
                                  </button>

                                  {isExpanded && (
                                    <div
                                      style={{
                                        padding: '0.75rem',
                                        borderTop: '1px solid var(--border-light)',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                        gap: '0.45rem',
                                      }}
                                    >
                                      {semDiscs.map((item) => {
                                        const isSelected = selectedSubject === item.name;
                                        return (
                                          <button
                                            key={item.code}
                                            type="button"
                                            onClick={() => setSelectedSubject(isSelected ? 'TODAS' : item.name)}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '0.5rem',
                                              padding: '0.5rem 0.65rem',
                                              borderRadius: '8px',
                                              border: isSelected ? '2px solid var(--accent-emerald)' : '1px solid var(--border-light)',
                                              backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-muted)',
                                              color: isSelected ? 'var(--accent-emerald)' : 'var(--text-main)',
                                              cursor: 'pointer',
                                              textAlign: 'left',
                                              fontSize: '0.78rem',
                                              fontWeight: isSelected ? 800 : 500,
                                              transition: 'all 0.15s ease',
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontSize: '0.68rem',
                                                fontWeight: 800,
                                                padding: '2px 5px',
                                                borderRadius: '4px',
                                                backgroundColor: isSelected ? 'var(--accent-emerald)' : 'var(--border-light)',
                                                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                                              }}
                                            >
                                              {item.code}
                                            </span>
                                            <span style={{ flex: 1, whiteSpace: 'normal', lineHeight: 1.25 }}>
                                              {item.name}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. GRID DE MATERIAIS DIDÁTICOS */}
            {loadingMaterials ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                Carregando materiais do acervo acadêmico...
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div
                style={{
                  padding: '3.5rem 2rem',
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px dashed var(--border-light)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Nenhum material didático catalogado com os filtros atuais
                </h3>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', maxWidth: '520px', lineHeight: 1.5, margin: 0 }}>
                  O acervo está aberto para notas de aula, roteiros de laboratório, códigos no GitHub e apostilas da turma. Seja o primeiro a colaborar!
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="btn btn-primary"
                  style={{ marginTop: '0.5rem', padding: '0.65rem 1.4rem', fontWeight: 700 }}
                >
                  Publicar Material nesta Matéria
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredMaterials.map((m) => {
                  const bannerBg = getBannerGradient(m);
                  return (
                    <div
                      key={m.id}
                      className="card-interactive"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-light)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {/* Topo Visual do Card */}
                      <div
                        style={{
                          height: '90px',
                          background: bannerBg,
                          position: 'relative',
                          padding: '0.85rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              backgroundColor: 'rgba(0,0,0,0.6)',
                              backdropFilter: 'blur(4px)',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {m.material_type}
                          </span>
                          <span
                            style={{
                              backgroundColor: 'rgba(0,0,0,0.6)',
                              backdropFilter: 'blur(4px)',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {m.course} • {m.semester}º Sem
                          </span>
                        </div>
                      </div>

                      {/* Corpo do Card */}
                      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
                            {m.subject}
                          </div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1.35 }}>
                            {m.title}
                          </h3>
                        </div>

                        {m.description && (
                          <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0, flex: 1 }}>
                            {m.description}
                          </p>
                        )}

                        {m.tags && (
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {m.tags.split(',').map((tag: string, i: number) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: 'var(--bg-muted)',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                          Por: <strong>{m.author_name || 'Aluno'}</strong>
                        </div>

                        {/* Botões de Ação */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                          {m.file_url && m.file_url !== '#' && (
                            <button
                              type="button"
                              disabled={checkingMaterialUrl === m.file_url}
                              onClick={() =>
                                handleOpenMaterial(m.file_url, {
                                  title: m.title,
                                  subject: m.subject,
                                  course: m.course,
                                  semester: m.semester,
                                  materialType: m.material_type,
                                  githubUrl: m.github_url,
                                  description: m.description,
                                  authorName: m.author_name,
                                })
                              }
                              className="btn btn-secondary"
                              style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}
                            >
                              {checkingMaterialUrl === m.file_url ? 'Verificando...' : 'Acessar Arquivo'}
                            </button>
                          )}
                          {m.github_url && (
                            <a
                              href={m.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary"
                              style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}
                            >
                              GitHub
                            </a>
                          )}
                        </div>

                        {(isPrivileged || (currentUser?.id && m.author_id === currentUser.id)) && (
                          <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-light)' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(m)}
                              className="btn btn-secondary"
                              style={{ flex: 1, padding: '0.38rem 0.65rem', fontSize: '0.75rem', fontWeight: 700 }}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmTarget(m)}
                              className="btn btn-danger"
                              style={{ flex: 1, padding: '0.38rem 0.65rem', fontSize: '0.75rem', fontWeight: 700 }}
                            >
                              🗑️ Excluir
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

        {/* ============================================================== */}
        {/* ABA 2: MINHAS CONTRIBUIÇÕES                                     */}
        {/* ============================================================== */}
        {activeTab === 'meus' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Minhas Contribuições Didáticas
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                  Acompanhe seus envios de apostilas, códigos e notas de aula para a comunidade.
                </p>
              </div>

              <button type="button" onClick={handleOpenCreateModal} className="btn btn-emerald" style={{ fontWeight: 700 }}>
                Publicar Novo Material
              </button>
            </div>

            {loadingMyMaterials ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                Carregando suas contribuições...
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
                  Você ainda não publicou materiais didáticos
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                  Compartilhe apostilas, resumos e códigos com seus colegas de curso!
                </p>
                <button type="button" onClick={handleOpenCreateModal} className="btn btn-primary" style={{ marginTop: '1rem', fontWeight: 700 }}>
                  Submeter Primeiro Material
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {myMaterials.map((m) => (
                  <div
                    key={m.id}
                    className="card-interactive"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: '16px',
                      border: '1px solid var(--border-light)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className={`badge ${m.is_approved ? 'badge-emerald' : 'badge-amber'}`}>
                        {m.is_approved ? 'Aprovado' : 'Em Moderação'}
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(m)}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmTarget(m)}
                          className="btn btn-danger"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {m.title}
                    </h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
                      {m.subject} • {m.course} ({m.semester}º Sem)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 3: FILA DE MODERAÇÃO (CA E ADM)                             */}
        {/* ============================================================== */}
        {activeTab === 'moderacao' && isCaOrAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Fila de Moderação do Acervo
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                Revise os materiais submetidos pelos alunos antes de disponibilizá-los no acervo oficial.
              </p>
            </div>

            {loadingPending ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                Carregando materiais em moderação...
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
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Nenhum material pendente de aprovação
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                  Todos os uploads de estudantes foram avaliados!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {pendingMaterials.map((m) => (
                  <div
                    key={m.id}
                    className="card-interactive"
                    style={{
                      padding: '1.75rem',
                      borderRadius: '16px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <span className="badge badge-amber">Pendente de Avaliação</span>
                          <span className="badge badge-blue">{m.course}</span>
                          <span className="badge" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                            {m.semester}º Semestre
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {m.material_type}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                          {m.title}
                        </h4>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                          Disciplina: {m.subject}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <div><strong>Submetido por:</strong> {m.author_name || 'Aluno'}</div>
                        <div style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>
                          {new Date(m.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.5, margin: 0 }}>
                      {m.description || 'Sem descrição fornecida pelo autor.'}
                    </p>

                    {m.tags && (
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {m.tags.split(',').map((tag: string, i: number) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.72rem',
                              backgroundColor: 'var(--bg-muted)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              color: 'var(--text-muted)',
                            }}
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Ações de Moderação */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {m.file_url && m.file_url !== '#' ? (
                          <button
                            type="button"
                            disabled={checkingMaterialUrl === m.file_url}
                            onClick={() =>
                              handleOpenMaterial(m.file_url, {
                                title: m.title,
                                subject: m.subject,
                                course: m.course,
                                semester: m.semester,
                                materialType: m.material_type,
                                githubUrl: m.github_url,
                                description: m.description,
                                authorName: m.author_name,
                              })
                            }
                            className="btn btn-primary"
                            style={{ fontWeight: 700 }}
                          >
                            {checkingMaterialUrl === m.file_url ? 'Abrindo...' : '📄 Analisar Arquivo'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                            Sem arquivo anexado
                          </span>
                        )}

                        {m.github_url && (
                          <a
                            href={m.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{ fontWeight: 700, textDecoration: 'none' }}
                          >
                            GitHub ↗
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(m)}
                          className="btn btn-secondary"
                          style={{ fontWeight: 700 }}
                        >
                          ✏️ Editar
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => handleApproveMaterial(m)}
                          className="btn btn-emerald"
                          style={{ fontWeight: 700 }}
                        >
                          Aprovar para o Acervo
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmTarget(m)}
                          className="btn btn-danger"
                          style={{ fontWeight: 700 }}
                        >
                          Rejeitar / Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: CRIAR OU EDITAR MATERIAL DIDÁTICO                       */}
        {/* ============================================================== */}
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '16px',
                border: '1px solid var(--border-light)',
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2rem',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {editingMaterial ? 'Editar Material Didático' : 'Publicar Material no Acervo'}
                </h3>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="alert-box alert-error" style={{ marginBottom: '1rem' }}>
                  <div>{formError}</div>
                </div>
              )}

              <form onSubmit={handleSaveMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* 1. SELETOR VISUAL DE CAPA */}
                <div style={{ padding: '1.25rem', borderRadius: '12px', backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-light)' }}>
                  <label className="form-label" style={{ fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>
                    Capa / Identidade Visual do Material
                  </label>

                  <div
                    style={{
                      height: '75px',
                      borderRadius: '10px',
                      background: formUseCustomImage && formImageUrl
                        ? `url(${formImageUrl}) center/cover no-repeat`
                        : MATERIAL_BANNER_PRESETS.find((b) => b.id === formBannerType)?.gradient || MATERIAL_BANNER_PRESETS[0].gradient,
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {formTitle.trim() ? formTitle : 'Pré-visualização da Capa do Material'}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
                    {MATERIAL_BANNER_PRESETS.map((preset) => {
                      const isSelected = !formUseCustomImage && formBannerType === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setFormBannerType(preset.id);
                            setFormUseCustomImage(false);
                          }}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            background: preset.gradient,
                            color: '#ffffff',
                            border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.2)',
                            cursor: 'pointer',
                            fontSize: '0.725rem',
                            fontWeight: 700,
                          }}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. DADOS PRINCIPAIS DO MATERIAL */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Título do Material *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Apostila Prática: OpenCV e YOLO para Detecção no Agro"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Curso Oficial *</label>
                    <select
                      value={formCourse}
                      onChange={(e) => {
                        const newCrs = e.target.value as CourseType;
                        setFormCourse(newCrs);
                        setFormSubject('');
                      }}
                      className="form-select"
                    >
                      <option value="IA">CST Inteligência Artificial</option>
                      <option value="ESG">CST Gestão ESG & Sustentabilidade</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Semestre Oficial *</label>
                    <select
                      value={formSemester}
                      onChange={(e) => {
                        setFormSemester(Number(e.target.value));
                        setFormSubject('');
                      }}
                      className="form-select"
                    >
                      <option value={1}>1º Semestre</option>
                      <option value={2}>2º Semestre</option>
                      <option value={3}>3º Semestre</option>
                      <option value={4}>4º Semestre</option>
                      <option value={5}>Complementares (TCC / Estágio)</option>
                    </select>
                  </div>
                </div>

                {/* Disciplina Oficial do PPC */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Disciplina Oficial do PPC *</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Selecione uma disciplina oficial...</option>
                    {OFFICIAL_PPC_DISCIPLINES.filter((d) => d.course === formCourse && d.semester === formSemester).map((disc) => (
                      <option key={disc.code} value={disc.name}>
                        [{disc.code}] {disc.name} ({disc.hours}h - {disc.mode})
                      </option>
                    ))}
                  </select>

                  {/* Pílulas de Seleção Rápida */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                    {OFFICIAL_PPC_DISCIPLINES.filter((d) => d.course === formCourse && d.semester === formSemester).map((disc) => {
                      const isSelected = formSubject === disc.name;
                      return (
                        <button
                          key={disc.code}
                          type="button"
                          onClick={() => setFormSubject(disc.name)}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                            backgroundColor: isSelected ? 'var(--accent-blue-light)' : 'var(--bg-muted)',
                            color: isSelected ? 'var(--accent-blue)' : 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          {disc.code}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Tipo de Conteúdo *</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as MaterialType)}
                      className="form-select"
                    >
                      <option value="APOSTILA">Apostila / Resumo</option>
                      <option value="CODIGO">Código / Notebook</option>
                      <option value="SLIDE">Slide de Aula</option>
                      <option value="DATASET">Dataset / Planilha</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Autor / Compartilhado por</label>
                    <input
                      type="text"
                      placeholder="Seu nome ou grupo de estudos"
                      value={formAuthorName}
                      onChange={(e) => setFormAuthorName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Descrição / Instruções do Material</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva o que o colega vai aprender, quais tópicos são cobertos e orientações para estudo..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Link do Arquivo (PDF / Drive / Nuvem)</label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... ou envie o arquivo abaixo"
                      value={formFileUrl}
                      onChange={(e) => setFormFileUrl(e.target.value)}
                      className="form-input"
                    />
                    <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <label
                        className="btn btn-secondary"
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.35rem 0.75rem',
                          fontWeight: 700,
                          cursor: uploadingFile ? 'not-allowed' : 'pointer',
                          opacity: uploadingFile ? 0.65 : 1,
                        }}
                      >
                        {uploadingFile ? 'Enviando para nuvem...' : '📎 Enviar Arquivo (PDF, DOCX, ZIP até 25MB)'}
                        <input
                          type="file"
                          accept=".pdf,.ipynb,.zip,.py,.docx,.pptx,.csv,.json,.png,.jpg,.jpeg"
                          disabled={uploadingFile}
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              handleMaterialFileUpload(f);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                    {uploadFeedback && (
                      <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '0.35rem' }}>
                        {uploadFeedback}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Link do Repositório GitHub (Opcional)</label>
                    <input
                      type="url"
                      placeholder="https://github.com/usuario/projeto"
                      value={formGithubUrl}
                      onChange={(e) => setFormGithubUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Tags de Pesquisa (separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Python, OpenCV, Machine Learning, Regressão, ESG..."
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="form-input"
                  />
                </div>

                {formError && (
                  <div className="alert-box alert-error" style={{ marginTop: '0.5rem' }}>
                    <div>{formError}</div>
                  </div>
                )}

                {/* Ações do Formulário */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-secondary"
                    style={{ fontWeight: 700 }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="btn btn-primary"
                    style={{ fontWeight: 700, padding: '0.75rem 1.75rem' }}
                  >
                    {formSubmitting ? 'Salvando...' : editingMaterial ? 'Atualizar Material' : 'Publicar Material'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO                                */}
        {/* ============================================================== */}
        {deleteConfirmTarget && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '16px',
                border: '1px solid var(--border-light)',
                maxWidth: '440px',
                width: '100%',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-lg)',
                textAlign: 'center',
              }}
            >
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Excluir Material Didático?
              </h4>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', margin: '0.75rem 0 1.5rem', lineHeight: 1.5 }}>
                Tem certeza que deseja remover <strong>"{deleteConfirmTarget.title}"</strong>? Esta ação não pode ser desfeita.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="btn btn-secondary"
                  style={{ fontWeight: 700, padding: '0.6rem 1.25rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="btn btn-danger"
                  style={{ fontWeight: 700, padding: '0.6rem 1.25rem' }}
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: ARQUIVO FÍSICO AINDA NÃO DISPONÍVEL EM STORAGE          */}
        {/* ============================================================== */}
        {unavailableMaterialModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '16px',
                border: '1px solid var(--border-light)',
                maxWidth: '520px',
                width: '100%',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <span className="badge badge-blue" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                  {unavailableMaterialModal.course} • {unavailableMaterialModal.semester}º Semestre
                </span>
                <span className="badge badge-amber" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                  {unavailableMaterialModal.materialType}
                </span>
              </div>

              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.35 }}>
                {unavailableMaterialModal.title}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.35rem 0 1rem' }}>
                Disciplina: <strong style={{ color: 'var(--text-sub)' }}>{unavailableMaterialModal.subject}</strong>
              </p>

              {unavailableMaterialModal.description && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                  }}
                >
                  {unavailableMaterialModal.description}
                </div>
              )}

              <div
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '10px',
                  padding: '0.9rem 1rem',
                  fontSize: '0.83rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.5,
                  marginBottom: '1.25rem',
                }}
              >
                <strong>Arquivo ainda não disponível no servidor:</strong> este material está catalogado no repositório, mas o arquivo físico (<code>{unavailableMaterialModal.fileUrl}</code>) ainda não foi enviado para o armazenamento em nuvem. Solicite ao docente o upload atualizado ou um link externo válido (Google Drive / GitHub).
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {unavailableMaterialModal.githubUrl && (
                  <a
                    href={unavailableMaterialModal.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontWeight: 700, padding: '0.6rem 1.1rem', textDecoration: 'none' }}
                  >
                    Abrir GitHub ↗
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setUnavailableMaterialModal(null)}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, padding: '0.6rem 1.25rem' }}
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
