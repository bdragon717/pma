/**
 * Auth Context
 */

import { AuthContextType } from '@/src/utils/types';
import * as SecureStore from 'expo-secure-store';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const TOKEN_KEY = 'auth_token';
  const isAuthenticated = !!userToken; // !! : 값을 boolean(true/false)으로 변환

  useEffect(() => {
    restoreToken();
  }, []);

  const restoreToken = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      setUserToken(token);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async (token: string) => {
    try {
      setLoading(true);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      setUserToken(token);
    } finally {
      setLoading(false);
    }
  };  

  const signOut = async () => {
    try {
      setLoading(true);
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setUserToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        loading,
        signIn,
        signOut,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
      throw new Error ("useAuth는 AuthProvider 내에서 사용해야 합니다.");
    }
    return ctx;
};