import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Invoice {
  id: string;
  invoice_number: string;
  customer: string;
  email: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  issued_date: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  notes: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/invoices', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = invoices
    .filter(inv => {
      const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inv.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || inv.status === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.issued_date).getTime() - new Date(a.issued_date).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-accent-container text-on-surface';
      case 'sent':
        return 'bg-primary-container text-on-surface';
      case 'viewed':
        return 'bg-secondary-container text-on-surface';
      case 'overdue':
        return 'bg-error-container text-on-surface';
      case 'draft':
        return 'bg-surface-container text-on-surface-variant';
      case 'cancelled':
        return 'bg-surface-container text-on-surface-variant';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    pending: invoices.filter(i => ['sent', 'viewed', 'draft'].includes(i.status)).length,
    totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
    overdueDue: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0),
  };

  if (isLoading) {
    return (
      <MainLayout title="Invoices">
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
    <MainLayout title="Invoices">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Invoices</h1>
          <Button variant="primary">+ New Invoice</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Invoices</p>
            <p className="text-3xl font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Paid</p>
            <p className="text-3xl font-bold text-accent-600">{stats.paid}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Pending</p>
            <p className="text-3xl font-bold text-primary-600">{stats.pending}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Overdue</p>
            <p className="text-3xl font-bold text-error-600">{stats.overdue}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-secondary-600">
              ${(stats.totalRevenue / 1000).toFixed(1)}K
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice # or customer..."
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Invoice</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Customer</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Issued</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Due</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(invoice => (
                    <tr key={invoice.id} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-4">
                        <a href={`/invoices/${invoice.id}`} className="font-semibold text-primary-600 hover:underline">
                          {invoice.invoice_number}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-on-surface">{invoice.customer}</p>
                          <p className="text-xs text-on-surface-variant">{invoice.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div>
                          <p className="font-semibold text-on-surface">${(invoice.total / 1000).toFixed(1)}K</p>
                          <p className="text-xs text-on-surface-variant">
                            +${(invoice.tax / 1000).toFixed(1)}K tax
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface-variant text-sm">
                        {new Date(invoice.issued_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface-variant text-sm">
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-1 justify-center">
                          <a
                            href={`/invoices/${invoice.id}`}
                            className="text-xs px-2 py-1 rounded bg-primary-600 text-surface hover:bg-primary-700"
                          >
                            View
                          </a>
                          {invoice.status !== 'paid' && (
                            <button className="text-xs px-2 py-1 rounded bg-secondary-600 text-surface hover:bg-secondary-700">
                              Send
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {stats.overdueDue > 0 && (
          <Card className="p-6 bg-error-container/20">
            <h3 className="text-lg font-semibold text-error mb-2">⚠️ Overdue Invoices</h3>
            <p className="text-sm text-error">
              You have ${(stats.overdueDue / 1000).toFixed(1)}K in overdue invoices. Send reminders to customers.
            </p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
