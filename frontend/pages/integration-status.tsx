import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface IntegrationStatus {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'disconnected' | 'error' | 'maintenance';
  connected_at?: string;
  last_sync?: string;
  sync_status: 'syncing' | 'synced' | 'failed';
  error_message?: string;
  sync_count: number;
  failed_count: number;
}

export default function IntegrationStatusPage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  const fetchIntegrationStatus = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/integrations/status', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integration status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/integrations/${integrationId}/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchIntegrationStatus();
      }
    } catch (err) {
      console.error('Failed to sync integration:', err);
    }
  };

  const handleReconnect = async (integrationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/integrations/${integrationId}/reconnect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchIntegrationStatus();
      }
    } catch (err) {
      console.error('Failed to reconnect integration:', err);
    }
  };

  const filteredIntegrations = integrations.filter(i =>
    filter === 'all' || i.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return '🟢';
      case 'disconnected':
        return '🔘';
      case 'error':
        return '🔴';
      case 'maintenance':
        return '🟡';
      default:
        return '⚪';
    }
  };

  const getSyncIcon = (syncStatus: string) => {
    switch (syncStatus) {
      case 'syncing':
        return '⏳';
      case 'synced':
        return '✓';
      case 'failed':
        return '✕';
      default:
        return '○';
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Integration Status">
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton height={20} width="100%" className="mb-2" />
              <Skeleton height={16} width="80%" />
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  const connected = integrations.filter(i => i.status === 'connected').length;
  const disconnected = integrations.filter(i => i.status === 'disconnected').length;
  const hasErrors = integrations.filter(i => i.status === 'error').length;

  return (
    <MainLayout title="Integration Status">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Integrations</p>
            <p className="text-3xl font-bold text-on-surface">{integrations.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Connected</p>
            <p className="text-3xl font-bold text-accent-600">{connected}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Disconnected</p>
            <p className="text-3xl font-bold text-primary-600">{disconnected}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Errors</p>
            <p className="text-3xl font-bold text-error-600">{hasErrors}</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Integration Details</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('connected')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'connected'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                Connected
              </button>
              <button
                onClick={() => setFilter('error')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'error'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                Errors
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Integration</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Last Sync</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Sync Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Synced / Failed</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIntegrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                      No integrations found
                    </td>
                  </tr>
                ) : (
                  filteredIntegrations.map(integration => (
                    <tr key={integration.id} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-on-surface">{integration.name}</p>
                          <p className="text-xs text-on-surface-variant">{integration.category}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xl">{getStatusIcon(integration.status)}</span>
                        <p className="text-xs font-medium text-on-surface-variant capitalize">
                          {integration.status}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface-variant text-sm">
                        {integration.last_sync
                          ? new Date(integration.last_sync).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-lg">{getSyncIcon(integration.sync_status)}</span>
                        <p className="text-xs font-medium text-on-surface-variant capitalize">
                          {integration.sync_status}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-medium text-accent-600">
                          {integration.sync_count}
                        </span>
                        <span className="text-xs text-on-surface-variant"> / </span>
                        <span className="text-sm font-medium text-error-600">
                          {integration.failed_count}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-1 justify-center">
                          {integration.status === 'connected' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleSync(integration.id)}
                            >
                              Sync
                            </Button>
                          )}
                          {integration.status === 'error' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleReconnect(integration.id)}
                            >
                              Reconnect
                            </Button>
                          )}
                          {integration.status === 'disconnected' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleReconnect(integration.id)}
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {integrations.some(i => i.error_message) && (
          <Card className="p-6 border-l-4 border-error-600">
            <h3 className="text-lg font-semibold text-error-600 mb-4">⚠️ Recent Errors</h3>
            <div className="space-y-3">
              {integrations
                .filter(i => i.error_message)
                .map(integration => (
                  <div key={integration.id} className="p-3 bg-error-container/20 rounded-lg">
                    <p className="font-semibold text-error-600">{integration.name}</p>
                    <p className="text-sm text-on-surface-variant mt-1">{integration.error_message}</p>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
