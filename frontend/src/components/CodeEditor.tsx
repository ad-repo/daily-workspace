import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Edit, Check, Maximize2, Minimize2 } from 'lucide-react';

interface CodeEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const CodeEditor = ({ content, onChange }: CodeEditorProps) => {
  const [isEditing, setIsEditing] = useState(!content); // Start in edit mode if empty
  const [editContent, setEditContent] = useState(content);
  const [language, setLanguage] = useState<'python' | 'bash'>('python');
  const [isExpanded, setIsExpanded] = useState(false);

  // Detect language from content
  const detectLanguage = (code: string): 'python' | 'bash' => {
    // Common Python indicators
    if (code.match(/\b(def|class|import|from|print|if __name__|return)\b/)) {
      return 'python';
    }
    // Common Shell indicators
    if (code.match(/^#!\/bin\/(bash|sh)|^\$|^sudo|^cd\s|^ls\s|^echo\s/m)) {
      return 'bash';
    }
    return language; // Default to current selection
  };

  const handleEdit = () => {
    setEditContent(content);
    setIsEditing(true);
  };

  const handleSave = () => {
    onChange(editContent);
    setIsEditing(false);
    // Detect language from saved content
    setLanguage(detectLanguage(editContent));
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
    // Auto-detect language as user types
    const detected = detectLanguage(e.target.value);
    setLanguage(detected);
  };

  if (isEditing) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('python')}
              className={`px-3 py-1 rounded text-sm ${
                language === 'python'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setLanguage('bash')}
              className={`px-3 py-1 rounded text-sm ${
                language === 'bash'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Shell
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
              title={isExpanded ? "Collapse editor" : "Expand editor"}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              Save
            </button>
            {content && (
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        <textarea
          value={editContent}
          onChange={handleTextareaChange}
          rows={15}
          className={`w-full p-4 font-mono text-sm rounded-lg focus:outline-none resize-y ${isExpanded ? '' : 'code-editor-textarea'}`}
          style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-primary)',
            maxHeight: isExpanded ? 'none' : '600px',
            overflowY: 'auto',
            transition: 'max-height 0.3s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-primary)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          placeholder={`Paste your ${language === 'python' ? 'Python' : 'Shell'} code here...`}
          spellCheck={false}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={handleEdit}
        className="absolute top-2 right-2 p-2 bg-gray-800 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-700"
        title="Edit code"
      >
        <Edit className="h-4 w-4" />
      </button>
      <div className="mb-2">
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
          language === 'python' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {language === 'python' ? 'Python' : 'Shell'}
        </span>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
        }}
        showLineNumbers
      >
        {content || '// Empty code block'}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeEditor;

