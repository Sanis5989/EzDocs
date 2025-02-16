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
import DraggableImage from '../../Utils/DraggableImage';
import { useSession } from 'next-auth/react';
import { IoIosSave } from "react-icons/io";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
// import useAutoSave from "../../Utils/useAutoSave"



// Register the cursor module with Quill
Quill.register('modules/cursors', QuillCursors);

Quill.register("modules/imageResize", ImageResize);

Quill.register('modules/draggableImage', DraggableImage);

export default function Editor({ documentId }) {

  

  const[error, setError] = useState(false);
  const [content, setContent] = useState('');
  const {data : session, status} = useSession();
  const [quill, setQuill] = useState(null);
  const reactQuillRef = useRef(null);
  // maintaining a4 size
  const [editorWidth, setEditorWidth] = useState(210 * 3.7795275591);
  const { theme} = useTheme();
  const fileInputRef = useRef(null);
  const [fetchedFile, setFetchedFile]= useState({
    _id:"",
    content:""
  });

  // const { isSaving, socketStatus } = useAutoSave(
  //   quill, 
  //   fetchedFile, 
  //   session
  // );

  const [exporthHeight, setExportHeight] = useState();

  const [socketProvider,setSocketProvider] =useState("disconnected");
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  // useEffect(() => {
    
    
  // }, [quill, fetchedFile.content]);
  

  //function to get a random color for the cursor
  // Define colors array once
  const COLORS = [
    '#FF3366',  // vibrant pink/red - great visibility on both themes
    '#00CC99',  // bright turquoise - pops on dark, readable on light
    '#FF9900',  // vivid orange - excellent contrast on both
    '#6633FF',  // bright purple - stands out on both themes
    '#00CCFF'   // electric blue - high visibility on both
  ]

    // Function to get random color 
    const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)]

    useEffect(() => {
      // Fetch content from the backend
      const fetchContent = async () => {
        console.log("state",socketProvider)
        if(socketProvider === "connected"){
          console.log("exit fecth")
            return
        }
        try {
          const response = await fetch(`/api/file?id=${documentId}`, {
            method: 'GET',

          });
          console.log("fetced")
          const result = await response.json();
          
          if (response.ok) {
            const { _id, content} = result;
            setFetchedFile({_id,content});
          } else {
            setError(true);
            console.error('Error fetching content:', result.error);
          }
        } catch (error) {
          setError(true);
          console.error('Error in fetchContent:', error);
        }
      };
      
  
      fetchContent();
    }, [documentId]);

    useEffect(() => {
      // setContent(fetchedFile.content);
      const overwriteContentWithFetchedData = () => {
        if (quill) {
          // Overwrite the socket document with the latest fetched data
          quill.setContents(fetchedFile.content);
          setContent(fetchedFile.content)
          console.log("this is overwrite", fetchedFile.content)
        }
      };
    
      // Trigger the overwrite when either `quill` or `fetchedFile.content` changes
      setTimeout(()=>{
        if (quill && fetchedFile.content) {
          
          overwriteContentWithFetchedData();
      }
    },[1000])
    }, [fetchedFile]);

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
        fetchedFile._id,
        ydoc
      );

      // Listen for status changes
    provider.on('status', (event) => {
      setSocketProvider(event.status); // Update provider state
      console.log('Provider status:', event.status);
    });
      
      const ytext = ydoc.getText("quill");

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
          name: session?.user?.name,
          color: getRandomColor(),
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
            name: session?.user?.name,  // Ensure this is dynamic per user
            color: getRandomColor(),   // Ensure this is unique per user
          });
        }
      });

      let saveTimeout = null; // Track save delay

    // Function to send updates to the backend
    const saveToDB = async (content) => {
      try{
      const res = await fetch('/api/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          _id:fetchedFile._id
        }),
      });
      if(res.ok){
        toast.success("File Saved")
      }
      }
      catch(error){
        toast.error(error)
        console.log(error);
      }
    };

    // Track changes with a manual timeout (instead of direct debounce)
    ydoc.on('update', () => {
      clearTimeout(saveTimeout); // Reset previous timer
      saveTimeout = setTimeout(() => {
        const content = ytext.toString(); // Extract text
        saveToDB(content);
      }, 3000); // Save after 3 seconds of inactivity
    });
      return () => {
        clearTimeout(saveTimeout);
        binding.destroy();
        provider.disconnect();
        ydoc.destroy();
      };
    }
  }, [quill,  fetchedFile._id]);

  

  // //maintaining a4 size
  // useEffect(() => {
  //   const updateEditorWidth = () => {
  //     const maxWidth = 1000; // Maximum width of 1000 pixels
  //     const windowWidth = window.innerWidth;
  //     const containerPadding = 40;

  //     let newWidth = Math.min(windowWidth - containerPadding, maxWidth);
  //     setEditorWidth(newWidth);
  //   };

  //   updateEditorWidth();
  //   window.addEventListener('resize', updateEditorWidth);

  //   return () => {
  //     window.removeEventListener('resize', updateEditorWidth);
  //   };
  // }, []);

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

  //function to update quill with image and text content
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
  tempDiv.style.boxSizing = 'border-box';

  // Process images (code remains the same)
  // ...

  const styleElement = document.createElement('style');
  styleElement.textContent = `
    * {
      box-sizing: border-box;
    }
    h1 { font-size: 48px !important; }
    h2 { font-size: 32px !important; }
    h3 { font-size: 24px !important; }
    p { 
      font-size: 18px !important; 
      line-height: 1.42;
      margin: 0 0 10px 0;
    }
    ul, ol {
      font-size: 18px !important;
      padding-left: 20px !important;
      margin: 0 0 10px 0 !important;
      list-style-position: outside !important;
      vertical-align: baseline !important;
    }
    li {
      font-size: 18px !important;
      line-height: 1.42 !important;
      margin-bottom: 5px !important;
      vertical-align: baseline !important;
    }
    ul { list-style-type: disc !important; }
    ol { list-style-type: decimal !important; }
  `;

  tempDiv.appendChild(styleElement);

  // Force list item alignment
  const lists = tempDiv.querySelectorAll('ul, ol');
  lists.forEach(list => {
    list.style.paddingLeft = '20px';
    list.style.marginLeft = '0';
  });

  const listItems = tempDiv.querySelectorAll('li');
  listItems.forEach(item => {
    item.style.display = 'list-item';
    item.style.marginLeft = '0';
  });

  // Append the temp div to the body
  document.body.appendChild(tempDiv);
  console.log("Temp div appended to body", tempDiv);

  // Wait for all images to load before generating PDF
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

  Promise.all(imagePromises).then(() => {
    console.log("All images loaded, generating PDF");

    const opt = {
      margin: 1,
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


//function to save file content in database
const saveToDb = async ()=>{
  if(!quill){
    toast.error("Error");
    return;
  }

  try {
    const content = quill.root.innerHTML;
    const res = await fetch("/api/file",{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({content,_id:fetchedFile._id}),
    });
    if(res.ok){
       toast.success("File saved.")
 
    }
   
  } catch (error) {

    toast.error(error)
    console.log(error);
  }

   
}

// let saveTimeout;
// if(quill){
// quill.on('text-change', () => {
//   clearTimeout(saveTimeout);
//   saveTimeout = setTimeout(() => {
//       const content = quill.getContents();
//       saveToDb(content);
//   }, 2000);
// })}

  useEffect(()=>(console.log("rendered")))

  //styles
  const containerStyle = {
    width: '100%',
  maxWidth: '800px', /* Default A4 width in points */
  margin: '0 auto',
  padding: '16px',
  boxSizing: 'border-box'
    
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
    position: 'relative',
    width: `100%`,
    aspectRatio:'1/1.4142',
    border: '1px solid #ccc',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  
  boxSizing: 'border-box'
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
    { error ? 
      (<div>
        Error loading file
      </div>) : 
      <div>
<style>{toolbarButtonStyle}</style>
      <style>{customQuillStyles}</style>

      <div style={tolbarContainerStyle}><input
        type="file"
        accept=".docx"
        onChange={importDOCX}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      {/* <button onClick={() => fileInputRef.current.click()}>
        <FaFileImport size={24} />
      </button> */}
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
            value={content}
          />
        </div>
      </div>
    <div className='flex flex-row gap-2'>
      <button 
        onClick={exportToPDF} 
        style={theme ==="dark" ? {color:"black"} : {color:"white"}}
        className="flex fixed bottom-5 right-16 px-4 py-2 text-lg rounded-3xl shadow-lg z-50 text-black">
        {theme === "dark" ? (
          <FaFileExport size={28}  className='mx-2'/>
            ) : (
          <FaFileExport color="white" size={28}  className='mx-2'/>
          )
        }
        Export
      </button>
      <button 
        onClick={saveToDb} 
        style={theme ==="dark" ? {color:"black"} : {color:"white"}}
        className="flex fixed bottom-5 right-64 px-4 py-2 text-lg rounded-3xl shadow-lg z-50 text-black">
        {theme === "dark" ? (
          <IoIosSave size={28}  className='mx-2'/>
            ) : (
          <IoIosSave color="white" size={28}  className='mx-2'/>
          )
        }
        Save
      </button>
    </div>
      </div>  
    }
      
      
    </>
  );
}
