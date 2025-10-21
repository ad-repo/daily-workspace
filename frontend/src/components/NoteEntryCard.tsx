import { useState, useEffect } from 'react';
import { Trash2, Clock, FileText, Star, Check } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import axios from 'axios';
import type { NoteEntry } from '../types';
import RichTextEditor from './RichTextEditor';
import CodeEditor from './CodeEditor';
import LabelSelector from './LabelSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface NoteEntryCardProps {
  entry: NoteEntry;
  onUpdate: (id: number, content: string) => void;
  onDelete: (id: number) => void;
  onLabelsChange: () => void;
  isSelected?: boolean;
  onSelectionChange?: (id: number, selected: boolean) => void;
  selectionMode?: boolean;
}

const NoteEntryCard = ({ entry, onUpdate, onDelete, onLabelsChange, isSelected = false, onSelectionChange, selectionMode = false }: NoteEntryCardProps) => {
  const [content, setContent] = useState(entry.content);
  const [isSaving, setIsSaving] = useState(false);
  const [includeInReport, setIncludeInReport] = useState(entry.include_in_report || false);
  const [isImportant, setIsImportant] = useState(entry.is_important || false);
  const [isCompleted, setIsCompleted] = useState(entry.is_completed || false);
  const isCodeEntry = entry.content_type === 'code';

  // Sync state with entry prop changes
  useEffect(() => {
    setContent(entry.content);
    setIncludeInReport(entry.include_in_report || false);
    setIsImportant(entry.is_important || false);
    setIsCompleted(entry.is_completed || false);
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
                {formatInTimeZone(new Date(entry.created_at), 'America/New_York', 'h:mm a zzz')}
              </span>
              {isSaving && (
                <span className="text-blue-600 ml-2">Saving...</span>
              )}
            </div>
            
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeInReport}
                onChange={handleReportToggle}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span className="flex items-center gap-1 text-gray-700 pointer-events-none">
                <FileText className="h-4 w-4" />
                Add to Report
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
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

