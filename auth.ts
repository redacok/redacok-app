import NextAuth from "next-auth";
import Google from "next-auth/providers/google"; // Ajout de GoogleProfile

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [
    Google({
      // Ajout des options nécessaires ici
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
});
