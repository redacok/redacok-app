import { create } from "zustand";

type BooleanState = {
  addDocument: boolean;
  toggle: () => void;
  setValue: (newValue: boolean) => void;
};

const addDocumentStore = create<BooleanState>((set) => ({
  addDocument: false,
  toggle: () => set((state) => ({ addDocument: !state.addDocument })),
  setValue: (newValue: boolean) => set({ addDocument: newValue }),
}));

export default addDocumentStore;
