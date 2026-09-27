import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface Goal {
  id: string;
  name: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  status: 'on_track' | 'at_risk' | 'off_track';
  owner: string;
  start_date: string;
  end_date: string;
  frequency: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/goals', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGoals = goals.filter(g =>
    filter === 'all' || g.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'bg-accent-container text-on-surface';
      case 'at_risk':
        return 'bg-secondary-container text-on-surface';
      case 'off_track':
        return 'bg-error-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-accent-600';
    if (progress >= 75) return 'bg-secondary-600';
    if (progress >= 50) return 'bg-primary-600';
    return 'bg-error-600';
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.round((current / target) * 100);
  };

  const stats = {
    total: goals.length,
    onTrack: goals.filter(g => g.status === 'on_track').length,
    atRisk: goals.filter(g => g.status === 'at_risk').length,
    offTrack: goals.filter(g => g.status === 'off_track').length,
  };

  if (isLoading) {
    return (
      <MainLayout title="Goals & Targets">
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
    <MainLayout title="Goals & Targets">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Goals & Targets</h1>
          <Button variant="primary">+ New Goal</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Goals</p>
            <p className="text-3xl font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">On Track</p>
            <p className="text-3xl font-bold text-accent-600">{stats.onTrack}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">At Risk</p>
            <p className="text-3xl font-bold text-secondary-600">{stats.atRisk}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Off Track</p>
            <p className="text-3xl font-bold text-error-600">{stats.offTrack}</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Goals</h3>
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
              <button
                onClick={() => setFilter('on_track')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'on_track'
                    ? 'bg-accent-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                On Track
              </button>
              <button
                onClick={() => setFilter('at_risk')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'at_risk'
                    ? 'bg-secondary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                At Risk
              </button>
              <button
                onClick={() => setFilter('off_track')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'off_track'
                    ? 'bg-error-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                Off Track
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredGoals.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No goals found</p>
            ) : (
              filteredGoals.map(goal => {
                const progress = calculateProgress(goal.current, goal.target);
                return (
                  <div key={goal.id} className="border border-outline-variant rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-on-surface">{goal.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${getStatusColor(goal.status)}`}>
                            {goal.status}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant">
                          {goal.category} • Owner: {goal.owner}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-on-surface">
                          {goal.current} / {goal.target} {goal.unit}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {progress}% complete
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-surface-container-high rounded-full h-3 mb-3">
                      <div
                        className={`h-3 rounded-full ${getProgressColor(progress)}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <span>
                        {goal.frequency} • {goal.category}
                      </span>
                      <span>
                        Due: {new Date(goal.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
