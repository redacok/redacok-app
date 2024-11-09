"use client";

import * as z from "zod";

import useNumberSignin from "@/store/sign-in-form-store";
import { zodResolver } from "@hookform/resolvers/zod";
import i18nIsoCountries from "i18n-iso-countries";
import enCountries from "i18n-iso-countries/langs/en.json";
import {
  type CountryCallingCode,
  type E164Number,
  getExampleNumber,
  parsePhoneNumber,
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import { LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import "react-international-phone/style.css";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { CardWrapper } from "./card-wrapper";

import { ForgotPasswordAction } from "@/app/(auth)/forgot-password/actions";
import { ComboboxCountryInput } from "@/components/ui/combobox";
import { ForgotPasswordSchema } from "@/lib/definitions";
import {
  getCountriesOptions,
  isoToEmoji,
  replaceNumbersWithZeros,
} from "@/lib/helpers";
import { Country } from "react-phone-number-input";
import PhoneInput from "react-phone-number-input/input";

type CountryOption = {
  value: Country;
  label: string;
  indicatif: CountryCallingCode;
};

i18nIsoCountries.registerLocale(enCountries);

export const ForgotPasswordPhoneForm = () => {
  const options = getCountriesOptions();

  // You can use a the country of the phone number to set the default country
  const defaultCountry = parsePhoneNumber("+237651117119")?.country;
  const defaultCountryOption = options.find(
    (option) => option.value === defaultCountry
  );

  const [country, setCountry] = useState<CountryOption>(
    defaultCountryOption || options[0]!
  );
  const [phoneNumber, setPhoneNumber] = useState<E164Number>();

  const placeholder = replaceNumbersWithZeros(
    getExampleNumber(country.value, examples)!.formatInternational()
  );

  const onCountryChange = (value: CountryOption) => {
    setPhoneNumber(undefined);
    setCountry(value);
  };

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const { setIsNumberSignin } = useNumberSignin();

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = (formData: z.infer<typeof ForgotPasswordSchema>) => {
    startTransition(() => {
      ForgotPasswordAction(formData).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
        // TODO: Add when we add 2FA
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Mot de passe oublié"
      BackButtonLabel="Retour a la page de connexion"
      backButtonHref="/sign-in"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex w-full">
              <Button
                size={"sm"}
                variant="link"
                onClick={() => setIsNumberSignin()}
                className="ml-auto"
              >
                Utiliser mon email
              </Button>
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de téléphone</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <ComboboxCountryInput
                        value={country}
                        onValueChange={onCountryChange}
                        options={options}
                        placeholder="Chercher votre pays..."
                        renderOption={({ option }) =>
                          `${isoToEmoji(option.value)} ${option.label}`
                        }
                        renderValue={(option) => option.label}
                        emptyMessage="Aucun pays trouvé."
                      />
                      <PhoneInput
                        {...field}
                        international
                        withCountryCallingCode
                        country={country.value.toUpperCase() as Country}
                        value={phoneNumber}
                        inputComponent={Input}
                        placeholder={placeholder}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full gap-x-2" disabled={isPending}>
            {isPending && <LoaderCircle className="size-5 animate-spin" />}
            Connexion
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

// export const ForgotPasswordPhoneForm = () => {
//   return (
//     <Suspense>
//       <ForgotPasswordPhone />
//     </Suspense>
//   );
// };
