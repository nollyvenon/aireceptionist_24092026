import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';

interface AISettings {
  id: string;
  receptionist_name: string;
  receptionist_voice: 'male' | 'female' | 'neutral';
  receptionist_language: string;
  auto_call_enabled: boolean;
  auto_response_enabled: boolean;
  greeting_message: string;
  fallback_message: string;
  max_call_duration: number;
  enable_voicemail: boolean;
  enable_sms_response: boolean;
}

export default function AISettingsPage() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<AISettings>>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings/ai', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setEditData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings/ai', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Failed to save');

      const updated = await response.json();
      setSettings(updated);
      setIsEditing(false);
      setSuccess('AI Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="AI Receptionist Settings">
        <div className="space-y-6">
          <Card className="p-8">
            <Skeleton height={32} width="40%" className="mb-4" />
            <Skeleton height={20} width="60%" className="mb-2" />
            <Skeleton height={20} width="50%" />
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="AI Receptionist Settings">
      <div className="max-w-4xl space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">AI Receptionist Configuration</h2>
            <Button
              variant={isEditing ? 'secondary' : 'primary'}
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={isSaving}
            >
              {isEditing ? (isSaving ? 'Saving...' : 'Save') : 'Edit'}
            </Button>
          </div>

          <div className="space-y-6">
            <div className="border-b border-outline-variant pb-6">
              <h3 className="text-lg font-semibold text-on-surface mb-4">Basic Configuration</h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">
                    Receptionist Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.receptionist_name || ''}
                      onChange={(e) => setEditData({ ...editData, receptionist_name: e.target.value })}
                    />
                  ) : (
                    <p className="text-on-surface">{settings?.receptionist_name || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">
                    Voice
                  </label>
                  {isEditing ? (
                    <select
                      value={editData.receptionist_voice || settings?.receptionist_voice || 'female'}
                      onChange={(e) => setEditData({ ...editData, receptionist_voice: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="neutral">Neutral</option>
                    </select>
                  ) : (
                    <p className="text-on-surface capitalize">{settings?.receptionist_voice || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">
                    Language
                  </label>
                  {isEditing ? (
                    <select
                      value={editData.receptionist_language || settings?.receptionist_language || 'en'}
                      onChange={(e) => setEditData({ ...editData, receptionist_language: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                    </select>
                  ) : (
                    <p className="text-on-surface">{settings?.receptionist_language || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">
                    Max Call Duration (minutes)
                  </label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.max_call_duration || ''}
                      onChange={(e) => setEditData({ ...editData, max_call_duration: parseInt(e.target.value) })}
                    />
                  ) : (
                    <p className="text-on-surface">{settings?.max_call_duration || '-'} minutes</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-b border-outline-variant pb-6">
              <h3 className="text-lg font-semibold text-on-surface mb-4">Messages</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">
                    Greeting Message
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.greeting_message || ''}
                      onChange={(e) => setEditData({ ...editData, greeting_message: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-on-surface">{settings?.greeting_message || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">
                    Fallback Message
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.fallback_message || ''}
                      onChange={(e) => setEditData({ ...editData, fallback_message: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-on-surface">{settings?.fallback_message || '-'}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-on-surface mb-4">Features</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editData.auto_call_enabled ?? settings?.auto_call_enabled ?? true}
                    onChange={(e) => setEditData({ ...editData, auto_call_enabled: e.target.checked })}
                    disabled={!isEditing}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-on-surface">Enable Auto Call</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editData.auto_response_enabled ?? settings?.auto_response_enabled ?? true}
                    onChange={(e) => setEditData({ ...editData, auto_response_enabled: e.target.checked })}
                    disabled={!isEditing}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-on-surface">Enable Auto Response</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editData.enable_voicemail ?? settings?.enable_voicemail ?? true}
                    onChange={(e) => setEditData({ ...editData, enable_voicemail: e.target.checked })}
                    disabled={!isEditing}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-on-surface">Enable Voicemail</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editData.enable_sms_response ?? settings?.enable_sms_response ?? true}
                    onChange={(e) => setEditData({ ...editData, enable_sms_response: e.target.checked })}
                    disabled={!isEditing}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-on-surface">Enable SMS Response</span>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
