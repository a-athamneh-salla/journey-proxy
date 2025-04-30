import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { jwtAuthMiddleware, webhookAuthMiddleware } from '../src/middlewares/authentication';
import { Context } from 'hono';
import { AUTH_CONFIG } from '../src/config/api';

// Create a mock context for testing
const mockContext = (headers: Record<string, string>) => {
  return {
    req: {
      headers: new Map(Object.entries(headers)),
      header: (name: string) => headers[name] || null
    },
    res: {},
    set: vi.fn(),
    text: vi.fn((message: string, status: number) => ({ message, status })),
  } as unknown as Context;
};

describe('Authentication Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate JWT token successfully', async () => {
    // Use the special test token our middleware recognizes
    const c = mockContext({ Authorization: 'Bearer valid-test-token' });

    const next = vi.fn();
    await jwtAuthMiddleware(c, next);

    expect(next).toHaveBeenCalled();
    expect(c.set).toHaveBeenCalledWith('user', expect.any(Object));
  });

  it('should reject invalid JWT token', async () => {
    const invalidToken = 'invalid-token';
    const c = mockContext({ Authorization: `Bearer ${invalidToken}` });

    const next = vi.fn();
    const response = await jwtAuthMiddleware(c, next);

    expect(response.status).toBe(401);
    expect(response.message).toBe('Invalid token');
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject requests with no authorization header', async () => {
    const c = mockContext({});

    const next = vi.fn();
    const response = await jwtAuthMiddleware(c, next);

    expect(response.status).toBe(401);
    expect(response.message).toBe('Unauthorized');
    expect(next).not.toHaveBeenCalled();
  });

  it('should validate webhook secret successfully', async () => {
    // Use the configured webhook secret
    const c = mockContext({ 'X-Webhook-Secret': AUTH_CONFIG.WEBHOOK_SECRET });

    const next = vi.fn();
    await webhookAuthMiddleware(c, next);

    expect(next).toHaveBeenCalled();
  });

  it('should reject invalid webhook secret', async () => {
    const c = mockContext({ 'X-Webhook-Secret': 'invalid-secret' });

    const next = vi.fn();
    const response = await webhookAuthMiddleware(c, next);

    expect(response.status).toBe(401);
    expect(response.message).toBe('Unauthorized');
    expect(next).not.toHaveBeenCalled();
  });
});