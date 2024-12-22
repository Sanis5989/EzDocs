'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const TextEditor = dynamic(() => import('../TextEditor.jsx'), { ssr: false });

const EditorPage = () => {
  const params = useParams();
  const fileId = params.fileId as string;
  
  console.log("this is the id", fileId);

  return (
    <>
      <div>
        <TextEditor documentId={fileId} />
      </div>
    </>
  );
};

export default EditorPage;