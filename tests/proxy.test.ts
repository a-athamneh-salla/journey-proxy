import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import proxy from '../src/routes/proxy';
import { Hono } from 'hono';
import { AUTH_CONFIG } from '../src/config/api';

// Mock fetch for our tests
const createMockFetch = (response: any, status = 200) => {
  return vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue(response),
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    text: vi.fn().mockResolvedValue(JSON.stringify(response))
  });
};

// Setup the app with our proxy route
const app = new Hono();
app.route('/proxy', proxy);

describe('Proxy Route', () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = global.fetch;
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should proxy POST requests successfully', async () => {
    // Setup mock response
    const mockResponse = { success: true };
    global.fetch = createMockFetch(mockResponse);

    // Make request with valid token
    const response = await app.request('/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-test-token'
      },
      body: JSON.stringify({ data: 'test' })
    });

    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // Verify that Basic Auth was used in the fetch call
    const fetchOptions = (global.fetch as any).mock.calls[0][1];
    expect(fetchOptions.headers.Authorization).toContain('Basic ');
  });

  it('should reject unauthorized POST requests', async () => {
    const response = await app.request('/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header
      },
      body: JSON.stringify({ data: 'test' })
    });

    expect(response.status).toBe(401);
    const text = await response.text();
    expect(text).toBe('Unauthorized');
  });

  it('should reject POST requests with invalid token', async () => {
    const response = await app.request('/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      },
      body: JSON.stringify({ data: 'test' })
    });

    // The real token validation should fail
    expect(response.status).toBe(401);
    // Check for error message from our auth middleware
    const text = await response.text();
    expect(text).toBe('Invalid token');
  });

  it('should proxy GET requests successfully', async () => {
    // Setup mock response
    const mockResponse = { data: 'test-data' };
    global.fetch = createMockFetch(mockResponse);

    const response = await app.request('/proxy?param=value', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-test-token'
      }
    });

    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual(mockResponse);
    
    // Verify the correct URL was used
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchArgs = (global.fetch as any).mock.calls[0];
    expect(fetchArgs[0]).toContain('param=value');
  });

  it('should proxy PUT requests successfully', async () => {
    // Setup mock response
    const mockResponse = { success: true, method: 'PUT' };
    global.fetch = createMockFetch(mockResponse);

    const response = await app.request('/proxy', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-test-token'
      },
      body: JSON.stringify({ data: 'update' })
    });

    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual(mockResponse);
    
    // Verify the correct method was used
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchOptions = (global.fetch as any).mock.calls[0][1];
    expect(fetchOptions.method).toBe('PUT');
  });

  it('should proxy PATCH requests successfully', async () => {
    // Setup mock response
    const mockResponse = { success: true, method: 'PATCH' };
    global.fetch = createMockFetch(mockResponse);

    const response = await app.request('/proxy', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-test-token'
      },
      body: JSON.stringify({ data: 'partial-update' })
    });

    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual(mockResponse);
    
    // Verify the correct method was used
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchOptions = (global.fetch as any).mock.calls[0][1];
    expect(fetchOptions.method).toBe('PATCH');
  });

  it('should handle fetch errors gracefully', async () => {
    // Setup mock fetch that fails
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const response = await app.request('/proxy', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-test-token'
      }
    });

    expect(response.status).toBe(500);
    const responseData = await response.json();
    expect(responseData).toEqual({ error: 'Failed to proxy request' });
  });
});