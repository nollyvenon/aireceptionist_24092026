import { useRouter } from 'next/router';
import { useState } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '2FA verification failed');
      }

      const { access_token } = await response.json();
      localStorage.setItem('token', access_token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Two-Factor Authentication"
      subtitle="Enter the code from your authenticator app"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-error-container text-error text-sm">
            {error}
          </div>
        )}

        <Input
          label="Authentication Code"
          type="text"
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          Verify
        </Button>

        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={() => router.push('/auth/login')}
        >
          Use backup code instead
        </Button>
      </form>
    </AuthCard>
  );
}
