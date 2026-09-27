import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/crm/contacts', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = `${contact.first_name} ${contact.last_name} ${contact.email} ${contact.company || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <MainLayout title="Contacts">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-sm">
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/crm/contacts/new">
            <Button variant="primary">
              Add Contact
            </Button>
          </Link>
        </div>

        {error && (
          <Card className="p-4 bg-error-container text-error border-error">
            {error}
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="space-y-3">
                  <Skeleton height={20} />
                  <Skeleton height={16} width="80%" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-on-surface-variant mb-4">No contacts found</p>
            <Link href="/crm/contacts/new">
              <Button variant="primary">Create First Contact</Button>
            </Link>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Added</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-outline-variant hover:bg-surface-container">
                    <td className="py-3 px-4 font-medium text-on-surface">
                      {contact.first_name} {contact.last_name}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">{contact.email}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{contact.phone || '-'}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{contact.company || '-'}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{contact.title || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        contact.status === 'active'
                          ? 'bg-accent-container text-on-surface'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant text-sm">
                      {formatDate(contact.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/crm/contacts/${contact.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
