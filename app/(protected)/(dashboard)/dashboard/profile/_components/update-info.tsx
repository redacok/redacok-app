"use client";

import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UpdateInfoSchema } from "@/lib/definitions";
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

import { ComboboxCountryInput } from "@/components/ui/combobox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  getCountriesOptions,
  isoToEmoji,
  replaceNumbersWithZeros,
} from "@/lib/helpers";
import { Country as CountryInfo } from "@prisma/client";
import { User } from "next-auth";
import { Country } from "react-phone-number-input";
import PhoneInput from "react-phone-number-input/input";
import { toast } from "sonner";
import { updateInfoAction } from "../actions";

type CountryOption = {
  value: Country;
  label: string;
  indicatif: CountryCallingCode;
};

i18nIsoCountries.registerLocale(enCountries);

export const UpdateInfo = ({
  session,
}: {
  session: { role: string; phone: string; country: CountryInfo } & User;
}) => {
  const [isPending, startTransition] = useTransition();

  const options = getCountriesOptions();

  // You can use a the country of the phone number to set the default country
  const defaultCountry = parsePhoneNumber(session.phone)?.country;
  const defaultCountryOption = options.find(
    (option) => option.value === defaultCountry
  );

  const [country, setCountry] = useState<CountryOption>(
    defaultCountryOption || options[0]!
  );
  const [phoneNumber, setPhoneNumber] = useState<E164Number | undefined>(
    session.phone as E164Number
  );

  const placeholder = replaceNumbersWithZeros(
    getExampleNumber(country.value, examples)!.formatInternational()
  );

  const form = useForm<z.infer<typeof UpdateInfoSchema>>({
    resolver: zodResolver(UpdateInfoSchema),
    defaultValues: {
      id: session.id,
      name: session.name!,
      email: session.email!,
      password: "",
      country: session.country.name,
      countryCode: session.country.code,
      phone: session.phone,
    },
  });

  const { setValue, watch } = form;
  const passwordValue = watch("password");

  const onCountryChange = (value: CountryOption) => {
    setPhoneNumber(undefined);
    setCountry(value);
    setValue("country", value.label);
    setValue("countryCode", value.value);
  };

  const onSubmit = (formData: z.infer<typeof UpdateInfoSchema>) => {
    startTransition(() => {
      updateInfoAction(formData).then((data) => {
        if (data.success) toast.success(data.success);
        if (data.error) toast.error(data.error);
      });
    });
  };

  // Style CSS pour masquer les caractères
  const maskedStyle = {
    WebkitTextSecurity: "disc", // Safari et Chrome
    MozTextSecurity: "disc", // Firefox (non standard, alternative)
    textSecurity: "disc", // Autres navigateurs (support limité)
    fontSize: "18px",
    letterSpacing: "5px",
    color: "0d1117",
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Votre nom</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="Ex: John Doe"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
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
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={true}
                    placeholder="Ex: Bellandry@gmail.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code PIN (4 à 8 chiffres)</FormLabel>
                <FormControl>
                  <InputOTP
                    type="password"
                    className="w-full"
                    maxLength={8}
                    {...field}
                  >
                    <InputOTPGroup>
                      {[...Array(8)].map((_, index) => (
                        <>
                          <InputOTPSlot
                            key={index}
                            index={index}
                            style={{
                              ...maskedStyle,
                              display:
                                index < passwordValue.length + 1 &&
                                passwordValue.length <= 8
                                  ? "flex"
                                  : "none",
                            }}
                          />
                          {index < 7 && (index + 1) % 2 == 0 && (
                            <InputOTPSeparator />
                          )}
                        </>
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full gap-x-2" disabled={isPending}>
          {isPending && <LoaderCircle className="size-5 animate-spin" />}
          Modifier mes infos
        </Button>
      </form>
    </Form>
  );
};
