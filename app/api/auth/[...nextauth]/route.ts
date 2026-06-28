import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user || !user.password) {
          throw new Error("User not found");
        }
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }
        
        return { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          applyCount: user.applyCount 
        };
      }
    })
  ],
  session: { 
    strategy: "jwt" 
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.applyCount = user.applyCount;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.applyCount = token.applyCount as number;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { 
    signIn: "/login",
    newUser: "/signup",     // ✅ SAHI
  },
  debug: false,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };