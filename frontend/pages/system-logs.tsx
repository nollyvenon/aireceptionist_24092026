import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Log {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  service: string;
  message: string;
  details?: string;
  user_id?: string;
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [service, setService] = useState('all');

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/system-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filter === 'all' || log.level === filter;
    const matchesService = service === 'all' || log.service === service;
    return matchesSearch && matchesLevel && matchesService;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug':
        return 'bg-surface-container text-on-surface-variant';
      case 'info':
        return 'bg-primary-container text-on-surface';
      case 'warning':
        return 'bg-error-container text-on-surface';
      case 'error':
        return 'bg-error-container text-error';
      case 'critical':
        return 'bg-error-600 text-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'debug': return '🐛';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'critical': return '🚨';
      default: return '📋';
    }
  };

  const services = ['all', ...new Set(logs.map(l => l.service))];
  const levels = ['all', 'debug', 'info', 'warning', 'error', 'critical'];

  if (isLoading) {
    return (
      <MainLayout title="System Logs">
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
    errors: logs.filter(l => l.level === 'error' || l.level === 'critical').length,
    warnings: logs.filter(l => l.level === 'warning').length,
  };

  return (
    <MainLayout title="System Logs">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">System Logs</h1>
          <span className="text-sm text-on-surface-variant">Auto-refresh every 30s</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Logs</p>
            <p className="text-3xl font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Errors</p>
            <p className="text-3xl font-bold text-error-600">{stats.errors}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Warnings</p>
            <p className="text-3xl font-bold text-warning-600">{stats.warnings}</p>
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
              {levels.map(level => (
                <option key={level} value={level} className="capitalize">
                  {level === 'all' ? 'All Levels' : level}
                </option>
              ))}
            </select>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
            >
              {services.map(svc => (
                <option key={svc} value={svc}>
                  {svc === 'all' ? 'All Services' : svc}
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
                        <span className="text-lg mt-1">{getLevelIcon(log.level)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${getLevelColor(log.level)}`}>
                              {log.level}
                            </span>
                            <span className="text-xs font-medium text-on-surface-variant">{log.service}</span>
                          </div>
                          <p className="text-sm text-on-surface mt-1">{log.message}</p>
                        </div>
                      </div>
                      <span className="text-xs text-on-surface-variant whitespace-nowrap ml-2">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {log.details && (
                      <div className="ml-8 mt-2 p-2 bg-surface-container-high rounded text-xs text-on-surface-variant font-mono">
                        {log.details}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">📊 Log Levels</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            {[
              { level: 'debug', desc: 'Verbose debugging info' },
              { level: 'info', desc: 'General information' },
              { level: 'warning', desc: 'Warning conditions' },
              { level: 'error', desc: 'Error conditions' },
              { level: 'critical', desc: 'Critical failures' },
            ].map(item => (
              <div key={item.level} className="text-center">
                <p className="text-2xl mb-1">{getLevelIcon(item.level)}</p>
                <p className="font-medium text-on-surface capitalize">{item.level}</p>
                <p className="text-xs text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
