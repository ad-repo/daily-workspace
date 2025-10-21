import { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import type { NoteEntry, Label } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TIMEZONE = 'America/New_York';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [results, setResults] = useState<NoteEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadLabels();
  }, []);

  const loadLabels = async () => {
    try {
      const response = await axios.get<Label[]>(`${API_URL}/api/labels/`);
      setAllLabels(response.data);
    } catch (error) {
      console.error('Failed to load labels:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && selectedLabels.length === 0) {
      return;
    }

    setLoading(true);
    setHasSearched(true);

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
    navigate(`/day/${date}`);
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <SearchIcon className="h-8 w-8 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">Search</h1>
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={loading || (!searchQuery.trim() && selectedLabels.length === 0)}
              className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                loading || (!searchQuery.trim() && selectedLabels.length === 0)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <SearchIcon className="h-5 w-5" />
              {loading ? 'Searching...' : 'Search'}
            </button>
            {hasSearched && (
              <button
                onClick={clearSearch}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
              No results found. Try a different search query or labels.
            </div>
          ) : (
            results.map((entry) => {
              // Extract date from the entry's relationship
              const date = (entry as any).daily_note?.date || 'Unknown';
              const content = entry.content_type === 'code' 
                ? entry.content 
                : stripHtml(entry.content);
              const preview = content.slice(0, 200) + (content.length > 200 ? '...' : '');

              return (
                <div
                  key={entry.id}
                  onClick={() => goToEntry(entry, date)}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-blue-600">
                          {date}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatInTimeZone(new Date(entry.created_at), TIMEZONE, 'h:mm a zzz')}
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

