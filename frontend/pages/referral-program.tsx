import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface ReferralRecord {
  id: string;
  referrer_name: string;
  referrer_email: string;
  referred_customer: string;
  referred_email: string;
  status: 'pending' | 'converted' | 'completed';
  referral_reward: number;
  referred_customer_id: string;
  created_at: string;
  converted_at?: string;
}

interface ReferralStats {
  total_referrals: number;
  pending_referrals: number;
  converted_referrals: number;
  completed_referrals: number;
  total_rewards_issued: number;
  total_revenue_from_referrals: number;
}

export default function ReferralProgramPage() {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const [referralsRes, statsRes] = await Promise.all([
        fetch('/api/referrals', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/referrals/stats', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (referralsRes.ok) {
        const data = await referralsRes.json();
        setReferrals(data.data || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referral data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReferrals = referrals.filter(r =>
    filter === 'all' || r.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent-container text-on-surface';
      case 'converted':
        return 'bg-secondary-container text-on-surface';
      case 'pending':
        return 'bg-primary-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Referral Program">
        <div className="space-y-4">
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
    <MainLayout title="Referral Program">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Referral Program</h1>
          <Button variant="primary">+ Send Referral</Button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card className="p-6">
              <p className="text-sm text-on-surface-variant mb-2">Total Referrals</p>
              <p className="text-3xl font-bold text-on-surface">{stats.total_referrals}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-on-surface-variant mb-2">Pending</p>
              <p className="text-3xl font-bold text-primary-600">{stats.pending_referrals}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-on-surface-variant mb-2">Converted</p>
              <p className="text-3xl font-bold text-secondary-600">{stats.converted_referrals}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-on-surface-variant mb-2">Completed</p>
              <p className="text-3xl font-bold text-accent-600">{stats.completed_referrals}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-on-surface-variant mb-2">Rewards Issued</p>
              <p className="text-3xl font-bold text-tertiary-600">
                ${(stats.total_rewards_issued / 1000).toFixed(1)}K
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-on-surface-variant mb-2">Revenue from Referrals</p>
              <p className="text-3xl font-bold text-secondary-600">
                ${(stats.total_revenue_from_referrals / 1000).toFixed(1)}K
              </p>
            </Card>
          </div>
        )}

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Referral History</h3>
            <div className="flex gap-2">
              {['all', 'pending', 'converted', 'completed'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    filter === s
                      ? 'bg-primary-600 text-surface'
                      : 'bg-surface-container text-on-surface'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Referrer</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Referred Customer</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Reward</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                      No referrals found
                    </td>
                  </tr>
                ) : (
                  filteredReferrals.map(referral => (
                    <tr key={referral.id} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-on-surface">{referral.referrer_name}</p>
                          <p className="text-xs text-on-surface-variant">{referral.referrer_email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-on-surface">{referral.referred_customer}</p>
                          <p className="text-xs text-on-surface-variant">{referral.referred_email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getStatusColor(referral.status)}`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-on-surface">
                        ${(referral.referral_reward / 1000).toFixed(1)}K
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface-variant text-sm">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">🎁 Referral Program Settings</h3>
          <div className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex gap-3">
              <span>•</span>
              <span>Reward: $500 per completed referral</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Status: Pending → Customer signs up / Converted → First payment received / Completed</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Payouts: Rewards issued automatically after 30 days</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Tracking: Unique referral links for each team member</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
