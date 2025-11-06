/**
 * User Service
 * Handles database operations for user management
 */

import bcrypt from 'bcrypt';
import { query } from '../config/database';
import { User } from '@momentum/shared';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = 10;

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  timezone: string;
  created_at: Date;
  subscription_status: string;
  subscription_expires_at: Date | null;
}

/**
 * Convert database row to User object
 */
function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    timezone: row.timezone,
    createdAt: new Date(row.created_at),
    subscriptionStatus: row.subscription_status as any,
    subscriptionExpiresAt: row.subscription_expires_at
      ? new Date(row.subscription_expires_at)
      : undefined,
  };
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  password: string,
  name: string,
  timezone: string = 'UTC'
): Promise<User> {
  // Check if user already exists
  const existingUser = await query<UserRow>(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert user
  const result = await query<UserRow>(
    `INSERT INTO users (email, password_hash, name, timezone, subscription_status)
     VALUES ($1, $2, $3, $4, 'free_trial')
     RETURNING *`,
    [email.toLowerCase(), passwordHash, name, timezone]
  );

  const user = rowToUser(result.rows[0]);

  // Initialize streak and range for new user
  await query(
    'INSERT INTO streaks (user_id, current_streak, longest_streak) VALUES ($1, 0, 0)',
    [user.id]
  );

  await query(
    `INSERT INTO range_progress (user_id, day_number, date, social_radius, physical_radius, professional_radius, emotional_radius)
     VALUES ($1, 0, CURRENT_DATE, 20, 20, 20, 20)`,
    [user.id]
  );

  return user;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToUser(result.rows[0]);
}

/**
 * Find user by ID
 */
export async function findUserById(userId: string): Promise<User | null> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToUser(result.rows[0]);
}

/**
 * Verify user password
 */
export async function verifyPassword(
  email: string,
  password: string
): Promise<User | null> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    return null;
  }

  // Update last login
  await query(
    'UPDATE users SET last_login_at = NOW() WHERE id = $1',
    [user.id]
  );

  return rowToUser(user);
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<{ name: string; timezone: string }>
): Promise<User> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramCount}`);
    values.push(updates.name);
    paramCount++;
  }

  if (updates.timezone !== undefined) {
    fields.push(`timezone = $${paramCount}`);
    values.push(updates.timezone);
    paramCount++;
  }

  if (fields.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  values.push(userId);

  const result = await query<UserRow>(
    `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  return rowToUser(result.rows[0]);
}

/**
 * Delete user account
 */
export async function deleteUser(userId: string): Promise<void> {
  const result = await query(
    'DELETE FROM users WHERE id = $1',
    [userId]
  );

  if (result.rowCount === 0) {
    throw new AppError('User not found', 404);
  }
}
