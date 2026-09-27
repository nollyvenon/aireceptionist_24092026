import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  manager_id?: string;
  status: 'active' | 'inactive' | 'on_leave';
  avatar_url?: string;
  joined_date: string;
}

export default function TeamDirectoryPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/team', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTeam(data.data || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeam = team.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || member.status === filter;
    return matchesSearch && matchesFilter;
  });

  const departments = ['all', ...new Set(team.map(m => m.department))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent-container text-on-surface';
      case 'on_leave':
        return 'bg-primary-container text-on-surface';
      case 'inactive':
        return 'bg-surface-container text-on-surface-variant';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Team Directory">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton height={20} width="60%" className="mb-2" />
              <Skeleton height={16} width="80%" />
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Team Directory">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-4">Team Directory</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeam.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <p className="text-on-surface-variant">No team members found</p>
            </Card>
          ) : (
            filteredTeam.map(member => (
              <Card key={member.id} className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-lg font-bold text-on-surface">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-on-surface">{member.name}</h3>
                    <p className="text-sm text-on-surface-variant">{member.role}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div>
                    <p className="text-on-surface-variant text-xs">Email</p>
                    <p className="text-on-surface">{member.email}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs">Phone</p>
                    <p className="text-on-surface">{member.phone}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs">Department</p>
                    <p className="text-on-surface">{member.department}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Joined {new Date(member.joined_date).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
