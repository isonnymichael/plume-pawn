import { create } from 'zustand';

interface SettingState {
  APR: string | null;
  isAPRLoading: boolean;
  LTV: string | null;
  isLTVLoading: boolean;
  setAPR: (APR: string | null) => void;
  setAPRLoading: (isLoading: boolean) => void;
  setLTV: (LTV: string | null) => void;
  setLTVLoading: (isLoading: boolean) => void;
}

const useSettingStore = create<SettingState>((set) => ({
    APR: null,
    isAPRLoading: true,
    LTV: null,
    isLTVLoading: true,
    setAPR: (APR) => set({ APR }),
    setAPRLoading: (isLoading: boolean) => set({ isAPRLoading: isLoading }),
    setLTV: (LTV) => set({ LTV }),
    setLTVLoading: (isLoading: boolean) => set({ isLTVLoading: isLoading }),
}));

export default useSettingStore;