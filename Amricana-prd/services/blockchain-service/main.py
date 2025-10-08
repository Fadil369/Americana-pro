# BRAINSAIT: Blockchain Service for SSDP Platform
# SECURITY: Immutable delivery records and supply chain traceability
# MEDICAL: Halal provenance verification

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
import uuid
import hashlib
import json
from enum import Enum

app = FastAPI(
    title="SSDP Blockchain Service",
    description="Blockchain-based traceability for delivery records, smart contracts, and halal provenance",
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

# Enums
class TransactionType(str, Enum):
    DELIVERY_RECORD = "delivery_record"
    SMART_CONTRACT = "smart_contract"
    HALAL_CERTIFICATION = "halal_certification"
    PRODUCT_ORIGIN = "product_origin"
    QUALITY_CHECK = "quality_check"

class ContractStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# Pydantic Models
class Block(BaseModel):
    index: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    transactions: List[Dict]
    previous_hash: str
    nonce: int = 0
    hash: str = ""

class DeliveryRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transaction_type: TransactionType = TransactionType.DELIVERY_RECORD
    order_id: str
    outlet_id: str
    driver_id: str
    products: List[Dict]
    pickup_timestamp: datetime
    delivery_timestamp: Optional[datetime] = None
    gps_route: List[Dict] = []
    temperature_log: List[Dict] = []
    proof_of_delivery: Dict = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SmartContract(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transaction_type: TransactionType = TransactionType.SMART_CONTRACT
    contract_type: str  # "delivery_agreement", "payment_terms", "quality_guarantee"
    parties: List[str]  # List of party IDs
    terms: Dict
    status: ContractStatus
    created_at: datetime = Field(default_factory=datetime.utcnow)
    executed_at: Optional[datetime] = None
    auto_execute: bool = True
    execution_conditions: Dict = {}

class HalalCertification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transaction_type: TransactionType = TransactionType.HALAL_CERTIFICATION
    product_id: str
    product_name: str
    manufacturer: str
    certification_body: str
    certificate_number: str
    issue_date: datetime
    expiry_date: datetime
    verified: bool = True
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ProductOrigin(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transaction_type: TransactionType = TransactionType.PRODUCT_ORIGIN
    product_id: str
    product_name: str
    origin_country: str
    manufacturer: str
    manufacturing_date: datetime
    batch_number: str
    supply_chain_steps: List[Dict] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class TransactionRequest(BaseModel):
    transaction_type: TransactionType
    data: Dict

# Blockchain implementation
class Blockchain:
    def __init__(self):
        self.chain: List[Block] = []
        self.pending_transactions: List[Dict] = []
        # Create genesis block
        self.create_genesis_block()
    
    def create_genesis_block(self):
        """Create the first block in the chain"""
        genesis_block = Block(
            index=0,
            timestamp=datetime.utcnow(),
            transactions=[],
            previous_hash="0",
            nonce=0
        )
        genesis_block.hash = self.calculate_hash(genesis_block)
        self.chain.append(genesis_block)
    
    def calculate_hash(self, block: Block) -> str:
        """
        SECURITY: Calculate SHA-256 hash of block
        Ensures data integrity and immutability
        """
        block_data = {
            "index": block.index,
            "timestamp": block.timestamp.isoformat(),
            "transactions": block.transactions,
            "previous_hash": block.previous_hash,
            "nonce": block.nonce
        }
        block_string = json.dumps(block_data, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def get_latest_block(self) -> Block:
        """Get the most recent block in the chain"""
        return self.chain[-1]
    
    def add_transaction(self, transaction: Dict):
        """Add a transaction to pending transactions"""
        self.pending_transactions.append(transaction)
    
    def mine_block(self, difficulty: int = 2):
        """
        BRAINSAIT: Mine a new block with proof-of-work
        Creates immutable record of transactions
        """
        if not self.pending_transactions:
            return None
        
        new_block = Block(
            index=len(self.chain),
            timestamp=datetime.utcnow(),
            transactions=self.pending_transactions.copy(),
            previous_hash=self.get_latest_block().hash
        )
        
        # Simple proof-of-work (find hash with leading zeros)
        target = "0" * difficulty
        while not new_block.hash.startswith(target):
            new_block.nonce += 1
            new_block.hash = self.calculate_hash(new_block)
        
        self.chain.append(new_block)
        self.pending_transactions = []
        
        return new_block
    
    def verify_chain(self) -> bool:
        """
        SECURITY: Verify the integrity of the blockchain
        Ensures no blocks have been tampered with
        """
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]
            
            # Verify hash
            if current_block.hash != self.calculate_hash(current_block):
                return False
            
            # Verify chain linkage
            if current_block.previous_hash != previous_block.hash:
                return False
        
        return True
    
    def get_transaction_history(self, transaction_id: str) -> List[Dict]:
        """Get all blocks containing a specific transaction"""
        history = []
        for block in self.chain:
            for transaction in block.transactions:
                if transaction.get("id") == transaction_id:
                    history.append({
                        "block_index": block.index,
                        "block_hash": block.hash,
                        "timestamp": block.timestamp,
                        "transaction": transaction
                    })
        return history

# Initialize blockchain
blockchain = Blockchain()

# In-memory storage for quick lookups
delivery_records: Dict[str, DeliveryRecord] = {}
smart_contracts: Dict[str, SmartContract] = {}
halal_certifications: Dict[str, HalalCertification] = {}
product_origins: Dict[str, ProductOrigin] = {}

# API Endpoints

@app.get("/")
async def root():
    return {
        "message": "SSDP Blockchain Service API",
        "version": "1.0.0",
        "features": [
            "Immutable delivery records",
            "Smart contract automation",
            "Halal provenance tracking",
            "Supply chain traceability",
            "Proof-of-delivery verification"
        ],
        "blockchain_length": len(blockchain.chain),
        "pending_transactions": len(blockchain.pending_transactions)
    }

@app.post("/delivery/record")
async def create_delivery_record(
    record: DeliveryRecord,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Create immutable delivery record on blockchain
    SECURITY: Tamper-proof delivery verification
    """
    # Add to pending transactions
    blockchain.add_transaction(record.dict())
    
    # Store for quick lookup
    delivery_records[record.id] = record
    
    # Mine block immediately for critical transactions
    block = blockchain.mine_block()
    
    return {
        "message": "Delivery record added to blockchain",
        "record_id": record.id,
        "block_index": block.index if block else None,
        "block_hash": block.hash if block else None
    }

@app.get("/delivery/record/{record_id}")
async def get_delivery_record(
    record_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get delivery record with blockchain verification"""
    if record_id not in delivery_records:
        raise HTTPException(status_code=404, detail="Delivery record not found")
    
    # Get transaction history from blockchain
    history = blockchain.get_transaction_history(record_id)
    
    return {
        "record": delivery_records[record_id],
        "blockchain_verified": len(history) > 0,
        "blockchain_history": history
    }

@app.post("/contract/create", response_model=SmartContract)
async def create_smart_contract(
    contract: SmartContract,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Create smart contract on blockchain
    Automates business agreement execution
    """
    # Add to pending transactions
    blockchain.add_transaction(contract.dict())
    
    # Store for quick lookup
    smart_contracts[contract.id] = contract
    
    # Mine block
    block = blockchain.mine_block()
    
    return contract

@app.post("/contract/{contract_id}/execute")
async def execute_smart_contract(
    contract_id: str,
    execution_data: Dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Execute smart contract
    Automatically enforces contract terms
    """
    if contract_id not in smart_contracts:
        raise HTTPException(status_code=404, detail="Smart contract not found")
    
    contract = smart_contracts[contract_id]
    
    if contract.status != ContractStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Contract is not active")
    
    # Check execution conditions (simplified)
    conditions_met = True
    for condition_key, condition_value in contract.execution_conditions.items():
        if execution_data.get(condition_key) != condition_value:
            conditions_met = False
            break
    
    if not conditions_met:
        raise HTTPException(status_code=400, detail="Execution conditions not met")
    
    # Execute contract
    contract.status = ContractStatus.COMPLETED
    contract.executed_at = datetime.utcnow()
    
    # Record execution on blockchain
    execution_record = {
        "transaction_type": "contract_execution",
        "contract_id": contract_id,
        "execution_data": execution_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    blockchain.add_transaction(execution_record)
    blockchain.mine_block()
    
    return {
        "message": "Smart contract executed successfully",
        "contract_id": contract_id,
        "status": contract.status,
        "executed_at": contract.executed_at
    }

@app.get("/contracts", response_model=List[SmartContract])
async def get_smart_contracts(
    status: Optional[ContractStatus] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get all smart contracts with optional status filter"""
    contracts = list(smart_contracts.values())
    
    if status:
        contracts = [c for c in contracts if c.status == status]
    
    return contracts

@app.post("/halal/certify", response_model=HalalCertification)
async def create_halal_certification(
    certification: HalalCertification,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    MEDICAL: Record halal certification on blockchain
    BRAINSAIT: Ensures product authenticity and compliance
    """
    # Add to pending transactions
    blockchain.add_transaction(certification.dict())
    
    # Store for quick lookup
    halal_certifications[certification.id] = certification
    
    # Mine block
    block = blockchain.mine_block()
    
    return certification

@app.get("/halal/verify/{product_id}")
async def verify_halal_certification(
    product_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    MEDICAL: Verify halal certification from blockchain
    Returns immutable proof of halal compliance
    """
    # Find certification for product
    cert = None
    for certification in halal_certifications.values():
        if certification.product_id == product_id:
            # Check if not expired
            if certification.expiry_date > datetime.utcnow():
                cert = certification
                break
    
    if not cert:
        return {
            "verified": False,
            "message": "No valid halal certification found"
        }
    
    # Get blockchain history
    history = blockchain.get_transaction_history(cert.id)
    
    return {
        "verified": True,
        "certification": cert,
        "blockchain_verified": len(history) > 0,
        "blockchain_history": history
    }

@app.post("/origin/track", response_model=ProductOrigin)
async def track_product_origin(
    origin: ProductOrigin,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Track product origin on blockchain
    Complete supply chain transparency
    """
    # Add to pending transactions
    blockchain.add_transaction(origin.dict())
    
    # Store for quick lookup
    product_origins[origin.id] = origin
    
    # Mine block
    block = blockchain.mine_block()
    
    return origin

@app.get("/origin/trace/{product_id}")
async def trace_product_origin(
    product_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    BRAINSAIT: Trace complete product supply chain
    From manufacturer to outlet
    """
    # Find origin records for product
    origins = [o for o in product_origins.values() if o.product_id == product_id]
    
    if not origins:
        raise HTTPException(status_code=404, detail="No origin records found")
    
    # Get blockchain verification
    verified_origins = []
    for origin in origins:
        history = blockchain.get_transaction_history(origin.id)
        verified_origins.append({
            "origin": origin,
            "blockchain_verified": len(history) > 0
        })
    
    return {
        "product_id": product_id,
        "total_records": len(origins),
        "supply_chain": verified_origins
    }

@app.get("/blockchain/status")
async def get_blockchain_status(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    SECURITY: Get blockchain status and verification
    """
    is_valid = blockchain.verify_chain()
    
    return {
        "total_blocks": len(blockchain.chain),
        "pending_transactions": len(blockchain.pending_transactions),
        "latest_block_hash": blockchain.get_latest_block().hash,
        "chain_valid": is_valid,
        "total_transactions": sum(len(block.transactions) for block in blockchain.chain)
    }

@app.get("/blockchain/verify")
async def verify_blockchain(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    SECURITY: Verify blockchain integrity
    Ensures no tampering has occurred
    """
    is_valid = blockchain.verify_chain()
    
    if is_valid:
        return {
            "status": "verified",
            "message": "Blockchain integrity confirmed",
            "total_blocks": len(blockchain.chain)
        }
    else:
        return {
            "status": "tampered",
            "message": "Blockchain integrity compromised",
            "total_blocks": len(blockchain.chain)
        }

@app.get("/blockchain/blocks")
async def get_blockchain_blocks(
    start_index: int = 0,
    limit: int = 10,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get blockchain blocks with pagination"""
    blocks = blockchain.chain[start_index:start_index + limit]
    
    return {
        "total_blocks": len(blockchain.chain),
        "start_index": start_index,
        "returned": len(blocks),
        "blocks": blocks
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Blockchain Service",
        "timestamp": datetime.utcnow().isoformat(),
        "blockchain_length": len(blockchain.chain),
        "chain_valid": blockchain.verify_chain()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
