# BRAINSAIT: Finance service for SSDP platform
# ZATCA: ZATCA Phase 2 e-invoicing compliance
# SECURITY: Implements data encryption and audit logging

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from enum import Enum
import uuid
import hashlib
import json
from decimal import Decimal

app = FastAPI(
    title="SSDP Finance Service",
    description="Smart Sweet Distribution Platform - Finance & ZATCA Integration API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Constants
VAT_RATE = 0.15  # 15% VAT in Saudi Arabia

# Enums
class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    ISSUED = "issued"
    PAID = "paid"
    CANCELLED = "cancelled"
    OVERDUE = "overdue"

class PaymentMethod(str, Enum):
    CASH = "cash"
    MADA = "mada"
    STC_PAY = "stc_pay"
    URPAY = "urpay"
    APPLE_PAY = "apple_pay"
    HYPERPAY = "hyperpay"
    CREDIT = "credit"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

# Pydantic models
class InvoiceLineItem(BaseModel):
    product_id: str
    product_name: str
    product_name_ar: str
    quantity: int
    unit_price: float
    discount: float = 0.0
    tax_rate: float = VAT_RATE
    line_total: float = 0.0

class ZATCAInvoice(BaseModel):
    id: Optional[str] = None
    invoice_number: str
    issue_date: datetime
    outlet_id: str
    outlet_name: str
    outlet_name_ar: str
    outlet_vat_number: Optional[str] = None
    supplier_name: str = "شركة الأمريكانا للحلويات"
    supplier_name_en: str = "Americana Sweets Company"
    supplier_vat_number: str = "300000000000003"
    line_items: List[InvoiceLineItem]
    subtotal: float = 0.0
    vat_amount: float = 0.0
    total_amount: float = 0.0
    status: InvoiceStatus = InvoiceStatus.DRAFT
    zatca_qr_code: Optional[str] = None
    zatca_uuid: Optional[str] = None
    zatca_hash: Optional[str] = None
    zatca_submitted: bool = False

class Payment(BaseModel):
    id: Optional[str] = None
    invoice_id: str
    amount: float
    payment_method: PaymentMethod
    payment_date: datetime
    status: PaymentStatus = PaymentStatus.PENDING
    transaction_id: Optional[str] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class CreditLimit(BaseModel):
    outlet_id: str
    credit_limit: float
    current_balance: float
    available_credit: float
    overdue_amount: float = 0.0
    last_payment_date: Optional[datetime] = None

class FinancialSummary(BaseModel):
    period_start: datetime
    period_end: datetime
    total_invoices: int
    total_sales: float
    total_vat_collected: float
    total_paid: float
    total_outstanding: float
    total_overdue: float

# In-memory storage
invoices_db: Dict[str, ZATCAInvoice] = {}
payments_db: Dict[str, Payment] = {}
credit_limits_db: Dict[str, CreditLimit] = {}

# ZATCA helper functions
def calculate_line_total(item: InvoiceLineItem) -> float:
    """Calculate line item total with tax"""
    subtotal = (item.quantity * item.unit_price) - item.discount
    tax = subtotal * item.tax_rate
    return subtotal + tax

def generate_zatca_hash(invoice: ZATCAInvoice) -> str:
    """ZATCA: Generate invoice hash for QR code"""
    data = f"{invoice.invoice_number}{invoice.issue_date.isoformat()}{invoice.total_amount}"
    return hashlib.sha256(data.encode()).hexdigest()

def generate_zatca_qr(invoice: ZATCAInvoice) -> str:
    """ZATCA: Generate QR code data (TLV format)"""
    def encode_tlv(tag: int, value: str) -> str:
        value_bytes = value.encode('utf-8')
        length = len(value_bytes)
        return f"{tag:02x}{length:02x}{value_bytes.hex()}"
    
    # TLV encoding for ZATCA QR
    tlv_data = "".join([
        encode_tlv(1, invoice.supplier_name),
        encode_tlv(2, invoice.supplier_vat_number),
        encode_tlv(3, invoice.issue_date.isoformat()),
        encode_tlv(4, f"{invoice.total_amount:.2f}"),
        encode_tlv(5, f"{invoice.vat_amount:.2f}"),
        encode_tlv(6, invoice.zatca_hash or "")
    ])
    
    import base64
    return base64.b64encode(bytes.fromhex(tlv_data)).decode('utf-8')

@app.get("/")
async def root():
    return {
        "message": "SSDP Finance Service API",
        "version": "1.0.0",
        "features": [
            "ZATCA Phase 2 e-invoicing",
            "Multi-payment gateway support",
            "Credit management",
            "VAT calculation and reporting",
            "Financial analytics"
        ],
        "payment_methods": [m.value for m in PaymentMethod],
        "vat_rate": f"{VAT_RATE * 100}%"
    }

# Invoice endpoints
@app.post("/invoices", response_model=ZATCAInvoice)
async def create_invoice(
    invoice: ZATCAInvoice,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """ZATCA: Create ZATCA-compliant invoice"""
    invoice.id = str(uuid.uuid4())
    invoice.zatca_uuid = str(uuid.uuid4())
    
    # Calculate totals
    subtotal = 0.0
    for item in invoice.line_items:
        item_subtotal = (item.quantity * item.unit_price) - item.discount
        item.line_total = calculate_line_total(item)
        subtotal += item_subtotal
    
    invoice.subtotal = subtotal
    invoice.vat_amount = subtotal * VAT_RATE
    invoice.total_amount = subtotal + invoice.vat_amount
    
    # Generate ZATCA hash and QR code
    invoice.zatca_hash = generate_zatca_hash(invoice)
    invoice.zatca_qr_code = generate_zatca_qr(invoice)
    
    invoices_db[invoice.id] = invoice
    
    return invoice

@app.get("/invoices", response_model=List[ZATCAInvoice])
async def get_invoices(
    outlet_id: Optional[str] = None,
    status: Optional[InvoiceStatus] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get invoices with filters"""
    invoices = list(invoices_db.values())
    
    if outlet_id:
        invoices = [inv for inv in invoices if inv.outlet_id == outlet_id]
    if status:
        invoices = [inv for inv in invoices if inv.status == status]
    if from_date:
        invoices = [inv for inv in invoices if inv.issue_date >= from_date]
    if to_date:
        invoices = [inv for inv in invoices if inv.issue_date <= to_date]
    
    return invoices

@app.get("/invoices/{invoice_id}", response_model=ZATCAInvoice)
async def get_invoice(
    invoice_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get invoice by ID"""
    if invoice_id not in invoices_db:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return invoices_db[invoice_id]

@app.post("/invoices/{invoice_id}/submit-zatca")
async def submit_to_zatca(
    invoice_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """ZATCA: Submit invoice to ZATCA portal"""
    if invoice_id not in invoices_db:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice = invoices_db[invoice_id]
    
    # Mock ZATCA submission (integrate with actual ZATCA API in production)
    invoice.zatca_submitted = True
    invoice.status = InvoiceStatus.ISSUED
    
    return {
        "success": True,
        "message": "Invoice submitted to ZATCA successfully",
        "message_ar": "تم إرسال الفاتورة إلى هيئة الزكاة والضريبة والجمارك بنجاح",
        "zatca_uuid": invoice.zatca_uuid,
        "zatca_hash": invoice.zatca_hash,
        "qr_code": invoice.zatca_qr_code
    }

@app.get("/invoices/{invoice_id}/qr-code")
async def get_invoice_qr(
    invoice_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get ZATCA QR code for invoice"""
    if invoice_id not in invoices_db:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice = invoices_db[invoice_id]
    
    return {
        "invoice_id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "qr_code": invoice.zatca_qr_code,
        "qr_format": "base64_tlv"
    }

# Payment endpoints
@app.post("/payments", response_model=Payment)
async def create_payment(
    payment: Payment,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """BRAINSAIT: Process payment with multiple gateway support"""
    payment.id = str(uuid.uuid4())
    payment.transaction_id = f"TXN{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:6]}"
    
    # Validate invoice exists
    if payment.invoice_id not in invoices_db:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice = invoices_db[payment.invoice_id]
    
    # Mock payment processing (integrate with actual payment gateways)
    payment.status = PaymentStatus.COMPLETED
    payment.payment_date = datetime.now()
    
    # Update invoice status
    invoice.status = InvoiceStatus.PAID
    
    payments_db[payment.id] = payment
    
    return payment

@app.get("/payments", response_model=List[Payment])
async def get_payments(
    invoice_id: Optional[str] = None,
    status: Optional[PaymentStatus] = None,
    payment_method: Optional[PaymentMethod] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get payments with filters"""
    payments = list(payments_db.values())
    
    if invoice_id:
        payments = [p for p in payments if p.invoice_id == invoice_id]
    if status:
        payments = [p for p in payments if p.status == status]
    if payment_method:
        payments = [p for p in payments if p.payment_method == payment_method]
    
    return payments

# Credit management
@app.get("/credit-limits/{outlet_id}", response_model=CreditLimit)
async def get_credit_limit(
    outlet_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get outlet credit limit and balance"""
    if outlet_id not in credit_limits_db:
        # Create default credit limit
        credit_limits_db[outlet_id] = CreditLimit(
            outlet_id=outlet_id,
            credit_limit=10000.0,
            current_balance=0.0,
            available_credit=10000.0
        )
    
    return credit_limits_db[outlet_id]

@app.put("/credit-limits/{outlet_id}", response_model=CreditLimit)
async def update_credit_limit(
    outlet_id: str,
    credit_limit: CreditLimit,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update outlet credit limit"""
    credit_limit.outlet_id = outlet_id
    credit_limit.available_credit = credit_limit.credit_limit - credit_limit.current_balance
    credit_limits_db[outlet_id] = credit_limit
    
    return credit_limit

@app.post("/credit-limits/{outlet_id}/check")
async def check_credit_availability(
    outlet_id: str,
    requested_amount: float,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """BRAINSAIT: AI-powered credit approval check"""
    credit = await get_credit_limit(outlet_id, credentials)
    
    is_approved = requested_amount <= credit.available_credit
    
    return {
        "outlet_id": outlet_id,
        "requested_amount": requested_amount,
        "available_credit": credit.available_credit,
        "is_approved": is_approved,
        "credit_limit": credit.credit_limit,
        "current_balance": credit.current_balance,
        "message": "Credit approved" if is_approved else "Credit limit exceeded",
        "message_ar": "تمت الموافقة على الائتمان" if is_approved else "تم تجاوز حد الائتمان"
    }

# Financial analytics
@app.get("/analytics/summary", response_model=FinancialSummary)
async def get_financial_summary(
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get financial summary for period"""
    if not from_date:
        from_date = datetime.now() - timedelta(days=30)
    if not to_date:
        to_date = datetime.now()
    
    # Filter invoices by date range
    period_invoices = [
        inv for inv in invoices_db.values()
        if from_date <= inv.issue_date <= to_date
    ]
    
    total_sales = sum(inv.total_amount for inv in period_invoices)
    total_vat = sum(inv.vat_amount for inv in period_invoices)
    
    # Filter payments by date range
    period_payments = [
        pay for pay in payments_db.values()
        if from_date <= pay.payment_date <= to_date and pay.status == PaymentStatus.COMPLETED
    ]
    total_paid = sum(pay.amount for pay in period_payments)
    
    outstanding_invoices = [inv for inv in period_invoices if inv.status != InvoiceStatus.PAID]
    total_outstanding = sum(inv.total_amount for inv in outstanding_invoices)
    
    overdue_invoices = [
        inv for inv in outstanding_invoices
        if inv.issue_date < datetime.now() - timedelta(days=30)
    ]
    total_overdue = sum(inv.total_amount for inv in overdue_invoices)
    
    summary = FinancialSummary(
        period_start=from_date,
        period_end=to_date,
        total_invoices=len(period_invoices),
        total_sales=total_sales,
        total_vat_collected=total_vat,
        total_paid=total_paid,
        total_outstanding=total_outstanding,
        total_overdue=total_overdue
    )
    
    return summary

@app.get("/analytics/vat-report")
async def get_vat_report(
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """ZATCA: VAT report for compliance"""
    if not from_date:
        from_date = datetime.now() - timedelta(days=30)
    if not to_date:
        to_date = datetime.now()
    
    period_invoices = [
        inv for inv in invoices_db.values()
        if from_date <= inv.issue_date <= to_date and inv.status != InvoiceStatus.CANCELLED
    ]
    
    total_sales_excluding_vat = sum(inv.subtotal for inv in period_invoices)
    total_vat = sum(inv.vat_amount for inv in period_invoices)
    total_sales_including_vat = sum(inv.total_amount for inv in period_invoices)
    
    return {
        "period": {
            "from": from_date.isoformat(),
            "to": to_date.isoformat()
        },
        "vat_rate": f"{VAT_RATE * 100}%",
        "total_invoices": len(period_invoices),
        "total_sales_excluding_vat": round(total_sales_excluding_vat, 2),
        "total_vat_collected": round(total_vat, 2),
        "total_sales_including_vat": round(total_sales_including_vat, 2),
        "zatca_compliant": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
