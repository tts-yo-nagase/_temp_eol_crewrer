"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" })
  }

  return (
    <div>
      <Button
        onClick={handleLogout}
        className="w-full"
      >
        Logout
      </Button>
    </div>
  )
} 