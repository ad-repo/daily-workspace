import { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { NoteEntry, Label } from '../types';
import { useTimezone } from '../contexts/TimezoneContext';
import { formatTimestamp } from '../utils/timezone';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface SearchHistoryItem {
  query: string;
  created_at: string;
}

const Search = () => {
  const { timezone } = useTimezone();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [results, setResults] = useState<NoteEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadLabels();
    loadSearchHistory();
  }, []);

  useEffect(() => {
    // Reset search when component unmounts or navigates away
    return () => {
      setSearchQuery('');
      setSelectedLabels([]);
      setResults([]);
      setHasSearched(false);
    };
  }, []);

  // Auto-search when labels change
  useEffect(() => {
    if (selectedLabels.length > 0) {
      handleSearch();
    } else if (hasSearched && !searchQuery.trim()) {
      // Clear results if no labels and no query
      setResults([]);
      setHasSearched(false);
    }
  }, [selectedLabels]);

  const loadLabels = async () => {
    try {
      const response = await axios.get<Label[]>(`${API_URL}/api/labels/`);
      setAllLabels(response.data);
    } catch (error) {
      console.error('Failed to load labels:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const response = await axios.get<SearchHistoryItem[]>(`${API_URL}/api/search-history/`);
      setSearchHistory(response.data);
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const saveToHistory = async (query: string) => {
    if (!query.trim()) return;

    try {
      await axios.post(`${API_URL}/api/search-history/`, null, {
        params: { query: query.trim() }
      });
      // Reload history to get updated list
      await loadSearchHistory();
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && selectedLabels.length === 0) {
      return;
    }

    setLoading(true);
    setHasSearched(true);

    // Save to history if there's a text query
    if (searchQuery.trim()) {
      saveToHistory(searchQuery);
    }

    try {
      const params: any = {};
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }
      if (selectedLabels.length > 0) {
        params.label_ids = selectedLabels.join(',');
      }

      const response = await axios.get<NoteEntry[]>(`${API_URL}/api/search/`, { params });
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleLabel = (labelId: number) => {
    setSelectedLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedLabels([]);
    setResults([]);
    setHasSearched(false);
  };

  const goToEntry = (entry: NoteEntry, date: string) => {
    navigate(`/day/${date}#entry-${entry.id}`);
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="rounded-lg shadow-lg p-6 mb-6" style={{ backgroundColor: 'var(--color-card-bg)' }}>
        <div className="flex items-center gap-3 mb-6">
          <SearchIcon className="h-8 w-8" style={{ color: 'var(--color-text-secondary)' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Search</h1>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search by text content..."
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-primary)',
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
            <button
              onClick={handleSearch}
              disabled={loading || (!searchQuery.trim() && selectedLabels.length === 0)}
              className="px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              style={{
                backgroundColor: (loading || (!searchQuery.trim() && selectedLabels.length === 0)) 
                  ? 'var(--color-bg-tertiary)' 
                  : 'var(--color-accent)',
                color: (loading || (!searchQuery.trim() && selectedLabels.length === 0))
                  ? 'var(--color-text-tertiary)'
                  : 'var(--color-accent-text)',
                cursor: (loading || (!searchQuery.trim() && selectedLabels.length === 0)) ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!loading && (searchQuery.trim() || selectedLabels.length > 0)) {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && (searchQuery.trim() || selectedLabels.length > 0)) {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                }
              }}
            >
              <SearchIcon className="h-5 w-5" />
              {loading ? 'Searching...' : 'Search'}
            </button>
            {hasSearched && (
              <button
                onClick={clearSearch}
                className="px-4 py-3 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--color-text-secondary)',
                  color: 'var(--color-bg-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-text-secondary)';
                }}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Label Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Labels:
          </label>
          <div className="flex flex-wrap gap-2">
            {allLabels.length === 0 ? (
              <p className="text-sm text-gray-500">No labels available</p>
            ) : (
              allLabels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedLabels.includes(label.id)
                      ? 'ring-2 ring-offset-2 ring-blue-500'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: label.color,
                    color: 'white'
                  }}
                >
                  {label.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && !hasSearched && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recent Searches:
            </label>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(item.query);
                    // Trigger search after setting query
                    setTimeout(() => {
                      const event = new KeyboardEvent('keypress', { key: 'Enter' });
                      handleSearch();
                    }, 0);
                  }}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors flex items-center gap-2"
                >
                  <SearchIcon className="h-3 w-3" />
                  {item.query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Info */}
        {hasSearched && (
          <div className="text-sm text-gray-600 mb-4">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
            {searchQuery.trim() && ` for "${searchQuery}"`}
            {selectedLabels.length > 0 && ` with selected labels`}
          </div>
        )}
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4 page-fade-in">
          {results.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500 page-fade-in">
              No results found. Try a different search query or labels.
            </div>
          ) : (
            results.map((entry: any, index) => {
              // Extract date from the search result
              const date = entry.date || 'Unknown';
              const content = entry.content_type === 'code' 
                ? entry.content 
                : stripHtml(entry.content);
              const preview = content.slice(0, 200) + (content.length > 200 ? '...' : '');

              return (
                <div
                  key={entry.id}
                  onClick={() => goToEntry(entry, date)}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  style={{
                    animation: `fadeIn 0.3s ease-in ${index * 0.05}s both`
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-blue-600">
                          {date}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(entry.created_at, timezone, 'h:mm a zzz')}
                        </span>
                        {entry.content_type === 'code' && (
                          <span className="px-2 py-0.5 bg-gray-800 text-white text-xs rounded">
                            Code
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {entry.labels.map((label) => (
                          <span
                            key={label.id}
                            className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: label.color }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{preview}</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Search;

