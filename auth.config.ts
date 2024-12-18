import { getUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { SignInSchema } from "./lib/definitions";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = SignInSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await getUserByEmail(email);

          if (!user || !user.password) return null;

          const passwordMatched = await bcrypt.compare(password, user.password);

          if (passwordMatched) return user;
        }
        return null;
      },
    }),
  ],
  secret: process.env.NEXT_AUTH_SECRET,
} satisfies NextAuthConfig;
