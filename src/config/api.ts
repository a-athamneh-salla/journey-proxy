// API configuration
export const API_CONFIG = {
  AIRFLOW_API_URL: process.env.AIRFLOW_API_URL || 'https://airflow.example.com/api',
  AIRFLOW_USERNAME: process.env.AIRFLOW_USERNAME || 'airflow_user',
  AIRFLOW_PASSWORD: process.env.AIRFLOW_PASSWORD || 'airflow_password',
  // Base64 encoded credentials for Basic Authentication
  get BASIC_AUTH() {
    // In a real environment, use Buffer.from(`${this.AIRFLOW_USERNAME}:${this.AIRFLOW_PASSWORD}`).toString('base64')
    // For testing/development, we're using a placeholder
    return 'YWlyZmxvd191c2VyOmFpcmZsb3dfcGFzc3dvcmQ='; // Placeholder for airflow_user:airflow_password
  },
};

// JWT and Webhook secret configuration
export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-key',
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || 'your-webhook-secret-key',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h', // Token expiration time
  API_KEY_PREFIX: 'ApiKey', // Prefix for API key authentication in Authorization header
};

// Database configuration
export const DB_CONFIG = {
  // D1 database is connected via wrangler.toml bindings
  MIGRATIONS_DIR: './migrations',
  DEFAULT_USER: {
    USERNAME: process.env.DEFAULT_USERNAME || 'admin',
    PASSWORD: process.env.DEFAULT_PASSWORD || 'changeme',
    EMAIL: process.env.DEFAULT_EMAIL || 'admin@example.com',
  },
};