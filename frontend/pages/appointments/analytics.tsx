import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

interface Analytics {
  total_appointments: number;
  completed: number;
  cancelled: number;
  no_show: number;
  scheduled: number;
  average_duration: number;
  busiest_day: string;
  busiest_hour: number;
  cancellation_rate: number;
  no_show_rate: number;
}

interface DailyData {
  date: string;
  count: number;
}

interface HourlyData {
  hour: number;
  count: number;
}

export default function AppointmentAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
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

      const [analyticsRes, dailyRes, hourlyRes] = await Promise.all([
        fetch('/api/appointments/analytics', { headers }),
        fetch('/api/appointments/analytics/daily', { headers }),
        fetch('/api/appointments/analytics/hourly', { headers }),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }

      if (dailyRes.ok) {
        const data = await dailyRes.json();
        setDailyData(data.data || []);
      }

      if (hourlyRes.ok) {
        const data = await hourlyRes.json();
        setHourlyData(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Appointment Analytics">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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

  const maxDaily = Math.max(...dailyData.map(d => d.count), 0) || 1;
  const maxHourly = Math.max(...hourlyData.map(d => d.count), 0) || 1;

  return (
    <MainLayout title="Appointment Analytics">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Appointments</p>
            <p className="text-3xl font-bold text-on-surface">{analytics?.total_appointments || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Completed</p>
            <p className="text-3xl font-bold text-accent-600">{analytics?.completed || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Cancelled</p>
            <p className="text-3xl font-bold text-error-600">{analytics?.cancelled || 0}</p>
            {analytics && (
              <p className="text-xs text-on-surface-variant mt-2">
                {Math.round(analytics.cancellation_rate)}% rate
              </p>
            )}
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">No Shows</p>
            <p className="text-3xl font-bold text-warning-600">{analytics?.no_show || 0}</p>
            {analytics && (
              <p className="text-xs text-on-surface-variant mt-2">
                {Math.round(analytics.no_show_rate)}% rate
              </p>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Average Duration (minutes)</p>
            <p className="text-3xl font-bold text-on-surface">{analytics?.average_duration || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Busiest Time</p>
            <p className="text-3xl font-bold text-on-surface">
              {analytics?.busiest_hour}:00
            </p>
            <p className="text-xs text-on-surface-variant mt-2">Peak hour of day</p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Appointments by Day (Last 7 Days)</h3>
          <div className="space-y-3">
            {dailyData.length === 0 ? (
              <p className="text-on-surface-variant">No data available</p>
            ) : (
              dailyData.map((day) => (
                <div key={day.date}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-on-surface">{day.date}</span>
                    <span className="text-sm text-on-surface-variant">{day.count} appointments</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(day.count / maxDaily) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Appointments by Hour</h3>
          <div className="space-y-3">
            {hourlyData.length === 0 ? (
              <p className="text-on-surface-variant">No data available</p>
            ) : (
              hourlyData.map((hour) => (
                <div key={hour.hour}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-on-surface">
                      {hour.hour}:00 - {hour.hour + 1}:00
                    </span>
                    <span className="text-sm text-on-surface-variant">{hour.count} appointments</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2">
                    <div
                      className="bg-secondary-600 h-2 rounded-full"
                      style={{ width: `${(hour.count / maxHourly) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Scheduled</p>
            <p className="text-3xl font-bold text-primary-600">{analytics?.scheduled || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Completion Rate</p>
            {analytics && (
              <>
                <p className="text-3xl font-bold text-accent-600">
                  {Math.round((analytics.completed / analytics.total_appointments) * 100)}%
                </p>
              </>
            )}
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Busiest Day</p>
            <p className="text-3xl font-bold text-on-surface capitalize">
              {analytics?.busiest_day || '-'}
            </p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
