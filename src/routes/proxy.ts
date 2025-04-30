import { Hono } from 'hono';
import { jwtAuthMiddleware } from '../middlewares/authentication';
import { API_CONFIG } from '../config/api';

const proxy = new Hono();

// Middleware to validate JWT for all proxy routes
proxy.use('*', jwtAuthMiddleware);

/**
 * Error handler for proxy requests
 */
const handleProxyError = (c: any, error: Error) => {
  console.error('Proxy error:', error);
  return c.json({ error: 'Failed to proxy request' }, 500);
};

// Proxy POST requests
proxy.post('/', async (c) => {
  try {
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
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return handleProxyError(c, error as Error);
  }
});

export default proxy;