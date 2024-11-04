import { PrismaAdapter } from "@auth/prisma-adapter";
import { Country, UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";
import authConfig from "./auth.config";
import { getUserById } from "./data/user";
import { db } from "./lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      phone: string;
      country: Country;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      if (!user || !user.id) return false;

      const existingUser = await getUserById(user.id);

      // Prevent sign in without email verification
      if (!existingUser || !existingUser.emailVerified) return false;

      return true;
    },

    async session({ token, session }) {
      if (session.user && token.sub) session.user.id = token.sub;

      if (session.user && token.role)
        session.user.role = token.role as UserRole;

      if (session.user && token.phone)
        session.user.phone = token.phone as string;

      if (session.user && token.country)
        session.user.country = token.country as Country;

      return session;
    },

    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;
      const country = await db.country.findUnique({
        where: {
          id: existingUser.countryId,
        },
      });
      token.role = existingUser.role;
      token.phone = existingUser.phone;
      token.country = country;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
