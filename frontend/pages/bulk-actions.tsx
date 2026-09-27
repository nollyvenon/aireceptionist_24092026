import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export default function BulkActionsPage() {
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntities, setSelectedEntities] = useState('leads');
  const [filters, setFilters] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ status: string; message: string; count?: number } | null>(null);

  const actions = {
    leads: [
      { id: 'tag', name: 'Add Tags', icon: '🏷️' },
      { id: 'score', name: 'Update Score', icon: '⭐' },
      { id: 'status', name: 'Change Status', icon: '🔄' },
      { id: 'owner', name: 'Assign Owner', icon: '👤' },
      { id: 'send_email', name: 'Send Email', icon: '📧' },
      { id: 'delete', name: 'Delete', icon: '🗑️' },
    ],
    customers: [
      { id: 'tag', name: 'Add Tags', icon: '🏷️' },
      { id: 'segment', name: 'Add to Segment', icon: '📊' },
      { id: 'send_email', name: 'Send Email', icon: '📧' },
      { id: 'send_sms', name: 'Send SMS', icon: '💬' },
      { id: 'update_field', name: 'Update Field', icon: '✏️' },
      { id: 'delete', name: 'Delete', icon: '🗑️' },
    ],
    deals: [
      { id: 'stage', name: 'Move Stage', icon: '📈' },
      { id: 'tag', name: 'Add Tags', icon: '🏷️' },
      { id: 'owner', name: 'Assign Owner', icon: '👤' },
      { id: 'close_date', name: 'Update Close Date', icon: '📅' },
      { id: 'send_email', name: 'Send Email', icon: '📧' },
      { id: 'delete', name: 'Delete', icon: '🗑️' },
    ],
    appointments: [
      { id: 'cancel', name: 'Cancel', icon: '❌' },
      { id: 'reschedule', name: 'Reschedule', icon: '📅' },
      { id: 'send_reminder', name: 'Send Reminders', icon: '🔔' },
      { id: 'tag', name: 'Add Tags', icon: '🏷️' },
      { id: 'type', name: 'Change Type', icon: '🔄' },
      { id: 'delete', name: 'Delete', icon: '🗑️' },
    ],
  };

  const handleExecuteAction = async () => {
    if (!selectedAction || !selectedEntities) {
      setResult({ status: 'error', message: 'Please select an entity type and action' });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bulk-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entity_type: selectedEntities,
          action: selectedAction,
          filters,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          status: 'success',
          message: `Successfully executed action on ${data.count} ${selectedEntities}`,
          count: data.count,
        });
        setSelectedAction('');
      } else {
        setResult({
          status: 'error',
          message: 'Failed to execute bulk action. Please try again.',
        });
      }
    } catch (err) {
      setResult({
        status: 'error',
        message: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentActions = actions[selectedEntities as keyof typeof actions] || [];

  return (
    <MainLayout title="Bulk Actions">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Bulk Actions</h1>
          <p className="text-sm text-on-surface-variant">
            Perform actions on multiple records at once
          </p>
        </div>

        {result && (
          <Card className={`p-4 ${result.status === 'success' ? 'bg-accent-container text-accent' : 'bg-error-container text-error'}`}>
            <p>{result.message}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Step 1: Select Entity</h3>
            <div className="space-y-2">
              {['leads', 'customers', 'deals', 'appointments'].map(entity => (
                <button
                  key={entity}
                  onClick={() => {
                    setSelectedEntities(entity);
                    setSelectedAction('');
                  }}
                  className={`w-full p-3 rounded-lg border-2 text-left capitalize font-medium transition-colors ${
                    selectedEntities === entity
                      ? 'border-primary-600 bg-primary-container'
                      : 'border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  {entity}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Step 2: Select Action</h3>
            <div className="space-y-2">
              {currentActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => setSelectedAction(action.id)}
                  className={`w-full p-3 rounded-lg border-2 text-left font-medium transition-colors flex items-center gap-2 ${
                    selectedAction === action.id
                      ? 'border-primary-600 bg-primary-container'
                      : 'border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  <span>{action.icon}</span>
                  {action.name}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Step 3: Filter & Execute</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Filters (JSON)
                </label>
                <textarea
                  value={filters}
                  onChange={(e) => setFilters(e.target.value)}
                  placeholder='{"status": "new", "score_gte": 80}'
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm font-mono"
                  rows={4}
                />
              </div>
              <Button
                variant="primary"
                onClick={handleExecuteAction}
                disabled={isProcessing || !selectedAction}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Execute Action'}
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4">📋 Recent Bulk Actions</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border border-outline-variant rounded">
              <div>
                <p className="font-semibold text-on-surface">Update Lead Scores</p>
                <p className="text-xs text-on-surface-variant">Applied to 250 leads</p>
              </div>
              <span className="text-xs bg-accent-container px-2 py-1 rounded">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-outline-variant rounded">
              <div>
                <p className="font-semibold text-on-surface">Send Follow-up Emails</p>
                <p className="text-xs text-on-surface-variant">Applied to 120 customers</p>
              </div>
              <span className="text-xs bg-accent-container px-2 py-1 rounded">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-outline-variant rounded">
              <div>
                <p className="font-semibold text-on-surface">Move Deals to Negotiating</p>
                <p className="text-xs text-on-surface-variant">Applied to 45 deals</p>
              </div>
              <span className="text-xs bg-primary-container px-2 py-1 rounded">Completed</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">⚠️ Important Notes</h3>
          <div className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex gap-3">
              <span>•</span>
              <span>Bulk actions are applied to all records matching your filters</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Some actions cannot be undone - use with caution</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Actions run asynchronously - check back for completion status</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>All bulk actions are logged in the audit trail</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
