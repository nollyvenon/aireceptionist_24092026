"""Marketplace and integration routes"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from database import get_db
from app.models.integration import Integration, APIKey, Webhook
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/marketplace", tags=["marketplace"])

# List available integrations
@router.get("/integrations")
async def list_integrations():
    """List available integrations"""
    return {
        "integrations": [
            {"name": "Zapier", "status": "available", "category": "automation"},
            {"name": "Make", "status": "available", "category": "automation"},
            {"name": "Slack", "status": "available", "category": "communication"},
            {"name": "Google Calendar", "status": "available", "category": "calendar"},
            {"name": "Microsoft Teams", "status": "available", "category": "communication"},
            {"name": "Zoom", "status": "available", "category": "meetings"},
            {"name": "Google Meet", "status": "available", "category": "meetings"},
            {"name": "Mailchimp", "status": "available", "category": "marketing"},
            {"name": "HubSpot", "status": "available", "category": "crm"},
            {"name": "Salesforce", "status": "available", "category": "crm"}
        ]
    }

# Install integration
@router.post("/integrations/{integration_name}/install")
async def install_integration(
    integration_name: str,
    config: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Install marketplace integration"""
    try:
        integration = Integration(
            organization_id=current_user.get("organization_id"),
            name=integration_name,
            config=config,
            is_active=True
        )
        db.add(integration)
        db.commit()
        db.refresh(integration)
        return {"status": "installed", "integration_id": integration.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# List installed integrations
@router.get("/installed")
async def list_installed_integrations(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List installed integrations"""
    return db.query(Integration).filter(
        Integration.organization_id == current_user.get("organization_id")
    ).all()

# Create API key
@router.post("/keys")
async def create_api_key(
    key_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create API key for developers"""
    try:
        api_key = APIKey(
            organization_id=current_user.get("organization_id"),
            name=key_data.get("name"),
            key=APIKey.generate_key(),
            scopes=key_data.get("scopes", [])
        )
        db.add(api_key)
        db.commit()
        db.refresh(api_key)
        return {"key": api_key.key, "id": api_key.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# List API keys
@router.get("/keys")
async def list_api_keys(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List API keys"""
    return db.query(APIKey).filter(
        APIKey.organization_id == current_user.get("organization_id")
    ).all()

# Create webhook
@router.post("/webhooks")
async def create_webhook(
    webhook_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create webhook endpoint"""
    try:
        webhook = Webhook(
            organization_id=current_user.get("organization_id"),
            url=webhook_data.get("url"),
            event_types=webhook_data.get("event_types", []),
            is_active=True
        )
        db.add(webhook)
        db.commit()
        db.refresh(webhook)
        return webhook
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# List webhooks
@router.get("/webhooks")
async def list_webhooks(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List webhooks"""
    return db.query(Webhook).filter(
        Webhook.organization_id == current_user.get("organization_id")
    ).all()

# Public API documentation
@router.get("/docs")
async def get_api_docs():
    """Get API documentation for developers"""
    return {
        "version": "1.0.0",
        "endpoints": {
            "appointments": "/api/v1/appointments",
            "customers": "/api/v1/customers",
            "payments": "/api/v1/payments",
            "messaging": "/api/v1/messaging",
            "ai": "/api/v1/ai"
        },
        "auth": "Bearer token",
        "rate_limit": "1000 requests/hour"
    }

# SDK downloads
@router.get("/sdks")
async def get_sdks():
    """Get SDK downloads"""
    return {
        "sdks": [
            {"language": "Python", "url": "/sdks/glacier-ai-sdk-python.tar.gz"},
            {"language": "JavaScript", "url": "/sdks/glacier-ai-sdk-js.tar.gz"},
            {"language": "Go", "url": "/sdks/glacier-ai-sdk-go.tar.gz"},
            {"language": "Ruby", "url": "/sdks/glacier-ai-sdk-ruby.tar.gz"}
        ]
    }
