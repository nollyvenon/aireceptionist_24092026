import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Subscription {
  id: string;
  tenant_name: string;
  plan: 'starter' | 'professional' | 'business' | 'enterprise';
  status: 'active' | 'past_due' | 'cancelled' | 'paused';
  monthly_price: number;
  billing_cycle_start: string;
  billing_cycle_end: string;
  users_limit: number;
  users_current: number;
  last_payment_date: string;
  next_payment_date?: string;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/subscriptions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const data = await response.json();
      setSubscriptions(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.tenant_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || sub.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
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
      past_due: 'bg-warning-container text-on-surface',
      cancelled: 'bg-error-container text-on-surface',
      paused: 'bg-surface-container-high text-on-surface-variant',
    };
    return colors[status] || 'bg-surface-container text-on-surface';
  };

  const getPlanColor = (plan: string) => {
    const colors: Record<string, string> = {
      starter: 'bg-surface-container-high text-on-surface-variant',
      professional: 'bg-primary-container text-on-surface',
      business: 'bg-secondary-container text-on-surface',
      enterprise: 'bg-tertiary-container text-on-surface',
    };
    return colors[plan] || 'bg-surface-container text-on-surface';
  };

  const totalMRR = filteredSubscriptions.reduce((sum, sub) => sum + sub.monthly_price, 0);
  const activeCount = filteredSubscriptions.filter(s => s.status === 'active').length;

  if (isLoading) {
    return (
      <MainLayout title="Subscriptions Management">
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
    <MainLayout title="Subscriptions Management">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total MRR</p>
            <p className="text-3xl font-bold text-accent-600">
              ${(totalMRR / 100).toFixed(2)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Active Subscriptions</p>
            <p className="text-3xl font-bold text-primary-600">{activeCount}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Subscriptions</p>
            <p className="text-3xl font-bold text-on-surface">{filteredSubscriptions.length}</p>
          </Card>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            <Input
              placeholder="Search subscriptions..."
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
              <option value="past_due">Past Due</option>
              <option value="cancelled">Cancelled</option>
              <option value="paused">Paused</option>
            </select>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {error && (
          <Card className="p-4 bg-error-container text-error border-error">
            {error}
          </Card>
        )}

        {filteredSubscriptions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-on-surface-variant">No subscriptions found</p>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Tenant</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Monthly Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Users</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Cycle</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Next Payment</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-outline-variant hover:bg-surface-container">
                    <td className="py-3 px-4 font-medium text-on-surface">{sub.tenant_name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPlanColor(sub.plan)}`}>
                        {sub.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(sub.status)}`}>
                        {sub.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-on-surface">
                      ${(sub.monthly_price / 100).toFixed(2)}/mo
                    </td>
                    <td className="py-3 px-4 text-on-surface">
                      {sub.users_current}/{sub.users_limit}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant text-sm">
                      {formatDate(sub.billing_cycle_start)} - {formatDate(sub.billing_cycle_end)}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant text-sm">
                      {sub.next_payment_date ? formatDate(sub.next_payment_date) : '-'}
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
