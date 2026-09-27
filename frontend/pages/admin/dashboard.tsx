import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface AdminMetrics {
  total_tenants: number;
  active_subscriptions: number;
  mrr: number;
  system_health: number;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  subscription: 'trial' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  users_count: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      const metricsRes = await fetch('/api/admin/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tenantsRes = await fetch('/api/admin/tenants', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }

      if (tenantsRes.ok) {
        const data = await tenantsRes.json();
        setTenants(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const subscriptionColors: Record<string, string> = {
    trial: 'bg-surface-container text-on-surface-variant',
    starter: 'bg-primary-container text-on-surface',
    pro: 'bg-secondary-container text-on-surface',
    enterprise: 'bg-accent-container text-on-surface',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-accent-container text-on-surface',
    inactive: 'bg-surface-container-high text-on-surface-variant',
    suspended: 'bg-error-container text-on-surface',
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <MainLayout title="Admin Dashboard">
      <div className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton height={20} className="mb-4" />
                <Skeleton height={32} width="60%" />
              </Card>
            ))}
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <p className="text-sm text-on-surface-variant mb-2">Total Tenants</p>
              <p className="text-3xl font-bold text-on-surface">{metrics.total_tenants}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-on-surface-variant mb-2">Active Subscriptions</p>
              <p className="text-3xl font-bold text-on-surface">{metrics.active_subscriptions}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-on-surface-variant mb-2">Monthly Recurring Revenue</p>
              <p className="text-3xl font-bold text-accent-600">
                ${(metrics.mrr / 1000).toFixed(1)}k
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-on-surface-variant mb-2">System Health</p>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-accent-600 flex items-center justify-center text-white font-bold">
                  {metrics.system_health}%
                </div>
              </div>
            </Card>
          </div>
        ) : null}

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-on-surface">Recent Tenants</h3>
            <Button variant="primary" size="sm">
              View All
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton height={16} />
                  <Skeleton height={14} width="80%" />
                </div>
              ))}
            </div>
          ) : tenants.length === 0 ? (
            <p className="text-on-surface-variant">No tenants found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="text-left py-3 px-4 font-semibold text-on-surface">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-on-surface">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-on-surface">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-on-surface">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-on-surface">Users</th>
                    <th className="text-left py-3 px-4 font-semibold text-on-surface">Joined</th>
                    <th className="text-right py-3 px-4 font-semibold text-on-surface">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.slice(0, 10).map((tenant) => (
                    <tr key={tenant.id} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-4 font-medium text-on-surface">{tenant.name}</td>
                      <td className="py-3 px-4 text-on-surface-variant">{tenant.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${subscriptionColors[tenant.subscription]}`}>
                          {tenant.subscription}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[tenant.status]}`}>
                          {tenant.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-on-surface">{tenant.users_count}</td>
                      <td className="py-3 px-4 text-on-surface-variant">
                        {formatDate(tenant.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
