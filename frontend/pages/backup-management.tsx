import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface Backup {
  id: string;
  name: string;
  type: 'automatic' | 'manual' | 'scheduled';
  size_mb: number;
  database_records: number;
  created_at: string;
  status: 'completed' | 'in_progress' | 'failed';
  retention_days: number;
}

export default function BackupManagementPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingBackup, setCreatingBackup] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/backups', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBackups(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load backups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/backups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'manual' }),
      });

      if (response.ok) {
        fetchBackups();
      } else {
        setError('Failed to create backup');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create backup');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('This will restore the database to this backup. Continue?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/backups/${backupId}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert('Backup restoration started');
        fetchBackups();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore backup');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent-container text-on-surface';
      case 'in_progress':
        return 'bg-primary-container text-on-surface';
      case 'failed':
        return 'bg-error-container text-error';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Backup Management">
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
    total: backups.length,
    completed: backups.filter(b => b.status === 'completed').length,
    totalSize: backups.reduce((sum, b) => sum + b.size_mb, 0),
    totalRecords: backups.reduce((sum, b) => sum + b.database_records, 0),
  };

  return (
    <MainLayout title="Backup Management">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Backup Management</h1>
          <Button
            variant="primary"
            onClick={handleCreateBackup}
            disabled={creatingBackup}
          >
            {creatingBackup ? '⏳ Creating...' : '+ Create Backup'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Backups</p>
            <p className="text-3xl font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Successful</p>
            <p className="text-3xl font-bold text-accent-600">{stats.completed}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Size</p>
            <p className="text-3xl font-bold text-primary-600">{(stats.totalSize / 1024).toFixed(1)} GB</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Records</p>
            <p className="text-3xl font-bold text-secondary-600">{stats.totalRecords.toLocaleString()}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Backup History</h3>
          <div className="space-y-3">
            {backups.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No backups found</p>
            ) : (
              backups
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(backup => (
                  <div key={backup.id} className="border border-outline-variant rounded-lg p-4 hover:bg-surface-container transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-on-surface">{backup.name}</h4>
                        <div className="flex gap-3 mt-1 text-xs text-on-surface-variant">
                          <span>📦 {(backup.size_mb / 1024).toFixed(2)} GB</span>
                          <span>📊 {backup.database_records.toLocaleString()} records</span>
                          <span>📅 {new Date(backup.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${getStatusColor(backup.status)}`}>
                          {backup.status}
                        </span>
                        <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded capitalize">
                          {backup.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`/backups/${backup.id}/download`}
                        className="px-3 py-2 rounded-lg bg-primary-600 text-surface hover:bg-primary-700 text-sm font-medium"
                      >
                        Download
                      </a>
                      {backup.status === 'completed' && (
                        <button
                          onClick={() => handleRestoreBackup(backup.id)}
                          className="px-3 py-2 rounded-lg bg-secondary-600 text-surface hover:bg-secondary-700 text-sm font-medium"
                        >
                          Restore
                        </button>
                      )}
                      <button className="px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-sm font-medium">
                        Details
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4">⚙️ Backup Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-outline-variant rounded">
              <div>
                <p className="font-medium text-on-surface">Automatic Daily Backups</p>
                <p className="text-xs text-on-surface-variant">Scheduled at 2:00 AM UTC</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between p-3 border border-outline-variant rounded">
              <div>
                <p className="font-medium text-on-surface">Backup Retention</p>
                <p className="text-xs text-on-surface-variant">Keep backups for 30 days</p>
              </div>
              <select className="px-3 py-1 rounded bg-surface-container text-on-surface text-sm">
                <option>7 days</option>
                <option>14 days</option>
                <option>30 days</option>
                <option>90 days</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 border border-outline-variant rounded">
              <div>
                <p className="font-medium text-on-surface">Backup Location</p>
                <p className="text-xs text-on-surface-variant">AWS S3 - glacier-backups bucket</p>
              </div>
              <button className="text-xs px-3 py-1 rounded bg-surface-container text-on-surface hover:bg-surface-container-high">
                Change
              </button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
