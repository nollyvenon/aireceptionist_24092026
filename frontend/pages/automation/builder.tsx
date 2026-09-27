import { useState } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  name: string;
  config: Record<string, any>;
}

export default function AutomationBuilderPage() {
  const router = useRouter();
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [selectedTrigger, setSelectedTrigger] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const availableTriggers = [
    { id: 'appointment_scheduled', name: 'Appointment Scheduled' },
    { id: 'appointment_completed', name: 'Appointment Completed' },
    { id: 'lead_created', name: 'Lead Created' },
    { id: 'deal_closed', name: 'Deal Closed' },
    { id: 'payment_received', name: 'Payment Received' },
    { id: 'customer_signup', name: 'Customer Signup' },
  ];

  const availableActions = [
    { id: 'send_email', name: 'Send Email' },
    { id: 'send_sms', name: 'Send SMS' },
    { id: 'create_task', name: 'Create Task' },
    { id: 'update_deal', name: 'Update Deal' },
    { id: 'assign_owner', name: 'Assign Owner' },
    { id: 'webhook', name: 'Call Webhook' },
    { id: 'delay', name: 'Wait/Delay' },
  ];

  const handleAddTrigger = () => {
    if (!selectedTrigger) return;

    const trigger = availableTriggers.find(t => t.id === selectedTrigger);
    if (trigger) {
      const newStep: WorkflowStep = {
        id: Date.now().toString(),
        type: 'trigger',
        name: trigger.name,
        config: {},
      };
      setSteps([newStep, ...steps]);
      setSelectedTrigger('');
    }
  };

  const handleAddAction = (actionId: string) => {
    const action = availableActions.find(a => a.id === actionId);
    if (action) {
      const newStep: WorkflowStep = {
        id: Date.now().toString(),
        type: 'action',
        name: action.name,
        config: {},
      };
      setSteps([...steps, newStep]);
    }
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const handleSave = async () => {
    if (!workflowName.trim()) {
      setError('Workflow name is required');
      return;
    }

    if (steps.length === 0) {
      setError('Add at least one trigger and one action');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: workflowName,
          description: workflowDescription,
          steps,
          status: 'draft',
        }),
      });

      if (!response.ok) throw new Error('Failed to save workflow');

      const data = await response.json();
      setSuccess('Workflow saved successfully');
      setTimeout(() => {
        router.push(`/automation/${data.id}/edit`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout title="Workflow Builder">
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-on-surface mb-6">Create New Workflow</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  Workflow Name *
                </label>
                <Input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="e.g., Send welcome email to new customers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  Description
                </label>
                <Input
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Describe what this workflow does"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-xl font-semibold text-on-surface mb-6">Workflow Builder</h3>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-on-surface mb-4">Trigger</h4>
              <div className="space-y-2 mb-4">
                <select
                  value={selectedTrigger}
                  onChange={(e) => setSelectedTrigger(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
                >
                  <option value="">Select a trigger</option>
                  {availableTriggers.map((trigger) => (
                    <option key={trigger.id} value={trigger.id}>
                      {trigger.name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddTrigger}
                  disabled={!selectedTrigger}
                >
                  Add Trigger
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-on-surface mb-4">Actions</h4>
              <div className="space-y-2">
                {availableActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddAction(action.id)}
                    className="w-full"
                  >
                    + {action.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-on-surface mb-4">Current Flow</h4>
              <div className="space-y-2">
                {steps.length === 0 ? (
                  <p className="text-on-surface-variant text-sm">No steps added yet</p>
                ) : (
                  steps.map((step, index) => (
                    <div key={step.id} className="flex flex-col gap-2">
                      {index > 0 && <div className="text-center text-on-surface-variant text-xs">↓</div>}
                      <Card className="p-3 bg-surface-container">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-on-surface truncate">
                              {step.name}
                            </p>
                            <p className="text-xs text-on-surface-variant capitalize">
                              {step.type}
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRemoveStep(step.id)}
                          >
                            ✕
                          </Button>
                        </div>
                      </Card>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Workflow'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/automation')}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
