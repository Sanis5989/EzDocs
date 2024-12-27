
"use client"
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react'
import { AiOutlinePlus } from 'react-icons/ai';

function FrontPage() {

    const router = useRouter();

    const {data : session, status} = useSession();

    console.log(status)
  
    if (status === "authenticated") {
      console.log("seeshh",session.user)
      console.log(`Signed in as ${session.user.email}`);
    }

  return (
    <>
    <div className="flex md:flex-row md:px-10 justify-around w-full mb-20">
    <h1 className="text-lg md:text-xl font-semibold">Welcome to Ez Docs {session?.user?.name} </h1>
  </div>

  {/* grid of documents */}
  <div className="container mx-auto p-4" >
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto justify-items-center">
      <div onClick={()=>{
    router.push("/file/1")
  }} className="w-[200px] md:w-[250px] aspect-[1/1.4142]  rounded-sm shadow-lg border-2 border-dashed border-gray-300 
        hover:border-blue-500 hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer
        flex flex-col items-center justify-center gap-4 p-4"
      >
        <div className="p-3 rounded-full bg-gray-100 group-hover:bg-blue-100">
          <AiOutlinePlus className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
        </div>
        <p className="text-base  text-gray-500 font-medium">Create New Document</p>
      </div>

      <div className="w-[200px] md:w-[250px] aspect-[1/1.4142]  rounded-sm shadow-lg border-2 border-dashed border-gray-300 
        hover:border-blue-500 hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer
        flex flex-col items-center justify-center gap-4 p-4"
      >
        <div className="p-3 rounded-full bg-gray-100 group-hover:bg-blue-100">
          <AiOutlinePlus className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
        </div>
        <p className="text-base text-center text-gray-500 font-medium">Create New Document</p>
      </div>

      <div className="w-[200px] md:w-[250px] aspect-[1/1.4142]  rounded-sm shadow-lg border-2 border-dashed border-gray-300 
        hover:border-blue-500 hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer
        flex flex-col items-center justify-center gap-4 p-4"
      >
        <div className="p-3 rounded-full bg-gray-100 group-hover:bg-blue-100">
          <AiOutlinePlus className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
        </div>
        <p className="text-base text-gray-500 font-medium">Create New Document</p>
      </div>

      <div className="w-[200px] md:w-[250px] aspect-[1/1.4142]  rounded-sm shadow-lg border-2 border-dashed border-gray-300 
        hover:border-blue-500 hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer
        flex flex-col items-center justify-center gap-4 p-4"
      >
        <div className="p-3 rounded-full bg-gray-100 group-hover:bg-blue-100">
          <AiOutlinePlus className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
        </div>
        <p className="text-base text-gray-500 font-medium">Create New Document</p>
      </div>

      <div className="w-[200px] md:w-[250px] aspect-[1/1.4142]  rounded-sm shadow-lg border-2 border-dashed border-gray-300 
        hover:border-blue-500 hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer
        flex flex-col items-center justify-center gap-4 p-4"
      >
        <div className="p-3 rounded-full bg-gray-100 group-hover:bg-blue-100">
          <AiOutlinePlus className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
        </div>
        <p className="text-base text-gray-500 font-medium">Create New Document</p>
      </div>
    </div>
  </div>
  </>
  )
}

export default FrontPage