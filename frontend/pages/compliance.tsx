import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface ComplianceTask {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  assigned_to: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceMetrics {
  compliance_score: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  last_audit: string;
}

export default function CompliancePage() {
  const [tasks, setTasks] = useState<ComplianceTask[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [tasksRes, metricsRes] = await Promise.all([
        fetch('/api/compliance/tasks', { headers }),
        fetch('/api/compliance/metrics', { headers }),
      ]);

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.data || []);
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load compliance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/compliance/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: status as any } : t));
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-error-container text-error';
      case 'high':
        return 'bg-error-container text-on-surface';
      case 'medium':
        return 'bg-primary-container text-on-surface';
      case 'low':
        return 'bg-surface-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent-container text-on-surface';
      case 'in_progress':
        return 'bg-primary-container text-on-surface';
      case 'pending':
        return 'bg-surface-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const filteredTasks = tasks.filter(t =>
    filter === 'all' || t.status === filter
  );

  if (isLoading) {
    return (
      <MainLayout title="Compliance & GDPR">
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
    <MainLayout title="Compliance & GDPR">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Compliance Score</p>
            <p className="text-3xl font-bold text-accent-600">
              {metrics?.compliance_score || 0}%
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Tasks</p>
            <p className="text-3xl font-bold text-on-surface">
              {metrics?.total_tasks || 0}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Completed</p>
            <p className="text-3xl font-bold text-secondary-600">
              {metrics?.completed_tasks || 0}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Overdue</p>
            <p className="text-3xl font-bold text-error-600">
              {metrics?.overdue_tasks || 0}
            </p>
          </Card>
        </div>

        {metrics?.compliance_score && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Compliance Status</h3>
            <div className="w-full bg-surface-container-high rounded-full h-4 mb-2">
              <div
                className={`h-4 rounded-full ${
                  (metrics.compliance_score || 0) >= 80
                    ? 'bg-accent-600'
                    : (metrics.compliance_score || 0) >= 60
                    ? 'bg-secondary-600'
                    : 'bg-error-600'
                }`}
                style={{ width: `${metrics.compliance_score}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-on-surface-variant">
              <span>{metrics.completed_tasks} of {metrics.total_tasks} tasks completed</span>
              <span>Last audit: {new Date(metrics.last_audit).toLocaleDateString()}</span>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Compliance Tasks</h3>
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
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'pending'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('in_progress')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'in_progress'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                In Progress
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Task</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Category</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Priority</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Due Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Assigned To</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => (
                    <tr key={task.id} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-on-surface">{task.name}</p>
                          <p className="text-xs text-on-surface-variant">{task.description}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant text-sm">
                        {task.category}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface-variant text-sm">
                        {new Date(task.due_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant text-sm">
                        {task.assigned_to}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded border border-outline-variant bg-surface-container-lowest text-on-surface"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">📋 GDPR Compliance Guidelines</h3>
          <div className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex gap-3">
              <span>✓</span>
              <span>Data Protection: Ensure all customer data is encrypted and secure</span>
            </div>
            <div className="flex gap-3">
              <span>✓</span>
              <span>Privacy Notices: Display privacy policies and consent forms</span>
            </div>
            <div className="flex gap-3">
              <span>✓</span>
              <span>Data Retention: Implement proper data retention and deletion policies</span>
            </div>
            <div className="flex gap-3">
              <span>✓</span>
              <span>Access Rights: Provide data export and deletion features</span>
            </div>
            <div className="flex gap-3">
              <span>✓</span>
              <span>Incident Response: Maintain audit logs and incident procedures</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
