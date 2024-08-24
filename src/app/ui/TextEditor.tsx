'use client';

import React, { useEffect, useRef, useState ,forwardRef} from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
}

const TextEditor: React.FC<QuillEditorProps> = forwardRef<Quill | null, QuillEditorProps>(({ value, onChange }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [isTyping, setIsTyping] = useState(false); // Track if the user is currently typing

  // Initialize Quill Editor
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean'],
            [{ 'align': [] }],
          ],
        },
      });

      quillRef.current.on('text-change', (delta, oldDelta, source) => {
        if (source === 'user') {
          setIsTyping(true);
          const content = quillRef.current?.root.innerHTML || '';
          onChange(content);
        }
      });

      quillRef.current.on('selection-change', (range) => {
        if (range === null) {
          setIsTyping(false);
        }
      });

      // Set initial content after Quill is initialized
      if (value && quillRef.current.root.innerHTML !== value) {
        quillRef.current.root.innerHTML = value;
      }
    }
  }, []); // Run only once to initialize the editor

  // Handle external value changes
  useEffect(() => {
    if (!isTyping && quillRef.current && quillRef.current.root.innerHTML !== value) {
      // Save current cursor position
      const quill = quillRef.current;
      const range = quill.getSelection();

      // Update content only if it has changed
      quill.clipboard.dangerouslyPasteHTML(value);

      // Restore cursor position
      if (range) {
        quill.setSelection(range.index, range.length);
      }
    }
  }, [value, isTyping]); // Run whenever the value or isTyping state changes

  return (
    <div>
      <div ref={editorRef} style={{ height: '300px' }}></div>
    </div>
  );
});

TextEditor.displayName = "TextEditor"

export default TextEditor;
/* eslint-env browser */

// "use clent"

// import React, { useEffect, useRef } from 'react';
// import Quill from 'quill';
// import { QuillBinding } from 'y-quill';
// import { createYDoc } from '../firebase/yjsProvider';
// import 'quill/dist/quill.snow.css'


// const QuillEditor = ({ docId }) => {
//   const editorRef = useRef(null);

//   useEffect(() => {
//     const ydoc = createYDoc(docId);

//     const quill = new Quill(editorRef.current, {
//       theme: 'snow',
//     });

//     const binding = new QuillBinding(ydoc.getText('quill'), quill);

//     return () => {
//       binding.destroy();
//     };
//   }, [docId]);

//   return <div ref={editorRef} style={{ height: '300px' }}/>;
// };

// export default QuillEditor;

