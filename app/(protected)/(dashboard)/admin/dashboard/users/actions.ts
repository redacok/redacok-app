"use server";

import { db } from "@/lib/db";
import { UpdateUserSchema } from "@/lib/definitions";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getUsers(search?: string) {
  try {
    const users = await db.user.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      } : undefined,
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

    return {users: users, error: null};
  } catch (error) {
    console.error("[USERS_GET]", error);
    return { users: [], error: "Failed to fetch users" };
  }
}

export async function updateUser(
  data: z.infer<typeof UpdateUserSchema>
) {
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
