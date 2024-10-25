import { create } from "zustand";

// Définit le type de l'état
interface SignInFormState {
  isNumberSignin: boolean;
  setIsNumberSignin: () => void;
}

const useNumberSignin = create<SignInFormState>((set) => ({
  isNumberSignin: false,
  setIsNumberSignin: () =>
    set((state) => ({ isNumberSignin: !state.isNumberSignin })),
}));

export default useNumberSignin;
