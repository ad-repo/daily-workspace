import { useState, useEffect } from 'react';
import { X, Send, Brain, Loader2, Download } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface LLMDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entryIds: number[];  // Support multiple entries
}

interface Model {
  name: string;
  size: number;
  modified: string;
}

const LLMDialog = ({ isOpen, onClose, entryIds }: LLMDialogProps) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [fullPrompt, setFullPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState('mixtral:8x7b');
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  const loadModels = async () => {
    setLoadingModels(true);
    try {
      const response = await axios.get(`${API_URL}/api/llm/models`);
      setModels(response.data);
      
      // Set selected model to first available or keep default
      if (response.data.length > 0) {
        const hasDefault = response.data.some((m: Model) => m.name === selectedModel);
        if (!hasDefault) {
          setSelectedModel(response.data[0].name);
        }
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !response) return;

    setLoading(true);
    try {
      const result = await axios.post(`${API_URL}/api/llm/query`, {
        entry_ids: entryIds,
        additional_prompt: prompt,
        model: selectedModel
      });
      
      setResponse(result.data.response);
      setFullPrompt(result.data.prompt);
      setShowPrompt(false); // Collapse by default
    } catch (error) {
      console.error('LLM query failed:', error);
      setResponse('Error: Failed to get response from LLM. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(response);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Ask AI</h2>
              <p className="text-sm text-gray-500">Analyze this entry with AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Model Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={loadingModels || loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingModels ? (
                <option>Loading models...</option>
              ) : models.length === 0 ? (
                <option>No models available</option>
              ) : (
                models.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name} {model.size > 0 ? `(${formatBytes(model.size)})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Question or Request (optional)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Summarize this entry, Extract key points, What are the action items?, etc."
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              rows={4}
            />
            <p className="mt-2 text-xs text-gray-500">
              The full entry content (text, labels, metadata) will be sent to the AI automatically.
            </p>
          </div>

          {/* Prompt Sent (Collapsible) */}
          {fullPrompt && (
            <div>
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-2 hover:text-gray-900"
              >
                <span>Prompt Sent to AI ({entryIds.length} {entryIds.length === 1 ? 'entry' : 'entries'})</span>
                <span className="text-gray-400">{showPrompt ? '▼' : '▶'}</span>
              </button>
              {showPrompt && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4 max-h-60 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                    {fullPrompt}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Response */}
          {response && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Response
                </label>
                <button
                  onClick={handleCopyResponse}
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Copy
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {response}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || loadingModels}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  {response ? 'Ask Again' : 'Send to AI'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMDialog;

