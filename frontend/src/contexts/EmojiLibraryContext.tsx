import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type EmojiLibrary = 'emoji-picker-react' | 'emoji-mart';

interface EmojiLibraryContextType {
  emojiLibrary: EmojiLibrary;
  setEmojiLibrary: (library: EmojiLibrary) => Promise<void>;
  isLoading: boolean;
}

const EmojiLibraryContext = createContext<EmojiLibraryContextType | undefined>(undefined);

export const EmojiLibraryProvider = ({ children }: { children: ReactNode }) => {
  const [emojiLibrary, setEmojiLibraryState] = useState<EmojiLibrary>('emoji-picker-react');
  const [isLoading, setIsLoading] = useState(true);

  // Load emoji library preference from backend
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/settings`);
        const library = response.data.emoji_library || 'emoji-picker-react';
        setEmojiLibraryState(library as EmojiLibrary);
        // Also store in localStorage for immediate access
        localStorage.setItem('emojiLibrary', library);
      } catch (error) {
        console.error('Failed to load emoji library preference:', error);
        // Fallback to localStorage or default
        const stored = localStorage.getItem('emojiLibrary');
        if (stored) {
          setEmojiLibraryState(stored as EmojiLibrary);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();
  }, []);

  const setEmojiLibrary = async (library: EmojiLibrary) => {
    try {
      // Update backend
      await axios.patch(`${API_URL}/api/settings`, {
        emoji_library: library,
      });
      // Update state and localStorage
      setEmojiLibraryState(library);
      localStorage.setItem('emojiLibrary', library);
    } catch (error) {
      console.error('Failed to update emoji library preference:', error);
      throw error;
    }
  };

  return (
    <EmojiLibraryContext.Provider value={{ emojiLibrary, setEmojiLibrary, isLoading }}>
      {children}
    </EmojiLibraryContext.Provider>
  );
};

export const useEmojiLibrary = () => {
  const context = useContext(EmojiLibraryContext);
  if (context === undefined) {
    throw new Error('useEmojiLibrary must be used within an EmojiLibraryProvider');
  }
  return context;
};

