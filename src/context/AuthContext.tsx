
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, onIdTokenChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from "firebase/firestore";
import { app, db } from '@/lib/firebase';
import type { UserProfile } from '@/types/user-profile';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  userProfile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const auth = getAuth(app);

  useEffect(() => {
    // The profile listener must be torn down on sign-out / user switch,
    // otherwise it keeps firing (and erroring) against the old user's doc.
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeProfile?.();
      unsubscribeProfile = null;
      setUser(user);
      if (user) {
        setLoading(true);
        // Set session cookie for middleware auth checks
        // Firebase Hosting only forwards cookies named "__session"
        try {
          const token = await user.getIdToken();
          const secure = window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `__session=${token}; path=/; max-age=${60 * 60}; SameSite=Lax${secure}`;
        } catch (e) {
          console.error("Failed to set session cookie:", e);
        }

        const docRef = doc(db, "users", user.uid);
        unsubscribeProfile = onSnapshot(
          docRef,
          (snap) => {
            if (snap.exists()) {
              const profileData = snap.data() as UserProfile;
              setRole(profileData.role);
              setUserProfile(profileData);
            } else {
              // Signed in but no profile yet → onboarding will create it.
              setRole(null);
              setUserProfile(null);
            }
            setLoading(false);
          },
          () => setLoading(false)
        );
      } else {
        // Clear session cookie on logout
        document.cookie = "__session=; path=/; max-age=0";
        setRole(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    // ID tokens expire after an hour; Firebase refreshes them silently, so keep
    // the middleware's session cookie in sync with every refreshed token.
    const unsubscribeToken = onIdTokenChanged(auth, async (tokenUser) => {
      if (!tokenUser) return;
      try {
        const token = await tokenUser.getIdToken();
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `__session=${token}; path=/; max-age=${60 * 60}; SameSite=Lax${secure}`;
      } catch (e) {
        console.error("Failed to refresh session cookie:", e);
      }
    });

    return () => {
      unsubscribeProfile?.();
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, loading, role, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
