'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { EmailVerificationScreen } from '@/components/auth/EmailVerificationScreen';

function VerificarEmailContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState({
    nome: 'Estudante',
    email: 'aluno@aluno.cps.sp.gov.br',
    ra: '',
    curso: 'IA' as 'IA' | 'ESG',
    semestre: 1,
  });

  useEffect(() => {
    // 1. Tenta carregar dos search params da URL
    const queryEmail = searchParams.get('email');
    const queryNome = searchParams.get('nome');
    const queryRa = searchParams.get('ra');
    const queryCurso = searchParams.get('curso') as 'IA' | 'ESG' | null;
    const querySemestre = searchParams.get('semestre');

    if (queryEmail) {
      setData({
        nome: queryNome || 'Estudante',
        email: queryEmail,
        ra: queryRa || '',
        curso: queryCurso === 'ESG' ? 'ESG' : 'IA',
        semestre: querySemestre ? Number(querySemestre) : 1,
      });
      return;
    }

    // 2. Tenta carregar do rascunho de cadastro do sessionStorage
    try {
      const draft = sessionStorage.getItem('fatec_cadastro_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        setData({
          nome: parsed.nome || 'Estudante',
          email: parsed.email || 'aluno@aluno.cps.sp.gov.br',
          ra: parsed.ra || '',
          curso: parsed.curso === 'ESG' ? 'ESG' : 'IA',
          semestre: parsed.semestre || 1,
        });
      }
    } catch {}
  }, [searchParams]);

  return (
    <EmailVerificationScreen
      nome={data.nome}
      email={data.email}
      ra={data.ra}
      curso={data.curso}
      semestre={data.semestre}
    />
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Carregando verificação de credenciais...</p>
        </div>
      }
    >
      <VerificarEmailContent />
    </Suspense>
  );
}
