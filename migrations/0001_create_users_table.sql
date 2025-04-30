-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch() AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(unixepoch() AS INTEGER))
);

-- Create api_keys table for JWT token generation
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  key_name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  expires_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch() AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(unixepoch() AS INTEGER)),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_api_keys_user_id ON api_keys (user_id);