import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface CustomField {
  id: string;
  name: string;
  field_type: string;
  entity_type: string;
  is_required: boolean;
  options?: string[];
  order: number;
  is_active: boolean;
  created_at: string;
}

export default function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const fetchCustomFields = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/custom-fields', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setFields(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load custom fields');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (fieldId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/custom-fields/${fieldId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        setFields(fields.map(f => f.id === fieldId ? { ...f, is_active: !isActive } : f));
      }
    } catch (err) {
      console.error('Failed to update custom field:', err);
    }
  };

  const entities = ['all', ...new Set(fields.map(f => f.entity_type))];
  const filteredFields = fields.filter(f =>
    filter === 'all' || f.entity_type === filter
  );

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return '📝';
      case 'number':
        return '🔢';
      case 'email':
        return '📧';
      case 'phone':
        return '📞';
      case 'date':
        return '📅';
      case 'select':
        return '📋';
      case 'checkbox':
        return '☑️';
      case 'textarea':
        return '📄';
      default:
        return '❓';
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Custom Fields">
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
    <MainLayout title="Custom Fields">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Custom Fields</h1>
          <Button variant="primary">+ Add Field</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Fields</p>
            <p className="text-3xl font-bold text-on-surface">{fields.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Active</p>
            <p className="text-3xl font-bold text-accent-600">
              {fields.filter(f => f.is_active).length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Required</p>
            <p className="text-3xl font-bold text-primary-600">
              {fields.filter(f => f.is_required).length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Entity Types</p>
            <p className="text-3xl font-bold text-secondary-600">{entities.length - 1}</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              {entities.map(entity => (
                <button
                  key={entity}
                  onClick={() => setFilter(entity)}
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    filter === entity
                      ? 'bg-primary-600 text-surface'
                      : 'bg-surface-container text-on-surface'
                  }`}
                >
                  {entity}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFields.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No custom fields found</p>
            ) : (
              filteredFields
                .sort((a, b) => a.order - b.order)
                .map(field => (
                  <div key={field.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-lg hover:bg-surface-container">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{getFieldTypeIcon(field.field_type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-on-surface">{field.name}</h3>
                          {field.is_required && (
                            <span className="text-xs bg-error-container text-error px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-on-surface-variant">
                          {field.entity_type} • {field.field_type}
                          {field.options && field.options.length > 0 && ` (${field.options.length} options)`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleActive(field.id, field.is_active)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          field.is_active
                            ? 'bg-accent-container text-on-surface'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {field.is_active ? 'Active' : 'Inactive'}
                      </button>
                      <a
                        href={`/custom-fields/${field.id}`}
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
          <h3 className="text-lg font-semibold text-on-surface mb-4">✨ Field Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-on-surface-variant">
            <div>
              <p className="font-medium text-on-surface mb-2">Basic Fields</p>
              <ul className="space-y-1 ml-2">
                <li>• Text: Short text input</li>
                <li>• Textarea: Long text input</li>
                <li>• Email: Email validation</li>
                <li>• Phone: Phone format</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-on-surface mb-2">Advanced Fields</p>
              <ul className="space-y-1 ml-2">
                <li>• Date: Date picker</li>
                <li>• Select: Dropdown list</li>
                <li>• Number: Numeric input</li>
                <li>• Checkbox: Boolean toggle</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
