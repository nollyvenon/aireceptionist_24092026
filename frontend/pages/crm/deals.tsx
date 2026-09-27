import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Deal {
  id: string;
  title: string;
  customer_name: string;
  amount: number;
  probability: number;
  stage: 'prospecting' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  expected_close_date: string;
  owner_name?: string;
  created_at: string;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [view, setView] = useState<'list' | 'pipeline'>('pipeline');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/crm/deals', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }

      const data = await response.json();
      setDeals(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = `${deal.title} ${deal.customer_name}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStage === 'all' || deal.stage === filterStage;
    return matchesSearch && matchesFilter;
  });

  const stageLabels: Record<string, string> = {
    prospecting: 'Prospecting',
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    'closed-won': 'Closed Won',
    'closed-lost': 'Closed Lost',
  };

  const stageColors: Record<string, string> = {
    prospecting: 'bg-surface-container-high text-on-surface-variant',
    qualified: 'bg-primary-container text-on-surface',
    proposal: 'bg-secondary-container text-on-surface',
    negotiation: 'bg-surface-container text-on-surface',
    'closed-won': 'bg-accent-container text-on-surface',
    'closed-lost': 'bg-error-container text-on-surface',
  };

  const dealsByStage = {
    prospecting: filteredDeals.filter(d => d.stage === 'prospecting'),
    qualified: filteredDeals.filter(d => d.stage === 'qualified'),
    proposal: filteredDeals.filter(d => d.stage === 'proposal'),
    negotiation: filteredDeals.filter(d => d.stage === 'negotiation'),
    'closed-won': filteredDeals.filter(d => d.stage === 'closed-won'),
    'closed-lost': filteredDeals.filter(d => d.stage === 'closed-lost'),
  };

  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.amount, 0);
  const weightedValue = filteredDeals.reduce((sum, deal) => sum + (deal.amount * deal.probability / 100), 0);
  const closedWonValue = dealsByStage['closed-won'].reduce((sum, deal) => sum + deal.amount, 0);
  const winRate = filteredDeals.length > 0
    ? Math.round((dealsByStage['closed-won'].length / (dealsByStage['closed-won'].length + dealsByStage['closed-lost'].length)) * 100) || 0
    : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const PipelineCard = ({ stage, stageDeal }: { stage: keyof typeof dealsByStage; stageDeal: Deal[] }) => {
    const stageValue = stageDeal.reduce((sum, d) => sum + d.amount, 0);
    return (
      <div className="flex-1 min-w-sm">
        <div className="mb-4 pb-3 border-b border-outline-variant">
          <h3 className="font-semibold text-on-surface mb-1">{stageLabels[stage]}</h3>
          <p className="text-sm text-on-surface-variant">{stageDeal.length} deals</p>
          <p className="text-lg font-bold text-on-surface">${(stageValue / 1000).toFixed(1)}k</p>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {stageDeal.map((deal) => (
            <Link key={deal.id} href={`/crm/deals/${deal.id}`}>
              <Card className="p-3 hover:shadow-lg cursor-pointer transition-shadow">
                <p className="font-medium text-on-surface text-sm">{deal.title}</p>
                <p className="text-xs text-on-surface-variant">{deal.customer_name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-on-surface">
                    ${(deal.amount / 1000).toFixed(1)}k
                  </p>
                  <span className="text-xs text-on-surface-variant">{deal.probability}%</span>
                </div>
              </Card>
            </Link>
          ))}
          {stageDeal.length === 0 && (
            <p className="text-xs text-on-surface-variant text-center py-4">No deals</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <MainLayout title="Deals & Pipeline">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Pipeline</p>
            <p className="text-3xl font-bold text-on-surface">
              ${(totalValue / 1000).toFixed(1)}k
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Weighted Value</p>
            <p className="text-3xl font-bold text-primary-600">
              ${(weightedValue / 1000).toFixed(1)}k
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Won This Period</p>
            <p className="text-3xl font-bold text-accent-600">
              ${(closedWonValue / 1000).toFixed(1)}k
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Win Rate</p>
            <p className="text-3xl font-bold text-on-surface">{winRate}%</p>
          </Card>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            <Input
              placeholder="Search deals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
            >
              <option value="all">All Stages</option>
              <option value="prospecting">Prospecting</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed-won">Closed Won</option>
              <option value="closed-lost">Closed Lost</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('pipeline')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'pipeline'
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              List
            </button>
            <Link href="/crm/deals/new">
              <Button variant="primary" size="sm">
                New Deal
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Card className="p-4 bg-error-container text-error border-error">
            {error}
          </Card>
        )}

        {isLoading ? (
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
        ) : view === 'pipeline' ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-min">
              <PipelineCard stage="prospecting" stageDeal={dealsByStage.prospecting} />
              <PipelineCard stage="qualified" stageDeal={dealsByStage.qualified} />
              <PipelineCard stage="proposal" stageDeal={dealsByStage.proposal} />
              <PipelineCard stage="negotiation" stageDeal={dealsByStage.negotiation} />
              <PipelineCard stage="closed-won" stageDeal={dealsByStage['closed-won']} />
              <PipelineCard stage="closed-lost" stageDeal={dealsByStage['closed-lost']} />
            </div>
          </div>
        ) : filteredDeals.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-on-surface-variant mb-4">No deals found</p>
            <Link href="/crm/deals/new">
              <Button variant="primary">Create First Deal</Button>
            </Link>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Deal</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Stage</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Probability</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Close Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Owner</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="border-b border-outline-variant hover:bg-surface-container">
                    <td className="py-3 px-4 font-medium text-on-surface">{deal.title}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{deal.customer_name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${stageColors[deal.stage]}`}>
                        {stageLabels[deal.stage]}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-on-surface">
                      ${(deal.amount / 1000).toFixed(1)}k
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">{deal.probability}%</td>
                    <td className="py-3 px-4 text-on-surface-variant">
                      {formatDate(deal.expected_close_date)}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">{deal.owner_name || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
