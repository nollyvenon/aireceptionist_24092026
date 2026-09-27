import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: string;
  steps: number;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  icon: string;
}

export default function WorkflowTemplatesPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/workflow-templates', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow templates');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['all', ...new Set(templates.map(t => t.category))];
  const filteredTemplates = templates.filter(t =>
    filter === 'all' || t.category === filter
  );

  if (isLoading) {
    return (
      <MainLayout title="Workflow Templates">
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
    <MainLayout title="Workflow Templates">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Workflow Templates</h1>
          <Button variant="primary">+ Create Template</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Templates</p>
            <p className="text-3xl font-bold text-on-surface">{templates.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Active</p>
            <p className="text-3xl font-bold text-accent-600">
              {templates.filter(t => t.is_active).length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Categories</p>
            <p className="text-3xl font-bold text-primary-600">{categories.length - 1}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Uses</p>
            <p className="text-3xl font-bold text-secondary-600">
              {templates.reduce((sum, t) => sum + t.usage_count, 0).toLocaleString()}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    filter === cat
                      ? 'bg-primary-600 text-surface'
                      : 'bg-surface-container text-on-surface'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.length === 0 ? (
              <div className="col-span-full text-center py-8 text-on-surface-variant">
                No templates found
              </div>
            ) : (
              filteredTemplates.map(template => (
                <Card key={template.id} className="p-4 border border-outline-variant hover:bg-surface-container">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{template.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-on-surface">{template.name}</h3>
                      <p className="text-xs text-on-surface-variant capitalize">{template.category}</p>
                    </div>
                  </div>

                  <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant">Trigger:</span>
                      <span className="font-medium text-on-surface">{template.trigger}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant">Steps:</span>
                      <span className="font-medium text-on-surface">{template.steps}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant">Uses:</span>
                      <span className="font-medium text-primary-600">{template.usage_count}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`/workflow-templates/${template.id}`}
                      className="flex-1 px-3 py-2 rounded bg-primary-600 text-surface text-sm font-medium text-center hover:bg-primary-700"
                    >
                      View
                    </a>
                    <button className="flex-1 px-3 py-2 rounded bg-secondary-600 text-surface text-sm font-medium hover:bg-secondary-700">
                      Use
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
