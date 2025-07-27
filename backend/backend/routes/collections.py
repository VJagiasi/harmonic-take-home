import uuid
import json
import threading
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy import func, and_
from sqlalchemy.orm import Session

from backend.db import database
from backend.routes.companies import (
    CompanyBatchOutput,
    fetch_companies_with_liked,
)

router = APIRouter(
    prefix="/collections",
    tags=["collections"],
)


class CompanyCollectionMetadata(BaseModel):
    id: uuid.UUID
    collection_name: str
    total: int


class CompanyCollectionOutput(CompanyBatchOutput, CompanyCollectionMetadata):
    pass


class TransferRequest(BaseModel):
    company_ids: List[int]
    dest_collection_id: uuid.UUID
    transfer_all: bool = False


class TransferResponse(BaseModel):
    job_id: str = None
    status: str
    message: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: int
    total: int
    eta_seconds: int = None
    error_message: str = None


@router.get("", response_model=list[CompanyCollectionMetadata])
def get_all_collection_metadata(
    db: Session = Depends(database.get_db),
):
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
    offset: int = Query(
        0, description="The number of items to skip from the beginning"
    ),
    limit: int = Query(10, description="The number of items to fetch"),
    search: str = Query("", description="Search term to filter companies"),
    db: Session = Depends(database.get_db),
):
    query = (
        db.query(database.CompanyCollectionAssociation, database.Company)
        .join(database.Company)
        .filter(database.CompanyCollectionAssociation.collection_id == collection_id)
    )

    # Apply search filter if provided
    if search.strip():
        query = query.filter(database.Company.company_name.ilike(f"%{search}%"))

    total_count = query.with_entities(func.count()).scalar()

    results = query.offset(offset).limit(limit).all()
    companies = fetch_companies_with_liked(db, [company.id for _, company in results])

    return CompanyCollectionOutput(
        id=collection_id,
        collection_name=db.query(database.CompanyCollection)
        .get(collection_id)
        .collection_name,
        companies=companies,
        total=total_count,
    )


def process_transfer_job(job_id: str, source_collection_id: uuid.UUID, 
                        dest_collection_id: uuid.UUID, company_ids: List[int]):
    """Background job to process company transfers"""
    db = database.SessionLocal()
    try:
        # Update job status to processing
        job = db.query(database.TransferJob).get(job_id)
        if not job:
            return
            
        job.status = "processing"
        job.started_at = datetime.utcnow()
        db.commit()
        
        for i, company_id in enumerate(company_ids):
            try:
                # Check if association already exists
                existing = db.query(database.CompanyCollectionAssociation).filter(
                    and_(
                        database.CompanyCollectionAssociation.company_id == company_id,
                        database.CompanyCollectionAssociation.collection_id == dest_collection_id
                    )
                ).first()
                
                if not existing:
                    # Create new association (this will trigger the 100ms throttle)
                    association = database.CompanyCollectionAssociation(
                        company_id=company_id,
                        collection_id=dest_collection_id
                    )
                    db.add(association)
                    db.commit()
                
                # Update progress
                job.progress = i + 1
                db.commit()
                
            except Exception as e:
                print(f"Error transferring company {company_id}: {e}")
                continue
        
        # Mark job as completed
        job.status = "completed"
        job.completed_at = datetime.utcnow()
        db.commit()
        
    except Exception as e:
        # Mark job as failed
        job.status = "failed"
        job.error_message = str(e)
        db.commit()
        print(f"Transfer job {job_id} failed: {e}")
    finally:
        db.close()


@router.post("/{collection_id}/transfer", response_model=TransferResponse)
def transfer_companies(
    collection_id: uuid.UUID,
    request: TransferRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db),
):
    """Transfer companies from one collection to another"""
    
    # Validate source collection exists
    source_collection = db.query(database.CompanyCollection).get(collection_id)
    if not source_collection:
        raise HTTPException(status_code=404, detail="Source collection not found")
    
    # Validate destination collection exists  
    dest_collection = db.query(database.CompanyCollection).get(request.dest_collection_id)
    if not dest_collection:
        raise HTTPException(status_code=404, detail="Destination collection not found")
    
    company_ids = request.company_ids
    
    # If transfer_all is True, get all company IDs from source collection
    if request.transfer_all:
        associations = db.query(database.CompanyCollectionAssociation).filter(
            database.CompanyCollectionAssociation.collection_id == collection_id
        ).all()
        company_ids = [assoc.company_id for assoc in associations]
    
    if not company_ids:
        return TransferResponse(
            status="completed",
            message="No companies to transfer"
        )
    
    # Small batch - process immediately
    if len(company_ids) <= 10:
        try:
            for company_id in company_ids:
                # Check if association already exists
                existing = db.query(database.CompanyCollectionAssociation).filter(
                    and_(
                        database.CompanyCollectionAssociation.company_id == company_id,
                        database.CompanyCollectionAssociation.collection_id == request.dest_collection_id
                    )
                ).first()
                
                if not existing:
                    association = database.CompanyCollectionAssociation(
                        company_id=company_id,
                        collection_id=request.dest_collection_id
                    )
                    db.add(association)
            
            db.commit()
            
            return TransferResponse(
                status="completed",
                message=f"Successfully transferred {len(company_ids)} companies"
            )
            
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Transfer failed: {str(e)}")
    
    # Large batch - process in background
    else:
        job_id = f"transfer_{uuid.uuid4().hex[:8]}"
        
        # Create transfer job record
        job = database.TransferJob(
            id=job_id,
            source_collection_id=collection_id,
            dest_collection_id=request.dest_collection_id,
            company_ids=json.dumps(company_ids),
            status="pending",
            progress=0,
            total=len(company_ids)
        )
        db.add(job)
        db.commit()
        
        # Start background processing
        thread = threading.Thread(
            target=process_transfer_job,
            args=(job_id, collection_id, request.dest_collection_id, company_ids)
        )
        thread.daemon = True
        thread.start()
        
        return TransferResponse(
            job_id=job_id,
            status="processing",
            message=f"Started background transfer of {len(company_ids)} companies"
        )


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str, db: Session = Depends(database.get_db)):
    """Get status of a transfer job"""
    job = db.query(database.TransferJob).get(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Calculate ETA for processing jobs
    eta_seconds = None
    if job.status == "processing" and job.progress > 0:
        # Rough estimate: 100ms per company remaining
        remaining = job.total - job.progress
        eta_seconds = remaining * 0.1  # 100ms = 0.1 seconds
    
    return JobStatusResponse(
        job_id=job.id,
        status=job.status,
        progress=job.progress,
        total=job.total,
        eta_seconds=eta_seconds,
        error_message=job.error_message
    )
