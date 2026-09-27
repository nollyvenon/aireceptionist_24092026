import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

interface TaxRule {
  id: string;
  name: string;
  type: string;
  rate: number;
  applies_to: string;
  regions: string[];
  is_active: boolean;
  created_at: string;
}

export default function TaxManagementPage() {
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTaxRules();
  }, []);

  const fetchTaxRules = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tax-rules', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRules(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tax rules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (ruleId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tax-rules/${ruleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        setRules(rules.map(r => r.id === ruleId ? { ...r, is_active: !isActive } : r));
      }
    } catch (err) {
      console.error('Failed to update tax rule:', err);
    }
  };

  const activeRules = rules.filter(r => r.is_active).length;
  const avgRate = rules.length > 0 ? (rules.reduce((sum, r) => sum + r.rate, 0) / rules.length).toFixed(2) : 0;

  if (isLoading) {
    return (
      <MainLayout title="Tax Management">
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
    <MainLayout title="Tax Management">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Tax Management</h1>
          <Button variant="primary">+ Add Tax Rule</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Rules</p>
            <p className="text-3xl font-bold text-on-surface">{rules.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Active</p>
            <p className="text-3xl font-bold text-accent-600">{activeRules}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Avg Tax Rate</p>
            <p className="text-3xl font-bold text-primary-600">{avgRate}%</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Regions Covered</p>
            <p className="text-3xl font-bold text-secondary-600">
              {new Set(rules.flatMap(r => r.regions)).size}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-6">Tax Rules</h3>

          <div className="space-y-3">
            {rules.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No tax rules configured</p>
            ) : (
              rules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-lg hover:bg-surface-container">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-on-surface">{rule.name}</h4>
                      <span className="text-xs bg-primary-container px-2 py-1 rounded">
                        {rule.rate}%
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant mb-2">
                      Type: {rule.type} • Applies to: {rule.applies_to}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {rule.regions.map(region => (
                        <span key={region} className="text-xs px-2 py-1 rounded bg-surface-container text-on-surface-variant">
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => handleToggleActive(rule.id, rule.is_active)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        rule.is_active
                          ? 'bg-accent-container text-on-surface'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <a
                      href={`/tax-management/${rule.id}`}
                      className="px-3 py-1 rounded bg-primary-600 text-surface text-sm font-medium hover:bg-primary-700"
                    >
                      Edit
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 bg-primary-container/20">
          <h3 className="text-lg font-semibold text-on-surface mb-4">📋 Tax Configuration Guide</h3>
          <div className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex gap-3">
              <span>•</span>
              <span>Sales Tax: Applied to sales within specific regions</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>VAT: Value-added tax for EU and international regions</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>GST: Goods and services tax for Australia and Canada</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Service Tax: Applied to service-based invoices</span>
            </div>
            <div className="flex gap-3">
              <span>•</span>
              <span>Enable/disable rules as needed for different products/services</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
