'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

interface TransactionItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Transaction {
  id: string;
  txid: string;
  total_amount: number;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'REVISAO_CA';
  created_at: string;
  receipt_text?: string;
  e2e_id?: string;
  items?: TransactionItem[];
}

interface StatementSummary {
  totalSpent: number;
  confirmedCount: number;
  pendingCount: number;
  totalOrders: number;
}

export default function HistoricoPage() {
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
        return { label: '✓ Pago e Aprovado', bg: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' };
      case 'PENDENTE':
        return { label: '⏳ Aguardando Pix', bg: 'var(--accent-amber-light)', color: 'var(--accent-amber)' };
      case 'REVISAO_CA':
        return { label: '🔍 Em Revisão pelo CA', bg: 'var(--accent-blue-light)', color: 'var(--accent-blue-hover)' };
      case 'CANCELADO':
        return { label: '✕ Cancelado', bg: 'var(--accent-rose-light)', color: 'var(--accent-rose)' };
      default:
        return { label: status, bg: 'var(--bg-muted)', color: 'var(--text-muted)' };
    }
  };

  return (
    <AppLayout activePath="/historico">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Cabeçalho do Painel */}
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
              <span className="badge badge-emerald">Extrato Financeiro Transparente</span>
              <span className="badge badge-blue">Honest Market FATEC</span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Meu Histórico de Compras na Cantina
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '680px', lineHeight: 1.6 }}>
              Acompanhe seu consumo pessoal, valide seus pagamentos Pix e tenha controle total dos seus gastos nos intervalos da faculdade.
            </p>
          </div>

          <Link href="/cantina" className="btn btn-primary" style={{ padding: '0.8rem 1.4rem' }}>
            🥪 Comprar na Cantina
          </Link>
        </div>

        {/* Mensagem de Erro / Autenticação Obrigatória */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '3rem 2rem',
              textAlign: 'center',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Identificação Necessária
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', maxWidth: '440px', margin: '0.5rem auto 1.5rem' }}>
              Para garantir a privacidade das suas transações, entre com seu e-mail institucional FATEC.
            </p>
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.7rem 1.75rem' }}>
              Acessar Minha Conta
            </Link>
          </div>
        )}

        {/* Métricas e Resumo Financeiro Pessoal */}
        {summary && !errorMsg && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Consumido</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '0.35rem' }}>
                R$ {summary.totalSpent.toFixed(2).replace('.', ',')}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Extrato consolidado</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Compras Confirmadas</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.35rem' }}>
                {summary.confirmedCount}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pagamentos via Pix conferidos</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pendentes de Confirmação</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: summary.pendingCount > 0 ? 'var(--accent-amber)' : 'var(--text-muted)', marginTop: '0.35rem' }}>
                {summary.pendingCount}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aguardando validação CA</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total de Pedidos</span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                {summary.totalOrders}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registros na cantina discente</span>
            </div>
          </div>
        )}

        {/* Tabela e Lista de Transações */}
        {!errorMsg && (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.75rem',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Filtros de Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Detalhamento das Compras
              </h2>

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'TODOS', label: 'Todos os Status' },
                  { id: 'CONFIRMADO', label: 'Confirmados' },
                  { id: 'PENDENTE', label: 'Pendentes' },
                  { id: 'REVISAO_CA', label: 'Em Revisão' },
                ].map((s) => {
                  const isSelected = filterStatus === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setFilterStatus(s.id)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                        backgroundColor: isSelected ? 'var(--accent-blue-light)' : '#ffffff',
                        color: isSelected ? 'var(--accent-blue-hover)' : 'var(--text-sub)',
                        fontSize: '0.8rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem', animation: 'spin 1s infinite linear' }}>⏳</div>
                Carregando extrato pessoal...
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🧾</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Nenhuma transação encontrada
                </h3>
                <p style={{ fontSize: '0.875rem', marginTop: '0.35rem' }}>
                  Quando você fizer uma compra na cantina e escanear o QR Code Pix, ela constará aqui automaticamente.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {transactions.map((tx) => {
                  const statusBadge = getStatusBadge(tx.status);
                  const dateStr = new Date(tx.created_at).toLocaleString('pt-BR');

                  return (
                    <div
                      key={tx.id}
                      style={{
                        padding: '1.25rem',
                        backgroundColor: 'var(--bg-muted)',
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
                              Pedido #{tx.txid || tx.id.slice(0, 8)}
                            </span>
                            <span
                              className="badge"
                              style={{ backgroundColor: statusBadge.bg, color: statusBadge.color }}
                            >
                              {statusBadge.label}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                            Data da Operação: {dateStr}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Valor do Pedido</span>
                          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
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
                              style={{
                                fontSize: '0.8rem',
                                backgroundColor: '#ffffff',
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

                      {/* Identificador E2E do Banco se houver */}
                      {tx.e2e_id && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          E2E BACEN: {tx.e2e_id}
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
    </AppLayout>
  );
}
