import LoginForm from '@/components/ui/ui/LoginForm'
import React from 'react'
import Image from 'next/image'

function page() {
  return (
    <main className="flex min-h-screen flex-col items-center ">
      <div className="flex flex-col md:flex-row justify-around w-full">

        <div className="p-5 sm:p-0 flex-1 md:ms-32 flex justify-center items-center flex-col gap-4">
          <Image 
            src={"/landing.png"} 
            height={600} 
            width={600} 
            style={{objectFit:"contain", marginTop:"4%"}} 
            alt="landing image of files" 
            className="max-w-full"
          />
          <h1 className='text-xl md:mx-32 mt-10 text-center font-semibold'>Seamless Collaboration, Effortless Editing, and Hassle-Free PDF Signing – All in One Powerful Platform!</h1>
        </div>
        <div className="flex-1 flex justify-center">
          <LoginForm />
          
        </div>
      </div>
    </main>
  )
}

export default page