import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import type { NextAuthConfig } from 'next-auth'

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Email & Password',
      id: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        // Check if email exists
        if (!user) {
          return null
        }

        // Check if user has password (for accounts created via other methods)
        if (!user.password) {
          return null
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password as string, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as string,
        } as any
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role || 'USER'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).role = (token.role as string) || 'USER'
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Create NextAuth instance once and export both handlers and auth
const nextAuthInstance = NextAuth(authOptions)

export const auth = nextAuthInstance.auth
export const handlers = nextAuthInstance.handlers

