// BRAINSAIT: Invoice generator worker for SSDP platform
// ZATCA: ZATCA-compliant invoice generation
// CLOUDFLARE: Runs on Cloudflare Workers edge network

export interface Env {
  SSDP_DB: D1Database;
  SSDP_KV: KVNamespace;
  ZATCA_API_KEY: string;
  ZATCA_API_URL: string;
}

interface InvoiceLineItem {
  product_id: string;
  product_name: string;
  product_name_ar: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
  line_total: number;
}

interface InvoiceRequest {
  outlet_id: string;
  outlet_name: string;
  outlet_name_ar: string;
  outlet_vat_number?: string;
  line_items: InvoiceLineItem[];
}

interface ZATCAInvoice {
  invoice_number: string;
  issue_date: string;
  issue_time: string;
  supplier_name: string;
  supplier_name_ar: string;
  supplier_vat_number: string;
  outlet_name: string;
  outlet_name_ar: string;
  outlet_vat_number?: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  zatca_qr_code: string;
  zatca_hash: string;
  zatca_uuid: string;
}

const VAT_RATE = 0.15; // 15% VAT in Saudi Arabia

// ZATCA: Generate TLV-encoded QR code
function generateZATCAQRCode(invoice: ZATCAInvoice): string {
  function encodeTLV(tag: number, value: string): string {
    const encoder = new TextEncoder();
    const valueBytes = encoder.encode(value);
    const length = valueBytes.length;
    
    const tagHex = tag.toString(16).padStart(2, '0');
    const lengthHex = length.toString(16).padStart(2, '0');
    const valueHex = Array.from(valueBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return tagHex + lengthHex + valueHex;
  }
  
  const tlvData = [
    encodeTLV(1, invoice.supplier_name_ar),
    encodeTLV(2, invoice.supplier_vat_number),
    encodeTLV(3, invoice.issue_date),
    encodeTLV(4, invoice.total_amount.toFixed(2)),
    encodeTLV(5, invoice.vat_amount.toFixed(2)),
    encodeTLV(6, invoice.zatca_hash)
  ].join('');
  
  // Convert hex string to Uint8Array
  const bytes = new Uint8Array(tlvData.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  
  // Base64 encode
  return btoa(String.fromCharCode(...bytes));
}

// ZATCA: Generate invoice hash
async function generateZATCAHash(invoice: ZATCAInvoice): Promise<string> {
  const data = `${invoice.invoice_number}${invoice.issue_date}${invoice.total_amount}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ZATCA: Generate XML invoice
function generateZATCAXML(invoice: ZATCAInvoice): string {
  const lineItemsXML = invoice.line_items.map((item, index) => `
    <cac:InvoiceLine>
      <cbc:ID>${index + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="PCE">${item.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="SAR">${(item.quantity * item.unit_price - item.discount).toFixed(2)}</cbc:LineExtensionAmount>
      <cac:Item>
        <cbc:Name>${item.product_name}</cbc:Name>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="SAR">${item.unit_price.toFixed(2)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>
  `).join('');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" 
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>${invoice.invoice_number}</cbc:ID>
  <cbc:IssueDate>${invoice.issue_date}</cbc:IssueDate>
  <cbc:IssueTime>${invoice.issue_time}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID>${invoice.supplier_vat_number}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${invoice.supplier_name_ar}</cbc:Name>
      </cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${invoice.supplier_vat_number}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID>${invoice.outlet_vat_number || 'N/A'}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${invoice.outlet_name_ar}</cbc:Name>
      </cac:PartyName>
    </cac:Party>
  </cac:AccountingCustomerParty>
  
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${invoice.vat_amount.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${invoice.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${invoice.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${invoice.total_amount.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="SAR">${invoice.total_amount.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  
  ${lineItemsXML}
</Invoice>`;
}

// Main handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'Invoice Generator Worker',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Generate invoice endpoint
    if (url.pathname === '/generate-invoice' && request.method === 'POST') {
      try {
        const invoiceRequest: InvoiceRequest = await request.json();
        
        // Generate invoice number
        const invoiceNumber = `INV${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const now = new Date();
        
        // Calculate totals
        let subtotal = 0;
        const processedItems = invoiceRequest.line_items.map(item => {
          const itemSubtotal = (item.quantity * item.unit_price) - item.discount;
          const itemVat = itemSubtotal * VAT_RATE;
          subtotal += itemSubtotal;
          
          return {
            ...item,
            line_total: itemSubtotal + itemVat
          };
        });
        
        const vatAmount = subtotal * VAT_RATE;
        const totalAmount = subtotal + vatAmount;
        
        // Create invoice object
        const invoice: ZATCAInvoice = {
          invoice_number: invoiceNumber,
          issue_date: now.toISOString().split('T')[0],
          issue_time: now.toTimeString().split(' ')[0],
          supplier_name: 'Americana Sweets Company',
          supplier_name_ar: 'شركة الأمريكانا للحلويات',
          supplier_vat_number: '300000000000003',
          outlet_name: invoiceRequest.outlet_name,
          outlet_name_ar: invoiceRequest.outlet_name_ar,
          outlet_vat_number: invoiceRequest.outlet_vat_number,
          line_items: processedItems,
          subtotal,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          zatca_uuid: crypto.randomUUID(),
          zatca_hash: '',
          zatca_qr_code: ''
        };
        
        // Generate ZATCA hash
        invoice.zatca_hash = await generateZATCAHash(invoice);
        
        // Generate ZATCA QR code
        invoice.zatca_qr_code = generateZATCAQRCode(invoice);
        
        // Generate XML (optional, for ZATCA submission)
        const xmlInvoice = generateZATCAXML(invoice);
        
        // Store in KV (optional caching)
        if (env.SSDP_KV) {
          await env.SSDP_KV.put(
            `invoice:${invoiceNumber}`,
            JSON.stringify(invoice),
            { expirationTtl: 86400 * 30 } // 30 days
          );
        }
        
        return new Response(JSON.stringify({
          success: true,
          invoice,
          xml: xmlInvoice,
          message: 'Invoice generated successfully',
          message_ar: 'تم إنشاء الفاتورة بنجاح'
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
    
    // Get invoice by number
    if (url.pathname.startsWith('/invoice/') && request.method === 'GET') {
      const invoiceNumber = url.pathname.split('/').pop();
      
      if (!invoiceNumber || !env.SSDP_KV) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invoice not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const invoiceData = await env.SSDP_KV.get(`invoice:${invoiceNumber}`);
      
      if (!invoiceData) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invoice not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        invoice: JSON.parse(invoiceData)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Default response
    return new Response(JSON.stringify({
      service: 'SSDP Invoice Generator Worker',
      version: '1.0.0',
      endpoints: {
        'POST /generate-invoice': 'Generate ZATCA-compliant invoice',
        'GET /invoice/:number': 'Retrieve invoice by number',
        'GET /health': 'Health check'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  },
};
