import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User, token: string) => void;
  clearUser: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      setUser: (user, accessToken) => set({ user, accessToken }),
      clearUser: () => set({ user: null, accessToken: null }),
      isAuthenticated: () => !!get().user,
    }),
    { name: 'civicpulse-auth' },
  ),
);
