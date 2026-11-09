'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ToastNotification from '@/components/ui/ToastNotification';
import CanteenStatementView from '@/components/canteen/CanteenStatementView';

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: 'DOCE' | 'SALGADO' | 'BEBIDA' | 'CONGELADO' | 'OUTRO';
  price: number;
  current_stock: number;
  min_stock_alert: number;
  image_url: string | null;
  is_available: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CheckoutResult {
  transactionId?: string;
  orderId?: string;
  txid: string;
  totalAmount: number;
  pixCopyPaste?: string;
  pixPayload?: string;
  qrCodeUrl: string;
  pixKey: string;
  merchantName: string;
  conferenteWhatsapp?: string | null;
}

export default function CantinaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartMounted, setIsCartMounted] = useState(false);

  // Aba ativa: 'catalog' (Cardápio) ou 'statement' (Meu Extrato)
  const [activeCanteenTab, setActiveCanteenTab] = useState<'catalog' | 'statement'>('catalog');

  // Sincronizar com parâmetro ?tab=extrato da URL se presente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'extrato' || tab === 'historico' || tab === 'statement') {
        setActiveCanteenTab('statement');
      }
    }
  }, []);

  // Restaurar carrinho do localStorage ao inicializar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fatec_canteen_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
        }
      }
    } catch (e) {
      console.error('Erro ao recuperar carrinho salvo:', e);
    }
    setIsCartMounted(true);
  }, []);

  // Sincronizar alterações do carrinho no localStorage
  useEffect(() => {
    if (!isCartMounted) return;
    try {
      if (cart.length > 0) {
        localStorage.setItem('fatec_canteen_cart', JSON.stringify(cart));
      } else {
        localStorage.removeItem('fatec_canteen_cart');
      }
    } catch (e) {
      console.error('Erro ao persistir carrinho:', e);
    }
  }, [cart, isCartMounted]);
  
  // Toast e Modal de Confirmação 100% Frontend (Sem alertas feios do navegador)
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

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Estados do Modal de Checkout
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutResult | null>(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  // Estados de Envio de Comprovante Pix (OCR & Visão Computacional)
  const [proofText, setProofText] = useState('');
  const [proofImageBase64, setProofImageBase64] = useState<string | null>(null);
  const [proofImageName, setProofImageName] = useState<string>('');
  const [ocrFeedback, setOcrFeedback] = useState<{ status: string; notes: string } | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [isPaymentConfirmedByCashier, setIsPaymentConfirmedByCashier] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Polling em tempo real para verificar se o conferente da cantina deu baixa no pedido
  useEffect(() => {
    if (!isCheckoutModalOpen || !checkoutData?.orderId || isPaymentConfirmedByCashier) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/canteen/transactions/${checkoutData.orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.status === 'PAGO') {
            setIsPaymentConfirmedByCashier(true);
            setCart([]);
            localStorage.removeItem('fatec_canteen_cart');
            fetchProducts();
          }
        }
      } catch {
        // Ignora falhas transitórias de conexão durante o polling
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isCheckoutModalOpen, checkoutData?.orderId, isPaymentConfirmedByCashier]);

  // Carregar produtos da API
  useEffect(() => {
    fetchProducts();
    // Verificar se usuário logado é CA ou ADMIN para mostrar botão de gerenciar
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setCurrentUser(d.data);
      })
      .catch(() => {});
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/canteen/products');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar produtos da cantina:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtros de Categoria
  const categories = [
    { id: 'TODOS', label: 'Todos os Itens' },
    { id: 'SALGADO', label: 'Salgados & Snacks' },
    { id: 'BEBIDA', label: 'Bebidas Geladas' },
    { id: 'DOCE', label: 'Doces & Sobremesas' },
    { id: 'CONGELADO', label: 'Congelados (Micro-ondas)' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'TODOS' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Funções do Carrinho (Não abre a gaveta abruptamente na cara do aluno)
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.current_stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    // Não abre o carrinho toda vez que clica: ele fica discreto e fixo no canto inferior!
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.current_stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Iniciar Checkout e gerar Pix Dinâmico via API
  const handleStartCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessingCheckout(true);
    setCheckoutError('');

    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        notes: 'Compra na Cantina Discente - FATEC Rio Claro',
      };

      const res = await fetch('/api/canteen/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível finalizar o pedido. Faça login no portal.');
      }

      const resData = data.data;
      const normalizedData: CheckoutResult = {
        orderId: resData.transactionId || resData.orderId,
        transactionId: resData.transactionId || resData.orderId,
        txid: resData.txid,
        totalAmount: Number(resData.totalAmount),
        pixPayload: resData.pixCopyPaste || resData.pixPayload || '',
        pixCopyPaste: resData.pixCopyPaste || resData.pixPayload || '',
        qrCodeUrl: resData.qrCodeUrl,
        pixKey: resData.pixKey,
        merchantName: resData.merchantName,
        conferenteWhatsapp: resData.conferenteWhatsapp || null,
      };

      setCheckoutData(normalizedData);
      setIsCheckoutModalOpen(true);
      // Mantém os itens no carrinho caso o aluno volte sem concluir a compra
      setIsCartOpen(false);
      fetchProducts(); // Atualiza estoque em tela
    } catch (err: any) {
      setCheckoutError(err.message || 'Erro inesperado ao gerar cobrança Pix.');
      setIsCheckoutModalOpen(true);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Retornar ao carrinho sem concluir a compra (cancela pedido pendente no backend para repor estoque e mantém itens no carrinho)
  const handleCloseCheckoutWithoutFinishing = async () => {
    if (checkoutData?.orderId) {
      try {
        await fetch(`/api/canteen/transactions/${checkoutData.orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'CANCELADO' }),
        });
      } catch (err) {
        console.error('Falha ao cancelar pedido pendente:', err);
      }
    }
    setIsCheckoutModalOpen(false);
    setCheckoutData(null);
    setProofSubmitted(false);
    setProofText('');
    setIsPaymentConfirmedByCashier(false);
    setIsCartOpen(true); // Reabre o carrinho para o aluno conferir ou adicionar mais itens
    fetchProducts(); // Recarrega o estoque atualizado
  };

  // Concluir compra quando o aluno já realizou o Pix no aplicativo do banco
  
  // Simular confirmação de pagamento para testes do histórico/extrato
  const handleSimulateTestPayment = async () => {
    if (!checkoutData?.orderId) return;
    setIsProcessingCheckout(true);
    try {
      const res = await fetch(`/api/canteen/transactions/${checkoutData.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PAGO',
          notes: 'Pagamento confirmado via simulador de testes local FATEC',
          pix_end_to_end_id: 'E2ETEST' + Date.now(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao confirmar pagamento teste.');
      }

      setCart([]);
      try {
        localStorage.removeItem('fatec_canteen_cart');
      } catch {}

      setIsCheckoutModalOpen(false);
      setCheckoutData(null);
      setProofSubmitted(false);
      setProofText('');
      showToast('Pagamento de teste aprovado! O pedido foi registrado no seu Histórico.', 'success');
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Erro ao simular pagamento.', 'error');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleFinishPurchase = () => {
    setCart([]);
    try {
      localStorage.removeItem('fatec_canteen_cart');
    } catch {}
    setIsCheckoutModalOpen(false);
    setCheckoutData(null);
    setProofSubmitted(false);
    setProofText('');
    showToast('Compra concluída com sucesso! Obrigado pela colaboração na Cantina FATEC.', 'success');
    fetchProducts();
  };

  // Copiar chave Pix Copia-e-Cola
  const handleCopyPix = () => {
    const payload = checkoutData?.pixPayload || checkoutData?.pixCopyPaste;
    if (!payload) return;
    navigator.clipboard.writeText(payload);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  // Enviar comprovante Pix (Texto E2E e/ou Imagem para Pipeline de Visão Computacional & OCR Gemini)
  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProofImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutData?.orderId || (!proofText.trim() && !proofImageBase64)) return;

    setIsSubmittingProof(true);
    try {
      const res = await fetch(`/api/canteen/transactions/${checkoutData.orderId}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptText: proofText,
          receiptImageBase64: proofImageBase64,
          proof_image_url: proofImageBase64 || proofText,
          e2eId: proofText.length > 20 ? proofText.slice(0, 32) : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProofSubmitted(true);
        if (data.ocr) {
          setOcrFeedback({
            status: data.ocr.status,
            notes: data.ocr.analysisNotes || data.message,
          });
        }
        // Compra concluída com comprovante: esvazia o carrinho e o localStorage
        setCart([]);
        try {
          localStorage.removeItem('fatec_canteen_cart');
        } catch {}
        fetchProducts();
      } else {
        showToast(data.error || 'Erro ao validar comprovante Pix.', 'error');
      }
    } catch (err) {
      console.error('Falha ao enviar comprovante:', err);
    } finally {
      setIsSubmittingProof(false);
    }
  };


  // Renderizador de efeito animado de fundo no card conforme a categoria
  const renderCardBackgroundEffect = (cat: string) => {
    switch (cat) {
      case 'BEBIDA':
        return (
          <div className="canteen-card-bg-effect">
            <div className="canteen-liquid-swell">
              {/* Onda fluida contínua sem cortes no topo */}
              <div className="canteen-wave-track">
                <svg className="canteen-wave-svg wave-back" viewBox="0 0 1200 60" preserveAspectRatio="none">
                  <path d="M0,30 C150,5 300,55 450,30 C600,5 750,55 900,30 C1050,5 1200,55 1200,30 L1200,60 L0,60 Z" fill="rgba(56, 189, 248, 0.45)" />
                </svg>
                <svg className="canteen-wave-svg wave-front" viewBox="0 0 1200 60" preserveAspectRatio="none">
                  <path d="M0,25 C150,50 300,0 450,25 C600,50 750,0 900,25 C1050,50 1200,0 1200,25 L1200,60 L0,60 Z" fill="rgba(186, 230, 253, 0.65)" />
                </svg>
              </div>
              {/* Microbolhas de gás puro em CSS (Zero emojis) */}
              <div className="canteen-gas-bubble" />
              <div className="canteen-gas-bubble" />
              <div className="canteen-gas-bubble" />
              <div className="canteen-gas-bubble" />
              <div className="canteen-gas-bubble" />
            </div>
          </div>
        );
      case 'DOCE':
        return (
          <div className="canteen-card-bg-effect">
            <div className="canteen-sweet-shower">
              {/* Bombom Rosa */}
              <div className="canteen-falling-sweet">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <polygon points="2,8 7,12 2,16" fill="#f43f5e" opacity="0.85" />
                  <polygon points="22,8 17,12 22,16" fill="#f43f5e" opacity="0.85" />
                  <ellipse cx="12" cy="12" rx="6" ry="4" fill="#fb7185" />
                  <ellipse cx="12" cy="11" rx="4" ry="2" fill="#ffe4e6" opacity="0.7" />
                </svg>
              </div>
              {/* Tablete de Chocolate */}
              <div className="canteen-falling-sweet">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="18" rx="3" fill="#78350f" />
                  <rect x="5" y="6" width="6" height="5" rx="1" fill="#92400e" />
                  <rect x="13" y="6" width="6" height="5" rx="1" fill="#92400e" />
                  <rect x="5" y="13" width="6" height="5" rx="1" fill="#92400e" />
                  <rect x="13" y="13" width="6" height="5" rx="1" fill="#92400e" />
                </svg>
              </div>
              {/* Confeito Sprinkles Dourado */}
              <div className="canteen-falling-sweet">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="8" width="12" height="4" rx="2" transform="rotate(-30 10 10)" fill="#f59e0b" />
                </svg>
              </div>
              {/* Bala Redonda Menta */}
              <div className="canteen-falling-sweet">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8" fill="#10b981" />
                  <circle cx="12" cy="12" r="5" fill="#34d399" />
                  <circle cx="12" cy="12" r="2" fill="#ecfdf5" />
                </svg>
              </div>
              {/* Confeito Sprinkles Roxo */}
              <div className="canteen-falling-sweet">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="8" width="12" height="4" rx="2" transform="rotate(45 10 10)" fill="#8b5cf6" />
                </svg>
              </div>
              {/* Estrela de Açúcar */}
              <div className="canteen-falling-sweet">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24">
                  <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" />
                </svg>
              </div>
            </div>
          </div>
        );
      case 'CONGELADO':
        return (
          <div className="canteen-card-bg-effect">
            {/* Flocos de neve caindo suavemente - simples e limpo */}
            <div className="canteen-snow-fall">
              <span className="canteen-snowflake">❄</span>
              <span className="canteen-snowflake">❅</span>
              <span className="canteen-snowflake">❆</span>
              <span className="canteen-snowflake">❄</span>
              <span className="canteen-snowflake">❅</span>
              <span className="canteen-snowflake">❆</span>
            </div>
          </div>
        );
      case 'SALGADO':
        return (
          <div className="canteen-card-bg-effect">
            {/* Fogo Limpo e Estilizado (Sem Emojis, Sem Poluição Visual) */}
            <div className="canteen-clean-fire">
              <div className="canteen-clean-fire-glow" />
              <svg className="canteen-clean-fire-svg" viewBox="0 0 240 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cleanFlameGrad1" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity="0.85" />
                    <stop offset="60%" stopColor="#f97316" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="cleanFlameGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#fef08a" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="cleanFlameCore" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#fef08a" stopOpacity="0.98" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path className="clean-flame flame-left" d="M30,120 C35,85 25,60 48,35 C55,22 62,8 65,0 C66,15 75,35 72,55 C82,40 92,25 98,15 C102,28 100,55 95,75 C105,60 115,48 122,40 C125,58 120,85 110,120 Z" fill="url(#cleanFlameGrad1)" />
                <path className="clean-flame flame-center" d="M70,120 C80,80 75,50 102,25 C110,15 118,5 120,0 C124,18 132,42 128,65 C140,45 155,28 165,15 C170,32 168,65 158,90 C170,72 182,58 190,48 C192,68 185,95 175,120 Z" fill="url(#cleanFlameGrad2)" />
                <path className="clean-flame flame-core" d="M95,120 C100,92 98,70 112,48 C116,40 120,30 120,25 C122,35 126,50 124,65 C132,50 142,38 148,30 C150,42 148,65 142,85 L142,120 Z" fill="url(#cleanFlameCore)" />
              </svg>
              <div className="clean-fire-spark spark-1" />
              <div className="clean-fire-spark spark-2" />
              <div className="clean-fire-spark spark-3" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

    // Ícones ilustrativos nativos para fallback de imagem dos produtos
  const getProductFallbackEmoji = (cat: string) => '';

  return (
    <AppLayout activePath="/cantina">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Cabeçalho da Cantina com Identidade FATEC */}
        <div
          className="canteen-discente-header-card card-interactive"
          style={{
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
              <span className="badge badge-emerald">Cantina Aberta</span>
              <span className="badge badge-blue">Pix Automático BACEN</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Autoatendimento Discente</span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Cantina Discente dos Estudantes
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '680px', lineHeight: 1.6 }}>
              Pegue o produto na prateleira física, adicione ao seu pedido abaixo e escaneie o <strong>QR Code Pix com valor exato</strong>.Sem pranchetas de papel e com extrato em tempo real.
            </p>
          </div>

          {/* Ações do Topo: Gerenciar Estoque / Pedidos (Apenas CA e ADMIN) e Meu Pedido */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'CA_MEMBRO') && (
              <Link
                href={activeCanteenTab === 'statement' ? '/cantina/admin?tab=orders' : '/cantina/admin?tab=products'}
                className="btn btn-secondary"
                style={{
                  padding: '0.8rem 1.25rem',
                  fontSize: '0.925rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-sm)',
                }}
                title={activeCanteenTab === 'statement' ? 'Conferência e baixa de pedidos Pix no Caixa' : 'Acessar painel do Centro Acadêmico e Secretaria para reposição, novos itens e preços'}
              >
                {activeCanteenTab === 'statement' ? (
                  <>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="5" rx="2"/>
                      <line x1="2" x2="22" y1="10" strokeLinecap="round"/>
                    </svg>
                    <span>Gerenciar Pedidos (Caixa)</span>
                  </>
                ) : (
                  <>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <span>Gerenciar Estoque (CA / Secretaria)</span>
                  </>
                )}
              </Link>
            )}

            {/* Botão de Atalho para o Carrinho */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="btn btn-primary"
              style={{ padding: '0.8rem 1.4rem', fontSize: '0.95rem', position: 'relative' }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Meu Pedido</span>
              {totalCartCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    borderRadius: '9999px',
                    padding: '2px 8px',
                    marginLeft: '0.35rem',
                  }}
                >
                  {totalCartCount}
                </span>
              )}
              <span style={{ fontWeight: 700, marginLeft: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '0.5rem' }}>
                R$ {totalCartAmount.toFixed(2).replace('.', ',')}
              </span>
            </button>
          </div>
        </div>

        {/* Navegação Principal da Cantina: Cardápio vs Meu Extrato */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            borderBottom: '2px solid var(--border-light)',
            paddingBottom: '0.75rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveCanteenTab('catalog')}
            className={`canteen-admin-tab-btn ${activeCanteenTab === 'catalog' ? 'active-products' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7.5 4.27 9 5.15"/>
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
              <path d="m3.3 7 8.7 5 8.7-5"/>
              <path d="M12 22V12"/>
            </svg>
            Cardápio & Prateleira Virtual
          </button>

          <button
            type="button"
            onClick={() => setActiveCanteenTab('statement')}
            className={`canteen-admin-tab-btn ${activeCanteenTab === 'statement' ? 'active-orders' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Meu Extrato & Histórico de Compras
          </button>
        </div>

        {activeCanteenTab === 'catalog' ? (
          <>
        {/* Barra de Filtros por Categoria e Busca em Tempo Real */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Abas de Categorias */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', maxWidth: '100%' }}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`canteen-category-btn ${isSelected ? 'active' : ''}`}
                    style={{
                      border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--accent-blue)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      fontWeight: isSelected ? 700 : 500,
                      padding: '0.6rem 1.15rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Barra de Busca de Itens */}
            <div style={{ minWidth: '260px', flex: '1 1 260px', maxWidth: '380px' }}>
              <input
                type="text"
                placeholder="Buscar salgado, refrigerante, doce..."
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.65rem 1rem', borderRadius: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* Grade de Produtos do Catálogo */}
        {loading ? (
          <div>
            {/* Banner Moderno de Carregamento FATEC */}
            <div className="canteen-loading-banner card-interactive">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'rgba(2, 132, 199, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ animation: 'spin 1s linear infinite' }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>
                    Carregando Cardápio da Cantina FATEC...
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                    Sincronizando prateleiras, disponibilidade de estoque e tabela de preços via Pix em tempo real.
                  </p>
                </div>
              </div>
              <div className="canteen-loading-bar" />
            </div>

            {/* Grade de Skeletons dos Cards de Produtos */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="card-interactive"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid var(--border-light)',
                    minHeight: '340px',
                    background: 'var(--card-bg, #ffffff)',
                  }}
                >
                  <div>
                    {/* Skeleton: Categoria & Estoque */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div className="skeleton-shimmer" style={{ width: '70px', height: '22px', borderRadius: '20px' }} />
                      <div className="skeleton-shimmer" style={{ width: '60px', height: '18px', borderRadius: '12px' }} />
                    </div>

                    {/* Skeleton: Imagem do Produto */}
                    <div className="skeleton-shimmer" style={{ width: '100%', height: '135px', borderRadius: '12px', marginBottom: '1rem' }} />

                    {/* Skeleton: Nome do Produto */}
                    <div className="skeleton-shimmer" style={{ width: '85%', height: '18px', borderRadius: '6px', marginBottom: '0.5rem' }} />
                    <div className="skeleton-shimmer" style={{ width: '55%', height: '16px', borderRadius: '6px', marginBottom: '0.75rem' }} />

                    {/* Skeleton: Descrição */}
                    <div className="skeleton-shimmer" style={{ width: '92%', height: '13px', borderRadius: '4px' }} />
                  </div>

                  {/* Skeleton: Preço e Botão Adicionar */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '1.5rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-light)',
                    }}
                  >
                    <div>
                      <div className="skeleton-shimmer" style={{ width: '50px', height: '12px', marginBottom: '4px' }} />
                      <div className="skeleton-shimmer" style={{ width: '68px', height: '22px', borderRadius: '6px' }} />
                    </div>
                    <div className="skeleton-shimmer" style={{ width: '100px', height: '38px', borderRadius: '10px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '4rem 2rem',
              textAlign: 'center',
              border: '1px dashed var(--border-light)',
            }}
          >
            <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "1rem", color: "var(--text-muted)" }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Nenhum item encontrado nesta categoria
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
              Tente selecionar outra categoria ou limpar a busca.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredProducts.map((product) => {
              const isOutOfStock = product.current_stock <= 0;
              const isLowStock = product.current_stock > 0 && product.current_stock <= product.min_stock_alert;
              const inCartItem = cart.find((i) => i.product.id === product.id);

              const categoryClass = 'cat-' + product.category.toLowerCase();

              return (
                <div
                  key={product.id}
                  className={`card-interactive canteen-card-interactive ${categoryClass}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    position: 'relative',
                    opacity: isOutOfStock ? 0.6 : 1,
                  }}
                >
                  {renderCardBackgroundEffect(product.category)}
                  <div className="canteen-card-content">
                  {/* Badge de Estoque */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span className="badge" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                      {product.category}
                    </span>

                    {isOutOfStock ? (
                      <span className="badge" style={{ backgroundColor: 'var(--accent-rose-light)', color: 'var(--accent-rose)' }}>
                        Esgotado
                      </span>
                    ) : isLowStock ? (
                      <span className="badge" style={{ backgroundColor: 'var(--accent-amber-light)', color: 'var(--accent-amber)' }}>
                        Últimos {product.current_stock} un.
                      </span>
                    ) : (
                      <span className="badge badge-emerald">
                        {product.current_stock} un. disponíveis
                      </span>
                    )}
                  </div>

                  {/* Foto / Imagem com Fallback Visual */}
                  <div
                    className="canteen-product-img-box"
                    style={{
                      height: '135px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                      overflow: 'hidden',
                      border: '1px solid var(--border-light)',
                      position: 'relative',
                    }}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          padding: '0.4rem',
                          position: 'relative',
                          zIndex: 1,
                          transition: 'transform 0.3s ease',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sem foto</span>
                    )}
                  </div>

                  {/* Detalhes do Produto */}
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.35, minHeight: '2.7rem' }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', minHeight: '2.4rem', lineHeight: 1.4 }}>
                      {product.description || 'Disponível no freezer e expositor discente do campus.'}
                    </p>
                  </div>

                  {/* Preço e Botão de Ação */}
                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Preço Unitário</span>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                        R$ {Number(product.price).toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {isOutOfStock ? (
                      <button disabled className="btn btn-secondary" style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}>
                        Indisponível
                      </button>
                    ) : inCartItem ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            backgroundColor: 'var(--bg-card)',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: 800, padding: '0 0.4rem', fontSize: '0.95rem' }}>
                          {inCartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          disabled={inCartItem.quantity >= product.current_stock}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            backgroundColor: 'var(--bg-card)',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="btn btn-primary"
                        style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
                      >
                        + Adicionar
                      </button>
                    )}
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Carrinho Flutuante Fixo no Canto Inferior Direito (Não fecha nem atrapalha as compras) */}
        {totalCartCount > 0 && !isCartOpen && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 90,
              animation: 'cartPillPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="canteen-floating-cart-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                backgroundColor: 'var(--accent-blue)',
                color: '#ffffff',
                padding: '0.8rem 1.35rem',
                borderRadius: '50px',
                border: 'none',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </div>
                <span
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    borderRadius: '12px',
                    padding: '0.12rem 0.45rem',
                    minWidth: '20px',
                    textAlign: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                    lineHeight: 1.2,
                  }}
                >
                  {totalCartCount}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.68rem', opacity: 0.9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Meu Pedido
                </span>
                <span style={{ fontSize: '0.98rem', fontWeight: 800 }}>
                  R$ {totalCartAmount.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, paddingLeft: '0.2rem' }}>
                Ver Carrinho →
              </span>
            </button>
          </div>
        )}
          </>
        ) : (
          <CanteenStatementView onGoToCatalog={() => setActiveCanteenTab('catalog')} />
        )}

        {/* Modal de Carrinho Lateral (Drawer Responsivo) */}
        {isCartOpen && (
          <div
            onClick={() => setIsCartOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              zIndex: 100,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <div
              className="canteen-cart-drawer"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '420px',
                backgroundColor: 'var(--bg-card)',
                height: '100%',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-lg)',
                overflowY: 'auto',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Meu Pedido Cantina
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {totalCartCount} {totalCartCount === 1 ? 'item selecionado' : 'itens selecionados'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {cart.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title: 'Esvaziar Carrinho?',
                            message: 'Deseja realmente remover todos os itens selecionados do seu pedido da cantina?',
                            confirmLabel: 'Sim, esvaziar',
                            cancelLabel: 'Manter itens',
                            isDanger: true,
                            onConfirm: () => {
                              setCart([]);
                              try {
                                localStorage.removeItem('fatec_canteen_cart');
                              } catch {}
                              setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                              showToast('Carrinho esvaziado com sucesso.', 'info');
                            },
                          });
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                        }}
                        title="Esvaziar todos os itens do carrinho"
                      >
                        Limpar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                      title="Fechar gaveta de pedidos"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>

                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                    <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "0.75rem", color: "var(--text-muted)" }}><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div>
                    Seu carrinho está vazio.<br />Adicione itens do expositor para pagar via Pix.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="canteen-cart-item-row"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.85rem',
                          backgroundColor: 'var(--bg-muted)',
                          borderRadius: '12px',
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: '0.75rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            {item.product.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 600, marginTop: '0.15rem' }}>
                            R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border-light)', cursor: 'pointer', background: '#fff' }}
                          >
                            -
                          </button>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            disabled={item.quantity >= item.product.current_stock}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border-light)', cursor: 'pointer', background: '#fff' }}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              marginLeft: '0.35rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0.25rem',
                              borderRadius: '4px',
                              opacity: 0.85,
                              transition: 'opacity 0.2s',
                            }}
                            title="Remover produto do carrinho"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-sub)' }}>Total a Pagar:</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                      R$ {totalCartAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <button
                    onClick={handleStartCheckout}
                    disabled={isProcessingCheckout}
                    className="btn btn-emerald"
                    style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', fontWeight: 700 }}
                  >
                    {isProcessingCheckout ? 'Gerando QR Code Pix...' : 'Finalizar e Gerar Pix'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de Checkout Express (QR Code Pix Dinâmico) */}
        {isCheckoutModalOpen && (
          <div
            onClick={handleCloseCheckoutWithoutFinishing}
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
              className="canteen-checkout-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '520px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '20px',
                padding: '2.25rem 2rem',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <button
                onClick={handleCloseCheckoutWithoutFinishing}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                title="Voltar ao carrinho e manter itens"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>

              {checkoutError ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "1rem", color: "var(--accent-rose)" }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Atenção no Checkout
                  </h3>
                  <p style={{ color: 'var(--accent-rose)', marginTop: '0.75rem', fontSize: '0.95rem' }}>
                    {checkoutError}
                  </p>
                  <div style={{ marginTop: '1.75rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <Link href="/login" className="btn btn-primary">
                      Fazer Login
                    </Link>
                    <button onClick={() => setIsCheckoutModalOpen(false)} className="btn btn-secondary">
                      Fechar
                    </button>
                  </div>
                </div>
              ) : checkoutData && isPaymentConfirmedByCashier ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                  <div
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-emerald-light)',
                      color: 'var(--accent-emerald)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)',
                    }}
                  >
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
                    Baixa Confirmada pelo Caixa
                  </span>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
                    Pagamento Confirmado!
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', margin: '0 auto 1.5rem', maxWidth: '380px' }}>
                    Seu pagamento via Pix foi conferido e aprovado pelo caixa da cantina. Seus produtos já estão liberados para retirada no balcão!
                  </p>

                  <div
                    style={{
                      backgroundColor: 'var(--bg-muted)',
                      border: '1px dashed var(--border-light)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      margin: '0 auto 1.5rem',
                      maxWidth: '380px',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Código de Retirada do Pedido:
                    </span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '1px', marginTop: '0.25rem' }}>
                      #{checkoutData.orderId?.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: 700, marginTop: '0.4rem' }}>
                      Total Pago: R$ {checkoutData.totalAmount.toFixed(2).replace('.', ',')}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Enviamos uma confirmação detalhada para o seu e-mail institucional.
                  </p>

                  <button
                    onClick={() => {
                      setIsCheckoutModalOpen(false);
                      setIsPaymentConfirmedByCashier(false);
                      setCheckoutData(null);
                    }}
                    className="btn btn-emerald"
                    style={{ padding: '0.75rem 2.25rem', fontSize: '0.95rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Concluir e Retirar Itens
                  </button>
                </div>
              ) : checkoutData && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
                      Pix Dinâmico EMV Gerado
                    </span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Pagamento da Cantina
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Identificador do Pedido: <strong>#{checkoutData.txid}</strong>
                    </p>
                  </div>

                  {/* Valor Total do Pedido */}
                  <div className="canteen-checkout-amount-box" style={{ backgroundColor: 'var(--bg-muted)', borderRadius: '12px', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Valor Exato da Compra:</span>
                    <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                      R$ {checkoutData.totalAmount.toFixed(2).replace('.', ',')}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                      Favorecido: {checkoutData.merchantName} ({checkoutData.pixKey})
                    </span>
                  </div>

                  {/* QR Code Pix */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid var(--accent-emerald)', boxShadow: 'var(--shadow-sm)' }}>
                      <img
                        src={checkoutData.qrCodeUrl}
                        alt="QR Code Pix Dinâmico"
                        style={{ width: '210px', height: '210px', display: 'block' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Abra o aplicativo do seu banco e escaneie a imagem acima
                    </span>
                  </div>

                  {/* Chave Copia e Cola */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'block' }}>
                      Ou pague via Pix Copia-e-Cola:
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        readOnly
                        value={checkoutData.pixPayload || checkoutData.pixCopyPaste || ""}
                        className="form-input"
                        style={{ fontSize: '0.8rem', backgroundColor: 'var(--bg-muted)', fontFamily: 'monospace' }}
                      />
                      <button
                        onClick={handleCopyPix}
                        className={`btn ${copiedKey ? 'btn-emerald' : 'btn-primary'}`}
                        style={{ whiteSpace: 'nowrap', padding: '0.6rem 1rem' }}
                      >
                        {copiedKey ? 'Copiado!' : 'Copiar Chave'}
                      </button>
                    </div>
                  </div>

                  
                  {/* Botão de Teste Direto para Homologação do Histórico */}
                  <div style={{ marginBottom: '1.25rem', padding: '0.85rem', backgroundColor: 'rgba(2, 132, 199, 0.08)', borderRadius: '12px', border: '1px dashed var(--accent-blue)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Ambiente de Testes / Validação do Extrato:
                    </div>
                    <button
                      type="button"
                      onClick={handleSimulateTestPayment}
                      disabled={isProcessingCheckout}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      {isProcessingCheckout ? 'Processando teste...' : 'Simular Pagamento Pix (Teste do Histórico)'}
                    </button>
                  </div>

                  {/* Ações de Retorno ou Conclusão Rápida */}
                  <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={handleCloseCheckoutWithoutFinishing}
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-muted)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-main)',
                      }}
                    >
                      ← Voltar ao Carrinho (Manter Itens)
                    </button>
                    <button
                      type="button"
                      onClick={handleFinishPurchase}
                      className="btn btn-emerald"
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Já Paguei no App / Concluir
                    </button>
                  </div>

                  {/* Botão Limpo de WhatsApp para Avisar o Conferente */}
                  {checkoutData.conferenteWhatsapp && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <a
                        href={`https://wa.me/55${checkoutData.conferenteWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Olá! Realizei o Pix do pedido #${(checkoutData.orderId || checkoutData.txid || '').slice(-8).toUpperCase()} no valor de R$ ${checkoutData.totalAmount.toFixed(2).replace('.', ',')} na Cantina FATEC.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.85rem',
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          color: 'var(--accent-emerald)',
                          borderColor: 'var(--accent-emerald)',
                          backgroundColor: 'var(--bg-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        Avisar Conferente no WhatsApp
                      </a>
                    </div>
                  )}

                  {/* Formulário de Envio do Comprovante */}
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                    {proofSubmitted ? (
                      <div className="alert-box alert-success" style={{ textAlign: 'center', display: 'block' }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                          {ocrFeedback?.status === 'APROVADO_IA'
                            ? 'Comprovante Aprovado Automaticamente via IA OCR!'
                            : 'Comprovante Enviado para Conferência!'}
                        </div>
                        <p style={{ fontSize: '0.825rem' }}>
                          {ocrFeedback?.notes || 'Sua transação foi registrada no sistema. Você pode acompanhar o status no seu painel de Histórico.'}
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSendProof}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'block' }}>
                          Já pagou? Envie o print/foto ou cole o texto/E2E para conferência automática (OCR IA):
                        </label>
                        <div style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.45rem 0.85rem',
                              borderRadius: '8px',
                              border: '1px dashed var(--accent-blue)',
                              backgroundColor: 'var(--bg-muted)',
                              color: 'var(--accent-blue)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Anexar Print/Foto do Comprovante (Visão IA)
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProofFileChange}
                              style={{ display: 'none' }}
                            />
                          </label>
                          {proofImageName && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              {proofImageName}
                            </span>
                          )}
                        </div>
                        <textarea
                          placeholder="Ou cole o código E2E do comprovante / texto copiado do app do seu banco..."
                          value={proofText}
                          onChange={(e) => setProofText(e.target.value)}
                          className="form-input"
                          style={{ height: '70px', fontSize: '0.825rem', resize: 'none', marginBottom: '0.75rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            type="submit"
                            disabled={isSubmittingProof || (!proofText.trim() && !proofImageBase64)}
                            className="btn btn-emerald"
                            style={{ flex: 1, padding: '0.7rem' }}
                          >
                            {isSubmittingProof ? 'Validando via OCR IA...' : 'Confirmar e Validar Comprovante (OCR)'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCheckoutModalOpen(false);
                              setCheckoutData(null);
                              setActiveCanteenTab('statement');
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '0.7rem 1rem' }}
                          >
                            Ver Extrato
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Modal de Confirmação 100% Frontend */}
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

      {/* Toast Notifier Flutuante 100% Frontend */}
      <ToastNotification
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </AppLayout>
  );
}
