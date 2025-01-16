"use client"

import React from 'react'
import { EmbedPDF } from '@simplepdf/react-embed-pdf';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

function page() {
  const params = useParams();
  const pdfUrl = decodeURIComponent(params.pdf);

  return (
    <div className='flex justify-center md:mx-40'>     
        <EmbedPDF
        documentURL={pdfUrl}
        mode="inline"
        className='w-full h-screen'
        />
    </div>
  )
}

export default page