import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link2,
  Heading2,
  Heading3,
  Quote,
  Code,
  Code2,
  Minus,
  CheckSquare,
} from 'lucide-react';

interface SimpleRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const SimpleRichTextEditor = ({ content, onChange, placeholder = 'Start writing...' }: SimpleRichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
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
        style: 'min-height: 80px; max-height: 400px; color: var(--color-text-primary);',
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
        maxHeight: '400px',
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
        {/* Text Formatting */}
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
          title="Bold (Ctrl+B)"
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
          title="Italic (Ctrl+I)"
          type="button"
        >
          <Italic size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
            editor.isActive('underline') ? 'bg-opacity-100' : 'bg-opacity-0'
          }`}
          style={{
            backgroundColor: editor.isActive('underline')
              ? 'var(--color-accent)'
              : 'transparent',
            color: editor.isActive('underline')
              ? 'white'
              : 'var(--color-text-secondary)',
          }}
          title="Underline (Ctrl+U)"
          type="button"
        >
          <UnderlineIcon size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
            editor.isActive('strike') ? 'bg-opacity-100' : 'bg-opacity-0'
          }`}
          style={{
            backgroundColor: editor.isActive('strike')
              ? 'var(--color-accent)'
              : 'transparent',
            color: editor.isActive('strike')
              ? 'white'
              : 'var(--color-text-secondary)',
          }}
          title="Strikethrough"
          type="button"
        >
          <Strikethrough size={16} />
        </button>

        {/* Separator */}
        <div
          style={{
            width: '1px',
            backgroundColor: 'var(--color-border-primary)',
            margin: '0 4px',
          }}
        />

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-opacity-100' : 'bg-opacity-0'
          }`}
          style={{
            backgroundColor: editor.isActive('heading', { level: 2 })
              ? 'var(--color-accent)'
              : 'transparent',
            color: editor.isActive('heading', { level: 2 })
              ? 'white'
              : 'var(--color-text-secondary)',
          }}
          title="Heading 2"
          type="button"
        >
          <Heading2 size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-opacity-100' : 'bg-opacity-0'
          }`}
          style={{
            backgroundColor: editor.isActive('heading', { level: 3 })
              ? 'var(--color-accent)'
              : 'transparent',
            color: editor.isActive('heading', { level: 3 })
              ? 'white'
              : 'var(--color-text-secondary)',
          }}
          title="Heading 3"
          type="button"
        >
          <Heading3 size={16} />
        </button>

        {/* Separator */}
        <div
          style={{
            width: '1px',
            backgroundColor: 'var(--color-border-primary)',
            margin: '0 4px',
          }}
        />

        {/* Lists */}
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
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
            editor.isActive('taskList') ? 'bg-opacity-100' : 'bg-opacity-0'
          }`}
          style={{
            backgroundColor: editor.isActive('taskList')
              ? 'var(--color-accent)'
              : 'transparent',
            color: editor.isActive('taskList')
              ? 'white'
              : 'var(--color-text-secondary)',
          }}
          title="Task List"
          type="button"
        >
          <CheckSquare size={16} />
        </button>

        {/* Separator */}
        <div
          style={{
            width: '1px',
            backgroundColor: 'var(--color-border-primary)',
            margin: '0 4px',
          }}
        />

        {/* Block Elements */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
            editor.isActive('blockquote') ? 'bg-opacity-100' : 'bg-opacity-0'
          }`}
          style={{
            backgroundColor: editor.isActive('blockquote')
              ? 'var(--color-accent)'
              : 'transparent',
            color: editor.isActive('blockquote')
              ? 'white'
              : 'var(--color-text-secondary)',
          }}
          title="Blockquote"
          type="button"
        >
          <Quote size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
            editor.isActive('code') ? 'bg-opacity-100' : 'bg-opacity-0'
          }`}
          style={{
            backgroundColor: editor.isActive('code')
              ? 'var(--color-accent)'
              : 'transparent',
            color: editor.isActive('code')
              ? 'white'
              : 'var(--color-text-secondary)',
          }}
          title="Inline Code"
          type="button"
        >
          <Code size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
            editor.isActive('codeBlock') ? 'bg-opacity-100' : 'bg-opacity-0'
          }`}
          style={{
            backgroundColor: editor.isActive('codeBlock')
              ? 'var(--color-accent)'
              : 'transparent',
            color: editor.isActive('codeBlock')
              ? 'white'
              : 'var(--color-text-secondary)',
          }}
          title="Code Block"
          type="button"
        >
          <Code2 size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-opacity-80 transition-colors"
          style={{
            color: 'var(--color-text-secondary)',
          }}
          title="Horizontal Rule"
          type="button"
        >
          <Minus size={16} />
        </button>

        {/* Separator */}
        <div
          style={{
            width: '1px',
            backgroundColor: 'var(--color-border-primary)',
            margin: '0 4px',
          }}
        />

        {/* Link */}
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

