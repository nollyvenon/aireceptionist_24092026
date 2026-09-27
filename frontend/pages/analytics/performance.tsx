import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

interface PerformanceMetrics {
  total_staff: number;
  average_rating: number;
  total_appointments_handled: number;
  average_appointments_per_staff: number;
  on_time_rate: number;
  cancellation_rate: number;
}

interface StaffPerformance {
  staff_id: string;
  staff_name: string;
  appointments_count: number;
  completed_count: number;
  cancelled_count: number;
  average_duration: number;
  customer_rating: number;
  on_time_rate: number;
}

interface HourlyPerformance {
  hour: number;
  appointments: number;
  completed: number;
  cancelled: number;
  average_rating: number;
}

export default function PerformanceAnalyticsPage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [hourlyPerformance, setHourlyPerformance] = useState<HourlyPerformance[]>([]);
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

      const [metricsRes, staffRes, hourlyRes] = await Promise.all([
        fetch('/api/analytics/performance', { headers }),
        fetch('/api/analytics/performance/staff', { headers }),
        fetch('/api/analytics/performance/hourly', { headers }),
      ]);

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }

      if (staffRes.ok) {
        const data = await staffRes.json();
        setStaffPerformance(data.data || []);
      }

      if (hourlyRes.ok) {
        const data = await hourlyRes.json();
        setHourlyPerformance(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Performance Analytics">
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

  return (
    <MainLayout title="Performance Analytics">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Staff</p>
            <p className="text-3xl font-bold text-on-surface">{metrics?.total_staff || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Rating</p>
            <p className="text-3xl font-bold text-accent-600">
              {(metrics?.average_rating || 0).toFixed(1)} ⭐
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Appointments</p>
            <p className="text-3xl font-bold text-primary-600">
              {metrics?.total_appointments_handled || 0}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg per Staff</p>
            <p className="text-3xl font-bold text-on-surface">
              {(metrics?.average_appointments_per_staff || 0).toFixed(0)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">On-Time Rate</p>
            <p className="text-3xl font-bold text-secondary-600">
              {Math.round((metrics?.on_time_rate || 0) * 100)}%
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Cancellation Rate</p>
            <p className="text-3xl font-bold text-error-600">
              {Math.round((metrics?.cancellation_rate || 0) * 100)}%
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Staff Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Staff</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Appointments</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Completed</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Cancelled</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Avg Duration</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Rating</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">On-Time</th>
                </tr>
              </thead>
              <tbody>
                {staffPerformance.map((staff) => (
                  <tr key={staff.staff_id} className="border-b border-outline-variant hover:bg-surface-container">
                    <td className="py-3 px-4 font-medium text-on-surface">{staff.staff_name}</td>
                    <td className="py-3 px-4 text-center text-on-surface">{staff.appointments_count}</td>
                    <td className="py-3 px-4 text-center text-accent-600 font-semibold">
                      {staff.completed_count}
                    </td>
                    <td className="py-3 px-4 text-center text-error-600">{staff.cancelled_count}</td>
                    <td className="py-3 px-4 text-center text-on-surface">
                      {staff.average_duration} min
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-on-surface">
                      {staff.customer_rating.toFixed(1)} ⭐
                    </td>
                    <td className="py-3 px-4 text-center text-secondary-600 font-semibold">
                      {Math.round(staff.on_time_rate * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Performance by Hour</h3>
          <div className="space-y-3">
            {hourlyPerformance.length === 0 ? (
              <p className="text-on-surface-variant">No data available</p>
            ) : (
              hourlyPerformance.map((hour) => (
                <div key={hour.hour}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-on-surface">
                      {hour.hour}:00 - {hour.hour + 1}:00
                    </span>
                    <span className="text-sm text-on-surface-variant">
                      {hour.appointments} appts • {hour.completed} completed • {hour.average_rating.toFixed(1)} ⭐
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2">
                    <div
                      className="bg-secondary-600 h-2 rounded-full"
                      style={{ width: `${(hour.completed / hour.appointments) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
