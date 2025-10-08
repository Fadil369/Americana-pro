import crypto from 'crypto';

export interface ZATCAInvoice {
  invoiceNumber: string;
  issueDate: string;
  issueTime: string;
  supplierName: string;
  supplierVATNumber: string;
  customerName: string;
  customerVATNumber?: string;
  lineItems: ZATCALineItem[];
  totalExcludingVAT: number;
  vatAmount: number;
  totalIncludingVAT: number;
}

export interface ZATCALineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  lineTotal: number;
}

export interface ZATCAQRCode {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  invoiceTotal: string;
  vatTotal: string;
  hash: string;
}

export class ZATCACompliance {
  private static readonly VAT_RATE = 0.15; // 15% VAT in Saudi Arabia
  
  /**
   * Generate ZATCA-compliant QR code data
   */
  static generateQRCode(invoice: ZATCAInvoice): string {
    const qrData: ZATCAQRCode = {
      sellerName: invoice.supplierName,
      vatNumber: invoice.supplierVATNumber,
      timestamp: `${invoice.issueDate}T${invoice.issueTime}`,
      invoiceTotal: invoice.totalIncludingVAT.toFixed(2),
      vatTotal: invoice.vatAmount.toFixed(2),
      hash: this.generateInvoiceHash(invoice)
    };
    
    // Encode as TLV (Tag-Length-Value) format as per ZATCA requirements
    const tlvData = [
      this.encodeTLV(1, qrData.sellerName),
      this.encodeTLV(2, qrData.vatNumber),
      this.encodeTLV(3, qrData.timestamp),
      this.encodeTLV(4, qrData.invoiceTotal),
      this.encodeTLV(5, qrData.vatTotal),
      this.encodeTLV(6, qrData.hash)
    ].join('');
    
    return Buffer.from(tlvData, 'hex').toString('base64');
  }
  
  /**
   * Calculate VAT amount for given amount
   */
  static calculateVAT(amountExcludingVAT: number): number {
    return Math.round(amountExcludingVAT * this.VAT_RATE * 100) / 100;
  }
  
  /**
   * Validate VAT number format (Saudi Arabia)
   */
  static validateVATNumber(vatNumber: string): boolean {
    // Saudi VAT number format: 15 digits starting with 3 and ending with 03
    const vatRegex = /^3\d{13}03$/;
    return vatRegex.test(vatNumber);
  }
  
  /**
   * Generate invoice hash for integrity
   */
  private static generateInvoiceHash(invoice: ZATCAInvoice): string {
    const hashData = [
      invoice.invoiceNumber,
      invoice.issueDate,
      invoice.issueTime,
      invoice.supplierVATNumber,
      invoice.totalIncludingVAT.toFixed(2)
    ].join('|');
    
    return crypto.createHash('sha256').update(hashData).digest('hex').substring(0, 16);
  }
  
  /**
   * Encode data in TLV format
   */
  private static encodeTLV(tag: number, value: string): string {
    const tagHex = tag.toString(16).padStart(2, '0');
    const lengthHex = value.length.toString(16).padStart(2, '0');
    const valueHex = Buffer.from(value, 'utf8').toString('hex');
    return tagHex + lengthHex + valueHex;
  }
  
  /**
   * Generate ZATCA XML invoice
   */
  static generateXMLInvoice(invoice: ZATCAInvoice): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <ID>${invoice.invoiceNumber}</ID>
  <IssueDate>${invoice.issueDate}</IssueDate>
  <IssueTime>${invoice.issueTime}</IssueTime>
  <InvoiceTypeCode>388</InvoiceTypeCode>
  <DocumentCurrencyCode>SAR</DocumentCurrencyCode>
  
  <AccountingSupplierParty>
    <Party>
      <PartyName>
        <Name>${invoice.supplierName}</Name>
      </PartyName>
      <PartyTaxScheme>
        <CompanyID>${invoice.supplierVATNumber}</CompanyID>
        <TaxScheme>
          <ID>VAT</ID>
        </TaxScheme>
      </PartyTaxScheme>
    </Party>
  </AccountingSupplierParty>
  
  <AccountingCustomerParty>
    <Party>
      <PartyName>
        <Name>${invoice.customerName}</Name>
      </PartyName>
      ${invoice.customerVATNumber ? `
      <PartyTaxScheme>
        <CompanyID>${invoice.customerVATNumber}</CompanyID>
        <TaxScheme>
          <ID>VAT</ID>
        </TaxScheme>
      </PartyTaxScheme>
      ` : ''}
    </Party>
  </AccountingCustomerParty>
  
  <LegalMonetaryTotal>
    <LineExtensionAmount currencyID="SAR">${invoice.totalExcludingVAT.toFixed(2)}</LineExtensionAmount>
    <TaxExclusiveAmount currencyID="SAR">${invoice.totalExcludingVAT.toFixed(2)}</TaxExclusiveAmount>
    <TaxInclusiveAmount currencyID="SAR">${invoice.totalIncludingVAT.toFixed(2)}</TaxInclusiveAmount>
    <PayableAmount currencyID="SAR">${invoice.totalIncludingVAT.toFixed(2)}</PayableAmount>
  </LegalMonetaryTotal>
  
  <TaxTotal>
    <TaxAmount currencyID="SAR">${invoice.vatAmount.toFixed(2)}</TaxAmount>
    <TaxSubtotal>
      <TaxableAmount currencyID="SAR">${invoice.totalExcludingVAT.toFixed(2)}</TaxableAmount>
      <TaxAmount currencyID="SAR">${invoice.vatAmount.toFixed(2)}</TaxAmount>
      <TaxCategory>
        <ID>S</ID>
        <Percent>${(this.VAT_RATE * 100).toFixed(2)}</Percent>
        <TaxScheme>
          <ID>VAT</ID>
        </TaxScheme>
      </TaxCategory>
    </TaxSubtotal>
  </TaxTotal>
  
  ${invoice.lineItems.map((item, index) => `
  <InvoiceLine>
    <ID>${index + 1}</ID>
    <InvoicedQuantity unitCode="PCE">${item.quantity}</InvoicedQuantity>
    <LineExtensionAmount currencyID="SAR">${item.lineTotal.toFixed(2)}</LineExtensionAmount>
    <Item>
      <Name>${item.description}</Name>
    </Item>
    <Price>
      <PriceAmount currencyID="SAR">${item.unitPrice.toFixed(2)}</PriceAmount>
    </Price>
  </InvoiceLine>
  `).join('')}
</Invoice>`;
  }
}
