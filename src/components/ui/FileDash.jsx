"use client"

import { useRouter } from 'next/navigation';
import React from 'react'
import { FaRegFileAlt } from "react-icons/fa";

function FileDash({title,path}) {
  const router = useRouter();
  return (
    <>
         <div className="w-[200px] md:w-[250px] aspect-[1/1.4142]  rounded-sm shadow-lg border-2 border-dashed border-gray-300 
                hover:border-blue-500 hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer
                flex flex-col items-center justify-center gap-4 p-4" onClick={()=> {router.push(`/file/${path}`)}}
              >
                <div className="p-5 rounded-full bg-gray-100 group-hover:bg-blue-100">
                  <FaRegFileAlt className=" text-gray-400 group-hover:text-blue-500" size={60}/>
                </div>
                <p className="text-base text-center text-gray-500 font-medium">{title}</p>
              </div>
    </>
  )
}

export default FileDash