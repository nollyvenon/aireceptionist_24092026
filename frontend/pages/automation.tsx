import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  trigger_type: string;
  action_count: number;
  created_at: string;
  last_modified: string;
  executions_count: number;
}

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/automation', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }

      const data = await response.json();
      setWorkflows(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch = `${workflow.name} ${workflow.description || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'all' || workflow.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-accent-container text-on-surface',
      inactive: 'bg-surface-container-high text-on-surface-variant',
      draft: 'bg-primary-container text-on-surface',
    };
    return colors[status] || 'bg-surface-container text-on-surface';
  };

  if (isLoading) {
    return (
      <MainLayout title="Automation">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <Skeleton height={20} />
                <Skeleton height={16} width="80%" />
              </div>
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Workflow Automation">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Workflows</p>
            <p className="text-3xl font-bold text-on-surface">{workflows.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Active</p>
            <p className="text-3xl font-bold text-accent-600">
              {workflows.filter(w => w.status === 'active').length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Executions</p>
            <p className="text-3xl font-bold text-primary-600">
              {workflows.reduce((sum, w) => sum + w.executions_count, 0)}
            </p>
          </Card>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            <Input
              placeholder="Search workflows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <Link href="/automation/builder">
            <Button variant="primary">
              Create Workflow
            </Button>
          </Link>
        </div>

        {error && (
          <Card className="p-4 bg-error-container text-error border-error">
            {error}
          </Card>
        )}

        {filteredWorkflows.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-on-surface-variant mb-4">No workflows found</p>
            <Link href="/automation/builder">
              <Button variant="primary">Create First Workflow</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/automation/${workflow.id}/edit`}>
                      <h3 className="text-lg font-semibold text-primary-600 cursor-pointer hover:underline mb-1">
                        {workflow.name}
                      </h3>
                    </Link>
                    {workflow.description && (
                      <p className="text-on-surface-variant mb-3">{workflow.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                      <span>Trigger: {workflow.trigger_type}</span>
                      <span>•</span>
                      <span>{workflow.action_count} actions</span>
                      <span>•</span>
                      <span>{workflow.executions_count} executions</span>
                      <span>•</span>
                      <span>Modified {formatDate(workflow.last_modified)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                    <Link href={`/automation/${workflow.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
