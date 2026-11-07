import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          throw new Error('Admin authentication is not configured');
        }

        if (
          !credentials?.email ||
          !credentials.password ||
          credentials.email !== adminEmail ||
          credentials.password !== adminPassword
        ) {
          return null;
        }

        return {
          id: adminEmail,
          email: adminEmail,
          name: 'Admin',
          isAdmin: true,
        };
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin === true;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? '';
        session.user.isAdmin = token.isAdmin === true;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
