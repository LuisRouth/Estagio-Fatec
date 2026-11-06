'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: 'SALGADO' | 'BEBIDA' | 'DOCE' | 'CONGELADO' | 'OUTRO';
  price: number;
  current_stock: number;
  min_stock_alert: number;
  image_url: string | null;
  barcode: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: 'ALUNO' | 'CA_MEMBRO' | 'PROFESSOR' | 'ADMIN';
}

export default function CantinaAdminPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('TODOS');

  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<'SALGADO' | 'BEBIDA' | 'DOCE' | 'CONGELADO' | 'OUTRO'>('SALGADO');
  const [formPrice, setFormPrice] = useState<number>(3.50);
  const [formStock, setFormStock] = useState<number>(20);
  const [formMinStock, setFormMinStock] = useState<number>(5);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Notificação toast temporária
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQuickLoggingIn, setIsQuickLoggingIn] = useState(false);

  // Estados do Gerenciador de Imagem do Produto
  const [imageInputTab, setImageInputTab] = useState<'upload' | 'gallery' | 'url'>('gallery');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [gallerySearch, setGallerySearch] = useState('');

  const CANTEEN_PRESET_IMAGES = [
    { label: 'Torcida Churrasco', path: '/images/products/torcida_churrasco.jpg', category: 'SALGADO' },
    { label: 'Torcida Queijo', path: '/images/products/torcida_queijo.jpg', category: 'SALGADO' },
    { label: 'Torcida Cebola', path: '/images/products/torcida_cebola.jpg', category: 'SALGADO' },
    { label: 'Torcida Costelinha', path: '/images/products/torcida_costelinha.jpg', category: 'SALGADO' },
    { label: 'Fofura Presunto', path: '/images/products/fofura_presunto.png', category: 'SALGADO' },
    { label: 'Crokíssimo Salsa', path: '/images/products/crokissimo_salsa.jpg', category: 'SALGADO' },
    { label: 'Mendorato Japonês', path: '/images/products/amendoim_mendorato.jpg', category: 'SALGADO' },
    { label: 'Club Social', path: '/images/products/club_social_original.jpg', category: 'SALGADO' },
    { label: 'Pipoca Yoki', path: '/images/products/pipoca_microondas_yoki.jpg', category: 'SALGADO' },
    { label: 'Coxinha de Frango', path: '/images/products/coxinha_frango.jpg', category: 'CONGELADO' },
    { label: 'Enrolado Presunto/Queijo', path: '/images/products/enrolado_presunto_queijo.jpg', category: 'CONGELADO' },
    { label: 'Hambúrguer com Bacon', path: '/images/products/hamburguer_bacon.jpg', category: 'CONGELADO' },
    { label: 'Bolinho de Carne', path: '/images/products/bolinho_carne.jpg', category: 'CONGELADO' },
    { label: 'Esfiha de Carne', path: '/images/products/esfiha_carne.jpg', category: 'CONGELADO' },
    { label: 'Pão de Queijo', path: '/images/products/pao_de_queijo.jpg', category: 'CONGELADO' },
    { label: 'Hot Pocket Sadia', path: '/images/products/hot_pocket_sadia.jpg', category: 'CONGELADO' },
    { label: 'Pão de Mel Bauducco', path: '/images/products/pao_de_mel_bauducco.jpg', category: 'DOCE' },
    { label: 'Paçoquita Rolha', path: '/images/products/pacoquita.jpg', category: 'DOCE' },
    { label: 'Pé de Moleque DaColônia', path: '/images/products/pe_de_moleque_dacolonia.jpg', category: 'DOCE' },
    { label: 'Chiclete Poosh', path: '/images/products/chiclete_poosh.png', category: 'DOCE' },
    { label: 'Bala Goma Tubo Dori', path: '/images/products/bala_goma_tubo_dori.png', category: 'DOCE' },
    { label: 'Regaliz Tubo Gigante Dori', path: '/images/products/bala_tubo_gigante_dori.png', category: 'DOCE' },
    { label: 'Drops Freegells', path: '/images/products/drops_freegells.png', category: 'DOCE' },
    { label: 'Tortuguita Brigadeiro', path: '/images/products/tortuguita_brigadeiro.jpg', category: 'DOCE' },
    { label: 'Trento Chocolate', path: '/images/products/trento_chocolate.jpg', category: 'DOCE' },
    { label: 'Biscoito Teens', path: '/images/products/biscoito_teens_chocolate.webp', category: 'DOCE' },
    { label: 'Coca-Cola Lata', path: '/images/products/coca_cola_lata.jpg', category: 'BEBIDA' },
    { label: 'Fanta Laranja Lata', path: '/images/products/fanta_laranja_lata.jpg', category: 'BEBIDA' },
    { label: 'Água Minalba', path: '/images/products/minalba_sem_gas.jpg', category: 'BEBIDA' },
    { label: 'Energético X-UP', path: '/images/products/xup_energetico.jpg', category: 'BEBIDA' },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/canteen/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setFormImageUrl(data.url);
        showToast('Foto do produto enviada e salva!');
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setFormImageUrl(reader.result as string);
          showToast('Foto importada via arquivo local!');
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setFormImageUrl(reader.result as string);
        showToast('Foto importada com sucesso!');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickAdminLogin = async () => {
    setIsQuickLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'luis.dev@fatec.sp.gov.br',
          password: 'Fatec@2026',
        }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert('Não foi possível conectar como admin de demonstração.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de rede ao conectar.');
    } finally {
      setIsQuickLoggingIn(false);
    }
  };

  // 1. Verificar autenticação e permissão (ADMIN ou CA_MEMBRO)
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setUser(data.data);
          if (data.data.role === 'ADMIN' || data.data.role === 'CA_MEMBRO') {
            fetchProducts();
          }
        }
      }
    } catch (err) {
      console.error('Falha ao verificar autenticação:', err);
    } finally {
      setAuthChecked(true);
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Passar all=true para listar também produtos inativos
      const res = await fetch('/api/canteen/products?all=true');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Ajuste rápido de estoque (+1, -1 ou reposição)
  const handleQuickStockAdjust = async (productId: string, delta: number) => {
    try {
      const res = await fetch(`/api/canteen/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity_delta: delta,
          reason: delta > 0 ? 'Reposição rápida de balcão' : 'Baixa rápida manual',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, current_stock: data.data.current_stock } : p))
        );
        showToast(`Estoque atualizado: ${data.data.current_stock} un.`);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Não foi possível alterar o estoque.');
      }
    } catch (err) {
      console.error('Falha no ajuste de estoque:', err);
    }
  };

  // 3. Abrir modal para novo produto ou edição
  const handleOpenModal = (product?: Product) => {
    setFormError('');
    setFormSuccess('');
    if (product) {
      setEditingProduct(product);
      setFormName(product.name);
      setFormDescription(product.description || '');
      setFormCategory(product.category);
      setFormPrice(product.price);
      setFormStock(product.current_stock);
      setFormMinStock(product.min_stock_alert);
      setFormImageUrl(product.image_url || '');
      setFormAvailable(product.is_available);
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormDescription('');
      setFormCategory('SALGADO');
      setFormPrice(3.50);
      setFormStock(15);
      setFormMinStock(5);
      setFormImageUrl('');
      setFormAvailable(true);
    }
    setIsModalOpen(true);
  };

  // 4. Salvar (Criar ou Atualizar)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    try {
      const payload = {
        name: formName,
        description: formDescription.trim() || undefined,
        category: formCategory,
        price: Number(formPrice),
        current_stock: Number(formStock),
        min_stock_alert: Number(formMinStock),
        image_url: formImageUrl.trim() || undefined,
        is_available: formAvailable,
      };

      if (editingProduct) {
        // Atualizar PUT /api/canteen/products/[id]
        const res = await fetch(`/api/canteen/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao atualizar produto.');

        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data.data : p)));
        showToast('Produto atualizado com sucesso!');
        setIsModalOpen(false);
      } else {
        // Criar POST /api/canteen/products
        const res = await fetch('/api/canteen/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar produto.');

        setProducts((prev) => [data.data, ...prev]);
        showToast('Novo produto cadastrado com sucesso!');
        setIsModalOpen(false);
      }
    } catch (err: any) {
      setFormError(err.message || 'Erro inesperado ao salvar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Excluir produto
  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Tem certeza que deseja excluir "${product.name}" do catálogo da cantina?`)) return;

    try {
      const res = await fetch(`/api/canteen/products/${product.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        showToast(`"${product.name}" foi removido do catálogo.`);
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao excluir produto.');
      }
    } catch (err) {
      console.error('Erro na exclusão:', err);
    }
  };

  // Filtragem de produtos
  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'TODOS' || p.category === categoryFilter;
    const matchesSearch =
      search.trim() === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const isAuthorized = user && (user.role === 'ADMIN' || user.role === 'CA_MEMBRO');

  return (
    <AppLayout activePath="/cantina">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Toast Notifier */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '80px',
              right: '24px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '0.85rem 1.5rem',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 600,
              zIndex: 9999,
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            ✓ {toastMessage}
          </div>
        )}

        {/* Topo do Painel Administrativo */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem 2.25rem',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-rose" style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}>
                🛡️ Área Restrita
              </span>
              <span className="badge badge-blue">
                {user?.role === 'ADMIN' ? 'Administrador Geral / Secretaria' : 'Membro do Centro Acadêmico (CA)'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Gestão de Estoque & Catálogo Oficial
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Painel de Gestão da Cantina Discente
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
              Controle de entrada e saída de produtos, atualização de preços por Pix e monitoramento de estoque mínimo em tempo real.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/cantina" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.65rem 1.25rem' }}>
              ← Voltar à Loja
            </Link>
            {isAuthorized && (
              <button
                onClick={() => handleOpenModal()}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>+</span> Cadastrar Novo Produto
              </button>
            )}
          </div>
        </div>

        {/* Verificação de Permissão de Acesso */}
        {authChecked && !isAuthorized ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '4rem 2rem',
              border: '1px dashed var(--border-light)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            <div style={{ fontSize: '3.5rem' }}>🔒</div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Acesso Restrito a Gestores da Cantina
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', maxWidth: '520px', lineHeight: 1.6 }}>
              Apenas membros eleitos do <strong>Centro Acadêmico (CA_MEMBRO)</strong> ou administradores da unidade (Secretaria/Coordenação) possuem autorização para alterar estoque e preços da cantina discente.
            </p>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={handleQuickAdminLogin}
                disabled={isQuickLoggingIn}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.5rem', backgroundColor: '#0284c7' }}
              >
                {isQuickLoggingIn ? 'Autenticando...' : '⚡ Acessar como Administrador (1-Clique Dev)'}
              </button>
              <Link href="/login" className="btn btn-secondary" style={{ padding: '0.65rem 1.5rem' }}>
                Fazer Login Manual
              </Link>
              <Link href="/cantina" className="btn btn-secondary" style={{ padding: '0.65rem 1.5rem' }}>
                Retornar ao Catálogo
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Barra de Filtros e Busca */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.25rem 1.75rem',
                border: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['TODOS', 'SALGADO', 'BEBIDA', 'DOCE', 'CONGELADO'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`btn ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
                  >
                    {cat === 'TODOS' ? 'Todos os Itens' : cat}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', minWidth: '260px' }}>
                <input
                  type="text"
                  placeholder="Filtrar por nome ou sabor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Tabela de Gestão de Produtos */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1px solid var(--border-light)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Produto / Categoria</th>
                      <th style={{ padding: '1rem', fontWeight: 700 }}>Preço Unitário</th>
                      <th style={{ padding: '1rem', fontWeight: 700 }}>Estoque Atual</th>
                      <th style={{ padding: '1rem', fontWeight: 700 }}>Ajuste Rápido (+ / -)</th>
                      <th style={{ padding: '1rem', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 700, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          Nenhum produto cadastrado com esses filtros.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isLowStock = p.current_stock > 0 && p.current_stock <= p.min_stock_alert;
                        const isOutOfStock = p.current_stock <= 0;

                        return (
                          <tr
                            key={p.id}
                            style={{
                              borderBottom: '1px solid var(--border-light)',
                              transition: 'background-color 0.15s ease',
                            }}
                          >
                            {/* Nome + Categoria */}
                            <td style={{ padding: '1.15rem 1.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                <div
                                  style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--bg-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.4rem',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border-light)',
                                    flexShrink: 0,
                                  }}
                                >
                                  {p.image_url ? (
                                    <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <span>📦</span>
                                  )}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.925rem' }}>
                                    {p.name}
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.2rem' }}>
                                    <span className="badge badge-blue" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                                      {p.category}
                                    </span>
                                    {p.barcode && (
                                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                        EAN: {p.barcode}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Preço */}
                            <td style={{ padding: '1.15rem 1rem', fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1rem' }}>
                              R$ {Number(p.price).toFixed(2).replace('.', ',')}
                            </td>

                            {/* Estoque */}
                            <td style={{ padding: '1.15rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span
                                  style={{
                                    fontWeight: 800,
                                    fontSize: '1.05rem',
                                    color: isOutOfStock
                                      ? '#ef4444'
                                      : isLowStock
                                      ? '#f59e0b'
                                      : 'var(--accent-emerald)',
                                  }}
                                >
                                  {p.current_stock}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  (mín: {p.min_stock_alert})
                                </span>
                              </div>
                            </td>

                            {/* Ajuste Rápido */}
                            <td style={{ padding: '1.15rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <button
                                  onClick={() => handleQuickStockAdjust(p.id, -1)}
                                  disabled={p.current_stock <= 0}
                                  title="Remover 1 unidade do estoque"
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-light)',
                                    backgroundColor: '#ffffff',
                                    fontWeight: 700,
                                    cursor: p.current_stock <= 0 ? 'not-allowed' : 'pointer',
                                    opacity: p.current_stock <= 0 ? 0.4 : 1,
                                  }}
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => handleQuickStockAdjust(p.id, 1)}
                                  title="Adicionar 1 unidade ao estoque"
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-light)',
                                    backgroundColor: '#ffffff',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => handleQuickStockAdjust(p.id, 10)}
                                  title="Reposição em lote (+10 unidades)"
                                  style={{
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-light)',
                                    backgroundColor: 'var(--bg-muted)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: 'var(--accent-emerald)',
                                    cursor: 'pointer',
                                  }}
                                >
                                  +10
                                </button>
                              </div>
                            </td>

                            {/* Status */}
                            <td style={{ padding: '1.15rem 1rem' }}>
                              {isOutOfStock ? (
                                <span className="badge" style={{ backgroundColor: '#ffe4e6', color: '#e11d48', fontSize: '0.72rem' }}>
                                  Esgotado
                                </span>
                              ) : isLowStock ? (
                                <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '0.72rem' }}>
                                  Estoque Crítico
                                </span>
                              ) : (
                                <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                                  Normal
                                </span>
                              )}
                            </td>

                            {/* Ações */}
                            <td style={{ padding: '1.15rem 1.5rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleOpenModal(p)}
                                  className="btn btn-secondary"
                                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p)}
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    fontSize: '0.78rem',
                                    borderRadius: '8px',
                                    border: '1px solid #fecdd3',
                                    backgroundColor: '#fff1f2',
                                    color: '#e11d48',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                  }}
                                >
                                  Excluir
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Modal de Cadastro / Edição de Produto */}
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              zIndex: 100,
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
                onClick={() => setIsModalOpen(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                {editingProduct ? 'Editar Produto do Catálogo' : 'Cadastrar Novo Item na Cantina'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Preencha os dados do item físico para sincronização em tempo real com o Honest Market.
              </p>

              {formError && (
                <div className="alert-box alert-error" style={{ marginBottom: '1.25rem' }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div className="form-group">
                  <label className="form-label">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex.: Salgadinho Fofura Queijo 70g"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Categoria *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="form-select"
                    >
                      <option value="SALGADO">Salgados & Snacks</option>
                      <option value="BEBIDA">Bebidas Geladas</option>
                      <option value="DOCE">Doces & Biscoitos</option>
                      <option value="CONGELADO">Congelados / Micro-ondas</option>
                      <option value="OUTRO">Outros</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preço Unitário (R$) *</label>
                    <input
                      type="number"
                      step="0.10"
                      min="0.10"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Estoque Inicial (un.) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Alerta de Estoque Mínimo</label>
                    <input
                      type="number"
                      min="1"
                      value={formMinStock}
                      onChange={(e) => setFormMinStock(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Gerenciador de Imagem do Produto (Multi-modo: Upload, Galeria FATEC ou Link) */}
                <div className="form-group" style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                      Foto do Produto
                    </label>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => setImageInputTab('gallery')}
                        style={{
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: imageInputTab === 'gallery' ? '1px solid var(--accent-blue)' : '1px solid #cbd5e1',
                          backgroundColor: imageInputTab === 'gallery' ? 'var(--accent-blue-light)' : '#ffffff',
                          color: imageInputTab === 'gallery' ? 'var(--accent-blue-hover)' : '#64748b',
                          fontWeight: imageInputTab === 'gallery' ? 700 : 500,
                          cursor: 'pointer',
                        }}
                      >
                        🖼️ Galeria FATEC
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputTab('upload')}
                        style={{
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: imageInputTab === 'upload' ? '1px solid var(--accent-blue)' : '1px solid #cbd5e1',
                          backgroundColor: imageInputTab === 'upload' ? 'var(--accent-blue-light)' : '#ffffff',
                          color: imageInputTab === 'upload' ? 'var(--accent-blue-hover)' : '#64748b',
                          fontWeight: imageInputTab === 'upload' ? 700 : 500,
                          cursor: 'pointer',
                        }}
                      >
                        📁 Enviar Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputTab('url')}
                        style={{
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: imageInputTab === 'url' ? '1px solid var(--accent-blue)' : '1px solid #cbd5e1',
                          backgroundColor: imageInputTab === 'url' ? 'var(--accent-blue-light)' : '#ffffff',
                          color: imageInputTab === 'url' ? 'var(--accent-blue-hover)' : '#64748b',
                          fontWeight: imageInputTab === 'url' ? 700 : 500,
                          cursor: 'pointer',
                        }}
                      >
                        🌐 Link Web
                      </button>
                    </div>
                  </div>

                  {/* Pré-visualização da Imagem Atual */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.85rem', backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '8px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {formImageUrl ? (
                        <img
                          src={formImageUrl}
                          alt="Pré-visualização"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>Sem foto</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formImageUrl ? formImageUrl.split('/').pop() : 'Nenhuma imagem selecionada'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {formImageUrl ? 'Imagem ativa para exibição no catálogo' : 'Escolha uma foto da galeria, envie do seu celular/PC ou cole uma URL'}
                      </div>
                      {formImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormImageUrl('')}
                          style={{
                            marginTop: '0.35rem',
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          ✕ Remover imagem
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo da Aba Ativa */}
                  {imageInputTab === 'gallery' && (
                    <div>
                      <input
                        type="text"
                        placeholder="Filtrar fotos da cantina (ex.: coxinha, torcida, paçoquita, bauducco)..."
                        value={gallerySearch}
                        onChange={(e) => setGallerySearch(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', marginBottom: '0.6rem' }}
                      />
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                          gap: '0.5rem',
                          maxHeight: '140px',
                          overflowY: 'auto',
                          padding: '0.25rem',
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {CANTEEN_PRESET_IMAGES.filter((item) =>
                          item.label.toLowerCase().includes(gallerySearch.toLowerCase()) ||
                          item.category.toLowerCase().includes(gallerySearch.toLowerCase())
                        ).map((preset, idx) => {
                          const isSelected = formImageUrl === preset.path;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFormImageUrl(preset.path);
                                showToast(`Foto vinculada: ${preset.label}`);
                              }}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '0.35rem',
                                borderRadius: '8px',
                                border: isSelected ? '2px solid var(--accent-blue)' : '1px solid #e2e8f0',
                                backgroundColor: isSelected ? 'var(--accent-blue-light)' : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              title={preset.label}
                            >
                              <img
                                src={preset.path}
                                alt={preset.label}
                                style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: '0.2rem' }}
                              />
                              <span style={{ fontSize: '0.68rem', fontWeight: isSelected ? 700 : 500, color: 'var(--text-main)', textAlign: 'center', lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>
                                {preset.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {imageInputTab === 'upload' && (
                    <div>
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '1.25rem',
                          borderRadius: '10px',
                          border: '2px dashed #cbd5e1',
                          backgroundColor: '#ffffff',
                          cursor: isUploadingImage ? 'wait' : 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📷</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-blue)' }}>
                          {isUploadingImage ? 'Enviando e salvando foto...' : 'Clique para selecionar foto do celular ou PC'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          Suporta JPG, PNG ou WebP até 5MB
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isUploadingImage}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  )}

                  {imageInputTab === 'url' && (
                    <div>
                      <input
                        type="text"
                        placeholder="Cole o link direto da imagem (ex.: https://.../foto.jpg ou /images/products/...)"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.825rem' }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição Resumida</label>
                  <textarea
                    placeholder="Sabor, ingredientes principais ou modo de preparo..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="form-input"
                    style={{ height: '70px', resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
                  <input
                    type="checkbox"
                    id="is_available_check"
                    checked={formAvailable}
                    onChange={(e) => setFormAvailable(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="is_available_check" style={{ fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
                    Item ativo e visível para compra pelos alunos
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.8rem' }}
                  >
                    {isSubmitting ? 'Salvando...' : editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary"
                    style={{ padding: '0.8rem 1.25rem' }}
                  >
                    Cancelar
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
