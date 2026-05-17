import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  sendVerification: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  sendVerification: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const sendVerification = async () => {
    if (auth.currentUser) {
      const { sendEmailVerification } = await import('firebase/auth');
      await sendEmailVerification(auth.currentUser);
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Use real-time listener for profile
        const userDoc = doc(db, 'users', user.uid);
        console.log('Starting profile listener for:', user.uid);
        unsubscribeProfile = onSnapshot(userDoc, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            console.log('Profile doc does not exist, creating for:', user.uid);
            const userEmail = user.email?.toLowerCase();
            const isDefaultAdmin = userEmail === 'mavbharath01@gmail.com' || userEmail === 'admin@cnportal.com';
            
            const newProfile = {
              uid: user.uid,
              email: user.email,
              role: isDefaultAdmin ? 'admin' : 'student',
              isApproved: isDefaultAdmin,
              folderAccess: {
                linux: false,
                shell: false,
                jenkins: false,
                aws: false,
                docker: false,
                kubernetes: false,
                terraform: false,
                argocd: false,
              },
              hasVideoAccess: false,
              groups: [],
              createdAt: new Date().toISOString(),
            };
            setDoc(userDoc, newProfile).catch(err => {
              console.error('Failed to create internal user profile', err);
            });
            setProfile(newProfile);
          }
          setLoading(false);
        }, (error) => {
          const errInfo = {
            error: error instanceof Error ? error.message : String(error),
            operationType: 'get',
            path: `users/${user.uid}`,
            authInfo: {
              userId: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
            }
          };
          console.error('Profile listener error details:', JSON.stringify(errInfo));
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const userEmail = user?.email?.toLowerCase();
  const isHardcodedAdmin = userEmail === 'mavbharath01@gmail.com' || userEmail === 'admin@cnportal.com';

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin: profile?.role === 'admin' || isHardcodedAdmin,
      sendVerification,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
