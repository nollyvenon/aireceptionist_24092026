import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthForm } from '@/components/auth/AuthForm';
import { Button } from '@/components/common/Button';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (data: Record<string, string>) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const { access_token } = await response.json();
      localStorage.setItem('token', access_token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to your account"
    >
      <AuthForm
        fields={[
          { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true },
          { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
        ]}
        submitLabel="Sign In"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />

      <div className="space-y-3 pt-4">
        <Link href="/auth/forgot-password">
          <Button variant="ghost" fullWidth className="justify-center">
            Forgot password?
          </Button>
        </Link>

        <div className="text-center">
          <span className="text-on-surface-variant">Don't have an account? </span>
          <Link href="/auth/signup" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
