import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    `${customer.first_name} ${customer.last_name} ${customer.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <MainLayout title="Customers">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-sm"
          />
          <Link href="/crm/customers/new">
            <Button variant="primary">Add Customer</Button>
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
        ) : filteredCustomers.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-on-surface-variant mb-4">No customers found</p>
            <Link href="/crm/customers/new">
              <Button variant="primary">Create First Customer</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <Link key={customer.id} href={`/crm/customers/${customer.id}`}>
                <Card className="p-4 hover:shadow-lg cursor-pointer transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-on-surface">
                        {customer.first_name} {customer.last_name}
                      </h3>
                      <p className="text-sm text-on-surface-variant">{customer.email}</p>
                      {customer.phone && (
                        <p className="text-sm text-on-surface-variant">{customer.phone}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'active'
                        ? 'bg-accent-container text-on-surface'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      {customer.status}
                    </span>
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
