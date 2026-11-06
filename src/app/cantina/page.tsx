'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

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
}

export default function CantinaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Estados do Modal de Checkout
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutResult | null>(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  // Estados de Envio de Comprovante Pix
  const [proofText, setProofText] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

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
    { id: 'TODOS', label: 'Todos os Itens', icon: '🧺' },
    { id: 'SALGADO', label: 'Salgados & Snacks', icon: '🥐' },
    { id: 'BEBIDA', label: 'Bebidas Geladas', icon: '🥤' },
    { id: 'DOCE', label: 'Doces & Sobremesas', icon: '🍫' },
    { id: 'CONGELADO', label: 'Congelados (Micro-ondas)', icon: '❄️' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'TODOS' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Funções do Carrinho
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
    setIsCartOpen(true);
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
        notes: 'Compra autônoma Honest Market - FATEC Rio Claro',
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
      };

      setCheckoutData(normalizedData);
      setIsCheckoutModalOpen(true);
      setCart([]); // Esvazia o carrinho pós checkout
      setIsCartOpen(false);
      fetchProducts(); // Atualiza estoque em tela
    } catch (err: any) {
      setCheckoutError(err.message || 'Erro inesperado ao gerar cobrança Pix.');
      setIsCheckoutModalOpen(true);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Copiar chave Pix Copia-e-Cola
  const handleCopyPix = () => {
    const payload = checkoutData?.pixPayload || checkoutData?.pixCopyPaste;
    if (!payload) return;
    navigator.clipboard.writeText(payload);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  // Enviar comprovante Pix
  const handleSendProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutData?.orderId || !proofText.trim()) return;

    setIsSubmittingProof(true);
    try {
      const res = await fetch(`/api/canteen/transactions/${checkoutData.orderId}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptText: proofText,
          e2eId: proofText.length > 20 ? proofText.slice(0, 32) : undefined,
        }),
      });

      if (res.ok) {
        setProofSubmitted(true);
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
            <div className="canteen-liquid-fill">
              <div className="canteen-liquid-wave" />
              <div className="canteen-bubble" />
              <div className="canteen-bubble" />
              <div className="canteen-bubble" />
              <div className="canteen-bubble" />
              <div className="canteen-bubble" />
            </div>
          </div>
        );
      case 'DOCE':
        return (
          <div className="canteen-card-bg-effect">
            <div className="canteen-candy-fill">
              <span className="canteen-falling-candy">🍫</span>
              <span className="canteen-falling-candy">🍬</span>
              <span className="canteen-falling-candy">🍭</span>
              <span className="canteen-falling-candy">🍪</span>
              <span className="canteen-falling-candy">✨</span>
            </div>
          </div>
        );
      case 'CONGELADO':
        return (
          <div className="canteen-card-bg-effect">
            <div className="canteen-frost-overlay" />
            <span className="canteen-snowflake">❄️</span>
            <span className="canteen-snowflake">🧊</span>
            <span className="canteen-snowflake">❄️</span>
            <span className="canteen-snowflake">✨</span>
          </div>
        );
      case 'SALGADO':
        return (
          <div className="canteen-card-bg-effect">
            <div className="canteen-crispy-fill" />
            <span className="canteen-spice-flake">✨</span>
            <span className="canteen-spice-flake">🥐</span>
            <span className="canteen-spice-flake">🔥</span>
            <span className="canteen-spice-flake">🧂</span>
            <span className="canteen-spice-flake">✨</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Ícones ilustrativos nativos para fallback de imagem dos produtos
  const getProductFallbackEmoji = (cat: string) => {
    switch (cat) {
      case 'BEBIDA': return '🥤';
      case 'SALGADO': return '🥐';
      case 'CONGELADO': return '🥟';
      case 'DOCE': return '🍫';
      default: return '🥪';
    }
  };

  return (
    <AppLayout activePath="/cantina">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Cabeçalho da Cantina com Identidade FATEC */}
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
              <span className="badge badge-emerald">Honest Market Ativo</span>
              <span className="badge badge-blue">Pix Automático BACEN</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Autoatendimento Discente</span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Cantina Discente dos Estudantes
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '680px', lineHeight: 1.6 }}>
              Pegue o produto na prateleira física, adicione ao seu pedido abaixo e escaneie o <strong>QR Code Pix com valor exato</strong>. Sem filas, sem pranchetas de papel e com extrato em tempo real.
            </p>
          </div>

          {/* Ações do Topo: Gerenciar Estoque e Meu Pedido */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/cantina/admin"
              className="btn btn-secondary"
              style={{
                padding: '0.8rem 1.25rem',
                fontSize: '0.925rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                fontWeight: 600,
                boxShadow: 'var(--shadow-sm)',
              }}
              title="Acessar painel do Centro Acadêmico e Secretaria para reposição, novos itens e preços"
            >
              <span>⚙️</span>
              <span>Gerenciar Estoque (CA / Secretaria)</span>
            </Link>

            {/* Botão de Atalho para o Carrinho */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="btn btn-primary"
              style={{ padding: '0.8rem 1.4rem', fontSize: '0.95rem', position: 'relative' }}
            >
              <span>🛒 Meu Pedido</span>
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
                    style={{
                      border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--accent-blue-light)' : '#ffffff',
                      color: isSelected ? 'var(--accent-blue-hover)' : 'var(--text-main)',
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
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Barra de Busca de Itens */}
            <div style={{ minWidth: '260px', flex: '1 1 260px', maxWidth: '380px' }}>
              <input
                type="text"
                placeholder="🔍 Buscar salgado, refrigerante, doce..."
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
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s infinite linear' }}>⏳</div>
            Carregando catálogo de produtos da cantina em tempo real...
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
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
                    style={{
                      height: '135px',
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
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
                            backgroundColor: '#ffffff',
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
                            backgroundColor: '#ffffff',
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

        {/* Modal de Carrinho Lateral (Drawer Responsivo) */}
        {isCartOpen && (
          <div
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
              style={{
                width: '100%',
                maxWidth: '420px',
                backgroundColor: '#ffffff',
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
                  <button
                    onClick={() => setIsCartOpen(false)}
                    style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    ✕
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
                    Seu carrinho está vazio.<br />Adicione itens do expositor para pagar via Pix.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
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
                            onClick={() => removeFromCart(item.product.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1rem', cursor: 'pointer', marginLeft: '0.25rem' }}
                            title="Remover do pedido"
                          >
                            🗑️
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
                maxWidth: '520px',
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
                onClick={() => {
                  setIsCheckoutModalOpen(false);
                  setCheckoutData(null);
                  setProofSubmitted(false);
                  setProofText('');
                }}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>

              {checkoutError ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
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
                  <div style={{ backgroundColor: 'var(--bg-muted)', borderRadius: '12px', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
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
                        {copiedKey ? '✓ Copiado!' : 'Copiar Chave'}
                      </button>
                    </div>
                  </div>

                  {/* Formulário de Envio do Comprovante */}
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                    {proofSubmitted ? (
                      <div className="alert-box alert-success" style={{ textAlign: 'center', display: 'block' }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>✓ Comprovante Enviado com Sucesso!</div>
                        <p style={{ fontSize: '0.825rem' }}>
                          Sua transação foi registrada no sistema. Você pode acompanhar o status no seu painel de Histórico.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSendProof}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'block' }}>
                          Já pagou? Cole o comprovante ou código de autenticação bancária (opcional):
                        </label>
                        <textarea
                          placeholder="Cole o código E2E do comprovante ou o texto copiado do app do seu banco..."
                          value={proofText}
                          onChange={(e) => setProofText(e.target.value)}
                          className="form-input"
                          style={{ height: '70px', fontSize: '0.825rem', resize: 'none', marginBottom: '0.75rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            type="submit"
                            disabled={isSubmittingProof || !proofText.trim()}
                            className="btn btn-emerald"
                            style={{ flex: 1, padding: '0.7rem' }}
                          >
                            {isSubmittingProof ? 'Enviando...' : 'Confirmar Envio do Comprovante'}
                          </button>
                          <Link href="/historico" className="btn btn-secondary" style={{ padding: '0.7rem 1rem' }}>
                            Ver Extrato
                          </Link>
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
    </AppLayout>
  );
}
