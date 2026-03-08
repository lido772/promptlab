import { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useToast } from '../hooks/useToast';

// Create context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    try {
      await signInWithPopup(auth, provider);
      toast.success('Successfully signed in with Google!');
    } catch (error) {
      handleAuthError(error);
    }
  };

  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('public_profile');

    try {
      await signInWithPopup(auth, provider);
      toast.success('Successfully signed in with Facebook!');
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleAuthError = (error) => {
    console.error('Auth error:', error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      return;
    }
    
    let message = 'An error occurred during authentication.';
    
    if (error.code === 'auth/account-exists-with-different-credential') {
      message = 'An account already exists with the same email address but different sign-in credentials. Please sign in using a provider associated with this email.';
    } else if (error.code === 'auth/auth-domain-config-required') {
      message = 'Authentication domain configuration is missing.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      message = 'The authentication popup was closed before it could complete.';
    } else if (error.code === 'auth/operation-not-allowed') {
      message = 'This authentication provider is not enabled in the Firebase console.';
    } else if (error.code === 'auth/popup-blocked') {
      message = 'The authentication popup was blocked by your browser. Please allow popups for this site.';
    }

    toast.error(message);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Successfully signed out.');
    } catch (error) {
      toast.error('Error signing out.');
    }
  };

  const getIdToken = async () => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithFacebook,
        signOut,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
