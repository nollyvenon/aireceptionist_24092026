import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  created_at: string;
  items_count: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/billing/invoices', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      setInvoices(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = `${invoice.invoice_number}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = filteredInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const statusColors: Record<string, string> = {
    draft: 'bg-surface-container-high text-on-surface',
    sent: 'bg-primary-container text-on-surface',
    paid: 'bg-accent-container text-on-surface',
    overdue: 'bg-error-container text-on-surface',
    cancelled: 'bg-surface-container text-on-surface-variant',
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <MainLayout title="Invoices">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Amount</p>
            <p className="text-3xl font-bold text-on-surface">
              ${(totalAmount / 100).toFixed(2)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Paid</p>
            <p className="text-3xl font-bold text-accent-600">
              ${(paidAmount / 100).toFixed(2)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Outstanding</p>
            <p className="text-3xl font-bold text-error">
              ${((totalAmount - paidAmount) / 100).toFixed(2)}
            </p>
          </Card>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by invoice number..."
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <Button variant="primary">New Invoice</Button>
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
        ) : filteredInvoices.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-on-surface-variant mb-4">No invoices found</p>
            <Button variant="primary">Create First Invoice</Button>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Invoice #</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Due Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Items</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-outline-variant hover:bg-surface-container">
                    <td className="py-3 px-4 text-on-surface">{invoice.invoice_number}</td>
                    <td className="py-3 px-4 font-semibold text-on-surface">
                      ${(invoice.amount / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">
                      {formatDate(invoice.due_date)}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">{invoice.items_count}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
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
