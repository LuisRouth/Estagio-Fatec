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
  can_validate_canteen?: boolean;
}

export default function CantinaAdminPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('TODOS');

  // Abas do Painel: Catálogo & Estoque, Pedidos & Caixa, Configurações de Notificação
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('products');

  // Estados da Aba de Pedidos & Caixa
  const [transactions, setTransactions] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'TODOS' | 'PENDENTE' | 'PAGO' | 'CANCELADO'>('PENDENTE');
  const [orderSearch, setOrderSearch] = useState('');

  // Estados da Aba de Configurações
  const [settings, setSettings] = useState({
    notification_email: '',
    notification_whatsapp: '',
    auto_notify_email: true,
    auto_notify_whatsapp: true,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

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
        showToast(`Foto salva como "${data.filename || uploadCustomName}" na Galeria!`);
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
        showToast(`Imagem baixada e salva como "${data.filename || webCustomName}" na Galeria!`);
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

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam === 'orders' || tabParam === 'pedidos' || tabParam === 'caixa') {
        setActiveTab('orders');
      } else if (tabParam === 'products' || tabParam === 'estoque' || tabParam === 'catalogo') {
        setActiveTab('products');
      } else if (tabParam === 'settings' || tabParam === 'configuracoes') {
        setActiveTab('settings');
      }
    }
  }, []);

  const checkPermission = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setUser(data.data);
          if (data.data.role === 'ADMIN' || data.data.role === 'CA_MEMBRO' || data.data.can_validate_canteen) {
            fetchProducts();
            fetchOrders();
            fetchSettings();
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

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/canteen/transactions?limit=100');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setTransactions(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/canteen/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.settings) {
          const s = data.data.settings;
          setSettings({
            notification_email: s.notification_email || '',
            notification_whatsapp: s.notification_whatsapp || '',
            auto_notify_email: s.auto_notify_email !== 'false',
            auto_notify_whatsapp: s.auto_notify_whatsapp !== 'false',
          });
        }
      }
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
    }
  };

  const handleConfirmPayment = (tx: any) => {
    const formattedAmount = `R$ ${Number(tx.total_amount).toFixed(2).replace('.', ',')}`;
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Pagamento Pix & Liberar Retirada',
      message: `Confirmar recebimento de ${formattedAmount} do discente ${tx.user_name || 'Aluno'} (Pedido #${tx.id.slice(-8).toUpperCase()})? Esta ação libera a retirada e envia a confirmação por e-mail ao aluno.`,
      confirmLabel: 'Confirmar e Liberar',
      cancelLabel: 'Cancelar',
      isDanger: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/canteen/transactions/${tx.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'PAGO' }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(`Pagamento do pedido #${tx.id.slice(-8).toUpperCase()} confirmado! E-mail enviado.`);
            setTransactions((prev) =>
              prev.map((t) => (t.id === tx.id ? { ...t, status: 'PAGO', validated_at: new Date().toISOString() } : t))
            );
            fetchOrders();
            fetchProducts();
          } else {
            showToast(data.error || 'Erro ao confirmar pagamento.', 'error');
          }
        } catch {
          showToast('Falha de conexão com o servidor.', 'error');
        }
      },
    });
  };

  const handleCancelOrder = (tx: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancelar Pedido & Estornar Estoque?',
      message: `Deseja cancelar o pedido #${tx.id.slice(-8).toUpperCase()} de ${tx.user_name || 'Aluno'}?\n\nO estoque dos produtos será automaticamente devolvido à cantina.`,
      confirmLabel: 'Sim, Cancelar Pedido',
      cancelLabel: 'Voltar',
      isDanger: true,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/canteen/transactions/${tx.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CANCELADO' }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(`Pedido #${tx.id.slice(-8).toUpperCase()} cancelado e estoque estornado.`);
            setTransactions((prev) =>
              prev.map((t) => (t.id === tx.id ? { ...t, status: 'CANCELADO', updated_at: new Date().toISOString() } : t))
            );
            fetchOrders();
            fetchProducts();
          } else {
            showToast(data.error || 'Erro ao cancelar pedido.', 'error');
          }
        } catch {
          showToast('Falha ao cancelar pedido.', 'error');
        }
      },
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/canteen/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Configurações de notificação salvas com sucesso!');
      } else {
        showToast(data.error || 'Erro ao salvar configurações.', 'error');
      }
    } catch {
      showToast('Erro ao salvar configurações.', 'error');
    } finally {
      setIsSavingSettings(false);
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

  const isAuthorized = Boolean(user && (user.role === 'ADMIN' || user.role === 'CA_MEMBRO' || user.can_validate_canteen));

  const pendingOrdersCount = transactions.filter((t) => t.status === 'PENDENTE').length;
  const paidOrdersCount = transactions.filter((t) => t.status === 'PAGO').length;
  const totalRevenue = transactions
    .filter((t) => t.status === 'PAGO')
    .reduce((sum, t) => sum + Number(t.total_amount), 0);
  const pendingRevenue = transactions
    .filter((t) => t.status === 'PENDENTE')
    .reduce((sum, t) => sum + Number(t.total_amount), 0);

  // Filtragem de pedidos
  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = orderStatusFilter === 'TODOS' || t.status === orderStatusFilter;
    const matchesSearch =
      orderSearch.trim() === '' ||
      t.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (t.user_name && t.user_name.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (t.user_email && t.user_email.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (t.items && t.items.some((item: any) => item.product_name?.toLowerCase().includes(orderSearch.toLowerCase())));
    return matchesStatus && matchesSearch;
  });

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
          className="canteen-admin-card"
          style={{
            padding: '2rem 2.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-rose">
                Área Restrita
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
            {isAuthorized && activeTab === 'products' && (
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
            className="canteen-admin-card"
            style={{
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
            <div style={{ color: 'var(--text-muted)', display: 'flex', justifyContent: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
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
                style={{ padding: '0.65rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                {isQuickLoggingIn ? 'Autenticando...' : 'Acessar como Administrador (1-Clique Dev)'}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Navegação entre Abas */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                borderBottom: '2px solid var(--border-light)',
                paddingBottom: '0.75rem',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`canteen-admin-tab-btn ${activeTab === 'products' ? 'active-products' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7.5 4.27 9 5.15"/>
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                  <path d="m3.3 7 8.7 5 8.7-5"/>
                  <path d="M12 22V12"/>
                </svg>
                Catálogo & Estoque ({products.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`canteen-admin-tab-btn ${activeTab === 'orders' ? 'active-orders' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2"/>
                  <line x1="2" x2="22" y1="10" strokeLinecap="round"/>
                </svg>
                Conferência de Pedidos & Caixa
                {pendingOrdersCount > 0 && (
                  <span
                    style={{
                      backgroundColor: activeTab === 'orders' ? '#ffffff' : 'var(--accent-amber)',
                      color: activeTab === 'orders' ? 'var(--accent-emerald)' : '#ffffff',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    {pendingOrdersCount} pendente{pendingOrdersCount > 1 ? 's' : ''}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`canteen-admin-tab-btn ${activeTab === 'settings' ? 'active-settings' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Configurações & Alertas
              </button>
            </div>

            {/* ABA 2: CATÁLOGO & ESTOQUE */}
            {activeTab === 'products' && (
              <>
            {/* Barra de Filtros e Busca */}
            <div
              className="canteen-admin-card"
              style={{
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
              className="canteen-admin-card"
              style={{
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
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
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
                                      ? 'var(--accent-rose)'
                                      : isLowStock
                                      ? 'var(--accent-amber)'
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
                                  className="canteen-quick-stock-btn"
                                  style={{
                                    cursor: p.current_stock <= 0 ? 'not-allowed' : 'pointer',
                                    opacity: p.current_stock <= 0 ? 0.4 : 1,
                                  }}
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => handleQuickStockAdjust(p.id, 1)}
                                  title="Adicionar 1 unidade ao estoque"
                                  className="canteen-quick-stock-btn"
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => handleQuickStockAdjust(p.id, 10)}
                                  title="Reposição em lote (+10 unidades)"
                                  className="canteen-quick-stock-btn"
                                  style={{
                                    width: 'auto',
                                    padding: '0.2rem 0.5rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--accent-emerald)',
                                  }}
                                >
                                  +10
                                </button>
                              </div>
                            </td>

                            {/* Status */}
                            <td style={{ padding: '1.15rem 1.25rem', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                              {isOutOfStock ? (
                                <span className="canteen-order-badge-cancelled">
                                  Esgotado
                                </span>
                              ) : isLowStock ? (
                                <span className="canteen-order-badge-pending">
                                  Estoque Crítico
                                </span>
                              ) : (
                                <span className="canteen-order-badge-paid">
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
                                  type="button"
                                  onClick={() => handleDeleteProduct(p)}
                                  className="btn-danger-outline"
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

            {/* ABA 1: CONFERÊNCIA DE PEDIDOS & CAIXA */}
            {activeTab === 'orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Métricas do Caixa */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="canteen-admin-stat-pending">
                    <span className="stat-label">Aguardando Conferência Pix</span>
                    <div className="stat-val">{pendingOrdersCount} pedido{pendingOrdersCount !== 1 ? 's' : ''}</div>
                    <span className="stat-sub">Total a Conferir: R$ {pendingRevenue.toFixed(2).replace('.', ',')}</span>
                  </div>

                  <div className="canteen-admin-stat-paid">
                    <span className="stat-label">Pedidos Pagos & Liberados</span>
                    <div className="stat-val">{paidOrdersCount}</div>
                    <span className="stat-sub">Receita Total: R$ {totalRevenue.toFixed(2).replace('.', ',')}</span>
                  </div>

                  <div className="canteen-admin-stat-total">
                    <span className="stat-label">Total Geral de Pedidos</span>
                    <div className="stat-val">{transactions.length}</div>
                    <button
                      type="button"
                      onClick={fetchOrders}
                      className="btn btn-secondary"
                      style={{ marginTop: '0.35rem', padding: '0.25rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
                      Atualizar Lista
                    </button>
                  </div>
                </div>

                {/* Filtros da Tabela de Pedidos */}
                <div
                  className="canteen-admin-card"
                  style={{
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'PENDENTE', label: 'Pendentes de Baixa' },
                      { id: 'PAGO', label: 'Pagos & Liberados' },
                      { id: 'CANCELADO', label: 'Cancelados' },
                      { id: 'TODOS', label: 'Todos os Pedidos' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setOrderStatusFilter(st.id as any)}
                        className={`btn ${orderStatusFilter === st.id ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                          fontSize: '0.8rem',
                          padding: '0.45rem 0.95rem',
                          backgroundColor: orderStatusFilter === st.id && st.id === 'PENDENTE' ? 'var(--accent-amber)' : undefined,
                          borderColor: orderStatusFilter === st.id && st.id === 'PENDENTE' ? 'var(--accent-amber)' : undefined,
                        }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ minWidth: '260px' }}>
                    <input
                      type="text"
                      placeholder="Buscar por aluno, RA ou pedido..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="form-input"
                      style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Tabela de Pedidos */}
                <div
                  className="canteen-admin-card"
                  style={{
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
                          <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Pedido / Horário</th>
                          <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Discente Comprador</th>
                          <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Itens Adquiridos</th>
                          <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Valor Total</th>
                          <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Status</th>
                          <th style={{ padding: '1rem 1.25rem', fontWeight: 700, textAlign: 'right' }}>Ações de Baixa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordersLoading ? (
                          <tr>
                            <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                              Carregando pedidos da cantina...
                            </td>
                          </tr>
                        ) : filteredTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                              <div style={{ color: 'var(--accent-emerald)', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                              <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
                                {orderStatusFilter === 'PENDENTE'
                                  ? 'Nenhum pedido pendente aguardando baixa no momento!'
                                  : 'Nenhum pedido localizado para o filtro selecionado.'}
                              </h4>
                              <p style={{ margin: '0.25rem 0 0', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                                Todos os pedidos efetuados pelos alunos aparecerão aqui para conferência fácil.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredTransactions.map((tx: any) => {
                            const isPending = tx.status === 'PENDENTE';
                            const isPaid = tx.status === 'PAGO';
                            const formattedTotal = `R$ ${Number(tx.total_amount).toFixed(2).replace('.', ',')}`;
                            const dateObj = new Date(tx.created_at);
                            const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

                            // Mensagem formatada para WhatsApp
                            const itemsText = (tx.items || []).map((i: any) => `${i.quantity}x ${i.product_name}`).join(', ');
                            const whatsappMsg = encodeURIComponent(
                              `Olá ${tx.user_name || 'Aluno'}! Sobre o seu pedido #${tx.id.slice(-8).toUpperCase()} na Cantina FATEC (${itemsText}) no valor de ${formattedTotal}: seu Pix está em conferência.`
                            );
                            const whatsappUrl = `https://wa.me/?text=${whatsappMsg}`;

                            return (
                              <tr
                                key={tx.id}
                                style={{
                                  borderBottom: '1px solid var(--border-light)',
                                  backgroundColor: isPending ? 'rgba(254, 243, 199, 0.25)' : 'transparent',
                                  transition: 'background-color 0.15s ease',
                                }}
                              >
                                {/* Pedido e Data */}
                                <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                                  <div style={{ fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px' }}>
                                    #{tx.id.slice(-8).toUpperCase()}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{formattedDate}</div>
                                </td>

                                {/* Comprador */}
                                <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                    {tx.user_name || 'Aluno FATEC'}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                    {tx.user_email || 'E-mail não informado'}
                                  </div>
                                </td>

                                {/* Itens */}
                                <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {tx.items && tx.items.length > 0 ? (
                                      tx.items.map((item: any, idx: number) => (
                                        <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                                          <strong style={{ color: 'var(--accent-blue)' }}>{item.quantity}x</strong> {item.product_name || 'Item'}
                                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginLeft: '0.35rem' }}>
                                            (R$ {Number(item.unit_price).toFixed(2).replace('.', ',')} un)
                                          </span>
                                        </div>
                                      ))
                                    ) : (
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Itens da compra</span>
                                    )}
                                  </div>
                                </td>

                                {/* Valor Total */}
                                <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                                    {formattedTotal}
                                  </div>
                                </td>

                                {/* Status */}
                                <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                                  {isPending && (
                                    <span className="canteen-order-badge-pending">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                      Aguardando Pix
                                    </span>
                                  )}
                                  {isPaid && (
                                    <span className="canteen-order-badge-paid">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                      Pago & Liberado
                                    </span>
                                  )}
                                  {tx.status === 'CANCELADO' && (
                                    <span className="canteen-order-badge-cancelled">
                                      Cancelado
                                    </span>
                                  )}
                                  {tx.status === 'EM_ANALISE' && (
                                    <span className="canteen-order-badge-analysis">
                                      Em Análise
                                    </span>
                                  )}
                                  {tx.validated_at && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                      Baixa: {new Date(tx.validated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  )}
                                </td>

                                {/* Ações */}
                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right', verticalAlign: 'top' }}>
                                  <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    {isPending ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleConfirmPayment(tx)}
                                          className="btn btn-emerald"
                                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                          title="Confirmar que o Pix entrou na conta bancária e liberar o pedido para o aluno"
                                        >
                                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Confirmar Pagamento Pix
                                        </button>
                                        <a
                                          href={whatsappUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="btn btn-secondary"
                                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', color: 'var(--accent-emerald)' }}
                                          title="Abrir WhatsApp com detalhes do pedido"
                                        >
                                          WhatsApp
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => handleCancelOrder(tx)}
                                          className="btn btn-secondary"
                                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', color: 'var(--accent-rose)' }}
                                          title="Cancelar pedido e devolver estoque"
                                        >
                                          Cancelar
                                        </button>
                                      </>
                                    ) : (
                                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Baixa efetuada</span>
                                    )}
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
              </div>
            )}

            {/* ABA 3: CONFIGURAÇÕES & ALERTAS */}
            {activeTab === 'settings' && (
              <div className="canteen-admin-card" style={{ padding: '2rem 2.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Configurações de Notificações Automáticas da Cantina
                  </h3>
                </div>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem', marginBottom: '1.75rem', lineHeight: 1.6, maxWidth: '640px' }}>
                  Defina o e-mail e o número de WhatsApp do responsável ou grupo de conferência. Sempre que um aluno finalizar o carrinho, o sistema enviará um alerta automático constando os dados do comprador, os produtos e quantidades, e o valor total a ser conferido no extrato bancário.
                </p>

                <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '620px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                      E-mail do Responsável / Conferente da Cantina *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: cantina@fatec.sp.gov.br ou seu.email@fatec.sp.gov.br"
                      value={settings.notification_email}
                      onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
                      className="form-input"
                      style={{ padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      Dispara um e-mail instantâneo via SMTP assim que a compra é gerada.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                      Número de WhatsApp do Conferente (com DDD)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 19999998888 (apenas números)"
                      value={settings.notification_whatsapp}
                      onChange={(e) => setSettings({ ...settings, notification_whatsapp: e.target.value })}
                      className="form-input"
                      style={{ padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      Utilizado para links diretos de WhatsApp e conferência rápida no celular.
                    </span>
                  </div>

                  <div className="canteen-settings-box" style={{ padding: '1rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={settings.auto_notify_email}
                        onChange={(e) => setSettings({ ...settings, auto_notify_email: e.target.checked })}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent-emerald)' }}
                      />
                      Disparar e-mail automático a cada novo pedido realizado por alunos
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={settings.auto_notify_whatsapp}
                        onChange={(e) => setSettings({ ...settings, auto_notify_whatsapp: e.target.checked })}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent-emerald)' }}
                      />
                      Habilitar links de envio para WhatsApp nos pedidos pendentes
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="btn btn-primary"
                      style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem', fontWeight: 700 }}
                    >
                      {isSavingSettings ? 'Salvando...' : 'Salvar Configurações de Notificação'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
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
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
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
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Fechar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                {editingProduct ? 'Editar Produto do Catálogo' : 'Cadastrar Novo Item na Cantina'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Preencha os dados do item físico para sincronização em tempo real com a Cantina Discente.
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
                <div className="form-group canteen-gallery-container" style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
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
                          border: imageInputTab === 'gallery' ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                          backgroundColor: imageInputTab === 'gallery' ? 'var(--accent-blue)' : 'var(--bg-card)',
                          color: imageInputTab === 'gallery' ? '#ffffff' : 'var(--text-muted)',
                          fontWeight: 700,
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
                          border: imageInputTab === 'upload' ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                          backgroundColor: imageInputTab === 'upload' ? 'var(--accent-blue)' : 'var(--bg-card)',
                          color: imageInputTab === 'upload' ? '#ffffff' : 'var(--text-muted)',
                          fontWeight: 700,
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
                          border: imageInputTab === 'url' ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                          backgroundColor: imageInputTab === 'url' ? 'var(--accent-blue)' : 'var(--bg-card)',
                          color: imageInputTab === 'url' ? '#ffffff' : 'var(--text-muted)',
                          fontWeight: 700,
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
                      backgroundColor: imageLoadError ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-card)',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: imageLoadError ? 'var(--accent-rose)' : 'var(--border-light)',
                    }}
                  >
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-muted)',
                        border: '1px solid',
                        borderColor: imageLoadError ? 'var(--accent-rose)' : 'var(--border-light)',
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
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-rose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        )
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>Sem foto</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: imageLoadError ? 'var(--accent-rose)' : 'var(--text-main)',
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
                          color: imageLoadError ? 'var(--accent-rose)' : 'var(--text-muted)',
                          marginTop: '0.15rem',
                        }}
                      >
                        {imageLoadError
                          ? 'Falha ao carregar arquivo (inexistente ou link quebrado)'
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
                              color: 'var(--accent-rose)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            Tirar imagem deste produto
                          </button>
                          {formImageUrl.startsWith('/images/products/') && (
                            <button
                              type="button"
                              onClick={() => handleDeleteFromGallery(formImageUrl)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent-rose)',
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
                          className="btn btn-secondary"
                          style={{
                            padding: '0.45rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
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
                          backgroundColor: 'var(--bg-card)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
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
                                border: isSelected ? '2px solid var(--accent-blue)' : '1px solid var(--border-light)',
                                backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-muted)',
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
                                  backgroundColor: 'var(--accent-rose)',
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
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '1.25rem',
                          borderRadius: '10px',
                          border: '2px dashed var(--border-light)',
                          backgroundColor: 'var(--bg-muted)',
                          cursor: isUploadingImage ? 'wait' : 'pointer',
                          transition: 'all 0.15s ease',
                          marginBottom: '0.65rem',
                        }}
                      >
                        <div style={{ color: 'var(--accent-blue)', marginBottom: '0.25rem' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-blue)' }}>
                          {selectedUploadFile ? selectedUploadFile.name : 'Clique para selecionar foto do celular ou PC'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
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
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
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
                            {isUploadingImage ? 'Salvando foto...' : 'Salvar Foto com Este Nome na Galeria'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ABA 3: Link Web com Opção de Baixar e Salvar com Nome Personalizado */}
                  {imageInputTab === 'url' && (
                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
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
                          {isDownloadingWeb ? 'Baixando e salvando imagem...' : 'Baixar e Salvar Imagem na Galeria'}
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
