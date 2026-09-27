import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface Message {
  id: string;
  sender_name: string;
  sender_number: string;
  channel: 'sms' | 'whatsapp' | 'email';
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'failed' | 'read';
  created_at: string;
  related_contact_id?: string;
}

interface MessageSummary {
  total_messages: number;
  sms_count: number;
  whatsapp_count: number;
  email_count: number;
  today_messages: number;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [summary, setSummary] = useState<MessageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [sendingTo, setSendingTo] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [messagesRes, summaryRes] = await Promise.all([
        fetch('/api/messages', { headers }),
        fetch('/api/messages/summary', { headers }),
      ]);

      if (messagesRes.ok) {
        const data = await messagesRes.json();
        setMessages(data.data || []);
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sendingTo.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient: sendingTo,
          content: newMessage,
          channel: 'sms',
        }),
      });

      if (response.ok) {
        setNewMessage('');
        setSendingTo('');
        fetchMessages();
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const filteredMessages = filter === 'all'
    ? messages
    : messages.filter(m => m.channel === filter);

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'sms':
        return 'bg-primary-container text-on-surface';
      case 'whatsapp':
        return 'bg-accent-container text-on-surface';
      case 'email':
        return 'bg-secondary-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      case 'failed':
        return '✕';
      default:
        return '○';
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Messages">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton height={20} width="60%" className="mb-4" />
                <Skeleton height={32} width="80%" />
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Messages">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Messages</p>
            <p className="text-3xl font-bold text-on-surface">{summary?.total_messages || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">SMS</p>
            <p className="text-3xl font-bold text-primary-600">{summary?.sms_count || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">WhatsApp</p>
            <p className="text-3xl font-bold text-accent-600">{summary?.whatsapp_count || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Today</p>
            <p className="text-3xl font-bold text-secondary-600">{summary?.today_messages || 0}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Send Message</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={sendingTo}
                onChange={(e) => setSendingTo(e.target.value)}
                placeholder="Enter phone or email"
              />
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message content"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !sendingTo.trim()}
            >
              Send Message
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Message History</h3>
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
                onClick={() => setFilter('sms')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'sms'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                SMS
              </button>
              <button
                onClick={() => setFilter('whatsapp')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'whatsapp'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                WhatsApp
              </button>
              <button
                onClick={() => setFilter('email')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'email'
                    ? 'bg-primary-600 text-surface'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                Email
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredMessages.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No messages found</p>
            ) : (
              filteredMessages.map((message) => (
                <div key={message.id} className="border border-outline-variant rounded-lg p-4 hover:bg-surface-container transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getChannelColor(message.channel)}`}>
                          {message.channel}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          message.direction === 'inbound'
                            ? 'bg-accent-container text-on-surface'
                            : 'bg-primary-container text-on-surface'
                        }`}>
                          {message.direction}
                        </span>
                      </div>
                      <h4 className="font-semibold text-on-surface mb-1">
                        {message.sender_name}
                      </h4>
                      <p className="text-sm text-on-surface-variant mb-2">
                        {message.sender_number}
                      </p>
                      <p className="text-on-surface mb-2">
                        {message.content}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(message.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        message.status === 'failed'
                          ? 'bg-error-container text-on-surface'
                          : message.status === 'read'
                          ? 'bg-accent-container text-on-surface'
                          : 'bg-surface-container text-on-surface'
                      }`}>
                        {message.status}
                      </span>
                      <p className="text-lg mt-2">
                        {getStatusIcon(message.status)}
                      </p>
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
