import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface LeadSource {
  id: string;
  name: string;
  type: string;
  total_leads: number;
  converted_leads: number;
  conversion_rate: number;
  avg_deal_value: number;
  cost: number;
  roi: number;
  is_active: boolean;
  created_at: string;
}

export default function LeadSourcesPage() {
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeadSources();
  }, []);

  const fetchLeadSources = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/lead-sources', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSources(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lead sources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (sourceId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/lead-sources/${sourceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        setSources(sources.map(s => s.id === sourceId ? { ...s, is_active: !isActive } : s));
      }
    } catch (err) {
      console.error('Failed to update lead source:', err);
    }
  };

  const activeSources = sources.filter(s => s.is_active).length;
  const totalLeads = sources.reduce((sum, s) => sum + s.total_leads, 0);
  const totalConverted = sources.reduce((sum, s) => sum + s.converted_leads, 0);
  const avgROI = sources.length > 0 ? (sources.reduce((sum, s) => sum + s.roi, 0) / sources.length).toFixed(1) : 0;

  if (isLoading) {
    return (
      <MainLayout title="Lead Sources">
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
    <MainLayout title="Lead Sources">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Lead Sources</h1>
          <Button variant="primary">+ New Source</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Sources</p>
            <p className="text-3xl font-bold text-on-surface">{sources.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Active</p>
            <p className="text-3xl font-bold text-accent-600">{activeSources}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Leads</p>
            <p className="text-3xl font-bold text-primary-600">{totalLeads}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Converted</p>
            <p className="text-3xl font-bold text-secondary-600">{totalConverted}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg ROI</p>
            <p className="text-3xl font-bold text-tertiary-600">{avgROI}%</p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Lead Source Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Source</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Type</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Total Leads</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Conversion Rate</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Avg Deal Value</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Cost</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">ROI</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Status</th>
                </tr>
              </thead>
              <tbody>
                {sources.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                      No lead sources found
                    </td>
                  </tr>
                ) : (
                  sources
                    .sort((a, b) => b.roi - a.roi)
                    .map(source => (
                      <tr key={source.id} className="border-b border-outline-variant hover:bg-surface-container">
                        <td className="py-3 px-4">
                          <a href={`/lead-sources/${source.id}`} className="font-semibold text-primary-600 hover:underline">
                            {source.name}
                          </a>
                        </td>
                        <td className="py-3 px-4 text-center text-on-surface-variant text-sm capitalize">
                          {source.type}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-on-surface">
                          {source.total_leads}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-surface-container-high rounded-full">
                              <div
                                className="h-2 bg-primary-600 rounded-full"
                                style={{ width: `${Math.min(source.conversion_rate * 10, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-on-surface">
                              {(source.conversion_rate * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-on-surface">
                          ${(source.avg_deal_value / 1000).toFixed(1)}K
                        </td>
                        <td className="py-3 px-4 text-right text-on-surface-variant text-sm">
                          ${(source.cost / 1000).toFixed(1)}K
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold ${source.roi > 0 ? 'text-accent-600' : 'text-error-600'}`}>
                            {source.roi.toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleActive(source.id, source.is_active)}
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              source.is_active
                                ? 'bg-accent-container text-on-surface'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {source.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">📊 Understanding Lead Source Metrics</h3>
          <div className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex gap-3">
              <span>•</span>
              <span>Conversion Rate: Percentage of leads that convert to customers</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Avg Deal Value: Average revenue generated from leads from this source</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Cost: Total investment in acquiring leads from this source</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>ROI: Return on investment percentage for this lead source</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
