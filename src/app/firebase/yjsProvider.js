import * as Y from 'yjs';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from "./firebaseConfig";

export const createYDoc = (docId) => {
  const ydoc = new Y.Doc();

  const firestoreDocRef = doc(db,"documents", docId);

 // Convert Uint8Array to Base64 string
 const uint8ArrayToBase64 = (uint8Array) => {
  const binaryString = String.fromCharCode(...uint8Array);
  return btoa(binaryString);
};

// Convert Base64 string back to Uint8Array
const base64ToUint8Array = (base64) => {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const uint8Array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
  } catch (error) {
    console.error('Error decoding Base64 string:', error);
    return new Uint8Array(); // Return an empty Uint8Array on error
  }
};

// Sync changes from Firebase to Yjs
onSnapshot(firestoreDocRef, (snapshot) => {
  const data = snapshot.data();
  if (data && data.content) {
    const update = base64ToUint8Array(data.content);
    Y.applyUpdate(ydoc, update);
  }
});

// Sync changes from Yjs to Firebase
ydoc.on('update', (update) => {
  const base64Update = uint8ArrayToBase64(update);
  setDoc(firestoreDocRef, { content: base64Update }, { merge: true });
});

return ydoc;
};