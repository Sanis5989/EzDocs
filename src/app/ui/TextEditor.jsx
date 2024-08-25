// 'use client';
// import { useEffect, useRef, useState } from 'react';
// import Quill from 'quill';
// import * as Y from 'yjs';
// import { WebsocketProvider } from 'y-websocket';
// import { QuillBinding } from 'y-quill';
// import 'quill/dist/quill.snow.css';

// export default function Editor({ documentId }) {
//   const editorRef = useRef(null);
//   const [quill, setQuill] = useState(null);

//   const quillModules = {
//     toolbar: [
//       [{ header: [1, 2, 3, false] }],
//       ['bold', 'italic', 'underline', 'strike', 'blockquote'],
//       [{ list: 'ordered' }, { list: 'bullet' }],
//       ['link', 'image'],
//       [{ align: [] }],
//       [{ color: [] }],
//       ['code-block'],
//       ['clean'],
//     ],
//   };

//   const quillFormats = [
//     'header',
//     'bold',
//     'italic',
//     'underline',
//     'strike',
//     'blockquote',
//     'list',
//     'bullet',
//     'link',
//     'image',
//     'align',
//     'color',
//     'code-block',
//   ];


//   useEffect(() => {
//     if (!quill && editorRef.current) {
//       const quillInstance = new Quill(editorRef.current, {
//         theme: "snow",
//         modules:{
//           toolbar: "#custom-toolbar"
//         }
//       });
//       setQuill(quillInstance);
//     }
//   }, [quill]);

//   useEffect(() => {
//     if (quill) {
//       const ydoc = new Y.Doc();
//       const provider = new WebsocketProvider(
//         'ws://localhost:1234',
//         documentId,
//         ydoc
//       );
//       const ytext = ydoc.getText('quill');
//       const binding = new QuillBinding(ytext, quill);

//       return () => {
//         binding.destroy();
//         provider.disconnect();
//         ydoc.destroy();
//       };
//     }
//   }, [quill, documentId]);

//   return (
//     <div >
//      <div id="custom-toolbar">
//   <button className="ql-bold"></button>
//   <button className="ql-italic"></button>
//   <button className="ql-underline"></button>
//   <button className="ql-strike"></button>
// </div>
//       <div ref={editorRef} />
//     </div>
//   );
// }



'use client';

import React, { useEffect, useState,useRef } from 'react';
import ReactQuill,{Quill} from 'react-quill';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import 'react-quill/dist/quill.snow.css';
import { QuillBinding } from 'y-quill';
import QuillCursors from 'quill-cursors';

// Register the cursor module with Quill
Quill.register('modules/cursors', QuillCursors);


export default function Editor({ documentId }) {
  const [quill, setQuill] = useState(null);
  const reactQuillRef = useRef(null);
  


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
  const [editorWidth, setEditorWidth] = useState(1000);

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

  const containerStyle = {
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

  

  return (
    <div style={containerStyle}
    >
      <div id="custom-toolbar" style={{ width: `${editorWidth}px`, marginBottom: '5px' }}>
        <select className="ql-header" defaultValue="">
          <option value="1"></option>
          <option value="2"></option>
          <option value=""></option>
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
        <button className="ql-clean"></button>
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
  );
}
