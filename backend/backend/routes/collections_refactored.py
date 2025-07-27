"""Collections API endpoints with proper separation of concerns."""
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.db import database
from backend.models.transfer import TransferRequest, TransferResponse, JobStatusResponse
from backend.routes.companies import CompanyBatchOutput, fetch_companies_with_liked
from backend.services.transfer_service import TransferJobService


router = APIRouter(
    prefix="/collections",
    tags=["collections"],
)

# Constants - intent-revealing names
SMALL_BATCH_THRESHOLD = 10
ETA_CALCULATION_DELAY_PER_COMPANY_SECONDS = 0.1


class CompanyCollectionMetadata(BaseModel):
    """Metadata for a company collection."""
    id: uuid.UUID
    collection_name: str
    total: int


class CompanyCollectionOutput(CompanyBatchOutput, CompanyCollectionMetadata):
    """Full company collection with companies data."""
    pass


def validate_collections_exist(
    db: Session, 
    source_id: uuid.UUID, 
    dest_id: uuid.UUID
) -> tuple[database.CompanyCollection, database.CompanyCollection]:
    """Validate that both source and destination collections exist."""
    source_collection = db.query(database.CompanyCollection).get(source_id)
    if not source_collection:
        raise HTTPException(status_code=404, detail="Source collection not found")
    
    dest_collection = db.query(database.CompanyCollection).get(dest_id)
    if not dest_collection:
        raise HTTPException(status_code=404, detail="Destination collection not found")
    
    return source_collection, dest_collection


def get_company_ids_for_collection(
    db: Session, 
    collection_id: uuid.UUID
) -> List[int]:
    """Get all company IDs for a given collection."""
    associations = db.query(database.CompanyCollectionAssociation).filter(
        database.CompanyCollectionAssociation.collection_id == collection_id
    ).all()
    return [assoc.company_id for assoc in associations]


def calculate_eta_seconds(progress: int, total: int) -> Optional[int]:
    """Calculate estimated time remaining for job completion."""
    if progress <= 0:
        return None
    
    remaining_companies = total - progress
    return int(remaining_companies * ETA_CALCULATION_DELAY_PER_COMPANY_SECONDS)


@router.get("", response_model=List[CompanyCollectionMetadata])
def get_all_collection_metadata(
    db: Session = Depends(database.get_db),
) -> List[CompanyCollectionMetadata]:
    """Get metadata for all collections."""
    collections = db.query(database.CompanyCollection).all()
    
    result = []
    for collection in collections:
        # Count companies in this collection
        company_count = (
            db.query(database.CompanyCollectionAssociation)
            .filter(database.CompanyCollectionAssociation.collection_id == collection.id)
            .count()
        )
        
        result.append(CompanyCollectionMetadata(
            id=collection.id,
            collection_name=collection.collection_name,
            total=company_count,
        ))
    
    return result


@router.get("/{collection_id}", response_model=CompanyCollectionOutput)
def get_company_collection_by_id(
    collection_id: uuid.UUID,
    offset: int = Query(0, description="The number of items to skip from the beginning"),
    limit: int = Query(10, description="The number of items to fetch"),
    search: str = Query("", description="Search companies by name"),
    db: Session = Depends(database.get_db),
) -> CompanyCollectionOutput:
    """Get a specific collection with its companies."""
    query = (
        db.query(database.CompanyCollectionAssociation, database.Company)
        .join(database.Company)
        .filter(database.CompanyCollectionAssociation.collection_id == collection_id)
    )
    
    # Add search filter if search term provided
    if search.strip():
        query = query.filter(
            database.Company.company_name.ilike(f"%{search.strip()}%")
        )

    total_count = query.with_entities(func.count()).scalar()
    results = query.offset(offset).limit(limit).all()
    companies = fetch_companies_with_liked(db, [company.id for _, company in results])

    collection = db.query(database.CompanyCollection).get(collection_id)
    
    return CompanyCollectionOutput(
        id=collection_id,
        collection_name=collection.collection_name,
        companies=companies,
        total=total_count,
    )


@router.post("/{collection_id}/transfer", response_model=TransferResponse)
def transfer_companies(
    collection_id: uuid.UUID,
    request: TransferRequest,
    db: Session = Depends(database.get_db),
) -> TransferResponse:
    """Transfer companies from one collection to another."""
    # Validate collections exist
    validate_collections_exist(db, collection_id, request.dest_collection_id)
    
    # Determine company IDs to transfer
    company_ids = request.company_ids
    if request.transfer_all:
        company_ids = get_company_ids_for_collection(db, collection_id)
    
    if not company_ids:
        return TransferResponse(
            status="completed",
            message="No companies to transfer"
        )
    
    # Small batch - process immediately
    if len(company_ids) <= SMALL_BATCH_THRESHOLD:
        try:
            TransferJobService.transfer_companies_sync(
                db, collection_id, company_ids, request.dest_collection_id
            )
            
            return TransferResponse(
                status="completed",
                message=f"Successfully transferred {len(company_ids)} companies"
            )
            
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Transfer failed: {str(e)}")
    
    # Large batch - process in background
    job_id = TransferJobService.create_transfer_job(
        db, collection_id, request.dest_collection_id, company_ids
    )
    
    TransferJobService.start_background_transfer(
        job_id, collection_id, request.dest_collection_id, company_ids
    )
    
    return TransferResponse(
        job_id=job_id,
        status="processing",
        message=f"Started background transfer of {len(company_ids)} companies"
    )


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(
    job_id: str, 
    db: Session = Depends(database.get_db)
) -> JobStatusResponse:
    """Get status of a transfer job."""
    job = db.query(database.TransferJob).get(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    eta_seconds = None
    if job.status == "processing" and job.progress > 0:
        eta_seconds = calculate_eta_seconds(job.progress, job.total)
    
    return JobStatusResponse(
        job_id=job.id,
        status=job.status,
        progress=job.progress,
        total=job.total,
        eta_seconds=eta_seconds,
        error_message=job.error_message
    )