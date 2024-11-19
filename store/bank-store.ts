import { create } from 'zustand';

interface BankStore {
  invalidateData: () => void;
  lastUpdate: number;
}

const bankStore = create<BankStore>((set) => ({
  lastUpdate: Date.now(),
  invalidateData: () => set({ lastUpdate: Date.now() }),
}));

export default bankStore;
