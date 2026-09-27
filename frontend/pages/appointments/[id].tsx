import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';

interface Appointment {
  id: string;
  title: string;
  customer_id: string;
  customer_name: string;
  start_time: string;
  end_time: string;
  description?: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: string;
  created_by?: string;
  created_at: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by?: string;
}

export default function AppointmentDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Appointment>>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (id) {
      fetchAppointmentData();
    }
  }, [id]);

  const fetchAppointmentData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [appointmentRes, notesRes] = await Promise.all([
        fetch(`/api/appointments/${id}`, { headers }),
        fetch(`/api/appointments/${id}/notes`, { headers }),
      ]);

      if (appointmentRes.ok) {
        const data = await appointmentRes.json();
        setAppointment(data);
        setEditData(data);
      }

      if (notesRes.ok) {
        const data = await notesRes.json();
        setNotes(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Failed to save');

      const updated = await response.json();
      setAppointment(updated);
      setIsEditing(false);
      setSuccess('Appointment updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newNote }),
      });

      if (!response.ok) throw new Error('Failed to add note');

      const note = await response.json();
      setNotes([note, ...notes]);
      setNewNote('');
      setSuccess('Note added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-primary-container text-on-surface',
      completed: 'bg-accent-container text-on-surface',
      cancelled: 'bg-error-container text-on-surface',
      'no-show': 'bg-surface-container-high text-on-surface-variant',
    };
    return colors[status] || 'bg-surface-container text-on-surface';
  };

  if (isLoading) {
    return (
      <MainLayout title="Appointment Detail">
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
    <MainLayout title={appointment.title}>
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Date & Time</p>
            <p className="text-lg font-semibold text-on-surface">
              {formatDateTime(appointment.start_time)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Customer</p>
            <Link href={`/crm/customers/${appointment.customer_id}`}>
              <p className="text-lg font-semibold text-primary-600 cursor-pointer hover:underline">
                {appointment.customer_name}
              </p>
            </Link>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
          </Card>
        </div>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Appointment Details</h2>
            <div className="flex gap-2">
              <Link href={`/appointments/reschedule/${appointment.id}`}>
                <Button variant="secondary" size="sm">
                  Reschedule
                </Button>
              </Link>
              <Button
                variant={isEditing ? 'secondary' : 'primary'}
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? 'Save' : 'Edit'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Title
              </label>
              {isEditing ? (
                <Input
                  value={editData.title || ''}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{appointment.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Type
              </label>
              <p className="text-on-surface">{appointment.type}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Start Time
              </label>
              {isEditing ? (
                <Input
                  type="datetime-local"
                  value={editData.start_time || ''}
                  onChange={(e) => setEditData({ ...editData, start_time: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{formatDateTime(appointment.start_time)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                End Time
              </label>
              {isEditing ? (
                <Input
                  type="datetime-local"
                  value={editData.end_time || ''}
                  onChange={(e) => setEditData({ ...editData, end_time: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{formatDateTime(appointment.end_time)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Location
              </label>
              {isEditing ? (
                <Input
                  value={editData.location || ''}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{appointment.location || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Status
              </label>
              {isEditing ? (
                <select
                  value={editData.status || appointment.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface resize-none"
                  rows={3}
                />
              ) : (
                <p className="text-on-surface">{appointment.description || '-'}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Add Note</h3>
          <div className="space-y-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about this appointment..."
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder-on-surface-variant text-sm resize-none"
              rows={3}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddNote}
              disabled={!newNote.trim()}
            >
              Add Note
            </Button>
          </div>
        </Card>

        {notes.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Notes ({notes.length})</h3>
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="pb-4 border-b border-outline-variant last:border-0">
                  <p className="text-on-surface">{note.content}</p>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-2">
                    <span>{formatDate(note.created_at)}</span>
                    {note.created_by && (
                      <>
                        <span>•</span>
                        <span>by {note.created_by}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
