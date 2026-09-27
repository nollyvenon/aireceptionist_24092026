import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'inactive';
  steps_count: number;
  executions_count: number;
  last_modified: string;
  created_at: string;
}

export default function EditWorkflowPage() {
  const router = useRouter();
  const { id } = router.query;
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Workflow>>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchWorkflow();
    }
  }, [id]);

  const fetchWorkflow = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/automation/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkflow(data);
        setEditData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/automation/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Failed to save');

      const updated = await response.json();
      setWorkflow(updated);
      setIsEditing(false);
      setSuccess('Workflow updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/automation/${id}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to publish');

      setSuccess('Workflow published successfully');
      fetchWorkflow();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    }
  };

  const handleDeactivate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/automation/${id}/deactivate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to deactivate');

      setSuccess('Workflow deactivated');
      fetchWorkflow();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <MainLayout title="Edit Workflow">
        <div className="space-y-6">
          <Card className="p-8">
            <Skeleton height={32} width="40%" className="mb-4" />
            <Skeleton height={20} width="60%" className="mb-2" />
            <Skeleton height={20} width="50%" />
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!workflow) {
    return (
      <MainLayout title="Workflow Not Found">
        <Card className="p-8 text-center">
          <p className="text-on-surface-variant mb-4">Workflow not found</p>
          <Button variant="primary" onClick={() => router.push('/automation')}>
            Back to Workflows
          </Button>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Edit Workflow: ${workflow.name}`}>
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              workflow.status === 'active'
                ? 'bg-accent-container text-on-surface'
                : workflow.status === 'draft'
                ? 'bg-primary-container text-on-surface'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              {workflow.status}
            </span>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Steps</p>
            <p className="text-3xl font-bold text-on-surface">{workflow.steps_count}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Executions</p>
            <p className="text-3xl font-bold text-primary-600">{workflow.executions_count}</p>
          </Card>
        </div>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Workflow Details</h2>
            <div className="flex gap-2">
              {workflow.status === 'draft' && (
                <Button
                  variant="primary"
                  onClick={handlePublish}
                >
                  Publish
                </Button>
              )}
              {workflow.status === 'active' && (
                <Button
                  variant="secondary"
                  onClick={handleDeactivate}
                >
                  Deactivate
                </Button>
              )}
              <Button
                variant={isEditing ? 'secondary' : 'primary'}
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
                disabled={isSaving}
              >
                {isEditing ? (isSaving ? 'Saving...' : 'Save') : 'Edit'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Name
              </label>
              {isEditing ? (
                <Input
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{workflow.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Created
              </label>
              <p className="text-on-surface">{formatDate(workflow.created_at)}</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface resize-none"
                  rows={3}
                />
              ) : (
                <p className="text-on-surface">{workflow.description || '-'}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-xl font-semibold text-on-surface mb-6">Workflow Steps</h3>
          <p className="text-on-surface-variant mb-4">
            This workflow has {workflow.steps_count} steps configured.
          </p>
          <Button variant="secondary">
            Edit Steps in Builder
          </Button>
        </Card>

        <Card className="p-8">
          <h3 className="text-xl font-semibold text-on-surface mb-6">Execution History</h3>
          <p className="text-on-surface-variant">
            Total executions: {workflow.executions_count}
          </p>
          <p className="text-on-surface-variant mb-4">
            Last modified: {formatDate(workflow.last_modified)}
          </p>
          <Button variant="secondary">
            View Execution History
          </Button>
        </Card>
      </div>
    </MainLayout>
  );
}
