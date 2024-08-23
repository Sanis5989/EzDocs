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
        if (newContent !== quillRef.current?.getEditor()?.root.innerHTML) {
          setContent(newContent);
        }
      } else {
        console.log('No such document!');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    await updateDocument('1', content);
  };

  return (
    <div>
      <h1>Quill Editor Example</h1>
      <QuillEditor ref={quillRef} value={content} onChange={handleChange} />
      <button onClick={handleSave}>Save to Firestore</button>
      <div>
        <h2>Editor Content:</h2>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

export default EditorPage;