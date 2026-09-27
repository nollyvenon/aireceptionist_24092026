"""Integration tests for Calls API"""

import pytest
from uuid import uuid4

from app.models.communication import Call, CallStatus, CallType


class TestCallsEndpoints:
    """Test suite for calls management endpoints"""

    def test_list_calls_empty(self, client, auth_headers, test_auth_token):
        """Test listing calls when none exist"""
        response = client.get(
            "/api/v1/communication/calls",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert len(data["data"]) == 0

    def test_list_calls_with_data(self, client, auth_headers, test_call, test_auth_token):
        """Test listing calls with existing data"""
        response = client.get(
            "/api/v1/communication/calls",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_create_inbound_call(self, client, auth_headers, test_auth_token):
        """Test creating an inbound call record"""
        call_data = {
            "from_number": "+1234567890",
            "to_number": "+9876543210",
            "call_type": "inbound",
            "status": "completed",
            "duration": 450,
        }

        response = client.post(
            "/api/v1/communication/calls",
            json=call_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data

    def test_create_outbound_call(self, client, auth_headers, test_auth_token):
        """Test creating an outbound call record"""
        call_data = {
            "from_number": "+9876543210",
            "to_number": "+1234567890",
            "call_type": "outbound",
            "status": "completed",
            "duration": 300,
        }

        response = client.post(
            "/api/v1/communication/calls",
            json=call_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data

    def test_get_call_by_id(self, client, auth_headers, test_call, test_auth_token):
        """Test retrieving a specific call by ID"""
        response = client.get(
            f"/api/v1/communication/calls/{test_call.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_call.id)

    def test_get_call_not_found(self, client, auth_headers, test_auth_token):
        """Test retrieving non-existent call"""
        fake_id = uuid4()
        response = client.get(
            f"/api/v1/communication/calls/{fake_id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 404

    def test_update_call_with_transcript(self, client, auth_headers, test_call, test_auth_token):
        """Test updating call with transcript"""
        update_data = {
            "transcript": "Customer inquiring about appointment scheduling.",
            "notes": "Follow up requested",
        }

        response = client.put(
            f"/api/v1/communication/calls/{test_call.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_list_calls_by_type(self, client, auth_headers, test_auth_token, test_call):
        """Test filtering calls by type"""
        response = client.get(
            "/api/v1/communication/calls",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "call_type": test_call.call_type
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_list_calls_by_status(self, client, auth_headers, test_auth_token, test_call):
        """Test filtering calls by status"""
        response = client.get(
            "/api/v1/communication/calls",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "status": test_call.status
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_delete_call(self, client, auth_headers, test_call, test_auth_token):
        """Test deleting a call record"""
        response = client.delete(
            f"/api/v1/communication/calls/{test_call.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_call_duration_tracking(self, client, auth_headers, test_auth_token):
        """Test that call duration is properly tracked"""
        duration = 600
        call_data = {
            "from_number": "+1111111111",
            "to_number": "+2222222222",
            "call_type": "inbound",
            "status": "completed",
            "duration": duration,
        }

        response = client.post(
            "/api/v1/communication/calls",
            json=call_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200

    def test_pagination_calls(self, client, auth_headers, test_auth_token, db, test_organization):
        """Test pagination of calls"""
        for i in range(25):
            call = Call(
                organization_id=test_organization.id,
                from_number=f"+100000{i:04d}",
                to_number=f"+200000{i:04d}",
                call_type=CallType.INBOUND if i % 2 == 0 else CallType.OUTBOUND,
                status=CallStatus.COMPLETED,
                duration=300 + i * 10,
            )
            db.add(call)
        db.commit()

        response = client.get(
            "/api/v1/communication/calls",
            headers=auth_headers,
            params={"token": test_auth_token, "skip": 0, "limit": 10}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) <= 10

    def test_call_with_recording_url(self, client, auth_headers, test_auth_token):
        """Test call with recording URL"""
        call_data = {
            "from_number": "+1555555555",
            "to_number": "+1666666666",
            "call_type": "inbound",
            "status": "completed",
            "duration": 240,
            "recording_url": "https://example.com/recordings/call_12345.wav",
        }

        response = client.post(
            "/api/v1/communication/calls",
            json=call_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
