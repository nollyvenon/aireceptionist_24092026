import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface Subscription {
  id: string;
  customer_name: string;
  plan: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  amount: number;
  billing_cycle: string;
  start_date: string;
  end_date?: string;
  next_billing_date: string;
  auto_renew: boolean;
  payment_method: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(s =>
    filter === 'all' || s.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent-container text-on-surface';
      case 'paused':
        return 'bg-secondary-container text-on-surface';
      case 'cancelled':
        return 'bg-error-container text-on-surface';
      case 'expired':
        return 'bg-surface-container text-on-surface-variant';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    paused: subscriptions.filter(s => s.status === 'paused').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    mrr: subscriptions
      .filter(s => s.status === 'active' && s.billing_cycle === 'monthly')
      .reduce((sum, s) => sum + s.amount, 0),
    arr: subscriptions
      .filter(s => s.status === 'active' && s.billing_cycle === 'annual')
      .reduce((sum, s) => sum + s.amount, 0),
  };

  if (isLoading) {
    return (
      <MainLayout title="Subscriptions">
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
    <MainLayout title="Subscriptions">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Subscriptions</h1>
          <Button variant="primary">+ New Subscription</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total</p>
            <p className="text-3xl font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Active</p>
            <p className="text-3xl font-bold text-accent-600">{stats.active}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Paused</p>
            <p className="text-3xl font-bold text-secondary-600">{stats.paused}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Cancelled</p>
            <p className="text-3xl font-bold text-error-600">{stats.cancelled}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">MRR</p>
            <p className="text-3xl font-bold text-primary-600">
              ${(stats.mrr / 1000).toFixed(1)}K
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">ARR</p>
            <p className="text-3xl font-bold text-secondary-600">
              ${(stats.arr / 1000).toFixed(1)}K
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Subscriptions</h3>
            <div className="flex gap-2 flex-wrap">
              {['all', 'active', 'paused', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    filter === status
                      ? 'bg-primary-600 text-surface'
                      : 'bg-surface-container text-on-surface'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Plan</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Billing</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Next Billing</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Auto Renew</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map(sub => (
                    <tr key={sub.id} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-4">
                        <a href={`/subscriptions/${sub.id}`} className="font-semibold text-primary-600 hover:underline">
                          {sub.customer_name}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-on-surface capitalize">{sub.plan}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface-variant text-sm capitalize">
                        {sub.billing_cycle}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-on-surface">
                        ${(sub.amount / 1000).toFixed(1)}K
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface-variant text-sm">
                        {new Date(sub.next_billing_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-1 rounded ${sub.auto_renew ? 'bg-accent-container text-on-surface' : 'bg-surface-container text-on-surface-variant'}`}>
                          {sub.auto_renew ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
