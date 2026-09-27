import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
}

export default function NewDealPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    customer_id: '',
    amount: '',
    probability: '50',
    stage: 'prospecting',
    expected_close_date: '',
    description: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/crm/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch customers');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.title || !formData.customer_id || !formData.amount || !formData.expected_close_date) {
        throw new Error('Please fill in all required fields');
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/crm/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          customer_id: formData.customer_id,
          amount: parseInt(formData.amount) * 1000,
          probability: parseInt(formData.probability),
          stage: formData.stage,
          expected_close_date: formData.expected_close_date,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create deal');
      }

      const data = await response.json();
      router.push(`/crm/deals/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deal');
    } finally {
      setIsLoading(false);
    }
  };

  const getTodayDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  };

  return (
    <MainLayout title="Create New Deal">
      <div className="max-w-2xl">
        <Card className="p-8">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Deal Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter deal title"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Customer *
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Amount (in thousands) *
                </label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g., 50 for $50k"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Probability (%)
                </label>
                <Input
                  type="number"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                  min="0"
                  max="100"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Pipeline Stage *
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface disabled:opacity-50"
                  disabled={isLoading}
                >
                  <option value="prospecting">Prospecting</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed-won">Closed Won</option>
                  <option value="closed-lost">Closed Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Expected Close Date *
                </label>
                <Input
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                  min={getTodayDate()}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add any additional notes about this deal..."
                className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface resize-none placeholder-on-surface-variant disabled:opacity-50"
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Deal'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/crm/deals')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
