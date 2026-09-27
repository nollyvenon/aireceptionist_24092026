import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Appointment {
  id: string;
  title: string;
  customer_name: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = `${apt.title} ${apt.customer_name}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors = {
    scheduled: 'bg-primary-container text-on-surface',
    completed: 'bg-accent-container text-on-surface',
    cancelled: 'bg-surface-container-high text-on-surface-variant',
  };

  return (
    <MainLayout title="Appointments">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            <Input
              placeholder="Search appointments..."
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
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <Link href="/appointments/book">
            <Button variant="primary">Book Appointment</Button>
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
        ) : filteredAppointments.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-on-surface-variant mb-4">No appointments found</p>
            <Link href="/appointments/book">
              <Button variant="primary">Book First Appointment</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((apt) => (
              <Link key={apt.id} href={`/appointments/${apt.id}`}>
                <Card className="p-4 hover:shadow-lg cursor-pointer transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-on-surface">{apt.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[apt.status]}`}>
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant">{apt.customer_name}</p>
                      <p className="text-sm text-on-surface-variant mt-1">
                        {formatDate(apt.start_time)} • {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                      </p>
                      {apt.notes && (
                        <p className="text-sm text-on-surface-variant mt-2">{apt.notes}</p>
                      )}
                    </div>
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
