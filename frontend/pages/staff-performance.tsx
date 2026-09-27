import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  appointments_completed: number;
  appointments_cancelled: number;
  customer_satisfaction_score: number;
  revenue_generated: number;
  avg_call_duration: number;
  calls_handled: number;
  deals_closed: number;
  pipeline_value: number;
  performance_score: number;
}

export default function StaffPerformancePage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('performance_score');

  useEffect(() => {
    fetchStaffPerformance();
  }, []);

  const fetchStaffPerformance = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/staff-performance', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStaff(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff performance');
    } finally {
      setIsLoading(false);
    }
  };

  const sortedStaff = [...staff].sort((a, b) => {
    if (sortBy === 'performance_score') return b.performance_score - a.performance_score;
    if (sortBy === 'revenue') return b.revenue_generated - a.revenue_generated;
    if (sortBy === 'satisfaction') return b.customer_satisfaction_score - a.customer_satisfaction_score;
    if (sortBy === 'appointments') return b.appointments_completed - a.appointments_completed;
    return 0;
  });

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'bg-accent-container text-on-surface';
    if (score >= 70) return 'bg-secondary-container text-on-surface';
    if (score >= 50) return 'bg-primary-container text-on-surface';
    return 'bg-surface-container text-on-surface';
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-accent-600';
    if (score >= 70) return 'text-secondary-600';
    if (score >= 50) return 'text-primary-600';
    return 'text-error-600';
  };

  const stats = {
    totalStaff: staff.length,
    avgSatisfaction: staff.length > 0 ? (staff.reduce((sum, s) => sum + s.customer_satisfaction_score, 0) / staff.length).toFixed(1) : 0,
    totalRevenue: staff.reduce((sum, s) => sum + s.revenue_generated, 0),
    avgPerformance: staff.length > 0 ? (staff.reduce((sum, s) => sum + s.performance_score, 0) / staff.length).toFixed(0) : 0,
  };

  if (isLoading) {
    return (
      <MainLayout title="Staff Performance">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
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
    <MainLayout title="Staff Performance">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <h1 className="text-3xl font-bold text-on-surface">Staff Performance</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Staff</p>
            <p className="text-3xl font-bold text-on-surface">{stats.totalStaff}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Satisfaction</p>
            <p className="text-3xl font-bold text-accent-600">{stats.avgSatisfaction}/5</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-secondary-600">
              ${(stats.totalRevenue / 1000).toFixed(1)}K
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Performance</p>
            <p className="text-3xl font-bold text-primary-600">{stats.avgPerformance}%</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-on-surface">Performance Rankings</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm"
              >
                <option value="performance_score">Performance Score</option>
                <option value="revenue">Revenue Generated</option>
                <option value="satisfaction">Satisfaction Score</option>
                <option value="appointments">Appointments</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {sortedStaff.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No staff found</p>
            ) : (
              sortedStaff.map((member, index) => (
                <div key={member.id} className="border border-outline-variant rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-sm font-bold text-on-surface">
                        {index + 1}
                      </div>
                      <div>
                        <a
                          href={`/staff/${member.id}`}
                          className="font-semibold text-primary-600 hover:underline"
                        >
                          {member.name}
                        </a>
                        <p className="text-sm text-on-surface-variant">{member.role}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded ${getPerformanceColor(member.performance_score)}`}>
                      {member.performance_score}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Appointments</p>
                      <p className="font-semibold text-on-surface">{member.appointments_completed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Calls Handled</p>
                      <p className="font-semibold text-on-surface">{member.calls_handled}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Avg Call Duration</p>
                      <p className="font-semibold text-on-surface">{member.avg_call_duration}m</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Deals Closed</p>
                      <p className="font-semibold text-accent-600">{member.deals_closed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Revenue</p>
                      <p className="font-semibold text-secondary-600">
                        ${(member.revenue_generated / 1000).toFixed(1)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Satisfaction</p>
                      <p className={`font-semibold ${getScoreColor(member.customer_satisfaction_score * 20)}`}>
                        {member.customer_satisfaction_score}/5
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-outline-variant">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-on-surface-variant">
                        Pipeline Value: ${(member.pipeline_value / 1000).toFixed(1)}K
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Cancellations: {member.appointments_cancelled}
                      </span>
                    </div>
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
