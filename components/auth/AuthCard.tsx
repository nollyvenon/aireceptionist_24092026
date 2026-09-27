import React from 'react';
import { Card } from '@/components/common/Card';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-surface">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-on-surface">{title}</h1>
          {subtitle && (
            <p className="text-on-surface-variant">{subtitle}</p>
          )}
        </div>
        {children}
      </Card>
    </div>
  );
};
