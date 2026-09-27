import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_minutes: number;
  base_price: number;
  is_active: boolean;
  created_at: string;
  staff_count: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showNewService, setShowNewService] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    duration_minutes: 30,
    base_price: 0,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/services', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateService = async () => {
    if (!formData.name.trim() || !formData.category.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          name: '',
          description: '',
          category: '',
          duration_minutes: 30,
          base_price: 0,
        });
        setShowNewService(false);
        fetchServices();
      } else {
        setError('Failed to create service');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service');
    }
  };

  const handleToggleService = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/services/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        setServices(services.map(s => s.id === id ? { ...s, is_active: !isActive } : s));
      }
    } catch (err) {
      console.error('Failed to toggle service:', err);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Services">
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton height={20} width="100%" className="mb-2" />
              <Skeleton height={16} width="80%" />
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Services">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Services</h1>
          <Button
            variant="primary"
            onClick={() => setShowNewService(!showNewService)}
          >
            {showNewService ? '✕ Cancel' : '+ New Service'}
          </Button>
        </div>

        {showNewService && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-6">Create New Service</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Service Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Haircut, Consultation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Category *
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Hair Services, Consultations"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the service"
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Base Price ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="primary" onClick={handleCreateService}>
                Create Service
              </Button>
              <Button variant="secondary" onClick={() => setShowNewService(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left py-3 px-4 font-semibold text-on-surface">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-on-surface">Category</th>
                <th className="text-center py-3 px-4 font-semibold text-on-surface">Duration</th>
                <th className="text-right py-3 px-4 font-semibold text-on-surface">Price</th>
                <th className="text-center py-3 px-4 font-semibold text-on-surface">Staff</th>
                <th className="text-center py-3 px-4 font-semibold text-on-surface">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-on-surface">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                    No services created yet
                  </td>
                </tr>
              ) : (
                services.map(service => (
                  <tr key={service.id} className="border-b border-outline-variant hover:bg-surface-container">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-on-surface">{service.name}</p>
                        <p className="text-xs text-on-surface-variant">{service.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-on-surface">{service.category}</td>
                    <td className="py-3 px-4 text-center text-on-surface">
                      {service.duration_minutes} min
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-primary-600">
                      ${(service.base_price / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center text-on-surface">
                      {service.staff_count}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.is_active
                          ? 'bg-accent-container text-on-surface'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleService(service.id, service.is_active)}
                      >
                        {service.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
