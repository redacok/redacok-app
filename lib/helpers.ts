import { Prisma, PrismaClient, Transaction } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import i18nIsoCountries from "i18n-iso-countries";
import {
  type CountryCallingCode,
  type CountryCode,
  getCountries,
  getCountryCallingCode,
} from "libphonenumber-js";

const Currencies = [
  { value: "EUR", label: "€ Euro", locale: "fr-FR" },
  { value: "XAF", label: "Franc CFA", locale: "fr-FR" },
  { value: "USD", label: "$ Dollar", locale: "en-EN" },
];

export function DateToUTCDate(date: Date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
}

export function formatDate(date: Date, locale: string = "en-us"): string {
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCurrency(
  amount: number,
  currency: string = "XAF"
): string {
  const formatter = getFormatterForCurrency(currency);
  return formatter.format(amount);
}

export function getFormatterForCurrency(currency: string) {
  const locale = Currencies.find((c) => c.value === currency)?.locale;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
}

/**
 * Source: https://grafikart.fr/tutoriels/drapeau-emoji-fonction-2152
 * @param code fr, en, de...
 * @returns the emoji flag (🇫🇷, 🇬🇧, 🇩🇪)
 */
export function isoToEmoji(code: string) {
  return code
    .split("")
    .map((letter) => (letter.charCodeAt(0) % 32) + 0x1f1e5)
    .map((emojiCode) => String.fromCodePoint(emojiCode))
    .join("");
}

/**
 * Get all countries options
 * @returns array of countries options
 *
 * @example
 * getCountriesOptions() // [{value: "DE", label: "Germany", indicatif: "+49"}, ...]
 */
export function getCountriesOptions() {
  const countries = getCountries();

  // Type inference is not working here
  const options = countries
    .map((country) => ({
      value: country,
      label: i18nIsoCountries.getName(country.toUpperCase(), "en", {
        select: "official",
      }),
      indicatif: `+${getCountryCallingCode(country)}`,
    }))
    .filter((option) => option.label) as {
    value: CountryCode;
    label: string;
    indicatif: CountryCallingCode;
  }[];

  return options;
}

/**
 *
 * @param phoneNumber international phone number
 * @returns phone number with digits replaced with zeros
 *
 * @example
 * replaceNumbersWithZeros("+1 123 456 7890") // +1 000 000 0000
 */
export function replaceNumbersWithZeros(phoneNumber: string): string {
  // Split the phone number into country code and the rest of the number
  const [countryCode, ...restOfNumber] = phoneNumber.split(/\s+/);

  // Replace digits in the rest of the number with zeros
  const replacedRestOfNumber = restOfNumber
    .map((num) => num.replace(/\d/g, "0"))
    .join(" ");

  // Concatenate the country code and the replaced number
  const replacedPhoneNumber =
    (countryCode as string) + " " + replacedRestOfNumber;

  return replacedPhoneNumber;
}

export function generatePassword(length = 8) {
  const charset = "0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

export async function editHistory(
  userId: string,
  bankAccountId: string,
  transaction: Transaction,
  amount: number,
  type: "income" | "expense",
  op: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >
) {
  await op.monthHistory.upsert({
    where: {
      day_month_year_userId_bankAccountId: {
        day: transaction.createdAt.getUTCDate(),
        month: transaction.createdAt.getUTCMonth(),
        year: transaction.createdAt.getUTCFullYear(),
        userId,
        bankAccountId,
      },
    },
    update: {
      ...(type === "income"
        ? { income: { increment: amount } }
        : { expense: { increment: amount } }),
    },
    create: {
      userId,
      day: transaction.createdAt.getUTCDate(),
      month: transaction.createdAt.getUTCMonth(),
      year: transaction.createdAt.getUTCFullYear(),
      bankAccountId,
      income: type === "income" ? amount : 0,
      expense: type === "expense" ? amount : 0,
    },
  });

  // Mettre à jour ou créer l'historique annuel
  await op.yearHistory.upsert({
    where: {
      month_year_userId_bankAccountId: {
        month: transaction.createdAt.getUTCMonth(),
        year: transaction.createdAt.getUTCFullYear(),
        userId,
        bankAccountId,
      },
    },
    update: {
      ...(type === "income"
        ? { income: { increment: amount } }
        : { expense: { increment: amount } }),
    },
    create: {
      userId,
      month: transaction.createdAt.getUTCMonth(),
      year: transaction.createdAt.getUTCFullYear(),
      bankAccountId,
      income: amount,
      expense: 0,
    },
  });
}
