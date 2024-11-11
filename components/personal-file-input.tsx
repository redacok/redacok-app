import * as z from "zod";

import { personnalVerificationFileSchema } from "@/lib/definitions";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

type PersonalFileInputProps = {
  form: UseFormReturn<z.infer<z.ZodTypeAny>>;
  label: string;
  name: keyof z.infer<typeof personnalVerificationFileSchema>;
};

const PersonalFileInput = ({ name, label, form }: PersonalFileInputProps) => {
  return (
    <FormField
      control={form.control}
      name={`${name}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              onChange={(e) =>
                field.onChange(e.target.files ? e.target.files[0] : null)
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PersonalFileInput;
