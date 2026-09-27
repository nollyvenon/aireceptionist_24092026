import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  subject?: string;
  content: string;
  variables: string[];
  created_at: string;
  usage_count: number;
}

const defaultTemplates = [
  {
    id: '1',
    name: 'Appointment Confirmation',
    type: 'email',
    subject: 'Your appointment is confirmed',
    content: 'Hi {{customer_name}},\n\nYour appointment is confirmed for {{date}} at {{time}}.\n\nLocation: {{location}}\nDuration: {{duration}}\n\nThank you!',
    variables: ['customer_name', 'date', 'time', 'location', 'duration'],
    usage_count: 234,
  },
  {
    id: '2',
    name: 'Appointment Reminder',
    type: 'sms',
    subject: null,
    content: 'Hi {{customer_name}}, reminder: your appointment is tomorrow at {{time}}. Reply CANCEL to reschedule.',
    variables: ['customer_name', 'time'],
    usage_count: 156,
  },
  {
    id: '3',
    name: 'Follow-up Message',
    type: 'email',
    subject: 'We hope you enjoyed your visit!',
    content: 'Hi {{customer_name}},\n\nThank you for visiting us! We hope you enjoyed your {{service}} appointment.\n\nPlease share your feedback: {{feedback_link}}\n\nBest regards',
    variables: ['customer_name', 'service', 'feedback_link'],
    usage_count: 89,
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    subject: '',
    content: '',
  });

  const handleCreateTemplate = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      return;
    }

    const newTemplate: Template = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type as 'email' | 'sms' | 'whatsapp',
      subject: formData.type === 'email' ? formData.subject : undefined,
      content: formData.content,
      variables: extractVariables(formData.content),
      created_at: new Date().toISOString(),
      usage_count: 0,
    };

    setTemplates([...templates, newTemplate]);
    resetForm();
    setShowNewTemplate(false);
  };

  const extractVariables = (content: string) => {
    const regex = /{{(\w+)}}/g;
    const matches = content.match(regex) || [];
    return [...new Set(matches.map(m => m.replace(/{{|}}/g, '')))];
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'email',
      subject: '',
      content: '',
    });
    setEditingId(null);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const filteredTemplates = templates.filter(t =>
    filter === 'all' || t.type === filter
  );

  return (
    <MainLayout title="Message Templates">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Message Templates</h1>
          <Button
            variant="primary"
            onClick={() => setShowNewTemplate(!showNewTemplate)}
          >
            {showNewTemplate ? '✕ Cancel' : '+ New Template'}
          </Button>
        </div>

        {showNewTemplate && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-6">Create New Template</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Template Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Appointment Confirmation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Message Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              {formData.type === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Subject Line
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Your appointment is confirmed"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Message Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Use {{variable}} for dynamic content&#10;Available: {{customer_name}}, {{date}}, {{time}}, {{location}}, {{service}}"
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface resize-none font-mono text-sm"
                  rows={6}
                />
                <p className="text-xs text-on-surface-variant mt-2">
                  💡 Use {{customer_name}}, {{date}}, {{time}}, {{location}}, {{service}}, {{duration}} for dynamic content
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="primary" onClick={handleCreateTemplate}>
                Create Template
              </Button>
              <Button variant="secondary" onClick={() => setShowNewTemplate(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === 'all'
                ? 'bg-primary-600 text-surface'
                : 'bg-surface-container text-on-surface'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('email')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === 'email'
                ? 'bg-primary-600 text-surface'
                : 'bg-surface-container text-on-surface'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setFilter('sms')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === 'sms'
                ? 'bg-primary-600 text-surface'
                : 'bg-surface-container text-on-surface'
            }`}
          >
            SMS
          </button>
          <button
            onClick={() => setFilter('whatsapp')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === 'whatsapp'
                ? 'bg-primary-600 text-surface'
                : 'bg-surface-container text-on-surface'
            }`}
          >
            WhatsApp
          </button>
        </div>

        <div className="space-y-3">
          {filteredTemplates.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-on-surface-variant">No templates found</p>
            </Card>
          ) : (
            filteredTemplates.map(template => (
              <Card key={template.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-on-surface">
                        {template.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                        template.type === 'email'
                          ? 'bg-primary-container text-on-surface'
                          : template.type === 'sms'
                          ? 'bg-secondary-container text-on-surface'
                          : 'bg-accent-container text-on-surface'
                      }`}>
                        {template.type}
                      </span>
                    </div>
                    {template.subject && (
                      <p className="text-sm text-on-surface-variant mb-2">
                        Subject: {template.subject}
                      </p>
                    )}
                    <div className="bg-surface-container-low p-3 rounded-lg mb-3 max-h-24 overflow-y-auto">
                      <p className="text-sm text-on-surface font-mono whitespace-pre-wrap">
                        {template.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span>Variables: {template.variables.join(', ') || 'None'}</span>
                      <span>•</span>
                      <span>Used {template.usage_count} times</span>
                      <span>•</span>
                      <span>
                        Created {new Date(template.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="primary" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      Delete
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
