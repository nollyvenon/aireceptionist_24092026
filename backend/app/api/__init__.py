"""API routes package"""

from app.api import (
    auth_routes,
    customer_routes,
    appointment_routes,
    payment_routes,
    ai_routes,
    organization_routes,
    settings_routes,
    automation_routes,
    activity_routes,
    analytics_routes,
    messaging_routes,
    ai_receptionist_routes,
    marketplace_routes,
    admin_routes
)

__all__ = [
    "auth_routes",
    "customer_routes",
    "appointment_routes",
    "payment_routes",
    "ai_routes",
    "organization_routes",
    "settings_routes",
    "automation_routes",
    "activity_routes",
    "analytics_routes",
    "messaging_routes",
    "ai_receptionist_routes",
    "marketplace_routes",
    "admin_routes"
]
