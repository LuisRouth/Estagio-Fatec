// ====================================================================
// ENDPOINT: HEALTH CHECK & STATUS DO SISTEMA (GET /api/health)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// ====================================================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SECURITY_HEADERS } from '@/lib/security';

export async function GET() {
  const isMock = db.isMockMode();

  return NextResponse.json(
    {
      status: 'UP',
      application: 'Portal Integrado FATEC Rio Claro',
      version: '1.0.0-sprint1',
      sprint: 'Sprint 1 - Cesar (Backend & Segurança)',
      mode: isMock ? 'HYBRID_MOCK_DEVELOPMENT' : 'POSTGRESQL_PRODUCTION',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      features: {
        authentication: 'JWT_BCRYPT_ENABLED',
        rbac: 'ROLE_BASED_ACCESS_CONTROL_ACTIVE',
        rateLimiter: 'SLIDING_WINDOW_ACTIVE',
        canteenModel: 'HONEST_MARKET_PIX',
      },
    },
    { status: 200, headers: SECURITY_HEADERS }
  );
}
