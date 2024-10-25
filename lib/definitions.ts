import * as z from "zod";

export const SignInSchema = z.object({
  email: z.string().email({
    message: "Entrez une adrese mail valide",
  }),
  password: z.string().min(1, {
    message: "Le mot de passe est requis",
  }),
});

export const SignInWithNumberSchema = z.object({
  phone: z.string().min(6, {
    message: "Le numéro de téléphone est requis",
  }),
  password: z.string().min(1, {
    message: "Le mot de passe est requis",
  }),
});

export const SignUpSchema = z
  .object({
    email: z.string().email({
      message: "Entrez une adrese mail valide",
    }),
    phone: z.string().min(6, {
      message: "Le numéro de téléphone est requis",
    }),
    password: z.string().min(8, {
      message: "Le mot de passe doit avoir au moins 8 caractères",
    }),
    name: z.string().min(1, {
      message: "Le nom est requis",
    }),
    termsAge: z
      .boolean()
      .refine((value) => value === true, "Voud devez avoir plus de 18 ans"),
    termsLaw: z
      .boolean()
      .refine(
        (value) => value === true,
        "Voud devez accepter de vous conformer aux lois de votre pays"
      ),
    termsActions: z
      .boolean()
      .refine(
        (value) => value === true,
        "Voud devez accepter la responsabilité de vos opérations"
      ),
    termsViolation: z
      .boolean()
      .refine(
        (value) => value === true,
        "Voud devez accepter les conditions d'utilisation de votre compte"
      ),
    terms: z
      .boolean()
      .refine(
        (value) => value === true,
        "Voud devez accepter nos conditions d'utilisation"
      ),
  })
  .superRefine(({ password }, checkPassComplexity) => {
    const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
    const containsLowercase = (ch: string) => /[a-z]/.test(ch);
    const containsSpecialChar = (ch: string) =>
      /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
    let countOfUpperCase = 0,
      countOfLowerCase = 0,
      countOfNumbers = 0,
      countOfSpecialChar = 0;

    for (let i = 0; i < password.length; i++) {
      const ch = password.charAt(i);
      if (!isNaN(+ch)) countOfNumbers++;
      else if (containsUppercase(ch)) countOfUpperCase++;
      else if (containsLowercase(ch)) countOfLowerCase++;
      else if (containsSpecialChar(ch)) countOfSpecialChar++;
    }

    let errObj = {
      upperCase: { pass: true, message: "Au moins une lettre majuscule" },
      lowerCase: { pass: true, message: "Ajouter des lettres minuscules" },
      specialCh: { pass: true, message: "Au moins un caractère spécial" },
      totalNumber: { pass: true, message: "Minimum 8 caactères au total" },
    };

    if (countOfLowerCase < 1) {
      errObj = { ...errObj, lowerCase: { ...errObj.lowerCase, pass: false } };
    }
    if (countOfNumbers < 1) {
      errObj = {
        ...errObj,
        totalNumber: { ...errObj.totalNumber, pass: false },
      };
    }
    if (countOfUpperCase < 1) {
      errObj = { ...errObj, upperCase: { ...errObj.upperCase, pass: false } };
    }
    if (countOfSpecialChar < 1) {
      errObj = { ...errObj, specialCh: { ...errObj.specialCh, pass: false } };
    }

    if (
      countOfLowerCase < 1 ||
      countOfUpperCase < 1 ||
      countOfSpecialChar < 1 ||
      countOfNumbers < 1
    ) {
      checkPassComplexity.addIssue({
        code: "custom",
        path: ["password"],
        message: JSON.stringify(errObj),
      });
    }
  });
