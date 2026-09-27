import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface AuditLog {
  id: string;
  user_name: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  changes: Record<string, any>;
  ip_address: string;
  status: 'success' | 'failed';
  timestamp: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.action === filter || log.status === filter;
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-accent-container text-on-surface';
      case 'update':
        return 'bg-primary-container text-on-surface';
      case 'delete':
        return 'bg-error-container text-on-surface';
      case 'view':
        return 'bg-secondary-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'success' ? '✓' : '✕';
  };

  if (isLoading) {
    return (
      <MainLayout title="Audit Logs">
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton height={20} width="100%" className="mb-2" />
              <Skeleton height={16} width="80%" />
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Audit Logs">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <Card className="p-6">
          <h1 className="text-2xl font-bold text-on-surface mb-6">Audit Logs</h1>

          <div className="space-y-4 mb-6">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user, email, or description..."
            />

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('create')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === 'create'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                Create
              </button>
              <button
                onClick={() => setFilter('update')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === 'update'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                Update
              </button>
              <button
                onClick={() => setFilter('delete')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === 'delete'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                Delete
              </button>
              <button
                onClick={() => setFilter('success')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === 'success'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                Success
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === 'failed'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                Failed
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Action</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Entity</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Description</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">IP Address</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-on-surface">{log.user_name}</p>
                          <p className="text-xs text-on-surface-variant">{log.user_email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-on-surface">{log.entity_type}</p>
                          <p className="text-xs text-on-surface-variant">{log.entity_id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-on-surface text-sm">
                        {log.description}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-lg ${log.status === 'success' ? 'text-accent-600' : 'text-error-600'}`}>
                          {getStatusIcon(log.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant text-sm font-mono">
                        {log.ip_address}
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant text-sm">
                        {new Date(log.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
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
