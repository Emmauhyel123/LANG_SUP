import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, testConnection, loginWithGoogle, logoutUser } from '../services/firebase';
import { firestoreData } from '../services/firestoreData';
import { User } from '../types';

interface FirebaseContextType {
  firebaseUser: FirebaseUser | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{
  children: React.ReactNode;
  onUserAuthenticated?: (user: User) => void;
}> = ({ children, onUserAuthenticated }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Test connection to Firestore on initial boot as required by skill
    testConnection().then((connected) => {
      setIsConnected(connected);
    });

    // 2. Auth state observer
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsLoading(false);

      if (user && onUserAuthenticated) {
        // Derive or create university persona
        const isFaculty = user.email?.includes('faculty') || user.email === 'emmanuelhyeladi070@gmail.com';
        const academicUser: User = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Research Scholar',
          email: user.email || 'scholar@university.edu',
          role: isFaculty ? 'staff' : 'student',
          academic_year: 1,
          department: isFaculty ? 'Social Sciences (Lead Faculty Researcher)' : 'Social Sciences (Undergraduate)',
          student_id_code: isFaculty ? 'FAC-8088' : `UG-${user.uid.slice(0, 4).toUpperCase()}`,
          avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          enrolled_date: new Date().toISOString().split('T')[0],
        };

        // Sync with Firestore users collection
        try {
          await firestoreData.saveUser(academicUser);
        } catch (err) {
          console.warn('Could not sync user to Firestore:', err);
        }

        onUserAuthenticated(academicUser);
      }
    });

    return () => unsubscribe();
  }, [onUserAuthenticated]);

  const handleSignInWithGoogle = async () => {
    try {
      setError(null);
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google Sign-in was cancelled or failed.');
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setFirebaseUser(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to sign out.');
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        firebaseUser,
        isConnected,
        isLoading,
        error,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
