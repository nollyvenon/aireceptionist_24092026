import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  created_at: string;
  updated_at: string;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeatureFlags();
  }, []);

  const fetchFeatureFlags = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/feature-flags', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setFlags(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feature flags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFlag = async (flagId: string, newState: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/feature-flags/${flagId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: newState }),
      });

      setFlags(flags.map(f => f.id === flagId ? { ...f, enabled: newState } : f));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feature flag');
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Feature Flags">
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

  const enabledCount = flags.filter(f => f.enabled).length;

  return (
    <MainLayout title="Feature Flags">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div>
          <h1 className="text-3xl font-bold text-on-surface">Feature Flags</h1>
          <p className="text-sm text-on-surface-variant">Manage feature rollouts and experiments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Flags</p>
            <p className="text-3xl font-bold text-on-surface">{flags.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Enabled</p>
            <p className="text-3xl font-bold text-accent-600">{enabledCount}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Disabled</p>
            <p className="text-3xl font-bold text-primary-600">{flags.length - enabledCount}</p>
          </Card>
        </div>

        <div className="space-y-4">
          {flags.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-on-surface-variant">No feature flags configured</p>
            </Card>
          ) : (
            flags.map(flag => (
              <Card key={flag.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-on-surface">{flag.name}</h3>
                      <code className="text-xs bg-surface-container px-2 py-1 rounded text-on-surface-variant">
                        {flag.key}
                      </code>
                    </div>
                    <p className="text-sm text-on-surface-variant">{flag.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleToggleFlag(flag.id, !flag.enabled)}
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        flag.enabled
                          ? 'bg-accent-container text-on-surface'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {flag.enabled ? '✓ Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-on-surface">Rollout</span>
                    <span className="text-xs text-on-surface-variant">{flag.rollout_percentage}%</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full transition-all"
                      style={{ width: `${flag.rollout_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-on-surface-variant">
                  Updated {new Date(flag.updated_at).toLocaleDateString()}
                </div>
              </Card>
            ))
          )}
        </div>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">ℹ️ Feature Flags Guide</h3>
          <div className="space-y-2 text-sm text-on-surface-variant">
            <p>• Flags control feature availability for specific users or percentages</p>
            <p>• Rollout percentage enables gradual feature deployment (canary releases)</p>
            <p>• 100% rollout means the feature is available to all users</p>
            <p>• 0% rollout disables the feature for all users except testers</p>
            <p>• Use flags for A/B testing, beta features, and safe deployments</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
