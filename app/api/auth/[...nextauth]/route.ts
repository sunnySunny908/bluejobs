import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Allow any login
        return { 
          id: "1", 
          name: "Guest User", 
          email: credentials?.email || "guest@bluejobs.com",
          applyCount: 20
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
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.applyCount = token.applyCount as number;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "test-secret",
  pages: { 
    signIn: "/login",
    newUser: "/signup",
  },
  debug: false,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };