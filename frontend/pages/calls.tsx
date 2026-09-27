import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

interface CallLog {
  id: string;
  caller_name: string;
  caller_number: string;
  direction: 'inbound' | 'outbound';
  status: 'completed' | 'missed' | 'failed' | 'voicemail';
  duration: number;
  recording_url?: string;
  transcript?: string;
  started_at: string;
  handled_by: string;
}

interface CallSummary {
  total_calls: number;
  completed_calls: number;
  missed_calls: number;
  failed_calls: number;
  average_duration: number;
}

export default function CallLogsPage() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [summary, setSummary] = useState<CallSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCallLogs();
  }, []);

  const fetchCallLogs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [logsRes, summaryRes] = await Promise.all([
        fetch('/api/calls/logs', { headers }),
        fetch('/api/calls/summary', { headers }),
      ]);

      if (logsRes.ok) {
        const data = await logsRes.json();
        setCallLogs(data.data || []);
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load call logs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCalls = filter === 'all'
    ? callLogs
    : callLogs.filter(call => call.status === filter || call.direction === filter);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent-container text-on-surface';
      case 'missed':
        return 'bg-error-container text-on-surface';
      case 'failed':
        return 'bg-error-container text-on-surface';
      case 'voicemail':
        return 'bg-primary-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Call Logs">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton height={20} width="60%" className="mb-4" />
                <Skeleton height={32} width="80%" />
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Call Logs">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Calls</p>
            <p className="text-3xl font-bold text-on-surface">{summary?.total_calls || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Completed</p>
            <p className="text-3xl font-bold text-accent-600">{summary?.completed_calls || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Missed</p>
            <p className="text-3xl font-bold text-error-600">{summary?.missed_calls || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Duration</p>
            <p className="text-3xl font-bold text-primary-600">
              {formatDuration(summary?.average_duration || 0)}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Call History</h3>
            <div className="flex gap-2">
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
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'completed'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('missed')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'missed'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                Missed
              </button>
              <button
                onClick={() => setFilter('voicemail')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'voicemail'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                Voicemail
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Caller</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Number</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Direction</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Duration</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Handled By</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Time</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalls.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                      No calls found
                    </td>
                  </tr>
                ) : (
                  filteredCalls.map((call) => (
                    <tr key={call.id} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-4 font-medium text-on-surface">
                        {call.caller_name}
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant font-mono">
                        {call.caller_number}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs font-medium capitalize px-2 py-1 rounded bg-surface-container">
                          {call.direction}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getStatusColor(call.status)}`}>
                          {call.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface">
                        {formatDuration(call.duration)}
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface-variant text-sm">
                        {call.handled_by}
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant text-sm">
                        {new Date(call.started_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-1 justify-center">
                          {call.recording_url && (
                            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                              🔊
                            </button>
                          )}
                          {call.transcript && (
                            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                              📄
                            </button>
                          )}
                        </div>
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
