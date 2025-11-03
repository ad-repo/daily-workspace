import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import { createLowlight, common } from 'lowlight';
import { Node } from '@tiptap/core';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  Image as ImageIcon,
  Code2,
  FileText,
  Paperclip,
  ExternalLink,
  Mic,
  Camera,
  Video,
} from 'lucide-react';
import { LinkPreviewExtension, fetchLinkPreview } from '../extensions/LinkPreview';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Custom extension for preformatted text
const PreformattedText = Node.create({
  name: 'preformattedText',
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,
  addAttributes() {
    return {
      class: {
        default: 'preformatted whitespace-pre-wrap font-mono text-sm p-3 rounded border border-gray-200',
      },
    };
  },
  parseHTML() {
    return [{ tag: 'pre', preserveWhitespace: 'full' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['pre', HTMLAttributes, 0];
  },
});

const RichTextEditor = ({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) => {
  const lowlight = createLowlight(common);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [dictationError, setDictationError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState<string>('');
  const cursorPosRef = useRef<number | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  // Check if camera/video should be available
  // Camera requires HTTPS (secure context) on mobile browsers when accessed over network
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isSecureContext = window.isSecureContext;
  const showMediaButtons = !isMobile || isSecureContext;
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      PreformattedText,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'w-full h-auto rounded-lg',
        },
      }),
      // Add custom node for video tags
      Node.create({
        name: 'video',
        group: 'block',
        atom: true,
        addAttributes() {
          return {
            src: {
              default: null,
            },
            controls: {
              default: true,
            },
            style: {
              default: 'width: 100%; height: auto; border-radius: 0.5rem;',
            },
          };
        },
        parseHTML() {
          return [
            {
              tag: 'video',
            },
          ];
        },
        renderHTML({ HTMLAttributes }) {
          return ['video', HTMLAttributes];
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-white p-4 rounded-lg',
        },
      }),
      LinkPreviewExtension,
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
        class: 'prose max-w-none focus:outline-none',
      },
        handleClick: (view, pos, event) => {
          const target = event.target as HTMLElement | null;
          if (target && target.tagName === 'IMG') {
            event.preventDefault();
            const src = (target as HTMLImageElement).src;
            if (src) setLightboxSrc(src);
            return true;
          }
          return false;
        },
      handleDrop: (view, event, slice, moved) => {
        event.preventDefault();
        
        // Handle file drops
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
          const files = Array.from(event.dataTransfer.files);
          
          files.forEach(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            
            try {
              if (file.type.startsWith('image/')) {
                const response = await fetch(`${API_BASE_URL}/api/uploads/image`, {
                  method: 'POST',
                  body: formData,
                });
                
                if (response.ok) {
                  const data = await response.json();
                  const imageUrl = `${API_BASE_URL}${data.url}`;
                  const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                  if (pos && editor) {
                    editor.chain().focus().insertContentAt(pos.pos, {
                      type: 'image',
                      attrs: { src: imageUrl }
                    }).run();
                  }
                }
              } else {
                const response = await fetch(`${API_BASE_URL}/api/uploads/file`, {
                  method: 'POST',
                  body: formData,
                });
                
                if (response.ok) {
                  const data = await response.json();
                  const fileUrl = `http://localhost:8000${data.url}`;
                  const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                  if (pos && editor) {
                    editor.chain().focus().insertContentAt(pos.pos, `<a href="${fileUrl}" download="${data.filename}" class="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 border border-gray-300">📎 ${data.filename}</a> `).run();
                  }
                }
              }
            } catch (error) {
              console.error('Failed to upload dropped file:', error);
            }
          });
          
          return true;
        }
        
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          // Check for images first
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              event.preventDefault();
              const file = items[i].getAsFile();
              if (file) {
                const formData = new FormData();
                formData.append('file', file);
                
                fetch(`${API_BASE_URL}/api/uploads/image`, {
                  method: 'POST',
                  body: formData,
                })
                  .then(response => response.json())
                  .then(data => {
                    const imageUrl = `${API_BASE_URL}${data.url}`;
                    editor?.chain().focus().setImage({ src: imageUrl }).run();
                  })
                  .catch(error => {
                    console.error('Failed to upload pasted image:', error);
                  });
              }
              return true;
            }
          }
        }
        
        // Check for URLs in text
        const text = event.clipboardData?.getData('text/plain');
        if (text) {
          // Simple URL detection - matches http(s) URLs
          const urlRegex = /^https?:\/\/[^\s]+$/;
          if (urlRegex.test(text.trim())) {
            event.preventDefault();
            
            // Try to fetch link preview
            fetchLinkPreview(text.trim())
              .then(preview => {
                if (preview && editor) {
                  // Insert link preview card
                  editor.chain().focus().insertContent({
                    type: 'linkPreview',
                    attrs: preview,
                  }).run();
                } else {
                  // Fallback to regular link if preview fails
                  editor?.chain().focus().insertContent(`<a href="${text.trim()}" target="_blank" rel="noopener noreferrer">${text.trim()}</a> `).run();
                }
              })
              .catch(() => {
                // Fallback to regular link on error
                editor?.chain().focus().insertContent(`<a href="${text.trim()}" target="_blank" rel="noopener noreferrer">${text.trim()}</a> `).run();
              });
            
            return true;
          }
        }
        
        return false;
      },
    },
  });

  // Speech recognition callback
  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    if (!editor || !text.trim()) return;
    
    if (isFinal) {
      // Final result: insert permanently and clear interim
      // If there's interim text showing, remove it first
      if (interimText && cursorPosRef.current !== null) {
        const { from, to } = editor.state.selection;
        // Remove interim text by deleting from saved position
        editor.chain()
          .focus()
          .deleteRange({ from: cursorPosRef.current, to: cursorPosRef.current + interimText.length })
          .insertContentAt(cursorPosRef.current, text)
          .run();
      } else {
        // No interim text, just insert
        editor.chain().focus().insertContent(text).run();
      }
      
      setInterimText('');
      cursorPosRef.current = null;
      setDictationError(null);
    } else {
      // Interim result: show as preview
      // Remove previous interim text and insert new one
      if (interimText && cursorPosRef.current !== null) {
        editor.chain()
          .focus()
          .deleteRange({ from: cursorPosRef.current, to: cursorPosRef.current + interimText.length })
          .insertContentAt(cursorPosRef.current, `<span style="color: #9ca3af; font-style: italic;">${text}</span>`)
          .run();
      } else {
        // First interim text, save cursor position
        const { from } = editor.state.selection;
        cursorPosRef.current = from;
        editor.chain()
          .focus()
          .insertContent(`<span style="color: #9ca3af; font-style: italic;">${text}</span>`)
          .run();
      }
      
      setInterimText(text);
    }
  }, [editor, interimText]);

  // Initialize speech recognition
  const {
    isRecording,
    isSupported,
    error: speechError,
    toggleRecording,
  } = useSpeechRecognition({
    onTranscript: handleTranscript,
    continuous: true,
  });
  
  // Clear interim text when recording stops
  useEffect(() => {
    if (!isRecording && interimText && cursorPosRef.current !== null && editor) {
      editor.chain()
        .focus()
        .deleteRange({ from: cursorPosRef.current, to: cursorPosRef.current + interimText.length })
        .run();
      setInterimText('');
      cursorPosRef.current = null;
    }
  }, [isRecording, interimText, editor]);

  // Show dictation errors
  useEffect(() => {
    if (speechError) {
      setDictationError(speechError);
      
      // Don't auto-clear permission errors - user needs to take action
      if (speechError.includes('permission') || speechError.includes('denied') || speechError.includes('allow')) {
        return; // Keep error visible until user takes action
      }
      
      // Clear other errors after 8 seconds
      const timeout = setTimeout(() => setDictationError(null), 8000);
      return () => clearTimeout(timeout);
    }
  }, [speechError]);

  if (!editor) {
    return null;
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxSrc(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handlePreformattedClick = () => {
    const { empty } = editor.state.selection;
    // If inside preformatted, unwrap to paragraph
    if (editor.isActive('preformattedText')) {
      editor.chain().focus().setParagraph().run();
      return;
    }
    // If selection exists, convert selected block(s) to preformatted
    if (!empty) {
      editor
        .chain()
        .focus()
        .command(({ state, tr, dispatch }) => {
          const { from, to } = state.selection;
          const text = state.doc.textBetween(from, to, '\n');
          const preNode = state.schema.nodes.preformattedText.create({}, state.schema.text(text));
          tr.replaceRangeWith(from, to, preNode);
          // If inserted at the very start, ensure a paragraph exists above to allow cursor before the box
          if (from <= 2) {
            tr.insert(1, state.schema.nodes.paragraph.create());
          }
          if (dispatch) dispatch(tr);
          return true;
        })
        .run();
      return;
    }
    // Otherwise set current block to preformatted
    editor.chain().focus().setNode('preformattedText').run();
  };

  const handleCodeBlockClick = () => {
    const { empty } = editor.state.selection;
    // If inside a code block, unwrap by converting the block to a paragraph
    if (editor.isActive('codeBlock')) {
      const unwrapped = editor
        .chain()
        .focus()
        .command(({ state, tr }) => {
          const { $from } = state.selection;
          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth);
            if (node.type.name === 'codeBlock') {
              const pos = $from.before(depth);
              tr.setNodeMarkup(pos, state.schema.nodes.paragraph);
              return true;
            }
          }
          return false;
        })
        .run();
      if (!unwrapped) {
        // Fallback to default toggle if direct unwrap failed
        editor.chain().focus().toggleCodeBlock().run();
      }
      return;
    }
    // If selection exists, convert selected block(s) to code block
    if (!empty) {
      editor.chain().focus().setCodeBlock().run();
      return;
    }
    // Otherwise, toggle code block on current block
    editor.chain().focus().toggleCodeBlock().run();
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Upload image
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/uploads/image`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        const imageUrl = `${API_BASE_URL}${data.url}`;
        
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } catch (error) {
        console.error('Failed to upload image:', error);
        alert('Failed to upload image. Please try again.');
      }
    };
    
    input.click();
  };

  const addFile = () => {
    const input = document.createElement('input');
    input.type = 'file';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:8000/api/uploads/file', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        const fileUrl = `http://localhost:8000${data.url}`;

        // Insert as a download link
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${fileUrl}" download="${data.filename}" class="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 border border-gray-300">📎 ${data.filename}</a> `)
          .run();
      } catch (error) {
        console.error('Failed to upload file:', error);
        alert('Failed to upload file. Please try again.');
      }
    };

    input.click();
  };

  const addLinkPreview = async () => {
    const url = window.prompt('Enter URL to preview:');
    if (!url) return;

    try {
      const preview = await fetchLinkPreview(url);
      if (preview) {
        editor?.chain().focus().insertContent({
          type: 'linkPreview',
          attrs: preview,
        }).run();
      } else {
        alert('Failed to fetch link preview. The link might not support previews.');
      }
    } catch (error) {
      console.error('Failed to add link preview:', error);
      alert('Failed to add link preview.');
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setShowCamera(true);
      
      // Wait for video element to be available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Failed to access camera:', error);
      alert('Failed to access camera. Please check your camera permissions.');
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !editor) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const formData = new FormData();
      formData.append('file', blob, 'camera-photo.jpg');
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/uploads/image`, {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          const imageUrl = `${API_BASE_URL}${data.url}`;
          editor.chain().focus().setImage({ src: imageUrl }).run();
          closeCamera();
        }
      } catch (error) {
        console.error('Failed to upload photo:', error);
        alert('Failed to upload photo. Please try again.');
      }
    }, 'image/jpeg', 1.0);
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const openVideoRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setShowVideoRecorder(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Failed to access camera/microphone:', error);
      alert('Failed to access camera and microphone. Please check your permissions.');
    }
  };

  const startVideoRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    recordedChunksRef.current = [];
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('file', blob, 'recorded-video.webm');
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/uploads/file`, {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          const videoUrl = `${API_BASE_URL}${data.url}`;
          
          // Insert video using the custom video node
          editor?.chain().focus().insertContent({
            type: 'video',
            attrs: {
              src: videoUrl,
              controls: true,
              style: 'width: 100%; height: auto; border-radius: 0.5rem;',
            },
          }).run();
          
          closeVideoRecorder();
        }
      } catch (error) {
        console.error('Failed to upload video:', error);
        alert('Failed to upload video. Please try again.');
      }
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecordingVideo(true);
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      mediaRecorderRef.current.stop();
      setIsRecordingVideo(false);
    }
  };

  const closeVideoRecorder = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      mediaRecorderRef.current.stop();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowVideoRecorder(false);
    setIsRecordingVideo(false);
  };

  const ToolbarButton = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="p-2 rounded transition-colors"
      style={{
        backgroundColor: active ? 'var(--color-accent)' : 'transparent',
        color: active ? 'var(--color-accent-text)' : 'var(--color-text-primary)'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
      title={title}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <div 
      className="rounded-lg overflow-hidden"
      style={{
        border: '1px solid var(--color-border-primary)',
        backgroundColor: 'var(--color-bg-primary)'
      }}
    >
      {/* Toolbar */}
      <div 
        className="editor-toolbar flex flex-wrap gap-1 items-center p-2"
        style={{
          borderBottom: '1px solid var(--color-border-primary)',
          backgroundColor: 'var(--color-bg-tertiary)'
        }}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={handleCodeBlockClick}
          active={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={handlePreformattedClick}
          active={editor.isActive('preformattedText')}
          title="Preformatted Text"
        >
          <FileText className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Add Link">
          <Link2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton onClick={addLinkPreview} title="Add Link Preview">
          <ExternalLink className="h-4 w-4" />
        </ToolbarButton>

            <ToolbarButton onClick={addImage} title="Add Image">
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton onClick={addFile} title="Attach File">
              <Paperclip className="h-4 w-4" />
            </ToolbarButton>

        {/* Voice Dictation Button */}
        {isSupported && (
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              toggleRecording();
            }}
            className={`p-2 rounded transition-colors ${isRecording ? 'recording-pulse' : ''}`}
            style={{
              backgroundColor: isRecording ? '#ef4444' : 'transparent',
              color: isRecording ? 'white' : 'var(--color-text-primary)'
            }}
            onMouseEnter={(e) => {
              if (!isRecording) {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRecording) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            title={isRecording ? 'Stop Recording' : 'Start Voice Dictation'}
            type="button"
          >
            <Mic className="h-4 w-4" />
          </button>
        )}

        {/* Camera Button - Only show on desktop or HTTPS mobile */}
        {showMediaButtons && (
          <ToolbarButton onClick={openCamera} title="Take Photo">
            <Camera className="h-4 w-4" />
          </ToolbarButton>
        )}

        {/* Video Button - Only show on desktop or HTTPS mobile */}
        {showMediaButtons && (
          <ToolbarButton onClick={openVideoRecorder} title="Record Video">
            <Video className="h-4 w-4" />
          </ToolbarButton>
        )}

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="prose max-w-none" />

      {/* Dictation Error Alert */}
      {dictationError && (
        <div 
          className="m-4 p-4 rounded-lg text-sm shadow-lg relative"
          style={{
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            border: '2px solid #ef4444'
          }}
        >
          <button
            onClick={() => setDictationError(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl leading-none"
            title="Dismiss"
          >
            ×
          </button>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-lg">🎤</div>
            <div className="pr-6">
              <strong className="block mb-1">Voice Dictation Issue</strong>
              <p className="text-sm whitespace-pre-line">{dictationError}</p>
            </div>
          </div>
        </div>
      )}

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            alt="Preview"
          />
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Take Photo</h3>
              <button
                onClick={closeCamera}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="mt-4 flex gap-3 justify-center">
              <button
                onClick={capturePhoto}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Camera className="h-5 w-5 inline mr-2" />
                Capture Photo
              </button>
              <button
                onClick={closeCamera}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Recorder Modal */}
      {showVideoRecorder && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Record Video</h3>
              <button
                onClick={closeVideoRecorder}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={!isRecordingVideo}
                className="w-full rounded-lg"
              />
              {isRecordingVideo && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  Recording...
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-3 justify-center">
              {!isRecordingVideo ? (
                <>
                  <button
                    onClick={startVideoRecording}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Video className="h-5 w-5 inline mr-2" />
                    Start Recording
                  </button>
                  <button
                    onClick={closeVideoRecorder}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={stopVideoRecording}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Stop & Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;

