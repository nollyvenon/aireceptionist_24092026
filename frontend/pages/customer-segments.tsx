import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface Segment {
  id: string;
  name: string;
  description: string;
  customer_count: number;
  avg_lifetime_value: number;
  avg_order_value: number;
  growth_rate: number;
  churn_rate: number;
  criteria: string;
  last_updated: string;
}

export default function CustomerSegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customer-segments', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSegments(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer segments');
    } finally {
      setIsLoading(false);
    }
  };

  const totalCustomers = segments.reduce((sum, s) => sum + s.customer_count, 0);
  const avgLifetimeValue = segments.length > 0
    ? (segments.reduce((sum, s) => sum + s.avg_lifetime_value, 0) / segments.length).toFixed(0)
    : 0;
  const avgChurnRate = segments.length > 0
    ? ((segments.reduce((sum, s) => sum + s.churn_rate, 0) / segments.length) * 100).toFixed(1)
    : 0;

  if (isLoading) {
    return (
      <MainLayout title="Customer Segments">
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
    <MainLayout title="Customer Segments">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Customer Segments</h1>
          <Button variant="primary">+ New Segment</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Customers</p>
            <p className="text-3xl font-bold text-on-surface">{totalCustomers.toLocaleString()}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Lifetime Value</p>
            <p className="text-3xl font-bold text-accent-600">
              ${avgLifetimeValue}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Churn Rate</p>
            <p className="text-3xl font-bold text-error-600">{avgChurnRate}%</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Active Segments</p>
            <p className="text-3xl font-bold text-primary-600">{segments.length}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {segments.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <p className="text-on-surface-variant">No customer segments found</p>
            </Card>
          ) : (
            segments.map(segment => (
              <Card key={segment.id} className="p-6 hover:bg-surface-container transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-on-surface">{segment.name}</h3>
                    <p className="text-sm text-on-surface-variant">{segment.description}</p>
                  </div>
                  <a
                    href={`/customer-segments/${segment.id}`}
                    className="px-3 py-1 rounded bg-primary-600 text-surface text-xs font-medium hover:bg-primary-700"
                  >
                    View
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Customers</p>
                    <p className="text-xl font-bold text-on-surface">
                      {segment.customer_count.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Lifetime Value</p>
                    <p className="text-xl font-bold text-accent-600">
                      ${(segment.avg_lifetime_value / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Growth Rate</p>
                    <p className={`text-xl font-bold ${segment.growth_rate > 0 ? 'text-accent-600' : 'text-error-600'}`}>
                      {segment.growth_rate > 0 ? '+' : ''}{(segment.growth_rate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Churn Rate</p>
                    <p className="text-xl font-bold text-error-600">
                      {(segment.churn_rate * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="border-t border-outline-variant pt-3">
                  <p className="text-xs text-on-surface-variant mb-2">Avg Order Value</p>
                  <p className="font-semibold text-on-surface mb-3">
                    ${(segment.avg_order_value / 1000).toFixed(1)}K
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-surface-container text-on-surface-variant">
                      {segment.criteria}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant mt-3">
                  Updated {new Date(segment.last_updated).toLocaleDateString()}
                </p>
              </Card>
            ))
          )}
        </div>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">📊 Segmentation Best Practices</h3>
          <div className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex gap-3">
              <span>•</span>
              <span>Use RFM Analysis: Recency, Frequency, Monetary value</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Track Lifetime Value to identify high-value segments</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Monitor Churn Rate to focus retention efforts</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Update segments regularly as customer behavior changes</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
