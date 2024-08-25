'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const TextEditor = dynamic(() => import('../ui/TextEditor'), { ssr: false });

const EditorPage: React.FC = () => {
  const docId = '1'; // The ID of the document

  return (
    <>
    <div>
        <TextEditor documentId={docId} />
    </div>
      
    </>
  );
};

export default EditorPage;

