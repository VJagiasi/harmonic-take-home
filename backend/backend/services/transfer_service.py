"""Service layer for handling company transfer operations."""
import json
import threading
import uuid
from datetime import datetime
from typing import List

from sqlalchemy import and_
from sqlalchemy.orm import Session

from backend.db import database


class TransferJobService:
    """Service for managing transfer jobs and background processing."""
    
    @staticmethod
    def create_transfer_job(
        db: Session,
        source_collection_id: uuid.UUID,
        dest_collection_id: uuid.UUID,
        company_ids: List[int]
    ) -> str:
        """Create a new transfer job record."""
        job_id = f"transfer_{uuid.uuid4().hex[:8]}"
        
        job = database.TransferJob(
            id=job_id,
            source_collection_id=source_collection_id,
            dest_collection_id=dest_collection_id,
            company_ids=json.dumps(company_ids),
            status="pending",
            progress=0,
            total=len(company_ids)
        )
        db.add(job)
        db.commit()
        
        return job_id
    
    @staticmethod
    def start_background_transfer(
        job_id: str,
        source_collection_id: uuid.UUID,
        dest_collection_id: uuid.UUID,
        company_ids: List[int]
    ) -> None:
        """Start background processing of transfer job."""
        thread = threading.Thread(
            target=TransferJobService._process_transfer_job,
            args=(job_id, source_collection_id, dest_collection_id, company_ids)
        )
        thread.daemon = True
        thread.start()
    
    @staticmethod
    def _process_transfer_job(
        job_id: str,
        source_collection_id: uuid.UUID,
        dest_collection_id: uuid.UUID,
        company_ids: List[int]
    ) -> None:
        """Background job to process company transfers."""
        db = database.SessionLocal()
        try:
            # Update job status to processing
            job = db.query(database.TransferJob).get(job_id)
            if not job:
                return
                
            job.status = "processing"
            job.started_at = datetime.utcnow()
            db.commit()
            
            # Process each company transfer
            for i, company_id in enumerate(company_ids):
                try:
                    TransferJobService._transfer_single_company(
                        db, company_id, source_collection_id, dest_collection_id
                    )
                    
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
            if job:
                job.status = "failed"
                job.error_message = str(e)
                db.commit()
            print(f"Transfer job {job_id} failed: {e}")
        finally:
            db.close()
    
    @staticmethod
    def _transfer_single_company(
        db: Session, 
        company_id: int, 
        source_collection_id: uuid.UUID,
        dest_collection_id: uuid.UUID
    ) -> None:
        """Transfer a single company from source to destination collection."""
        # Remove from source collection
        db.query(database.CompanyCollectionAssociation).filter(
            and_(
                database.CompanyCollectionAssociation.company_id == company_id,
                database.CompanyCollectionAssociation.collection_id == source_collection_id
            )
        ).delete()
        
        # Check if association already exists in destination
        existing = db.query(database.CompanyCollectionAssociation).filter(
            and_(
                database.CompanyCollectionAssociation.company_id == company_id,
                database.CompanyCollectionAssociation.collection_id == dest_collection_id
            )
        ).first()
        
        if not existing:
            # Create new association in destination (triggers 100ms throttle)
            association = database.CompanyCollectionAssociation(
                company_id=company_id,
                collection_id=dest_collection_id
            )
            db.add(association)
        
        db.commit()
    
    @staticmethod
    def transfer_companies_sync(
        db: Session,
        source_collection_id: uuid.UUID,
        company_ids: List[int],
        dest_collection_id: uuid.UUID
    ) -> None:
        """Transfer companies synchronously for small batches."""
        for company_id in company_ids:
            TransferJobService._transfer_single_company(
                db, company_id, source_collection_id, dest_collection_id
            )