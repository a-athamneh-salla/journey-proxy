import { Hono } from 'hono';
import { jwtAuthMiddleware } from '../middlewares/authentication';
import { API_CONFIG } from '../config/api';
import { Env } from '../types/database';

const proxy = new Hono<{ Bindings: Env }>();

// Middleware to validate JWT for all proxy routes
proxy.use('*', jwtAuthMiddleware);

/**
 * Error handler for proxy requests
 */
const handleProxyError = (c: any, error: Error) => {
  console.error('Proxy error:', error);
  return c.json({ error: 'Failed to proxy request' }, 500);
};

/**
 * Log proxy request to database (optional)
 * Note: This function is a stub for future implementation.
 * We're not actually using the parameters yet since we haven't
 * created a request_logs table in our migrations.
 */
const logProxyRequest = async (
  _db: D1Database,
  _userId: string,
  _method: string,
  _path: string,
  _status: number
) => {
  try {
    // Optionally log proxy requests for auditing
    // This is commented out since we didn't define the table in migrations
    /*
    await db.prepare(
      `INSERT INTO request_logs (user_id, method, path, status, timestamp)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      userId,
      method,
      path,
      status,
      Math.floor(Date.now() / 1000)
    ).run();
    */
  } catch (error) {
    console.error('Failed to log proxy request:', error);
  }
};

// Proxy POST requests
proxy.post('/', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const response = await fetch(`${API_CONFIG.AIRFLOW_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${API_CONFIG.BASIC_AUTH}`,
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json() as Record<string, unknown>;
    
    // Log this request (optional)
    await logProxyRequest(c.env.DB, user.userId, 'POST', '/', response.status);
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleProxyError(c, error as Error);
  }
});

// Proxy PUT requests
proxy.put('/', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const response = await fetch(`${API_CONFIG.AIRFLOW_API_URL}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${API_CONFIG.BASIC_AUTH}`,
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json() as Record<string, unknown>;
    
    // Log this request (optional)
    await logProxyRequest(c.env.DB, user.userId, 'PUT', '/', response.status);
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleProxyError(c, error as Error);
  }
});

// Proxy PATCH requests
proxy.patch('/', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const response = await fetch(`${API_CONFIG.AIRFLOW_API_URL}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${API_CONFIG.BASIC_AUTH}`,
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json() as Record<string, unknown>;
    
    // Log this request (optional)
    await logProxyRequest(c.env.DB, user.userId, 'PATCH', '/', response.status);
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleProxyError(c, error as Error);
  }
});

// Proxy GET requests
proxy.get('/', async (c) => {
  try {
    const user = c.get('user');
    const query = c.req.query();
    const queryString = new URLSearchParams(query).toString();
    const url = queryString 
      ? `${API_CONFIG.AIRFLOW_API_URL}?${queryString}`
      : API_CONFIG.AIRFLOW_API_URL;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${API_CONFIG.BASIC_AUTH}`,
      },
    });
    
    const data = await response.json() as Record<string, unknown>;
    
    // Log this request (optional)
    await logProxyRequest(c.env.DB, user.userId, 'GET', '/', response.status);
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleProxyError(c, error as Error);
  }
});

// Support for wildcard paths - matches with OpenAPI specs
proxy.post('/*', async (c) => {
  try {
    const user = c.get('user');
    const path = c.req.path.replace('/proxy', '');
    const body = await c.req.json();
    const response = await fetch(`${API_CONFIG.AIRFLOW_API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${API_CONFIG.BASIC_AUTH}`,
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json() as Record<string, unknown>;
    
    // Log this request (optional)
    await logProxyRequest(c.env.DB, user.userId, 'POST', path, response.status);
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleProxyError(c, error as Error);
  }
});

// Add support for GET with wildcards
proxy.get('/*', async (c) => {
  try {
    const user = c.get('user');
    const path = c.req.path.replace('/proxy', '');
    const query = c.req.query();
    const queryString = new URLSearchParams(query).toString();
    const url = queryString 
      ? `${API_CONFIG.AIRFLOW_API_URL}${path}?${queryString}`
      : `${API_CONFIG.AIRFLOW_API_URL}${path}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${API_CONFIG.BASIC_AUTH}`,
      },
    });
    
    const data = await response.json() as Record<string, unknown>;
    
    // Log this request (optional)
    await logProxyRequest(c.env.DB, user.userId, 'GET', path, response.status);
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleProxyError(c, error as Error);
  }
});

export default proxy;