import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import webhook from '../src/routes/webhook';
import { Hono } from 'hono';
import { AUTH_CONFIG } from '../src/config/api';

// Setup the app with our webhook route
const app = new Hono();
app.route('/webhook', webhook);

describe('Webhook Route', () => {
  beforeEach(() => {
    // Spy on console.log to verify webhook processing
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should process webhooks with valid secret', async () => {
    const webhookPayload = {
      type: 'user_created',
      user: {
        id: '12345',
        name: 'Test User',
        email: 'test@example.com'
      }
    };

    const response = await app.request('/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': AUTH_CONFIG.WEBHOOK_SECRET
      },
      body: JSON.stringify(webhookPayload)
    });

    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual({
      success: true,
      message: 'Webhook user_created processed successfully'
    });
    
    // Verify the webhook was logged
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Webhook received'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Processing user creation'));
  });

  it('should reject webhooks with invalid secret', async () => {
    const webhookPayload = {
      type: 'user_created',
      data: { id: '12345' }
    };

    const response = await app.request('/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': 'invalid-secret'
      },
      body: JSON.stringify(webhookPayload)
    });

    expect(response.status).toBe(401);
    expect(await response.text()).toBe('Unauthorized');
  });

  it('should process different webhook types', async () => {
    const orderWebhookPayload = {
      type: 'order_completed',
      order: {
        id: 'order-123',
        total: 99.99
      }
    };

    const response = await app.request('/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': AUTH_CONFIG.WEBHOOK_SECRET
      },
      body: JSON.stringify(orderWebhookPayload)
    });

    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual({
      success: true,
      message: 'Webhook order_completed processed successfully'
    });
    
    // Verify the webhook was processed
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Processing order completion'));
  });

  it('should handle unknown webhook types', async () => {
    const unknownWebhookPayload = {
      type: 'new_feature_enabled',
      data: { feature: 'dark_mode' }
    };

    const response = await app.request('/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': AUTH_CONFIG.WEBHOOK_SECRET
      },
      body: JSON.stringify(unknownWebhookPayload)
    });

    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual({
      success: true,
      message: 'Webhook new_feature_enabled processed successfully'
    });
    
    // Verify unhandled webhook type was logged
    expect(console.log).toHaveBeenCalledWith('Unhandled webhook type: new_feature_enabled');
  });

  it('should handle invalid JSON in webhook body', async () => {
    const response = await app.request('/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': AUTH_CONFIG.WEBHOOK_SECRET
      },
      body: '{invalid-json}'
    });

    expect(response.status).toBe(500);
    const responseData = await response.json();
    expect(responseData).toEqual({ error: 'Failed to process webhook' });
  });
});