'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ToastNotification from '@/components/ui/ToastNotification';

interface UserItem {
  id: string;
  name: string;
  email: string;
  recovery_email?: string | null;
  ra?: string | null;
  role: 'ALUNO' | 'CA_MEMBRO' | 'PROFESSOR' | 'ADMIN';
  course: 'IA' | 'ESG';
  semester: number;
  is_active: boolean;
  is_email_verified?: boolean;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  unverified: number;
  iaCount: number;
  esgCount: number;
  adminCount: number;
  caCount: number;
  studentCount: number;
  professorCount: number;
}

export default function AdminUsuariosPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string; email: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('TODOS');
  const [roleFilter, setRoleFilter] = useState<string>('TODOS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('TODOS');

  // Toasts e Modais de Confirmação
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Modal de Criação / Novo Usuário
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    recoveryEmail: '',
    ra: '',
    role: 'ALUNO' as 'ALUNO' | 'CA_MEMBRO' | 'PROFESSOR' | 'ADMIN',
    course: 'IA' as 'IA' | 'ESG',
    semester: 1,
    password: '',
    isActive: true,
    isEmailVerified: true,
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Modal de Edição de Usuário
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    recoveryEmail: '',
    ra: '',
    role: 'ALUNO' as 'ALUNO' | 'CA_MEMBRO' | 'PROFESSOR' | 'ADMIN',
    course: 'IA' as 'IA' | 'ESG',
    semester: 1,
    isActive: true,
    isEmailVerified: true,
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Modal de Redefinição de Senha
  const [resetUser, setResetUser] = useState<UserItem | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  // Carregar dados e verificar permissão
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data.users);
        setStats(data.data.stats);
        if (data.data.currentUserId) {
          setCurrentUser({
            id: data.data.currentUserId,
            name: '',
            role: data.data.currentUserRole,
            email: '',
          });
        }
      } else {
        if (res.status === 401 || res.status === 403) {
          setCurrentUser(null);
        } else {
          showToast(data.error || 'Erro ao carregar lista de usuários.', 'error');
        }
      }
    } catch {
      showToast('Erro de conexão ao carregar usuários.', 'error');
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtragem dos usuários na tabela
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const s = searchTerm.toLowerCase().trim();
      const matchSearch =
        !s ||
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        (u.recovery_email && u.recovery_email.toLowerCase().includes(s)) ||
        (u.ra && u.ra.toLowerCase().includes(s));

      const matchCourse = courseFilter === 'TODOS' || u.course === courseFilter;
      const matchRole = roleFilter === 'TODOS' || u.role === roleFilter;
      const matchStatus =
        statusFilter === 'TODOS' ||
        (statusFilter === 'ATIVO' && u.is_active) ||
        (statusFilter === 'INATIVO' && !u.is_active);
      const matchVerified =
        verifiedFilter === 'TODOS' ||
        (verifiedFilter === 'VERIFICADO' && u.is_email_verified) ||
        (verifiedFilter === 'PENDENTE' && !u.is_email_verified);

      return matchSearch && matchCourse && matchRole && matchStatus && matchVerified;
    });
  }, [users, searchTerm, courseFilter, roleFilter, statusFilter, verifiedFilter]);

  // Ação: Alternar Ativo/Inativo
  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = !user.is_active;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_status', isActive: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Usuário ${user.name} ${newStatus ? 'ativado' : 'inativado'} com sucesso!`, 'success');
        fetchUsers();
      } else {
        showToast(data.error || 'Erro ao alterar status do usuário.', 'error');
      }
    } catch {
      showToast('Falha ao comunicar com o servidor.', 'error');
    }
  };

  // Ação: Excluir Usuário do Banco com Modal Seguro
  const handleDeleteUser = (user: UserItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Conta do Usuário Definitivamente?',
      message: `Tem certeza que deseja EXCLUIR PERMANENTEMENTE o usuário "${user.name}" (${user.email}) do banco de dados?\n\nEsta ação removerá todos os registros associados e liberará o e-mail institucional para que ele possa se cadastrar novamente do zero.`,
      confirmLabel: 'Sim, Excluir Conta Permanentemente',
      cancelLabel: 'Cancelar',
      isDanger: true,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/admin/users/${user.id}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(data.message || `Usuário ${user.name} excluído com sucesso!`, 'success');
            fetchUsers();
          } else {
            showToast(data.error || 'Erro ao excluir usuário.', 'error');
          }
        } catch {
          showToast('Erro de conexão ao excluir conta.', 'error');
        }
      },
    });
  };

  // Ação: Criar Novo Usuário
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCreate(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Usuário criado com sucesso!', 'success');
        setIsCreateModalOpen(false);
        setCreateForm({
          name: '',
          email: '',
          recoveryEmail: '',
          ra: '',
          role: 'ALUNO',
          course: 'IA',
          semester: 1,
          password: '',
          isActive: true,
          isEmailVerified: true,
        });
        fetchUsers();
      } else {
        showToast(data.error || 'Erro ao criar usuário.', 'error');
      }
    } catch {
      showToast('Erro de comunicação com o servidor.', 'error');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Abrir Modal de Edição
  const openEditModal = (user: UserItem) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      recoveryEmail: user.recovery_email || '',
      ra: user.ra || '',
      role: user.role,
      course: user.course,
      semester: user.semester,
      isActive: user.is_active,
      isEmailVerified: Boolean(user.is_email_verified),
    });
  };

  // Ação: Salvar Edição de Usuário
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmittingEdit(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Dados do usuário atualizados com sucesso!', 'success');
        setEditingUser(null);
        fetchUsers();
      } else {
        showToast(data.error || 'Erro ao atualizar dados do usuário.', 'error');
      }
    } catch {
      showToast('Erro ao atualizar usuário.', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Ação: Redefinir Senha
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    setIsSubmittingReset(true);
    try {
      const res = await fetch(`/api/admin/users/${resetUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPasswordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Senha de ${resetUser.name} redefinida com sucesso!`, 'success');
        setResetUser(null);
        setNewPasswordInput('');
      } else {
        showToast(data.error || 'Erro ao redefinir senha.', 'error');
      }
    } catch {
      showToast('Erro ao comunicar com o servidor.', 'error');
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>Administrador</span>;
      case 'CA_MEMBRO':
        return <span style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>Membro CA</span>;
      case 'PROFESSOR':
        return <span style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' }}>Docente</span>;
      default:
        return <span style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>Discente</span>;
    }
  };

  const isAuthorized = authChecked && currentUser?.role === 'ADMIN';

  return (
    <AppLayout activePath="/admin/usuarios">
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
        <ToastNotification message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          cancelLabel={confirmDialog.cancelLabel}
          isDanger={confirmDialog.isDanger}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        />

        {/* Cabeçalho Oficial do Painel */}
        <div
          className="admin-header-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                FATEC RIO CLARO — SECRETARIA & ADMINISTRAÇÃO
              </span>
              <span className="badge badge-rose">
                Acesso Restrito ADMIN
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Gestão de Usuários & Contas Discentes
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem', margin: '0.35rem 0 0 0' }}>
              Pesquise, ative, inative ou exclua cadastros institucionais de alunos e professores diretamente pelo banco Supabase.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              title="Recarregar dados"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              <span>Atualizar</span>
            </button>
            {isAuthorized && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.85rem',
                  backgroundColor: '#16a34a',
                  borderColor: '#16a34a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 700,
                }}
              >
                <span>+ Novo Usuário</span>
              </button>
            )}
          </div>
        </div>

        {/* Verificação de Permissão: Bloqueio para Não-Administradores */}
        {authChecked && !isAuthorized ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #fed7aa',
              padding: '2.5rem',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}><svg width='44' height='44' viewBox='0 0 24 24' fill='none' stroke='#b91c1c' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='11' width='18' height='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#9a3412', marginBottom: '0.5rem' }}>
              Acesso Exclusivo para Administradores
            </h3>
            <p style={{ color: '#7c2d12', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Apenas contas com privilégio de <strong>ADMIN</strong> (Secretaria Acadêmica / Diretoria da FATEC Rio Claro) possuem autorização para gerenciar e excluir usuários do banco de dados.
            </p>
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.65rem 1.75rem', backgroundColor: '#0284c7' }}>
              Efetuar Login como Administrador
            </Link>
          </div>
        ) : (
          <>
            {/* Cards de Métricas em Tempo Real */}
            {stats && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '0.85rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div className="admin-stat-card">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total de Usuários</div>
                  <div className="admin-stat-card-val">{stats.total}</div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem' }}>{stats.active} ativos / {stats.inactive} inativos</div>
                </div>

                <div className="admin-stat-card">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>E-mails Validados (OTP)</div>
                  <div className="admin-stat-card-val" style={{ color: '#0284c7' }}>{stats.verified}</div>
                  <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.2rem' }}>{stats.unverified} pendentes</div>
                </div>

                <div className="admin-stat-card">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Inteligência Artificial</div>
                  <div className="admin-stat-card-val" style={{ color: '#7c3aed' }}>{stats.iaCount}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Matutino / IA</div>
                </div>

                <div className="admin-stat-card">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Gestão ESG</div>
                  <div className="admin-stat-card-val" style={{ color: '#059669' }}>{stats.esgCount}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Matutino / ESG</div>
                </div>

                <div className="admin-stat-card">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Admins & CA</div>
                  <div className="admin-stat-card-val" style={{ color: '#b91c1c' }}>{stats.adminCount + stats.caCount}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{stats.adminCount} Admins / {stats.caCount} CA</div>
                </div>
              </div>
            )}

            {/* Barra de Busca e Filtros Rápidos */}
            <div className="admin-filter-bar">
              {/* Campo de Busca Geral */}
              <div style={{ flex: '1 1 280px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Buscar por nome, e-mail institucional, recuperação ou RA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              {/* Filtro de Curso */}
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
              >
                <option value="TODOS">Todos os Cursos</option>
                <option value="IA">Inteligência Artificial (IA)</option>
                <option value="ESG">Gestão ESG</option>
              </select>

              {/* Filtro de Cargo */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
              >
                <option value="TODOS">Todos os Cargos</option>
                <option value="ALUNO">Discentes (Alunos)</option>
                <option value="CA_MEMBRO">Membros do CA</option>
                <option value="PROFESSOR">Docentes</option>
                <option value="ADMIN">Administradores</option>
              </select>

              {/* Filtro de Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
              >
                <option value="TODOS">Status (Todos)</option>
                <option value="ATIVO">Somente Ativos</option>
                <option value="INATIVO">Somente Inativos</option>
              </select>

              {/* Filtro de Verificação de E-mail */}
              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
              >
                <option value="TODOS">Validação OTP (Todas)</option>
                <option value="VERIFICADO">E-mail Validado</option>
                <option value="PENDENTE">Validação Pendente</option>
              </select>

              {(searchTerm || courseFilter !== 'TODOS' || roleFilter !== 'TODOS' || statusFilter !== 'TODOS' || verifiedFilter !== 'TODOS') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCourseFilter('TODOS');
                    setRoleFilter('TODOS');
                    setStatusFilter('TODOS');
                    setVerifiedFilter('TODOS');
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '0.55rem 0.75rem', fontSize: '0.8rem' }}
                >
                  Limpar Filtros
                </button>
              )}
            </div>

            {/* Tabela de Usuários */}
            <div className="admin-table-card">
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                  Usuários Encontrados: <strong>{filteredUsers.length}</strong>
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Ordenados por data de cadastro mais recente
                </span>
              </div>

              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}><svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='#0284c7' strokeWidth='2'><circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/></svg></div>
                  Carregando lista de usuários do Supabase...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}><svg width='36' height='36' viewBox='0 0 24 24' fill='none' stroke='var(--text-muted)' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg></div>
                  Nenhum usuário corresponde aos filtros selecionados.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '0.85rem 1rem' }}>Estudante / RA</th>
                        <th style={{ padding: '0.85rem 1rem' }}>E-mails (Institucional & Recuperação)</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Curso & Semestre</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Cargo</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Status & Validação</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {/* Nome e RA */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div className="admin-user-title">{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                              RA: {user.ra || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Não informado</span>}
                            </div>
                          </td>

                          {/* E-mails */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: '#0369a1', wordBreak: 'break-all' }}>
                              {user.email}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                              Recup: {user.recovery_email ? <strong>{user.recovery_email}</strong> : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Não cadastrado</span>}
                            </div>
                          </td>

                          {/* Curso e Semestre */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span
                                style={{
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  backgroundColor: user.course === 'IA' ? '#ede9fe' : '#dcfce7',
                                  color: user.course === 'IA' ? '#6d28d9' : '#15803d',
                                }}
                              >
                                {user.course}
                              </span>
                              <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                                {user.semester}º Semestre
                              </span>
                            </div>
                          </td>

                          {/* Cargo */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {getRoleBadge(user.role)}
                          </td>

                          {/* Status e Validação */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              {/* Ativo / Inativo */}
                              <div>
                                {user.is_active ? (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
                                    Ativo
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#dc2626' }}></span>
                                    Inativo
                                  </span>
                                )}
                              </div>
                              {/* E-mail Verificado */}
                              <div>
                                {user.is_email_verified ? (
                                  <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600 }}>
                                    ✓ OTP Confirmado
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 600 }}>
                                    • OTP Pendente
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Ações */}
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                              {/* Botão de Alternar Status */}
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className="btn btn-secondary"
                                style={{
                                  padding: '0.3rem 0.55rem',
                                  fontSize: '0.75rem',
                                  color: user.is_active ? '#dc2626' : '#16a34a',
                                  borderColor: user.is_active ? '#fca5a5' : '#86efac',
                                }}
                                title={user.is_active ? 'Inativar Usuário' : 'Ativar Usuário'}
                              >
                                {user.is_active ? 'Inativar' : 'Ativar'}
                              </button>

                              {/* Botão de Editar */}
                              <button
                                type="button"
                                onClick={() => openEditModal(user)}
                                className="btn btn-secondary"
                                style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center' }}
                                title="Editar dados do usuário"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M12 20h9"/>
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                </svg>
                              </button>

                              {/* Botão de Resetar Senha */}
                              <button
                                type="button"
                                onClick={() => {
                                  setResetUser(user);
                                  setNewPasswordInput('');
                                }}
                                className="btn btn-secondary"
                                style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center' }}
                                title="Redefinir senha de acesso"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <circle cx="7.5" cy="15.5" r="5.5"/>
                                  <path d="m21 2-9.6 9.6"/>
                                  <path d="m15.5 7.5 3 3"/>
                                </svg>
                              </button>

                              {/* Botão de Excluir */}
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user)}
                                className="btn-danger-outline"
                                style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                                title="Excluir usuário do banco de dados"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* MODAL: CRIAR NOVO USUÁRIO */}
        {isCreateModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
          >
            <div
              className="admin-modal-card"
              style={{
                borderRadius: '12px',
                width: '100%',
                maxWidth: '520px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '1.75rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  Cadastrar Novo Usuário
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    E-mail Institucional * (@aluno.cps.sp.gov.br ou @fatec.sp.gov.br)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@aluno.cps.sp.gov.br"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    E-mail Pessoal de Recuperação (Opcional para admin)
                  </label>
                  <input
                    type="email"
                    placeholder="exemplo@gmail.com"
                    value={createForm.recoveryEmail}
                    onChange={(e) => setCreateForm({ ...createForm, recoveryEmail: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Registro Acadêmico (RA)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 4001001"
                      value={createForm.ra}
                      onChange={(e) => setCreateForm({ ...createForm, ra: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Cargo / Papel
                    </label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                    >
                      <option value="ALUNO">Discente (Aluno)</option>
                      <option value="CA_MEMBRO">Membro do CA</option>
                      <option value="PROFESSOR">Docente</option>
                      <option value="ADMIN">Administrador Geral</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Curso
                    </label>
                    <select
                      value={createForm.course}
                      onChange={(e) => setCreateForm({ ...createForm, course: e.target.value as any })}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                    >
                      <option value="IA">Inteligência Artificial</option>
                      <option value="ESG">Gestão ESG</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Semestre
                    </label>
                    <select
                      value={createForm.semester}
                      onChange={(e) => setCreateForm({ ...createForm, semester: parseInt(e.target.value, 10) })}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                    >
                      <option value={1}>1º Semestre</option>
                      <option value={2}>2º Semestre</option>
                      <option value={3}>3º Semestre</option>
                      <option value={4}>4º Semestre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Senha Provisória * (Mín. 8 caracteres, maiúscula, número e símbolo)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Fatec@2026"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={createForm.isActive}
                      onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                    />
                    Conta Ativa
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={createForm.isEmailVerified}
                      onChange={(e) => setCreateForm({ ...createForm, isEmailVerified: e.target.checked })}
                    />
                    Marcar E-mail como Já Verificado (dispensa OTP)
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCreate}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1.25rem', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                  >
                    {isSubmittingCreate ? 'Criando...' : 'Criar Usuário'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDITAR USUÁRIO */}
        {editingUser && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
          >
            <div
              className="admin-modal-card"
              style={{
                borderRadius: '12px',
                width: '100%',
                maxWidth: '520px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '1.75rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  Editar Dados do Usuário
                </h3>
                <button
                  onClick={() => setEditingUser(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    E-mail Institucional *
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    E-mail Pessoal de Recuperação
                  </label>
                  <input
                    type="email"
                    value={editForm.recoveryEmail}
                    onChange={(e) => setEditForm({ ...editForm, recoveryEmail: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Registro Acadêmico (RA)
                    </label>
                    <input
                      type="text"
                      value={editForm.ra}
                      onChange={(e) => setEditForm({ ...editForm, ra: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Cargo / Papel
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                    >
                      <option value="ALUNO">Discente (Aluno)</option>
                      <option value="CA_MEMBRO">Membro do CA</option>
                      <option value="PROFESSOR">Docente</option>
                      <option value="ADMIN">Administrador Geral</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Curso
                    </label>
                    <select
                      value={editForm.course}
                      onChange={(e) => setEditForm({ ...editForm, course: e.target.value as any })}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                    >
                      <option value="IA">Inteligência Artificial</option>
                      <option value="ESG">Gestão ESG</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      Semestre
                    </label>
                    <select
                      value={editForm.semester}
                      onChange={(e) => setEditForm({ ...editForm, semester: parseInt(e.target.value, 10) })}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                    >
                      <option value={1}>1º Semestre</option>
                      <option value={2}>2º Semestre</option>
                      <option value={3}>3º Semestre</option>
                      <option value={4}>4º Semestre</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    />
                    Conta Ativa
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editForm.isEmailVerified}
                      onChange={(e) => setEditForm({ ...editForm, isEmailVerified: e.target.checked })}
                    />
                    E-mail Verificado (OTP Confirmado)
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEdit}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1.25rem' }}
                  >
                    {isSubmittingEdit ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: REDEFINIR SENHA */}
        {resetUser && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
          >
            <div
              className="admin-modal-card"
              style={{
                borderRadius: '12px',
                width: '100%',
                maxWidth: '440px',
                padding: '1.75rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  Redefinir Senha de Acesso
                </h3>
                <button
                  onClick={() => setResetUser(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
                Defina uma nova senha para <strong>{resetUser.name}</strong> ({resetUser.email}).
              </p>

              <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Nova Senha * (Mín. 8 dígitos, maiúscula, número e símbolo)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="NovaSenha@123"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setResetUser(null)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReset}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1.25rem', backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                  >
                    {isSubmittingReset ? 'Gravando...' : 'Gravar Nova Senha'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

