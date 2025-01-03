import * as z from "zod";

import { UpdateInfoSchema } from "@/lib/definitions";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./ui/input-otp";

type PinInputProps = {
  form: UseFormReturn<z.infer<z.ZodTypeAny>>;
  label: string;
  name: keyof z.infer<typeof UpdateInfoSchema>;
};

const PinInput = ({ name, label, form }: PinInputProps) => {
  // Style CSS pour masquer les caractères
  const maskedStyle = {
    WebkitTextSecurity: "disc", // Safari et Chrome
    MozTextSecurity: "disc", // Firefox (non standard, alternative)
    textSecurity: "disc", // Autres navigateurs (support limité)
    fontSize: "18px",
    letterSpacing: "5px",
    color: "0d1117",
  };

  const { watch } = form;
  const passwordValue = watch(name);

  return (
    <FormField
      control={form.control}
      name={`${name}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <InputOTP
              className="w-full"
              minLength={4}
              maxLength={8}
              {...field}
              key={label}
            >
              <InputOTPGroup key={label}>
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
                      <InputOTPSeparator key={index} />
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
  );
};

export default PinInput;
