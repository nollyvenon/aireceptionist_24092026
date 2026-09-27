import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'negotiating' | 'lost';
  score: number;
  created_at: string;
  next_action_date?: string;
  notes: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/leads', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || lead.status === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-primary-container text-on-surface';
      case 'contacted':
        return 'bg-secondary-container text-on-surface';
      case 'qualified':
        return 'bg-accent-container text-on-surface';
      case 'negotiating':
        return 'bg-tertiary-container text-on-surface';
      case 'lost':
        return 'bg-error-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent-600';
    if (score >= 60) return 'text-secondary-600';
    if (score >= 40) return 'text-primary-600';
    return 'text-on-surface-variant';
  };

  if (isLoading) {
    return (
      <MainLayout title="Leads">
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
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
    <MainLayout title="Leads">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Leads</h1>
          <Button variant="primary">+ Add Lead</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Leads</p>
            <p className="text-3xl font-bold text-on-surface">{leads.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">New Leads</p>
            <p className="text-3xl font-bold text-primary-600">
              {leads.filter(l => l.status === 'new').length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Qualified</p>
            <p className="text-3xl font-bold text-accent-600">
              {leads.filter(l => l.status === 'qualified').length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Score</p>
            <p className="text-3xl font-bold text-secondary-600">
              {leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or company..."
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="negotiating">Negotiating</option>
                <option value="lost">Lost</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
              >
                <option value="created_at">Recent First</option>
                <option value="score">Highest Score</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Source</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Score</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Added</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map(lead => (
                    <tr key={lead.id} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-4">
                        <a href={`/leads/${lead.id}`} className="font-semibold text-primary-600 hover:underline">
                          {lead.name}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-on-surface">{lead.company}</td>
                      <td className="py-3 px-4 text-on-surface-variant text-sm">{lead.email}</td>
                      <td className="py-3 px-4 text-on-surface-variant text-sm capitalize">{lead.source}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold ${getScoreColor(lead.score)}`}>
                          {lead.score}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant text-sm">
                        {new Date(lead.created_at).toLocaleDateString()}
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
