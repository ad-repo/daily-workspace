import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { notesApi, entriesApi, listsApi } from '../api';
import type { List } from '../types';
import RichTextEditor from './RichTextEditor';
import LabelSelector from './LabelSelector';
import { useTimezone } from '../contexts/TimezoneContext';
import { formatTimestamp } from '../utils/timezone';

interface CreateEntryModalProps {
  list?: List;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateEntryModal = ({ list, onClose, onSuccess }: CreateEntryModalProps) => {
  const { timezone } = useTimezone();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    // Strip HTML to check if content is empty
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    if (!textContent.trim()) {
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
        note = await notesApi.getByDate(today);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          note = await notesApi.create({ date: today });
        } else {
          throw err;
        }
      }

      // Create the entry
      const newEntry = await entriesApi.create({
        note_id: note.id,
        title: title.trim() || undefined,
        content: content,
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
        className="rounded-xl shadow-2xl w-full max-w-4xl flex flex-col"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          border: '1px solid var(--color-border)',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex justify-between items-center"
          style={{
            borderColor: 'var(--color-border)',
            borderBottom: list ? `3px solid ${list.color}` : '3px solid var(--color-accent)',
          }}
        >
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

        {/* Form styled like NoteEntryCard */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* Card wrapper to match NoteEntryCard styling */}
          <div 
            className="rounded-2xl shadow-lg overflow-hidden"
            style={{
              backgroundColor: 'var(--color-card-bg)',
            }}
          >
            <div className="p-6">
              {/* Timestamp display (current time) */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatTimestamp(new Date().toISOString(), timezone, 'h:mm a zzz')}
                  </span>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div
                  className="mb-4 p-3 rounded-lg"
                  style={{
                    backgroundColor: '#fee',
                    color: '#ef4444',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Title Input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add a title to the thing"
                  className="w-full text-lg font-semibold border-none focus:outline-none focus:ring-0 px-0"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>

              {/* Entry Labels */}
              <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
                <LabelSelector
                  entryId={0}
                  selectedLabels={selectedLabels}
                  onLabelsChange={setSelectedLabels}
                  onOptimisticUpdate={setSelectedLabels}
                />
              </div>

              {/* Rich Text Editor */}
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Add content..."
              />
            </div>
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
