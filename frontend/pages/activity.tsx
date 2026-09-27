import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

interface Activity {
  id: string;
  type: 'appointment' | 'customer' | 'deal' | 'payment' | 'message' | 'automation' | 'lead';
  action: string;
  entity: string;
  entity_id: string;
  user: string;
  timestamp: string;
  description: string;
  icon: string;
  link?: string;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/activity', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivities = activities.filter(a =>
    filter === 'all' || a.type === filter
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-primary-container';
      case 'customer':
        return 'bg-secondary-container';
      case 'deal':
        return 'bg-accent-container';
      case 'payment':
        return 'bg-tertiary-container';
      case 'message':
        return 'bg-primary-container/50';
      case 'automation':
        return 'bg-secondary-container/50';
      case 'lead':
        return 'bg-accent-container/50';
      default:
        return 'bg-surface-container';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <MainLayout title="Activity Timeline">
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton height={16} width="100%" className="mb-2" />
              <Skeleton height={14} width="80%" />
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Activity Timeline">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Activity Timeline</h1>
          <div className="flex gap-2 flex-wrap">
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
            {['appointment', 'customer', 'deal', 'payment'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  filter === type
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredActivities.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-on-surface-variant">No activity found</p>
            </Card>
          ) : (
            filteredActivities.map((activity, index) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${getTypeColor(activity.type)}`}>
                    {activity.icon}
                  </div>
                  {index < filteredActivities.length - 1 && (
                    <div className="w-0.5 h-12 bg-outline-variant mt-2" />
                  )}
                </div>

                <Card className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-on-surface">
                        {activity.action}
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-on-surface-variant whitespace-nowrap">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>
                      {activity.entity}: <span className="font-medium">{activity.entity_id}</span>
                    </span>
                    <span>by {activity.user}</span>
                  </div>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
