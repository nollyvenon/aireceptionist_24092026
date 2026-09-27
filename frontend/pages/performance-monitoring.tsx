import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

interface PerformanceMetric {
  name: string;
  response_time: number;
  error_rate: number;
  success_rate: number;
  p95: number;
  p99: number;
  samples: number;
}

interface DatabaseMetric {
  query: string;
  avg_time: number;
  max_time: number;
  executions: number;
  slow_query_count: number;
}

export default function PerformanceMonitoringPage() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [dbMetrics, setDbMetrics] = useState<DatabaseMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPerformanceMetrics();
    const interval = setInterval(fetchPerformanceMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPerformanceMetrics = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const [metricsRes, dbRes] = await Promise.all([
        fetch('/api/performance/metrics', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/performance/database', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.data || []);
      }

      if (dbRes.ok) {
        const data = await dbRes.json();
        setDbMetrics(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthColor = (responseTime: number) => {
    if (responseTime < 100) return 'text-accent-600';
    if (responseTime < 500) return 'text-warning-600';
    return 'text-error-600';
  };

  const getHealthBg = (responseTime: number) => {
    if (responseTime < 100) return 'bg-accent-container';
    if (responseTime < 500) return 'bg-error-container';
    return 'bg-error-600';
  };

  if (isLoading) {
    return (
      <MainLayout title="Performance Monitoring">
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

  const avgResponseTime = metrics.length > 0
    ? (metrics.reduce((sum, m) => sum + m.response_time, 0) / metrics.length).toFixed(0)
    : 0;

  const avgSuccessRate = metrics.length > 0
    ? (metrics.reduce((sum, m) => sum + m.success_rate, 0) / metrics.length).toFixed(2)
    : 0;

  return (
    <MainLayout title="Performance Monitoring">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Performance Monitoring</h1>
          <span className="text-sm text-on-surface-variant">Auto-refresh every 60s</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Response Time</p>
            <p className={`text-3xl font-bold ${getHealthColor(Number(avgResponseTime))}`}>
              {avgResponseTime}ms
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Success Rate</p>
            <p className="text-3xl font-bold text-accent-600">{avgSuccessRate}%</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Samples</p>
            <p className="text-3xl font-bold text-on-surface">
              {metrics.reduce((sum, m) => sum + m.samples, 0).toLocaleString()}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Endpoint Performance</h3>
          <div className="space-y-4">
            {metrics.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No performance data</p>
            ) : (
              metrics.map(metric => (
                <div key={metric.name} className="border border-outline-variant rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-on-surface">{metric.name}</h4>
                    <div className={`px-3 py-1 rounded text-xs font-medium ${getHealthBg(metric.response_time)} text-on-surface`}>
                      {metric.response_time}ms
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-on-surface-variant text-xs mb-1">P95</p>
                      <p className="font-semibold text-on-surface">{metric.p95}ms</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-xs mb-1">P99</p>
                      <p className="font-semibold text-on-surface">{metric.p99}ms</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-xs mb-1">Success</p>
                      <p className="font-semibold text-accent-600">{metric.success_rate}%</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-xs mb-1">Samples</p>
                      <p className="font-semibold text-on-surface">{metric.samples.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full"
                        style={{ width: `${metric.success_rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Database Queries</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-2 font-semibold text-on-surface">Query</th>
                  <th className="text-center py-3 px-2 font-semibold text-on-surface">Avg Time</th>
                  <th className="text-center py-3 px-2 font-semibold text-on-surface">Max Time</th>
                  <th className="text-center py-3 px-2 font-semibold text-on-surface">Executions</th>
                  <th className="text-center py-3 px-2 font-semibold text-on-surface">Slow Queries</th>
                </tr>
              </thead>
              <tbody>
                {dbMetrics.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                      No query metrics
                    </td>
                  </tr>
                ) : (
                  dbMetrics.map((metric, i) => (
                    <tr key={i} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-2 text-on-surface-variant truncate">{metric.query}</td>
                      <td className="py-3 px-2 text-center text-on-surface-variant">{metric.avg_time}ms</td>
                      <td className="py-3 px-2 text-center text-on-surface-variant">{metric.max_time}ms</td>
                      <td className="py-3 px-2 text-center text-on-surface-variant">{metric.executions.toLocaleString()}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={metric.slow_query_count > 0 ? 'text-error-600 font-semibold' : 'text-on-surface-variant'}>
                          {metric.slow_query_count}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
