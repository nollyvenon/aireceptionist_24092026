"""AI Receptionist service"""

import os
from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    from anthropic import Anthropic
except ImportError:
    Anthropic = None

from app.models.organization import Organization
from app.models.settings import Settings
from app.models.appointment import Appointment
from app.models.activity import Activity, ActivityType
from app.services.organization_service import OrganizationService

class AIReceptionistService:
    def __init__(self, organization_id: UUID, db: Session):
        self.organization_id = organization_id
        self.db = db
        self.organization = OrganizationService.get_organization(organization_id, db)
        self.settings = OrganizationService.get_organization_settings(organization_id, db)

        # Initialize AI client
        self.ai_model = self.settings.ai_model if self.settings else "gpt-4"

        if "gpt" in self.ai_model.lower() and OpenAI:
            self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        elif "claude" in self.ai_model.lower() and Anthropic:
            self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        else:
            self.client = None

    def process_customer_message(
        self,
        message: str,
        customer_id: UUID,
        conversation_history: Optional[List[dict]] = None
    ) -> dict:
        """Process customer message and generate AI response"""
        if not self.client:
            raise ValueError("AI service not configured")

        if conversation_history is None:
            conversation_history = []

        # Build system prompt
        system_prompt = self._build_system_prompt()

        # Prepare messages for AI
        messages = conversation_history + [
            {"role": "user", "content": message}
        ]

        try:
            if isinstance(self.client, OpenAI):
                response = self.client.chat.completions.create(
                    model=self.ai_model,
                    messages=messages,
                    system=system_prompt,
                    temperature=0.7,
                    max_tokens=500,
                )
                ai_response = response.choices[0].message.content
            else:  # Anthropic
                response = self.client.messages.create(
                    model=self.ai_model,
                    max_tokens=500,
                    system=system_prompt,
                    messages=messages,
                )
                ai_response = response.content[0].text

            # Extract intents
            booking_intent = self._extract_booking_intent(ai_response)

            # Log activity
            self._log_activity(customer_id, message, ai_response)

            return {
                "response": ai_response,
                "booking_intent": booking_intent,
                "confidence": 0.95,
            }
        except Exception as e:
            raise ValueError(f"AI processing failed: {str(e)}")

    def _build_system_prompt(self) -> str:
        """Build system prompt for AI"""
        org = self.organization

        system_prompt = f"""You are a professional AI receptionist for {org.name}.

Your responsibilities:
1. Greet customers warmly and professionally
2. Help customers book appointments
3. Answer questions about services and pricing
4. Collect customer information when needed
5. Confirm appointments and send confirmations
6. Handle customer inquiries professionally
7. Escalate to human staff when needed

Business Information:
- Business Name: {org.name}
- Email: {org.email}
- Phone: {org.phone}
- Website: {org.website}
- Timezone: {org.timezone}

Always be:
- Friendly and professional
- Concise and clear
- Helpful and knowledgeable
- Respectful of customer time"""

        return system_prompt

    def _extract_booking_intent(self, response: str) -> Optional[dict]:
        """Extract booking intent from AI response"""
        if any(keyword in response.lower() for keyword in [
            "book", "appointment", "schedule", "available", "time"
        ]):
            return {
                "has_booking_intent": True,
                "type": "appointment_inquiry"
            }
        return None

    def _log_activity(
        self,
        customer_id: UUID,
        message: str,
        response: str
    ):
        """Log AI interaction as activity"""
        activity = Activity(
            organization_id=self.organization_id,
            customer_id=customer_id,
            activity_type=ActivityType.SYSTEM,
            title="AI Receptionist Interaction",
            description=f"Customer: {message[:100]}... AI: {response[:100]}...",
        )
        self.db.add(activity)
        self.db.commit()

    def get_available_appointments(self, customer_id: UUID) -> List[dict]:
        """Get available appointments for customer"""
        from app.services.appointment_service import AppointmentService

        # Get next 7 days
        from datetime import datetime, timedelta
        today = datetime.utcnow().date()

        available_slots = []
        for i in range(7):
            date = today + timedelta(days=i)
            # Get slots for each staff member (simplified - show first available)
            # In production, would query actual staff and their availability
            slots = [
                {"date": date, "time": "09:00", "staff": "Available"},
                {"date": date, "time": "10:00", "staff": "Available"},
                {"date": date, "time": "14:00", "staff": "Available"},
                {"date": date, "time": "15:00", "staff": "Available"},
            ]
            available_slots.extend(slots)

        return available_slots[:10]  # Return next 10 available slots


# Alias for backwards compatibility
AIService = AIReceptionistService
