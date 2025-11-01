import { useState, useEffect, useMemo } from 'react';
import { Download, Upload, Settings as SettingsIcon, Clock, Archive, FileCode, Tag, Trash2, Edit2, Palette, Plus, Calendar, Image, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useTimezone } from '../contexts/TimezoneContext';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { useHoliday } from '../contexts/HolidayContext';
import CustomThemeCreator from './CustomThemeCreator';

interface Label {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Settings = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloadingFiles, setIsDownloadingFiles] = useState(false);
  const [isRestoringFiles, setIsRestoringFiles] = useState(false);
  const [isFullRestoring, setIsFullRestoring] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown'>('json');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { timezone, setTimezone } = useTimezone();
  const { currentTheme, setTheme, availableThemes, customThemes, deleteCustomTheme } = useTheme();
  const { enabled: holidayEnabled, daysAhead, currentHoliday, toggleEnabled: toggleHolidayEnabled, setDaysAhead: setHolidayDaysAhead, refreshImage: refreshHolidayImage, isLoading: isHolidayLoading } = useHoliday();
  const [labels, setLabels] = useState<Label[]>([]);
  const [deletingLabelId, setDeletingLabelId] = useState<number | null>(null);
  const [labelSearchQuery, setLabelSearchQuery] = useState('');
  const [labelSortBy, setLabelSortBy] = useState<'name' | 'usage'>('name');
  const [isEditingTimezone, setIsEditingTimezone] = useState(false);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [showThemeCreator, setShowThemeCreator] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

  useEffect(() => {
    loadLabels();
  }, []);

  const handleOpenThemeCreator = () => {
    setEditingTheme(null);
    setShowThemeCreator(true);
  };

  const handleEditTheme = (theme: Theme) => {
    setEditingTheme(theme);
    setShowThemeCreator(true);
  };

  const handleCloseThemeCreator = () => {
    setShowThemeCreator(false);
    setEditingTheme(null);
  };

  const handleDeleteTheme = (themeId: string) => {
    deleteCustomTheme(themeId);
    showMessage('success', 'Custom theme deleted successfully');
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const endpoint = exportFormat === 'json' ? '/api/backup/export' : '/api/backup/export-markdown';
      const response = await axios.get(`${API_URL}${endpoint}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = exportFormat === 'json' ? 'json' : 'md';
      const filename = `track-the-thing-${new Date().toISOString().split('T')[0]}.${extension}`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      const formatName = exportFormat === 'json' ? 'JSON backup' : 'Markdown export';
      showMessage('success', `${formatName} downloaded successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      showMessage('error', 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/backup/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      showMessage('success', `Import successful! ${response.data.stats.notes_imported} notes imported.`);
    } catch (error: any) {
      console.error('Import failed:', error);
      showMessage('error', error.response?.data?.detail || 'Failed to import data');
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadLabels = async () => {
    try {
      const response = await axios.get<Label[]>(`${API_URL}/api/labels/`);
      setLabels(response.data);
    } catch (error) {
      console.error('Failed to load labels:', error);
    }
  };

  // Filter and sort labels
  const filteredLabels = useMemo(() => {
    let filtered = labels;

    // Apply search filter
    if (labelSearchQuery.trim()) {
      const query = labelSearchQuery.trim();
      const queryLower = query.toLowerCase();
      
      filtered = filtered.filter(label => {
        // Check if the label itself is emoji
        const labelIsEmoji = isEmojiOnly(label.name);
        const queryIsEmoji = isEmojiOnly(query);
        
        // If both are emojis, do exact emoji matching
        if (labelIsEmoji && queryIsEmoji) {
          return label.name.includes(query);
        }
        
        // If query is emoji but label is text, no match
        if (queryIsEmoji && !labelIsEmoji) {
          return false;
        }
        
        // If label is emoji but query is text, no match
        if (labelIsEmoji && !queryIsEmoji) {
          return false;
        }
        
        // Both are text - do case-insensitive search
        return label.name.toLowerCase().includes(queryLower);
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (labelSortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // For usage sorting, we'd need usage counts from backend
      // For now, just sort by name as fallback
      return a.name.localeCompare(b.name);
    });

    return sorted;
  }, [labels, labelSearchQuery, labelSortBy]);

  const handleDeleteLabel = async (labelId: number, labelName: string) => {
    setDeletingLabelId(labelId);
    try {
      await axios.delete(`${API_URL}/api/labels/${labelId}`);
      setLabels(labels.filter(l => l.id !== labelId));
      showMessage('success', `Label "${labelName}" deleted successfully`);
    } catch (error: any) {
      console.error('Failed to delete label:', error);
      showMessage('error', error.response?.data?.detail || 'Failed to delete label');
    } finally {
      setDeletingLabelId(null);
    }
  };

  // Check if a string is only emojis (with optional spaces)
  const isEmojiOnly = (str: string): boolean => {
    const emojiRegex = /^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}\s]+$/u;
    return emojiRegex.test(str.trim());
  };

  const handleDownloadFiles = async () => {
    setIsDownloadingFiles(true);
    try {
      const response = await axios.get(`${API_URL}/api/uploads/download-all`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'track-the-thing-files.zip';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showMessage('success', 'All uploaded files downloaded successfully!');
    } catch (error: any) {
      console.error('Download files failed:', error);
      if (error.response?.status === 404) {
        showMessage('error', 'No uploaded files found to download');
      } else {
        showMessage('error', 'Failed to download files');
      }
    } finally {
      setIsDownloadingFiles(false);
    }
  };

  const handleRestoreFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      showMessage('error', 'Please select a ZIP file');
      event.target.value = '';
      return;
    }

    setIsRestoringFiles(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/uploads/restore-files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const stats = response.data.stats;
      showMessage('success', `Restored ${stats.restored} file(s), skipped ${stats.skipped} existing file(s)`);
    } catch (error: any) {
      console.error('Restore files failed:', error);
      showMessage('error', error.response?.data?.detail || 'Failed to restore files');
    } finally {
      setIsRestoringFiles(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleFullRestore = async () => {
    if (!jsonFile || !zipFile) {
      showMessage('error', 'Please select both JSON backup and ZIP files');
      return;
    }

    setIsFullRestoring(true);
    const formData = new FormData();
    formData.append('backup_file', jsonFile);
    formData.append('files_archive', zipFile);

    try {
      const response = await axios.post(`${API_URL}/api/backup/full-restore`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const dataStats = response.data.data_restore;
      const filesStats = response.data.files_restore;
      showMessage('success', 
        `Full restore completed! ${dataStats.entries_imported} entries and ${filesStats.restored} files restored.`
      );
      
      // Clear file selections
      setJsonFile(null);
      setZipFile(null);
    } catch (error: any) {
      console.error('Full restore failed:', error);
      showMessage('error', error.response?.data?.detail || 'Failed to perform full restore');
    } finally {
      setIsFullRestoring(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto page-fade-in">
      <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'var(--color-card-bg)' }}>
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="h-8 w-8" style={{ color: 'var(--color-text-secondary)' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Settings</h1>
        </div>

        {message && (
          <div 
            className="mb-6 p-4 rounded-lg"
            style={{
              backgroundColor: message.type === 'success' 
                ? `${getComputedStyle(document.documentElement).getPropertyValue('--color-success')}20`
                : `${getComputedStyle(document.documentElement).getPropertyValue('--color-error')}20`,
              color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'
            }}
          >
            {message.text}
          </div>
        )}

        {/* Theme Selection Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Palette className="h-5 w-5" />
            Theme
          </h2>
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[600px] overflow-y-auto pr-2">
              {/* Create Custom Theme Button */}
              <button
                onClick={handleOpenThemeCreator}
                className="group relative p-4 rounded-xl border-2 border-dashed transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-xl flex flex-col items-center justify-center min-h-[140px]"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.backgroundColor = `${getComputedStyle(document.documentElement).getPropertyValue('--color-accent')}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                }}
              >
                <Plus className="h-8 w-8 mb-2" style={{ color: 'var(--color-text-secondary)' }} />
                <div className="text-sm font-semibold text-center" style={{ color: 'var(--color-text-secondary)' }}>
                  Create Custom
                </div>
              </button>

              {availableThemes.map((theme) => {
                const isCustom = customThemes.some(t => t.id === theme.id);
                return (
                  <div key={theme.id} className="relative">
                    <button
                      onClick={() => setTheme(theme.id)}
                      className={`w-full group relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-110 hover:-translate-y-1 ${
                        currentTheme === theme.id
                          ? 'shadow-2xl ring-4'
                          : 'hover:shadow-xl'
                      }`}
                      style={{
                        backgroundColor: theme.colors.cardBg,
                        borderColor: currentTheme === theme.id ? theme.colors.accent : theme.colors.borderPrimary,
                        boxShadow: currentTheme === theme.id 
                          ? `0 20px 25px -5px ${theme.colors.cardShadow}, 0 10px 10px -5px ${theme.colors.cardShadow}`
                          : `0 4px 6px -1px ${theme.colors.cardShadow}`,
                        ringColor: currentTheme === theme.id ? theme.colors.accent : 'transparent',
                      }}
                      title={theme.description}
                    >
                      {/* Theme preview colors */}
                      <div className="flex flex-col gap-2 mb-3">
                        <div className="flex gap-1">
                          <div 
                            className="h-5 w-5 rounded-full shadow-md transform group-hover:scale-110 transition-transform"
                            style={{ 
                              backgroundColor: theme.colors.accent,
                              boxShadow: `0 0 8px ${theme.colors.accent}80`
                            }}
                          />
                          <div 
                            className="h-5 w-5 rounded-full shadow-md transform group-hover:scale-110 transition-transform"
                            style={{ 
                              backgroundColor: theme.colors.success,
                              boxShadow: `0 0 8px ${theme.colors.success}80`
                            }}
                          />
                          <div 
                            className="h-5 w-5 rounded-full shadow-md transform group-hover:scale-110 transition-transform"
                            style={{ 
                              backgroundColor: theme.colors.warning,
                              boxShadow: `0 0 8px ${theme.colors.warning}80`
                            }}
                          />
                        </div>
                        <div 
                          className="h-10 rounded-lg shadow-inner"
                          style={{ 
                            backgroundColor: theme.colors.bgSecondary,
                            border: `2px solid ${theme.colors.borderPrimary}`,
                            backgroundImage: `linear-gradient(135deg, ${theme.colors.bgSecondary} 0%, ${theme.colors.bgTertiary} 100%)`
                          }}
                        />
                      </div>
                      
                      {/* Theme name */}
                      <div className="text-sm font-semibold text-center" style={{ color: theme.colors.textPrimary }}>
                        {theme.name}
                      </div>
                      
                      {/* Selected indicator */}
                      {currentTheme === theme.id && (
                        <div 
                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center animate-pulse shadow-lg" 
                          style={{ 
                            backgroundColor: theme.colors.accent,
                            boxShadow: `0 0 20px ${theme.colors.accent}, 0 0 40px ${theme.colors.accent}80`
                          }}
                        >
                          <svg className="w-5 h-5" style={{ color: theme.colors.accentText }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>

                    {/* Edit/Delete buttons for custom themes */}
                    {isCustom && (
                      <div className="absolute -top-2 -left-2 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTheme(theme);
                          }}
                          className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all"
                          style={{
                            backgroundColor: 'var(--color-info)',
                            color: '#ffffff',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title="Edit theme"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTheme(theme.id);
                          }}
                          className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all"
                          style={{
                            backgroundColor: 'var(--color-error)',
                            color: '#ffffff',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title="Delete theme"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Holiday Background Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Calendar className="h-5 w-5" />
            Holiday Background
          </h2>
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Automatically display festive background images based on upcoming holidays. Images rotate every hour for variety.
            </p>

            {/* Enable/Disable Toggle */}
            <div className="mb-6 flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
              <div className="flex items-center gap-3">
                <Image className="h-5 w-5" style={{ color: 'var(--color-text-secondary)' }} />
                <div>
                  <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Enable Holiday Backgrounds
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Show themed backgrounds for upcoming holidays
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={holidayEnabled}
                  onChange={toggleHolidayEnabled}
                  className="sr-only peer"
                />
                <div
                  className="w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 transition-colors"
                  style={{
                    backgroundColor: holidayEnabled ? 'var(--color-accent)' : 'var(--color-border-secondary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px var(--color-accent)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    className="absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform"
                    style={{
                      transform: holidayEnabled ? 'translateX(20px)' : 'translateX(0)',
                    }}
                  />
                </div>
              </label>
            </div>

            {/* Days Ahead Setting */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Days ahead to detect holidays:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={daysAhead}
                  onChange={(e) => setHolidayDaysAhead(parseInt(e.target.value, 10) || 7)}
                  disabled={!holidayEnabled}
                  className="px-4 py-2 rounded-lg focus:outline-none disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-primary)',
                    width: '100px',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  days (0-30)
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                Set to 0 for today only, or higher to detect upcoming holidays
              </p>
            </div>

            {/* Current Holiday Display */}
            {holidayEnabled && (
              <div
                className="mb-6 p-4 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-primary)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Upcoming Holiday:
                    </div>
                    {isHolidayLoading ? (
                      <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        Checking for holidays...
                      </div>
                    ) : currentHoliday ? (
                      <div>
                        <div className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                          {currentHoliday.name}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {new Date(currentHoliday.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        {daysAhead === 0 
                          ? 'No holiday today' 
                          : `No upcoming holidays within ${daysAhead} days`}
                      </div>
                    )}
                  </div>
                  {currentHoliday && (
                    <button
                      onClick={refreshHolidayImage}
                      disabled={isHolidayLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-accent-text)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isHolidayLoading) {
                          e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isHolidayLoading) {
                          e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                        }
                      }}
                      title="Load a new random image"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh Image
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: `${getComputedStyle(document.documentElement).getPropertyValue('--color-info')}15`,
                border: '1px solid var(--color-info)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--color-info)' }}>
                <strong>How it works:</strong> Holiday backgrounds appear at low opacity (20%) so they don't interfere with readability. 
                Images automatically rotate every hour for variety. Uses Unsplash for images and Nager.Date for holiday data.
              </p>
            </div>
          </div>
        </section>

        {/* Label Management Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Tag className="h-5 w-5" />
            Label Management
            {labels.length > 0 && (
              <span className="text-sm font-normal" style={{ color: 'var(--color-text-secondary)' }}>
                ({labels.length} total)
              </span>
            )}
          </h2>
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Manage your labels. Deleting a label will remove it from all notes and entries.
            </p>

            {labels.length === 0 ? (
              <p className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>No labels created yet</p>
            ) : (
              <>
                {/* Search and Filter Controls */}
                <div className="mb-4 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search labels..."
                      value={labelSearchQuery}
                      onChange={(e) => setLabelSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-bg-primary)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border-primary)'
                      }}
                    />
                  </div>
                  <div className="sm:w-48">
                    <select
                      value={labelSortBy}
                      onChange={(e) => setLabelSortBy(e.target.value as 'name' | 'usage')}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-bg-primary)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border-primary)'
                      }}
                    >
                      <option value="name">Sort by Name</option>
                      <option value="usage">Sort by Usage</option>
                    </select>
                  </div>
                </div>

                  {/* Results Count */}
                  {labelSearchQuery && (
                    <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                      Showing {filteredLabels.length} of {labels.length} labels
                    </p>
                  )}

                  {/* Labels Grid */}
                  {filteredLabels.length === 0 ? (
                    <p className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>No labels match your search</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
                    {filteredLabels.map((label) => {
                  const isEmoji = isEmojiOnly(label.name);
                  return (
                      <div
                        key={label.id}
                        className="flex items-center justify-between p-3 rounded-lg transition-all duration-200"
                        style={{
                          backgroundColor: 'var(--color-bg-primary)',
                          border: '1px solid var(--color-border-primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {isEmoji ? (
                            <span className="text-2xl">{label.name}</span>
                          ) : (
                            <>
                              <div
                                className="w-4 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: label.color }}
                              />
                              <span className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }} title={label.name}>
                                {label.name}
                              </span>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteLabel(label.id, label.name)}
                          disabled={deletingLabelId === label.id}
                          className="p-2 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                          style={{ color: 'var(--color-text-tertiary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--color-error)';
                            e.currentTarget.style.backgroundColor = `${getComputedStyle(document.documentElement).getPropertyValue('--color-error')}15`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--color-text-tertiary)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title={`Delete label "${label.name}"`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                  );
                })}
              </div>
            )}
              </>
            )}
          </div>
        </section>

        {/* Backup & Restore Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Download className="h-5 w-5" />
            Backup & Restore
          </h2>
          
          {/* Info Banner */}
          <div 
            className="mb-4 p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-primary)'
            }}
          >
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>📦 Complete Machine Migration</h3>
            <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              For a full machine-to-machine restore, you need <strong>both files</strong>:
            </p>
            <ul className="text-sm space-y-1 ml-4 list-disc" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>JSON backup</strong> - Contains all notes, entries, labels, timestamps</li>
              <li><strong>ZIP files</strong> - Contains all uploaded images and attachments</li>
            </ul>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
              💡 Use "Full Restore" below to restore both in one click, or restore individually using the buttons.
            </p>
          </div>

          {/* Full Restore Section */}
          <div 
            className="mb-4 rounded-lg p-6"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              border: '2px solid var(--color-border-secondary)'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${getComputedStyle(document.documentElement).getPropertyValue('--color-accent')}20` }}
              >
                <Upload className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Full Restore (Recommended)</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              One-click restore: Upload both files to completely restore your workspace
            </p>
            
            <div className="space-y-3 mb-4">
              {/* JSON File Selector */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>1. JSON Backup File:</label>
                <label 
                  className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                  }}
                >
                  <Download className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {jsonFile ? jsonFile.name : 'Choose JSON file...'}
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => setJsonFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
              
              {/* ZIP File Selector */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>2. Files Archive (ZIP):</label>
                <label 
                  className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                  }}
                >
                  <Archive className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {zipFile ? zipFile.name : 'Choose ZIP file...'}
                  </span>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            <button
              onClick={handleFullRestore}
              disabled={isFullRestoring || !jsonFile || !zipFile}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: (isFullRestoring || !jsonFile || !zipFile) ? 'var(--color-bg-tertiary)' : 'var(--color-accent)',
                color: (isFullRestoring || !jsonFile || !zipFile) ? 'var(--color-text-tertiary)' : 'var(--color-accent-text)'
              }}
              onMouseEnter={(e) => {
                if (!isFullRestoring && jsonFile && zipFile) {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isFullRestoring && jsonFile && zipFile) {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                }
              }}
            >
              <Upload className="h-5 w-5" />
              {isFullRestoring ? 'Restoring Everything...' : 'Restore Everything'}
            </button>
          </div>

          {/* Individual Actions Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Export Card */}
            <div 
              className="rounded-lg p-6 transition-all"
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-primary)';
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${getComputedStyle(document.documentElement).getPropertyValue('--color-accent')}20` }}
                >
                  <Download className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Export Data</h3>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Download your notes, entries, and labels
              </p>
              
              {/* Format Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Format:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExportFormat('json')}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border transition-colors"
                    style={{
                      backgroundColor: exportFormat === 'json' ? 'var(--color-accent)' : 'var(--color-bg-primary)',
                      color: exportFormat === 'json' ? 'var(--color-accent-text)' : 'var(--color-text-primary)',
                      borderColor: exportFormat === 'json' ? 'var(--color-accent)' : 'var(--color-border-primary)'
                    }}
                    onMouseEnter={(e) => {
                      if (exportFormat !== 'json') {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (exportFormat !== 'json') {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                      }
                    }}
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => setExportFormat('markdown')}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border transition-colors"
                    style={{
                      backgroundColor: exportFormat === 'markdown' ? 'var(--color-accent)' : 'var(--color-bg-primary)',
                      color: exportFormat === 'markdown' ? 'var(--color-accent-text)' : 'var(--color-text-primary)',
                      borderColor: exportFormat === 'markdown' ? 'var(--color-accent)' : 'var(--color-border-primary)'
                    }}
                    onMouseEnter={(e) => {
                      if (exportFormat !== 'markdown') {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (exportFormat !== 'markdown') {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                      }
                    }}
                  >
                    Markdown
                  </button>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                  {exportFormat === 'json' 
                    ? 'Full backup for restore (v4.0)' 
                    : 'Formatted for LLM analysis'}
                </p>
              </div>
              
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isExporting ? 'var(--color-bg-tertiary)' : 'var(--color-accent)',
                  color: isExporting ? 'var(--color-text-tertiary)' : 'var(--color-accent-text)'
                }}
                onMouseEnter={(e) => {
                  if (!isExporting) e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isExporting) e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                }}
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </button>
            </div>

            {/* Restore Card */}
            <div 
              className="rounded-lg p-6 transition-all"
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-success)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-primary)';
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${getComputedStyle(document.documentElement).getPropertyValue('--color-success')}20` }}
                >
                  <Upload className="h-5 w-5" style={{ color: 'var(--color-success)' }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Restore Data Only</h3>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Import JSON backup (without files)
              </p>
              
              <div 
                className="mb-4 p-3 rounded-lg"
                style={{
                  backgroundColor: `${getComputedStyle(document.documentElement).getPropertyValue('--color-info')}15`,
                  border: '1px solid var(--color-info)'
                }}
              >
                <p className="text-xs" style={{ color: 'var(--color-info)' }}>
                  <strong>✓ Compatible:</strong> v1.0-v4.0 backups supported
                </p>
              </div>
              
              <label 
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium cursor-pointer"
                style={{
                  backgroundColor: isImporting ? 'var(--color-bg-tertiary)' : 'var(--color-success)',
                  color: isImporting ? 'var(--color-text-tertiary)' : '#ffffff'
                }}
                onMouseEnter={(e) => {
                  if (!isImporting) e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  if (!isImporting) e.currentTarget.style.opacity = '1';
                }}
              >
                <Upload className="h-4 w-4" />
                {isImporting ? 'Restoring...' : 'Choose JSON File'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Files Export & Restore */}
          <div 
            className="mt-4 rounded-lg p-4"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-primary)'
            }}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Attachments</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDownloadFiles}
                disabled={isDownloadingFiles}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isDownloadingFiles ? 'var(--color-bg-tertiary)' : '#9333ea',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  if (!isDownloadingFiles) e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  if (!isDownloadingFiles) e.currentTarget.style.opacity = '1';
                }}
              >
                <Archive className="h-4 w-4" />
                {isDownloadingFiles ? 'Downloading...' : 'Export Files (ZIP)'}
              </button>
              
              <label 
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors font-medium cursor-pointer"
                style={{
                  backgroundColor: isRestoringFiles ? 'var(--color-bg-tertiary)' : '#9333ea',
                  color: '#ffffff',
                  opacity: isRestoringFiles ? '0.5' : '1'
                }}
                onMouseEnter={(e) => {
                  if (!isRestoringFiles) e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  if (!isRestoringFiles) e.currentTarget.style.opacity = '1';
                }}
              >
                <Upload className="h-4 w-4" />
                {isRestoringFiles ? 'Restoring...' : 'Restore Files (ZIP)'}
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleRestoreFiles}
                  disabled={isRestoringFiles}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--color-text-tertiary)' }}>
              Export downloads all uploaded files • Restore extracts files from ZIP (skips duplicates)
            </p>
          </div>
        </section>

        {/* Timezone Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Clock className="h-5 w-5" />
            Timezone
          </h2>
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            {!isEditingTimezone ? (
              // Compact display when not editing
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Current timezone:</p>
                  <p className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>{timezone}</p>
                </div>
                <button
                  onClick={() => setIsEditingTimezone(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{ color: 'var(--color-accent)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${getComputedStyle(document.documentElement).getPropertyValue('--color-accent')}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                  Change
                </button>
              </div>
            ) : (
              // Full timezone selector when editing
              <div>
                <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  Set your timezone for accurate time display throughout the app.
                </p>
                
                <div className="max-w-md">
                  <label htmlFor="timezone" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Select Timezone
                  </label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => {
                      setTimezone(e.target.value);
                      showMessage('success', `Timezone updated to ${e.target.value}`);
                      setIsEditingTimezone(false);
                    }}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-bg-primary)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-primary)'
                    }}
                  >
                    <optgroup label="US Timezones">
                      <option value="America/New_York">Eastern (New York)</option>
                      <option value="America/Chicago">Central (Chicago)</option>
                      <option value="America/Denver">Mountain (Denver)</option>
                      <option value="America/Phoenix">Mountain - No DST (Phoenix)</option>
                      <option value="America/Los_Angeles">Pacific (Los Angeles)</option>
                      <option value="America/Anchorage">Alaska (Anchorage)</option>
                      <option value="Pacific/Honolulu">Hawaii (Honolulu)</option>
                    </optgroup>
                    <optgroup label="Canada">
                      <option value="America/Toronto">Eastern (Toronto)</option>
                      <option value="America/Winnipeg">Central (Winnipeg)</option>
                      <option value="America/Edmonton">Mountain (Edmonton)</option>
                      <option value="America/Vancouver">Pacific (Vancouver)</option>
                    </optgroup>
                    <optgroup label="Europe">
                      <option value="Europe/London">London (GMT/BST)</option>
                      <option value="Europe/Paris">Paris (CET/CEST)</option>
                      <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                      <option value="Europe/Rome">Rome (CET/CEST)</option>
                      <option value="Europe/Madrid">Madrid (CET/CEST)</option>
                      <option value="Europe/Moscow">Moscow (MSK)</option>
                    </optgroup>
                    <optgroup label="Asia">
                      <option value="Asia/Dubai">Dubai (GST)</option>
                      <option value="Asia/Kolkata">India (IST)</option>
                      <option value="Asia/Shanghai">China (CST)</option>
                      <option value="Asia/Tokyo">Japan (JST)</option>
                      <option value="Asia/Seoul">South Korea (KST)</option>
                      <option value="Asia/Singapore">Singapore (SGT)</option>
                      <option value="Asia/Hong_Kong">Hong Kong (HKT)</option>
                    </optgroup>
                    <optgroup label="Australia">
                      <option value="Australia/Sydney">Sydney (AEDT/AEST)</option>
                      <option value="Australia/Melbourne">Melbourne (AEDT/AEST)</option>
                      <option value="Australia/Perth">Perth (AWST)</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="UTC">UTC</option>
                    </optgroup>
                  </select>
                  
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setIsEditingTimezone(false)}
                      className="px-4 py-2 text-sm rounded-lg transition-colors"
                      style={{ color: 'var(--color-text-secondary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Custom Theme Creator Modal */}
      {showThemeCreator && (
        <CustomThemeCreator
          editingTheme={editingTheme}
          onClose={handleCloseThemeCreator}
        />
      )}
    </div>
  );
};

export default Settings;
