import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface ExportJob {
  id: string;
  type: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  download_url?: string;
  records_count: number;
}

export default function DataExportPage() {
  const [selectedType, setSelectedType] = useState('customers');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [error, setError] = useState('');

  const exportTypes = [
    { id: 'customers', name: 'Customers', icon: '👥' },
    { id: 'appointments', name: 'Appointments', icon: '📅' },
    { id: 'deals', name: 'Deals', icon: '💼' },
    { id: 'leads', name: 'Leads', icon: '🎯' },
    { id: 'contacts', name: 'Contacts', icon: '📞' },
    { id: 'payments', name: 'Payments', icon: '💰' },
    { id: 'messages', name: 'Messages', icon: '💬' },
    { id: 'activities', name: 'Activities', icon: '📊' },
  ];

  const formats = ['CSV', 'Excel', 'JSON', 'PDF'];

  const handleExport = async () => {
    setIsExporting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: selectedType,
          format: selectedFormat.toLowerCase(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExportJobs([{ ...data, status: 'processing' }, ...exportJobs]);
      } else {
        setError('Export failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'processing':
        return '⏳';
      case 'pending':
        return '○';
      case 'failed':
        return '✕';
      default:
        return '?';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent-container text-on-surface';
      case 'processing':
        return 'bg-primary-container text-on-surface';
      case 'pending':
        return 'bg-surface-container text-on-surface';
      case 'failed':
        return 'bg-error-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  return (
    <MainLayout title="Data Export">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-on-surface mb-6">Export Your Data</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-4">
                What would you like to export?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {exportTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      selectedType === type.id
                        ? 'border-primary-600 bg-primary-container'
                        : 'border-outline-variant hover:bg-surface-container'
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <p className="text-sm font-medium text-on-surface">{type.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-3">
                Export Format
              </label>
              <div className="flex gap-3">
                {formats.map(format => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedFormat === format
                        ? 'border-primary-600 bg-primary-container'
                        : 'border-outline-variant hover:bg-surface-container'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-primary-container/20 rounded-lg">
              <p className="text-sm text-on-surface-variant">
                💡 Your data will be exported in {selectedFormat} format. Downloads are available for 7 days.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? 'Preparing Export...' : 'Export Data'}
            </Button>
          </div>
        </Card>

        {exportJobs.length > 0 && (
          <Card className="p-8">
            <h3 className="text-lg font-semibold text-on-surface mb-6">Export History</h3>
            <div className="space-y-3">
              {exportJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-on-surface capitalize">
                        {job.type}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {job.records_count} records • {job.format.toUpperCase()} • {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {job.status === 'completed' && (
                    <a
                      href={job.download_url}
                      download
                      className="px-4 py-2 bg-primary-600 text-surface rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors"
                    >
                      ⬇️ Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
