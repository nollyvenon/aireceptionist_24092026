import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { Skeleton } from '@/components/common/Skeleton';

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  status: 'active' | 'inactive' | 'invited';
  joined_at: string;
}

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings/team', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (!response.ok) throw new Error('Failed to send invite');

      setSuccess('Invitation sent successfully');
      setInviteEmail('');
      setShowInvite(false);
      setTimeout(() => setSuccess(''), 3000);
      fetchTeamMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/settings/team/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to remove member');

      setMembers(members.filter(m => m.id !== id));
      setSuccess('Team member removed');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const handleChangeRole = async (id: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/settings/team/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update role');

      setMembers(members.map(m =>
        m.id === id ? { ...m, role: newRole as any } : m
      ));
      setSuccess('Role updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-accent-container text-on-surface',
      inactive: 'bg-surface-container-high text-on-surface-variant',
      invited: 'bg-primary-container text-on-surface',
    };
    return colors[status] || 'bg-surface-container text-on-surface';
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-error-container text-on-surface',
      manager: 'bg-warning-container text-on-surface',
      staff: 'bg-secondary-container text-on-surface',
      viewer: 'bg-surface-container text-on-surface-variant',
    };
    return colors[role] || 'bg-surface-container text-on-surface';
  };

  if (isLoading) {
    return (
      <MainLayout title="Team Settings">
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
    <MainLayout title="Team Settings">
      <div className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-on-surface">Team Members ({members.length})</h2>
          <Button
            variant="primary"
            onClick={() => setShowInvite(!showInvite)}
          >
            {showInvite ? 'Cancel' : 'Invite Member'}
          </Button>
        </div>

        {showInvite && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Invite Team Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
                >
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="staff">Staff (Limited access)</option>
                  <option value="manager">Manager (Full access)</option>
                  <option value="admin">Admin (All permissions)</option>
                </select>
              </div>

              <Button type="submit" variant="primary">
                Send Invitation
              </Button>
            </form>
          </Card>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left py-3 px-4 font-semibold text-on-surface">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-on-surface">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-on-surface">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-on-surface">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-on-surface">Joined</th>
                <th className="text-right py-3 px-4 font-semibold text-on-surface">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-outline-variant hover:bg-surface-container">
                  <td className="py-3 px-4 font-medium text-on-surface">
                    {member.first_name} {member.last_name}
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant">{member.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={member.role}
                      onChange={(e) => handleChangeRole(member.id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${getRoleColor(member.role)}`}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant text-sm">
                    {formatDate(member.joined_at)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
