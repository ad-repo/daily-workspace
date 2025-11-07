import { useState, useRef, useEffect } from 'react';
import { List, Clock, Tag } from 'lucide-react';
import type { NoteEntry } from '../types';
import { useTimezone } from '../contexts/TimezoneContext';
import { formatTimestamp } from '../utils/timezone';

interface EntryDropdownProps {
  entries: NoteEntry[];
}

const EntryDropdown = ({ entries }: EntryDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { timezone } = useTimezone();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const scrollToEntry = (entryId: number) => {
    const element = document.querySelector(`[data-entry-id="${entryId}"]`);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 100; // Offset for header/spacing
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsOpen(false);
    }
  };

  if (entries.length === 0) return null;

  // Check if a string is only emojis (with optional spaces)
  const isEmojiOnly = (str: string): boolean => {
    const emojiRegex = /^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}\s]+$/u;
    return emojiRegex.test(str.trim());
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
        style={{
          backgroundColor: isOpen ? 'var(--color-bg-hover)' : 'transparent',
          color: 'var(--color-text-secondary)'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
        aria-label="Jump to entry"
        title="Jump to entry"
      >
        <List className="h-5 w-5" />
        <span className="hidden sm:inline text-sm font-medium">Jump to Entry</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto"
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-border-primary)'
          }}
        >
          <div className="p-2">
            <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border-primary)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
              </p>
            </div>
            <div className="py-1">
              {entries.map((entry) => {
                const time = formatTimestamp(entry.created_at, timezone, 'h:mm a');
                
                return (
                  <button
                    key={entry.id}
                    onClick={() => scrollToEntry(entry.id)}
                    className="w-full text-left px-3 py-2 rounded-md transition-colors"
                    style={{ color: 'var(--color-text-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        {time}
                      </span>
                    </div>
                    
                    {entry.title && (
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        {entry.title}
                      </p>
                    )}
                    
                    {entry.labels.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Tag className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }} />
                        {entry.labels.slice(0, 3).map((label) => {
                          const isEmoji = isEmojiOnly(label.name);
                          
                          if (isEmoji) {
                            return (
                              <span key={label.id} className="text-sm">
                                {label.name}
                              </span>
                            );
                          }
                          
                          return (
                            <span
                              key={label.id}
                              className="inline-block px-2 py-0.5 rounded-full text-xs"
                              style={{
                                backgroundColor: label.color,
                                color: 'white'
                              }}
                            >
                              {label.name}
                            </span>
                          );
                        })}
                        {entry.labels.length > 3 && (
                          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            +{entry.labels.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryDropdown;

