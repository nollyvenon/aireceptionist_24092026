import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface WhatsAppMessage {
  id: string;
  phone: string;
  customer_name: string;
  message: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  direction: 'inbound' | 'outbound';
  created_at: string;
  media_url?: string;
}

export default function WhatsAppManagementPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp-messages', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load WhatsApp messages');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = messages.filter(m =>
    filter === 'all' || m.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read':
        return 'bg-accent-container text-on-surface';
      case 'delivered':
        return 'bg-primary-container text-on-surface';
      case 'sent':
        return 'bg-secondary-container text-on-surface';
      case 'failed':
        return 'bg-error-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const stats = {
    total: messages.length,
    sent: messages.filter(m => m.status === 'sent').length,
    delivered: messages.filter(m => m.status === 'delivered').length,
    read: messages.filter(m => m.status === 'read').length,
    failed: messages.filter(m => m.status === 'failed').length,
    inbound: messages.filter(m => m.direction === 'inbound').length,
    outbound: messages.filter(m => m.direction === 'outbound').length,
  };

  if (isLoading) {
    return (
      <MainLayout title="WhatsApp Management">
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
    <MainLayout title="WhatsApp Management">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">WhatsApp Management</h1>
          <Button variant="primary">+ Send Message</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total</p>
            <p className="text-3xl font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Inbound</p>
            <p className="text-3xl font-bold text-primary-600">{stats.inbound}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Outbound</p>
            <p className="text-3xl font-bold text-secondary-600">{stats.outbound}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Read</p>
            <p className="text-3xl font-bold text-accent-600">{stats.read}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Delivered</p>
            <p className="text-3xl font-bold text-tertiary-600">{stats.delivered}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Sent</p>
            <p className="text-3xl font-bold text-on-surface">{stats.sent}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Failed</p>
            <p className="text-3xl font-bold text-error-600">{stats.failed}</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Messages</h3>
            <div className="flex gap-2 flex-wrap">
              {['all', 'read', 'delivered', 'sent', 'failed'].map(s => (
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

          <div className="space-y-3">
            {filteredMessages.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No messages found</p>
            ) : (
              filteredMessages
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(message => (
                  <div key={message.id} className="border border-outline-variant rounded-lg p-4 hover:bg-surface-container">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-on-surface">{message.customer_name}</h4>
                          <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-2">{message.phone}</p>
                      </div>
                      <span className="text-xs text-on-surface-variant">
                        {message.direction === 'inbound' ? '📥' : '📤'} {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-on-surface mb-2">{message.message}</p>

                    {message.media_url && (
                      <a href={message.media_url} className="text-xs text-primary-600 hover:underline">
                        View attachment
                      </a>
                    )}
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
