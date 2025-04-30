import { Hono } from 'hono';
import { webhookAuthMiddleware } from '../middlewares/authentication';
import { Env } from '../types/database';

const webhook = new Hono<{ Bindings: Env }>();

// Apply webhook authentication middleware
webhook.use('*', webhookAuthMiddleware);

// Handle webhook POST requests
webhook.post('/', async (c) => {
  try {
    const payload = await c.req.json();
    
    console.log('Webhook received:', JSON.stringify(payload));
    
    // Process the webhook based on event type
    const eventType = payload.event || 'unknown';
    
    switch(eventType) {
      case 'task_success':
        // Handle task success event
        console.log(`Task succeeded: ${payload.task_id}`);
        break;
        
      case 'task_failed':
        // Handle task failure event
        console.log(`Task failed: ${payload.task_id}`);
        break;
        
      case 'dag_success':
        // Handle DAG success event
        console.log(`DAG succeeded: ${payload.dag_id}`);
        break;
        
      case 'dag_failed':
        // Handle DAG failure event
        console.log(`DAG failed: ${payload.dag_id}`);
        break;
        
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
    
    return c.json({ 
      status: 'success', 
      message: 'Webhook received and processed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return c.json({ 
      status: 'error', 
      message: 'Failed to process webhook'
    }, 500);
  }
});

export default webhook;