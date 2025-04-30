import { Hono } from 'hono';
import { jwtAuthMiddleware } from '../middlewares/authentication';
import { generateJwtToken, createApiKey, getApiKeys, deleteApiKey } from '../helpers/auth';
import { getUserById, verifyUserCredentials } from '../helpers/users';
import { Env } from '../types/database';

const users = new Hono<{ Bindings: Env }>();

// Login endpoint - no authentication required
users.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }
    
    const user = await verifyUserCredentials(c.env.DB, username, password);
    
    if (!user) {
      return c.json({ error: 'Invalid username or password' }, 401);
    }
    
    const token = generateJwtToken(user.id, user.username);
    
    return c.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'An error occurred during login' }, 500);
  }
});

// All routes below require authentication
users.use('/*', jwtAuthMiddleware);

// Get current user profile
users.get('/me', async (c) => {
  try {
    const user = c.get('user');
    const userId = user.userId;
    
    const userDetails = await getUserById(c.env.DB, userId);
    
    if (!userDetails) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({
      id: userDetails.id,
      username: userDetails.username,
      email: userDetails.email,
      createdAt: userDetails.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to retrieve user profile' }, 500);
  }
});

// Create a new API key
users.post('/api-keys', async (c) => {
  try {
    const user = c.get('user');
    const { keyName, expiresInDays } = await c.req.json();
    
    if (!keyName) {
      return c.json({ error: 'Key name is required' }, 400);
    }
    
    const apiKey = await createApiKey(
      c.env.DB,
      user.userId,
      keyName,
      expiresInDays
    );
    
    return c.json({
      id: apiKey.id,
      keyName: apiKey.key_name,
      apiKey: apiKey.api_key,
      expiresAt: apiKey.expires_at,
      createdAt: apiKey.created_at
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return c.json({ error: 'Failed to create API key' }, 500);
  }
});

// Get all API keys for the current user
users.get('/api-keys', async (c) => {
  try {
    const user = c.get('user');
    
    const keys = await getApiKeys(c.env.DB, user.userId);
    
    return c.json(keys.map(key => ({
      id: key.id,
      keyName: key.key_name,
      expiresAt: key.expires_at,
      createdAt: key.created_at
    })));
  } catch (error) {
    console.error('Get API keys error:', error);
    return c.json({ error: 'Failed to retrieve API keys' }, 500);
  }
});

// Delete an API key
users.delete('/api-keys/:id', async (c) => {
  try {
    const keyId = c.req.param('id');
    
    const success = await deleteApiKey(c.env.DB, keyId);
    
    if (!success) {
      return c.json({ error: 'API key not found or already deleted' }, 404);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete API key error:', error);
    return c.json({ error: 'Failed to delete API key' }, 500);
  }
});

export default users;