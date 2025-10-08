export interface Env {
  SSDP_DB: D1Database;
  SSDP_KV: KVNamespace;
  SSDP_R2: R2Bucket;
  WATHQ_API_KEY: string;
  ZATCA_API_KEY: string;
}

import { Router } from 'itty-router';
import { productsHandler } from './handlers/products';
import { outletsHandler } from './handlers/outlets';
import { ordersHandler } from './handlers/orders';
import { analyticsHandler } from './handlers/analytics';
import { corsHeaders } from './utils/cors';

const router = Router();

// CORS preflight
router.options('*', () => new Response(null, { headers: corsHeaders }));

// API Routes
router.get('/api/products', productsHandler);
router.get('/api/products/:id', productsHandler);
router.post('/api/products', productsHandler);

router.get('/api/outlets', outletsHandler);
router.post('/api/outlets/register', outletsHandler);
router.get('/api/outlets/verify/:cr', outletsHandler);

router.get('/api/orders', ordersHandler);
router.post('/api/orders', ordersHandler);
router.put('/api/orders/:id', ordersHandler);

router.get('/api/analytics/dashboard', analyticsHandler);
router.get('/api/analytics/sales', analyticsHandler);

// Health check
router.get('/health', () => 
  new Response(JSON.stringify({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'SSDP API'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await router.handle(request, env, ctx);
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};
