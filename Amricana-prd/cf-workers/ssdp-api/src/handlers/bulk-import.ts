import { Env } from '../index';

export async function bulkImportHandler(request: Request, env: Env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { products } = await request.json();
    
    if (!products || !Array.isArray(products)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid products array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const results = [];
    
    for (const product of products) {
      try {
        const stmt = env.SSDP_DB.prepare(`
          INSERT INTO products (
            sku, name_ar, name_en, description_ar, description_en, 
            category, brand, price, cost, requires_refrigeration, 
            is_active, stock_quantity, min_stock_level
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = await stmt.bind(
          product.sku,
          product.name_ar,
          product.name_en || '',
          product.description_ar || '',
          product.description_en || '',
          product.category,
          product.brand,
          product.price,
          product.cost || product.price * 0.7,
          product.requires_refrigeration ? 1 : 0,
          product.is_active ? 1 : 0,
          product.stock_quantity || 0,
          product.min_stock_level || 10
        ).run();
        
        results.push({ sku: product.sku, success: true, id: result.meta.last_row_id });
      } catch (error) {
        results.push({ sku: product.sku, success: false, error: error.message });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      imported: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to import products',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
