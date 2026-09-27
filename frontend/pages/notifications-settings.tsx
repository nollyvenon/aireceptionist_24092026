import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface NotificationSetting {
  id: string;
  event_type: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  webhook_enabled: boolean;
  description: string;
}

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notification-settings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (settingId: string, key: string) => {
    setSettings(
      settings.map(s =>
        s.id === settingId
          ? { ...s, [key]: !s[key as keyof NotificationSetting] }
          : s
      )
    );
    setSaved(false);
  };

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save notification settings:', err);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Notification Settings">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton height={20} width="60%" className="mb-2" />
              <Skeleton height={16} width="80%" />
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Notification Settings">
      <div className="space-y-6 max-w-4xl">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        {saved && (
          <Card className="p-4 bg-accent-container text-on-surface">
            ✓ Settings saved successfully!
          </Card>
        )}

        <div>
          <h1 className="text-3xl font-bold text-on-surface">Notification Settings</h1>
          <p className="text-sm text-on-surface-variant">
            Choose how you want to be notified for different events
          </p>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Event Notifications</h3>

          <div className="space-y-4">
            {settings.map(setting => (
              <div key={setting.id} className="border border-outline-variant rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-semibold text-on-surface mb-1">{setting.event_type}</h4>
                  <p className="text-sm text-on-surface-variant">{setting.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.email_enabled}
                      onChange={() => handleToggle(setting.id, 'email_enabled')}
                      className="w-4 h-4 rounded border-outline-variant"
                    />
                    <span className="text-sm font-medium text-on-surface">📧 Email</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.sms_enabled}
                      onChange={() => handleToggle(setting.id, 'sms_enabled')}
                      className="w-4 h-4 rounded border-outline-variant"
                    />
                    <span className="text-sm font-medium text-on-surface">💬 SMS</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.push_enabled}
                      onChange={() => handleToggle(setting.id, 'push_enabled')}
                      className="w-4 h-4 rounded border-outline-variant"
                    />
                    <span className="text-sm font-medium text-on-surface">🔔 Push</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.webhook_enabled}
                      onChange={() => handleToggle(setting.id, 'webhook_enabled')}
                      className="w-4 h-4 rounded border-outline-variant"
                    />
                    <span className="text-sm font-medium text-on-surface">🔗 Webhook</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="primary" onClick={handleSaveSettings}>
              Save Settings
            </Button>
            <Button variant="secondary" onClick={() => fetchSettings()}>
              Reset
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">💡 Notification Channels</h3>
          <div className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex gap-3">
              <span>📧</span>
              <span>Email: Receive notifications via email address</span>
            </div>
            <div className="flex gap-3">
              <span>💬</span>
              <span>SMS: Receive text messages to your phone</span>
            </div>
            <div className="flex gap-3">
              <span>🔔</span>
              <span>Push: Browser and mobile push notifications</span>
            </div>
            <div className="flex gap-3">
              <span>🔗</span>
              <span>Webhook: Send notifications to your systems</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
