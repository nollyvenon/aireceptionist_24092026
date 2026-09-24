# GLACIER AI Receptionist

**The AI Employee That Never Sleeps** ☎️🤖

GLACIER AI is an enterprise-grade AI Receptionist & Appointment Booking + CRM SaaS platform designed for businesses that lose money from missed appointments.

## 🌟 Features

- **AI Receptionist**: 24/7 AI-powered phone and chat support
- **Smart Appointment Booking**: Automated scheduling with conflict detection
- **Payment Processing**: Integrated Stripe, PayPal, and more
- **SMS Reminders**: Automated reminders reduce no-shows
- **CRM Integration**: Complete customer relationship management
- **Calendar Sync**: Google Calendar, Outlook, Apple Calendar integration
- **Multi-Channel**: SMS, WhatsApp, Email, Voice, Messenger, Instagram
- **Advanced Analytics**: Performance tracking and insights
- **Workflow Automation**: Visual automation builder
- **White-Label Ready**: Customizable branding and domains

## 📋 Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Hook Form** - Form management
- **TanStack Query** - State management

### Backend
- **Python 3.11+**
- **FastAPI** - Async web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching & sessions
- **Celery** - Task queue

### Mobile
- **Flutter** - Cross-platform mobile app

### Infrastructure
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **AWS/GCP** - Cloud deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Git

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/nollyvenon/aireceptionist_24092026.git
cd aireceptionist_24092026
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Start with Docker**
```bash
docker-compose up -d
```

This starts:
- PostgreSQL database on `5432`
- Redis cache on `6379`
- Python backend on `8000`
- Next.js frontend on `3000`

4. **Install dependencies (for local development)**
```bash
npm install
cd backend && pip install -r requirements.txt
```

5. **Run development servers**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend && uvicorn main:app --reload
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
.
├── pages/                    # Next.js pages
├── components/              # React components
├── styles/                  # Tailwind CSS styles
├── public/                  # Static assets
├── backend/                 # Python FastAPI backend
│   ├── main.py             # Entry point
│   ├── requirements.txt     # Python dependencies
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   └── tests/              # Backend tests
├── mobile/                  # Flutter mobile app
│   ├── lib/
│   ├── pubspec.yaml
│   └── android/, ios/
├── .github/workflows/       # CI/CD pipelines
├── Dockerfile              # Production Docker image
├── docker-compose.yml      # Local development setup
└── package.json            # Node dependencies
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# Application
NEXT_PUBLIC_APP_NAME=GLACIER AI Receptionist
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/glacier_ai
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# External Services
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
OPENAI_API_KEY=xxx
```

## 🎯 Pricing Plans

| Plan | Monthly | Features |
|------|---------|----------|
| **Starter** | $49 | 1 location, 100 appointments, Basic AI |
| **Professional** | $99 | 5 staff, Unlimited appointments, Advanced CRM |
| **Business** | $199 | Unlimited staff, Multi-location, Automation |
| **Enterprise** | $299 | Everything, White-label, Custom AI, Dedicated support |

## 🔐 Security

- End-to-end encryption for sensitive data
- GDPR compliant
- SOC 2 Type II certified
- Regular security audits
- 99.9% uptime SLA

## 📚 Documentation

- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Backend Architecture](./backend/README.md)
- [Frontend Guide](./frontend/README.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) first.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 💬 Support

- Email: support@glacierai.com
- Discord: [Join our community](https://discord.gg/glacierai)
- Documentation: https://docs.glacierai.com

## 🎉 Roadmap

- [ ] AI Lead Scoring
- [ ] Advanced Analytics & Forecasting
- [ ] Mobile App (Flutter)
- [ ] Marketplace Integrations
- [ ] Custom Workflow Builder UI
- [ ] Advanced AI Features
- [ ] Multi-language Support

---

**Made with ❤️ by the GLACIER AI team**

**Current Version**: 1.0.0  
**Last Updated**: 2026-09-24
