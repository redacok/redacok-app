import { create } from "zustand";

interface KYCState {
  currentStep: string;
  setStep: (step: string) => void;
}

export const useKYCStore = create<KYCState>((set) => ({
  currentStep: "personal",
  setStep: (step) => set({ currentStep: step }),
}));
