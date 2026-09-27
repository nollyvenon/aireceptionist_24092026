import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface APIKey {
  id: string;
  name: string;
  key: string;
  secret?: string;
  status: 'active' | 'inactive' | 'revoked';
  permissions: string[];
  last_used?: string;
  created_at: string;
  expires_at?: string;
}

export default function APIKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSecret, setShowSecret] = useState<string | null>(null);

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/keys', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setKeys(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (confirm('Are you sure? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/keys/${keyId}/revoke`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setKeys(keys.map(k => k.id === keyId ? { ...k, status: 'revoked' } : k));
        }
      } catch (err) {
        console.error('Failed to revoke API key:', err);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent-container text-on-surface';
      case 'inactive':
        return 'bg-surface-container text-on-surface-variant';
      case 'revoked':
        return 'bg-error-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const activeKeys = keys.filter(k => k.status === 'active').length;

  if (isLoading) {
    return (
      <MainLayout title="API Keys">
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
    <MainLayout title="API Keys">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">API Keys</h1>
            <p className="text-sm text-on-surface-variant">
              Manage API credentials for integrations
            </p>
          </div>
          <Button variant="primary">+ Generate Key</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Keys</p>
            <p className="text-3xl font-bold text-on-surface">{keys.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Active</p>
            <p className="text-3xl font-bold text-accent-600">{activeKeys}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Revoked</p>
            <p className="text-3xl font-bold text-error-600">
              {keys.filter(k => k.status === 'revoked').length}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">API Credentials</h3>

          <div className="space-y-3">
            {keys.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No API keys created yet</p>
            ) : (
              keys.map(key => (
                <div key={key.id} className="border border-outline-variant rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-on-surface">{key.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${getStatusColor(key.status)}`}>
                          {key.status}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        Created {new Date(key.created_at).toLocaleDateString()}
                        {key.last_used && ` • Last used ${new Date(key.last_used).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {key.status === 'active' && (
                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          className="px-3 py-1 rounded bg-error-600 text-surface text-xs font-medium hover:bg-error-700"
                        >
                          Revoke
                        </button>
                      )}
                      <a
                        href={`/api-keys/${key.id}`}
                        className="px-3 py-1 rounded bg-primary-600 text-surface text-xs font-medium hover:bg-primary-700"
                      >
                        Edit
                      </a>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded p-3 mb-3 font-mono text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-on-surface-variant">Key:</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(key.key)}
                        className="text-primary-600 hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="text-on-surface break-all">{key.key}</div>
                  </div>

                  {key.secret && (
                    <div className="bg-surface-container-lowest rounded p-3 mb-3 font-mono text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-on-surface-variant">Secret:</span>
                        <button
                          onClick={() => setShowSecret(showSecret === key.id ? null : key.id)}
                          className="text-primary-600 hover:underline"
                        >
                          {showSecret === key.id ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <div className="text-on-surface">
                        {showSecret === key.id ? key.secret : '••••••••••••••••'}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-on-surface-variant mb-2">Permissions:</p>
                    <div className="flex gap-2 flex-wrap">
                      {key.permissions.map(perm => (
                        <span key={perm} className="text-xs px-2 py-1 rounded bg-primary-container text-on-surface">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">🔐 API Security Best Practices</h3>
          <div className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex gap-3">
              <span>•</span>
              <span>Keep your API keys secret and never commit them to version control</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Rotate keys regularly and revoke unused keys immediately</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Use environment variables to store API credentials</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Limit permissions to only what each key needs</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Monitor key usage and set up alerts for suspicious activity</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
