import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  isPaid: boolean;
}

interface AuthState {
  user: User | null;
  login: () => void;
  logout: () => void;
  upgrade: () => void;
  downgrade: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Start logged out
  login: () => set({ 
    user: { 
      id: '1', 
      name: 'Demo User', 
      email: 'demo@example.com', 
      isPaid: false 
    } 
  }),
  logout: () => set({ user: null }),
  upgrade: () => set((state) => ({ 
    user: state.user ? { ...state.user, isPaid: true } : null 
  })),
  downgrade: () => set((state) => ({ 
    user: state.user ? { ...state.user, isPaid: false } : null 
  })),
}));
