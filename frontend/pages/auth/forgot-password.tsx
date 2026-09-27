import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthForm } from '@/components/auth/AuthForm';
import { Button } from '@/components/common/Button';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: Record<string, string>) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthCard
        title="Check Your Email"
        subtitle="Password reset link sent"
      >
        <div className="space-y-4">
          <p className="text-on-surface-variant text-center">
            We've sent a password reset link to your email. Please check your inbox and follow the instructions to reset your password.
          </p>
          <Link href="/auth/login">
            <Button variant="primary" fullWidth>
              Back to Login
            </Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Enter your email to receive a reset link"
    >
      <AuthForm
        fields={[
          { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true },
        ]}
        submitLabel="Send Reset Link"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />

      <div className="text-center pt-4">
        <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Back to Login
        </Link>
      </div>
    </AuthCard>
  );
}
