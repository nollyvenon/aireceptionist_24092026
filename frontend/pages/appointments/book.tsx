import { useState } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';

export default function BookAppointmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_email: '',
    customer_name: '',
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.customer_name) errors.customer_name = 'Customer name is required';
    if (!formData.customer_email) errors.customer_email = 'Email is required';
    if (!formData.title) errors.title = 'Appointment title is required';
    if (!formData.start_time) errors.start_time = 'Start time is required';
    if (!formData.end_time) errors.end_time = 'End time is required';

    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time).getTime();
      const end = new Date(formData.end_time).getTime();
      if (end <= start) {
        errors.end_time = 'End time must be after start time';
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          status: 'scheduled',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to book appointment');
      }

      const { id } = await response.json();
      router.push(`/appointments/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout title="Book Appointment">
      <Card className="p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert
              type="error"
              title="Error"
              message={error}
              onClose={() => setError('')}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              error={fieldErrors.customer_name}
              placeholder="John Doe"
              required
            />
            <Input
              label="Email"
              name="customer_email"
              type="email"
              value={formData.customer_email}
              onChange={handleChange}
              error={fieldErrors.customer_email}
              placeholder="john@example.com"
              required
            />
          </div>

          <Input
            label="Appointment Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={fieldErrors.title}
            placeholder="e.g., Consultation, Follow-up Meeting"
            required
          />

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Appointment description..."
              className="w-full px-4 py-2.5 rounded-lg border-2 border-outline-variant bg-surface-container-lowest text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary-600 focus:ring-0"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              name="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={handleChange}
              error={fieldErrors.start_time}
              required
            />
            <Input
              label="End Time"
              name="end_time"
              type="datetime-local"
              value={formData.end_time}
              onChange={handleChange}
              error={fieldErrors.end_time}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Internal notes..."
              className="w-full px-4 py-2.5 rounded-lg border-2 border-outline-variant bg-surface-container-lowest text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary-600 focus:ring-0"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Book Appointment
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/appointments')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </MainLayout>
  );
}
