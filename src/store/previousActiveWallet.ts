import { create } from 'zustand'
export const usePreviousActiveWallet = create((set) => ({
  previousActiveWallet: {},
  setPreviousActiveWallet: (activeWallet: any) => set(() => ({ previousActiveWallet: activeWallet})),
}))