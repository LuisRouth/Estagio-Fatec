export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '640px', background: '#ffffff', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          Portal Integrado — FATEC Rio Claro
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.025em' }}>
          Ambiente Digital dos Estudantes
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Estágio Curricular Supervisionado (Prof. Orlando). A fundação do backend, modelagem PostgreSQL e sistema de segurança (Sprint 1 - Cesar) estão operacionais.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', textAlign: 'left' }}>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Autenticação</div>
            <div style={{ fontWeight: 600, color: '#059669', fontSize: '0.95rem' }}>JWT + Bcrypt (Ativo)</div>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Banco de Dados</div>
            <div style={{ fontWeight: 600, color: '#0284c7', fontSize: '0.95rem' }}>PostgreSQL DDL Pronto</div>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Carga Horária</div>
            <div style={{ fontWeight: 600, color: '#6366f1', fontSize: '0.95rem' }}>Sprint 1: 66h / 200h</div>
          </div>
        </div>
      </div>
    </main>
  );
}
