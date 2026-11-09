'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface TransactionItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal?: number;
  total_price?: number;
}

interface Transaction {
  id: string;
  txid?: string;
  total_amount: number;
  status: 'PENDENTE' | 'PAGO' | 'CONFIRMADO' | 'CANCELADO' | 'EM_ANALISE' | 'REVISAO_CA';
  created_at: string;
  receipt_text?: string;
  notes?: string | null;
  pix_end_to_end_id?: string | null;
  e2e_id?: string;
  items?: TransactionItem[];
}

interface StatementSummary {
  totalSpent: number;
  paidCount?: number;
  confirmedCount?: number;
  pendingCount: number;
  inAnalysisCount?: number;
  totalTransactions?: number;
  totalOrders?: number;
}

interface CanteenStatementViewProps {
  onGoToCatalog?: () => void;
}

export default function CanteenStatementView({ onGoToCatalog }: CanteenStatementViewProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<StatementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');

  useEffect(() => {
    fetchStatement();
  }, [filterStatus]);

  const fetchStatement = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const url = filterStatus !== 'TODOS' ? `/api/canteen/history?status=${filterStatus}` : '/api/canteen/history';
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Faça login para consultar seu extrato de compras.');
      }

      if (data.success && data.data) {
        setTransactions(data.data.transactions || []);
        setSummary(data.data.summary || null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao carregar extrato discente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMADO':
      case 'PAGO':
        return { label: 'Pago e Aprovado', className: 'status-badge status-badge-confirmado' };
      case 'PENDENTE':
        return { label: 'Aguardando Pix', className: 'status-badge status-badge-pendente' };
      case 'REVISAO_CA':
      case 'EM_ANALISE':
        return { label: 'Em Revisão pelo CA', className: 'status-badge status-badge-revisao' };
      case 'CANCELADO':
        return { label: 'Cancelado', className: 'status-badge status-badge-cancelado' };
      default:
        return { label: status, className: 'status-badge' };
    }
  };

  const paidOrdersCount = summary ? (summary.paidCount ?? summary.confirmedCount ?? 0) : 0;
  const totalOrdersCount = summary ? (summary.totalTransactions ?? summary.totalOrders ?? 0) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Mensagem de Erro / Autenticação Obrigatória */}
      {errorMsg && (
        <div
          className="canteen-admin-card"
          style={{
            padding: '3rem 2rem',
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
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Identificação Necessária
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', maxWidth: '440px', margin: 0, lineHeight: 1.5 }}>
            Para garantir a privacidade e segurança do seu extrato de compras na cantina, acesse com seu e-mail institucional FATEC.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
              Acessar Minha Conta
            </Link>
            {onGoToCatalog && (
              <button type="button" onClick={onGoToCatalog} className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem' }}>
                Voltar ao Cardápio
              </button>
            )}
          </div>
        </div>
      )}

      {/* Métricas e Resumo Financeiro Pessoal */}
      {summary && !errorMsg && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="canteen-statement-metric-card" style={{ borderRadius: '16px', padding: '1.25rem 1.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Consumido</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '0.25rem' }}>
              R$ {Number(summary.totalSpent || 0).toFixed(2).replace('.', ',')}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Extrato consolidado</span>
          </div>

          <div className="canteen-statement-metric-card" style={{ borderRadius: '16px', padding: '1.25rem 1.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Compras Confirmadas</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
              {paidOrdersCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pagamentos via Pix conferidos</span>
          </div>

          <div className="canteen-statement-metric-card" style={{ borderRadius: '16px', padding: '1.25rem 1.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pendentes de Confirmação</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: summary.pendingCount > 0 ? 'var(--accent-amber)' : 'var(--text-muted)', marginTop: '0.25rem' }}>
              {summary.pendingCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aguardando Pix ou caixa</span>
          </div>

          <div className="canteen-statement-metric-card" style={{ borderRadius: '16px', padding: '1.25rem 1.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total de Pedidos</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {totalOrdersCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registros na cantina discente</span>
          </div>
        </div>
      )}

      {/* Tabela e Lista de Transações */}
      {!errorMsg && (
        <div className="canteen-statement-main-card" style={{ borderRadius: '16px', padding: '1.5rem', minHeight: '340px' }}>
          {/* Filtros de Status e Atualizar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Detalhamento das Minhas Compras
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Histórico de lanches, bebidas e baixas efetuadas
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'TODOS', label: 'Todos os Status' },
                  { id: 'PAGO', label: 'Confirmados (Pago)' },
                  { id: 'PENDENTE', label: 'Pendentes' },
                  { id: 'EM_ANALISE', label: 'Em Revisão CA' },
                ].map((s) => {
                  const isSelected = filterStatus === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFilterStatus(s.id)}
                      className={`canteen-statement-filter-btn ${isSelected ? 'active' : ''}`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={fetchStatement}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                title="Recarregar extrato"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                  <path d="M16 21h5v-5"/>
                </svg>
                Atualizar
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite', marginBottom: '0.85rem' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Carregando extrato pessoal...</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Sincronizando compras e comprovantes Pix</div>
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Nenhuma transação encontrada
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.35rem', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                Quando você fizer um pedido na cantina e escanear o QR Code Pix, ele constará aqui em tempo real.
              </p>
              {onGoToCatalog && (
                <button
                  type="button"
                  onClick={onGoToCatalog}
                  className="btn btn-primary"
                  style={{ marginTop: '1rem', padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}
                >
                  Ir para o Cardápio
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {transactions.map((tx) => {
                const statusBadge = getStatusBadge(tx.status);
                const dateStr = new Date(tx.created_at).toLocaleString('pt-BR');
                const e2eCode = tx.pix_end_to_end_id || tx.e2e_id;

                return (
                  <div
                    key={tx.id}
                    className="canteen-statement-tx-row"
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    {/* Linha Principal da Transação */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                            Pedido #{tx.txid || tx.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className={statusBadge.className}>
                            {statusBadge.label}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                          Data da Operação: {dateStr}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Valor do Pedido</span>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                          R$ {Number(tx.total_amount).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    {/* Itens Comprados */}
                    {tx.items && tx.items.length > 0 && (
                      <div style={{ borderTop: '1px dashed var(--border-light)', paddingTop: '0.65rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {tx.items.map((it) => (
                          <span
                            key={it.id}
                            className="canteen-statement-item-chip"
                            style={{
                              fontSize: '0.8rem',
                              border: '1px solid var(--border-light)',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              color: 'var(--text-main)',
                            }}
                          >
                            <strong>{it.quantity}x</strong> {it.product_name} (R$ {Number(it.unit_price).toFixed(2).replace('.', ',')})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Identificador E2E do BACEN ou Observações */}
                    {(e2eCode || tx.notes) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {e2eCode && <span style={{ fontFamily: 'monospace' }}>E2E BACEN: {e2eCode}</span>}
                        {tx.notes && <span>{tx.notes.replace(/honest\s*market/gi, 'Cantina Discente')}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
