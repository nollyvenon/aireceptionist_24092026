import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

interface AIMetrics {
  total_calls: number;
  total_messages: number;
  average_call_duration: number;
  call_success_rate: number;
  transcription_accuracy: number;
  average_handling_time: number;
}

interface CallMetric {
  date: string;
  incoming_calls: number;
  outgoing_calls: number;
  completed_calls: number;
  failed_calls: number;
  average_duration: number;
}

interface ConversationMetric {
  date: string;
  sms_sent: number;
  sms_received: number;
  email_sent: number;
  email_received: number;
  whatsapp_messages: number;
}

interface AIPerformance {
  task: string;
  success_rate: number;
  average_time: number;
  total_handled: number;
}

export default function AIAnalyticsPage() {
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [callMetrics, setCallMetrics] = useState<CallMetric[]>([]);
  const [conversationMetrics, setConversationMetrics] = useState<ConversationMetric[]>([]);
  const [performance, setPerformance] = useState<AIPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [metricsRes, callRes, conversationRes, performanceRes] = await Promise.all([
        fetch('/api/analytics/ai', { headers }),
        fetch('/api/analytics/ai/calls', { headers }),
        fetch('/api/analytics/ai/conversations', { headers }),
        fetch('/api/analytics/ai/performance', { headers }),
      ]);

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }

      if (callRes.ok) {
        const data = await callRes.json();
        setCallMetrics(data.data || []);
      }

      if (conversationRes.ok) {
        const data = await conversationRes.json();
        setConversationMetrics(data.data || []);
      }

      if (performanceRes.ok) {
        const data = await performanceRes.json();
        setPerformance(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="AI Analytics">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
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

  const maxCallDay = Math.max(...callMetrics.map(c => c.incoming_calls + c.outgoing_calls), 0) || 1;
  const maxMessages = Math.max(
    ...conversationMetrics.map(c => c.sms_sent + c.email_sent + c.whatsapp_messages),
    0
  ) || 1;

  return (
    <MainLayout title="AI Analytics">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Calls</p>
            <p className="text-3xl font-bold text-on-surface">{metrics?.total_calls || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Messages</p>
            <p className="text-3xl font-bold text-accent-600">{metrics?.total_messages || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Call Success Rate</p>
            <p className="text-3xl font-bold text-secondary-600">
              {Math.round((metrics?.call_success_rate || 0) * 100)}%
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Call Duration</p>
            <p className="text-3xl font-bold text-primary-600">
              {metrics?.average_call_duration || 0}s
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Handling Time</p>
            <p className="text-3xl font-bold text-on-surface">
              {metrics?.average_handling_time || 0}s
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Transcription Accuracy</p>
            <p className="text-3xl font-bold text-accent-600">
              {Math.round((metrics?.transcription_accuracy || 0) * 100)}%
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Call Activity (Last 30 Days)</h3>
          <div className="space-y-3">
            {callMetrics.length === 0 ? (
              <p className="text-on-surface-variant">No data available</p>
            ) : (
              callMetrics.map((day) => (
                <div key={day.date}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-on-surface">{day.date}</span>
                    <span className="text-sm text-on-surface-variant">
                      {day.incoming_calls + day.outgoing_calls} calls • {day.completed_calls} completed • {day.failed_calls} failed
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${((day.incoming_calls + day.outgoing_calls) / maxCallDay) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Message Activity (Last 30 Days)</h3>
          <div className="space-y-3">
            {conversationMetrics.length === 0 ? (
              <p className="text-on-surface-variant">No data available</p>
            ) : (
              conversationMetrics.map((day) => {
                const totalMessages = day.sms_sent + day.email_sent + day.whatsapp_messages;
                return (
                  <div key={day.date}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-on-surface">{day.date}</span>
                      <span className="text-sm text-on-surface-variant">
                        {day.sms_sent} SMS • {day.email_sent} Email • {day.whatsapp_messages} WhatsApp
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2">
                      <div
                        className="bg-secondary-600 h-2 rounded-full"
                        style={{ width: `${(totalMessages / maxMessages) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">AI Task Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Task</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Total Handled</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Success Rate</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((task) => (
                  <tr key={task.task} className="border-b border-outline-variant hover:bg-surface-container">
                    <td className="py-3 px-4 font-medium text-on-surface">{task.task}</td>
                    <td className="py-3 px-4 text-center text-on-surface">{task.total_handled}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.success_rate >= 95
                          ? 'bg-accent-container text-on-surface'
                          : task.success_rate >= 80
                          ? 'bg-primary-container text-on-surface'
                          : 'bg-error-container text-on-surface'
                      }`}>
                        {Math.round(task.success_rate)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-on-surface-variant">
                      {task.average_time}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
