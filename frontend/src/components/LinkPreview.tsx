import { useState } from 'react';
import { ExternalLink, X } from 'lucide-react';

interface LinkPreviewProps {
  url: string;
  onRemove: () => void;
}

interface PreviewData {
  title?: string;
  description?: string;
  image?: string;
  site_name?: string;
}

const LinkPreview = ({ url, onRemove }: LinkPreviewProps) => {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useState(() => {
    fetchPreview();
  });

  const fetchPreview = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/link-preview/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreview(data);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-blue-600 hover:underline"
      >
        <ExternalLink className="h-4 w-4" />
        {url}
      </a>
    );
  }

  return (
    <div className="relative border border-gray-300 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 z-10"
        title="Remove preview"
      >
        <X className="h-4 w-4" />
      </button>
      
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-4 p-4 hover:bg-gray-50 transition-colors"
      >
        {preview.image && (
          <div className="flex-shrink-0">
            <img
              src={preview.image}
              alt={preview.title || 'Preview'}
              className="w-32 h-32 object-cover rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {preview.site_name && (
            <div className="text-xs text-gray-500 mb-1">{preview.site_name}</div>
          )}
          {preview.title && (
            <div className="font-semibold text-gray-900 mb-1 line-clamp-2">
              {preview.title}
            </div>
          )}
          {preview.description && (
            <div className="text-sm text-gray-600 line-clamp-2">
              {preview.description}
            </div>
          )}
          <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            {new URL(url).hostname}
          </div>
        </div>
      </a>
    </div>
  );
};

export default LinkPreview;

