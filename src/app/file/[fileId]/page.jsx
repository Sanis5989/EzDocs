'use client'

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { jwtVerify, SignJWT } from 'jose';
import { useSession } from 'next-auth/react';

const TextEditor = dynamic(() => import('../TextEditor.jsx'), { ssr: false });

const EditorPage =  () => {

  const [accessFile, setAccessFile] =useState(false);
  const[loading,setLoading ] =useState();

  
  const params = useParams();
  const {data : session, status} = useSession();
  const fileId = params.fileId;

 

  useEffect(()=>{
    const methu = async ()=>{ 
    const response =await fetch(`/api/update?id=${session?.user?.id}`,{
      method:"GET",
    })
    const data = await response.json();
    const files = data?.files?.fileOwned;

    if(files.includes(fileId))
{
  setAccessFile(true);
  console.log("accesss")
}
  console.log("files owned", files)
}

methu();
  },[status])
  
  console.log("this is the id for ydoc", fileId);

  return (
    <>
      <div>
        {accessFile ? 
          <TextEditor documentId={fileId} />
          :
          <div>
            <p>FIle cannot be accessed.</p>
          </div>
        }
        
      </div>
    </>
  );
};

export default EditorPage;