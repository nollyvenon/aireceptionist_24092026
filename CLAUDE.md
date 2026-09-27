# GLACIER AI & CRM - Claude Development Guide

**Project**: Enterprise AI Receptionist + Appointment Booking + CRM SaaS  
**Current Branch**: `claude/tender-thompson-s609c4`  
**Last Updated**: 2026-09-27

## 🎯 Project Status

### ✅ Completed Phases
- **Phase 0**: Foundation (Docker, CI/CD, logging, config)
- **Phase 1**: Authentication (Email, Phone, OTP, 2FA, OAuth)
- **Phase 2**: Multi-Tenancy (Tenant isolation, billing, settings)
- **Phase 3**: Organizations (Profile, locations, departments, employees)
- **Phase 4**: Users (Customers, employees, profiles, activity logs)
- **Phase 5**: Roles & Permissions (RBAC, policy engine, audit logs)
- **Phase 6**: CRM (Customers, leads, contacts, pipelines, deals)
- **Phase 7**: Calendar (Sync with Google, Outlook, Apple)
- **Phase 8**: Appointment Engine (Booking, rescheduling, cancellation)
- **Phase 9**: Payments (Stripe, PayPal, deposits, invoices)
- **Phase 10**: Messaging (SMS, WhatsApp, Email, Voice, Push)
- **Phase 11**: AI Receptionist (Voice, text, FAQ, lead qualification)
- **Phase 12**: Automation (Visual workflow builder, triggers, actions)
- **Phase 13**: Analytics (Appointments, revenue, performance)
- **Phase 14**: Marketplace (Integrations, webhooks, APIs)
- **Phase 15**: Admin (Tenant management, subscriptions, billing)

### 🔧 Current Work
- **Phase 16**: Mobile App (Flutter) - Structure ready
- **Phase 17**: Testing - 38/114 tests passing (in progress)
- **Phase 18**: Deployment (Docker, Kubernetes, GitHub Actions)
- **Phase 19**: Documentation

### 📦 Design Integration
- **56 UI Screens** imported from design file
- Located in `/designs/` directory
- Each screen has `code.html` and `screen.png`
- Design system: Cognitive Concierge (colors, typography, spacing)
- Key screens: Dashboard, Welcome, Onboarding, Analytics, etc.

## 🏗️ Tech Stack

### Backend
- **FastAPI** (Python 3.11+)
- **PostgreSQL** database
- **Redis** caching
- **Celery** task queue
- **SQLAlchemy** ORM

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** styling
- **Framer Motion** animations
- **React Hook Form** form management
- **TanStack Query** state management

### Infrastructure
- **Docker** containerization
- **GitHub Actions** CI/CD
- **PostgreSQL** (primary DB)
- **Redis** (cache & sessions)

## 🚀 Next Steps

1. **Integrate UI Screens** → Convert HTML designs to React components
2. **Fix Tests** → Get 114/114 tests passing
3. **Setup Routing** → Create Next.js pages for key screens
4. **Deploy to GitHub** → Push all changes to main branch
5. **Run Locally** → Test dashboard, API, and frontend
6. **Production Build** → Prepare for launch

## 📋 Coding Standards

- **No duplicates** - Always check before creating new files
- **Reuse existing services** - Extend, don't duplicate
- **No TODO comments** - Complete implementations only
- **Production-ready** - No placeholders
- **Type safety** - Full TypeScript coverage
- **Test coverage** - Every feature must have tests
- **Git hygiene** - Clear, descriptive commit messages

## 🔐 Important Notes

- **Do NOT delete files** - Use git to restore if needed
- **Always backup** - Check git history before major changes
- **Enterprise standards** - This is production code
- **No downgrades** - Only add features, never remove
- **Backward compatible** - All changes must be compatible

## 📚 Key Files

- `/pages/` - Next.js pages and routes
- `/backend/app/api/` - FastAPI endpoints
- `/backend/app/models/` - Database models
- `/designs/` - Design mockups (56 screens)
- `/docs/` - Project documentation
- `docker-compose.yml` - Local development setup
- `.env.example` - Environment template

## ✨ Features Overview

### AI Receptionist
- 24/7 automated calls and messages
- Natural language conversations
- Appointment booking & rescheduling
- Lead qualification & FAQ answering
- CRM integration
- Multi-language support

### Appointment Booking
- Smart scheduling with conflict detection
- Multiple appointment types
- Recurring appointments
- Group bookings
- No-show tracking
- Waitlist management

### CRM System
- Customer profiles
- Lead pipelines
- Deal tracking
- Custom fields
- Interaction history
- AI lead scoring

### Payments
- Stripe, PayPal integration
- Invoice generation
- Payment reminders
- Subscription management
- Tax calculations

### Analytics
- Appointment metrics
- Revenue tracking
- Staff performance
- Customer insights
- Forecasting

### Automation
- Visual workflow builder
- Trigger-action system
- Scheduled tasks
- Webhook integration
- Email/SMS campaigns

## 🎯 Pricing Plans

| Plan | Price | Features |
|------|-------|----------|
| Starter | $49/mo | 1 location, 100 appointments, Basic AI |
| Professional | $99/mo | 5 staff, Unlimited appointments, CRM |
| Business | $199/mo | Unlimited staff, Multi-location, Automation |
| Enterprise | $299/mo | Everything, White-label, Custom AI |

---

**Made with ❤️ by GLACIER AI**
