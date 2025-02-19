import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { FaRegFileAlt, FaEllipsisV } from 'react-icons/fa';
import { HiDotsVertical } from "react-icons/hi";
import Dialog from './ui/Dialog';
import { z } from "zod";
import validateEmail from "../../Utils/validateEmail"
import toast from 'react-hot-toast';
import Loading from '@/app/loading';

const FileDash = ({ title, path ,UID,fileId,share, loading}) => {
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
      body: JSON.stringify({ newFile:fileId, email:email})
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

        {!share &&
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
 }
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
      {loading ? <Loading size={50}/> :
<>

      <div className="p-5 rounded-full bg-gray-100 group-hover:bg-blue-100">
        <FaRegFileAlt className="text-gray-400 group-hover:text-blue-500" size={60}/>
      </div><p className="text-base text-center text-gray-500 font-medium">{title}</p></>
       }
      {/* File Title */}
      

      
    </div>

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