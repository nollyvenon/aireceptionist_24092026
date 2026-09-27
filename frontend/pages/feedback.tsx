import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface Feedback {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  category: string;
  service: string;
  created_at: string;
  status: 'new' | 'reviewed' | 'responded';
  response?: string;
}

interface FeedbackSummary {
  total_feedback: number;
  average_rating: number;
  total_reviews: number;
  response_rate: number;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [feedbackRes, summaryRes] = await Promise.all([
        fetch('/api/feedback', { headers }),
        fetch('/api/feedback/summary', { headers }),
      ]);

      if (feedbackRes.ok) {
        const data = await feedbackRes.json();
        setFeedback(data.data || []);
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (feedbackId: string) => {
    if (!response.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/feedback/${feedbackId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response }),
      });

      if (res.ok) {
        setResponse('');
        setSelectedFeedback(null);
        fetchFeedback();
      }
    } catch (err) {
      console.error('Failed to respond:', err);
    }
  };

  const filteredFeedback = feedback.filter(f =>
    filter === 'all' || f.status === filter
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className={i <= rating ? '⭐' : '☆'} />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <MainLayout title="Customer Feedback">
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
    <MainLayout title="Customer Feedback">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Feedback</p>
            <p className="text-3xl font-bold text-on-surface">{summary?.total_feedback || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Average Rating</p>
            <p className="text-3xl font-bold text-accent-600">
              {(summary?.average_rating || 0).toFixed(1)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Reviews</p>
            <p className="text-3xl font-bold text-primary-600">{summary?.total_reviews || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Response Rate</p>
            <p className="text-3xl font-bold text-secondary-600">
              {Math.round((summary?.response_rate || 0) * 100)}%
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Feedback List</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'new'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                New
              </button>
              <button
                onClick={() => setFilter('responded')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'responded'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                Responded
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredFeedback.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No feedback found</p>
            ) : (
              filteredFeedback.map(f => (
                <div key={f.id} className="border border-outline-variant rounded-lg p-4 hover:bg-surface-container transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="font-semibold text-on-surface mb-1">
                        {f.customer_name}
                      </h4>
                      <div className="mb-2">{renderStars(f.rating)}</div>
                      <p className="text-sm text-on-surface-variant mb-2">
                        Service: {f.service} • {f.category}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      f.status === 'new'
                        ? 'bg-primary-container text-on-surface'
                        : f.status === 'responded'
                        ? 'bg-accent-container text-on-surface'
                        : 'bg-surface-container text-on-surface'
                    }`}>
                      {f.status}
                    </span>
                  </div>

                  <p className="text-sm text-on-surface mb-3">{f.comment}</p>

                  {f.response && (
                    <div className="bg-surface-container-low p-3 rounded-lg mb-3">
                      <p className="text-xs font-semibold text-on-surface mb-1">Our Response:</p>
                      <p className="text-sm text-on-surface">{f.response}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-on-surface-variant">
                      {new Date(f.created_at).toLocaleDateString()}
                    </p>
                    {f.status === 'new' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedFeedback(f)}
                      >
                        Respond
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {selectedFeedback && (
          <Card className="p-6 border-l-4 border-primary-600">
            <h3 className="text-lg font-semibold text-on-surface mb-4">
              Respond to {selectedFeedback.customer_name}
            </h3>

            <div className="space-y-4">
              <div className="p-3 bg-surface-container rounded-lg">
                <p className="text-sm text-on-surface-variant mb-1">Their Feedback:</p>
                <p className="text-on-surface">{selectedFeedback.comment}</p>
              </div>

              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response..."
                className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface resize-none"
                rows={4}
              />

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => handleRespond(selectedFeedback.id)}
                  disabled={!response.trim()}
                >
                  Send Response
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedFeedback(null);
                    setResponse('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
