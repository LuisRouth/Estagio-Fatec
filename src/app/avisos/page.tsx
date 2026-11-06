'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { Announcement, CourseType } from '@/lib/types';
import AnnouncementCard from '@/components/announcements/AnnouncementCard';
import AnnouncementDetailModal from '@/components/announcements/AnnouncementDetailModal';
import AnnouncementFormModal from '@/components/announcements/AnnouncementFormModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ToastNotification from '@/components/ui/ToastNotification';

export default function AvisosPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Filtros
  const [selectedCourse, setSelectedCourse] = useState<CourseType | 'TODOS'>('TODOS');
  const [selectedSemester, setSelectedSemester] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Modais
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // Feedback 100% Frontend (ConfirmModal & Toast)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => {},
  });

  const [toast, setToast] = useState<{ message: string | null; type: 'success' | 'error' | 'info' }>({
    message: null,
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Carregar sessão do usuário
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

  const canManage = currentUser?.role === 'ADMIN' || currentUser?.role === 'CA_MEMBRO' || currentUser?.role === 'PROFESSOR';

  // Buscar comunicados da API
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      let url = '/api/announcements';
      const params = new URLSearchParams();
      if (selectedCourse !== 'TODOS') params.append('course', selectedCourse);
      if (selectedSemester > 0) params.append('semester', selectedSemester.toString());
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setAnnouncements(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar comunicados:', err);
      showToast('Falha ao carregar comunicados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedCourse, selectedSemester]);

  // Abertura de Modais
  const handleOpenDetail = (ann: Announcement) => {
    setSelectedAnnouncement(ann);
    setIsDetailOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setIsFormOpen(true);
  };

  // Salvar (Criar ou Atualizar)
  const handleSaveAnnouncement = async (formData: Partial<Announcement>) => {
    try {
      if (editingAnnouncement) {
        // Atualizar
        const res = await fetch(`/api/announcements/${editingAnnouncement.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao atualizar comunicado.');

        showToast('Comunicado atualizado com sucesso!');
      } else {
        // Criar
        const res = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao publicar comunicado.');

        showToast('Comunicado publicado no mural com sucesso!');
      }

      await fetchAnnouncements();
    } catch (err: any) {
      throw err;
    }
  };

  // Excluir com ConfirmModal
  const handleDeleteAnnouncement = (ann: Announcement) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Comunicado Oficial',
      message: `Deseja realmente remover o comunicado "${ann.title}" do mural? Essa ação não pode ser desfeita.`,
      confirmLabel: 'Sim, Excluir Comunicado',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/announcements/${ann.id}`, { method: 'DELETE' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Erro ao excluir comunicado.');

          showToast('Comunicado removido com sucesso!');
          if (selectedAnnouncement?.id === ann.id) {
            setIsDetailOpen(false);
          }
          await fetchAnnouncements();
        } catch (err: any) {
          showToast(err.message || 'Erro ao excluir comunicado.', 'error');
        }
      },
    });
  };

  // Filtro em tempo real por texto
  const filteredAnnouncements = announcements.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || (a.author_name && a.author_name.toLowerCase().includes(q));
  });

  return (
    <AppLayout activePath="/avisos">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Cabeçalho do Mural */}
        <div
          className="card-interactive"
          style={{
            borderRadius: '20px',
            padding: '2.25rem 2rem',
            backgroundColor: '#ffffff',
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
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span className="badge badge-blue">Mural Institucional</span>
              <span className="badge badge-emerald">FATEC Rio Claro</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              Mural de Avisos e Comunicados Oficiais
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem', marginTop: '0.35rem', maxWidth: '680px' }}>
              Informativos da Coordenação de Inteligência Artificial e Gestão ESG, Secretaria Acadêmica e Centro Acadêmico (CA).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
              ← Voltar ao Início
            </Link>

            {canManage && (
              <button
                onClick={handleOpenCreate}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                + Novo Comunicado Oficial
              </button>
            )}
          </div>
        </div>

        {/* Barra de Filtros e Busca Padronizada */}
        <div
          className="card-interactive"
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Filtro de Cursos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Curso:
              </span>
              {[
                { id: 'TODOS', label: 'Todos os Cursos' },
                { id: 'IA', label: 'Inteligência Artificial' },
                { id: 'ESG', label: 'Gestão ESG' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourse(c.id as any)}
                  className={`announcement-filter-btn ${selectedCourse === c.id ? 'active' : ''}`}
                  style={{
                    fontSize: '0.825rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '20px',
                    fontWeight: selectedCourse === c.id ? 800 : 500,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Barra de Busca */}
            <div style={{ minWidth: '260px', flex: 1, maxWidth: '380px' }}>
              <input
                type="text"
                placeholder="Buscar comunicado por título ou assunto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ padding: '0.55rem 1rem', borderRadius: '12px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Filtro de Semestres */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Semestre:
            </span>
            {[
              { val: 0, label: 'Todos os Semestres' },
              { val: 1, label: '1º Semestre' },
              { val: 2, label: '2º Semestre' },
              { val: 3, label: '3º Semestre' },
              { val: 4, label: '4º Semestre' },
            ].map((s) => (
              <button
                key={s.val}
                onClick={() => setSelectedSemester(s.val)}
                className={`announcement-filter-btn ${selectedSemester === s.val ? 'active' : ''}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grade de Cards Padronizados de Comunicados */}
        {loading ? (
          <div>
            {/* Skeletons de Comunicados */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="card-interactive"
                  style={{
                    height: '430px',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border-light)',
                    background: '#ffffff',
                  }}
                >
                  <div>
                    <div className="skeleton-shimmer" style={{ width: '100%', height: '160px', borderRadius: '12px', marginBottom: '1rem' }} />
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div className="skeleton-shimmer" style={{ width: '80px', height: '20px', borderRadius: '6px' }} />
                      <div className="skeleton-shimmer" style={{ width: '70px', height: '20px', borderRadius: '6px' }} />
                    </div>
                    <div className="skeleton-shimmer" style={{ width: '90%', height: '22px', borderRadius: '6px', marginBottom: '0.5rem' }} />
                    <div className="skeleton-shimmer" style={{ width: '65%', height: '18px', borderRadius: '6px', marginBottom: '0.75rem' }} />
                    <div className="skeleton-shimmer" style={{ width: '95%', height: '14px', borderRadius: '4px', marginBottom: '0.4rem' }} />
                    <div className="skeleton-shimmer" style={{ width: '80%', height: '14px', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                    <div className="skeleton-shimmer" style={{ width: '100px', height: '18px' }} />
                    <div className="skeleton-shimmer" style={{ width: '70px', height: '18px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '4.5rem 2rem',
              textAlign: 'center',
              border: '1px dashed var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            <div style={{ width: '48px', height: '48px', margin: '0 auto', borderRadius: '50%', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
            <div style={{ maxWidth: '480px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Nenhum comunicado encontrado para este filtro
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
                Tente selecionar outro curso ou semestre, ou limpe a busca por texto.
              </p>
            </div>
            {canManage && (
              <button onClick={handleOpenCreate} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                + Publicar Primeiro Comunicado
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredAnnouncements.map((ann) => (
              <AnnouncementCard
                key={ann.id}
                announcement={ann}
                onOpenDetail={handleOpenDetail}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteAnnouncement}
                canManage={canManage}
              />
            ))}
          </div>
        )}

        {/* Modal de Detalhes em Tela Cheia ("Ver em tela cheia / Ler mais") */}
        <AnnouncementDetailModal
          announcement={selectedAnnouncement}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteAnnouncement}
          canManage={canManage}
        />

        {/* Modal de Criação / Edição para ADM e CA */}
        <AnnouncementFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveAnnouncement}
          editingAnnouncement={editingAnnouncement}
        />

        {/* Modal de Confirmação 100% Frontend */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        />

        {/* Notificação Toast 100% Frontend */}
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null, type: 'success' })}
        />
      </div>
    </AppLayout>
  );
}
