"use server";

import { generateRIB } from "@/lib/bank-account";
import { db } from "@/lib/db";
import { createUserSchema, UpdateUserSchema } from "@/lib/definitions";
import { generatePassword } from "@/lib/helpers";
import { sendNewUserEmail } from "@/lib/mail";
import { Currency } from "@prisma/client";
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

// Génère un nmbre alléatoire possédant 10 chiffres
function generateRandomNumber(): string {
  return Math.floor(10000000 + Math.random() * 99999999).toString();
}

async function returnUniqueRandomNumber() {
  let isUnique = false;
  let merchantCode = "";

  while (!isUnique) {
    merchantCode = generateRandomNumber();

    // Vérifie si le numéro existe déjà dans la base de données
    const existingNumber = await db.bankAccount.findUnique({
      where: { merchantCode },
    });

    if (!existingNumber) {
      isUnique = true;
    }
  }
  return merchantCode;
}

export async function updateUser(data: z.infer<typeof UpdateUserSchema>) {
  try {
    const validatedData = UpdateUserSchema.safeParse(data);

    if (!validatedData.success) {
      return { error: "Les données ne sont pas valides !" };
    }

    const user = await db.user.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    //trouver les comptes de commerce s'il en a
    const commerceAccounts = await db.bankAccount.findMany({
      where: {
        userId: user.id,
        type: "business",
        merchantCode: {
          not: null,
        },
      },
    });

    if (data.role === "COMMERCIAL") {
      if (commerceAccounts.length > 0) {
        // Mettre a jour le statut de ses comptes
        await db.bankAccount.updateMany({
          where: {
            userId: user.id,
            type: "business",
            merchantCode: {
              not: null,
            },
          },
          data: {
            status: "ACTIVE",
          },
        });
      } else {
        // Créer son compte de dépot/retrait et de commission
        await db.bankAccount.createMany({
          data: [
            {
              name: "compte dépot/retrait",
              type: "business",
              currency: user.currency as Currency,
              merchantCode: await returnUniqueRandomNumber(),
              userId: user.id,
              rib: generateRIB("business", user.id),
              amount: 0,
            },
            {
              name: "compte de commissions",
              type: "business",
              currency: user.currency as Currency,
              merchantCode: await returnUniqueRandomNumber(),
              userId: user.id,
              rib: generateRIB("business", user.id),
              amount: 0,
            },
          ],
        });
      }
    } else {
      if (commerceAccounts.length > 0) {
        // Bloquer ses comptes commerciaux s'il en a
        await db.bankAccount.updateMany({
          where: {
            userId: user.id,
            type: "business",
            merchantCode: {
              not: null,
            },
          },
          data: {
            status: "LOCKED",
          },
        });
      }
    }

    await db.user.update({
      where: { id: user.id },
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
