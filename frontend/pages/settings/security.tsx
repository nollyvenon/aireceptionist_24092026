import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';

interface Session {
  id: string;
  device: string;
  ip_address: string;
  last_activity: string;
  is_current: boolean;
}

interface TwoFactorStatus {
  enabled: boolean;
  method: 'authenticator' | 'email' | 'sms';
}

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Chrome on Mac OS',
      ip_address: '192.168.1.100',
      last_activity: new Date().toISOString(),
      is_current: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      ip_address: '192.168.1.101',
      last_activity: new Date(Date.now() - 3600000).toISOString(),
      is_current: false,
    },
  ]);

  const [twoFactor, setTwoFactor] = useState<TwoFactorStatus>({
    enabled: true,
    method: 'authenticator',
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        setSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to change password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/sessions/${sessionId}/revoke`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        setSuccess('Session revoked');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to revoke session:', err);
    }
  };

  const handleToggleTwoFactor = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/2fa/toggle', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled: !twoFactor.enabled }),
      });

      if (response.ok) {
        setTwoFactor({ ...twoFactor, enabled: !twoFactor.enabled });
        setSuccess(`2FA ${!twoFactor.enabled ? 'enabled' : 'disabled'}`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to toggle 2FA:', err);
    }
  };

  return (
    <MainLayout title="Security Settings">
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-on-surface mb-6">Password Management</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Current Password
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
              />
              <p className="text-xs text-on-surface-variant mt-2">
                Minimum 8 characters, mix of letters, numbers, and symbols recommended
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
              />
            </div>

            <Button
              variant="primary"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-on-surface mb-6">Two-Factor Authentication</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
              <div>
                <h3 className="font-semibold text-on-surface mb-1">
                  {twoFactor.enabled ? '✓ Enabled' : '○ Disabled'}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  {twoFactor.enabled
                    ? `Using ${twoFactor.method === 'authenticator' ? 'Authenticator App' : twoFactor.method === 'email' ? 'Email' : 'SMS'}`
                    : 'Two-factor authentication adds an extra layer of security'}
                </p>
              </div>
              <Button
                variant={twoFactor.enabled ? 'secondary' : 'primary'}
                onClick={handleToggleTwoFactor}
              >
                {twoFactor.enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>

            {twoFactor.enabled && (
              <div className="space-y-3">
                <h4 className="font-semibold text-on-surface">Authentication Method</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-outline-variant rounded-lg hover:bg-surface-container cursor-pointer">
                    <input
                      type="radio"
                      name="2fa-method"
                      value="authenticator"
                      checked={twoFactor.method === 'authenticator'}
                      onChange={() => setTwoFactor({ ...twoFactor, method: 'authenticator' })}
                    />
                    <span className="flex-1">
                      <span className="font-medium text-on-surface block">Authenticator App</span>
                      <span className="text-xs text-on-surface-variant">Use Google Authenticator, Authy, or Microsoft Authenticator</span>
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-outline-variant rounded-lg hover:bg-surface-container cursor-pointer">
                    <input
                      type="radio"
                      name="2fa-method"
                      value="email"
                      checked={twoFactor.method === 'email'}
                      onChange={() => setTwoFactor({ ...twoFactor, method: 'email' })}
                    />
                    <span className="flex-1">
                      <span className="font-medium text-on-surface block">Email</span>
                      <span className="text-xs text-on-surface-variant">Receive verification codes via email</span>
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-outline-variant rounded-lg hover:bg-surface-container cursor-pointer">
                    <input
                      type="radio"
                      name="2fa-method"
                      value="sms"
                      checked={twoFactor.method === 'sms'}
                      onChange={() => setTwoFactor({ ...twoFactor, method: 'sms' })}
                    />
                    <span className="flex-1">
                      <span className="font-medium text-on-surface block">SMS</span>
                      <span className="text-xs text-on-surface-variant">Receive verification codes via text message</span>
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-on-surface mb-6">Active Sessions</h2>

          <p className="text-sm text-on-surface-variant mb-6">
            Manage your active sessions and sign out from other devices
          </p>

          <div className="space-y-3">
            {sessions.map(session => (
              <div
                key={session.id}
                className="flex items-start justify-between p-4 border border-outline-variant rounded-lg hover:bg-surface-container"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-on-surface">{session.device}</h4>
                    {session.is_current && (
                      <span className="text-xs px-2 py-1 rounded-full bg-accent-container text-on-surface font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    IP: <span className="font-mono">{session.ip_address}</span>
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Last active:{' '}
                    {new Date(session.last_activity).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!session.is_current && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    Sign Out
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 border-l-4 border-error-600">
          <h2 className="text-2xl font-bold text-error-600 mb-4">Danger Zone</h2>

          <div className="space-y-4">
            <div className="p-4 bg-error-container/20 rounded-lg">
              <h4 className="font-semibold text-error-600 mb-2">Delete Account</h4>
              <p className="text-sm text-on-surface-variant mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="secondary" className="bg-error-container text-error-600">
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
