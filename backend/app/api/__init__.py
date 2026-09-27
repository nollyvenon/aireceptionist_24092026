"""API routes package"""

from app.api import (
    auth_routes, customer_routes, appointment_routes, payment_routes, ai_routes,
    organization_routes, settings_routes, automation_routes, activity_routes, analytics_routes,
    messaging_routes, ai_receptionist_routes, marketplace_routes, admin_routes,
    leads_routes, contacts_routes, deals_routes, calls_routes, voicemail_routes,
    audit_routes, feature_flags_routes, security_routes, compliance_routes,
    backup_routes, custom_fields_routes, segments_routes, documents_routes,
    system_routes, feedback_routes, referrals_routes, analytics_full_routes
)

__all__ = [
    "auth_routes", "customer_routes", "appointment_routes", "payment_routes", "ai_routes",
    "organization_routes", "settings_routes", "automation_routes", "activity_routes", "analytics_routes",
    "messaging_routes", "ai_receptionist_routes", "marketplace_routes", "admin_routes",
    "leads_routes", "contacts_routes", "deals_routes", "calls_routes", "voicemail_routes",
    "audit_routes", "feature_flags_routes", "security_routes", "compliance_routes",
    "backup_routes", "custom_fields_routes", "segments_routes", "documents_routes",
    "system_routes", "feedback_routes", "referrals_routes", "analytics_full_routes"
]
