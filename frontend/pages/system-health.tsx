import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

interface SystemStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'offline';
  uptime: number;
  response_time: number;
  last_check: string;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  database_connections: number;
  redis_connections: number;
  api_requests_per_minute: number;
  error_rate: number;
}

export default function SystemHealthPage() {
  const [services, setServices] = useState<SystemStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const [servicesRes, metricsRes] = await Promise.all([
        fetch('/api/system/services', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/system/metrics', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.data || []);
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system health');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-accent-container text-on-surface';
      case 'degraded':
        return 'bg-error-container text-on-surface';
      case 'offline':
        return 'bg-error-container text-error';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const getMetricColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage > 80) return 'text-error-600';
    if (percentage > 60) return 'text-warning-600';
    return 'text-accent-600';
  };

  if (isLoading) {
    return (
      <MainLayout title="System Health">
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

  const healthyCount = services.filter(s => s.status === 'healthy').length;

  return (
    <MainLayout title="System Health">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">System Health</h1>
          <span className="text-sm text-on-surface-variant">Auto-refresh every 30s</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">System Status</p>
            <p className="text-3xl font-bold text-accent-600">{healthyCount}/{services.length}</p>
            <p className="text-xs text-on-surface-variant mt-2">Services Healthy</p>
          </Card>
          {metrics && (
            <>
              <Card className="p-6">
                <p className="text-sm text-on-surface-variant mb-2">CPU Usage</p>
                <p className={`text-3xl font-bold ${getMetricColor(metrics.cpu_usage, 100)}`}>
                  {metrics.cpu_usage.toFixed(1)}%
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-on-surface-variant mb-2">Memory Usage</p>
                <p className={`text-3xl font-bold ${getMetricColor(metrics.memory_usage, 100)}`}>
                  {metrics.memory_usage.toFixed(1)}%
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-on-surface-variant mb-2">Error Rate</p>
                <p className={`text-3xl font-bold ${getMetricColor(metrics.error_rate, 10)}`}>
                  {metrics.error_rate.toFixed(2)}%
                </p>
              </Card>
            </>
          )}
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Service Status</h3>
          <div className="space-y-3">
            {services.map(service => (
              <div key={service.service} className="flex items-center justify-between p-4 border border-outline-variant rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-on-surface">{service.service}</h4>
                  <p className="text-xs text-on-surface-variant">
                    Response: {service.response_time}ms | Uptime: {service.uptime}%
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {metrics && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-6">System Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-on-surface">Database Connections</span>
                    <span className="text-sm text-on-surface-variant">{metrics.database_connections}</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full">
                    <div
                      className="h-2 bg-primary-600 rounded-full"
                      style={{ width: `${Math.min((metrics.database_connections / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-on-surface">Redis Connections</span>
                    <span className="text-sm text-on-surface-variant">{metrics.redis_connections}</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full">
                    <div
                      className="h-2 bg-secondary-600 rounded-full"
                      style={{ width: `${Math.min((metrics.redis_connections / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-on-surface">Disk Usage</span>
                    <span className="text-sm text-on-surface-variant">{metrics.disk_usage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full">
                    <div
                      className="h-2 bg-tertiary-600 rounded-full"
                      style={{ width: `${metrics.disk_usage}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-on-surface mb-2">API Requests/min</p>
                  <p className="text-3xl font-bold text-primary-600">{metrics.api_requests_per_minute}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface mb-2">Error Rate</p>
                  <p className="text-3xl font-bold text-error-600">{metrics.error_rate.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
