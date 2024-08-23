// utils/documentUtils.ts

import { db } from '../app/firebase/firebaseConfig';
import { doc, setDoc, onSnapshot, DocumentSnapshot } from "firebase/firestore";

export const updateDocument = async (docId: string, content: any): Promise<void> => {
  const serializedContent = content.ops ? JSON.stringify(content.ops) : JSON.stringify(content);
  await setDoc(doc(db, "documents", docId), { content: serializedContent }, { merge: true });
};

export const subscribeToDocument = (docId: string, callback: (content: any) => void): (() => void) => {
  const unsub = onSnapshot(doc(db, "documents", docId), (doc: DocumentSnapshot) => {
    if (doc.exists()) {
      const data = doc.data();
      if (data && 'content' in data) {
        let deserializedContent;
        try {
          deserializedContent = { ops: JSON.parse(data.content) };
        } catch (error) {
          console.error("Error parsing document content:", error);
          // If parsing fails, use the content as is or provide a default value
          deserializedContent = { ops: [{ insert: data.content || '' }] };
        }
        callback(deserializedContent);
      } else {
        // If 'content' field doesn't exist, initialize with empty content
        callback({ ops: [{ insert: '' }] });
      }
    } else {
      // If document doesn't exist, initialize with empty content
      callback({ ops: [{ insert: '' }] });
    }
  });
  return unsub;
};