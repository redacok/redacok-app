import { create } from "zustand";

interface KYCState {
  currentStep: string;
  setCurrentStep: (step: string) => void;
}

export const useKYCStore = create<KYCState>((set) => ({
  currentStep: "",
  setCurrentStep: (step) => set({ currentStep: step }),
}));
