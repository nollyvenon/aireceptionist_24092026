import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'suspended' | 'cancelled';
  plan: 'starter' | 'professional' | 'business' | 'enterprise';
  created_at: string;
  users_count: number;
  appointments_count: number;
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/tenants', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tenants');
      }

      const data = await response.json();
      setTenants(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch = `${tenant.name} ${tenant.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'all' || tenant.status === filterStatus;
    return matchesSearch && matchesFilter;
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
      suspended: 'bg-warning-container text-on-surface',
      cancelled: 'bg-error-container text-on-surface',
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

  if (isLoading) {
    return (
      <MainLayout title="Tenant Management">
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
    <MainLayout title="Tenant Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            <Input
              placeholder="Search tenants..."
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
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-sm text-on-surface-variant">
            Total: {filteredTenants.length} tenants
          </div>
        </div>

        {error && (
          <Card className="p-4 bg-error-container text-error border-error">
            {error}
          </Card>
        )}

        {filteredTenants.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-on-surface-variant">No tenants found</p>
          </Card>
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
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Appointments</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Created</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-outline-variant hover:bg-surface-container">
                    <td className="py-3 px-4 font-medium text-on-surface">{tenant.name}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{tenant.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPlanColor(tenant.plan)}`}>
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-on-surface font-semibold">{tenant.users_count}</td>
                    <td className="py-3 px-4 text-on-surface">{tenant.appointments_count}</td>
                    <td className="py-3 px-4 text-on-surface-variant text-sm">
                      {formatDate(tenant.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/admin/tenants/${tenant.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
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
