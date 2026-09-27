import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed';
  value?: number;
  created_at: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/crm/leads', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = `${lead.name} ${lead.email} ${lead.company || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusColors: Record<string, string> = {
    new: 'bg-primary-container text-on-surface',
    contacted: 'bg-secondary-container text-on-surface',
    qualified: 'bg-accent-container text-on-surface',
    proposal: 'bg-surface-container-high text-on-surface',
    closed: 'bg-accent-container text-on-surface',
  };

  const totalValue = filteredLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);

  return (
    <MainLayout title="Leads">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Leads</p>
            <p className="text-3xl font-bold text-on-surface">{filteredLeads.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Pipeline Value</p>
            <p className="text-3xl font-bold text-on-surface">
              ${(totalValue / 1000).toFixed(1)}k
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Conversion Rate</p>
            <p className="text-3xl font-bold text-on-surface">
              {filteredLeads.length > 0
                ? Math.round((filteredLeads.filter(l => l.status === 'closed').length / filteredLeads.length) * 100)
                : 0}%
            </p>
          </Card>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            <Input
              placeholder="Search leads..."
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
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <Link href="/crm/leads/new">
            <Button variant="primary">Add Lead</Button>
          </Link>
        </div>

        {error && (
          <Card className="p-4 bg-error-container text-error border-error">
            {error}
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="space-y-3">
                  <Skeleton height={20} />
                  <Skeleton height={16} width="80%" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-on-surface-variant mb-4">No leads found</p>
            <Link href="/crm/leads/new">
              <Button variant="primary">Create First Lead</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map((lead) => (
              <Link key={lead.id} href={`/crm/leads/${lead.id}`}>
                <Card className="p-4 hover:shadow-lg cursor-pointer transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-on-surface">{lead.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-on-surface-variant">
                        <span>{lead.email}</span>
                        {lead.company && <span>{lead.company}</span>}
                        {lead.phone && <span>{lead.phone}</span>}
                      </div>
                    </div>
                    {lead.value && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-accent-600">
                          ${(lead.value / 1000).toFixed(1)}k
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
