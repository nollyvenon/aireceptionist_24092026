import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorder_level: number;
  unit_cost: number;
  selling_price: number;
  supplier: string;
  last_updated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || item.status === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => a.quantity - b.quantity);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-accent-container text-on-surface';
      case 'low_stock':
        return 'bg-secondary-container text-on-surface';
      case 'out_of_stock':
        return 'bg-error-container text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const stats = {
    total: items.length,
    inStock: items.filter(i => i.status === 'in_stock').length,
    lowStock: items.filter(i => i.status === 'low_stock').length,
    outOfStock: items.filter(i => i.status === 'out_of_stock').length,
    totalValue: items.reduce((sum, i) => sum + (i.quantity * i.unit_cost), 0),
  };

  if (isLoading) {
    return (
      <MainLayout title="Inventory">
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
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
    <MainLayout title="Inventory">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface">Inventory Management</h1>
          <Button variant="primary">+ Add Item</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Items</p>
            <p className="text-3xl font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">In Stock</p>
            <p className="text-3xl font-bold text-accent-600">{stats.inStock}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Low Stock</p>
            <p className="text-3xl font-bold text-secondary-600">{stats.lowStock}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Out of Stock</p>
            <p className="text-3xl font-bold text-error-600">{stats.outOfStock}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Value</p>
            <p className="text-3xl font-bold text-primary-600">
              ${(stats.totalValue / 1000).toFixed(1)}K
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or SKU..."
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
            >
              <option value="all">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Item</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">SKU</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Category</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Quantity</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Reorder Level</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Cost</th>
                  <th className="text-right py-3 px-4 font-semibold text-on-surface">Price</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                      No items found
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-4">
                        <a href={`/inventory/${item.id}`} className="font-semibold text-primary-600 hover:underline">
                          {item.name}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface-variant text-sm">{item.sku}</td>
                      <td className="py-3 px-4 text-center text-on-surface-variant text-sm capitalize">{item.category}</td>
                      <td className="py-3 px-4 text-center font-semibold text-on-surface">{item.quantity}</td>
                      <td className="py-3 px-4 text-center text-on-surface-variant text-sm">{item.reorder_level}</td>
                      <td className="py-3 px-4 text-right text-on-surface">
                        ${item.unit_cost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-on-surface">
                        ${item.selling_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {stats.lowStock > 0 && (
          <Card className="p-6 bg-secondary-container/20">
            <h3 className="text-lg font-semibold text-on-surface mb-2">⚠️ Low Stock Alert</h3>
            <p className="text-sm text-on-surface-variant">
              {stats.lowStock} items have low stock levels. Consider reordering soon.
            </p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
