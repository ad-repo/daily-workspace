import { useEffect, useState, useRef } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { Check, Star, Code, FileText } from 'lucide-react';
import type { NoteEntry } from '../types';

interface EntryTimelineProps {
  entries: NoteEntry[];
}

const EntryTimeline = ({ entries }: EntryTimelineProps) => {
  const [activeEntryId, setActiveEntryId] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

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
      className="fixed left-[calc((100vw-48rem)/4-6.5rem)] top-36 w-52 max-h-[calc(100vh-180px)] hidden xl:block z-10"
    >
      <div className="mb-4 px-1">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Timeline</h3>
        <p className="text-xs text-gray-500 mt-1">{entries.length} entries</p>
      </div>
      
      <div className="space-y-1">
        {entries.map((entry, index) => {
          const isActive = entry.id === activeEntryId;
          const time = formatInTimeZone(new Date(entry.created_at), 'America/New_York', 'h:mm a');
          
          return (
            <button
              key={entry.id}
              onClick={() => scrollToEntry(entry.id)}
              className={`w-full text-left px-3 py-2.5 rounded-md transition-all ${
                isActive 
                  ? 'bg-blue-50 border-l-2 border-blue-500 -ml-0.5' 
                  : 'hover:bg-gray-50 border-l-2 border-transparent hover:border-gray-300 -ml-0.5'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {time}
                </span>
                <div className="flex items-center gap-1">
                  {entry.is_completed && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {entry.is_important && (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  )}
                  {entry.content_type === 'code' ? (
                    <Code className="h-4 w-4 text-gray-400" />
                  ) : (
                    <FileText className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              
              {entry.labels.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-1.5">
                  {entry.labels.slice(0, 2).map((label) => (
                    <span
                      key={label.id}
                      className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </span>
                  ))}
                  {entry.labels.length > 2 && (
                    <span className="text-xs text-gray-500 px-1">+{entry.labels.length - 2}</span>
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

