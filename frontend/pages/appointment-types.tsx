import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  color: string;
  description: string;
  is_active: boolean;
  category: string;
  buffer_time_before: number;
  buffer_time_after: number;
  max_bookings_per_day: number;
  booking_window_days: number;
}

export default function AppointmentTypesPage() {
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointmentTypes();
  }, []);

  const fetchAppointmentTypes = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/appointment-types', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTypes(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointment types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (typeId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointment-types/${typeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        setTypes(types.map(t => t.id === typeId ? { ...t, is_active: !isActive } : t));
      }
    } catch (err) {
      console.error('Failed to update appointment type:', err);
    }
  };

  const filteredTypes = types.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTypes = types.filter(t => t.is_active).length;

  if (isLoading) {
    return (
      <MainLayout title="Appointment Types">
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
    <MainLayout title="Appointment Types">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Appointment Types</h1>
            <p className="text-sm text-on-surface-variant">
              {activeTypes} active types
            </p>
          </div>
          <Button variant="primary">+ New Type</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Types</p>
            <p className="text-3xl font-bold text-on-surface">{types.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Active</p>
            <p className="text-3xl font-bold text-accent-600">{activeTypes}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Inactive</p>
            <p className="text-3xl font-bold text-on-surface-variant">
              {types.length - activeTypes}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search appointment types..."
              className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
            />
          </div>

          <div className="space-y-3">
            {filteredTypes.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No appointment types found</p>
            ) : (
              filteredTypes.map(type => (
                <div key={type.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-lg hover:bg-surface-container">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: type.color || '#1f1f1f' }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-on-surface">{type.name}</h3>
                        <span className="text-xs px-2 py-1 rounded bg-primary-container text-on-surface">
                          {type.duration} min
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant">{type.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-on-surface-variant">
                        <span>Category: {type.category}</span>
                        <span>Buffer: {type.buffer_time_before}min before, {type.buffer_time_after}min after</span>
                        <span>Max {type.max_bookings_per_day}/day</span>
                        <span>Book within {type.booking_window_days} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleActive(type.id, type.is_active)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        type.is_active
                          ? 'bg-accent-container text-on-surface'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {type.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <a
                      href={`/appointment-types/${type.id}`}
                      className="px-3 py-1 rounded bg-primary-600 text-surface text-sm font-medium hover:bg-primary-700"
                    >
                      Edit
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">📋 Appointment Type Settings</h3>
          <div className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex gap-3">
              <span>ℹ️</span>
              <span>Duration: Total time allocated for each appointment</span>
            </div>
            <div className="flex gap-3">
              <span>ℹ️</span>
              <span>Buffer Time: Gap before/after to prevent back-to-back bookings</span>
            </div>
            <div className="flex gap-3">
              <span>ℹ️</span>
              <span>Max Bookings: Limit appointments per day to manage staff capacity</span>
            </div>
            <div className="flex gap-3">
              <span>ℹ️</span>
              <span>Booking Window: How far in advance customers can book appointments</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
