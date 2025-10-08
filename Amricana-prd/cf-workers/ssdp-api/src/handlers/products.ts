import { Env } from '../index';
import { corsHeaders } from '../utils/cors';

export async function productsHandler(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const productId = url.pathname.split('/').pop();

  try {
    switch (method) {
      case 'GET':
        if (productId && productId !== 'products') {
          return getProduct(productId, env);
        }
        return getProducts(url.searchParams, env);
      
      case 'POST':
        return createProduct(request, env);
      
      default:
        return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function getProducts(params: URLSearchParams, env: Env): Promise<Response> {
  const category = params.get('category');
  const brand = params.get('brand');
  const cacheKey = `products:${category || 'all'}:${brand || 'all'}`;
  
  // Try KV cache first
  const cached = await env.SSDP_KV.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Query D1 database
  let query = 'SELECT * FROM products WHERE is_active = 1';
  const bindings: any[] = [];

  if (category) {
    query += ' AND category = ?';
    bindings.push(category);
  }
  if (brand) {
    query += ' AND brand = ?';
    bindings.push(brand);
  }

  const { results } = await env.SSDP_DB.prepare(query).bind(...bindings).all();
  
  const response = JSON.stringify({
    success: true,
    products: results,
    total: results.length
  });

  // Cache for 5 minutes
  await env.SSDP_KV.put(cacheKey, response, { expirationTtl: 300 });

  return new Response(response, {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getProduct(id: string, env: Env): Promise<Response> {
  const cacheKey = `product:${id}`;
  
  // Try KV cache first
  const cached = await env.SSDP_KV.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { results } = await env.SSDP_DB.prepare(
    'SELECT * FROM products WHERE sku = ? OR id = ?'
  ).bind(id, id).all();

  if (results.length === 0) {
    return new Response(JSON.stringify({ error: 'Product not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const response = JSON.stringify({
    success: true,
    product: results[0]
  });

  // Cache for 10 minutes
  await env.SSDP_KV.put(cacheKey, response, { expirationTtl: 600 });

  return new Response(response, {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function createProduct(request: Request, env: Env): Promise<Response> {
  const product = await request.json();
  
  const { success } = await env.SSDP_DB.prepare(`
    INSERT INTO products (sku, name_ar, name_en, description_ar, description_en, 
                         category, brand, price, cost, requires_refrigeration, stock_quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    product.sku,
    product.name_ar,
    product.name_en,
    product.description_ar || '',
    product.description_en || '',
    product.category,
    product.brand,
    product.price,
    product.cost || 0,
    product.requires_refrigeration ? 1 : 0,
    product.stock_quantity || 0
  ).run();

  if (success) {
    // Invalidate cache
    await env.SSDP_KV.delete('products:all:all');
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Product created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Failed to create product' }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
