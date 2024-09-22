'use client';

import React, { useEffect, useState,useRef } from 'react';
import ReactQuill,{Quill} from 'react-quill';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import 'react-quill/dist/quill.snow.css';
import { QuillBinding } from 'y-quill';
import QuillCursors from 'quill-cursors';
import html2pdf from 'html2pdf.js';
import { FaFileExport ,FaFileImport } from "react-icons/fa";
import { useTheme } from 'next-themes';
import mammoth from 'mammoth';
import  ImageResize  from 'quill-image-resize-module-react';
import DraggableImage from '../Utils/DraggableImage';




// Register the cursor module with Quill
Quill.register('modules/cursors', QuillCursors);

Quill.register("modules/imageResize", ImageResize);

Quill.register('modules/draggableImage', DraggableImage);

export default function Editor({ documentId }) {
  const [quill, setQuill] = useState(null);
  const reactQuillRef = useRef(null);
  // maintaining a4 size
  const [editorWidth, setEditorWidth] = useState(210 * 3.7795275591);
  const { theme} = useTheme();
  const fileInputRef = useRef(null);

  const [exporthHeight, setExportHeight] = useState()
  


  //setting the quill instance
  useEffect(() => {
    if (reactQuillRef.current) {
      const quillInstance = reactQuillRef.current.getEditor();
      setQuill(quillInstance);

      // Safe access to modules
      const imageResizeModule = quillInstance.getModule('imageResize');
      if (imageResizeModule) {
        console.log('ImageResize module found:', imageResizeModule);
        
        // Override the onResize method
        imageResizeModule.onResize = (image, rect) => {
          if (image && rect) {
            console.log('Image resize event:', {
              src: image.src,
              newWidth: rect.width,
              newHeight: rect.height,
              naturalWidth: image.naturalWidth,
              naturalHeight: image.naturalHeight,
              currentWidth: image.width,
              currentHeight: image.height,
              style: image.getAttribute('style')
            });
            updateQuillContents(image, rect);
          } else {
            console.log('Resize event triggered but image or rect is undefined', { image, rect });
          }
        };

        // Add a mutation observer to track size changes  
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              const image = mutation.target;
              setExportHeight(image.height)
              console.log('Image style changed:', {
                
                newStyle: image.getAttribute('style'),
                width: image.width,
                height: image.height
              });
            }
          });
        });

        // Observe all images in the editor
        quillInstance.root.querySelectorAll('img').forEach((img) => {
          observer.observe(img, { attributes: true, attributeFilter: ['style'] });
        });

        // Observe for new images added to the editor
        quillInstance.on('text-change', (delta, oldDelta, source) => {
          delta.ops.forEach((op) => {
            if (op.insert && op.insert.image) {
              setTimeout(() => {
                const newImage = quillInstance.root.querySelector(`img[src="${op.insert.image}"]`);
                if (newImage) {
                  observer.observe(newImage, { attributes: true, attributeFilter: ['style'] });
                  console.log('New image added and observed:', newImage.src);
                }
              }, 0);
            }
          });
        });
      } else {
        console.warn('ImageResize module not found');
      }
    }
  }, [reactQuillRef.current]);


  //connnecting to the socket and exchanging data
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

  //maintaining a4 size
  useEffect(() => {
    const updateEditorWidth = () => {
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

  // Function to import DOCX with enhanced formatting preservation
  const importDOCX = (event) => {
    const file = event.target.files[0];
    if (!file) return; // Check if a file was selected

    // Check if the file is a DOCX file
    if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.error("Please select a valid DOCX file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
      const arrayBuffer = loadEvent.target.result;

      // Use mammoth to convert the DOCX file to HTML with enhanced options
      mammoth.convertToHtml({ arrayBuffer: arrayBuffer }, {
        styleMap: [
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Subtitle'] => h2:fresh",
          "b => strong",
          "i => em",
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Normal'] => p:fresh",
          "r[style-name='Bold'] => strong",
          "r[style-name='Italic'] => em",
          // Text alignment
          "p[style-name='Centered'] => p.centered",
          "p[style-name='Right'] => p.right-aligned",
          "p[style-name='Justified'] => p.justified",
          // Add other mappings for specific styles as needed
        ],
        includeDefaultStyleMap: true
      })
      .then(function (result) {
        const html = result.value;
        if (quill) {
          // Use Quill's clipboard to safely paste HTML
          quill.clipboard.dangerouslyPasteHTML(html);
        } else {
          console.error("Quill instance is not ready.");
        }
      })
      .catch(function (error) {
        console.error("Error converting DOCX:", error);
      });
    };

    reader.readAsArrayBuffer(file);
  };


  const updateQuillContents = (image, rect) => {
    const blot = Quill.find(image);
    if (blot) {
      const index = quill.getIndex(blot);
      quill.updateContents([
        { retain: index },
        { 
          attributes: { 
            width: rect.width,
            height: rect.height
          }
        }
      ]);
    }};

  //export to pdf function
  const exportToPDF = () => {
    if (!quill) return;
  
    console.log("Starting PDF export process");
  
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = quill.root.innerHTML;
    console.log("Quill content copied to temp div");
  
    tempDiv.style.width = '210mm';
    tempDiv.style.minHeight = '297mm';
    tempDiv.style.padding = '10mm';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.color = 'black';
    tempDiv.style.position = 'relative';
  
    const images = tempDiv.querySelectorAll('img');
    console.log(`Found ${images.length} images in the content`);
  
    const imagePromises = Array.from(images).map(img => {
      return new Promise((resolve, reject) => {
        if (img.complete) {
          console.log(`Image already loaded: ${img.src}`);
          processImage(img);
          resolve();
        } else {
          img.onload = () => {
            console.log(`Image loaded: ${img.src}`);
            processImage(img);
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${img.src}`);
            reject();
          };
        }
      });
    });
  
    function processImage(img) {
      // Get the width and height from the image attributes or computed style
      const width = img.getAttribute('width') || img.style.width || img.naturalWidth;
      // const height = img.getAttribute('height') || img.style.height || img.naturalHeight;
      const height = exporthHeight;
      
      if (width && height) {
        img.style.width = typeof width === 'number' ? `${width}px` : width;
        img.style.height = typeof height === 'number' ? `${height}px` : height;
      }
      
      // Handle any translation (dragging) that was applied
      const style = img.getAttribute('style') || '';
      const transformMatch = style.match(/transform:\s*translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);
      
      if (transformMatch) {
        const translateX = parseFloat(transformMatch[1]);
        const translateY = parseFloat(transformMatch[2]);
        
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-block';
        wrapper.style.transform = `translate(${translateX}px, ${translateY}px)`;
        img.style.transform = 'none'; // Remove transform from the image
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
      }
      
      // Log image details
      console.log(`Image processed:  width=${img.style.width}, height=${img.style.height}, transform=${img.style.transform || 'none'}`);
    }
  
    // Apply custom Quill styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      h1 { font-size: 38.4px !important; }
      h2 { font-size: 25.6px !important; }
      h3 { font-size: 19.2px !important; }
      p { font-size: 14.4px !important; vertical-align: middle; }
      ul, ol {
        font-size: 14.4px !important;
        padding-left: 40px;
        list-style-type: disc;
        line-height: 1;
      }
      img {
        
      }
    `;
  
    tempDiv.appendChild(styleElement);
  
    // Append the temp div to the body
    document.body.appendChild(tempDiv);
    console.log("Temp div appended to body");
  
    // Wait for all images to load before generating PDF
    Promise.all(imagePromises).then(() => {
      console.log("All images loaded, generating PDF");
  
      const opt = {
        margin: 10,
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          logging: true,
          onrendered: function(canvas) {
            console.log("html2canvas rendering complete");
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
  
      html2pdf().set(opt).from(tempDiv).save().then(() => {
        console.log("PDF generation complete");
        document.body.removeChild(tempDiv);
      }).catch(error => {
        console.error("Error generating PDF:", error);
      });
    }).catch(error => {
      console.error("Error loading images:", error);
    });
  };
  

  //styles
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

  ul, ol { 
    font-size: 18px !important;
    padding-left: 20px; /* Adjust left padding for indentation */
    
    
  }
    ul { list-style-type: disc; } /* Show bullets for unordered lists */
    ol { list-style-type: decimal; } /* Show numbers for ordered lists */
`;


  
 
  return (
    <>
      <style>{toolbarButtonStyle}</style>
      <style>{customQuillStyles}</style>

      <div style={tolbarContainerStyle}><input
        type="file"
        accept=".docx"
        onChange={importDOCX}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <button onClick={() => fileInputRef.current.click()}>
        <FaFileImport size={24} />
      </button>
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
              imageResize: {
                parchment: Quill.import('parchment')
                // See optional "config" below
            },
            draggableImage: {}
             
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