"""Transfer-related data models and schemas."""
import uuid
from typing import List, Optional

from pydantic import BaseModel


class TransferRequest(BaseModel):
    """Request schema for company transfer operations."""
    company_ids: List[int]
    dest_collection_id: uuid.UUID
    transfer_all: bool = False


class TransferResponse(BaseModel):
    """Response schema for transfer operations."""
    job_id: Optional[str] = None
    status: str
    message: str


class JobStatusResponse(BaseModel):
    """Response schema for job status queries."""
    job_id: str
    status: str
    progress: int
    total: int
    eta_seconds: Optional[int] = None
    error_message: Optional[str] = None