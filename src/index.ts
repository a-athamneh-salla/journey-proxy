import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import proxy from './routes/proxy';
import webhook from './routes/webhook';
import users from './routes/users';
import { Env } from './types/database';

// Create the main Hono application
const app = new Hono<{ Bindings: Env }>();

// Apply global middlewares
app.use('*', logger());
app.use('*', cors({
  origin: ['*'],
  allowHeaders: ['Authorization', 'Content-Type', 'X-Webhook-Secret'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  maxAge: 86400,
}));

// Add health check route
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'Salla Journey Proxy API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount our route handlers
app.route('/proxy', proxy);
app.route('/webhook', webhook);
app.route('/users', users);

// Error handling for all routes
app.onError((err, c) => {
  console.error(`Global error handler: ${err.message}`);
  return c.json({ 
    error: true, 
    message: 'An unexpected error occurred', 
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  }, 500);
});

// Not found handler
app.notFound((c) => {
  return c.json({ error: true, message: 'Not Found' }, 404);
});

// Export for Cloudflare Workers
export default {
  fetch: app.fetch,
};