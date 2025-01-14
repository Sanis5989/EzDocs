
"use client"
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import { AiOutlinePlus } from 'react-icons/ai';
import FileDash from "./FileDash"
import Dialog from "./ui/Dialog"
import { useState } from 'react';
import toast from 'react-hot-toast';
import { update } from 'lodash';


function FrontPage() {

  const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();

    const {data : session, status} = useSession();

    const[files, setFiles] = useState();

    console.log(status)
  
    if (status === "authenticated") {
        console.log(session.user)
        console.log(`Signed in as ${session.user.email}`);
    }
    useEffect(()=>{
      

        //function to get ids of all the files
        async function getFiles(){
          const file = await fetch(`/api/update?id=${session?.user?.id}`,{
            method:"GET",
          })
          const result = await file.json();
          if (result.files && Array.isArray(result.files.fileOwned)) {
            setFiles(result.files.fileOwned);
          } else {
            console.error("API returned a non-array value for files",result);
          }
        }
        if(session?.user){
          getFiles();
        }
        
      
    
    },[status])

    //method to create a new file and save in database
    const createFile = async (title)=>{
      try {
        console.log("received", title )
        const response = await fetch("api/file", 
          {
            method:"POST",
            headers:{
              "Contebt-Type": "application/json",
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
            body: JSON.stringify({id: session.user.id, newFile: resp.id})
          })
          console.log("created new file succesfully");
          toast.success(await updateFileOwn.json().message)
          router.push(`/file/${resp.id}`)
        }
      } catch (error) {
        toast.error("Error creating new file.")
        console.log(error)
      }
    }


  return (
    <>
    <div className="flex md:flex-row md:px-10 justify-around w-full mb-20">
    <h1 className="text-lg md:text-xl font-semibold">Welcome to Ez Docs {session?.user?.name} </h1>
  </div>

  {/* grid of documents */}
  <div className="container mx-auto p-4" >
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto justify-items-center">
      {/* to create a new document */}
      <div onClick={()=>setIsOpen(true)} className="w-[200px] md:w-[250px] aspect-[1/1.4142]  rounded-sm shadow-lg border-2 border-dashed border-gray-300 
        hover:border-blue-500 hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer
        flex flex-col items-center justify-center gap-4 p-4"
      >
        <div className="p-3 rounded-full bg-gray-100 group-hover:bg-blue-100">
          <AiOutlinePlus className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
        </div>
        <p className="text-base  text-gray-500 font-medium">Create New Document</p>
      </div>
   

{files && files.map((data) => (
  <FileDash title={data} key={data} path={data}/>
))}

      
    </div>
  </div>   <Dialog isOpen={isOpen}
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