import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed';
  source: string;
  status: 'open' | 'closed';
  value?: number;
  created_at: string;
  updated_at?: string;
  owner_id?: string;
  owner_name?: string;
}

interface Interaction {
  id: string;
  type: 'call' | 'email' | 'sms' | 'meeting' | 'note';
  description: string;
  created_at: string;
  created_by?: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by?: string;
}

export default function LeadDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Lead>>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (id) {
      fetchLeadData();
    }
  }, [id]);

  const fetchLeadData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [leadRes, interactionsRes, notesRes] = await Promise.all([
        fetch(`/api/crm/leads/${id}`, { headers }),
        fetch(`/api/crm/leads/${id}/interactions`, { headers }),
        fetch(`/api/crm/leads/${id}/notes`, { headers }),
      ]);

      if (leadRes.ok) {
        const data = await leadRes.json();
        setLead(data);
        setEditData(data);
      }

      if (interactionsRes.ok) {
        const data = await interactionsRes.json();
        setInteractions(data.data || []);
      }

      if (notesRes.ok) {
        const data = await notesRes.json();
        setNotes(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lead');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/crm/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Failed to save');

      const updated = await response.json();
      setLead(updated);
      setIsEditing(false);
      setSuccess('Lead updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/crm/leads/${id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newNote }),
      });

      if (!response.ok) throw new Error('Failed to add note');

      const note = await response.json();
      setNotes([note, ...notes]);
      setNewNote('');
      setSuccess('Note added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const stageLabels: Record<string, string> = {
    new: 'New',
    contacted: 'Contacted',
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    closed: 'Closed',
  };

  const stageColors: Record<string, string> = {
    new: 'bg-surface-container-high text-on-surface-variant',
    contacted: 'bg-primary-container text-on-surface',
    qualified: 'bg-secondary-container text-on-surface',
    proposal: 'bg-tertiary-container text-on-surface',
    negotiation: 'bg-surface-container text-on-surface',
    closed: 'bg-accent-container text-on-surface',
  };

  const getInteractionIcon = (type: string) => {
    const icons: Record<string, string> = {
      call: '📞',
      email: '📧',
      sms: '💬',
      meeting: '📅',
      note: '📝',
    };
    return icons[type] || '•';
  };

  if (isLoading) {
    return (
      <MainLayout title="Lead Detail">
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

  if (!lead) {
    return (
      <MainLayout title="Lead Not Found">
        <Card className="p-8 text-center">
          <p className="text-on-surface-variant mb-4">Lead not found</p>
          <Button variant="primary" onClick={() => router.push('/crm/leads')}>
            Back to Leads
          </Button>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${lead.first_name} ${lead.last_name}`}>
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Lead Value</p>
            <p className="text-3xl font-bold text-on-surface">
              ${(lead.value || 0) / 100}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Pipeline Stage</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageColors[lead.stage]}`}>
              {stageLabels[lead.stage]}
            </span>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              lead.status === 'open'
                ? 'bg-accent-container text-on-surface'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              {lead.status}
            </span>
          </Card>
        </div>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Lead Information</h2>
            <Button
              variant={isEditing ? 'secondary' : 'primary'}
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? 'Save' : 'Edit'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                First Name
              </label>
              {isEditing ? (
                <Input
                  value={editData.first_name || ''}
                  onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{lead.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Last Name
              </label>
              {isEditing ? (
                <Input
                  value={editData.last_name || ''}
                  onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{lead.last_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{lead.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Phone
              </label>
              {isEditing ? (
                <Input
                  value={editData.phone || ''}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{lead.phone || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Company
              </label>
              {isEditing ? (
                <Input
                  value={editData.company || ''}
                  onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{lead.company || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Title
              </label>
              {isEditing ? (
                <Input
                  value={editData.title || ''}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{lead.title || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Lead Source
              </label>
              {isEditing ? (
                <Input
                  value={editData.source || ''}
                  onChange={(e) => setEditData({ ...editData, source: e.target.value })}
                />
              ) : (
                <p className="text-on-surface">{lead.source || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Owner
              </label>
              <p className="text-on-surface">{lead.owner_name || '-'}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Recent Activity</h3>
            {interactions.length === 0 ? (
              <p className="text-on-surface-variant">No interactions recorded</p>
            ) : (
              <div className="space-y-4">
                {interactions.slice(0, 5).map((interaction) => (
                  <div key={interaction.id} className="flex gap-3">
                    <div className="text-2xl">{getInteractionIcon(interaction.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-on-surface text-sm">{interaction.description}</p>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-1">
                        <span className="capitalize">{interaction.type}</span>
                        <span>•</span>
                        <span>{formatDate(interaction.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Notes ({notes.length})</h3>
            <div className="space-y-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder-on-surface-variant text-sm resize-none"
                rows={3}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddNote}
                disabled={!newNote.trim()}
              >
                Add Note
              </Button>
            </div>
          </Card>
        </div>

        {notes.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">All Notes</h3>
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="pb-4 border-b border-outline-variant last:border-0">
                  <p className="text-on-surface">{note.content}</p>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-2">
                    <span>{formatDate(note.created_at)}</span>
                    {note.created_by && (
                      <>
                        <span>•</span>
                        <span>by {note.created_by}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
