import GitHub from "next-auth/providers/github"
import AzureADB2C from "next-auth/providers/azure-ad-b2c"
import AzureAD from "next-auth/providers/azure-ad"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { SignJWT, jwtVerify } from 'jose'

import type { NextAuthConfig } from "next-auth"
import { JWT } from "next-auth/jwt"
import { apiClient } from './api-client'

const enc = new TextEncoder()

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      roles?: string[]
      tenantId?: string
    }
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    roles?: string[]
    tenantId?: string
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await apiClient.validateUser({
          email: credentials.email as string,
          password: credentials.password as string,
        })

        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          roles: user.roles,
          tenantId: user.tenantId,
        }
      }
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    AzureADB2C({
      clientId: process.env.AZURE_AD_B2C_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET!,
      issuer: `https://${process.env.AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_AD_B2C_TENANT_ID}/${process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW}/v2.0`,
      authorization: { params: { scope: "offline_access openid" } },
    }),
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    // Issue signed JWS (HS256)
    async encode({ token, secret, maxAge }) {
      // console.log("🔑encode", token, secret, maxAge)
      const secretString = typeof secret === 'string' ? secret : secret?.toString() || ''
      const jwt = await new SignJWT(token)
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setExpirationTime(`${maxAge}s`)
        .sign(enc.encode(secretString))
      return jwt.toString()
    },
    // Verify with the same key as NestJS
    async decode({ token, secret }) {
      if (!token) return null
      try {
        const secretString = typeof secret === 'string' ? secret : secret?.toString() || ''
        const { payload } = await jwtVerify(token, enc.encode(secretString))
        return payload as JWT
      } catch {
        return null
      }
    },
  },
  callbacks: {
    async signIn() {
      // User info will be saved/updated in jwt callback
      return true
    },

    async jwt({ token, user, trigger, session }): Promise<JWT> {
      if (user) {
        token.id = user.id

        // For credentials provider, user object already contains roles and tenantId
        if (user.roles && user.tenantId) {
          token.roles = user.roles
          token.tenantId = user.tenantId
        } else if (user.email) {
          // For OAuth providers, fetch user info from database
          const dbUser = await apiClient.upsertUser({
            email: user.email,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          })

          if (!dbUser.tenantId) {
            throw new Error('Failed to retrieve tenant information for user')
          }

          token.roles = dbUser.roles
          token.tenantId = dbUser.tenantId
        } else {
          // Authentication error: tenantId is required
          throw new Error('Failed to retrieve tenant information')
        }
      }

      // Handle session updates (when session.update() is called, e.g., tenant switching)
      if (trigger === "update" && session) {
        if (session.user?.tenantId) {
          token.tenantId = session.user.tenantId
        }
        if (session.user?.roles) {
          token.roles = session.user.roles
        }
      }

      return {
        ...token,
      }
    },
    async session({ session, token }) {
      // console.log("🔑session", session)
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          roles: token.roles as string[],
          tenantId: token.tenantId as string,
        },
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
  },
} 