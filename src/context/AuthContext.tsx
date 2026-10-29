import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthorized: boolean;
  authorizedEmails: string[];
  isAdmin: boolean;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateWhitelistEmails: (emails: string[]) => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isWhitelistModalOpen: boolean;
  setIsWhitelistModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial default whitelist with owner email; owner can add friend's email anytime in settings
const DEFAULT_WHITELIST = ['kauangabrielsilva777@gmail.com'];
const WHITELIST_STORAGE_KEY = 'kperf_authorized_emails';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WHITELIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_WHITELIST;
    } catch {
      return DEFAULT_WHITELIST;
    }
  });

  // Fetch remote whitelist from Firestore
  useEffect(() => {
    async function loadRemoteWhitelist() {
      try {
        const snap = await getDoc(doc(db, 'whitelist', 'access'));
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.authorizedEmails) && data.authorizedEmails.length > 0) {
            setAuthorizedEmails(data.authorizedEmails);
            localStorage.setItem(WHITELIST_STORAGE_KEY, JSON.stringify(data.authorizedEmails));
          }
        }
      } catch (err) {
        // Fall back to local whitelist gracefully
        console.warn('Using local authorized email list fallback.');
      }
    }
    loadRemoteWhitelist();
  }, [user]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  // Normalize email for comparison
  const userEmail = (user?.email || '').trim().toLowerCase();
  const normalizedWhitelist = authorizedEmails.map((e) => e.trim().toLowerCase());
  const isAuthorized = !user || normalizedWhitelist.includes(userEmail);
  const isAdmin = userEmail === 'kauangabrielsilva777@gmail.com';

  const signInGoogle = async () => {
    clearAuthError();
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return; // User canceled popup, no error needed
      }
      setAuthError('Não foi possível autenticar com o Google. Tente novamente.');
      throw err;
    }
  };

  const signInEmail = async (email: string, pass: string) => {
    clearAuthError();
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setAuthError('E-mail ou senha incorretos. Verifique suas credenciais.');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('Formato de e-mail inválido.');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('Muitas tentativas sem sucesso. Aguarde alguns instantes.');
      } else {
        setAuthError('Falha ao entrar: ' + (err.message || 'Erro desconhecido'));
      }
      throw err;
    }
  };

  const signUpEmail = async (email: string, pass: string) => {
    clearAuthError();
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('Este e-mail já possui uma conta cadastrada.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('A senha é muito fraca. Digite pelo menos 6 caracteres.');
      } else {
        setAuthError('Falha no cadastro: ' + (err.message || 'Erro desconhecido'));
      }
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    clearAuthError();
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setAuthError('Nenhuma conta encontrada com este endereço de e-mail.');
      } else {
        setAuthError('Erro ao solicitar redefinição: ' + err.message);
      }
      throw err;
    }
  };

  const logout = async () => {
    clearAuthError();
    await signOut(auth);
  };

  const updateWhitelistEmails = async (newEmails: string[]) => {
    const cleaned = newEmails.map((e) => e.trim().toLowerCase()).filter(Boolean);
    setAuthorizedEmails(cleaned);
    localStorage.setItem(WHITELIST_STORAGE_KEY, JSON.stringify(cleaned));

    if (user && isAdmin) {
      try {
        await setDoc(doc(db, 'whitelist', 'access'), {
          id: 'access',
          authorizedEmails: cleaned,
          updatedBy: user.email,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'whitelist/access');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthorized,
        authorizedEmails,
        isAdmin,
        signInGoogle,
        signInEmail,
        signUpEmail,
        resetPassword,
        logout,
        updateWhitelistEmails,
        authError,
        clearAuthError,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isWhitelistModalOpen,
        setIsWhitelistModalOpen,
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
