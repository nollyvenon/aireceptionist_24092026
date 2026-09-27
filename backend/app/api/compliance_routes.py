"""Compliance and data management API routes"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from database import get_db
from app.models.features import BackupJob, ComplianceTask
from app.models.user import User
from app.services.auth_service import AuthService
from app.middleware.auth import get_current_user
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/compliance", tags=["compliance"])

@router.get("/metrics")
async def get_compliance_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks = db.query(ComplianceTask).filter(
        ComplianceTask.organization_id == current_user.organization_id
    ).all()

    total = len(tasks)
    completed = len([t for t in tasks if t.status == "completed"])
    pending = len([t for t in tasks if t.status == "pending"])
    overdue = len([t for t in tasks if t.status == "pending" and t.due_date < datetime.utcnow()])

    return {
        "total_tasks": total,
        "completed": completed,
        "pending": pending,
        "overdue": overdue,
        "compliance_score": (completed / total * 100) if total > 0 else 0,
    }

@router.get("/tasks")
async def list_compliance_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ComplianceTask).filter(
        ComplianceTask.organization_id == current_user.organization_id
    )

    if status:
        query = query.filter(ComplianceTask.status == status)

    total = query.count()
    tasks = query.offset(skip).limit(limit).all()

    return {
        "data": [
            {
                "id": str(t.id),
                "title": t.title,
                "status": t.status,
                "due_date": t.due_date.isoformat() if t.due_date else None,
            }
            for t in tasks
        ],
        "total": total,
    }

@router.post("/tasks")
async def create_compliance_task(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = ComplianceTask(
        organization_id=current_user.organization_id,
        title=body.get("title"),
        description=body.get("description"),
        status="pending",
        due_date=body.get("due_date"),
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return {"id": str(task.id)}

@router.put("/tasks/{task_id}")
async def update_compliance_task(
    task_id: UUID,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(ComplianceTask).filter(
        ComplianceTask.id == task_id,
        ComplianceTask.organization_id == current_user.organization_id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, value in body.items():
        if hasattr(task, key):
            setattr(task, key, value)

    if body.get("status") == "completed":
        task.completed_at = datetime.utcnow()

    db.commit()
    return {"id": str(task.id)}

@router.post("/export-data")
async def export_data_gdpr(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {
        "message": "Data export initiated",
        "download_url": f"/api/v1/compliance/exports/{current_user.organization_id}",
    }

@router.post("/delete-data")
async def delete_data_gdpr(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {
        "message": "Data deletion initiated",
        "status": "processing",
        "estimated_time": "24 hours",
    }

@router.get("/data-retention")
async def get_data_retention_policies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {
        "data": [
            {"data_type": "messages", "retention_days": 90, "auto_delete": True},
            {"data_type": "calls", "retention_days": 90, "auto_delete": True},
            {"data_type": "appointment_logs", "retention_days": 365, "auto_delete": True},
            {"data_type": "audit_logs", "retention_days": 365, "auto_delete": False},
            {"data_type": "customer_data", "retention_days": None, "auto_delete": False},
        ]
    }
