import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePasswords } from './auth';
import { User } from '../types/database';

/**
 * Create a new user
 * 
 * @param db - D1 database instance
 * @param username - Username for the new user
 * @param password - Password for the new user
 * @param email - Optional email for the new user
 * @returns The newly created user object
 */
export async function createUser(
  db: D1Database,
  username: string,
  password: string,
  email?: string
): Promise<User> {
  const userId = uuidv4();
  const hashedPassword = await hashPassword(password);
  const timestamp = Math.floor(Date.now() / 1000);

  const user: User = {
    id: userId,
    username,
    password: hashedPassword,
    email,
    created_at: timestamp,
    updated_at: timestamp
  };

  await db.prepare(
    `INSERT INTO users (id, username, password, email, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    user.id,
    user.username,
    user.password,
    user.email,
    user.created_at,
    user.updated_at
  ).run();

  return user;
}

/**
 * Get a user by username
 * 
 * @param db - D1 database instance
 * @param username - Username to look up
 * @returns The user object or null if not found
 */
export async function getUserByUsername(
  db: D1Database,
  username: string
): Promise<User | null> {
  const result = await db.prepare(
    'SELECT * FROM users WHERE username = ?'
  ).bind(username).first<User>();
  
  return result || null;
}

/**
 * Get a user by ID
 * 
 * @param db - D1 database instance
 * @param id - User ID to look up
 * @returns The user object or null if not found
 */
export async function getUserById(
  db: D1Database,
  id: string
): Promise<User | null> {
  const result = await db.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(id).first<User>();
  
  return result || null;
}

/**
 * Verify user credentials
 * 
 * @param db - D1 database instance
 * @param username - Username to verify
 * @param password - Password to verify
 * @returns The user object if credentials are valid, null otherwise
 */
export async function verifyUserCredentials(
  db: D1Database,
  username: string,
  password: string
): Promise<User | null> {
  const user = await getUserByUsername(db, username);
  if (!user) return null;

  const isValidPassword = await comparePasswords(password, user.password);
  return isValidPassword ? user : null;
}

/**
 * Delete a user by ID
 * 
 * @param db - D1 database instance
 * @param id - User ID to delete
 * @returns True if the user was deleted, false otherwise
 */
export async function deleteUser(
  db: D1Database,
  id: string
): Promise<boolean> {
  const result = await db.prepare(
    'DELETE FROM users WHERE id = ?'
  ).bind(id).run();
  
  return result.meta.rows_written > 0;
}