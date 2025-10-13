import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';

interface ImpersonationContextType {
  impersonatedUser: User | null;
  isImpersonating: boolean;
  startImpersonation: (user: User) => void;
  stopImpersonation: () => void;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

const IMPERSONATION_KEY = 'ezpog_impersonation';

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);

  useEffect(() => {
    // Load impersonation from localStorage on mount
    const stored = localStorage.getItem(IMPERSONATION_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setImpersonatedUser(user);
      } catch (error) {
        console.error('Error loading impersonation:', error);
        localStorage.removeItem(IMPERSONATION_KEY);
      }
    }
  }, []);

  const startImpersonation = (user: User) => {
    setImpersonatedUser(user);
    localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(user));
  };

  const stopImpersonation = () => {
    setImpersonatedUser(null);
    localStorage.removeItem(IMPERSONATION_KEY);
  };

  return (
    <ImpersonationContext.Provider
      value={{
        impersonatedUser,
        isImpersonating: impersonatedUser !== null,
        startImpersonation,
        stopImpersonation,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error('useImpersonation must be used within ImpersonationProvider');
  }
  return context;
}
