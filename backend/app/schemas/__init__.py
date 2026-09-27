"""Schemas package - Pydantic models for validation"""

from .user import UserCreate, UserUpdate, UserResponse
from .organization import OrganizationCreate, OrganizationUpdate, OrganizationResponse
from .customer import CustomerCreate, CustomerUpdate, CustomerResponse
from .appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from .payment import PaymentCreate, PaymentResponse
from .auth import LoginRequest, LoginResponse, RefreshTokenRequest
from .lead import LeadCreate, LeadUpdate, LeadResponse, LeadListResponse
from .contact import ContactCreate, ContactUpdate, ContactResponse, ContactListResponse
from .deal import DealCreate, DealUpdate, DealResponse, DealListResponse
from .call import CallCreate, CallResponse, CallListResponse, CallSummaryResponse
from .voicemail import VoicemailCreate, VoicemailResponse, VoicemailListResponse, VoicemailSummaryResponse
from .custom_field import CustomFieldCreate, CustomFieldUpdate, CustomFieldResponse, FieldValueCreate, FieldValueResponse
from .segment import SegmentCreate, SegmentUpdate, SegmentResponse, SegmentListResponse
from .document import DocumentCreate, DocumentUpdate, DocumentResponse, DocumentListResponse, DocumentSummaryResponse
from .feedback import FeedbackCreate, FeedbackUpdate, FeedbackResponse, FeedbackListResponse, FeedbackSummaryResponse
from .referral import ReferralCreate, ReferralUpdate, ReferralResponse, ReferralListResponse, ReferralSummaryResponse
from .audit import AuditLogResponse, AuditSummaryResponse
from .error import ErrorResponse, ValidationError, ValidationErrorResponse

__all__ = [
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "OrganizationCreate",
    "OrganizationUpdate",
    "OrganizationResponse",
    "CustomerCreate",
    "CustomerUpdate",
    "CustomerResponse",
    "AppointmentCreate",
    "AppointmentUpdate",
    "AppointmentResponse",
    "PaymentCreate",
    "PaymentResponse",
    "LoginRequest",
    "LoginResponse",
    "RefreshTokenRequest",
    "LeadCreate",
    "LeadUpdate",
    "LeadResponse",
    "LeadListResponse",
    "ContactCreate",
    "ContactUpdate",
    "ContactResponse",
    "ContactListResponse",
    "DealCreate",
    "DealUpdate",
    "DealResponse",
    "DealListResponse",
    "CallCreate",
    "CallResponse",
    "CallListResponse",
    "CallSummaryResponse",
    "VoicemailCreate",
    "VoicemailResponse",
    "VoicemailListResponse",
    "VoicemailSummaryResponse",
    "CustomFieldCreate",
    "CustomFieldUpdate",
    "CustomFieldResponse",
    "FieldValueCreate",
    "FieldValueResponse",
    "SegmentCreate",
    "SegmentUpdate",
    "SegmentResponse",
    "SegmentListResponse",
    "DocumentCreate",
    "DocumentUpdate",
    "DocumentResponse",
    "DocumentListResponse",
    "DocumentSummaryResponse",
    "FeedbackCreate",
    "FeedbackUpdate",
    "FeedbackResponse",
    "FeedbackListResponse",
    "FeedbackSummaryResponse",
    "ReferralCreate",
    "ReferralUpdate",
    "ReferralResponse",
    "ReferralListResponse",
    "ReferralSummaryResponse",
    "AuditLogResponse",
    "AuditSummaryResponse",
    "ErrorResponse",
    "ValidationError",
    "ValidationErrorResponse",
]
