import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface Deal {
  id: string;
  name: string;
  customer: string;
  amount: number;
  stage: 'lead' | 'proposal' | 'negotiating' | 'won' | 'lost';
  owner: string;
  created_at: string;
  close_date?: string;
  probability: number;
  notes: string;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewType, setViewType] = useState<'kanban' | 'table'>('kanban');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/deals', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDeals(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  };

  const stages = ['lead', 'proposal', 'negotiating', 'won', 'lost'];
  const stageLabels = {
    lead: 'Lead',
    proposal: 'Proposal',
    negotiating: 'Negotiating',
    won: 'Won',
    lost: 'Lost',
  };

  const stageColors = {
    lead: 'bg-primary-container',
    proposal: 'bg-secondary-container',
    negotiating: 'bg-tertiary-container',
    won: 'bg-accent-container',
    lost: 'bg-error-container',
  };

  const getDealsByStage = (stage: string) => deals.filter(d => d.stage === stage);
  const getTotalByStage = (stage: string) => {
    const stageDeal = getDealsByStage(stage);
    return stageDeal.reduce((sum, d) => sum + d.amount, 0);
  };

  const totalPipeline = deals.reduce((sum, d) => sum + d.amount, 0);

  if (isLoading) {
    return (
      <MainLayout title="Deals Pipeline">
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
    <MainLayout title="Deals Pipeline">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Deals Pipeline</h1>
            <p className="text-sm text-on-surface-variant">
              Total Pipeline: ${(totalPipeline / 1000).toFixed(1)}K
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewType === 'kanban' ? 'primary' : 'secondary'}
              onClick={() => setViewType('kanban')}
            >
              Kanban
            </Button>
            <Button
              variant={viewType === 'table' ? 'primary' : 'secondary'}
              onClick={() => setViewType('table')}
            >
              Table
            </Button>
            <Button variant="primary">+ New Deal</Button>
          </div>
        </div>

        {viewType === 'kanban' ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
            {stages.map(stage => (
              <div key={stage} className="flex-shrink-0 w-full lg:w-80">
                <Card className={`p-4 ${stageColors[stage as keyof typeof stageColors]}`}>
                  <div className="mb-4">
                    <h3 className="font-semibold text-on-surface capitalize mb-1">
                      {stageLabels[stage as keyof typeof stageLabels]}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      {getDealsByStage(stage).length} deals • ${(getTotalByStage(stage) / 1000).toFixed(1)}K
                    </p>
                  </div>

                  <div className="space-y-2">
                    {getDealsByStage(stage).map(deal => (
                      <Card key={deal.id} className="p-3 bg-surface-container hover:bg-surface-container-high cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <a
                            href={`/deals/${deal.id}`}
                            className="font-semibold text-primary-600 hover:underline text-sm"
                          >
                            {deal.name}
                          </a>
                          <span className="text-xs bg-primary-container px-2 py-1 rounded">
                            {deal.probability}%
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mb-2">{deal.customer}</p>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-on-surface">
                            ${(deal.amount / 1000).toFixed(1)}K
                          </p>
                          <p className="text-xs text-on-surface-variant">{deal.owner}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="text-left py-3 px-4 font-semibold text-on-surface">Deal Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-on-surface">Customer</th>
                    <th className="text-right py-3 px-4 font-semibold text-on-surface">Amount</th>
                    <th className="text-center py-3 px-4 font-semibold text-on-surface">Probability</th>
                    <th className="text-center py-3 px-4 font-semibold text-on-surface">Stage</th>
                    <th className="text-left py-3 px-4 font-semibold text-on-surface">Owner</th>
                    <th className="text-center py-3 px-4 font-semibold text-on-surface">Expected Close</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                        No deals found
                      </td>
                    </tr>
                  ) : (
                    deals.map(deal => (
                      <tr key={deal.id} className="border-b border-outline-variant hover:bg-surface-container">
                        <td className="py-3 px-4">
                          <a href={`/deals/${deal.id}`} className="font-semibold text-primary-600 hover:underline">
                            {deal.name}
                          </a>
                        </td>
                        <td className="py-3 px-4 text-on-surface">{deal.customer}</td>
                        <td className="py-3 px-4 text-right font-semibold text-on-surface">
                          ${(deal.amount / 1000).toFixed(1)}K
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 h-2 bg-surface-container-high rounded-full">
                              <div
                                className="h-2 bg-primary-600 rounded-full"
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{deal.probability}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${stageColors[deal.stage as keyof typeof stageColors]}`}>
                            {stageLabels[deal.stage as keyof typeof stageLabels]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant text-sm">{deal.owner}</td>
                        <td className="py-3 px-4 text-center text-on-surface-variant text-sm">
                          {deal.close_date ? new Date(deal.close_date).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
