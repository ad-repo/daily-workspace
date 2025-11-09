import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
} from 'lucide-react';

interface SimpleRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const SimpleRichTextEditor = ({ content, onChange, placeholder = 'Start writing...' }: SimpleRichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
        style: 'min-height: 80px; max-height: 600px; color: var(--color-text-primary);',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div
      className="border rounded-lg overflow-auto resize-both"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-accent)',
        boxShadow: `0 0 0 3px ${getComputedStyle(document.documentElement).getPropertyValue('--color-accent')}20`,
        minHeight: '80px',
        maxHeight: '600px',
        minWidth: '200px',
        resize: 'both',
      }}
    >
      {/* Toolbar */}
      <div
        className="flex flex-wrap gap-1 p-2 border-b"
        style={{
          borderColor: 'var(--color-border-primary)',
          backgroundColor: 'var(--color-bg-primary)',
        }}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
            editor.isActive('bold') ? 'bg-opacity-100' : 'bg-opacity-0'
          }`}
          style={{
            backgroundColor: editor.isActive('bold')
              ? 'var(--color-accent)'
              : 'transparent',
            color: editor.isActive('bold')
              ? 'white'
              : 'var(--color-text-secondary)',
          }}
          title="Bold"
          type="button"
        >
          <Bold size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
            editor.isActive('italic') ? 'bg-opacity-100' : 'bg-opacity-0'
          }`}
          style={{
            backgroundColor: editor.isActive('italic')
              ? 'var(--color-accent)'
              : 'transparent',
            color: editor.isActive('italic')
              ? 'white'
              : 'var(--color-text-secondary)',
          }}
          title="Italic"
          type="button"
        >
          <Italic size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
            editor.isActive('bulletList') ? 'bg-opacity-100' : 'bg-opacity-0'
          }`}
          style={{
            backgroundColor: editor.isActive('bulletList')
              ? 'var(--color-accent)'
              : 'transparent',
            color: editor.isActive('bulletList')
              ? 'white'
              : 'var(--color-text-secondary)',
          }}
          title="Bullet List"
          type="button"
        >
          <List size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
            editor.isActive('orderedList') ? 'bg-opacity-100' : 'bg-opacity-0'
          }`}
          style={{
            backgroundColor: editor.isActive('orderedList')
              ? 'var(--color-accent)'
              : 'transparent',
            color: editor.isActive('orderedList')
              ? 'white'
              : 'var(--color-text-secondary)',
          }}
          title="Numbered List"
          type="button"
        >
          <ListOrdered size={16} />
        </button>

        <button
          onClick={addLink}
          className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
            editor.isActive('link') ? 'bg-opacity-100' : 'bg-opacity-0'
          }`}
          style={{
            backgroundColor: editor.isActive('link')
              ? 'var(--color-accent)'
              : 'transparent',
            color: editor.isActive('link')
              ? 'white'
              : 'var(--color-text-secondary)',
          }}
          title="Add Link"
          type="button"
        >
          <Link2 size={16} />
        </button>
      </div>

      {/* Editor */}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default SimpleRichTextEditor;

