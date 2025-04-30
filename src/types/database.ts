// Database types for D1 integration

export interface User {
  id: string;
  username: string;
  password: string;
  email?: string;
  created_at: number;
  updated_at: number;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key_name: string;
  api_key: string;
  expires_at?: number;
  created_at: number;
  updated_at: number;
}

// Type definitions for D1 database binding
export interface Env {
  DB: D1Database;
}

// D1 Result type
export interface D1Result<T> {
  results?: T[];
  success: boolean;
  meta?: {
    duration: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
  };
  error?: string;
}