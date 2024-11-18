import { create } from 'zustand'
export const usePlyrIdInfo = create((set) => ({
  plyrIdInfo: {},
  setPlyrIdInfo: (info: any) => set(() => ({ plyrIdInfo: info})),
}))