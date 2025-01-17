'use client'

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { jwtVerify, SignJWT } from 'jose';
import { useSession } from 'next-auth/react';
import Loading from '@/app/loading.tsx';

const TextEditor = dynamic(() => import('../TextEditor.jsx'), { ssr: false });

const EditorPage =  () => {

  const [accessFile, setAccessFile] =useState(false);
  const[loading,setLoading ] =useState();

  
  const params = useParams();
  const {data : session, status} = useSession();
  const fileId = params.fileId;

  const secret = new TextEncoder().encode(
    process.env.NEXT_PUBLIC_FILE_TOKEN
  );

 

  useEffect(()=>{
    const methu = async ()=>{ 
    setLoading(true);
    const response =await fetch(`/api/update?id=${session?.user?.id}`,{
      method:"GET",
    })
    const data = await response.json();
    const files = data?.files?.fileOwned;

    if(files?.includes(fileId))
    {
      setAccessFile(true);
    }
    
    }

    const checkShareAccess = async ()=>{
      setLoading(true);
      //fetching access list files from db
      const response = await fetch(`/api/updateFileaccess?id=${session?.user?.id}`,{
      method:"GET",
      });
      const data = await response.json();
      const accessFiles = data?.filesAccess?.fileAccess;

      const {payload} = await jwtVerify(fileId,secret);
      const FID = payload?.id;

      console.log(accessFiles)
      if(accessFiles?.includes(FID)){
        setAccessFile(true);
      }
      
    }
    methu();
    checkShareAccess();
    setLoading(false)
  },[status]);

  
  console.log("this is the id for ydoc", fileId);

  return (
    <>
    {loading ? <Loading /> : 
     <div>
        {accessFile ? 
          <TextEditor documentId={fileId} />
          :
          <div>
            <p>FIle cannot be accessed.</p>
          </div>
        }
        
      </div>}
     
    </>
  );
};

export default EditorPage;