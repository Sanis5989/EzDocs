import LoginForm from '@/components/ui/ui/LoginForm'
import React from 'react'
import Image from 'next/image'

function page() {
  return (
    <main className="flex min-h-screen flex-col items-center ">
      <div className="flex flex-col md:flex-row justify-around w-full">
     
        <div className="p-10 sm:p-0 flex-1 md:ms-32 flex justify-center items-center ">
          <Image 
            src={"/landing.png"} 
            height={750} 
            width={750} 
            style={{objectFit:"contain", marginTop:"6%"}} 
            alt="landing image of files" 
            className="max-w-full"
          />
        </div>
        <div className="flex-1 flex justify-center">
          <LoginForm />
          
        </div>
      </div>
    </main>
  )
}

export default page