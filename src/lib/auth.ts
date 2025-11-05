import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email & Password',
      id: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('EMAIL_AND_PASSWORD_REQUIRED')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        // Check if email exists
        if (!user) {
          throw new Error('EMAIL_NOT_FOUND')
        }

        // Check if user has password (for accounts created via other methods)
        if (!user.password) {
          throw new Error('EMAIL_NOT_FOUND')
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('INVALID_PASSWORD')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
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

