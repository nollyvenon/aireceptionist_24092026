import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';

interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  timezone?: string;
  language?: string;
}

export default function OrganizationSettingsPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Organization>>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings/organization', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOrg(data);
        setEditData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings/organization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Failed to save');

      const updated = await response.json();
      setOrg(updated);
      setIsEditing(false);
      setSuccess('Organization settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Organization Settings">
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

  return (
    <MainLayout title="Organization Settings">
      <div className="max-w-4xl space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Organization Information</h2>
            <Button
              variant={isEditing ? 'secondary' : 'primary'}
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={isSaving}
            >
              {isEditing ? (isSaving ? 'Saving...' : 'Save') : 'Edit'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Organization Name
              </label>
              {isEditing ? (
                <Input
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{org?.name || '-'}</p>
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
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface resize-none"
                  rows={3}
                />
              ) : (
                <p className="text-on-surface">{org?.description || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Industry
              </label>
              {isEditing ? (
                <Input
                  value={editData.industry || ''}
                  onChange={(e) => setEditData({ ...editData, industry: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{org?.industry || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Website
              </label>
              {isEditing ? (
                <Input
                  type="url"
                  value={editData.website || ''}
                  onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{org?.website || '-'}</p>
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
                <p className="text-on-surface">{org?.phone || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Address
              </label>
              {isEditing ? (
                <Input
                  value={editData.address || ''}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{org?.address || '-'}</p>
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
                <p className="text-on-surface">{org?.city || '-'}</p>
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
                <p className="text-on-surface">{org?.state || '-'}</p>
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
                <p className="text-on-surface">{org?.zip || '-'}</p>
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
                <p className="text-on-surface">{org?.country || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Timezone
              </label>
              {isEditing ? (
                <select
                  value={editData.timezone || 'America/New_York'}
                  onChange={(e) => setEditData({ ...editData, timezone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
              ) : (
                <p className="text-on-surface">{org?.timezone || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Language
              </label>
              {isEditing ? (
                <select
                  value={editData.language || 'en'}
                  onChange={(e) => setEditData({ ...editData, language: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>
              ) : (
                <p className="text-on-surface">{org?.language || '-'}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
