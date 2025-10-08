export interface Env {
  MADA_API_KEY: string;
  STC_PAY_API_KEY: string;
  HYPERPAY_ENTITY_ID: string;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: 'mada' | 'stc_pay' | 'hyperpay' | 'cash';
  orderId: string;
  customerId: string;
  description: string;
  description_ar: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
  status: 'pending' | 'completed' | 'failed';
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (request.method === 'POST' && url.pathname === '/process-payment') {
      return handlePaymentProcessing(request, env, corsHeaders);
    }
    
    if (request.method === 'POST' && url.pathname === '/verify-payment') {
      return handlePaymentVerification(request, env, corsHeaders);
    }
    
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response('SSDP Payment Processor Worker - Ready', { 
        status: 200, 
        headers: corsHeaders 
      });
    }
    
    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};

async function handlePaymentProcessing(
  request: Request, 
  env: Env, 
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const paymentRequest: PaymentRequest = await request.json();
    
    let paymentResponse: PaymentResponse;
    
    switch (paymentRequest.paymentMethod) {
      case 'mada':
        paymentResponse = await processMadaPayment(paymentRequest, env);
        break;
      case 'stc_pay':
        paymentResponse = await processSTCPayPayment(paymentRequest, env);
        break;
      case 'hyperpay':
        paymentResponse = await processHyperPayPayment(paymentRequest, env);
        break;
      case 'cash':
        paymentResponse = await processCashPayment(paymentRequest);
        break;
      default:
        throw new Error('Unsupported payment method');
    }
    
    return new Response(JSON.stringify(paymentResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      status: 'failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function processMadaPayment(
  paymentRequest: PaymentRequest, 
  env: Env
): Promise<PaymentResponse> {
  // Mock Mada payment processing
  // In production, integrate with actual Mada API
  
  const transactionId = `MADA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Simulate API call to Mada
  const madaResponse = await fetch('https://api.mada.com.sa/v1/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.MADA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: paymentRequest.amount * 100, // Convert to halalas
      currency: 'SAR',
      orderId: paymentRequest.orderId,
      description: paymentRequest.description_ar,
      returnUrl: 'https://ssdp.brainsait.com/payment/callback'
    })
  }).catch(() => null);
  
  // Mock successful response for demo
  return {
    success: true,
    transactionId,
    paymentUrl: `https://payment.mada.com.sa/checkout/${transactionId}`,
    status: 'pending'
  };
}

async function processSTCPayPayment(
  paymentRequest: PaymentRequest, 
  env: Env
): Promise<PaymentResponse> {
  const transactionId = `STC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Mock STC Pay integration
  return {
    success: true,
    transactionId,
    paymentUrl: `stcpay://pay?amount=${paymentRequest.amount}&ref=${transactionId}`,
    status: 'pending'
  };
}

async function processHyperPayPayment(
  paymentRequest: PaymentRequest, 
  env: Env
): Promise<PaymentResponse> {
  const transactionId = `HYPER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Mock HyperPay integration
  return {
    success: true,
    transactionId,
    paymentUrl: `https://eu-test.oppwa.com/v1/checkouts/${transactionId}`,
    status: 'pending'
  };
}

async function processCashPayment(
  paymentRequest: PaymentRequest
): Promise<PaymentResponse> {
  const transactionId = `CASH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Cash payments are immediately marked as pending collection
  return {
    success: true,
    transactionId,
    status: 'pending' // Will be completed when cash is collected
  };
}

async function handlePaymentVerification(
  request: Request, 
  env: Env, 
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const { transactionId } = await request.json();
    
    // Mock payment verification
    // In production, verify with actual payment gateway
    const isValid = transactionId && transactionId.length > 10;
    
    return new Response(JSON.stringify({
      success: isValid,
      transactionId,
      status: isValid ? 'completed' : 'failed',
      verifiedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
