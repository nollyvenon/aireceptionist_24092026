import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface Voicemail {
  id: string;
  caller_name: string;
  caller_number: string;
  duration: number;
  transcription?: string;
  recording_url: string;
  is_listened: boolean;
  created_at: string;
  notes?: string;
}

interface VoicemailSummary {
  total_voicemails: number;
  unlistened_count: number;
  average_duration: number;
}

export default function VoicemailPage() {
  const [voicemails, setVoicemails] = useState<Voicemail[]>([]);
  const [summary, setSummary] = useState<VoicemailSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchVoicemails();
  }, []);

  const fetchVoicemails = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [voicemailsRes, summaryRes] = await Promise.all([
        fetch('/api/voicemail', { headers }),
        fetch('/api/voicemail/summary', { headers }),
      ]);

      if (voicemailsRes.ok) {
        const data = await voicemailsRes.json();
        setVoicemails(data.data || []);
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load voicemails');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsListened = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/voicemail/${id}/mark-listened`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setVoicemails(voicemails.map(v => v.id === id ? { ...v, is_listened: true } : v));
      }
    } catch (err) {
      console.error('Failed to mark voicemail as listened:', err);
    }
  };

  const handleDeleteVoicemail = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/voicemail/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setVoicemails(voicemails.filter(v => v.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete voicemail:', err);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <MainLayout title="Voicemail">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
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
    <MainLayout title="Voicemail">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Voicemails</p>
            <p className="text-3xl font-bold text-on-surface">{summary?.total_voicemails || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Unlistened</p>
            <p className="text-3xl font-bold text-error-600">{summary?.unlistened_count || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Duration</p>
            <p className="text-3xl font-bold text-primary-600">
              {formatDuration(summary?.average_duration || 0)}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Voicemail Messages</h3>
          <div className="space-y-3">
            {voicemails.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No voicemails</p>
            ) : (
              voicemails.map((voicemail) => (
                <div
                  key={voicemail.id}
                  className={`border border-outline-variant rounded-lg p-4 ${
                    !voicemail.is_listened ? 'bg-primary-container/10' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-on-surface">
                          {voicemail.caller_name}
                        </h4>
                        {!voicemail.is_listened && (
                          <span className="w-2 h-2 rounded-full bg-primary-600" />
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant mb-2">
                        {voicemail.caller_number}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <button className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                          <span>🔊</span> Play ({formatDuration(voicemail.duration)})
                        </button>
                      </div>

                      {voicemail.transcription && (
                        <div
                          className={`mb-3 p-3 rounded-lg ${
                            expandedId === voicemail.id
                              ? 'bg-surface-container'
                              : 'bg-surface-container-low'
                          }`}
                        >
                          <button
                            onClick={() =>
                              setExpandedId(
                                expandedId === voicemail.id ? null : voicemail.id
                              )
                            }
                            className="text-xs font-medium text-on-surface-variant hover:text-on-surface mb-2"
                          >
                            {expandedId === voicemail.id ? '▼' : '▶'} Transcription
                          </button>
                          {expandedId === voicemail.id && (
                            <p className="text-sm text-on-surface">
                              {voicemail.transcription}
                            </p>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-on-surface-variant">
                        {new Date(voicemail.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!voicemail.is_listened && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleMarkAsListened(voicemail.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDeleteVoicemail(voicemail.id)}
                      >
                        Delete
                      </Button>
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
