import { useState, useEffect } from 'react';
import { Smile, X, Settings } from 'lucide-react';
import Picker from 'emoji-picker-react';
import data from '@emoji-mart/data';
import EmojiMartPicker from '@emoji-mart/react';
import { useEmojiLibrary } from '../contexts/EmojiLibraryContext';
import { customEmojisApi } from '../api';
import type { CustomEmoji } from '../types';
import CustomEmojiManager from './CustomEmojiManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string, isCustom?: boolean, imageUrl?: string) => void;
  variant?: 'toolbar' | 'accent'; // toolbar = gray, accent = blue
}

const EmojiPicker = ({ onEmojiSelect, variant = 'toolbar' }: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customEmojis, setCustomEmojis] = useState<CustomEmoji[]>([]);
  const [showManager, setShowManager] = useState(false);
  const { emojiLibrary, isLoading } = useEmojiLibrary();

  // Determine button styles based on variant
  const getButtonStyles = () => {
    if (variant === 'accent') {
      return {
        backgroundColor: '#3b82f6', // blue-600 always
        color: 'white',
        hoverClass: 'hover:bg-blue-700'
      };
    }
    // toolbar variant (default) - matches ToolbarButton behavior
    return {
      backgroundColor: isOpen ? 'var(--color-accent)' : 'transparent',
      color: isOpen ? 'var(--color-accent-text)' : 'var(--color-text-primary)',
      hoverClass: 'hover:bg-gray-100'
    };
  };

  const buttonStyles = getButtonStyles();

  useEffect(() => {
    if (isOpen) {
      loadCustomEmojis();
    }
  }, [isOpen]);

  const loadCustomEmojis = async () => {
    try {
      const emojis = await customEmojisApi.getAll(false);
      setCustomEmojis(emojis);
    } catch (error) {
      console.error('Failed to load custom emojis:', error);
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    // Handle emoji-picker-react format
    if (emojiData.emoji) {
      onEmojiSelect(emojiData.emoji, false);
    }
    // Handle emoji-mart format
    else if (emojiData.native) {
      onEmojiSelect(emojiData.native, false);
    }
    // Handle custom emoji
    else if (emojiData.isCustom) {
      onEmojiSelect(`:${emojiData.name}:`, true, emojiData.imageUrl);
    }
    setIsOpen(false);
  };

  const handleCustomEmojiClick = (emoji: CustomEmoji) => {
    // Pass the relative URL - the RichTextEditor will convert it to absolute
    onEmojiSelect(emoji.name, true, emoji.image_url);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors opacity-50 ${buttonStyles.hoverClass}`}
        style={{ 
          backgroundColor: buttonStyles.backgroundColor, 
          color: buttonStyles.color 
        }}
        title="Loading emoji picker..."
      >
        <Smile className="h-4 w-4" />
      </button>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${buttonStyles.hoverClass}`}
          style={{ 
            backgroundColor: buttonStyles.backgroundColor, 
            color: buttonStyles.color 
          }}
          title="Pick emoji"
        >
          <Smile className="h-4 w-4" />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Emoji picker popup */}
            <div
              className="absolute right-0 mt-2 w-80 max-h-96 border rounded-lg shadow-xl z-50 overflow-hidden flex flex-col"
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border-primary)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-3 border-b"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border-primary)',
                }}
              >
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Pick an emoji
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowManager(true);
                    }}
                    className="p-1 rounded hover:opacity-80 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    title="Manage custom emojis"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="hover:opacity-80 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Custom Emojis Section */}
              {customEmojis.length > 0 && (
                <div className="p-3 border-b" style={{ borderColor: 'var(--color-border-primary)' }}>
                  <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Custom Emojis
                  </h3>
                  <div className="grid grid-cols-8 gap-1">
                    {customEmojis.map((emoji) => (
                      <button
                        key={emoji.id}
                        onClick={() => handleCustomEmojiClick(emoji)}
                        className="p-2 rounded transition-colors hover:opacity-80"
                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                        title={`:${emoji.name}:`}
                        type="button"
                      >
                        <img
                          src={`${API_URL}${emoji.image_url}`}
                          alt={emoji.name}
                          className="w-6 h-6 object-contain"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Emoji Library Picker */}
              <div className="overflow-y-auto">
                {emojiLibrary === 'emoji-picker-react' ? (
                  <Picker
                    onEmojiClick={handleEmojiClick}
                    width="100%"
                    height="300px"
                    searchPlaceHolder="Search emoji..."
                    previewConfig={{ showPreview: false }}
                    theme="auto"
                  />
                ) : (
                  <EmojiMartPicker
                    data={data}
                    onEmojiSelect={handleEmojiClick}
                    theme="auto"
                    previewPosition="none"
                    style={{
                      backgroundColor: 'var(--color-bg-primary)',
                      borderColor: 'var(--color-border-primary)',
                    }}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Custom Emoji Manager Modal */}
      <CustomEmojiManager
        isOpen={showManager}
        onClose={() => setShowManager(false)}
        onEmojiAdded={loadCustomEmojis}
      />
    </>
  );
};

export default EmojiPicker;
