import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'inactive';
  created_at: string;
  lifetime_value?: number;
  appointment_count?: number;
  last_appointment?: string;
}

interface Interaction {
  id: string;
  type: 'call' | 'email' | 'sms' | 'meeting' | 'note';
  description: string;
  created_at: string;
  created_by?: string;
}

interface Appointment {
  id: string;
  title: string;
  start_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface Deal {
  id: string;
  title: string;
  amount: number;
  stage: string;
  probability: number;
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Customer>>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  const fetchCustomerData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [customerRes, interactionsRes, appointmentsRes, dealsRes] = await Promise.all([
        fetch(`/api/customers/${id}`, { headers }),
        fetch(`/api/customers/${id}/interactions`, { headers }),
        fetch(`/api/customers/${id}/appointments`, { headers }),
        fetch(`/api/customers/${id}/deals`, { headers }),
      ]);

      if (customerRes.ok) {
        const data = await customerRes.json();
        setCustomer(data);
        setEditData(data);
      }

      if (interactionsRes.ok) {
        const data = await interactionsRes.json();
        setInteractions(data.data || []);
      }

      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json();
        setAppointments(data.data || []);
      }

      if (dealsRes.ok) {
        const data = await dealsRes.json();
        setDeals(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Failed to save');

      const updated = await response.json();
      setCustomer(updated);
      setIsEditing(false);
      setSuccess('Customer updated successfully');
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

  const getInteractionIcon = (type: string) => {
    const icons: Record<string, string> = {
      call: '📞',
      email: '📧',
      sms: '💬',
      meeting: '📅',
      note: '📝',
    };
    return icons[type] || '•';
  };

  if (isLoading) {
    return (
      <MainLayout title="Customer Detail">
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

  if (!customer) {
    return (
      <MainLayout title="Customer Not Found">
        <Card className="p-8 text-center">
          <p className="text-on-surface-variant mb-4">Customer not found</p>
          <Button variant="primary" onClick={() => router.push('/crm/customers')}>
            Back to Customers
          </Button>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${customer.first_name} ${customer.last_name}`}>
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Value</p>
            <p className="text-3xl font-bold text-on-surface">
              ${(customer.lifetime_value || 0) / 100}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Appointments</p>
            <p className="text-3xl font-bold text-on-surface">{customer.appointment_count || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              customer.status === 'active'
                ? 'bg-accent-container text-on-surface'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              {customer.status}
            </span>
          </Card>
        </div>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Customer Information</h2>
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
                First Name
              </label>
              {isEditing ? (
                <Input
                  value={editData.first_name || ''}
                  onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{customer.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Last Name
              </label>
              {isEditing ? (
                <Input
                  value={editData.last_name || ''}
                  onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{customer.last_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{customer.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Phone
              </label>
              {isEditing ? (
                <Input
                  value={editData.phone || ''}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{customer.phone || '-'}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Company
              </label>
              {isEditing ? (
                <Input
                  value={editData.company || ''}
                  onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{customer.company || '-'}</p>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Recent Appointments</h3>
            {appointments.length === 0 ? (
              <p className="text-on-surface-variant">No appointments</p>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="pb-3 border-b border-outline-variant last:border-0">
                    <p className="font-medium text-on-surface">{apt.title}</p>
                    <p className="text-sm text-on-surface-variant">{formatDate(apt.start_time)}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                      apt.status === 'completed'
                        ? 'bg-accent-container text-on-surface'
                        : 'bg-primary-container text-on-surface'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Active Deals</h3>
            {deals.length === 0 ? (
              <p className="text-on-surface-variant">No deals</p>
            ) : (
              <div className="space-y-3">
                {deals.slice(0, 5).map((deal) => (
                  <div key={deal.id} className="pb-3 border-b border-outline-variant last:border-0">
                    <p className="font-medium text-on-surface">{deal.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-on-surface-variant">{deal.stage}</span>
                      <span className="text-sm font-semibold text-on-surface">
                        ${(deal.amount / 1000).toFixed(1)}k
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Activity Timeline</h3>
          {interactions.length === 0 ? (
            <p className="text-on-surface-variant">No interactions recorded</p>
          ) : (
            <div className="space-y-4">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="flex gap-4">
                  <div className="text-2xl">{getInteractionIcon(interaction.type)}</div>
                  <div className="flex-1">
                    <p className="font-medium text-on-surface">{interaction.description}</p>
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant mt-1">
                      <span className="capitalize">{interaction.type}</span>
                      <span>•</span>
                      <span>{formatDate(interaction.created_at)}</span>
                      {interaction.created_by && (
                        <>
                          <span>•</span>
                          <span>by {interaction.created_by}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
