"""Document management service"""

from sqlalchemy.orm import Session
from uuid import UUID
from app.models.advanced import Document
from datetime import datetime


class DocumentService:
    @staticmethod
    def create_document(data: dict, organization_id: UUID, db: Session) -> Document:
        document = Document(
            organization_id=organization_id,
            name=data.get("name"),
            document_type=data.get("document_type"),
            file_url=data.get("file_url"),
            file_size=data.get("file_size", 0),
            uploaded_by=data.get("uploaded_by"),
            description=data.get("description"),
        )
        db.add(document)
        db.commit()
        return document

    @staticmethod
    def get_document(document_id: UUID, db: Session) -> Document:
        return db.query(Document).filter(Document.id == document_id).first()

    @staticmethod
    def list_organization_documents(org_id: UUID, db: Session, skip: int = 0,
                                    limit: int = 50, doc_type: str = None) -> tuple:
        query = db.query(Document).filter(Document.organization_id == org_id)

        if doc_type:
            query = query.filter(Document.document_type == doc_type)

        total = query.count()
        documents = query.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
        return documents, total

    @staticmethod
    def update_document(document_id: UUID, data: dict, db: Session) -> Document:
        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            if "name" in data:
                document.name = data["name"]
            if "description" in data:
                document.description = data["description"]
            if "file_url" in data:
                document.file_url = data["file_url"]
            if "file_size" in data:
                document.file_size = data["file_size"]
            document.updated_at = datetime.utcnow()
            db.commit()
        return document

    @staticmethod
    def delete_document(document_id: UUID, db: Session) -> bool:
        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            db.delete(document)
            db.commit()
            return True
        return False

    @staticmethod
    def increment_download_count(document_id: UUID, db: Session) -> Document:
        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            if document.download_count is None:
                document.download_count = 0
            document.download_count += 1
            db.commit()
        return document

    @staticmethod
    def search_documents(org_id: UUID, name_query: str, db: Session) -> list:
        return db.query(Document).filter(
            Document.organization_id == org_id,
            Document.name.ilike(f"%{name_query}%")
        ).order_by(Document.created_at.desc()).all()

    @staticmethod
    def list_by_uploader(org_id: UUID, user_id: UUID, db: Session) -> list:
        return db.query(Document).filter(
            Document.organization_id == org_id,
            Document.uploaded_by == user_id
        ).order_by(Document.created_at.desc()).all()

    @staticmethod
    def get_document_summary(org_id: UUID, db: Session) -> dict:
        documents = db.query(Document).filter(Document.organization_id == org_id).all()

        total = len(documents)
        total_size = sum(d.file_size for d in documents if d.file_size)
        total_downloads = sum(d.download_count for d in documents if d.download_count)

        by_type = {}
        for doc in documents:
            doc_type = doc.document_type
            if doc_type not in by_type:
                by_type[doc_type] = 0
            by_type[doc_type] += 1

        avg_downloads = total_downloads / total if total > 0 else 0

        return {
            "total_documents": total,
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / 1024 / 1024, 2),
            "total_downloads": total_downloads,
            "average_downloads_per_document": round(avg_downloads, 2),
            "by_type": by_type,
        }

    @staticmethod
    def delete_old_documents(org_id: UUID, db: Session, days: int = 90) -> int:
        from datetime import timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        query = db.query(Document).filter(
            Document.organization_id == org_id,
            Document.created_at < cutoff_date
        )
        count = query.count()
        query.delete()
        db.commit()
        return count

    @staticmethod
    def get_documents_by_type(org_id: UUID, doc_type: str, db: Session) -> list:
        return db.query(Document).filter(
            Document.organization_id == org_id,
            Document.document_type == doc_type
        ).order_by(Document.created_at.desc()).all()

    @staticmethod
    def bulk_delete_documents(document_ids: list, db: Session) -> int:
        query = db.query(Document).filter(Document.id.in_(document_ids))
        count = query.count()
        query.delete()
        db.commit()
        return count
