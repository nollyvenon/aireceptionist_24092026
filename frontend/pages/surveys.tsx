import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'closed' | 'archived';
  questions: number;
  responses: number;
  response_rate: number;
  average_rating: number;
  created_at: string;
  ends_at?: string;
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/surveys', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSurveys(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load surveys');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSurveys = surveys.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent-container text-on-surface';
      case 'draft':
        return 'bg-surface-container text-on-surface-variant';
      case 'closed':
        return 'bg-primary-container text-on-surface';
      case 'archived':
        return 'bg-error-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Surveys">
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
    total: surveys.length,
    active: surveys.filter(s => s.status === 'active').length,
    totalResponses: surveys.reduce((sum, s) => sum + s.responses, 0),
    avgRating: (surveys.reduce((sum, s) => sum + s.average_rating, 0) / Math.max(surveys.length, 1)).toFixed(2),
  };

  return (
    <MainLayout title="Surveys">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Surveys & Feedback</h1>
          <a
            href="/surveys/new"
            className="px-4 py-2 rounded-lg bg-primary-600 text-surface hover:bg-primary-700 font-medium"
          >
            + Create Survey
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Surveys</p>
            <p className="text-3xl font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Active</p>
            <p className="text-3xl font-bold text-accent-600">{stats.active}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Responses</p>
            <p className="text-3xl font-bold text-primary-600">{stats.totalResponses}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Rating</p>
            <p className="text-3xl font-bold text-secondary-600">{stats.avgRating} ⭐</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search surveys..."
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredSurveys.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No surveys found</p>
            ) : (
              filteredSurveys
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(survey => (
                  <div key={survey.id} className="border border-outline-variant rounded-lg p-4 hover:bg-surface-container transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-on-surface">{survey.title}</h4>
                        <p className="text-sm text-on-surface-variant mt-1">{survey.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded capitalize font-medium whitespace-nowrap ${getStatusColor(survey.status)}`}>
                        {survey.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-on-surface-variant text-xs mb-1">Questions</p>
                        <p className="font-semibold text-on-surface">{survey.questions}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant text-xs mb-1">Responses</p>
                        <p className="font-semibold text-on-surface">{survey.responses}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant text-xs mb-1">Response Rate</p>
                        <p className="font-semibold text-on-surface">{survey.response_rate}%</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant text-xs mb-1">Rating</p>
                        <p className="font-semibold text-on-surface">{survey.average_rating} ⭐</p>
                      </div>
                    </div>

                    {survey.status === 'active' && survey.ends_at && (
                      <div className="mb-4 p-2 bg-accent-container/20 rounded text-xs text-on-surface-variant">
                        Ends: {new Date(survey.ends_at).toLocaleDateString()}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={`/surveys/${survey.id}`}
                        className="flex-1 text-center px-3 py-2 rounded-lg bg-primary-600 text-surface hover:bg-primary-700 text-sm font-medium"
                      >
                        View Results
                      </a>
                      <a
                        href={`/surveys/${survey.id}/edit`}
                        className="flex-1 text-center px-3 py-2 rounded-lg bg-secondary-600 text-surface hover:bg-secondary-700 text-sm font-medium"
                      >
                        Edit
                      </a>
                      <button className="flex-1 px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-sm font-medium">
                        Duplicate
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">📊 Survey Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex gap-3">
              <span className="text-2xl">😊</span>
              <div>
                <p className="font-medium text-on-surface">Customer Satisfaction</p>
                <p className="text-xs text-on-surface-variant">NPS, CSAT, CES surveys</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-medium text-on-surface">Feedback Collection</p>
                <p className="text-xs text-on-surface-variant">Service quality, features</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <p className="font-medium text-on-surface">Market Research</p>
                <p className="text-xs text-on-surface-variant">Competitive analysis</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-medium text-on-surface">Employee Engagement</p>
                <p className="text-xs text-on-surface-variant">Team feedback, eNPS</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
