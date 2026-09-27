import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'video' | 'spreadsheet' | 'other';
  size: number;
  uploaded_by: string;
  uploaded_at: string;
  related_entity?: string;
  related_entity_type?: 'customer' | 'appointment' | 'invoice' | 'lead' | 'deal';
  download_url: string;
  tags: string[];
}

interface DocumentSummary {
  total_documents: number;
  total_size_mb: number;
  recent_documents_count: number;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [docsRes, summaryRes] = await Promise.all([
        fetch('/api/documents', { headers }),
        fetch('/api/documents/summary', { headers }),
      ]);

      if (docsRes.ok) {
        const data = await docsRes.json();
        setDocuments(data.data || []);
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        fetchDocuments();
      } else {
        setError('Failed to upload documents');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setDocuments(documents.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.type === filter;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'doc':
        return '📝';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'spreadsheet':
        return '📊';
      default:
        return '📦';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <MainLayout title="Documents">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton height={20} width="60%" className="mb-4" />
                <Skeleton height={32} width="80%" />
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Documents">
      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-error-container text-error">
            {error}
          </Card>
        )}

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Documents</p>
            <p className="text-3xl font-bold text-on-surface">{summary?.total_documents || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Total Size</p>
            <p className="text-3xl font-bold text-primary-600">
              {summary?.total_size_mb || 0} MB
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-on-surface-variant mb-2">Recent</p>
            <p className="text-3xl font-bold text-accent-600">
              {summary?.recent_documents_count || 0}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Upload Documents</h3>
          </div>
          <label className="flex items-center justify-center px-6 py-8 border-2 border-dashed border-outline-variant rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors">
            <input
              type="file"
              multiple
              onChange={handleUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.gif,.mp4,.mov"
            />
            <div className="text-center">
              <p className="text-2xl mb-2">📁</p>
              <p className="font-semibold text-on-surface">Drop files here or click to upload</p>
              <p className="text-sm text-on-surface-variant">
                PDF, Word, Excel, Images, Videos supported
              </p>
            </div>
          </label>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface">Documents Library</h3>
            <div className="flex gap-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                className="w-48"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'all'
                  ? 'bg-primary-600 text-surface'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pdf')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'pdf'
                  ? 'bg-primary-600 text-surface'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              PDF
            </button>
            <button
              onClick={() => setFilter('doc')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'doc'
                  ? 'bg-primary-600 text-surface'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              Word
            </button>
            <button
              onClick={() => setFilter('spreadsheet')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'spreadsheet'
                  ? 'bg-primary-600 text-surface'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              Spreadsheet
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'image'
                  ? 'bg-primary-600 text-surface'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              Images
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Name</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Type</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Size</th>
                  <th className="text-left py-3 px-4 font-semibold text-on-surface">Related</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Uploaded</th>
                  <th className="text-center py-3 px-4 font-semibold text-on-surface">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                      No documents found
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map(doc => (
                    <tr key={doc.id} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getFileIcon(doc.type)}</span>
                          <div>
                            <p className="font-medium text-on-surface">{doc.name}</p>
                            {doc.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {doc.tags.map(tag => (
                                  <span
                                    key={tag}
                                    className="text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-surface-container">
                          {doc.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface">
                        {formatFileSize(doc.size)}
                      </td>
                      <td className="py-3 px-4">
                        {doc.related_entity && (
                          <p className="text-sm text-on-surface-variant">
                            {doc.related_entity_type}: {doc.related_entity}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface-variant text-sm">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <a
                            href={doc.download_url}
                            download
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                          >
                            ⬇️
                          </a>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-error-600 hover:text-error-700 font-medium text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
