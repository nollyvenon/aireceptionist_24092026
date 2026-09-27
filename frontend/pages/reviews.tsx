import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  response?: string;
  response_at?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = reviews.filter(r =>
    filter === 'all' || r.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-accent-container text-on-surface';
      case 'pending':
        return 'bg-primary-container text-on-surface';
      case 'rejected':
        return 'bg-error-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.status === 'approved').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0,
    fiveStars: reviews.filter(r => r.rating === 5).length,
  };

  if (isLoading) {
    return (
      <MainLayout title="Customer Reviews">
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
    <MainLayout title="Customer Reviews">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <h1 className="text-3xl font-bold text-on-surface">Customer Reviews</h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Reviews</p>
            <p className="text-3xl font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Rating</p>
            <p className="text-3xl font-bold text-accent-600">{stats.avgRating}/5</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Approved</p>
            <p className="text-3xl font-bold text-accent-600">{stats.approved}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Pending</p>
            <p className="text-3xl font-bold text-primary-600">{stats.pending}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">5-Star</p>
            <p className="text-3xl font-bold text-secondary-600">{stats.fiveStars}</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Reviews</h3>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    filter === s
                      ? 'bg-primary-600 text-surface'
                      : 'bg-surface-container text-on-surface'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No reviews found</p>
            ) : (
              filteredReviews.map(review => (
                <div key={review.id} className="border border-outline-variant rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-on-surface">{review.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${getStatusColor(review.status)}`}>
                          {review.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-sm text-on-surface-variant">{review.customer_name}</p>
                        <span className="text-yellow-500">{getRatingStars(review.rating)}</span>
                      </div>
                    </div>
                    <a
                      href={`/reviews/${review.id}`}
                      className="px-3 py-1 rounded bg-primary-600 text-surface text-xs font-medium hover:bg-primary-700"
                    >
                      Respond
                    </a>
                  </div>

                  <p className="text-sm text-on-surface mb-3">{review.content}</p>

                  {review.response && (
                    <div className="bg-surface-container rounded p-3 mb-2">
                      <p className="text-xs text-on-surface-variant mb-1">Your Response:</p>
                      <p className="text-sm text-on-surface">{review.response}</p>
                      {review.response_at && (
                        <p className="text-xs text-on-surface-variant mt-2">
                          {new Date(review.response_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-on-surface-variant">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
