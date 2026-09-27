import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';

export default function AdvancedAnalyticsPage() {
  const [dateRange, setDateRange] = useState('month');
  const [metric, setMetric] = useState('revenue');

  return (
    <MainLayout title="Advanced Analytics">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Advanced Analytics</h1>
          <div className="flex gap-3">
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
            >
              <option value="revenue">Revenue</option>
              <option value="appointments">Appointments</option>
              <option value="customers">Customers</option>
              <option value="performance">Performance</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: '$125.4K', change: '+12.5%', color: 'primary' },
            { label: 'Conversion Rate', value: '24.3%', change: '+2.1%', color: 'accent' },
            { label: 'Customer LTV', value: '$2,840', change: '+8.3%', color: 'secondary' },
            { label: 'Growth Rate', value: '15.2%', change: '+4.2%', color: 'tertiary' },
          ].map((stat, i) => (
            <Card key={i} className="p-6">
              <p className="text-sm text-on-surface-variant mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-on-surface">{stat.value}</p>
                <p className={`text-sm font-semibold text-${stat.color}-600`}>
                  {stat.change}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Revenue Trends</h3>
          <div className="h-64 bg-surface-container-high rounded-lg flex items-center justify-center">
            <p className="text-on-surface-variant">Chart visualization area</p>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Top Performing Services</h3>
            <div className="space-y-3">
              {['Consultation', 'Premium Package', 'Follow-up', 'Full Service'].map((service, i) => (
                <div key={service} className="flex items-center justify-between p-3 border border-outline-variant rounded">
                  <span className="text-on-surface">{service}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-surface-container-high rounded-full">
                      <div className="h-2 bg-primary-600 rounded-full" style={{ width: `${100 - i * 15}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-on-surface">{100 - i * 15}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Customer Segments Performance</h3>
            <div className="space-y-3">
              {['Premium', 'Standard', 'Starter', 'Trial'].map((segment, i) => (
                <div key={segment} className="flex items-center justify-between p-3 border border-outline-variant rounded">
                  <span className="text-on-surface">{segment}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-on-surface">${(15 - i * 2)}.4K</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">📊 Analytics Insights</h3>
          <div className="space-y-2 text-sm text-on-surface-variant">
            <p>• Your premium customers generate 40% more revenue than standard customers</p>
            <p>• Consultation services have the highest booking rate (68%)</p>
            <p>• Customer lifetime value increased 12% month-over-month</p>
            <p>• AI-assisted appointments have 23% higher conversion rate</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
