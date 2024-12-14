"use client";

import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createUserSchema } from "@/lib/definitions";
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
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import "react-international-phone/style.css";

import { ComboboxCountryInput } from "@/components/ui/combobox";
import {
  getCountriesOptions,
  isoToEmoji,
  replaceNumbersWithZeros,
} from "@/lib/helpers";
import { Country } from "react-phone-number-input";
import PhoneInput from "react-phone-number-input/input";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createUserAction } from "../actions";

type CountryOption = {
  value: Country;
  label: string;
  indicatif: CountryCallingCode;
};

i18nIsoCountries.registerLocale(enCountries);

export function CreateUserDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);

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

  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      country: country.label,
      countryCode: country.value,
      phone: "",
      role: "USER",
    },
  });

  const { setValue } = form;

  const onCountryChange = (value: CountryOption) => {
    setPhoneNumber(undefined);
    setCountry(value);
    setValue("country", value.label);
    setValue("countryCode", value.value);
  };

  const onSubmit = (formData: z.infer<typeof createUserSchema>) => {
    startTransition(() => {
      createUserAction(formData).then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          setOpen(false);
          onSuccess();
        }
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nouvel utilisateur</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de compte</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type de compte..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USER">Utilisateur</SelectItem>
                        <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Création
                  </>
                ) : (
                  "Créer l'utilisateur"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
