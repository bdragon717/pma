/**
 * Zustand Auth Regist
 */

import { create } from 'zustand';

type AuthState = {
  isAuth: boolean;
  setAuth: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuth: false,
  setAuth: (value) => set({ isAuth: value }),
}));