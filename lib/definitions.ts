import { Currencies, MAX_DATE_RANGE_DAYS } from "@/constants";
import { differenceInDays } from "date-fns";
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

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .email({
      message: "Entrez une adrese mail valide",
    })
    .optional(),
  phone: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 6, {
      message: "Le numéro de téléphone n'est pas valide",
    }),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, {
    message: "Action non autorisée",
  }),
  password: z.string().min(4, {
    message: "Le code PIN doit avoir au moins 4 chiffres",
  }),
});

export const createUserSchema = z.object({
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
  role: z.enum(["ADMIN", "COMMERCIAL", "USER"]),
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

export const personnalVerificationSchema = z.object({
  id: z.string().optional(),
  idType: z.string().min(1, {
    message: "Vous devez sélectionner le type de pièces",
  }),
  idNumber: z.string().min(7, {
    message: "Vous devez sélectionner le type de pièces",
  }),
  name: z.string().min(1, {
    message: "Vous devez renseigner votre nom de famille",
  }),
  surname: z.string().min(1, {
    message: "Vous devez renseigner votre prénom",
  }),
  idExpires: z.string().min(8, {
    message: "Vous devez sélectionner une date",
  }),
});

export const businessVerificationSchema = z.object({
  kycId: z.string().optional(),
  orgId: z.string().optional(),
  name: z.string().min(1, {
    message: "Vous devez renseigner votre nom de famille",
  }),
  surname: z.string().min(1, {
    message: "Vous devez renseigner votre prénom",
  }),
  orgName: z.string().min(1, {
    message: "Vous devez renseigner votre prénom",
  }),
  type: z.string().min(1, {
    message: "Vous devez renseigner votre prénom",
  }),
});

export const businessVerificationFileSchema = z.object({
  organisationDocument: z
    .instanceof(File)
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      {
        message: "Format de fichier non supporté",
      }
    )
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Le fichier doit être inférieur à 5 Mo",
    }),
  investorDocument: z
    .instanceof(File)
    .optional()
    .refine((file) => file && ["application/pdf"].includes(file.type), {
      message: "Format de fichier non supporté",
    })
    .refine((file) => file && file.size <= 5 * 1024 * 1024, {
      message: "Le fichier doit être inférieur à 5 Mo",
    }),
  founderDocument: z
    .instanceof(File)
    .optional()
    .refine((file) => file && ["application/pdf"].includes(file.type), {
      message: "Format de fichier non supporté",
    })
    .refine((file) => file && file.size <= 5 * 1024 * 1024, {
      message: "Le fichier doit être inférieur à 5 Mo",
    }),
});

export const uploadFileSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  kycId: z.string().min(1),
  fileUrl: z.string().min(1),
  field: z.string().min(1),
});

export const uploadBusinessFileSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  kycId: z.string().min(1),
  organisationId: z.string().min(1),
  fileUrl: z.string().min(1),
  field: z.string().min(1),
});

export const personnalVerificationFileSchema = z.object({
  niu: z
    .instanceof(File)
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      {
        message: "Format de fichier non supporté",
      }
    )
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Le fichier doit être inférieur à 5 Mo",
    }),
  idPicture: z
    .instanceof(File)
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      {
        message: "Format de fichier non supporté",
      }
    )
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Le fichier doit être inférieur à 5 Mo",
    }),
  idOnHand: z
    .instanceof(File)
    .refine((file) => ["image/jpeg", "image/png"].includes(file.type), {
      message: "Format de fichier non supporté",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Le fichier doit être inférieur à 5 Mo",
    }),
  entirePhoto: z
    .instanceof(File)
    .refine((file) => ["image/jpeg", "image/png"].includes(file.type), {
      message: "Format de fichier non supporté",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Le fichier doit être inférieur à 5 Mo",
    }),
  locationPlan: z
    .instanceof(File)
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf", "video/mp4"].includes(
          file.type
        ),
      {
        message: "Format de fichier non supporté",
      }
    )
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Le fichier doit être inférieur à 5 Mo",
    }),
});

export const OverviewQuerySchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .refine((args) => {
    const { from, to } = args;
    const days = differenceInDays(to, from);

    const isValidRange = days >= 0 && days <= MAX_DATE_RANGE_DAYS;

    return isValidRange;
  });

export const UpdateUserSchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.enum(["ADMIN", "COMMERCIAL", "BUSINESS", "PERSONAL", "USER"]),
  active: z.boolean().optional(),
});

export const transactionTreatmentSchema = z.object({
  decision: z.enum(["PENDING", "COMPLETED", "REJECTED", "CANCELLED"]),
  rejectionReason: z.string().optional(),
  id: z.string(),
});
