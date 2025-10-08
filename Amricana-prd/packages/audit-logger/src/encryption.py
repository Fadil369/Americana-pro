# BRAINSAIT: Encryption service for data protection
# SECURITY: AES-256 encryption for PII and financial data
# PDPL/HIPAA: Data protection at rest

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from cryptography.hazmat.backends import default_backend
from typing import Optional, Union
import base64
import os


class EncryptionService:
    """
    SECURITY: Encryption service for sensitive data
    Implements AES-256 encryption for PII and financial data
    """
    
    def __init__(self, master_key: Optional[str] = None):
        """
        Initialize encryption service
        
        Args:
            master_key: Master encryption key. If not provided, will use environment variable
        """
        self.master_key = master_key or os.getenv("ENCRYPTION_MASTER_KEY")
        
        if not self.master_key:
            raise ValueError(
                "SECURITY: Master encryption key not provided. "
                "Set ENCRYPTION_MASTER_KEY environment variable or pass master_key parameter."
            )
        
        self._fernet = self._initialize_fernet()
    
    def _initialize_fernet(self) -> Fernet:
        """
        SECURITY: Initialize Fernet cipher with derived key
        Uses PBKDF2 to derive encryption key from master key
        """
        # Use a fixed salt for key derivation (in production, store this securely)
        salt = b'ssdp_brainsait_salt_v1'
        
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        
        key = base64.urlsafe_b64encode(kdf.derive(self.master_key.encode()))
        return Fernet(key)
    
    def encrypt(self, data: Union[str, bytes]) -> str:
        """
        SECURITY: Encrypt data using AES-256
        
        Args:
            data: Data to encrypt (string or bytes)
        
        Returns:
            Base64-encoded encrypted data
        """
        if isinstance(data, str):
            data = data.encode('utf-8')
        
        encrypted = self._fernet.encrypt(data)
        return base64.urlsafe_b64encode(encrypted).decode('utf-8')
    
    def decrypt(self, encrypted_data: str) -> str:
        """
        SECURITY: Decrypt data
        
        Args:
            encrypted_data: Base64-encoded encrypted data
        
        Returns:
            Decrypted data as string
        """
        encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode('utf-8'))
        decrypted = self._fernet.decrypt(encrypted_bytes)
        return decrypted.decode('utf-8')
    
    def encrypt_dict(self, data: dict, fields_to_encrypt: list) -> dict:
        """
        SECURITY: Encrypt specific fields in a dictionary
        Useful for encrypting PII/PHI fields in database records
        
        Args:
            data: Dictionary containing data
            fields_to_encrypt: List of field names to encrypt
        
        Returns:
            Dictionary with specified fields encrypted
        """
        encrypted_data = data.copy()
        
        for field in fields_to_encrypt:
            if field in encrypted_data and encrypted_data[field] is not None:
                encrypted_data[field] = self.encrypt(str(encrypted_data[field]))
        
        return encrypted_data
    
    def decrypt_dict(self, data: dict, fields_to_decrypt: list) -> dict:
        """
        SECURITY: Decrypt specific fields in a dictionary
        
        Args:
            data: Dictionary containing encrypted data
            fields_to_decrypt: List of field names to decrypt
        
        Returns:
            Dictionary with specified fields decrypted
        """
        decrypted_data = data.copy()
        
        for field in fields_to_decrypt:
            if field in decrypted_data and decrypted_data[field] is not None:
                try:
                    decrypted_data[field] = self.decrypt(decrypted_data[field])
                except Exception:
                    # If decryption fails, field might not be encrypted
                    pass
        
        return decrypted_data
    
    def encrypt_pii(self, pii_data: dict) -> dict:
        """
        PDPL/HIPAA: Encrypt PII (Personally Identifiable Information)
        
        Common PII fields:
        - national_id, iqama_id
        - phone, email
        - address
        - birth_date
        - passport_number
        
        Args:
            pii_data: Dictionary containing PII data
        
        Returns:
            Dictionary with PII fields encrypted
        """
        pii_fields = [
            'national_id',
            'iqama_id',
            'phone',
            'email',
            'address',
            'birth_date',
            'passport_number',
            'tax_id',
            'bank_account',
            'credit_card'
        ]
        
        return self.encrypt_dict(pii_data, pii_fields)
    
    def encrypt_financial(self, financial_data: dict) -> dict:
        """
        SECURITY: Encrypt financial data
        
        Common financial fields:
        - credit_limit
        - current_balance
        - bank_account
        - credit_card
        
        Args:
            financial_data: Dictionary containing financial data
        
        Returns:
            Dictionary with financial fields encrypted
        """
        financial_fields = [
            'credit_limit',
            'current_balance',
            'bank_account',
            'credit_card',
            'account_number',
            'swift_code',
            'iban'
        ]
        
        return self.encrypt_dict(financial_data, financial_fields)


# Global encryption service instance
_encryption_service_instance: Optional[EncryptionService] = None


def get_encryption_service(master_key: Optional[str] = None) -> EncryptionService:
    """
    Get global encryption service instance
    
    Args:
        master_key: Master encryption key (optional, uses environment variable if not provided)
    
    Returns:
        EncryptionService instance
    """
    global _encryption_service_instance
    
    if _encryption_service_instance is None:
        _encryption_service_instance = EncryptionService(master_key)
    
    return _encryption_service_instance
