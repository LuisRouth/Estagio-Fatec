// ====================================================================
// MOTOR DE AUTENTICAÇÃO E SESSÃO SEGURA (JWT + BCRYPT)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// ====================================================================

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { JWTPayload, SafeUser, User } from './types';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'fatec_rio_claro_super_secure_jwt_secret_key_2026_cesar_dev_token';
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
export const AUTH_COOKIE_NAME = 'fatec_auth_token';

const SALT_ROUNDS = 10;

/**
 * Hash seguro de senha usando Bcrypt com Salt
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Comparação em tempo constante para mitigar timing attacks
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

/**
 * Assina um token JWT com claims do usuário
 */
export async function generateToken(user: SafeUser | User): Promise<string> {
  const payload: JWTPayload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    course: user.course,
    semester: user.semester,
  };

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setIssuer('fatec-rio-claro-portal')
    .setAudience('fatec-students')
    .sign(JWT_SECRET_KEY);
}

/**
 * Valida e decodifica um token JWT
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY, {
      issuer: 'fatec-rio-claro-portal',
      audience: 'fatec-students',
    });
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Configuração de Cookie Seguro HttpOnly
 */
export function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 dias em segundos
    path: '/',
  };
}

/**
 * Extrai a sessão do usuário autenticado no servidor
 */
export async function getCurrentSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Sanitiza o usuário removendo o hash de senha antes do retorno à API
 */
export function sanitizeUser(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...safe } = user;
  return safe;
}
