import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';

interface Integration {
  id: string;
  name: string;
  description: string;
  is_connected: boolean;
  connected_at?: string;
  category: 'calendar' | 'crm' | 'communication' | 'payment' | 'analytics' | 'other';
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings/integrations', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/settings/integrations/${id}/connect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to connect');

      setSuccess('Integration connected successfully');
      fetchIntegrations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect integration');
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/settings/integrations/${id}/disconnect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to disconnect');

      setSuccess('Integration disconnected');
      fetchIntegrations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect integration');
    }
  };

  const categoryLabels: Record<string, string> = {
    calendar: '📅 Calendar',
    crm: '👥 CRM',
    communication: '💬 Communication',
    payment: '💳 Payment',
    analytics: '📊 Analytics',
    other: '⚙️ Other',
  };

  const categoryColors: Record<string, string> = {
    calendar: 'bg-primary-container',
    crm: 'bg-secondary-container',
    communication: 'bg-tertiary-container',
    payment: 'bg-accent-container',
    analytics: 'bg-surface-container-high',
    other: 'bg-surface-container',
  };

  if (isLoading) {
    return (
      <MainLayout title="Integrations">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton height={24} width="40%" className="mb-4" />
              <Skeleton height={16} width="60%" />
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  const groupedIntegrations = integrations.reduce((acc, int) => {
    if (!acc[int.category]) acc[int.category] = [];
    acc[int.category].push(int);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <MainLayout title="Integrations">
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div>
          <h2 className="text-2xl font-bold text-on-surface mb-6">Available Integrations</h2>

          {Object.entries(groupedIntegrations).map(([category, items]) => (
            <div key={category} className="mb-8">
              <h3 className={`text-lg font-semibold text-on-surface mb-4 px-4 py-2 rounded ${categoryColors[category]} text-on-surface`}>
                {categoryLabels[category]}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((integration) => (
                  <Card key={integration.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-on-surface mb-1">{integration.name}</h4>
                        <p className="text-sm text-on-surface-variant">{integration.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        integration.is_connected
                          ? 'bg-accent-container text-on-surface'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {integration.is_connected ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>

                    {integration.is_connected && integration.connected_at && (
                      <p className="text-xs text-on-surface-variant mb-4">
                        Connected since {new Date(integration.connected_at).toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {integration.is_connected ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDisconnect(integration.id)}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleConnect(integration.id)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {integrations.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-on-surface-variant">No integrations available</p>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
