import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import * as authService from '@/services/firebase/auth';

export function useAuth() {
  const { user, firebaseUser, loading, error } = useAuthContext();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    organizationId?: string
  ) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await authService.signUp(email, password, displayName, organizationId);
    } catch (err) {
      setActionError(err as Error);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await authService.signIn(email, password);
    } catch (err) {
      setActionError(err as Error);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const signOut = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await authService.signOut();
    } catch (err) {
      setActionError(err as Error);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await authService.resetPassword(email);
    } catch (err) {
      setActionError(err as Error);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    user,
    firebaseUser,
    loading: loading || actionLoading,
    error: error || actionError,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  };
}
