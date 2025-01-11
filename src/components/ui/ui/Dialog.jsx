import React, { useState, useEffect } from 'react';
import {Button} from "../button"
import { IoCloseCircle } from "react-icons/io5";
import { useRouter } from 'next/navigation';

const Dialog = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Enter Title",
  placeholder = "Enter your title here",
  buttonText = "Open Dialog",
  submitButtonText = "Submit",
  cancelButtonText = "Cancel",
  path,
  
  showTriggerButton = true,
  className = ""
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(isOpen);

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen]);

  const handleClose = () => {
    setIsModalOpen(false);
    setInputValue();
    onClose?.();
  };

  const handleSubmit = () => {
    onSubmit?.(inputValue);
    handleClose();
  };
  const router = useRouter()

  return (
    <div className={className}>
      {/* {showTriggerButton && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {buttonText}
        </button>
      )} */}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-black">{title}</h2>
              

                <IoCloseCircle size={40} onClick={handleClose} className='hover:cursor-pointer' color='grey'/>
              
            </div>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={"Enter a title"}
              className="w-full px-3 py-2 border mb-4 "
              autoFocus
            />

            <div className="flex justify-center ">
            
              <Button
                onClick={handleSubmit}
                className="px-4 py-2 mt-5 dark:bg-black text-white"
              >
                {submitButtonText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dialog;