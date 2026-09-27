import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface SMSTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  character_count: number;
  usage_count: number;
  created_at: string;
  is_active: boolean;
}

export default function SMSTemplatesPage() {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
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
      const response = await fetch('/api/sms-templates', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load SMS templates');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  if (isLoading) {
    return (
      <MainLayout title="SMS Templates">
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
    <MainLayout title="SMS Templates">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">SMS Templates</h1>
          <Button variant="primary">+ Create Template</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <p className="text-sm text-on-surface-variant mb-2">Avg. Characters</p>
            <p className="text-3xl font-bold text-primary-600">
              {Math.round(templates.reduce((sum, t) => sum + t.character_count, 0) / Math.max(templates.length, 1))}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Uses</p>
            <p className="text-3xl font-bold text-secondary-600">
              {templates.reduce((sum, t) => sum + t.usage_count, 0)}
            </p>
          </Card>
        </div>

        <Card className="p-6">
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

          <div className="space-y-3">
            {filteredTemplates.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No templates found</p>
            ) : (
              filteredTemplates.map(template => (
                <div key={template.id} className="border border-outline-variant rounded-lg p-4 hover:bg-surface-container transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-on-surface">{template.name}</h4>
                      <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded capitalize inline-block mt-1">
                        {template.category}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${
                      template.is_active
                        ? 'bg-accent-container text-on-surface'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">{template.content}</p>

                  <div className="flex items-center justify-between text-xs text-on-surface-variant mb-3">
                    <span>{template.character_count} characters</span>
                    <span>Used {template.usage_count} times</span>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`/sms-templates/${template.id}`}
                      className="flex-1 text-center px-3 py-2 rounded-lg bg-primary-600 text-surface hover:bg-primary-700 text-xs font-medium"
                    >
                      Edit
                    </a>
                    <button className="flex-1 px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-medium">
                      Duplicate
                    </button>
                    <button className="px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-medium">
                      Send Test
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
