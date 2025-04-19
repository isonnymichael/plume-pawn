import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  address: string | null;
  login: (address: string) => void;
  logout: () => void;
  setAddress: (address: string | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  address: null,
  login: (address) => set({ isLoggedIn: true, address }),
  logout: () => set({ isLoggedIn: false, address: null }),
  setAddress: (address) => set({ address }),
}));

export default useAuthStore;