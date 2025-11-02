import { useState, useEffect } from 'react';
import { Trash2, Clock, FileText, Star, Check, Copy, CheckCheck, ArrowRight, Skull, ArrowUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';
import type { NoteEntry } from '../types';
import RichTextEditor from './RichTextEditor';
import CodeEditor from './CodeEditor';
import LabelSelector from './LabelSelector';
import { useTimezone } from '../contexts/TimezoneContext';
import { formatTimestamp } from '../utils/timezone';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface NoteEntryCardProps {
  entry: NoteEntry;
  onUpdate: (id: number, content: string) => void;
  onDelete: (id: number) => void;
  onLabelsUpdate: (entryId: number, labels: any[]) => void;
  onMoveToTop?: (id: number) => void;
  isSelected?: boolean;
  onSelectionChange?: (id: number, selected: boolean) => void;
  selectionMode?: boolean;
  currentDate?: string; // YYYY-MM-DD format
}

const NoteEntryCard = ({ entry, onUpdate, onDelete, onLabelsUpdate, onMoveToTop, isSelected = false, onSelectionChange, selectionMode = false, currentDate }: NoteEntryCardProps) => {
  const { timezone } = useTimezone();
  const navigate = useNavigate();
  const [title, setTitle] = useState(entry.title || '');
  const [content, setContent] = useState(entry.content);
  const [isSaving, setIsSaving] = useState(false);
  const [includeInReport, setIncludeInReport] = useState(entry.include_in_report || false);
  const [isImportant, setIsImportant] = useState(entry.is_important || false);
  const [isCompleted, setIsCompleted] = useState(entry.is_completed || false);
  const [isDevNull, setIsDevNull] = useState(entry.is_dev_null || false);
  const [copied, setCopied] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const isCodeEntry = entry.content_type === 'code';
  const today = format(new Date(), 'yyyy-MM-dd');
  const isFromPastDay = currentDate && currentDate !== today;

  // Sync state with entry prop changes
  useEffect(() => {
    setTitle(entry.title || '');
    setContent(entry.content);
    setIncludeInReport(entry.include_in_report || false);
    setIsImportant(entry.is_important || false);
    setIsCompleted(entry.is_completed || false);
    setIsDevNull(entry.is_dev_null || false);
  }, [entry]);

  const handleTitleChange = async (newTitle: string) => {
    setTitle(newTitle);
    setIsSaving(true);

    // Debounce the save
    const timeoutId = setTimeout(async () => {
      try {
        await axios.patch(`${API_URL}/api/entries/${entry.id}`, {
          title: newTitle
        });
        setIsSaving(false);
      } catch (error) {
        console.error('Failed to update title:', error);
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  const handleContentChange = async (newContent: string) => {
    setContent(newContent);
    setIsSaving(true);

    // Debounce the save
    const timeoutId = setTimeout(async () => {
      await onUpdate(entry.id, newContent);
      setIsSaving(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  const handleDelete = () => {
    onDelete(entry.id);
  };

  const handleReportToggle = async () => {
    const newValue = !includeInReport;
    setIncludeInReport(newValue);
    
    try {
      await axios.patch(`${API_URL}/api/entries/${entry.id}`, {
        include_in_report: newValue
      });
    } catch (error) {
      console.error('Failed to update report status:', error);
      setIncludeInReport(!newValue); // Revert on error
    }
  };

  const handleImportantToggle = async () => {
    const newValue = !isImportant;
    setIsImportant(newValue);
    
    try {
      await axios.patch(`${API_URL}/api/entries/${entry.id}`, {
        is_important: newValue
      });
    } catch (error) {
      console.error('Failed to update important status:', error);
      setIsImportant(!newValue); // Revert on error
    }
  };

  const handleCompletedToggle = async () => {
    const newValue = !isCompleted;
    setIsCompleted(newValue);
    
    try {
      await axios.patch(`${API_URL}/api/entries/${entry.id}`, {
        is_completed: newValue
      });
      // Reload the note to sync data
      onLabelsChange();
    } catch (error) {
      console.error('Failed to update completed status:', error);
      setIsCompleted(!newValue); // Revert on error
    }
  };

  const handleDevNullToggle = async () => {
    const newValue = !isDevNull;
    setIsDevNull(newValue);
    
    try {
      await axios.patch(`${API_URL}/api/entries/${entry.id}`, {
        is_dev_null: newValue
      });
      // Reload the note to sync data
      onLabelsChange();
    } catch (error) {
      console.error('Failed to update dev_null status:', error);
      setIsDevNull(!newValue); // Revert on error
    }
  };

  const handleCopy = async () => {
    try {
      let textToCopy = content;
      
      // Strip HTML for rich text entries
      if (!isCodeEntry) {
        const tmp = document.createElement('div');
        tmp.innerHTML = content;
        textToCopy = tmp.textContent || tmp.innerText || '';
      }
      
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const handleContinueToday = async () => {
    setIsContinuing(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Create new entry on today's date with same content and type
      const response = await axios.post(`${API_URL}/api/entries/note/${today}`, {
        title: title,
        content: content,
        content_type: entry.content_type,
        order_index: 0,
        include_in_report: false,
        is_important: false,
        is_completed: false
      });

      // Copy labels to the new entry if any exist
      if (entry.labels && entry.labels.length > 0) {
        for (const label of entry.labels) {
          await axios.post(`${API_URL}/api/labels/entry/${response.data.id}/label/${label.id}`);
        }
      }

      // Navigate to today
      navigate(`/day/${today}`);
    } catch (error) {
      console.error('Failed to continue entry to today:', error);
      alert('Failed to copy entry to today');
    } finally {
      setIsContinuing(false);
    }
  };

  const handleMoveToTop = async () => {
    setIsMoving(true);
    try {
      await axios.post(`${API_URL}/api/entries/${entry.id}/move-to-top`);
      
      // Call the parent's callback to refresh the list
      if (onMoveToTop) {
        onMoveToTop(entry.id);
      }
    } catch (error) {
      console.error('Failed to move entry to top:', error);
      alert('Failed to move entry to top');
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div 
      className={`rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${isSelected ? 'ring-2' : ''}`}
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-card-border)',
        boxShadow: isSelected ? '0 0 0 2px var(--color-accent)' : undefined
      }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {selectionMode && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelectionChange?.(entry.id, e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            )}
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              <Clock className="h-4 w-4" />
              <span>
                {formatTimestamp(entry.created_at, timezone, 'h:mm a zzz')}
              </span>
              {isSaving && (
                <span className="text-blue-600 ml-2">Saving...</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReportToggle}
              className="p-2 rounded transition-colors"
              style={{ color: includeInReport ? 'var(--color-info)' : 'var(--color-text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = includeInReport ? 'transparent' : 'rgba(59, 130, 246, 0.1)';
                if (!includeInReport) e.currentTarget.style.color = 'var(--color-info)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                if (!includeInReport) e.currentTarget.style.color = 'var(--color-text-tertiary)';
              }}
              title={includeInReport ? "Remove from report" : "Add to report"}
            >
              <FileText className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleCompletedToggle}
              className="p-2 rounded transition-colors"
              style={{ color: isCompleted ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isCompleted ? 'transparent' : 'rgba(16, 185, 129, 0.1)';
                if (!isCompleted) e.currentTarget.style.color = 'var(--color-success)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                if (!isCompleted) e.currentTarget.style.color = 'var(--color-text-tertiary)';
              }}
              title={isCompleted ? "Mark as not completed" : "Mark as completed"}
            >
              <Check className={`h-5 w-5 ${isCompleted ? 'stroke-[3]' : ''}`} />
            </button>
            
            <button
              onClick={handleImportantToggle}
              className="p-2 rounded transition-colors"
              style={{ color: isImportant ? 'var(--color-warning)' : 'var(--color-text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isImportant ? 'transparent' : 'rgba(245, 158, 11, 0.1)';
                if (!isImportant) e.currentTarget.style.color = 'var(--color-warning)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                if (!isImportant) e.currentTarget.style.color = 'var(--color-text-tertiary)';
              }}
              title={isImportant ? "Mark as not important" : "Mark as important"}
            >
              <Star className={`h-5 w-5 ${isImportant ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleDevNullToggle}
              className="p-2 rounded transition-colors"
              style={{ color: isDevNull ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.1)';
                if (!isDevNull) e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                if (!isDevNull) e.currentTarget.style.color = 'var(--color-text-tertiary)';
              }}
              title={isDevNull ? "Remove from /dev/null" : "Mark as /dev/null"}
            >
              <Skull className={`h-5 w-5 ${isDevNull ? 'stroke-[2.5]' : ''}`} />
            </button>
            
            <button
              onClick={handleCopy}
              className="p-2 rounded transition-colors"
              style={{ color: copied ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}
              onMouseEnter={(e) => {
                if (!copied) {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.color = 'var(--color-accent)';
                }
              }}
              onMouseLeave={(e) => {
                if (!copied) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-tertiary)';
                }
              }}
              title={copied ? "Copied!" : "Copy content"}
            >
              {copied ? (
                <CheckCheck className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
            
            {isFromPastDay && (
              <button
                onClick={handleContinueToday}
                disabled={isContinuing}
                className="p-2 rounded transition-colors"
                style={{ color: isContinuing ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}
                onMouseEnter={(e) => {
                  if (!isContinuing) {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                    e.currentTarget.style.color = 'var(--color-success)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isContinuing) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-tertiary)';
                  }
                }}
                title={isContinuing ? "Copying to today..." : "Continue on today"}
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
            
            <button
              onClick={handleMoveToTop}
              disabled={isMoving}
              className="p-2 rounded transition-colors"
              style={{ color: isMoving ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}
              onMouseEnter={(e) => {
                if (!isMoving) {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.color = 'var(--color-accent)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMoving) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-tertiary)';
                }
              }}
              title={isMoving ? "Moving to top..." : "Move to top"}
            >
              <ArrowUp className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleDelete}
              className="p-2 rounded transition-colors"
              style={{ color: 'var(--color-text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-error)';
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-tertiary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Delete entry"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
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
            entryId={entry.id}
            selectedLabels={entry.labels || []}
            onLabelsChange={() => {}}
            onOptimisticUpdate={(labels) => onLabelsUpdate(entry.id, labels)}
          />
        </div>

        {isCodeEntry ? (
          <CodeEditor
            content={content}
            onChange={handleContentChange}
          />
        ) : (
          <RichTextEditor
            content={content}
            onChange={handleContentChange}
            placeholder="Add content..."
          />
        )}
      </div>
    </div>
  );
};

export default NoteEntryCard;

