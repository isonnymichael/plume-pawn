import { create } from 'zustand';

interface AppState {
  userAddress: string;
  setUserAddress: (addr: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userAddress: '',
  setUserAddress: (addr) => set({ userAddress: addr })
}));