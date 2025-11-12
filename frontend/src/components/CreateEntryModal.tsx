import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { format } from 'date-fns';
import { notesApi, entriesApi, listsApi } from '../api';
import type { List } from '../types';
import TipTapEditor from './TipTapEditor';

interface CreateEntryModalProps {
  list?: List;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateEntryModal = ({ list, onClose, onSuccess }: CreateEntryModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize editor
  useEffect(() => {
    const editorInstance = new Editor({
      extensions: [
        StarterKit,
        Link.configure({
          openOnClick: false,
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
      ],
      content: '',
      editorProps: {
        attributes: {
          class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px]',
        },
      },
    });

    setEditor(editorInstance);

    return () => {
      editorInstance.destroy();
    };
  }, []);

  // Update content when editor changes
  useEffect(() => {
    if (editor) {
      const updateHandler = () => {
        setContent(editor.getHTML());
      };
      editor.on('update', updateHandler);
      return () => {
        editor.off('update', updateHandler);
      };
    }
  }, [editor]);

  // Add Escape key support
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleCreate = async () => {
    if (!editor) return;

    const trimmedContent = editor.getText().trim();
    if (!trimmedContent) {
      setError('Please enter some content');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Get today's date
      const today = format(new Date(), 'yyyy-MM-dd');

      // Get or create today's note
      let note;
      try {
        note = await notesApi.get(today);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          // Create today's note if it doesn't exist
          note = await notesApi.create({ date: today });
        } else {
          throw err;
        }
      }

      // Create the entry
      const newEntry = await entriesApi.create({
        note_id: note.id,
        title: title.trim() || undefined,
        content: editor.getHTML(),
      });

      // Add to list if provided
      if (list) {
        await listsApi.addEntry(list.id, newEntry.id);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating entry:', err);
      setError(err?.response?.data?.detail || 'Failed to create entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl w-full max-w-3xl flex flex-col"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          border: '1px solid var(--color-border)',
          maxHeight: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b"
          style={{
            borderColor: 'var(--color-border)',
            borderBottom: list ? `3px solid ${list.color}` : undefined,
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Create New Entry
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {list ? `Will be added to "${list.name}" and today's notes` : "Will be added to today's notes"}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 rounded-lg transition-all hover:scale-110"
              style={{
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-background)',
              }}
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {error && (
            <div
              className="mb-4 p-3 rounded-lg border"
              style={{
                backgroundColor: '#fee',
                borderColor: '#ef4444',
                color: '#ef4444',
              }}
            >
              {error}
            </div>
          )}

          {/* Title */}
          <div className="mb-4">
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title..."
              className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Content */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Content
            </label>
            {editor && (
              <div
                className="rounded-lg border-2 overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <TipTapEditor editor={editor} />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className="px-6 py-4 border-t flex gap-3"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: list ? list.color : 'var(--color-accent)',
              color: 'white',
            }}
          >
            {saving ? 'Creating...' : 'Create Entry'}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-3 rounded-lg font-semibold transition-all hover:bg-opacity-80 border-2"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEntryModal;

