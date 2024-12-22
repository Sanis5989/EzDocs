'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';




// Dynamically import Lottie with ssr disabled
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import whiteLoader from "../Utils/WhileLoader.json";
import darkLoader from '../Utils/DarkLoader.json';

function Loading() {
  
  const {theme } = useTheme();
  
  return (
    <div className='flex h-screen flex-1 relative justify-center items-center'>
      {/* Add a fallback while Lottie loads */}
      {typeof window !== 'undefined' ? (
        <Lottie
          animationData={theme == "dark" ? whiteLoader : darkLoader}
          className="flex justify-center items-center"
          loop={true}
        />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default Loading;