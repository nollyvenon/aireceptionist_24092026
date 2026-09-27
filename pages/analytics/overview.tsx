import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

interface MetricData {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/metrics?range=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch metrics');

      const data = await response.json();
      setMetrics(data.metrics || getDefaultMetrics());
    } catch (err) {
      setMetrics(getDefaultMetrics());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultMetrics = (): MetricData[] => [
    { title: 'Total Appointments', value: '324', change: 12, trend: 'up' },
    { title: 'Completed Rate', value: '94.2%', change: 3, trend: 'up' },
    { title: 'Revenue', value: '$12,450', change: 8, trend: 'up' },
    { title: 'Avg Response Time', value: '2.3min', change: -5, trend: 'down' },
    { title: 'Customer Satisfaction', value: '4.8/5', change: 2, trend: 'up' },
    { title: 'Active Customers', value: '156', change: 7, trend: 'up' },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-accent-600';
    if (trend === 'down') return 'text-error';
    return 'text-on-surface-variant';
  };

  return (
    <MainLayout title="Analytics">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton height={20} className="mb-4" />
                <Skeleton height={32} width="60%" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-sm font-medium text-on-surface-variant mb-2">
                  {metric.title}
                </h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-on-surface">{metric.value}</p>
                  </div>
                  <div className={`text-right ${getTrendColor(metric.trend)}`}>
                    <span className="text-2xl">{getTrendIcon(metric.trend)}</span>
                    <p className="text-sm font-medium">{Math.abs(metric.change)}%</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-on-surface mb-4">Appointments by Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-on-surface-variant">Scheduled</span>
                  <span className="font-medium text-on-surface">145</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-on-surface-variant">Completed</span>
                  <span className="font-medium text-on-surface">165</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2">
                  <div className="bg-accent-600 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-on-surface-variant">Cancelled</span>
                  <span className="font-medium text-on-surface">14</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2">
                  <div className="bg-error h-2 rounded-full" style={{ width: '6%' }} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-on-surface mb-4">Revenue Trend</h3>
            <div className="space-y-2 text-on-surface-variant text-sm">
              <p>Week 1: $2,100</p>
              <p>Week 2: $2,450</p>
              <p>Week 3: $2,800</p>
              <p>Week 4: $3,200</p>
              <p className="text-accent-600 font-medium pt-2">Total: $10,550</p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
