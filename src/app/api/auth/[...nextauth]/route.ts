import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        try {
          // Query the database for the user
          const [rows]: any = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [credentials.email]
          );

          if (rows.length === 0) {
            throw new Error("No user found with this email");
          }

          const user = rows[0];

          // For now, compare plain text password
          // TODO: Update to use bcrypt when we hash the password
          const isValid = credentials.password === user.password;

          // Uncomment this when we hash passwords:
          // const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error("Invalid password");
          }

          // Return user object (don't include password)
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            studentId: user.student_id
          };
        } catch (error: any) {
          throw new Error(error.message || "Authentication failed");
        }
      }
    })
  ],
  pages: {
    signIn: "/", // Redirect to home page (login page) for sign in
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.studentId = (user as any).studentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).studentId = token.studentId;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
