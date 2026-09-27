import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  excerpt: string;
  author: string;
  created_at: string;
  updated_at: string;
  views: number;
  helpful_count: number;
  tags: string[];
  published: boolean;
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showNewArticle, setShowNewArticle] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    excerpt: '',
    content: '',
    tags: '',
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/knowledge-base', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setArticles(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateArticle = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        setFormData({
          title: '',
          category: '',
          excerpt: '',
          content: '',
          tags: '',
        });
        setShowNewArticle(false);
        fetchArticles();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create article');
    }
  };

  const categories = ['All', ...new Set(articles.map(a => a.category))];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory && article.published;
  });

  if (isLoading) {
    return (
      <MainLayout title="Knowledge Base">
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

  if (selectedArticle) {
    return (
      <MainLayout title={selectedArticle.title}>
        <Card className="p-8">
          <Button
            variant="secondary"
            onClick={() => setSelectedArticle(null)}
            className="mb-6"
          >
            ← Back to Knowledge Base
          </Button>

          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-on-surface mb-2">
                  {selectedArticle.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <span>{selectedArticle.category}</span>
                  <span>•</span>
                  <span>
                    By {selectedArticle.author} on{' '}
                    {new Date(selectedArticle.created_at).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{selectedArticle.views} views</span>
                </div>
              </div>
            </div>

            {selectedArticle.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-6">
                {selectedArticle.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-primary-container text-on-surface font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="prose prose-sm max-w-none mb-8">
            <div className="text-on-surface whitespace-pre-wrap leading-relaxed">
              {selectedArticle.content}
            </div>
          </div>

          <div className="border-t border-outline-variant pt-6">
            <p className="text-on-surface-variant mb-4">Was this article helpful?</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                👍 Yes ({selectedArticle.helpful_count})
              </Button>
              <Button variant="secondary" size="sm">
                👎 No
              </Button>
            </div>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Knowledge Base">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Knowledge Base</h1>
          <Button
            variant="primary"
            onClick={() => setShowNewArticle(!showNewArticle)}
          >
            {showNewArticle ? '✕ Cancel' : '+ New Article'}
          </Button>
        </div>

        {showNewArticle && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-6">Create New Article</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Article title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Category
                  </label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Getting Started"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Tags (comma-separated)
                  </label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Excerpt
                </label>
                <Input
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief summary of the article"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Article content"
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface resize-none font-mono text-sm"
                  rows={8}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="primary" onClick={handleCreateArticle}>
                Create Article
              </Button>
              <Button variant="secondary" onClick={() => setShowNewArticle(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search articles..."
            className="mb-4"
          />

          <div className="flex gap-2 flex-wrap mb-6">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.length === 0 ? (
              <p className="col-span-2 text-center text-on-surface-variant py-8">
                No articles found
              </p>
            ) : (
              filteredArticles.map(article => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="text-left p-4 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-on-surface flex-1">
                      {article.title}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded bg-surface-container text-on-surface-variant whitespace-nowrap ml-2">
                      {article.category}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>{article.views} views</span>
                    <span>{article.helpful_count} found helpful</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
