import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthForm } from '@/components/auth/AuthForm';
import { Button } from '@/components/common/Button';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (data: Record<string, string>) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      router.push('/auth/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create Account"
      subtitle="Join us and get started"
    >
      <AuthForm
        fields={[
          { name: 'first_name', label: 'First Name', type: 'text', placeholder: 'John', required: true },
          { name: 'last_name', label: 'Last Name', type: 'text', placeholder: 'Doe', required: true },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true },
          { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
          { name: 'password_confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••', required: true },
        ]}
        submitLabel="Create Account"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />

      <div className="text-center pt-4">
        <span className="text-on-surface-variant">Already have an account? </span>
        <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
}
