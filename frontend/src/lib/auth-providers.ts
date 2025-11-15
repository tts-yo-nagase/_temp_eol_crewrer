"use server"

import { signIn } from "next-auth/react"

export const githubLogin = async (callbackUrl?: string) => {
  await signIn("github", {
    callbackUrl: callbackUrl
  })
}

export const azureAdLogin = async (callbackUrl?: string) => {
  await signIn("azure-ad", {
    callbackUrl: callbackUrl
  })
}

export const azureAdB2cLogin = async (callbackUrl?: string) => {
  await signIn("azure-ad-b2c", {
    callbackUrl: callbackUrl
  })
}

export const googleLogin = async (callbackUrl?: string) => {
  await signIn("google", {
    callbackUrl: callbackUrl
  })
}

export const logout = async () => {
  window.location.href = `/api/auth/signout?callbackUrl=/login`
}



