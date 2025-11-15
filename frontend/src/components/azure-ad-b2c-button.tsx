"use client"

import { Button } from "@/components/ui/button"
import { githubLogin } from "@/lib/auth-providers"

export function GithubLoginButton() {
  return (
    <div>
      <Button
        onClick={() => githubLogin()}
        className="w-full"
      >
        Login with Github
      </Button>
    </div>
  )
} 