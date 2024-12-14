"use server";

import { generatePassword } from "@/app/api/users/route";
import { db } from "@/lib/db";
import { createUserSchema, UpdateUserSchema } from "@/lib/definitions";
import { sendNewUserEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getUsers(search?: string) {
  try {
    const users = await db.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { users: users, error: null };
  } catch (error) {
    console.error("[USERS_GET]", error);
    return { users: [], error: "Failed to fetch users" };
  }
}

export async function updateUser(data: z.infer<typeof UpdateUserSchema>) {
  try {
    const validatedData = UpdateUserSchema.safeParse(data);

    if (!validatedData.success) {
      return { error: "Les données ne sont pas valides !" };
    }

    await db.user.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
      },
    });

    revalidatePath("/admin/dashboard/users");
    return { success: "User updated successfully" };
  } catch (error) {
    console.error("[USER_UPDATE]", error);
    if (error instanceof z.ZodError) {
      return { error: "Invalid data provided" };
    }
    return { error: "Failed to update user" };
  }
}

export async function toggleUserStatus(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return { error: "User not found" };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        role: user.role === "USER" ? "PERSONAL" : "USER",
      },
    });

    revalidatePath("/admin/dashboard/users");
    return { success: "User status updated successfully" };
  } catch (error) {
    console.error("[USER_TOGGLE_STATUS]", error);
    return { error: "Failed to update user status" };
  }
}

export async function createUserAction(
  formData: z.infer<typeof createUserSchema>
) {
  try {
    const validatedData = createUserSchema.safeParse(formData);

    if (!validatedData.success) {
      return { error: "Les données ne sont pas valides !" };
    }

    const { email, name, role, phone, country, countryCode } = formData;

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return { error: "Cette adresse mail est déjà utilisée !" };
    }

    const existingUserPhone = await db.user.findUnique({
      where: {
        phone,
      },
    });
    if (existingUserPhone) {
      return { error: "Ce numéro de téléphone est déjà utilisé !" };
    }

    let existCountry = await db.country.findUnique({
      where: {
        name_code: {
          name: country,
          code: countryCode,
        },
      },
    });

    if (!existCountry) {
      existCountry = await db.country.create({
        data: {
          name: country,
          code: countryCode,
        },
      });
    }

    await db.user.create({
      data: {
        name,
        email,
        phone,
        role: role,
        password: hashedPassword,
        countryId: existCountry.id,
      },
    });

    await sendNewUserEmail(name, email, plainPassword);

    return {
      success:
        "Utilisateur crée avec succès! un mail contenant ses informations de connexion lui a été envoyé",
    };
  } catch (err) {
    console.error("[CREATE_USER_ACTION]", err);
    return { error: "Une erreur innatendue s'est produite" };
  }
}
