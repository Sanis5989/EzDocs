'use client';

import React, { useEffect, useState,useRef } from 'react';
import ReactQuill,{Quill} from 'react-quill';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import 'react-quill/dist/quill.snow.css';
import { QuillBinding } from 'y-quill';
import QuillCursors from 'quill-cursors';
import html2pdf from 'html2pdf.js';
import { FaFileExport } from "react-icons/fa";
import { useTheme } from 'next-themes';

// Register the cursor module with Quill
Quill.register('modules/cursors', QuillCursors);


export default function Editor({ documentId }) {
  const [quill, setQuill] = useState(null);
  const reactQuillRef = useRef(null);

  const { theme} = useTheme();
  


  useEffect(() => {
    if (reactQuillRef.current) {
      const quillInstance = reactQuillRef.current.getEditor(); // Get the Quill instance
      setQuill(quillInstance);
    }
  }, [reactQuillRef.current]);

  useEffect(() => {
    if (quill) {
      const ydoc = new Y.Doc();
      const provider = new WebsocketProvider(
        'https://ezdocssocket.onrender.com',
        documentId,
        ydoc
      );
      provider.on('status', (event) => {
        console.log('Provider status:', event.status);
      });
  
      const ytext = ydoc.getText('quill');
      const binding = new QuillBinding(ytext, quill);
      // Initialize the cursor module
      const cursorsModule = quill.getModule('cursors');

      // Listen to Yjs awareness updates and reflect them in the Quill editor
      provider.awareness.on('update', () => {
        provider.awareness.getStates().forEach((state, clientId) => {
          if (clientId !== provider.awareness.clientID) {
            const cursor = state.cursor;
            const user = state.user || { name: 'Unknown', color: '#000000' }; // Provide a default user object
      
            if (cursor) {
              cursorsModule.createCursor(clientId, user.name, user.color);
              cursorsModule.moveCursor(clientId, cursor);
            } else {
              cursorsModule.removeCursor(clientId);
            }
          }
        });
      });

      provider.awareness.setLocalState({
        user: {
          name: 'User Name',
          color: '#FF0000',
        },
        cursor: null, // or set the initial cursor state as needed
      });

      quill.on('selection-change', (range) => {
        if (range) {
          const { index, length } = range;
          provider.awareness.setLocalStateField('cursor', {
            index,
            length,
          });
      
          provider.awareness.setLocalStateField('user', {
            name: 'User Name',  // Ensure this is dynamic per user
            color: '#FF0000',   // Ensure this is unique per user
          });
        }
      });
      return () => {
        binding.destroy();
        provider.disconnect();
        ydoc.destroy();
      };
    }
  }, [quill, documentId]);


  // maintaining a4 size
  const [editorWidth, setEditorWidth] = useState(210 * 3.7795275591);

  useEffect(() => {
    const updateEditorWidth = () => {
      const a4AspectRatio = 1 / Math.sqrt(2);
      const maxWidth = 1000; // Maximum width of 1000 pixels
      const windowWidth = window.innerWidth;
      const containerPadding = 40;

      let newWidth = Math.min(windowWidth - containerPadding, maxWidth);
      setEditorWidth(newWidth);
    };

    updateEditorWidth();
    window.addEventListener('resize', updateEditorWidth);

    return () => {
      window.removeEventListener('resize', updateEditorWidth);
    };
  }, []);


  //export to pdf function
  const exportToPDF = () => {
    if (!quill) return;
  
    // Create a temporary div to hold the formatted content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = quill.root.innerHTML;
  
    // Apply styling to the temp div
    tempDiv.style.width = '210mm';  // A4 width
    tempDiv.style.padding = '10mm';  // A4 margins
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.color = 'black';  // Enforce black text color
  
    // Apply custom Quill styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      h1 { font-size: 48px !important; }
      h2 { font-size: 32px !important; }
      h3 { font-size: 24px !important; }
      p { font-size: 18px !important; }
    `;
    tempDiv.appendChild(styleElement);
  
    // Force all text to be black
    const allTextElements = tempDiv.querySelectorAll('*');
    allTextElements.forEach(el => {
      el.style.color = 'black';
    });
  
    // Append the temp div to the body
    document.body.appendChild(tempDiv);
  
    const opt = {
      margin: 0,
      filename: 'document.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
  
    setTimeout(() => {
      html2pdf().set(opt).from(tempDiv).save().then(() => {
        document.body.removeChild(tempDiv);
      });
    }, 500);
  };

  const containerStyle = {
    padding: '20px',
    paddingTop:0,
    paddingBottom:"15px",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const tolbarContainerStyle = {
    padding: '20px',
    paddingTop:0,
    paddingBottom:"15px",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const editorStyle = {
    width: `${editorWidth}px`,
    height: `${editorWidth * Math.sqrt(2)}px`, // A4 aspect ratio
    border: '1px solid #ccc',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  };
  const toolbarStyle = {
    
    marginBottom: '10px',
    padding: '0px',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };
  const toolbarButtonStyle = `
  #custom-toolbar button,
  #custom-toolbar .ql-picker {
    width: 40px;
    height: 40px;
    font-size: 20px !important;
    margin: 5px;
  }
  #custom-toolbar button svg {
    width: 32px !important;
    height: 32px !important;
  }
  #custom-toolbar .ql-picker-label {
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #custom-toolbar .ql-picker-options {
    padding: 5px 0;
  }
  #custom-toolbar .ql-picker-item {
    padding: 5px;
    font-size: 15px;
  }
  #custom-toolbar .ql-formats {
    margin-right: 12px;
  }
    #custom-toolbar .ql-header {
      width:150px;
    }
