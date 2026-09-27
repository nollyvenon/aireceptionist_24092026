import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface RetentionPolicy {
  id: string;
  data_type: string;
  retention_days: number;
  auto_delete: boolean;
  created_at: string;
}

export default function DataRetentionPage() {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRetentionPolicies();
  }, []);

  const fetchRetentionPolicies = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/data-retention', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPolicies(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load retention policies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/data-export/gdpr', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'personal-data-export.zip';
        a.click();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
    }
  };

  const handleDeleteData = async () => {
    if (!confirm('This will permanently delete all your personal data. This action cannot be undone. Continue?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/data-deletion', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert('Data deletion initiated. You will receive a confirmation email shortly.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate data deletion');
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Data Retention">
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

  return (
    <MainLayout title="Data Retention">
      <div className="space-y-6 max-w-4xl">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div>
          <h1 className="text-3xl font-bold text-on-surface">Data Retention & Privacy</h1>
          <p className="text-sm text-on-surface-variant">Manage your data and privacy preferences</p>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">📋 Retention Policies</h3>
          <div className="space-y-3">
            {policies.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No retention policies configured</p>
            ) : (
              policies.map(policy => (
                <div key={policy.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-lg">
                  <div>
                    <h4 className="font-semibold text-on-surface capitalize">{policy.data_type.replace(/_/g, ' ')}</h4>
                    <p className="text-xs text-on-surface-variant">
                      Retained for {policy.retention_days} days
                      {policy.auto_delete && ' • Auto-deletion enabled'}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-on-surface-variant">
                    {policy.retention_days} days
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">🔐 Privacy Controls</h3>
          <div className="space-y-4">
            <div className="p-4 border border-outline-variant rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-on-surface">Export My Data</h4>
                  <p className="text-sm text-on-surface-variant">Download all your personal data in standard formats (GDPR right of access)</p>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={handleExportData}
                className="w-full"
              >
                📥 Export Data (ZIP)
              </Button>
            </div>

            <div className="p-4 border border-outline-variant rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-on-surface">Delete My Data</h4>
                  <p className="text-sm text-on-surface-variant">Permanently delete all your personal data (right to be forgotten)</p>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={handleDeleteData}
                className="w-full bg-error-600 hover:bg-error-700"
              >
                🗑️ Delete All Data
              </Button>
            </div>

            <div className="p-4 border border-outline-variant rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-on-surface">Marketing Communications</h4>
                  <p className="text-sm text-on-surface-variant">Control email newsletters and promotional content</p>
                </div>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            </div>

            <div className="p-4 border border-outline-variant rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-on-surface">Analytics Tracking</h4>
                  <p className="text-sm text-on-surface-variant">Allow us to use analytics for service improvement</p>
                </div>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4">📄 Legal Documents</h3>
          <div className="space-y-3">
            <a href="/privacy-policy" className="flex items-center justify-between p-3 border border-outline-variant rounded hover:bg-surface-container transition-colors">
              <span className="text-on-surface">Privacy Policy</span>
              <span className="text-on-surface-variant">→</span>
            </a>
            <a href="/terms-of-service" className="flex items-center justify-between p-3 border border-outline-variant rounded hover:bg-surface-container transition-colors">
              <span className="text-on-surface">Terms of Service</span>
              <span className="text-on-surface-variant">→</span>
            </a>
            <a href="/data-processing" className="flex items-center justify-between p-3 border border-outline-variant rounded hover:bg-surface-container transition-colors">
              <span className="text-on-surface">Data Processing Agreement</span>
              <span className="text-on-surface-variant">→</span>
            </a>
            <a href="/cookie-policy" className="flex items-center justify-between p-3 border border-outline-variant rounded hover:bg-surface-container transition-colors">
              <span className="text-on-surface">Cookie Policy</span>
              <span className="text-on-surface-variant">→</span>
            </a>
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">🛡️ Privacy & Compliance</h3>
          <div className="space-y-2 text-sm text-on-surface-variant">
            <p>✅ GDPR compliant - Right of access and deletion supported</p>
            <p>✅ CCPA compliant - California privacy rights enforced</p>
            <p>✅ Data encryption - All data encrypted in transit and at rest</p>
            <p>✅ Regular audits - Third-party security audits performed annually</p>
            <p>✅ No third-party sales - Your data is never sold to third parties</p>
            <p>✅ Transparent processing - Clear data usage policies</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
