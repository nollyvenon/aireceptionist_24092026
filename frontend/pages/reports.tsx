import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Report {
  id: string;
  name: string;
  type: 'appointment' | 'revenue' | 'performance' | 'automation' | 'ai' | 'custom';
  description: string;
  created_at: string;
  last_generated: string;
  schedule: 'once' | 'daily' | 'weekly' | 'monthly';
  recipients: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Appointment Summary',
    type: 'appointment',
    description: 'Overview of appointments, completions, cancellations',
    icon: '📅',
  },
  {
    id: '2',
    name: 'Revenue Report',
    type: 'revenue',
    description: 'Sales, invoices, payments, MRR, and financial metrics',
    icon: '💰',
  },
  {
    id: '3',
    name: 'Performance Metrics',
    type: 'performance',
    description: 'Staff performance, ratings, on-time rates, customer satisfaction',
    icon: '📊',
  },
  {
    id: '4',
    name: 'Automation Insights',
    type: 'automation',
    description: 'Workflow execution, success rates, efficiency gains',
    icon: '⚙️',
  },
  {
    id: '5',
    name: 'AI Receptionist Stats',
    type: 'ai',
    description: 'Call volume, handling time, transcription accuracy, success rates',
    icon: '🤖',
  },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showNewReport, setShowNewReport] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportName, setReportName] = useState('');
  const [reportSchedule, setReportSchedule] = useState('weekly');
  const [reportEmail, setReportEmail] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!reportName.trim() || !selectedTemplate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: reportName,
          type: selectedTemplate,
          schedule: reportSchedule,
          recipients: reportEmail ? [reportEmail] : [],
        }),
      });

      if (response.ok) {
        setReportName('');
        setSelectedTemplate('');
        setReportSchedule('weekly');
        setReportEmail('');
        setShowNewReport(false);
        fetchReports();
      } else {
        setError('Failed to create report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report');
    }
  };

  const handleGenerateReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/${reportId}/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setReports(reports.filter(r => r.id !== reportId));
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Reports">
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
    <MainLayout title="Reports">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Reports</h1>
          <Button
            variant="primary"
            onClick={() => setShowNewReport(!showNewReport)}
          >
            {showNewReport ? '✕ Cancel' : '+ New Report'}
          </Button>
        </div>

        {showNewReport && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-6">Create New Report</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Report Name
                </label>
                <Input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-3">
                  Report Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {reportTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.type)}
                      className={`p-4 rounded-lg border-2 text-center transition-colors ${
                        selectedTemplate === template.type
                          ? 'border-primary-600 bg-primary-container'
                          : 'border-outline-variant hover:bg-surface-container'
                      }`}
                    >
                      <div className="text-3xl mb-2">{template.icon}</div>
                      <h4 className="font-semibold text-on-surface text-sm mb-1">
                        {template.name}
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Schedule
                  </label>
                  <select
                    value={reportSchedule}
                    onChange={(e) => setReportSchedule(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Email Recipient
                  </label>
                  <Input
                    type="email"
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    placeholder="your@email.com (optional)"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="primary" onClick={handleCreateReport}>
                Create Report
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowNewReport(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {reports.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-on-surface-variant mb-4">
                No reports created yet
              </p>
              <Button variant="primary" onClick={() => setShowNewReport(true)}>
                Create Your First Report
              </Button>
            </Card>
          ) : (
            reports.map(report => (
              <Card key={report.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-on-surface mb-2">
                      {report.name}
                    </h3>
                    <div className="flex items-center gap-4 mb-3 text-sm text-on-surface-variant">
                      <span className="px-2 py-1 rounded bg-surface-container capitalize">
                        {report.type}
                      </span>
                      <span className="capitalize">
                        Schedule: {report.schedule}
                      </span>
                      {report.recipients.length > 0 && (
                        <span>
                          Recipients: {report.recipients.join(', ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span>
                        Created: {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        Last Generated: {new Date(report.last_generated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleGenerateReport(report.id)}
                    >
                      Generate
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                    >
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
