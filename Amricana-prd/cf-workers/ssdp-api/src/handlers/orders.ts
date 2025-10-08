import { Env } from '../index';
import { corsHeaders } from '../utils/cors';

export async function ordersHandler(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;

  try {
    switch (method) {
      case 'GET':
        return getOrders(url.searchParams, env);
      case 'POST':
        return createOrder(request, env);
      case 'PUT':
        const orderId = url.pathname.split('/').pop();
        return updateOrder(orderId!, request, env);
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

async function getOrders(params: URLSearchParams, env: Env): Promise<Response> {
  const status = params.get('status');
  const outletId = params.get('outlet_id');
  
  let query = 'SELECT * FROM orders WHERE 1=1';
  const bindings: any[] = [];

  if (status) {
    query += ' AND status = ?';
    bindings.push(status);
  }
  if (outletId) {
    query += ' AND outlet_id = ?';
    bindings.push(outletId);
  }

  query += ' ORDER BY created_at DESC LIMIT 50';

  const { results } = await env.SSDP_DB.prepare(query).bind(...bindings).all();

  return new Response(JSON.stringify({
    success: true,
    orders: results,
    total: results.length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function createOrder(request: Request, env: Env): Promise<Response> {
  const orderData = await request.json();
  
  const orderNumber = `ORD${Date.now()}`;
  
  const { success } = await env.SSDP_DB.prepare(`
    INSERT INTO orders (order_number, outlet_id, total_amount, vat_amount, status)
    VALUES (?, ?, ?, ?, 'pending')
  `).bind(
    orderNumber,
    orderData.outlet_id,
    orderData.total_amount,
    orderData.total_amount * 0.15
  ).run();

  if (success) {
    return new Response(JSON.stringify({
      success: true,
      order_number: orderNumber,
      message: 'Order created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Failed to create order' }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updateOrder(orderId: string, request: Request, env: Env): Promise<Response> {
  const updateData = await request.json();
  
  const { success } = await env.SSDP_DB.prepare(`
    UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(updateData.status, orderId).run();

  if (success) {
    return new Response(JSON.stringify({
      success: true,
      message: 'Order updated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Failed to update order' }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
