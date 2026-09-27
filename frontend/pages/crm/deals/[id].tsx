import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';

interface Deal {
  id: string;
  title: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  probability: number;
  stage: 'prospecting' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  expected_close_date: string;
  description?: string;
  owner_id?: string;
  owner_name?: string;
  created_at: string;
  updated_at?: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  created_by?: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  title?: string;
}

export default function DealDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [deal, setDeal] = useState<Deal | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Deal>>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchDealData();
    }
  }, [id]);

  const fetchDealData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [dealRes, activitiesRes, contactsRes] = await Promise.all([
        fetch(`/api/crm/deals/${id}`, { headers }),
        fetch(`/api/crm/deals/${id}/activities`, { headers }),
        fetch(`/api/crm/deals/${id}/contacts`, { headers }),
      ]);

      if (dealRes.ok) {
        const data = await dealRes.json();
        setDeal(data);
        setEditData(data);
      }

      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(data.data || []);
      }

      if (contactsRes.ok) {
        const data = await contactsRes.json();
        setContacts(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/crm/deals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Failed to save');

      const updated = await response.json();
      setDeal(updated);
      setIsEditing(false);
      setSuccess('Deal updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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

  if (isLoading) {
    return (
      <MainLayout title="Deal Detail">
        <div className="space-y-6">
          <Card className="p-8">
            <Skeleton height={32} width="40%" className="mb-4" />
            <Skeleton height={20} width="60%" className="mb-2" />
            <Skeleton height={20} width="50%" />
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!deal) {
    return (
      <MainLayout title="Deal Not Found">
        <Card className="p-8 text-center">
          <p className="text-on-surface-variant mb-4">Deal not found</p>
          <Button variant="primary" onClick={() => router.push('/crm/deals')}>
            Back to Deals
          </Button>
        </Card>
      </MainLayout>
    );
  }

  const expectedCloseDateObj = new Date(deal.expected_close_date);
  const today = new Date();
  const daysUntilClose = Math.ceil((expectedCloseDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <MainLayout title={deal.title}>
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Deal Amount</p>
            <p className="text-3xl font-bold text-on-surface">
              ${(deal.amount / 1000).toFixed(1)}k
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Probability</p>
            <p className="text-3xl font-bold text-primary-600">{deal.probability}%</p>
            <div className="w-full bg-surface-container-high rounded-full h-2 mt-3">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${deal.probability}%` }}
              />
            </div>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Weighted Value</p>
            <p className="text-3xl font-bold text-accent-600">
              ${((deal.amount * deal.probability) / 100 / 1000).toFixed(1)}k
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Days Until Close</p>
            <p className={`text-3xl font-bold ${daysUntilClose <= 7 ? 'text-error-600' : 'text-on-surface'}`}>
              {daysUntilClose} days
            </p>
          </Card>
        </div>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Deal Information</h2>
            <Button
              variant={isEditing ? 'secondary' : 'primary'}
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? 'Save' : 'Edit'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Deal Title
              </label>
              {isEditing ? (
                <Input
                  value={editData.title || ''}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{deal.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Customer
              </label>
              <p className="text-on-surface">{deal.customer_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Amount
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editData.amount ? editData.amount / 1000 : ''}
                  onChange={(e) => setEditData({ ...editData, amount: parseInt(e.target.value) * 1000 })}
                />
              ) : (
                <p className="text-on-surface">${(deal.amount / 1000).toFixed(1)}k</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Stage
              </label>
              {isEditing ? (
                <select
                  value={editData.stage || deal.stage}
                  onChange={(e) => setEditData({ ...editData, stage: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
                >
                  <option value="prospecting">Prospecting</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed-won">Closed Won</option>
                  <option value="closed-lost">Closed Lost</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageColors[deal.stage]}`}>
                  {stageLabels[deal.stage]}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Probability
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editData.probability || ''}
                  onChange={(e) => setEditData({ ...editData, probability: parseInt(e.target.value) })}
                  min="0"
                  max="100"
                />
              ) : (
                <p className="text-on-surface">{deal.probability}%</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Expected Close Date
              </label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editData.expected_close_date || ''}
                  onChange={(e) => setEditData({ ...editData, expected_close_date: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{formatDate(deal.expected_close_date)}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface resize-none"
                  rows={3}
                />
              ) : (
                <p className="text-on-surface">{deal.description || '-'}</p>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Activity</h3>
            {activities.length === 0 ? (
              <p className="text-on-surface-variant">No activity recorded</p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="pb-3 border-b border-outline-variant last:border-0">
                    <p className="font-medium text-on-surface text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-1">
                      <span>{formatDate(activity.created_at)}</span>
                      {activity.created_by && (
                        <>
                          <span>•</span>
                          <span>by {activity.created_by}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Related Contacts</h3>
            {contacts.length === 0 ? (
              <p className="text-on-surface-variant">No contacts linked</p>
            ) : (
              <div className="space-y-3">
                {contacts.slice(0, 5).map((contact) => (
                  <div key={contact.id} className="pb-3 border-b border-outline-variant last:border-0">
                    <p className="font-medium text-on-surface">{contact.name}</p>
                    {contact.title && (
                      <p className="text-xs text-on-surface-variant">{contact.title}</p>
                    )}
                    <p className="text-xs text-on-surface-variant">{contact.email}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
