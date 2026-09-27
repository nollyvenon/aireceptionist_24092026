import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface RateLimit {
  id: string;
  name: string;
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  burst_limit: number;
  current_usage: number;
  remaining_quota: number;
  reset_at: string;
}

export default function APIRateLimitsPage() {
  const [limits, setLimits] = useState<RateLimit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRateLimits();
    const interval = setInterval(fetchRateLimits, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchRateLimits = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/rate-limits', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLimits(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rate limits');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (usage: number, limit: number) => {
    const percentage = (usage / limit) * 100;
    if (percentage > 90) return 'text-error-600';
    if (percentage > 70) return 'text-warning-600';
    return 'text-accent-600';
  };

  const getBarColor = (usage: number, limit: number) => {
    const percentage = (usage / limit) * 100;
    if (percentage > 90) return 'bg-error-600';
    if (percentage > 70) return 'bg-warning-600';
    return 'bg-primary-600';
  };

  if (isLoading) {
    return (
      <MainLayout title="API Rate Limits">
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
    <MainLayout title="API Rate Limits">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">API Rate Limits</h1>
          <span className="text-sm text-on-surface-variant">Auto-refresh every 60s</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Current Plan</p>
            <p className="text-2xl font-bold text-on-surface">Professional</p>
            <p className="text-xs text-on-surface-variant mt-2">10,000 requests/day</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Usage Today</p>
            <p className="text-2xl font-bold text-primary-600">2,845</p>
            <p className="text-xs text-on-surface-variant mt-2">28.45% of quota</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Reset Time</p>
            <p className="text-2xl font-bold text-on-surface">06:32 AM</p>
            <p className="text-xs text-on-surface-variant mt-2">Next 24h reset</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Endpoint Rate Limits</h3>
            <a href="/settings/billing" className="text-sm text-primary-600 hover:underline">
              Upgrade Plan
            </a>
          </div>

          <div className="space-y-6">
            {limits.map(limit => (
              <div key={limit.id} className="border border-outline-variant rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-on-surface">{limit.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Resets at: {new Date(limit.reset_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${getStatusColor(limit.current_usage, limit.requests_per_day)}`}>
                    {limit.current_usage} / {limit.requests_per_day}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getBarColor(limit.current_usage, limit.requests_per_day)}`}
                      style={{ width: `${Math.min((limit.current_usage / limit.requests_per_day) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-on-surface-variant mb-1">Per Minute</p>
                    <p className="font-semibold text-on-surface">{limit.requests_per_minute}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant mb-1">Per Hour</p>
                    <p className="font-semibold text-on-surface">{limit.requests_per_hour}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant mb-1">Burst Limit</p>
                    <p className="font-semibold text-on-surface">{limit.burst_limit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4">📊 Pricing Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: 'Starter', limit: '1,000', price: '$29' },
              { name: 'Professional', limit: '10,000', price: '$99', current: true },
              { name: 'Business', limit: '50,000', price: '$199' },
              { name: 'Enterprise', limit: 'Unlimited', price: 'Custom' },
            ].map(plan => (
              <div
                key={plan.name}
                className={`border rounded-lg p-4 ${
                  plan.current
                    ? 'border-primary-600 bg-primary-container/10'
                    : 'border-outline-variant'
                }`}
              >
                <p className="font-semibold text-on-surface mb-2">{plan.name}</p>
                <p className="text-2xl font-bold text-on-surface mb-2">{plan.limit}</p>
                <p className="text-xs text-on-surface-variant mb-4">requests/day</p>
                <p className="text-lg font-bold text-primary-600">{plan.price}</p>
                {plan.current && (
                  <p className="text-xs text-accent-600 mt-2 font-medium">Current Plan</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">ℹ️ Rate Limit Information</h3>
          <div className="space-y-2 text-sm text-on-surface-variant">
            <p>• Rate limits are applied per API key</p>
            <p>• Limits reset daily at 00:00 UTC</p>
            <p>• Burst limit allows temporary spikes</p>
            <p>• 429 status code indicates rate limit exceeded</p>
            <p>• X-RateLimit-* headers show limit info</p>
            <p>• Contact support for higher limits</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
