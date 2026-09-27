import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  preview: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/email-templates', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load email templates');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  if (isLoading) {
    return (
      <MainLayout title="Email Templates">
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
    <MainLayout title="Email Templates">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Email Templates</h1>
          <Button variant="primary">+ Create Template</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="capitalize">
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-2 text-center py-8">
              <p className="text-on-surface-variant">No templates found</p>
            </div>
          ) : (
            filteredTemplates.map(template => (
              <Card key={template.id} className="p-6 hover:bg-surface-container transition-colors">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-on-surface">{template.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${
                      template.is_active
                        ? 'bg-accent-container text-on-surface'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded capitalize">
                    {template.category}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-on-surface mb-1">Subject:</p>
                  <p className="text-sm text-on-surface-variant truncate">{template.subject}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-on-surface mb-1">Preview:</p>
                  <p className="text-sm text-on-surface-variant line-clamp-2">{template.preview}</p>
                </div>

                <div className="flex items-center justify-between mb-4 text-xs text-on-surface-variant">
                  <span>Used {template.usage_count} times</span>
                  <span>{new Date(template.updated_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`/email-templates/${template.id}`}
                    className="flex-1 text-center px-3 py-2 rounded-lg bg-primary-600 text-surface hover:bg-primary-700 text-sm font-medium"
                  >
                    Edit
                  </a>
                  <button className="flex-1 px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-sm font-medium">
                    Duplicate
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
