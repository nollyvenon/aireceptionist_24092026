# GLACIER AI Receptionist - Frontend

Next.js 14 web application for GLACIER AI Receptionist SaaS platform.

## Overview

Modern, responsive web interface built with:
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling
- **Framer Motion** - Smooth animations

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Setup

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Development Server

```bash
npm run dev
```

Access at http://localhost:3000

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── [slug]/          # Dynamic routes
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── customers/      # Customer management
│   ├── appointments/   # Appointment components
│   ├── payments/       # Payment components
│   └── common/         # Shared components
├── hooks/              # Custom React hooks
│   ├── useAuth.ts     # Authentication hook
│   ├── useCustomers.ts
│   └── useAppointments.ts
├── utils/              # Utilities
│   ├── api.ts         # API client
│   └── helpers.ts     # Helper functions
├── types/              # TypeScript types
├── styles/             # Global styles
└── public/            # Static assets
```

## Key Features

### Authentication
- Login/logout
- Token management
- Auto-refresh
- Protected routes

### Customers
- View customer list
- Create new customers
- Update customer info
- Search customers
- View lead scores

### Appointments
- Calendar view
- Create appointments
- Update appointments
- Cancel appointments
- Confirm appointments
- View availability

### Payments
- Payment processing
- Transaction history
- Refund handling

### Analytics
- Dashboard metrics
- Revenue tracking
- Customer insights
- Performance analytics

## Components

### Custom Hooks

**useAuth**: Authentication management
```typescript
const { user, loading, isAuthenticated, login, logout } = useAuth();
```

**useCustomers**: Customer data fetching
```typescript
const { data: customers, isLoading } = useCustomers(0, 50, 'prospect');
const createCustomer = useCreateCustomer();
```

**useAppointments**: Appointment management
```typescript
const { data: appointments } = useAppointments(0, 50, 'confirmed');
const cancelAppointment = useCancelAppointment();
```

### API Client

Automatic token injection and refresh:
```typescript
import { apiClient } from '@/utils/api';

// Login
await apiClient.login('user@example.com', 'password');

// Fetch customers
const response = await apiClient.getCustomers(0, 50);

// Create appointment
await apiClient.createAppointment({
  customer_id: customerId,
  title: 'Consultation',
  start_time: '2024-02-01T10:00:00',
  end_time: '2024-02-01T11:00:00',
});
```

## Styling

### Tailwind CSS

Global configuration in `tailwind.config.js`:
- Custom color palette (primary, secondary, accent, danger)
- Extended spacing and typography
- Forms plugin enabled
- Typography plugin enabled

### Global Styles

```typescript
// src/styles/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Forms

Using React Hook Form + Zod validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

## Data Fetching

TanStack Query for server state:

```typescript
// Fetching
const { data, isLoading, error } = useCustomers(0, 50);

// Mutations
const mutation = useCreateCustomer();
mutation.mutate({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
});

// Watch mutation state
if (mutation.isPending) return <Loading />;
if (mutation.isError) return <Error error={mutation.error} />;
if (mutation.isSuccess) return <Success />;
```

## Testing

### Run Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { LoginForm } from './LoginForm';

test('renders login form', () => {
  render(<LoginForm />);
  expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
});
```

## Linting & Formatting

### Lint Code

```bash
npm run lint
```

### Type Check

```bash
npm run type-check
```

### Format Code

```bash
npm run format
```

### Check Formatting

```bash
npm run format:check
```

## Build

### Production Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Performance

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Bundle Analysis**: Check bundle size
- **Lazy Loading**: Dynamic imports for components

## Security

- **HTTPS**: Enforced in production
- **CORS**: Handled by backend
- **XSS Protection**: React escapes by default
- **CSRF**: Cookie-based tokens
- **Rate Limiting**: Backend enforced

## SEO

- **Meta Tags**: Next.js Head component
- **Sitemap**: Auto-generated
- **Open Graph**: Social sharing
- **Structured Data**: JSON-LD

## Deployment

### Docker

```bash
docker build -t glacier-frontend:latest .
docker run -p 3000:3000 glacier-frontend:latest
```

### Environment Variables

Set these on deployment:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_URL`: Frontend URL
- `NODE_ENV`: Set to 'production'

### Vercel

```bash
vercel deploy
```

### Self-Hosted

```bash
npm run build
npm start
```

## Troubleshooting

### API Connection Error

```typescript
// Check API URL in .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

// Verify backend is running
curl http://localhost:8000/health
```

### Token Issues

```typescript
// Clear localStorage and login again
localStorage.clear();
window.location.href = '/login';
```

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

## Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test
3. Run linting: `npm run lint`
4. Commit: `git commit -m "feat: add feature"`
5. Push: `git push origin feature/feature-name`
6. Create PR

## Support

- Issues: https://github.com/nollyvenon/aireceptionist_24092026/issues
- Docs: https://docs.glacierai.com
- Email: support@glacierai.com
