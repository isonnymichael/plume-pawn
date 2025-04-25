import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  address: string | null;
  balance: string | null;
  isBalanceLoading: boolean;
  login: (address: string) => void;
  logout: () => void;
  setAddress: (address: string | null) => void;
  setBalance: (balance: string | null) => void;
  setBalanceLoading: (isLoading: boolean) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  address: null,
  balance: null,
  isBalanceLoading: true,
  login: (address) => set({ isLoggedIn: true, address }),
  logout: () => set({ isLoggedIn: false, address: null }),
  setAddress: (address) => set({ address }),
  setBalance: (balance) => set({ balance }),
  setBalanceLoading: (isLoading: boolean) => set({ isBalanceLoading: isLoading }),
}));

export default useAuthStore;