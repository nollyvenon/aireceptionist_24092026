import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

interface AutomationMetrics {
  total_workflows: number;
  active_workflows: number;
  total_executions: number;
  success_rate: number;
  average_execution_time: number;
  failed_executions: number;
}

interface WorkflowMetric {
  workflow_id: string;
  workflow_name: string;
  executions_count: number;
  success_count: number;
  failed_count: number;
  average_time: number;
  last_execution: string;
}

interface ExecutionTrend {
  date: string;
  executions: number;
  successful: number;
  failed: number;
}

export default function AutomationAnalyticsPage() {
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [workflowMetrics, setWorkflowMetrics] = useState<WorkflowMetric[]>([]);
  const [trends, setTrends] = useState<ExecutionTrend[]>([]);
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

      const [metricsRes, workflowRes, trendsRes] = await Promise.all([
        fetch('/api/automation/analytics', { headers }),
        fetch('/api/automation/analytics/workflows', { headers }),
        fetch('/api/automation/analytics/trends', { headers }),
      ]);

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }

      if (workflowRes.ok) {
        const data = await workflowRes.json();
        setWorkflowMetrics(data.data || []);
      }

      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setTrends(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Automation Analytics">
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

  const maxTrend = Math.max(...trends.map(t => t.executions), 0) || 1;

  return (
    <MainLayout title="Automation Analytics">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Workflows</p>
            <p className="text-3xl font-bold text-on-surface">{metrics?.total_workflows || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Active</p>
            <p className="text-3xl font-bold text-accent-600">{metrics?.active_workflows || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Executions</p>
            <p className="text-3xl font-bold text-primary-600">{metrics?.total_executions || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Success Rate</p>
            <p className="text-3xl font-bold text-secondary-600">
              {Math.round((metrics?.success_rate || 0) * 100)}%
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Execution Time</p>
            <p className="text-3xl font-bold text-on-surface">
              {metrics?.average_execution_time || 0}ms
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Failed Executions</p>
            <p className="text-3xl font-bold text-error-600">{metrics?.failed_executions || 0}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Execution Trend (Last 30 Days)</h3>
          <div className="space-y-3">
            {trends.length === 0 ? (
              <p className="text-on-surface-variant">No data available</p>
            ) : (
              trends.map((day) => (
                <div key={day.date}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-on-surface">{day.date}</span>
                    <span className="text-sm text-on-surface-variant">
                      {day.executions} total • {day.successful} success • {day.failed} failed
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(day.executions / maxTrend) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Workflow Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Workflow</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Executions</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Success</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Failed</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Avg Time</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Success Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Last Execution</th>
                </tr>
              </thead>
              <tbody>
                {workflowMetrics.map((workflow) => {
                  const successRate = workflow.executions_count > 0
                    ? (workflow.success_count / workflow.executions_count) * 100
                    : 0;
                  return (
                    <tr key={workflow.workflow_id} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-4 font-medium text-on-surface">{workflow.workflow_name}</td>
                      <td className="py-3 px-4 text-center text-on-surface">{workflow.executions_count}</td>
                      <td className="py-3 px-4 text-center text-accent-600 font-semibold">
                        {workflow.success_count}
                      </td>
                      <td className="py-3 px-4 text-center text-error-600">{workflow.failed_count}</td>
                      <td className="py-3 px-4 text-center text-on-surface">{workflow.average_time}ms</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          successRate >= 95
                            ? 'bg-accent-container text-on-surface'
                            : successRate >= 80
                            ? 'bg-primary-container text-on-surface'
                            : 'bg-error-container text-on-surface'
                        }`}>
                          {Math.round(successRate)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant text-sm">
                        {new Date(workflow.last_execution).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
