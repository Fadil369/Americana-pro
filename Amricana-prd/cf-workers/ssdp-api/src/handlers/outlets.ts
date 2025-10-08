import { Env } from '../index';
import { corsHeaders } from '../utils/cors';

export async function outletsHandler(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const pathParts = url.pathname.split('/');

  try {
    switch (method) {
      case 'GET':
        if (pathParts.includes('verify')) {
          const crNumber = pathParts[pathParts.length - 1];
          return verifyOutlet(crNumber, env);
        }
        return getOutlets(url.searchParams, env);
      
      case 'POST':
        if (pathParts.includes('register')) {
          return registerOutlet(request, env);
        }
        break;
    }
    
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function getOutlets(params: URLSearchParams, env: Env): Promise<Response> {
  const city = params.get('city');
  const status = params.get('status') || 'active';
  
  let query = 'SELECT * FROM outlets WHERE status = ?';
  const bindings = [status];

  if (city) {
    query += ' AND city = ?';
    bindings.push(city);
  }

  const { results } = await env.SSDP_DB.prepare(query).bind(...bindings).all();

  return new Response(JSON.stringify({
    success: true,
    outlets: results,
    total: results.length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function verifyOutlet(crNumber: string, env: Env): Promise<Response> {
  // Check cache first
  const cacheKey = `outlet_verification:${crNumber}`;
  const cached = await env.SSDP_KV.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Call Saudi Wathq API
  const wathqResponse = await fetch(`https://api.wathq.sa/spl/national/address/info/${crNumber}`, {
    headers: {
      'Authorization': `Bearer ${env.WATHQ_API_KEY}`,
      'THIQAH-API-ApiMsgRef': crypto.randomUUID(),
      'THIQAH-API-ClientMsgRef': `SSDP-${crypto.randomUUID()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!wathqResponse.ok) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Commercial registration not found',
      cr_number: crNumber
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const wathqData = await wathqResponse.json();
  const primaryAddress = wathqData[0];

  const response = JSON.stringify({
    success: true,
    cr_number: crNumber,
    business_name: primaryAddress.title,
    address: primaryAddress.address,
    city: primaryAddress.city,
    region: primaryAddress.regionName,
    coordinates: {
      latitude: parseFloat(primaryAddress.latitude),
      longitude: parseFloat(primaryAddress.longitude)
    },
    is_verified: true,
    verification_date: new Date().toISOString()
  });

  // Cache for 1 hour
  await env.SSDP_KV.put(cacheKey, response, { expirationTtl: 3600 });

  return new Response(response, {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function registerOutlet(request: Request, env: Env): Promise<Response> {
  const outletData = await request.json();
  
  // Verify with Saudi API first
  const verificationResponse = await verifyOutlet(outletData.cr_number, env);
  const verification = await verificationResponse.json();
  
  if (!verification.success) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Unable to verify commercial registration'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Insert into D1 database
  const { success } = await env.SSDP_DB.prepare(`
    INSERT INTO outlets (cr_number, name_ar, name_en, address, latitude, longitude,
                        district, city, region, contact_person, phone, email, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).bind(
    outletData.cr_number,
    verification.business_name,
    outletData.name_en || verification.business_name,
    verification.address,
    verification.coordinates.latitude,
    verification.coordinates.longitude,
    verification.district || '',
    verification.city,
    verification.region,
    outletData.contact_person,
    outletData.phone,
    outletData.email || ''
  ).run();

  if (success) {
    return new Response(JSON.stringify({
      success: true,
      message: 'Outlet registered successfully',
      outlet_id: `OUT_${outletData.cr_number}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Failed to register outlet' }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
