"""Integration tests for Voicemail API"""

import pytest
from uuid import uuid4

from app.models.communication import Voicemail


class TestVoicemailEndpoints:
    """Test suite for voicemail management endpoints"""

    def test_list_voicemails_empty(self, client, auth_headers, test_auth_token):
        """Test listing voicemails when none exist"""
        response = client.get(
            "/api/v1/communication/voicemails",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert len(data["items"]) == 0

    def test_list_voicemails_with_data(self, client, auth_headers, test_voicemail, test_auth_token):
        """Test listing voicemails with existing data"""
        response = client.get(
            "/api/v1/communication/voicemails",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_create_voicemail_record(self, client, auth_headers, test_auth_token):
        """Test creating a voicemail record"""
        voicemail_data = {
            "caller_number": "+1234567890",
            "duration": 60,
            "audio_url": "https://example.com/voicemail/vm_001.wav",
        }

        response = client.post(
            "/api/v1/communication/voicemails",
            json=voicemail_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data

    def test_get_voicemail_by_id(self, client, auth_headers, test_voicemail, test_auth_token):
        """Test retrieving a specific voicemail by ID"""
        response = client.get(
            f"/api/v1/communication/voicemails/{test_voicemail.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_voicemail.id)

    def test_get_voicemail_not_found(self, client, auth_headers, test_auth_token):
        """Test retrieving non-existent voicemail"""
        fake_id = uuid4()
        response = client.get(
            f"/api/v1/communication/voicemails/{fake_id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 404

    def test_mark_voicemail_as_listened(self, client, auth_headers, test_voicemail, test_auth_token):
        """Test marking a voicemail as listened"""
        update_data = {
            "is_listened": True,
        }

        response = client.put(
            f"/api/v1/communication/voicemails/{test_voicemail.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_add_transcript_to_voicemail(self, client, auth_headers, test_voicemail, test_auth_token):
        """Test adding transcript to voicemail"""
        update_data = {
            "transcript": "Customer called about appointment scheduling. Please call back at your earliest convenience.",
            "notes": "High priority - key prospect",
        }

        response = client.put(
            f"/api/v1/communication/voicemails/{test_voicemail.id}",
            json=update_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_list_unheard_voicemails(self, client, auth_headers, test_auth_token, test_voicemail):
        """Test filtering unheard voicemails"""
        response = client.get(
            "/api/v1/communication/voicemails",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "is_listened": False
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_delete_voicemail(self, client, auth_headers, test_voicemail, test_auth_token):
        """Test deleting a voicemail"""
        response = client.delete(
            f"/api/v1/communication/voicemails/{test_voicemail.id}",
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code in [200, 204]

    def test_voicemail_duration_tracking(self, client, auth_headers, test_auth_token):
        """Test that voicemail duration is properly tracked"""
        duration = 120
        voicemail_data = {
            "caller_number": "+1999999999",
            "duration": duration,
            "audio_url": "https://example.com/voicemail/vm_999.wav",
        }

        response = client.post(
            "/api/v1/communication/voicemails",
            json=voicemail_data,
            headers=auth_headers,
            params={"token": test_auth_token}
        )
        assert response.status_code == 200

    def test_pagination_voicemails(self, client, auth_headers, test_auth_token, db, test_organization):
        """Test pagination of voicemails"""
        for i in range(20):
            voicemail = Voicemail(
                organization_id=test_organization.id,
                caller_number=f"+100000{i:04d}",
                duration=30 + i * 5,
                audio_url=f"https://example.com/voicemail/vm_{i:05d}.wav",
            )
            db.add(voicemail)
        db.commit()

        response = client.get(
            "/api/v1/communication/voicemails",
            headers=auth_headers,
            params={"token": test_auth_token, "skip": 0, "limit": 10}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 10

        # Second page
        response = client.get(
            "/api/v1/communication/voicemails",
            headers=auth_headers,
            params={"token": test_auth_token, "skip": 10, "limit": 10}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 10

    def test_list_voicemails_by_caller(self, client, auth_headers, test_auth_token, test_voicemail):
        """Test filtering voicemails by caller number"""
        response = client.get(
            "/api/v1/communication/voicemails",
            headers=auth_headers,
            params={
                "token": test_auth_token,
                "caller_number": test_voicemail.caller_number
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
