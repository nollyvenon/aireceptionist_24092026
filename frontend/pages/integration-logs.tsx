import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface IntegrationLog {
  id: string;
  integration: string;
  event_type: string;
  status: 'success' | 'failure' | 'retry';
  timestamp: string;
  request_size: number;
  response_time: number;
  error_message?: string;
  request_body?: string;
}

export default function IntegrationLogsPage() {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [integration, setIntegration] = useState('all');

  useEffect(() => {
    fetchIntegrationLogs();
    const interval = setInterval(fetchIntegrationLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchIntegrationLogs = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/integration-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integration logs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.integration.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.event_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filter === 'all' || log.status === filter;
    const matchesIntegration = integration === 'all' || log.integration === integration;
    return matchesSearch && matchesStatus && matchesIntegration;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-accent-container text-on-surface';
      case 'failure':
        return 'bg-error-container text-error';
      case 'retry':
        return 'bg-error-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✓';
      case 'failure': return '✗';
      case 'retry': return '🔄';
      default: return '•';
    }
  };

  const integrations = ['all', ...new Set(logs.map(l => l.integration))];
  const statuses = ['all', 'success', 'failure', 'retry'];

  if (isLoading) {
    return (
      <MainLayout title="Integration Logs">
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

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    failures: logs.filter(l => l.status === 'failure').length,
    avgTime: logs.length > 0
      ? (logs.reduce((sum, l) => sum + l.response_time, 0) / logs.length).toFixed(0)
      : 0,
  };

  return (
    <MainLayout title="Integration Logs">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Integration Logs</h1>
          <span className="text-sm text-on-surface-variant">Auto-refresh every 30s</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Events</p>
            <p className="text-3xl font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Successful</p>
            <p className="text-3xl font-bold text-accent-600">{stats.success}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Failed</p>
            <p className="text-3xl font-bold text-error-600">{stats.failures}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Response</p>
            <p className="text-3xl font-bold text-primary-600">{stats.avgTime}ms</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
            >
              {statuses.map(status => (
                <option key={status} value={status} className="capitalize">
                  {status === 'all' ? 'All Status' : status}
                </option>
              ))}
            </select>
            <select
              value={integration}
              onChange={(e) => setIntegration(e.target.value)}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
            >
              {integrations.map(intg => (
                <option key={intg} value={intg}>
                  {intg === 'all' ? 'All Integrations' : intg}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {filteredLogs.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No logs found</p>
            ) : (
              filteredLogs
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map(log => (
                  <div key={log.id} className="border border-outline-variant rounded-lg p-3 hover:bg-surface-container transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)} {log.status}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-on-surface">{log.integration}</h4>
                          <p className="text-xs text-on-surface-variant">{log.event_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-on-surface-variant">{log.response_time}ms</p>
                        <p className="text-xs text-on-surface-variant">{(log.request_size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>

                    <div className="text-xs text-on-surface-variant">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>

                    {log.error_message && (
                      <div className="mt-2 p-2 bg-error-container/20 rounded text-xs text-error">
                        {log.error_message}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">ℹ️ Integration Logging</h3>
          <div className="space-y-2 text-sm text-on-surface-variant">
            <p>• All integration calls are logged with full request/response details</p>
            <p>• Logs are retained for 90 days for debugging and compliance</p>
            <p>• Response times help identify performance issues</p>
            <p>• Failed requests show error details for troubleshooting</p>
            <p>• Webhook delivery status is tracked in real-time</p>
            <p>• Use logs to debug integration issues and monitor health</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
