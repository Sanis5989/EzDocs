'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { collection, doc, getDoc, query, setDoc, getDocs } from 'firebase/firestore';

interface AuthContextProps {
  user: User | undefined;
  isAuthenticated: boolean;
  logIn: (email: string, password: string) => Promise<{ success: boolean; err?: string }>;
  signUp: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{ success: boolean; data?: UserCredential; msg?: string }>;
  logOut: () => Promise<{ success: boolean; msg?: string }>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        updateUserData(user.uid);
      } else {
        setIsAuthenticated(false);
        setUser(undefined);
      }
    });
    return unsub;
  }, []);

  const updateUserData = async (userId: string) => {
    try {
      const docRef = doc(db, 'users', userId);
      const userDoc = await getDoc(docRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUser({
          ...user,
          email: data.email,
        } as User);
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error getting document:', error);
    }
  };

  const logIn = async (email: string, password: string) => {
    try {
      const userCreds = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCreds.user);
      
      return { success: true };
    } catch (error: any) {
      console.log(error.message);
      let err = error.message;
      if (err.includes('auth/invalid-credential')) err = 'Invalid email or password.';
      if (err.includes('auth/invalid-email')) err = 'Invalid email';
      return { success: false, err };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    let registeredEmails: string[] = [];

    const emails = collection(db, 'registered_emails');

    const q = query(emails);

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      registeredEmails.push(doc.data().email as string);
    });

    if (!registeredEmails.includes(email)) {
      const msg = 'Please register your email.';
      return { success: false, msg };
    }

    try {
      const response: UserCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (response?.user?.uid) {
        const userDocRef = doc(db, 'users_admin', response.user.uid);

        await setDoc(userDocRef, {
          email,
          username,
          userId: response.user.uid,
        });

        return { success: true, data: response };
      } else {
        throw new Error('User creation failed');
      }
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes('(auth/invalid-email)')) msg = 'Invalid email';
      if (msg.includes('(auth/email-already-in-use)')) msg = 'This email is already in use.';
      return { success: false, msg };
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, msg: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, logIn, signUp, logOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be wrapped inside AuthContextProvider');
  }
  return value;
};
