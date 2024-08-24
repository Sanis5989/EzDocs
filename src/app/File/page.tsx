'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const QuillEditor = dynamic(() => import('../ui/TextEditor'), { ssr: false });

const EditorPage: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const quillRef = useRef<any>(null); // Reference to the Quill editor instance

  const handleChange = async (newContent: string) => {
    setContent(newContent);
    await updateDocument('1', newContent);
  };

  const updateDocument = async (docId: string, newContent: string): Promise<void> => {
    try {
      await setDoc(doc(db, 'documents', docId), { content: newContent }, { merge: true });
      console.log('Document successfully updated');
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  useEffect(() => {
    const docRef = doc(db, 'documents', '1');

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const newContent = docSnap.data()?.content || '';

        // Prevent unnecessary updates to avoid cursor jumping
        if (newContent !== content) {
          setContent(newContent);

          // Restore cursor position
          if (quillRef.current) {
            const quillEditor = quillRef.current.getEditor();
            const range = quillEditor.getSelection();
            quillEditor.setContents(newContent);
            if (range) {
              quillEditor.setSelection(range.index, range.length);
            }
          }
        }
      } else {
        console.log('No such document!');
      }
    });

    return () => unsubscribe();
  }, [content]);

  const handleSave = async () => {
    await updateDocument('1', content);
  };

  return (
    <div>
      <h1>Quill Editor Example</h1>
      <QuillEditor value={content} onChange={handleChange} />
      <button onClick={handleSave}>Save to Firestore</button>
      <div>
        <h2>Editor Content:</h2>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

export default EditorPage; 

// 'use client';

// import React from 'react';
// import dynamic from 'next/dynamic';

// const QuillEditor = dynamic(() => import('../ui/TextEditor'), { ssr: false });

// const EditorPage: React.FC = () => {
//   const docId = '1'; // The ID of the document

//   return (
//     <div>
//       <h1>Yjs with Quill and Firebase Example</h1>
//       <QuillEditor docId={docId} />
//     </div>
//   );
// };

// export default EditorPage;
