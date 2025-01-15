import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { FaRegFileAlt, FaEllipsisV } from 'react-icons/fa';
import { HiDotsVertical } from "react-icons/hi";
import Dialog from './ui/Dialog';
import { z } from "zod";
import validateEmail from "../../Utils/validateEmail"
import toast from 'react-hot-toast';

const FileDash = ({ title, path ,UID,fileId}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter()
  const{ theme }= useTheme();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = (e) => {
    // Prevent card click when clicking the menu
    if (e.target.closest('[data-menu="true"]')) {
      e.stopPropagation();
      return;
    }
    router.push(`/file/${path}`);
  };

  //function to handle share with email address
  const handleShare = async (email)=>{

  const {isValid, error} = validateEmail(email);

  if(error){
    toast.error("Please Enter a Valid Email address.")
    return
  }
  if(isValid){

    //adding fileaccess tokein in the file acceslist of user profile
    const response = await fetch("api/updateFileaccess",{
      method:"POST",
      headers:{
        "Content-Type": "application/json",
      },
      body: JSON.stringify({id: UID, newFile:fileId, email:email})
    })
    const body = await response.json()
    console.log("response from file access", body)
    if(response.ok){
      toast.success(`Succesfully Shared. \nIf ${email} exists in system, will receive a email with access link`)
      return;
    }
    toast.error("Error updating file access");
    
    
  }
  }

  return (
    <>
   
    <div 
      className="relative w-[200px] md:w-[250px] aspect-[1/1.4142] rounded-sm shadow-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer flex flex-col items-center justify-center gap-4 p-4"
      onClick={handleCardClick}
    >
      {/* Menu Button */}
      <div className="absolute top-2 right-2" data-menu="true" ref={menuRef}>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className='mt-1 bg-transparent'
        >
          {theme === "dark" ? 
          <HiDotsVertical 
            className="hover:bg-[#0d746200] rounded-full p-1 dark:bg-transparent" 
            color='white'
            size={30}
          /> : 
          <HiDotsVertical 
          className="hover:bg-[#0d746200] rounded-full p-1 dark:bg-transparent" 
          color='black'
          size={30}
        />}
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
            <div 
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setShowMenu(false);
                setShowShareModal(true);
              }}
            >
              Share
            </div>
          </div>
        )}
      </div>

      {/* File Icon */}
      <div className="p-5 rounded-full bg-gray-100 group-hover:bg-blue-100">
        <FaRegFileAlt className="text-gray-400 group-hover:text-blue-500" size={60}/>
      </div>
      
      {/* File Title */}
      <p className="text-base text-center text-gray-500 font-medium">{title}</p>

      
    </div>
    {/* Share Modal */}
      {/* {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Share File</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Add share logic here
                  setShowShareModal(false);
                }}
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )} */}
       <Dialog isOpen={showShareModal}
      onClose={() => setShowShareModal(false)}
      onSubmit={(value) => handleShare(value)}
      title="Share File Access With"
      placeholder="Enter Email address"
      buttonText="Open Modal"
      submitButtonText="Share"
      cancelButtonText="Close"
      className="custom-class"/>
     </>
  );
};

export default FileDash;