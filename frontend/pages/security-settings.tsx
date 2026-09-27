import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface IPWhitelist {
  id: string;
  ip_address: string;
  description: string;
  created_at: string;
  last_used?: string;
}

interface SecuritySetting {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

export default function SecuritySettingsPage() {
  const [whitelist, setWhitelist] = useState<IPWhitelist[]>([]);
  const [settings, setSettings] = useState<SecuritySetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newIP, setNewIP] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  const fetchSecuritySettings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const [whitelistRes, settingsRes] = await Promise.all([
        fetch('/api/security/ip-whitelist', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/security/settings', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (whitelistRes.ok) {
        const data = await whitelistRes.json();
        setWhitelist(data.data || []);
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIP = async () => {
    if (!newIP) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/security/ip-whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ip_address: newIP,
          description: newDescription,
        }),
      });

      if (response.ok) {
        setNewIP('');
        setNewDescription('');
        fetchSecuritySettings();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add IP');
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Security Settings">
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
    <MainLayout title="Security Settings">
      <div className="space-y-6 max-w-4xl">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div>
          <h1 className="text-3xl font-bold text-on-surface">Security Settings</h1>
          <p className="text-sm text-on-surface-variant">Manage access controls and security features</p>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">🔐 Security Features</h3>
          <div className="space-y-4">
            {settings.map(setting => (
              <div key={setting.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-lg">
                <div>
                  <h4 className="font-semibold text-on-surface">{setting.name}</h4>
                  <p className="text-sm text-on-surface-variant">{setting.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={setting.enabled}
                  className="w-5 h-5 rounded"
                  onChange={() => {
                    const updated = settings.map(s =>
                      s.id === setting.id ? { ...s, enabled: !s.enabled } : s
                    );
                    setSettings(updated);
                  }}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">🛡️ IP Whitelist</h3>

          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                placeholder="Enter IP address (e.g., 192.168.1.1)"
              />
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleAddIP}
              disabled={!newIP}
              className="w-full"
            >
              Add IP Address
            </Button>
          </div>

          <div className="space-y-3">
            {whitelist.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No IP addresses whitelisted</p>
            ) : (
              whitelist.map(ip => (
                <div key={ip.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-lg">
                  <div>
                    <p className="font-semibold text-on-surface">{ip.ip_address}</p>
                    <p className="text-xs text-on-surface-variant">
                      {ip.description} {ip.last_used && `• Last used: ${new Date(ip.last_used).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button className="px-3 py-1 rounded bg-error-600 text-surface hover:bg-error-700 text-sm font-medium">
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4">📋 Security Info</h3>
          <div className="space-y-3 text-sm text-on-surface-variant">
            <p>• Two-factor authentication is enabled for all accounts</p>
            <p>• All data is encrypted in transit with TLS 1.3</p>
            <p>• Passwords are hashed with bcrypt (12 rounds)</p>
            <p>• Sessions expire after 24 hours of inactivity</p>
            <p>• API keys are rotated every 90 days</p>
            <p>• All actions are logged for audit compliance</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
