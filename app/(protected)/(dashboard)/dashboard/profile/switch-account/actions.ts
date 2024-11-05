import * as z from "zod";

import { switchToPersonalAccountSchema } from "@/lib/definitions";

export async function SwitchToPersonalAccountAction(
  formData: z.infer<typeof switchToPersonalAccountSchema>
) {
  const validationResult = switchToPersonalAccountSchema.safeParse(formData);

  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !" };
  }

  const { idType, idNumber, name, surname, expires } = formData;

  return { success: "" };
}
