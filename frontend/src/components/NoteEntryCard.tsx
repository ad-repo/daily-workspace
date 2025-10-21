import { useState, useEffect } from 'react';
import { Trash2, Clock, FileText, Star, Check, Copy, CheckCheck, ArrowRight, Skull } from 'lucide-react';
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
  onLabelsChange: () => void;
  isSelected?: boolean;
  onSelectionChange?: (id: number, selected: boolean) => void;
  selectionMode?: boolean;
  currentDate?: string; // YYYY-MM-DD format
}

const NoteEntryCard = ({ entry, onUpdate, onDelete, onLabelsChange, isSelected = false, onSelectionChange, selectionMode = false, currentDate }: NoteEntryCardProps) => {
  const { timezone } = useTimezone();
  const navigate = useNavigate();
  const [content, setContent] = useState(entry.content);
  const [isSaving, setIsSaving] = useState(false);
  const [includeInReport, setIncludeInReport] = useState(entry.include_in_report || false);
  const [isImportant, setIsImportant] = useState(entry.is_important || false);
  const [isCompleted, setIsCompleted] = useState(entry.is_completed || false);
  const [isDevNull, setIsDevNull] = useState(entry.is_dev_null || false);
  const [copied, setCopied] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const isCodeEntry = entry.content_type === 'code';
  const today = format(new Date(), 'yyyy-MM-dd');
  const isFromPastDay = currentDate && currentDate !== today;

  // Sync state with entry prop changes
  useEffect(() => {
    setContent(entry.content);
    setIncludeInReport(entry.include_in_report || false);
    setIsImportant(entry.is_important || false);
    setIsCompleted(entry.is_completed || false);
    setIsDevNull(entry.is_dev_null || false);
  }, [entry]);

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
    if (window.confirm('Are you sure you want to delete this entry?')) {
      onDelete(entry.id);
    }
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

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
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
            <div className="flex items-center gap-2 text-sm text-gray-500">
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
              className={`p-2 rounded transition-colors ${
                includeInReport 
                  ? 'text-blue-500 hover:text-blue-600' 
                  : 'text-gray-400 hover:text-blue-500'
              }`}
              title={includeInReport ? "Remove from report" : "Add to report"}
            >
              <FileText className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleCompletedToggle}
              className={`p-2 rounded transition-colors ${
                isCompleted 
                  ? 'text-green-500 hover:text-green-600' 
                  : 'text-gray-400 hover:text-green-500'
              }`}
              title={isCompleted ? "Mark as not completed" : "Mark as completed"}
            >
              <Check className={`h-5 w-5 ${isCompleted ? 'stroke-[3]' : ''}`} />
            </button>
            
            <button
              onClick={handleImportantToggle}
              className={`p-2 rounded transition-colors ${
                isImportant 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
              title={isImportant ? "Mark as not important" : "Mark as important"}
            >
              <Star className={`h-5 w-5 ${isImportant ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleDevNullToggle}
              className={`p-2 rounded transition-colors ${
                isDevNull 
                  ? 'text-gray-700 hover:text-gray-800' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={isDevNull ? "Remove from /dev/null" : "Mark as /dev/null"}
            >
              <Skull className={`h-5 w-5 ${isDevNull ? 'stroke-[2.5]' : ''}`} />
            </button>
            
            <button
              onClick={handleCopy}
              className={`p-2 rounded transition-colors ${
                copied 
                  ? 'text-green-500' 
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
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
                className={`p-2 rounded transition-colors ${
                  isContinuing
                    ? 'text-green-500'
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                }`}
                title={isContinuing ? "Copying to today..." : "Continue on today"}
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
            
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete entry"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Entry Labels */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <LabelSelector
            entryId={entry.id}
            selectedLabels={entry.labels || []}
            onLabelsChange={onLabelsChange}
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
            placeholder="Write your notes here..."
          />
        )}
      </div>
    </div>
  );
};

export default NoteEntryCard;

