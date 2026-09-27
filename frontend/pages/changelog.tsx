import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

interface Release {
  id: string;
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  highlights: string[];
  changes: {
    feature: string[];
    improvement: string[];
    bugfix: string[];
    security: string[];
  };
}

export default function ChangelogPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/releases', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReleases(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load changelog');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReleases = filter === 'all'
    ? releases
    : releases.filter(r => r.type === filter);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'bg-error-container text-on-surface';
      case 'minor':
        return 'bg-primary-container text-on-surface';
      case 'patch':
        return 'bg-secondary-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'major': return '📌';
      case 'minor': return '✨';
      case 'patch': return '🐛';
      default: return '📝';
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Changelog">
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
    <MainLayout title="Changelog">
      <div className="space-y-6 max-w-4xl">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div>
          <h1 className="text-3xl font-bold text-on-surface">Changelog</h1>
          <p className="text-sm text-on-surface-variant">Latest updates and improvements</p>
        </div>

        <Card className="p-4">
          <div className="flex gap-2 flex-wrap">
            {['all', 'major', 'minor', 'patch'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                  filter === type
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                {type === 'all' ? 'All Releases' : type}
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          {filteredReleases.length === 0 ? (
            <p className="text-center text-on-surface-variant py-8">No releases found</p>
          ) : (
            filteredReleases.map((release, index) => (
              <Card key={release.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(release.type)}</span>
                      <div>
                        <h3 className="text-xl font-bold text-on-surface">v{release.version}</h3>
                        <p className="text-sm text-on-surface-variant">{new Date(release.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(release.type)}`}>
                    {release.type} Release
                  </span>
                </div>

                {release.highlights.length > 0 && (
                  <div className="mb-4 p-3 bg-primary-container/20 rounded-lg">
                    <p className="text-sm font-semibold text-on-surface mb-2">✨ Highlights:</p>
                    <ul className="text-sm text-on-surface-variant space-y-1">
                      {release.highlights.map((highlight, i) => (
                        <li key={i}>• {highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4">
                  {release.changes.feature.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-on-surface mb-2">🎉 Features:</p>
                      <ul className="text-sm text-on-surface-variant space-y-1 ml-4">
                        {release.changes.feature.map((feature, i) => (
                          <li key={i}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {release.changes.improvement.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-on-surface mb-2">📈 Improvements:</p>
                      <ul className="text-sm text-on-surface-variant space-y-1 ml-4">
                        {release.changes.improvement.map((improvement, i) => (
                          <li key={i}>• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {release.changes.bugfix.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-on-surface mb-2">🐛 Bug Fixes:</p>
                      <ul className="text-sm text-on-surface-variant space-y-1 ml-4">
                        {release.changes.bugfix.map((bugfix, i) => (
                          <li key={i}>• {bugfix}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {release.changes.security.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-error-600 mb-2">🔒 Security:</p>
                      <ul className="text-sm text-on-surface-variant space-y-1 ml-4">
                        {release.changes.security.map((security, i) => (
                          <li key={i}>• {security}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {index < filteredReleases.length - 1 && (
                  <div className="mt-6 pt-6 border-t border-outline-variant"></div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
