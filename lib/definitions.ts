import { Currencies } from "@/constants";
import * as z from "zod";

export const SignInSchema = z.object({
  email: z.string().email({
    message: "Entrez une adrese mail valide",
  }),
  password: z.string().min(4, {
    message: "Le code PIN doit avoir au moins 4 chiffres",
  }),
});

export const SignInWithNumberSchema = z.object({
  phone: z.string().min(6, {
    message: "Le numéro de téléphone est requis",
  }),
  password: z.string().min(4, {
    message: "Le code PIN doit avoir au moins 4 chiffres",
  }),
});

export const SignUpSchema = z.object({
  email: z.string().email({
    message: "Entrez une adrese mail valide",
  }),
  phone: z.string().min(6, {
    message: "Le numéro de téléphone est requis",
  }),
  country: z.string().min(1, {
    message: "Vous devez sélectionner un pays",
  }),
  countryCode: z.string().min(1, {
    message: "Vous devez sélectionner un pays",
  }),
  password: z
    .string()
    .min(4, {
      message: "Le code PIN doit avoir au moins 4 chiffres",
    })
    .max(8),
  name: z.string().min(1, {
    message: "Le nom est requis",
  }),
  termsAge: z.boolean().refine((value) => value === true, ""),
  termsLaw: z.boolean().refine((value) => value === true, ""),
  termsActions: z.boolean().refine((value) => value === true, ""),
  termsViolation: z.boolean().refine((value) => value === true, ""),
  terms: z.boolean().refine((value) => value === true, ""),
  fraud: z.boolean().refine((value) => value === true, ""),
});
// .superRefine(({ password }, checkPassComplexity) => {
//   const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
//   const containsLowercase = (ch: string) => /[a-z]/.test(ch);
//   const containsSpecialChar = (ch: string) =>
//     /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
//   let countOfUpperCase = 0,
//     countOfLowerCase = 0,
//     countOfNumbers = 0,
//     countOfSpecialChar = 0;

//   for (let i = 0; i < password.length; i++) {
//     const ch = password.charAt(i);
//     if (!isNaN(+ch)) countOfNumbers++;
//     else if (containsUppercase(ch)) countOfUpperCase++;
//     else if (containsLowercase(ch)) countOfLowerCase++;
//     else if (containsSpecialChar(ch)) countOfSpecialChar++;
//   }

//   let errObj = {
//     upperCase: { pass: true, message: "Au moins une lettre majuscule" },
//     lowerCase: { pass: true, message: "Ajouter des lettres minuscules" },
//     specialCh: { pass: true, message: "Au moins un caractère spécial" },
//     totalNumber: { pass: true, message: "Minimum 4 caractères" },
//   };

//   if (countOfLowerCase < 1) {
//     errObj = { ...errObj, lowerCase: { ...errObj.lowerCase, pass: false } };
//   }
//   if (countOfNumbers < 1) {
//     errObj = {
//       ...errObj,
//       totalNumber: { ...errObj.totalNumber, pass: false },
//     };
//   }
//   if (countOfUpperCase < 1) {
//     errObj = { ...errObj, upperCase: { ...errObj.upperCase, pass: false } };
//   }
//   if (countOfSpecialChar < 1) {
//     errObj = { ...errObj, specialCh: { ...errObj.specialCh, pass: false } };
//   }

//   if (
//     countOfLowerCase < 1 ||
//     countOfUpperCase < 1 ||
//     countOfSpecialChar < 1 ||
//     countOfNumbers < 1
//   ) {
//     checkPassComplexity.addIssue({
//       code: "custom",
//       path: ["password"],
//       message: JSON.stringify(errObj),
//     });
//   }
// });

export const UpdateUserCurrencySchema = z.object({
  currency: z.custom((value) => {
    const found = Currencies.some((c) => c.value === value);
    if (!found) {
      throw new Error(`Invalid Currency: ${value}`);
    }

    return value;
  }),
});

export const UpdateInfoSchema = z.object({
  id: z.string().min(8),
  name: z.string().min(1, {
    message: "Le nom est requis",
  }),
  email: z.string().email({
    message: "Entrez une adrese mail valide",
  }),
  phone: z.string().min(6, {
    message: "Le numéro de téléphone est requis",
  }),
  country: z.string().min(1, {
    message: "Vous devez sélectionner un pays",
  }),
  countryCode: z.string().min(1, {
    message: "Vous devez sélectionner un pays",
  }),
  password: z
    .string()
    .max(8)
    .refine((value) => value.length === 0 || value.length >= 4, {
      message: "Le code PIN doit avoir au moins 4 chiffres",
    }),
});
