import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';

interface SearchResult {
  id: string;
  type: 'customer' | 'appointment' | 'deal' | 'lead' | 'contact' | 'payment';
  title: string;
  description: string;
  link: string;
  timestamp: string;
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return '👤';
      case 'appointment':
        return '📅';
      case 'deal':
        return '💼';
      case 'lead':
        return '🎯';
      case 'contact':
        return '📞';
      case 'payment':
        return '💰';
      default:
        return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer':
        return 'bg-primary-container';
      case 'appointment':
        return 'bg-secondary-container';
      case 'deal':
        return 'bg-accent-container';
      case 'lead':
        return 'bg-tertiary-container';
      case 'contact':
        return 'bg-primary-container/50';
      case 'payment':
        return 'bg-accent-container/50';
      default:
        return 'bg-surface-container';
    }
  };

  return (
    <MainLayout title="Global Search">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-4">Search Everything</h1>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers, appointments, deals, leads, contacts..."
            className="w-full"
            autoFocus
          />
        </div>

        {searchTerm.length < 2 && (
          <Card className="p-8 text-center">
            <p className="text-on-surface-variant">
              Start typing to search across customers, appointments, deals, and more...
            </p>
          </Card>
        )}

        {isSearching && (
          <Card className="p-8 text-center">
            <p className="text-on-surface-variant">Searching...</p>
          </Card>
        )}

        {!isSearching && searchTerm.length >= 2 && results.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-on-surface-variant">No results found for "{searchTerm}"</p>
          </Card>
        )}

        {results.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-on-surface mb-4">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </h2>

            <div className="space-y-2">
              {results.map(result => (
                <a
                  key={result.id}
                  href={result.link}
                  className="block"
                >
                  <Card className="p-4 hover:bg-surface-container transition-colors cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${getTypeColor(result.type)}`}>
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-on-surface truncate">
                          {result.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant truncate mb-2">
                          {result.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${getTypeColor(result.type)}`}>
                            {result.type}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            {new Date(result.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className="text-on-surface-variant">→</span>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
