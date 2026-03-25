import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).trustScore = token.trustScore;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.trustScore = (user as any).trustScore;
      }

      // Handle profile updates if needed
      if (trigger === "update" && session) {
         token.id = session.user.id;
         token.role = session.user.role;
         token.trustScore = session.user.trustScore;
      }

      return token;
    },
  },
  events: {
    async createUser({ user }) {
      // Initialize new user with default data if Prisma adapter doesn't
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "USER",
          trustScore: 10, // Starting bonus
        },
      });
    },
  },
};
