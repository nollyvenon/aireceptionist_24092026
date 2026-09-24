"""Marketplace API tests"""

import pytest
from fastapi.testclient import TestClient
from uuid import uuid4


def test_list_integrations(client: TestClient, test_token: str, test_organization):
    """Test listing available integrations"""
    response = client.get(
        "/api/v1/marketplace/integrations",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_integration_details(client: TestClient, test_token: str, test_organization):
    """Test getting integration details"""
    response = client.get(
        "/api/v1/marketplace/integrations/stripe",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 404]


def test_install_integration(client: TestClient, test_token: str, test_organization):
    """Test installing integration"""
    response = client.post(
        "/api/v1/marketplace/integrations/stripe/install",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "api_key": "sk_test_123456"
        }
    )
    assert response.status_code in [200, 201, 400]


def test_uninstall_integration(client: TestClient, test_token: str, test_organization, db):
    """Test uninstalling integration"""
    from app.models.integration import Integration

    integration = Integration(
        id=uuid4(),
        organization_id=test_organization.id,
        name="stripe",
        display_name="Stripe",
        enabled=True
    )
    db.add(integration)
    db.commit()

    response = client.post(
        f"/api/v1/marketplace/integrations/{integration.id}/uninstall",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 400]


def test_list_installed_integrations(client: TestClient, test_token: str, test_organization):
    """Test listing installed integrations"""
    response = client.get(
        "/api/v1/marketplace/integrations/installed",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200


def test_get_integration_configuration(client: TestClient, test_token: str, test_organization, db):
    """Test getting integration configuration"""
    from app.models.integration import Integration

    integration = Integration(
        id=uuid4(),
        organization_id=test_organization.id,
        name="stripe",
        display_name="Stripe",
        enabled=True
    )
    db.add(integration)
    db.commit()

    response = client.get(
        f"/api/v1/marketplace/integrations/{integration.id}/config",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 404]


def test_update_integration_configuration(client: TestClient, test_token: str, test_organization, db):
    """Test updating integration configuration"""
    from app.models.integration import Integration

    integration = Integration(
        id=uuid4(),
        organization_id=test_organization.id,
        name="stripe",
        display_name="Stripe",
        enabled=True
    )
    db.add(integration)
    db.commit()

    response = client.put(
        f"/api/v1/marketplace/integrations/{integration.id}/config",
        headers={"Authorization": f"Bearer {test_token}"},
        json={
            "api_key": "sk_test_789012"
        }
    )
    assert response.status_code in [200, 400]


def test_test_integration_connection(client: TestClient, test_token: str, test_organization, db):
    """Test connection to integration"""
    from app.models.integration import Integration

    integration = Integration(
        id=uuid4(),
        organization_id=test_organization.id,
        name="stripe",
        display_name="Stripe",
        enabled=True
    )
    db.add(integration)
    db.commit()

    response = client.post(
        f"/api/v1/marketplace/integrations/{integration.id}/test",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code in [200, 400]


def test_list_extensions(client: TestClient, test_token: str, test_organization):
    """Test listing available extensions"""
    response = client.get(
        "/api/v1/marketplace/extensions",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200
