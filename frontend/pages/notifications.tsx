import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface Notification {
  id: string;
  type: 'appointment' | 'message' | 'payment' | 'lead' | 'system' | 'alert';
  title: string;
  description: string;
  icon: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const typeColors: Record<string, string> = {
    appointment: 'bg-primary-container',
    message: 'bg-secondary-container',
    payment: 'bg-accent-container',
    lead: 'bg-tertiary-container',
    system: 'bg-surface-container',
    alert: 'bg-error-container',
  };

  if (isLoading) {
    return (
      <MainLayout title="Notifications">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
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
    <MainLayout title="Notifications">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-on-surface-variant mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'appointment' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('appointment')}
          >
            Appointments
          </Button>
          <Button
            variant={filter === 'message' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('message')}
          >
            Messages
          </Button>
          <Button
            variant={filter === 'payment' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('payment')}
          >
            Payments
          </Button>
          <Button
            variant={filter === 'lead' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('lead')}
          >
            Leads
          </Button>
          <Button
            variant={filter === 'alert' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('alert')}
          >
            Alerts
          </Button>
        </div>

        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-on-surface-variant">
                {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 border-l-4 ${
                  notification.read ? 'opacity-75' : ''
                } ${typeColors[notification.type] || 'bg-surface-container'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-on-surface">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-primary-600" />
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant mb-2">
                      {notification.description}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(notification.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {notification.action_url && (
                      <Button variant="secondary" size="sm">
                        View
                      </Button>
                    )}
                    {!notification.read && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark read
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
