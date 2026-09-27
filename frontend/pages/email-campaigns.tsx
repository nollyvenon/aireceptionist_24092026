import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  recipient_count: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  conversion_count: number;
  created_at: string;
  scheduled_for?: string;
  sent_at?: string;
}

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/email-campaigns', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load email campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c =>
    filter === 'all' || c.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-accent-container text-on-surface';
      case 'sending':
        return 'bg-primary-container text-on-surface';
      case 'scheduled':
        return 'bg-secondary-container text-on-surface';
      case 'paused':
        return 'bg-error-container text-on-surface';
      case 'draft':
        return 'bg-surface-container text-on-surface-variant';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const getOpenRate = (campaign: EmailCampaign) => {
    if (campaign.sent_count === 0) return 0;
    return ((campaign.open_count / campaign.sent_count) * 100).toFixed(1);
  };

  const getClickRate = (campaign: EmailCampaign) => {
    if (campaign.sent_count === 0) return 0;
    return ((campaign.click_count / campaign.sent_count) * 100).toFixed(1);
  };

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    totalOpens: campaigns.reduce((sum, c) => sum + c.open_count, 0),
    totalClicks: campaigns.reduce((sum, c) => sum + c.click_count, 0),
  };

  if (isLoading) {
    return (
      <MainLayout title="Email Campaigns">
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
    <MainLayout title="Email Campaigns">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Email Campaigns</h1>
          <Button variant="primary">+ New Campaign</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total</p>
            <p className="text-3xl font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Sent</p>
            <p className="text-3xl font-bold text-accent-600">{stats.sent}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Scheduled</p>
            <p className="text-3xl font-bold text-secondary-600">{stats.scheduled}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Draft</p>
            <p className="text-3xl font-bold text-on-surface-variant">{stats.draft}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Opens</p>
            <p className="text-3xl font-bold text-primary-600">{stats.totalOpens.toLocaleString()}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Clicks</p>
            <p className="text-3xl font-bold text-primary-600">{stats.totalClicks.toLocaleString()}</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Campaigns</h3>
            <div className="flex gap-2 flex-wrap">
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
              {['sent', 'scheduled', 'draft'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    filter === status
                      ? 'bg-primary-600 text-surface'
                      : 'bg-surface-container text-on-surface'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredCampaigns.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No campaigns found</p>
            ) : (
              filteredCampaigns.map(campaign => (
                <div key={campaign.id} className="border border-outline-variant rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-on-surface">{campaign.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant">{campaign.subject}</p>
                    </div>
                    <a
                      href={`/email-campaigns/${campaign.id}`}
                      className="px-3 py-1 rounded bg-primary-600 text-surface text-xs font-medium hover:bg-primary-700"
                    >
                      View
                    </a>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Recipients</p>
                      <p className="font-semibold text-on-surface">{campaign.recipient_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Sent</p>
                      <p className="font-semibold text-on-surface">{campaign.sent_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Opens</p>
                      <p className="font-semibold text-primary-600">{getOpenRate(campaign)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Clicks</p>
                      <p className="font-semibold text-primary-600">{getClickRate(campaign)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Conversions</p>
                      <p className="font-semibold text-accent-600">{campaign.conversion_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Created</p>
                      <p className="text-xs text-on-surface">{new Date(campaign.created_at).toLocaleDateString()}</p>
                    </div>
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
