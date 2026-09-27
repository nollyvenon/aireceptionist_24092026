import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';

interface Appointment {
  id: string;
  title: string;
  customer_name: string;
  start_time: string;
  end_time: string;
}

export default function RescheduleAppointmentPage() {
  const router = useRouter();
  const { id } = router.query;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const fetchAppointment = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointment(data);
        setNewStartTime(data.start_time);
        setNewEndTime(data.end_time);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!newStartTime || !newEndTime) {
        throw new Error('Please select new date and time');
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          start_time: newStartTime,
          end_time: newEndTime,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reschedule appointment');
      }

      setSuccess('Appointment rescheduled successfully');
      setTimeout(() => {
        router.push(`/appointments/${id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <MainLayout title="Reschedule Appointment">
        <div className="max-w-2xl">
          <Card className="p-8">
            <Skeleton height={32} width="40%" className="mb-4" />
            <Skeleton height={20} width="60%" className="mb-2" />
            <Skeleton height={20} width="50%" />
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!appointment) {
    return (
      <MainLayout title="Appointment Not Found">
        <Card className="p-8 text-center">
          <p className="text-on-surface-variant mb-4">Appointment not found</p>
          <Button variant="primary" onClick={() => router.push('/appointments')}>
            Back to Appointments
          </Button>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Reschedule Appointment">
      <div className="max-w-2xl">
        <Card className="p-8">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

          <div className="mb-8 pb-6 border-b border-outline-variant">
            <h2 className="text-2xl font-bold text-on-surface mb-4">{appointment.title}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-on-surface-variant mb-1">Customer</p>
                <p className="text-on-surface font-medium">{appointment.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-on-surface-variant mb-1">Current Time</p>
                <p className="text-on-surface font-medium">{formatDateTime(appointment.start_time)}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                New Start Date & Time *
              </label>
              <Input
                type="datetime-local"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                New End Date & Time *
              </label>
              <Input
                type="datetime-local"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Reason for Rescheduling
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why the appointment needs to be rescheduled..."
                className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder-on-surface-variant resize-none disabled:opacity-50"
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/appointments/${id}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
