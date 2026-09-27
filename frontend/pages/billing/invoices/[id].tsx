import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_id: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  description?: string;
  payment_method?: string;
  created_at: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  status: string;
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchInvoiceData();
    }
  }, [id]);

  const fetchInvoiceData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [invoiceRes, itemsRes, paymentsRes] = await Promise.all([
        fetch(`/api/billing/invoices/${id}`, { headers }),
        fetch(`/api/billing/invoices/${id}/items`, { headers }),
        fetch(`/api/billing/invoices/${id}/payments`, { headers }),
      ]);

      if (invoiceRes.ok) {
        const data = await invoiceRes.json();
        setInvoice(data);
      }

      if (itemsRes.ok) {
        const data = await itemsRes.json();
        setLineItems(data.data || []);
      }

      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/billing/invoices/${id}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to send invoice');

      setSuccess('Invoice sent successfully');
      setTimeout(() => fetchInvoiceData(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invoice');
    }
  };

  const handleRecordPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/billing/invoices/${id}/record-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: invoice?.total }),
      });

      if (!response.ok) throw new Error('Failed to record payment');

      setSuccess('Payment recorded successfully');
      setTimeout(() => fetchInvoiceData(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-surface-container-high text-on-surface-variant',
      sent: 'bg-primary-container text-on-surface',
      viewed: 'bg-secondary-container text-on-surface',
      paid: 'bg-accent-container text-on-surface',
      overdue: 'bg-error-container text-on-surface',
      cancelled: 'bg-surface-container text-on-surface-variant',
    };
    return colors[status] || 'bg-surface-container text-on-surface';
  };

  if (isLoading) {
    return (
      <MainLayout title="Invoice">
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

  if (!invoice) {
    return (
      <MainLayout title="Invoice Not Found">
        <Card className="p-8 text-center">
          <p className="text-on-surface-variant mb-4">Invoice not found</p>
          <Button variant="primary" onClick={() => router.push('/billing/invoices')}>
            Back to Invoices
          </Button>
        </Card>
      </MainLayout>
    );
  }

  const remainingBalance = invoice.total - (payments.reduce((sum, p) => sum + p.amount, 0));

  return (
    <MainLayout title={`Invoice ${invoice.invoice_number}`}>
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Amount</p>
            <p className="text-3xl font-bold text-on-surface">${(invoice.total / 100).toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Paid</p>
            <p className="text-3xl font-bold text-accent-600">
              ${(payments.reduce((sum, p) => sum + p.amount, 0) / 100).toFixed(2)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Remaining</p>
            <p className={`text-3xl font-bold ${remainingBalance > 0 ? 'text-error-600' : 'text-accent-600'}`}>
              ${(remainingBalance / 100).toFixed(2)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
          </Card>
        </div>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-on-surface mb-2">
                Invoice #{invoice.invoice_number}
              </h2>
              <Link href={`/crm/customers/${invoice.customer_id}`}>
                <p className="text-primary-600 cursor-pointer hover:underline">
                  {invoice.customer_name}
                </p>
              </Link>
            </div>
            <div className="flex gap-2">
              {invoice.status === 'draft' && (
                <Button
                  variant="primary"
                  onClick={handleSendInvoice}
                >
                  Send Invoice
                </Button>
              )}
              {remainingBalance > 0 && invoice.status !== 'cancelled' && (
                <Button
                  variant="secondary"
                  onClick={handleRecordPayment}
                >
                  Record Payment
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm text-on-surface-variant mb-1">Issue Date</p>
              <p className="text-on-surface font-medium">{formatDate(invoice.issue_date)}</p>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant mb-1">Due Date</p>
              <p className="text-on-surface font-medium">{formatDate(invoice.due_date)}</p>
            </div>
          </div>

          {invoice.description && (
            <div className="mb-8 pb-8 border-b border-outline-variant">
              <p className="text-sm text-on-surface-variant mb-2">Description</p>
              <p className="text-on-surface">{invoice.description}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Description</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Qty</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Unit Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Total</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-outline-variant">
                    <td className="py-3 px-4 text-on-surface">{item.description}</td>
                    <td className="py-3 px-4 text-center text-on-surface">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-on-surface">
                      ${(item.unit_price / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-on-surface">
                      ${(item.total / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-sm">
              <div className="border-t-2 border-outline-variant pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-on-surface-variant">Subtotal:</span>
                  <span className="text-on-surface">${((invoice.total - invoice.tax) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-on-surface-variant">Tax:</span>
                  <span className="text-on-surface">${(invoice.tax / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t border-outline-variant">
                  <span className="text-on-surface">Total:</span>
                  <span className="text-on-surface">${(invoice.total / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {payments.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="text-left py-3 px-4 font-semibold text-on-surface">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-on-surface">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-on-surface">Method</th>
                    <th className="text-left py-3 px-4 font-semibold text-on-surface">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-outline-variant">
                      <td className="py-3 px-4 text-on-surface">{formatDate(payment.date)}</td>
                      <td className="py-3 px-4 font-semibold text-on-surface">
                        ${(payment.amount / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant">{payment.method}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-accent-container text-on-surface">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
