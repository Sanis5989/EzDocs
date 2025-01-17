'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

// Dynamically import Lottie with SSR disabled
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

import whiteLoader from '../Utils/WhileLoader.json';
import darkLoader from '../Utils/DarkLoader.json';

function Loading({ size = 100 }) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-1 relative justify-center items-center">
      {typeof window !== 'undefined' ? (
        <Lottie
          animationData={theme === 'dark' ? whiteLoader : darkLoader}
          className="flex justify-center items-center"
          loop={true}
          style={{
            width: size,
            height: size,
          }}
        />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default Loading;
