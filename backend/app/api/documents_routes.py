"""Documents API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from app.models.advanced import Document
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

def get_current_user(token: str = Query(...), db: Session = Depends(get_db)) -> User:
    token_data = AuthService.verify_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = UserService.get_user(token_data.user_id, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("")
async def list_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Document).filter(Document.organization_id == current_user.organization_id)
    total = query.count()
    documents = query.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "data": [
            {
                "id": str(d.id),
                "file_name": d.file_name,
                "file_type": d.file_type,
                "file_size": d.file_size,
                "created_at": d.created_at.isoformat(),
            }
            for d in documents
        ],
        "total": total,
    }

@router.post("")
async def upload_document(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = Document(
        organization_id=current_user.organization_id,
        uploaded_by_id=current_user.id,
        file_name=body.get("file_name"),
        file_url=body.get("file_url"),
        file_size=body.get("file_size", 0),
        file_type=body.get("file_type"),
        description=body.get("description"),
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return {"id": str(document.id)}

@router.get("/{document_id}")
async def get_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "id": str(document.id),
        "file_name": document.file_name,
        "file_url": document.file_url,
        "file_size": document.file_size,
        "description": document.description,
    }

@router.delete("/{document_id}")
async def delete_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    db.delete(document)
    db.commit()

    return {"message": "Document deleted"}

@router.get("/summary")
async def document_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    documents = db.query(Document).filter(
        Document.organization_id == current_user.organization_id
    ).all()

    total_size = sum(d.file_size for d in documents)

    return {
        "total": len(documents),
        "total_size_bytes": total_size,
        "total_size_mb": round(total_size / 1024 / 1024, 2),
    }
