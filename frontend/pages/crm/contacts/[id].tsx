import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

interface Deal {
  id: string;
  title: string;
  amount: number;
  stage: string;
}

export default function ContactDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [contact, setContact] = useState<Contact | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Contact>>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchContactData();
    }
  }, [id]);

  const fetchContactData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [contactRes, dealsRes] = await Promise.all([
        fetch(`/api/crm/contacts/${id}`, { headers }),
        fetch(`/api/crm/contacts/${id}/deals`, { headers }),
      ]);

      if (contactRes.ok) {
        const data = await contactRes.json();
        setContact(data);
        setEditData(data);
      }

      if (dealsRes.ok) {
        const data = await dealsRes.json();
        setDeals(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contact');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/crm/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Failed to save');

      const updated = await response.json();
      setContact(updated);
      setIsEditing(false);
      setSuccess('Contact updated successfully');
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

  if (isLoading) {
    return (
      <MainLayout title="Contact Detail">
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

  if (!contact) {
    return (
      <MainLayout title="Contact Not Found">
        <Card className="p-8 text-center">
          <p className="text-on-surface-variant mb-4">Contact not found</p>
          <Button variant="primary" onClick={() => router.push('/crm/contacts')}>
            Back to Contacts
          </Button>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${contact.first_name} ${contact.last_name}`}>
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              contact.status === 'active'
                ? 'bg-accent-container text-on-surface'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              {contact.status}
            </span>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Related Deals</p>
            <p className="text-3xl font-bold text-on-surface">{deals.length}</p>
          </Card>
        </div>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Contact Information</h2>
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
                <p className="text-on-surface">{contact.first_name}</p>
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
                <p className="text-on-surface">{contact.last_name}</p>
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
                <p className="text-on-surface">{contact.email}</p>
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
                <p className="text-on-surface">{contact.phone || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Company
              </label>
              {isEditing ? (
                <Input
                  value={editData.company || ''}
                  onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{contact.company || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Title
              </label>
              {isEditing ? (
                <Input
                  value={editData.title || ''}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{contact.title || '-'}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Address
              </label>
              {isEditing ? (
                <Input
                  value={editData.address || ''}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{contact.address || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                City
              </label>
              {isEditing ? (
                <Input
                  value={editData.city || ''}
                  onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{contact.city || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                State
              </label>
              {isEditing ? (
                <Input
                  value={editData.state || ''}
                  onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{contact.state || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                ZIP Code
              </label>
              {isEditing ? (
                <Input
                  value={editData.zip || ''}
                  onChange={(e) => setEditData({ ...editData, zip: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{contact.zip || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Country
              </label>
              {isEditing ? (
                <Input
                  value={editData.country || ''}
                  onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{contact.country || '-'}</p>
              )}
            </div>
          </div>
        </Card>

        {deals.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Related Deals</h3>
            <div className="space-y-3">
              {deals.map((deal) => (
                <div key={deal.id} className="pb-3 border-b border-outline-variant last:border-0">
                  <p className="font-medium text-on-surface">{deal.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-on-surface-variant">{deal.stage}</span>
                    <span className="text-sm font-semibold text-on-surface">
                      ${(deal.amount / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
