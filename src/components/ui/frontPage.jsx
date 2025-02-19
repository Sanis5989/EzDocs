
"use client"
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import { AiOutlinePlus } from 'react-icons/ai';
import FileDash from "./FileDash"
import Dialog from "./ui/Dialog"
import { useState } from 'react';
import toast from 'react-hot-toast';
import { forEach, update } from 'lodash';
import jwt from "jsonwebtoken";
import { SignJWT } from 'jose';
import { Button } from './button';
import { LuImport } from "react-icons/lu";
import { useRef } from 'react';
import Loading from '@/app/loading';



function FrontPage() {

  const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();
    
    const[loading,setloading] = useState()

    const {data : session, status} = useSession();

    const[files, setFiles] = useState();

    const[file, setFile] =useState();

    const[fileLoading, setFileloading] =useState(false)

    const [isSharedFiles, setIsSharedFiles] = useState(false);
    
    const [sharedFilesList, setSharedFilesList] = useState()

    const [sharedFFiles, setSharedFFiles] = useState()

    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_FILE_TOKEN);
    const fileInputRef = useRef(null);

  useEffect(()=>(console.log("render")))

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
        if (file) {
          if (file.type === 'application/pdf') {
            const fileUrl = URL.createObjectURL(file);
            const encodedUrl = encodeURIComponent(fileUrl);
            router.push(`/pdf/${encodedUrl}`);
            // Process the file here (e.g., upload it or read its content)
          } else {
            alert('Please upload a valid PDF file.');
        }
      }}

      const handleButtonClick = () => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      };

    //function to fetch file names
      async function fetchFileTitle(token) {
        const fileDetail = await fetch(`/api/file?id=${token}`,{
          method:"GET",
          headers:{
            "Content-Type": "application/json",
          }
        });

        let res = await fileDetail.json();
        
        return{
          ...res,
          token: token 
        };

      }

    //fuction to fetch all the token of owned files
    useEffect(()=>{
        //function to get ids of all the files
        async function getFiles() {
          
          try {
            const file = await fetch(`/api/update?id=${session?.user?.id}`, {
              method: "GET",
            });
            const result = await file.json();
            if (result.files && Array.isArray(result.files.fileOwned)) {
              setFiles(result.files.fileOwned);
            } else {
              console.error("API returned a non-array value for files", result);
              setError("Couldn't load your files");
            }
          } catch (err) {
            console.error("Error fetching files:", err);
            setError("Failed to fetch your files");
            toast.error("Error loading files");
          } 
        }

        if(session?.user){
          getFiles();
        }
    },[status])


    //function to fetch each file owned details
    useEffect(() => {
      const fetchAllFileDetails = async () => {
        if (!files || !Array.isArray(files) || files.length === 0) return;
        
        const filePromises = files.map(data => fetchFileTitle(data));
        try {
          const results = await Promise.all(filePromises);
          setFile(results);
        } catch (error) {
          console.error("Error fetching file details:", error);
          toast.error("Failed to load some files");
        }
      };

      if (files) {
        fetchAllFileDetails();
      }
    }, [files]);

    //method to create a new file and save in database
    const createFile = async (title)=>{
      try {
        console.log("received", title )
        const response = await fetch("api/file", 
          {
            method:"POST",
            headers:{
              "Content-Type": "application/json",
            },
            body: JSON.stringify({title: title})
          }
        )
        if(response.ok){
          
          const resp = await response.json()
                    
          //updating owned file list 
          const updateFileOwn = await fetch("api/update",{
            method:"POST",
            headers:{
              "Content-Type": "application/json",
              
            },
            body: JSON.stringify({id: session?.user?.id, newFile:resp.id})
          })
          const resUpdate = await updateFileOwn.json();

          console.log("created new file succesfully");
          toast.success(resUpdate.message)
          router.push(`/file/${resUpdate.token}`)
        }
      } catch (error) {
        toast.error("Error creating new file.")
        console.log(error)
      }
    }

    useEffect(()=>{
      const getShared = async ()=>{
          //fetching access list files from db
          const response = await fetch(`/api/updateFileaccess?id=${session?.user?.id}`,{
          method:"GET",
          });

          setloading(true);
          const data = await response.json();
          const accessFiles = data?.filesAccess?.fileAccess;
      
          // const {payload} = await jwtVerify(fileId,secret);
          // const FID = payload?.id;
          if(accessFiles && Array.isArray(accessFiles)){
            setSharedFilesList(accessFiles)
            console.log("list of access files id",accessFiles);
          }
          setloading(false);
          }
        getShared();
    },[isSharedFiles])

    useEffect(() => {
      const fetchAllSharedFileDetails = async () => {
        setFileloading(true);
        if (!sharedFilesList || !Array.isArray(sharedFilesList) || sharedFilesList.length === 0) return;
        
        const sharedFilePromises = sharedFilesList.map(async (val) => {
          const token = await new SignJWT({id: val})
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .sign(secret);
          
          const fileDetail = await fetch(`/api/file?id=${token}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            }
          });
          
          let res = await fileDetail.json();
          return {
            ...res,
            token: token
          };
        });
        
        try {
          const results = await Promise.all(sharedFilePromises);
          setSharedFFiles(results);
          setFileloading(false)
        } catch (error) {
          console.error("Error fetching shared file details:", error);
          toast.error("Failed to load some shared files");
        }
      };
    
      if (sharedFilesList) {
        fetchAllSharedFileDetails();
      }
    }, [sharedFilesList]);




useEffect(()=>(console.log(files)),[files])



  return (
    <>
    <div className="flex md:flex-row md:px-10 justify-around w-full mb-5">
    <h1 className="text-lg md:text-xl font-semibold">Welcome to Ez Docs {session?.user?.name} </h1>
    </div>

    {/* toggle for your files and shared files */}
    <div className="w-60 h-10 bg-gray-100 rounded-full p-1 cursor-pointer relative mb-5 my-3"
         onClick={() => setIsSharedFiles(!isSharedFiles)}>
      {/* Background pill that slides */}
      <div
        className={`absolute h-8 w-28 bg-white dark:bg-[#23201f] rounded-full shadow-md transition-transform duration-300 ease-in-out ${
          isSharedFiles ? 'translate-x-[120px]' : 'translate-x-0'
        }`}
      />
      
      {/* Labels container */}
      <div className="relative flex h-full">
        {/* Your Files Label */}
        <div
          className={`flex-1 flex items-center justify-center transition-colors duration-300 z-10  ${
            isSharedFiles ? 'text-[#23201f] ' : 'text-gray-800 font-medium dark:text-white'
          }`}
        >
          Your Files
        </div>
        
        {/* Shared Files Label */}
        <div
          className={`flex-1 flex items-center justify-center transition-colors duration-300 z-10  ${
            isSharedFiles ? 'text-[#23201f] font-medium dark:text-white' : 'text-gray-500 ' 
          }`}
        >
          Shared Files
        </div>
      </div>
    </div>

  {/* grid of documents */}
  <div className="container mx-auto p-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto justify-items-center">
    {/* Create a new document */}
    {!isSharedFiles && (
      <div
        onClick={() => setIsOpen(true)}
        className="w-[200px] md:w-[250px] aspect-[1/1.4142] rounded-sm shadow-lg border-2 border-dashed border-gray-300 
          hover:border-blue-500 hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer
          flex flex-col items-center justify-center gap-4 p-4"
      >
        <div className="p-3 rounded-full bg-gray-100 group-hover:bg-blue-100">
          <AiOutlinePlus className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
        </div>
        <p className="text-base text-gray-500 font-medium">Create New Document</p>
      </div>
    )}

    {loading ? (
      <Loading size={70} />
    ) : (
      <>
        {!isSharedFiles && file?.length > 0 && (
          file.map((data,index) => (
            <FileDash
              loading={fileLoading}
              title={data.title}
              key={index}
              path={data.token}
              fileId={data._id}
              UID={session?.user?.id}
            />
          ))
        )}
        {isSharedFiles && sharedFFiles?.length > 0 && (
          sharedFFiles.map((data) => (
            <FileDash
            loading={fileLoading}
              title={data.title}
              key={data._id}
              path={data.token}
              fileId={data._id}
              UID={session?.user?.id}
              share={true}
            />
          ))
        )}
      </>
    )}
  </div>
</div>



<div>
<Button className='fixed bottom-10 right-10 rounded-full text-xl' onClick={handleButtonClick} >
<input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
<LuImport size={25}/> <p className='ml-3 hidden md:block'>PDF</p>
</Button>

</div>
  <Dialog isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSubmit={(value) => createFile(value)}
      title="Title"
      placeholder="Enter something..."
      buttonText="Open Modal"
      submitButtonText="Save"
      cancelButtonText="Close"
      className="custom-class"/>
  </>
  )
}




export default FrontPage