import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface CalendarEvent {
  id: string;
  title: string;
  customer_name: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'appointment' | 'meeting' | 'task' | 'reminder';
  location?: string;
  attendees: string[];
}

interface CalendarDay {
  date: string;
  day_name: string;
  events_count: number;
  events: CalendarEvent[];
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth]);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const monthStr = currentMonth.toISOString().substring(0, 7);
      const response = await fetch(`/api/calendar/${monthStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCalendarDays(data.days || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const selected = calendarDays.find(d => d.date === selectedDate);
    setSelectedDayEvents(selected?.events || []);
  }, [selectedDate, calendarDays]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-primary-container';
      case 'completed':
        return 'bg-accent-container';
      case 'cancelled':
        return 'bg-surface-container';
      case 'no-show':
        return 'bg-error-container';
      default:
        return 'bg-surface-container';
    }
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const emptyDays = Array(firstDay).fill(null);
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  if (isLoading && calendarDays.length === 0) {
    return (
      <MainLayout title="Calendar">
        <div className="space-y-6">
          <Skeleton height={300} width="100%" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Calendar">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-on-surface">{monthName}</h2>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={prevMonth}>
                ← Prev
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setCurrentMonth(new Date())}>
                Today
              </Button>
              <Button variant="secondary" size="sm" onClick={nextMonth}>
                Next →
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map(day => (
              <div key={day} className="text-center font-semibold text-on-surface-variant py-2">
                {day}
              </div>
            ))}

            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {dayNumbers.map(day => {
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayData = calendarDays.find(d => d.date === dateStr);
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square p-2 rounded-lg border-2 text-center flex flex-col items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-primary-600 bg-primary-container'
                      : 'border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="font-semibold text-on-surface">{day}</span>
                  {dayData && dayData.events_count > 0 && (
                    <span className="text-xs mt-1 px-1.5 py-0.5 rounded-full bg-primary-600 text-surface font-medium">
                      {dayData.events_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </h3>
            <Button variant="primary" className="w-full mb-4">
              + New Event
            </Button>

            <div className="space-y-3">
              {selectedDayEvents.length === 0 ? (
                <p className="text-on-surface-variant text-sm text-center py-4">
                  No events scheduled
                </p>
              ) : (
                selectedDayEvents.map(event => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg ${getStatusColor(event.status)}`}
                  >
                    <h4 className="font-semibold text-on-surface text-sm mb-1">
                      {event.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant mb-2">
                      {event.customer_name}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(event.start_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(event.end_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {event.location && (
                      <p className="text-xs text-on-surface-variant mt-2">
                        📍 {event.location}
                      </p>
                    )}
                    <span className="inline-block text-xs px-2 py-1 rounded mt-2 bg-surface-container text-on-surface-variant capitalize font-medium">
                      {event.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
