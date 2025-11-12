import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { notesApi, entriesApi, listsApi } from '../api';
import type { List, NoteEntry } from '../types';
import NoteEntryCard from './NoteEntryCard';

interface CreateEntryModalProps {
  list?: List;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateEntryModal = ({ list, onClose, onSuccess }: CreateEntryModalProps) => {
  const [entry, setEntry] = useState<NoteEntry | null>(null);
  const [creating, setCreating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create entry immediately on mount
  useEffect(() => {
    createEntry();
  }, []);

  // Add Escape key support
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && entry) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [entry]);

  const createEntry = async () => {
    try {
      setCreating(true);
      setError(null);

      // Get today's date
      const today = format(new Date(), 'yyyy-MM-dd');

      // Get or create today's note
      let note;
      try {
        note = await notesApi.get(today);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          note = await notesApi.create({ date: today });
        } else {
          throw err;
        }
      }

      // Create a blank entry
      const newEntry = await entriesApi.create({
        note_id: note.id,
        content: '',
      });

      // Add to list if provided
      if (list) {
        await listsApi.addEntry(list.id, newEntry.id);
      }

      setEntry(newEntry);
    } catch (err: any) {
      console.error('Error creating entry:', err);
      setError(err?.response?.data?.detail || 'Failed to create entry');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    onSuccess();
    onClose();
  };

  const handleEntryUpdate = async (id: number, content: string) => {
    // Entry updates are handled by NoteEntryCard
    if (entry) {
      setEntry({ ...entry, content });
    }
  };

  const handleEntryDelete = async (id: number) => {
    // If they delete the entry, just close the modal
    onSuccess();
    onClose();
  };

  const handleLabelsUpdate = (entryId: number, labels: any[]) => {
    if (entry) {
      setEntry({ ...entry, labels });
    }
  };

  if (creating) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <div
          className="rounded-xl shadow-2xl p-8"
          style={{
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-primary)' }}>Creating entry...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
          className="rounded-xl shadow-2xl p-8"
          style={{
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p style={{ color: '#ef4444' }}>{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 rounded-lg"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'white',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={handleClose}
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
              New Entry
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {list ? `Added to "${list.name}" and today's notes` : "Added to today's notes"}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
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

        {/* Full NoteEntryCard */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <NoteEntryCard
            entry={entry}
            onUpdate={handleEntryUpdate}
            onDelete={handleEntryDelete}
            onLabelsUpdate={handleLabelsUpdate}
            onMoveToTop={undefined}
            selectionMode={false}
            isSelected={false}
            onSelectionChange={undefined}
            currentDate={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateEntryModal;