`;

const customQuillStyles = `
  /* Custom styles for headers in the editor */
  .ql-snow .ql-editor h1{
    font-size: 48px !important;
  }
  .ql-editor {
    padding: 40px !important; /* Internal margins */  
  }
  .ql-snow .ql-editor h2 {
    font-size: 32px !important;
  }
  .ql-snow .ql-editor h3 {
    font-size: 24px !important;
  }

  .ql-editor p{
    font-size: 18px !important;
  }
`;
  
 
  return (
    <>
      <style>{toolbarButtonStyle}</style>
      <style>{customQuillStyles}</style>
      <div style={tolbarContainerStyle}>
        <div id="custom-toolbar" style={toolbarStyle}>
          <select className="ql-header" defaultValue="">
            <option value=""></option>
            <option value="3"></option>
            <option value="2"></option>
            <option value="1"></option>
            
          </select>
          <button className="ql-bold"></button>
          <button className="ql-italic"></button>
          <button className="ql-underline"></button>
          <button className="ql-strike"></button>
          <button className="ql-blockquote"></button>
          <button className="ql-code-block"></button>
          <button className="ql-list" value="ordered"></button>
          <button className="ql-list" value="bullet"></button>
          <select className="ql-align">
            <option defaultValue></option>
            <option value="center"></option>
            <option value="right"></option>
            <option value="justify"></option>
          </select>
          <button className="ql-indent" value="-1"></button>
          <button className="ql-indent" value="+1"></button>
          <button className="ql-link"></button>
          <button className="ql-image"></button>
          <button className="ql-video"></button>
          <select className="ql-color"></select>
          <select className="ql-background"></select>
          <button className="ql-clean pr-10"></button>
        </div>
        <div style={containerStyle}>
          <ReactQuill
            theme="snow"
            modules={{
              toolbar: '#custom-toolbar',
              cursors: true,
            }}
            ref={reactQuillRef}
            style={editorStyle}
          />
        </div>
      </div>
    <div className='flex'>
      <button 
        onClick={exportToPDF} 
        style={theme ==="dark" ? {color:"black"} : {color:"white"}}
        className="flex fixed bottom-5 right-24 px-4 py-2 text-lg rounded-3xl shadow-lg z-50 text-black">
        {theme === "dark" ? (
          <FaFileExport size={28}  className='mx-2'/>
            ) : (
          <FaFileExport color="white" size={28}  className='mx-2'/>
          )
        }
        Export
      </button>
    </div>
      
    </>
  );
}
