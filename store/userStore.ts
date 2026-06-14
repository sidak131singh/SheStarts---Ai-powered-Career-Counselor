import { create } from 'zustand';
import { generateUserId } from '@/lib/utils';

interface UserStore {
  userId?: string;
  email?: string;
  name?: string;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (email: string, name?: string) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'shestarts_user';

export const useUserStore = create<UserStore>((set) => ({
  isAuthenticated: false,
  isLoading: true,

  setUser: (email, name) => {
    const userId = generateUserId(email);
    const userData = { userId, email, name: name || email.split('@')[0] };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    }

    set({ ...userData, isAuthenticated: true, isLoading: false });
  },

  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),

  setLoading: (loading) => set({ isLoading: loading }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ userId: undefined, email: undefined, name: undefined, isAuthenticated: false });
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const userData = JSON.parse(stored);
        set({ ...userData, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));

export function getUserId(): string {
  if (typeof window === 'undefined') return 'demo-user';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const userData = JSON.parse(stored);
      return userData.userId || 'demo-user';
    }
  } catch {}
  return 'demo-user';
}
