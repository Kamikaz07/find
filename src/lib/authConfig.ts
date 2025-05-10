import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Missing credentials email");
        }

        const cookieStore = cookies();
        const supabase = await createClient(cookieStore);

        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single();

        if (error || !users) {
          throw new Error("Invalid credentials");
        }

        // Compare passwords using bcrypt
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          users.password
        );

        if (!passwordMatch) {
          throw new Error("Invalid credentials");
        }

        return { id: users.id, email: users.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
};

export const auth = NextAuth(authOptions);
