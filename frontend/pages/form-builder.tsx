import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Form {
  id: string;
  name: string;
  description: string;
  field_count: number;
  submission_count: number;
  completion_rate: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export default function FormBuilderPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/forms', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setForms(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forms');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredForms = forms.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || f.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-accent-container text-on-surface';
      case 'draft':
        return 'bg-surface-container text-on-surface-variant';
      case 'archived':
        return 'bg-error-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Form Builder">
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

  const stats = {
    total: forms.length,
    published: forms.filter(f => f.status === 'published').length,
    draft: forms.filter(f => f.status === 'draft').length,
    totalSubmissions: forms.reduce((sum, f) => sum + f.submission_count, 0),
  };

  return (
    <MainLayout title="Form Builder">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Form Builder</h1>
          <a
            href="/form-builder/new"
            className="px-4 py-2 rounded-lg bg-primary-600 text-surface hover:bg-primary-700 font-medium"
          >
            + Create Form
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Forms</p>
            <p className="text-3xl font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Published</p>
            <p className="text-3xl font-bold text-accent-600">{stats.published}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Drafts</p>
            <p className="text-3xl font-bold text-primary-600">{stats.draft}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Submissions</p>
            <p className="text-3xl font-bold text-secondary-600">{stats.totalSubmissions}</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search forms..."
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Form Name</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Fields</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Submissions</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Completion</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                      No forms found
                    </td>
                  </tr>
                ) : (
                  filteredForms.map(form => (
                    <tr key={form.id} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-on-surface">{form.name}</p>
                          <p className="text-xs text-on-surface-variant">{form.description}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface-variant">{form.field_count}</td>
                      <td className="py-3 px-4 text-center text-on-surface-variant">{form.submission_count}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-surface-container-high rounded-full">
                            <div
                              className="h-2 bg-primary-600 rounded-full"
                              style={{ width: `${form.completion_rate}%` }}
                            />
                          </div>
                          <span className="text-xs text-on-surface-variant">{form.completion_rate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getStatusColor(form.status)}`}>
                          {form.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <a
                            href={`/form-builder/${form.id}`}
                            className="text-xs px-2 py-1 rounded bg-primary-600 text-surface hover:bg-primary-700"
                          >
                            Edit
                          </a>
                          <a
                            href={`/form-builder/${form.id}/responses`}
                            className="text-xs px-2 py-1 rounded bg-secondary-600 text-surface hover:bg-secondary-700"
                          >
                            Responses
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">📋 Form Builder Features</h3>
          <div className="space-y-2 text-sm text-on-surface-variant">
            <p>• Drag-and-drop form designer</p>
            <p>• 15+ field types (text, email, phone, dropdown, checkbox, radio, file upload, etc.)</p>
            <p>• Conditional logic and field dependencies</p>
            <p>• Custom validation rules and error messages</p>
            <p>• Prefill data from customer records</p>
            <p>• Multi-page forms with progress tracking</p>
            <p>• Form analytics and response tracking</p>
            <p>• Email notifications on submissions</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
