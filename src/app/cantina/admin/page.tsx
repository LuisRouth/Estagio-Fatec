'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ToastNotification from '@/components/ui/ToastNotification';

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
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<'SALGADO' | 'BEBIDA' | 'DOCE' | 'CONGELADO' | 'OUTRO'>('SALGADO');
  const [formPrice, setFormPrice] = useState<string>('3.50');
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
  const [imageLoadError, setImageLoadError] = useState(false);

  // Estados da Galeria Dinâmica
  interface GalleryItem {
    filename: string;
    path: string;
    label: string;
    category: string;
  }
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  // Estados da aba "Enviar Foto" (com nome personalizado)
  const [uploadCustomName, setUploadCustomName] = useState('');
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);

  // Estados da aba "Link Web" (com nome personalizado)
  const [webUrlInput, setWebUrlInput] = useState('');
  const [webCustomName, setWebCustomName] = useState('');
  const [isDownloadingWeb, setIsDownloadingWeb] = useState(false);

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

  // Carrega dinamicamente todas as fotos do diretório public/images/products
  const loadGallery = async () => {
    setIsLoadingGallery(true);
    try {
      const res = await fetch('/api/canteen/gallery');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.images) && data.images.length > 0) {
        setGalleryImages(data.images);
      } else {
        setGalleryImages(
          CANTEEN_PRESET_IMAGES.map((p) => ({
            filename: p.path.split('/').pop() || '',
            path: p.path,
            label: p.label,
            category: p.category,
          }))
        );
      }
    } catch {
      setGalleryImages(
        CANTEEN_PRESET_IMAGES.map((p) => ({
          filename: p.path.split('/').pop() || '',
          path: p.path,
          label: p.label,
          category: p.category,
        }))
      );
    } finally {
      setIsLoadingGallery(false);
    }
  };

  // Exclui/Tira uma imagem do servidor e da Galeria (100% Frontend ConfirmModal)
  const handleDeleteFromGallery = (filename: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cleanFilename = filename.split('/').pop() || filename;

    setConfirmDialog({
      isOpen: true,
      title: 'Tirar Foto da Galeria?',
      message: `Deseja realmente remover o arquivo "${cleanFilename}" da Galeria?`,
      confirmLabel: 'Sim, tirar foto',
      cancelLabel: 'Cancelar',
      isDanger: true,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/canteen/gallery?filename=${encodeURIComponent(cleanFilename)}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(`Foto "${cleanFilename}" retirada da Galeria!`, 'success');
            if (formImageUrl.endsWith(cleanFilename)) {
              setFormImageUrl('');
              setImageLoadError(false);
            }
            await loadGallery();
          } else {
            showToast(data.error || 'Erro ao tirar foto da galeria.', 'error');
          }
        } catch {
          showToast('Erro de conexão ao remover foto.', 'error');
        }
      },
    });
  };

    // Seleciona arquivo local e realiza upload imediato
  const handleSelectFileToUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedUploadFile(file);
    setIsUploadingImage(true);
    setFormError('');

    try {
      const baseSuggest = formName
        ? formName.toLowerCase().trim().replace(/\s+/g, '_')
        : file.name.substring(0, file.name.lastIndexOf('.')).toLowerCase().replace(/\s+/g, '_');
      setUploadCustomName(baseSuggest);

      const formData = new FormData();
      formData.append('file', file);
      if (baseSuggest) {
        formData.append('customName', baseSuggest);
      }

      const res = await fetch('/api/canteen/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setFormImageUrl(data.url);
        setImageLoadError(false);
        showToast('Foto carregada e vinculada com sucesso!');
        await loadGallery();
      } else {
        showToast(data.error || 'Falha ao processar foto.');
      }
    } catch {
      showToast('Erro ao enviar foto para o servidor.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Confirma e envia arquivo com o nome personalizado
  const handleConfirmFileUpload = async () => {
    if (!selectedUploadFile) return;

    setIsUploadingImage(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedUploadFile);
      if (uploadCustomName.trim()) {
        formData.append('customName', uploadCustomName.trim());
      }

      const res = await fetch('/api/canteen/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setFormImageUrl(data.url);
        setImageLoadError(false);
        showToast(`✓ Foto salva como "${data.filename || uploadCustomName}" na Galeria!`);
        setSelectedUploadFile(null);
        setUploadCustomName('');
        await loadGallery();
      } else {
        showToast(data.error || 'Falha ao salvar foto.');
      }
    } catch {
      showToast('Erro ao enviar foto para o servidor.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Baixa imagem de link web e salva com o nome personalizado
  const handleDownloadFromWeb = async () => {
    if (!webUrlInput.trim()) {
      showToast('Por favor, informe a URL da imagem.');
      return;
    }

    setIsDownloadingWeb(true);
    setFormError('');

    try {
      const res = await fetch('/api/canteen/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webUrlInput.trim(),
          customName: webCustomName.trim() || formName.trim().toLowerCase().replace(/\s+/g, '_'),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setFormImageUrl(data.url);
        setImageLoadError(false);
        showToast(`✓ Imagem baixada e salva como "${data.filename || webCustomName}" na Galeria!`);
        setWebUrlInput('');
        setWebCustomName('');
        await loadGallery();
      } else {
        showToast(data.error || 'Erro ao baixar imagem da Web.');
      }
    } catch {
      showToast('Erro de conexão ao baixar imagem da Web.');
    } finally {
      setIsDownloadingWeb(false);
    }
  };

    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
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
        showToast('Não foi possível conectar como admin de demonstração.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro de rede ao conectar.', 'error');
    } finally {
      setIsQuickLoggingIn(false);
    }
  };

  // 1. Verificar autenticação e permissão (ADMIN ou CA_MEMBRO)
  useEffect(() => {
    checkPermission();
    loadGallery();
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
        showToast(errData.error || 'Não foi possível alterar o estoque.', 'error');
      }
    } catch (err) {
      console.error('Falha no ajuste de estoque:', err);
    }
  };

  // 3. Abrir modal para novo produto ou edição
  const handleOpenModal = (product?: Product) => {
    setFormError('');
    setFormSuccess('');
    setImageLoadError(false);
    setSelectedUploadFile(null);
    setUploadCustomName('');
    setWebUrlInput('');
    setWebCustomName('');
    if (product) {
      setEditingProduct(product);
      setFormName(product.name);
      setFormDescription(product.description || '');
      setFormCategory(product.category);
      setFormPrice(Number(product.price).toFixed(2));
      setFormStock(product.current_stock);
      setFormMinStock(product.min_stock_alert);
      setFormImageUrl(product.image_url || '');
      setFormAvailable(product.is_available);
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormDescription('');
      setFormCategory('SALGADO');
      setFormPrice('3.50');
      setFormStock(15);
      setFormMinStock(5);
      setFormImageUrl('');
      setFormAvailable(true);
    }
    setImageInputTab('gallery');
    setIsModalOpen(true);
    loadGallery();
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
        price: Number(parseFloat(String(formPrice).replace(',', '.')) || 0),
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

  // 5. Excluir produto (100% Frontend ConfirmModal)
  const handleDeleteProduct = (product: Product) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Produto?',
      message: `Tem certeza que deseja excluir "${product.name}" do catálogo da cantina? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Sim, excluir produto',
      cancelLabel: 'Cancelar',
      isDanger: true,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/canteen/products/${product.id}`, {
            method: 'DELETE',
          });

          if (res.ok) {
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
            showToast(`"${product.name}" foi removido do catálogo.`, 'success');
          } else {
            const err = await res.json();
            showToast(err.error || 'Erro ao excluir produto.', 'error');
          }
        } catch (err) {
          console.error('Erro na exclusão:', err);
          showToast('Erro de rede ao tentar excluir produto.', 'error');
        }
      },
    });
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

        <ToastNotification
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />

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
                    <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 700, whiteSpace: 'nowrap', minWidth: '260px' }}>Produto / Categoria</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700, whiteSpace: 'nowrap', width: '140px' }}>Preço Unitário</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700, whiteSpace: 'nowrap', width: '130px' }}>Estoque Atual</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700, whiteSpace: 'nowrap', width: '160px' }}>Ajuste Rápido (+ / -)</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700, whiteSpace: 'nowrap', width: '120px' }}>Status</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap', width: '160px' }}>Ações</th>
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
                            <td style={{ padding: '1.15rem 1.5rem', verticalAlign: 'middle' }}>
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
                            <td style={{ padding: '1.15rem 1.25rem', fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1rem', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                              R$ {Number(p.price).toFixed(2).replace('.', ',')}
                            </td>

                            {/* Estoque */}
                            <td style={{ padding: '1.15rem 1.25rem', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
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
                                
                              </div>
                            </td>

                            {/* Ajuste Rápido */}
                            <td style={{ padding: '1.15rem 1.25rem', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
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
                            <td style={{ padding: '1.15rem 1.25rem', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
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
                            <td style={{ padding: '1.15rem 1.5rem', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
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
              className="canteen-admin-modal-card"
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
                      <option value="DOCE">Doces & Sobremesas</option>
                      <option value="CONGELADO">Congelados (Micro-ondas)</option>
                      
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preço Unitário (R$) *</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={formPrice}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
                        setFormPrice(val);
                      }}
                      onBlur={() => {
                        const num = parseFloat(formPrice);
                        if (!isNaN(num)) {
                          setFormPrice(num.toFixed(2));
                        } else {
                          setFormPrice('0.00');
                        }
                      }}
                      className="form-input"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Estoque (unidades) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="form-input"
                  />
                </div>

                {/* Gerenciador de Imagem do Produto (Multi-modo: Upload, Galeria ou Link Web com Nomes Personalizados) */}
                <div className="form-group canteen-gallery-container" style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                      Foto do Produto
                    </label>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setImageInputTab('gallery');
                          loadGallery();
                        }}
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
                        Galeria FATEC
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
                        Carregar Foto (PC)
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
                        Link Externo (Web)
                      </button>
                    </div>
                  </div>

                  {/* Pré-visualização da Imagem Atual com Alerta de Erro e Opção de Tirar */}
                  <div
                    className="canteen-preview-box"
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                      marginBottom: '0.85rem',
                      backgroundColor: imageLoadError ? '#fef2f2' : '#ffffff',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: imageLoadError ? '#fca5a5' : '#e2e8f0',
                    }}
                  >
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '8px',
                        backgroundColor: imageLoadError ? '#fee2e2' : '#f1f5f9',
                        border: '1px solid',
                        borderColor: imageLoadError ? '#ef4444' : '#cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {formImageUrl ? (
                        !imageLoadError ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={formImageUrl}
                            alt="Pré-visualização"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onLoad={() => setImageLoadError(false)}
                            onError={() => setImageLoadError(true)}
                          />
                        ) : (
                          <span style={{ fontSize: '1.5rem' }} title="Imagem não encontrada ou corrompida">⚠️</span>
                        )
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>Sem foto</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: imageLoadError ? '#b91c1c' : 'var(--text-main)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formImageUrl ? formImageUrl.split('/').pop() : 'Nenhuma imagem selecionada'}
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: imageLoadError ? '#ef4444' : 'var(--text-muted)',
                          marginTop: '0.15rem',
                        }}
                      >
                        {imageLoadError
                          ? '⚠️ Falha ao carregar arquivo (inexistente ou link quebrado)'
                          : formImageUrl
                          ? 'Imagem ativa para exibição no catálogo'
                          : 'Escolha uma foto da galeria, envie do seu celular/PC ou cole uma URL'}
                      </div>
                      {formImageUrl && (
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setFormImageUrl('');
                              setImageLoadError(false);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            ✕ Tirar imagem deste produto
                          </button>
                          {formImageUrl.startsWith('/images/products/') && (
                            <button
                              type="button"
                              onClick={() => handleDeleteFromGallery(formImageUrl)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#b91c1c',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                padding: 0,
                                textDecoration: 'underline',
                              }}
                            >
                              Excluir da Galeria
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ABA 1: Galeria Dinâmica com Opção de Tirar Foto */}
                  {imageInputTab === 'gallery' && (
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <input
                          type="text"
                          placeholder="Filtrar fotos da cantina (ex.: coxinha, torcida, paçoquita, suco)..."
                          value={gallerySearch}
                          onChange={(e) => setGallerySearch(e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={loadGallery}
                          disabled={isLoadingGallery}
                          style={{
                            padding: '0.45rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer',
                          }}
                          title="Atualizar galeria do servidor"
                        >
                          {isLoadingGallery ? '...' : 'Atualizar'}
                        </button>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
                          gap: '0.5rem',
                          maxHeight: '190px',
                          overflowY: 'auto',
                          padding: '0.35rem',
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {((galleryImages.length > 0
                          ? galleryImages
                          : CANTEEN_PRESET_IMAGES.map((p) => ({
                              filename: p.path.split('/').pop() || '',
                              path: p.path,
                              label: p.label,
                              category: p.category,
                            }))
                        ).filter(
                          (item) =>
                            item.label.toLowerCase().includes(gallerySearch.toLowerCase()) ||
                            item.filename.toLowerCase().includes(gallerySearch.toLowerCase()) ||
                            item.category.toLowerCase().includes(gallerySearch.toLowerCase())
                        )).map((item, idx) => {
                          const isSelected = formImageUrl === item.path || formImageUrl.endsWith('/' + item.filename);
                          return (
                            <div
                              key={item.filename || idx}
                              style={{
                                position: 'relative',
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
                              onClick={() => {
                                setFormImageUrl(item.path);
                                setImageLoadError(false);
                                showToast(`Foto vinculada: ${item.label}`);
                              }}
                              title={item.label}
                            >
                              {/* Botão para Tirar/Excluir Imagem da Galeria */}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteFromGallery(item.filename, e)}
                                title="Tirar/Excluir esta foto da Galeria"
                                style={{
                                  position: 'absolute',
                                  top: '2px',
                                  right: '2px',
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  backgroundColor: '#ef4444',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: '0.65rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  zIndex: 2,
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                }}
                              >
                                ✕
                              </button>

                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.path}
                                alt={item.label}
                                style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: '0.2rem' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
                                }}
                              />
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: isSelected ? 700 : 500,
                                  color: 'var(--text-main)',
                                  textAlign: 'center',
                                  lineHeight: 1.15,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '80px',
                                }}
                              >
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ABA 2: Enviar Foto com Nome Personalizado */}
                  {imageInputTab === 'upload' && (
                    <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '1.25rem',
                          borderRadius: '10px',
                          border: '2px dashed #cbd5e1',
                          backgroundColor: '#f8fafc',
                          cursor: isUploadingImage ? 'wait' : 'pointer',
                          transition: 'all 0.15s ease',
                          marginBottom: '0.65rem',
                        }}
                      >
                        <span style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📷</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-blue)' }}>
                          {selectedUploadFile ? selectedUploadFile.name : 'Clique para selecionar foto do celular ou PC'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          Suporta JPG, PNG ou WebP até 5MB
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSelectFileToUpload}
                          disabled={isUploadingImage}
                          style={{ display: 'none' }}
                        />
                      </label>

                      {selectedUploadFile && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                            Nome para salvar o arquivo na Galeria:
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                            <input
                              type="text"
                              value={uploadCustomName}
                              onChange={(e) => setUploadCustomName(e.target.value)}
                              placeholder="ex: coxinha_frango ou torcida_costela"
                              className="form-input"
                              style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem', flex: 1 }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                              {selectedUploadFile.name.substring(selectedUploadFile.name.lastIndexOf('.')) || '.jpg'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleConfirmFileUpload}
                            disabled={isUploadingImage}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.6rem', fontSize: '0.825rem', fontWeight: 700 }}
                          >
                            {isUploadingImage ? 'Salvando foto...' : '📤 Salvar Foto com Este Nome na Galeria'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ABA 3: Link Web com Opção de Baixar e Salvar com Nome Personalizado */}
                  {imageInputTab === 'url' && (
                    <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ marginBottom: '0.65rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                          Link da Imagem na Web (URL):
                        </label>
                        <input
                          type="text"
                          placeholder="Cole o link direto da imagem (https://...)"
                          value={webUrlInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWebUrlInput(val);
                            if (val.trim()) {
                              setFormImageUrl(val.trim());
                              setImageLoadError(false);
                            }
                            if (!webCustomName) {
                              setWebCustomName(formName.toLowerCase().replace(/\s+/g, '_') || 'foto_web');
                            }
                          }}
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
                        />
                      </div>

                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                          Nome para salvar na Galeria:
                        </label>
                        <input
                          type="text"
                          placeholder="ex: coxinha_frango ou refrigerante_lata"
                          value={webCustomName}
                          onChange={(e) => setWebCustomName(e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={handleDownloadFromWeb}
                          disabled={isDownloadingWeb || !webUrlInput.trim()}
                          className="btn btn-primary"
                          style={{ width: '100%', padding: '0.6rem', fontSize: '0.825rem', fontWeight: 700 }}
                        >
                          {isDownloadingWeb ? 'Baixando e salvando imagem...' : '📥 Baixar e Salvar Imagem na Galeria'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!webUrlInput.trim()) {
                              showToast('Insira uma URL primeiro.');
                              return;
                            }
                            setFormImageUrl(webUrlInput.trim());
                            setImageLoadError(false);
                            showToast('Link web vinculado diretamente ao produto.');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '0.725rem',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            textDecoration: 'underline',
                            textAlign: 'center',
                          }}
                        >
                          Ou usar apenas como link web externo (sem salvar arquivo local)
                        </button>
                      </div>
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
