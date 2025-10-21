import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  site_name?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// React component for rendering the preview
const LinkPreviewComponent = ({ node }: { node: any }) => {
  const { url, title, description, image, site_name } = node.attrs;

  return (
    <NodeViewWrapper className="link-preview">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block border border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 transition-colors my-4 no-underline"
      >
        <div className="flex gap-4 p-4">
          {image && (
            <div className="flex-shrink-0">
              <img
                src={image}
                alt={title || 'Link preview'}
                className="w-32 h-32 object-cover rounded"
                onError={(e) => {
                  // Hide image if it fails to load
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {site_name && (
              <p className="text-xs text-gray-500 mb-1">{site_name}</p>
            )}
            {title && (
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{description}</p>
            )}
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <ExternalLink className="h-3 w-3" />
              <span className="truncate">{new URL(url).hostname}</span>
            </div>
          </div>
        </div>
      </a>
    </NodeViewWrapper>
  );
};

export const LinkPreviewExtension = Node.create({
  name: 'linkPreview',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      url: {
        default: null,
      },
      title: {
        default: null,
      },
      description: {
        default: null,
      },
      image: {
        default: null,
      },
      site_name: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-link-preview]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-link-preview': '' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkPreviewComponent);
  },
});

// Helper function to fetch link preview
export async function fetchLinkPreview(url: string): Promise<LinkPreviewData | null> {
  try {
    const response = await fetch(`${API_URL}/api/link-preview/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch link preview:', error);
    return null;
  }
}

