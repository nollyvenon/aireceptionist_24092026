import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/common/Button';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    if (token) {
      // Decode JWT or fetch user info from API
      // For now, just set a placeholder
      setUser({ email: 'user@example.com' });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-surface-container border-b border-outline-variant sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <span className="text-2xl font-bold text-primary-600">GLACIER AI</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-on-surface hover:text-primary-600">
              Dashboard
            </Link>
            <Link href="/crm/customers" className="text-on-surface hover:text-primary-600">
              CRM
            </Link>
            <Link href="/appointments" className="text-on-surface hover:text-primary-600">
              Appointments
            </Link>
            <Link href="/settings/profile" className="text-on-surface hover:text-primary-600">
              Settings
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-on-surface-variant">{user?.email}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {title && (
          <h1 className="text-4xl font-bold text-on-surface mb-8">{title}</h1>
        )}
        {children}
      </main>
    </div>
  );
};
