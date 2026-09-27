import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  retry_attempts: number;
  last_triggered?: string;
  successful_calls: number;
  failed_calls: number;
  created_at: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/webhooks', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load webhooks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (webhookId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        setWebhooks(webhooks.map(w => w.id === webhookId ? { ...w, is_active: !isActive } : w));
      }
    } catch (err) {
      console.error('Failed to update webhook:', err);
    }
  };

  const activeWebhooks = webhooks.filter(w => w.is_active).length;
  const totalCalls = webhooks.reduce((sum, w) => sum + w.successful_calls + w.failed_calls, 0);
  const successRate = totalCalls > 0
    ? ((webhooks.reduce((sum, w) => sum + w.successful_calls, 0) / totalCalls) * 100).toFixed(1)
    : 0;

  if (isLoading) {
    return (
      <MainLayout title="Webhooks">
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
    <MainLayout title="Webhooks">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Webhooks</h1>
          <Button variant="primary">+ Create Webhook</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Webhooks</p>
            <p className="text-3xl font-bold text-on-surface">{webhooks.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Active</p>
            <p className="text-3xl font-bold text-accent-600">{activeWebhooks}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Calls</p>
            <p className="text-3xl font-bold text-primary-600">{totalCalls.toLocaleString()}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Success Rate</p>
            <p className="text-3xl font-bold text-accent-600">{successRate}%</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Failed Calls</p>
            <p className="text-3xl font-bold text-error-600">
              {webhooks.reduce((sum, w) => sum + w.failed_calls, 0)}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Webhooks</h3>

          <div className="space-y-3">
            {webhooks.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No webhooks configured</p>
            ) : (
              webhooks.map(webhook => (
                <div key={webhook.id} className="border border-outline-variant rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-on-surface">{webhook.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${webhook.is_active ? 'bg-accent-container text-on-surface' : 'bg-surface-container text-on-surface-variant'}`}>
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-2 font-mono">{webhook.url}</p>
                      <div className="flex gap-3 text-xs mb-2">
                        <span className="text-on-surface-variant">
                          Successful: <span className="font-semibold text-accent-600">{webhook.successful_calls}</span>
                        </span>
                        <span className="text-on-surface-variant">
                          Failed: <span className="font-semibold text-error-600">{webhook.failed_calls}</span>
                        </span>
                        {webhook.last_triggered && (
                          <span className="text-on-surface-variant">
                            Last triggered: {new Date(webhook.last_triggered).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(webhook.id, webhook.is_active)}
                        className="px-3 py-1 rounded text-xs font-medium bg-primary-600 text-surface hover:bg-primary-700"
                      >
                        {webhook.is_active ? 'Pause' : 'Resume'}
                      </button>
                      <a
                        href={`/webhooks/${webhook.id}`}
                        className="px-3 py-1 rounded bg-secondary-600 text-surface text-xs font-medium hover:bg-secondary-700"
                      >
                        Edit
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {webhook.events.map(event => (
                      <span key={event} className="text-xs px-2 py-1 rounded bg-primary-container text-on-surface">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">🔗 Webhook Configuration</h3>
          <div className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex gap-3">
              <span>•</span>
              <span>Webhooks send real-time event notifications to your systems</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Failed deliveries automatically retry with exponential backoff</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Each webhook is signed with HMAC-SHA256 for security verification</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>View event logs and delivery status for each webhook</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Subscribe to specific events: appointments.created, customers.updated, etc.</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
