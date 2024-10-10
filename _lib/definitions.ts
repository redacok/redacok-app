import * as z from "zod";

export const SignInSchema = z.object({
  email: z.string().email({
    message: "Entrez une adrese mail valide",
  }),
  password: z.string().min(1, {
    message: "Le mot de passe est requis",
  }),
});
