import { signOut } from "next-auth/react"

export const useLogout = () => {
  return async () => {
    await signOut({ redirect: true, callbackUrl: "/login" })
  }
}