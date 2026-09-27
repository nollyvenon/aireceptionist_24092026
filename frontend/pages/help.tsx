import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    category: 'Appointments',
    question: 'How do I book an appointment?',
    answer: 'You can book appointments through the calendar or by using the AI receptionist. Simply provide the customer details, preferred date/time, and appointment type.',
  },
  {
    id: '2',
    category: 'Appointments',
    question: 'Can I reschedule an appointment?',
    answer: 'Yes, you can reschedule appointments directly from the appointment details page or through the AI receptionist.',
  },
  {
    id: '3',
    category: 'CRM',
    question: 'How do I add a new customer?',
    answer: 'Navigate to the CRM section and click "Add Customer". Fill in the customer details and save. They will be added to your customer list.',
  },
  {
    id: '4',
    category: 'CRM',
    question: 'What is a lead pipeline?',
    answer: 'A lead pipeline is a visual representation of your sales process. Leads move through stages from "New" to "Closed". You can drag and drop leads between stages.',
  },
  {
    id: '5',
    category: 'Payments',
    question: 'How do I process a payment?',
    answer: 'Go to Billing > Payments and click "Record Payment". Select the invoice and amount, then process through your preferred payment method.',
  },
  {
    id: '6',
    category: 'Automation',
    question: 'How do I create a workflow?',
    answer: 'Navigate to Automation > Builder. Select a trigger, add actions, and save. Your workflow will execute automatically when the trigger occurs.',
  },
  {
    id: '7',
    category: 'AI Receptionist',
    question: 'Can I customize the AI voice?',
    answer: 'Yes, go to Settings > AI Configuration and choose your preferred voice (male, female, or neutral) and language.',
  },
  {
    id: '8',
    category: 'Analytics',
    question: 'What metrics should I monitor?',
    answer: 'Focus on appointment completion rate, revenue growth, staff performance, and customer satisfaction. Use the Analytics dashboard to track these.',
  },
];

export default function HelpPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...new Set(faqItems.map(item => item.category))];

  const filteredItems = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout title="Help & Support">
      <div className="space-y-6">
        <Card className="p-8 bg-gradient-to-r from-primary-600 to-accent-600">
          <h1 className="text-3xl font-bold text-surface mb-2">Help & Support</h1>
          <p className="text-surface-variant">Find answers to common questions and get support</p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="font-semibold text-on-surface mb-1">Documentation</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Browse our complete documentation and guides
            </p>
            <Button variant="secondary" size="sm">
              Read Docs
            </Button>
          </Card>
          <Card className="p-6">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-semibold text-on-surface mb-1">Chat Support</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Chat with our support team in real-time
            </p>
            <Button variant="secondary" size="sm">
              Start Chat
            </Button>
          </Card>
          <Card className="p-6">
            <div className="text-3xl mb-2">📧</div>
            <h3 className="font-semibold text-on-surface mb-1">Email Support</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Send an email to our support team
            </p>
            <Button variant="secondary" size="sm">
              Send Email
            </Button>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold text-on-surface mb-6">Frequently Asked Questions</h2>

          <div className="mb-6">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search FAQs..."
              className="mb-4"
            />

            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-surface'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">
                No FAQs match your search
              </p>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  className="border border-outline-variant rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-primary-container text-on-surface">
                        {item.category}
                      </span>
                      <h3 className="font-semibold text-on-surface">
                        {item.question}
                      </h3>
                    </div>
                    <span className="text-lg text-on-surface-variant">
                      {expandedId === item.id ? '▼' : '▶'}
                    </span>
                  </button>
                  {expandedId === item.id && (
                    <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant">
                      <p className="text-on-surface">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-on-surface mb-4">Didn't find what you're looking for?</h2>
          <div className="bg-surface-container-low p-6 rounded-lg">
            <p className="text-on-surface-variant mb-4">
              Our support team is here to help. Fill out the form below and we'll get back to you within 24 hours.
            </p>
            <div className="space-y-4">
              <Input placeholder="Your email" />
              <Input placeholder="Subject" />
              <textarea
                placeholder="Describe your issue"
                className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface resize-none"
                rows={4}
              />
              <Button variant="primary">Submit Request</Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
