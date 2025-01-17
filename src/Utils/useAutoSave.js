import { useState, useEffect, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { QuillBinding } from 'y-quill';
import { toast } from 'react-hot-toast';

const useAutoSave = (quill, fetchedFile, session, initialDelay = 2000) => {
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Debounced save function
  const saveContent = useCallback(async (content) => {
    // Don't save if content hasn't changed
    if (content === lastSavedContent) return;
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          _id: fetchedFile._id
        }),
      });

      if (res.ok) {
        setLastSavedContent(content);
        toast.success("Changes saved", {
          duration: 2000,
          position: 'bottom-right'
        });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save changes. Will retry...", {
        duration: 3000,
        position: 'bottom-right'
      });
    } finally {
      setIsSaving(false);
    }
  }, [fetchedFile._id, lastSavedContent]);

  // Set up collaborative editing
  useEffect(() => {
    if (!quill) return;

    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      'https://ezdocssocket.onrender.com',
      fetchedFile._id,
      ydoc
    );

    const ytext = ydoc.getText("quill");
    const binding = new QuillBinding(ytext, quill);

    // Initialize cursors
    const cursorsModule = quill.getModule('cursors');

    // Handle provider status
    provider.on('status', event => {
      setSocketStatus(event.status);
    });

    // Set up auto-save
    let saveTimeout;
    const handleChange = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const content = quill.root.innerHTML;
        saveContent(content);
      }, initialDelay);
    };

    // Listen for document changes
    quill.on('text-change', handleChange);

    // Handle awareness updates for cursors
    provider.awareness.on('update', () => {
      provider.awareness.getStates().forEach((state, clientId) => {
        if (clientId !== provider.awareness.clientID) {
          const cursor = state.cursor;
          const user = state.user || { name: 'Unknown', color: '#000000' };

          if (cursor) {
            cursorsModule.createCursor(clientId, user.name, user.color);
            cursorsModule.moveCursor(clientId, cursor);
          } else {
            cursorsModule.removeCursor(clientId);
          }
        }
      });
    });

    // Set local user state
    provider.awareness.setLocalState({
      user: {
        name: session?.user?.name,
        color: getRandomColor(),
      },
      cursor: null,
    });

    // Handle cursor movement
    quill.on('selection-change', (range) => {
      if (range) {
        provider.awareness.setLocalStateField('cursor', {
          index: range.index,
          length: range.length,
        });
      }
    });

    // Save initial content
    setLastSavedContent(quill.root.innerHTML);

    // Cleanup
    return () => {
      clearTimeout(saveTimeout);
      quill.off('text-change', handleChange);
      binding.destroy();
      provider.disconnect();
      ydoc.destroy();
    };
  }, [quill, fetchedFile._id, session?.user?.name, saveContent, initialDelay]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      if (quill && quill.root.innerHTML !== lastSavedContent) {
        e.preventDefault();
        e.returnValue = '';
        // Final save before unload
        await saveContent(quill.root.innerHTML);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [quill, lastSavedContent, saveContent]);

  return {
    isSaving,
    socketStatus,
    lastSavedContent
  };
};

export default useAutoSave;