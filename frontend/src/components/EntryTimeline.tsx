import { useEffect, useState, useRef } from 'react';
import { Check, Star, Code, FileText, Skull } from 'lucide-react';
import type { NoteEntry } from '../types';
import { useTimezone } from '../contexts/TimezoneContext';
import { useTransparentLabels } from '../contexts/TransparentLabelsContext';
import { formatTimestamp } from '../utils/timezone';

interface EntryTimelineProps {
  entries: NoteEntry[];
}

const EntryTimeline = ({ entries }: EntryTimelineProps) => {
  const { timezone } = useTimezone();
  const { transparentLabels } = useTransparentLabels();
  const [activeEntryId, setActiveEntryId] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Check if a string is only emojis (with optional spaces)
  const isEmojiOnly = (str: string): boolean => {
    const emojiRegex = /^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}\s]+$/u;
    return emojiRegex.test(str.trim());
  };

  useEffect(() => {
    const handleScroll = () => {
      // Find which entry is currently in view
      const entryElements = document.querySelectorAll('[data-entry-id]');
      let currentEntry: number | null = null;
      
      entryElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Check if entry is in the top half of viewport
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
          currentEntry = parseInt(el.getAttribute('data-entry-id') || '0');
        }
      });
      
      if (currentEntry) {
        setActiveEntryId(currentEntry);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [entries]);

  const scrollToEntry = (entryId: number) => {
    const element = document.querySelector(`[data-entry-id="${entryId}"]`);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 100; // Offset for header/spacing
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (entries.length === 0) return null;

  return (
    <div 
      ref={timelineRef}
      className="fixed left-[calc((100vw-56rem)/4-6.5rem)] top-36 w-52 max-h-[calc(100vh-180px)] hidden xl:block z-10"
    >
      <div className="mb-4 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Timeline</h3>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{entries.length} entries</p>
      </div>
      
      <div className="space-y-1">
        {entries.map((entry, index) => {
          const isActive = entry.id === activeEntryId;
          const time = formatTimestamp(entry.created_at, timezone, 'h:mm a');
          
          return (
            <button
              key={entry.id}
              onClick={() => scrollToEntry(entry.id)}
              className="w-full text-left px-3 py-2.5 rounded-md transition-all border-l-2 -ml-0.5"
              style={{
                backgroundColor: isActive ? `${getComputedStyle(document.documentElement).getPropertyValue('--color-accent')}15` : 'transparent',
                borderColor: isActive ? 'var(--color-accent)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                  e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span 
                  className="text-sm font-medium"
                  style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                >
                  {time}
                </span>
                <div className="flex items-center gap-1">
                  {entry.is_dev_null && (
                    <Skull className="h-4 w-4 stroke-[2.5]" style={{ color: 'var(--color-text-primary)' }} />
                  )}
                  {entry.is_completed && (
                    <Check className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                  )}
                  {entry.is_important && (
                    <Star className="h-4 w-4 fill-current" style={{ color: 'var(--color-warning)' }} />
                  )}
                  {entry.content_type === 'code' ? (
                    <Code className="h-4 w-4" style={{ color: 'var(--color-text-tertiary)' }} />
                  ) : (
                    <FileText className="h-4 w-4" style={{ color: 'var(--color-text-tertiary)' }} />
                  )}
                </div>
              </div>
              
              {entry.title && (
                <div className="mb-1.5">
                  <p 
                    className="text-xs font-medium truncate"
                    style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                    title={entry.title}
                  >
                    {entry.title}
                  </p>
                </div>
              )}
              
              {entry.labels.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-1.5">
                  {entry.labels.slice(0, 2).map((label) => {
                    const isEmoji = isEmojiOnly(label.name);
                    
                    if (isEmoji) {
                      // Emoji label - transparent background
                      return (
                        <span
                          key={label.id}
                          className="inline-block px-1 text-base"
                        >
                          {label.name}
                        </span>
                      );
                    }
                    
                    // Text label - colored background (pill-shaped) or transparent
                    return (
                      <span
                        key={label.id}
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: transparentLabels ? 'transparent' : label.color,
                          color: transparentLabels ? label.color : 'white',
                          border: transparentLabels ? `1px solid ${label.color}` : 'none'
                        }}
                      >
                        {label.name}
                      </span>
                    );
                  })}
                  {entry.labels.length > 2 && (
                    <span className="text-xs px-1" style={{ color: 'var(--color-text-secondary)' }}>+{entry.labels.length - 2}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EntryTimeline;

