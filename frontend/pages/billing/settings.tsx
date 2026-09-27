import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account';
  display_name: string;
  last_four: string;
  expiry?: string;
  is_default: boolean;
  created_at: string;
}

interface BillingSettings {
  company_name: string;
  billing_email: string;
  billing_address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  tax_id?: string;
  auto_renew: boolean;
}

export default function BillingSettingsPage() {
  const [settings, setSettings] = useState<BillingSettings | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<BillingSettings>>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [settingsRes, methodsRes] = await Promise.all([
        fetch('/api/billing/settings', { headers }),
        fetch('/api/billing/payment-methods', { headers }),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
        setEditData(data);
      }

      if (methodsRes.ok) {
        const data = await methodsRes.json();
        setPaymentMethods(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/billing/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      const updated = await response.json();
      setSettings(updated);
      setIsEditing(false);
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/billing/payment-methods/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete payment method');

      setPaymentMethods(paymentMethods.filter(m => m.id !== id));
      setSuccess('Payment method deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment method');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/billing/payment-methods/${id}/set-default`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to set default');

      setPaymentMethods(paymentMethods.map(m => ({
        ...m,
        is_default: m.id === id,
      })));
      setSuccess('Default payment method updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update default');
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Billing Settings">
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
    <MainLayout title="Billing Settings">
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Billing Information</h2>
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
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Company Name
              </label>
              {isEditing ? (
                <Input
                  value={editData.company_name || ''}
                  onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{settings?.company_name || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Billing Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={editData.billing_email || ''}
                  onChange={(e) => setEditData({ ...editData, billing_email: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{settings?.billing_email || '-'}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Billing Address
              </label>
              {isEditing ? (
                <Input
                  value={editData.billing_address || ''}
                  onChange={(e) => setEditData({ ...editData, billing_address: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{settings?.billing_address || '-'}</p>
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
                <p className="text-on-surface">{settings?.city || '-'}</p>
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
                <p className="text-on-surface">{settings?.state || '-'}</p>
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
                <p className="text-on-surface">{settings?.zip || '-'}</p>
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
                <p className="text-on-surface">{settings?.country || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Tax ID
              </label>
              {isEditing ? (
                <Input
                  value={editData.tax_id || ''}
                  onChange={(e) => setEditData({ ...editData, tax_id: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{settings?.tax_id || '-'}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editData.auto_renew ?? settings?.auto_renew ?? true}
                  onChange={(e) => setEditData({ ...editData, auto_renew: e.target.checked })}
                  disabled={!isEditing}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-on-surface">Auto-renew subscription</span>
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Payment Methods</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddPaymentMethod(!showAddPaymentMethod)}
            >
              Add Payment Method
            </Button>
          </div>

          {showAddPaymentMethod && (
            <div className="mb-6 p-6 border-2 border-primary-600 rounded-lg">
              <p className="text-on-surface-variant mb-4">
                Payment method integration would connect to Stripe or similar payment processor.
                This is a placeholder for the actual payment integration UI.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAddPaymentMethod(false)}
              >
                Close
              </Button>
            </div>
          )}

          {paymentMethods.length === 0 ? (
            <p className="text-on-surface-variant">No payment methods added yet</p>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-on-surface">{method.display_name}</p>
                      {method.is_default && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-primary-container text-on-surface">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {method.type === 'credit_card' ? 'Card' : 'Bank Account'} •••• {method.last_four}
                      {method.expiry && ` • Expires ${method.expiry}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!method.is_default && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeletePaymentMethod(method.id)}
                    >
                      Delete
                    </Button>
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
