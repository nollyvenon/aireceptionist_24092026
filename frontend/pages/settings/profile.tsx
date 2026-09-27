import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  timezone?: string;
  language?: string;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => prev ? { ...prev, [field]: value } : null);
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Profile Settings">
        <div className="max-w-2xl">Loading...</div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout title="Profile Settings">
        <Card className="p-6 max-w-2xl">
          <Alert type="error" message="Failed to load profile" />
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Profile Settings">
      <Card className="p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <Alert
              type="success"
              title="Success"
              message="Profile updated successfully"
              onClose={() => setSuccess(false)}
            />
          )}

          {error && (
            <Alert
              type="error"
              title="Error"
              message={error}
              onClose={() => setError('')}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={profile.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              error={formErrors.first_name}
              required
            />
            <Input
              label="Last Name"
              value={profile.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              error={formErrors.last_name}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={formErrors.email}
            required
          />

          <Input
            label="Phone"
            type="tel"
            value={profile.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={formErrors.phone}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Timezone
              </label>
              <select
                value={profile.timezone || ''}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary-600"
              >
                <option value="">Select timezone</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Chicago">America/Chicago</option>
                <option value="America/Denver">America/Denver</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Asia/Singapore">Asia/Singapore</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Language
              </label>
              <select
                value={profile.language || ''}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary-600"
              >
                <option value="">Select language</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="pt">Portuguese</option>
                <option value="ja">Japanese</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Changes
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => fetchProfile()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </MainLayout>
  );
}
