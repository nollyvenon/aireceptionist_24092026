import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

interface RevenueData {
  total_revenue: number;
  mrr: number;
  arr: number;
  average_deal_size: number;
  churn_rate: number;
  ltv: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  invoices: number;
}

interface MonthlySummary {
  month: string;
  revenue: number;
  invoices: number;
  collected: number;
}

export default function RevenueAnalyticsPage() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [revenueRes, dailyRes, monthlyRes] = await Promise.all([
        fetch('/api/analytics/revenue', { headers }),
        fetch('/api/analytics/revenue/daily', { headers }),
        fetch('/api/analytics/revenue/monthly', { headers }),
      ]);

      if (revenueRes.ok) {
        const data = await revenueRes.json();
        setRevenueData(data);
      }

      if (dailyRes.ok) {
        const data = await dailyRes.json();
        setDailyRevenue(data.data || []);
      }

      if (monthlyRes.ok) {
        const data = await monthlyRes.json();
        setMonthlySummary(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Revenue Analytics">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton height={20} width="60%" className="mb-4" />
                <Skeleton height={32} width="80%" />
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  const maxDaily = Math.max(...dailyRevenue.map(d => d.revenue), 0) || 1;
  const maxMonthly = Math.max(...monthlySummary.map(m => m.revenue), 0) || 1;

  return (
    <MainLayout title="Revenue Analytics">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-on-surface">
              ${(revenueData?.total_revenue || 0) / 100}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Monthly Recurring Revenue</p>
            <p className="text-3xl font-bold text-accent-600">
              ${(revenueData?.mrr || 0) / 100}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Annual Run Rate</p>
            <p className="text-3xl font-bold text-primary-600">
              ${(revenueData?.arr || 0) / 100}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Deal Size</p>
            <p className="text-3xl font-bold text-on-surface">
              ${(revenueData?.average_deal_size || 0) / 100}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Customer LTV</p>
            <p className="text-3xl font-bold text-secondary-600">
              ${(revenueData?.ltv || 0) / 100}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Churn Rate</p>
            <p className="text-3xl font-bold text-error-600">
              {Math.round((revenueData?.churn_rate || 0) * 100)}%
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Daily Revenue (Last 30 Days)</h3>
          <div className="space-y-3">
            {dailyRevenue.length === 0 ? (
              <p className="text-on-surface-variant">No data available</p>
            ) : (
              dailyRevenue.map((day) => (
                <div key={day.date}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-on-surface">{day.date}</span>
                    <span className="text-sm text-on-surface-variant">
                      ${(day.revenue / 100).toFixed(2)} ({day.invoices} invoices)
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(day.revenue / maxDaily) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Monthly Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Month</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Collected</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Invoices</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Progress</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((month) => (
                  <tr key={month.month} className="border-b border-outline-variant">
                    <td className="py-3 px-4 font-medium text-on-surface">{month.month}</td>
                    <td className="py-3 px-4 text-right text-on-surface">
                      ${(month.revenue / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-accent-600 font-semibold">
                      ${(month.collected / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-on-surface">
                      {month.invoices}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-24 bg-surface-container-high rounded-full h-2">
                        <div
                          className="bg-accent-600 h-2 rounded-full"
                          style={{ width: `${(month.collected / month.revenue) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
