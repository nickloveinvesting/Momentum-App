/**
 * JWT Configuration
 * JSON Web Token settings and utilities
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET: string =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
export const JWT_REFRESH_EXPIRES_IN: string =
  process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Generate JWT token for user
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  } as SignOptions);
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as any,
  } as SignOptions);
}
