import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AUTH_CONFIG } from '../config/api';
import { ApiKey } from '../types/database';
import * as bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * 
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 * 
 * @param plainText - Plain text password to compare
 * @param hashedPassword - Hashed password to compare against
 * @returns True if the passwords match, false otherwise
 */
export async function comparePasswords(plainText: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashedPassword);
}

/**
 * Generate a JWT token for a user
 * 
 * @param userId - User ID to include in the token
 * @param username - Username to include in the token
 * @param expiresIn - Token expiration time (default: 1 day)
 * @returns JWT token string
 */
export function generateJwtToken(userId: string, username: string, expiresIn = '1d'): string {
  const payload = { 
    userId, 
    username,
    iat: Math.floor(Date.now() / 1000)
  };
  
  // Using Buffer to ensure type compatibility
  const secret = Buffer.from(AUTH_CONFIG.JWT_SECRET, 'utf-8');
  
  // @ts-ignore - Ignoring type issues with jwt.sign
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verify a JWT token
 * 
 * @param token - JWT token to verify
 * @returns Decoded token payload if valid, null otherwise
 */
export function verifyJwtToken(token: string): any {
  try {
    // Using Buffer to ensure type compatibility
    const secret = Buffer.from(AUTH_CONFIG.JWT_SECRET, 'utf-8');
    
    // @ts-ignore - Ignoring type issues with jwt.verify
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

/**
 * Create a new API key for a user
 * 
 * @param db - D1 database instance
 * @param userId - User ID to create the key for
 * @param keyName - Name/description for the API key
 * @param expiresInDays - Number of days until the key expires (optional)
 * @returns The newly created API key object
 */
export async function createApiKey(
  db: D1Database,
  userId: string,
  keyName: string,
  expiresInDays?: number
): Promise<ApiKey> {
  const keyId = uuidv4();
  const apiKey = uuidv4();
  const timestamp = Math.floor(Date.now() / 1000);
  
  const expiresAt = expiresInDays 
    ? timestamp + (expiresInDays * 24 * 60 * 60)
    : undefined;

  const apiKeyObj: ApiKey = {
    id: keyId,
    user_id: userId,
    key_name: keyName,
    api_key: apiKey,
    expires_at: expiresAt,
    created_at: timestamp,
    updated_at: timestamp
  };

  await db.prepare(
    `INSERT INTO api_keys (id, user_id, key_name, api_key, expires_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    apiKeyObj.id,
    apiKeyObj.user_id,
    apiKeyObj.key_name,
    apiKeyObj.api_key,
    apiKeyObj.expires_at,
    apiKeyObj.created_at,
    apiKeyObj.updated_at
  ).run();

  return apiKeyObj;
}

/**
 * Validate an API key
 * 
 * @param db - D1 database instance
 * @param apiKey - API key to validate
 * @returns The associated user ID if valid, null otherwise
 */
export async function validateApiKey(db: D1Database, apiKey: string): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  
  const result = await db.prepare(`
    SELECT user_id FROM api_keys 
    WHERE api_key = ? 
    AND (expires_at IS NULL OR expires_at > ?)
  `).bind(apiKey, now).first<{ user_id: string }>();
  
  return result ? result.user_id : null;
}

/**
 * Get all API keys for a user
 * 
 * @param db - D1 database instance
 * @param userId - User ID to get keys for
 * @returns Array of API key objects
 */
export async function getApiKeys(db: D1Database, userId: string): Promise<ApiKey[]> {
  const result = await db.prepare(
    'SELECT * FROM api_keys WHERE user_id = ?'
  ).bind(userId).all<ApiKey>();
  
  return result.results || [];
}

/**
 * Delete an API key
 * 
 * @param db - D1 database instance
 * @param keyId - API key ID to delete
 * @returns True if the key was deleted, false otherwise
 */
export async function deleteApiKey(db: D1Database, keyId: string): Promise<boolean> {
  const result = await db.prepare(
    'DELETE FROM api_keys WHERE id = ?'
  ).bind(keyId).run();
  
  return result.meta.rows_written > 0;
}