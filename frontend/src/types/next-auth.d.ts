import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      roles?: string[]
      customField?: string
      company?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles?: string[]
    customField?: string
    company?: string
  }
} 