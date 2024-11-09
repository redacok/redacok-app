"use client";

import * as z from "zod";

import { signUpAction } from "@/app/(auth)/sign-up/actions";
import { SignUpSchema } from "@/lib/definitions";
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
import { Checkbox } from "../ui/checkbox";
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

import { ComboboxCountryInput } from "@/components/ui/combobox";
import {
  getCountriesOptions,
  isoToEmoji,
  replaceNumbersWithZeros,
} from "@/lib/helpers";
import { Country } from "react-phone-number-input";
import PhoneInput from "react-phone-number-input/input";

import PinInput from "../pin-input";

type CountryOption = {
  value: Country;
  label: string;
  indicatif: CountryCallingCode;
};

i18nIsoCountries.registerLocale(enCountries);

export const SignUpForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

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

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      country: "",
      countryCode: "",
      phone: "",
      terms: false,
      termsAge: false,
      termsActions: false,
      termsLaw: false,
      termsViolation: false,
      fraud: false,
    },
  });

  const { setValue } = form;

  const onCountryChange = (value: CountryOption) => {
    setPhoneNumber(undefined);
    setCountry(value);
    setValue("country", value.label);
    setValue("countryCode", value.value);
  };

  const onSubmit = (formData: z.infer<typeof SignUpSchema>) => {
    startTransition(() => {
      signUpAction(formData).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Créer mon compte 🔐"
      BackButtonLabel="Vous avez déjà un compte ?"
      backButtonHref="/sign-in"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="space-y-4 w-full md:w-1/2">
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
                        disabled={isPending}
                        placeholder="Ex: Bellandry@gmail.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <PinInput
                form={form}
                label="Code PIN (4 à 8 chiffres)"
                name="password"
              />
            </div>
            <div className="space-y-4 w-full md:w-1/2">
              <FormField
                control={form.control}
                name="termsAge"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="ml-2">
                      Je confirme avoir plus de 18 ans
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termsLaw"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="ml-2">
                      J&apos;accepte me conformer aux lois d&apos;internet dans
                      mon pays
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termsActions"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="ml-2">
                      J&apos;accepte que toutes actions menées dans mon compte
                      n&apos;engage que moi.
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="ml-2">
                      J&apos;accepte respecter les conditions de compte de prêt
                      et le compte d&apos;épargne.{" "}
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fraud"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="ml-2">
                      En cas de violation de ces règles j&apos;accepte toutes
                      poursuite judiciaire à travers mes informations sur la
                      plateforme ou récupérer ailleurs.
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termsViolation"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="ml-2">
                      Je certifie qu&apos;aucune de mes activité sur ce compte
                      n&apos;est en lien ni de près ni de loin à du blanchiment
                      d&apos;argent
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full gap-x-2" disabled={isPending}>
            {isPending && <LoaderCircle className="size-5 animate-spin" />}
            Créer mon compte
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
