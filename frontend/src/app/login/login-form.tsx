"use client"
import { cn } from "@/lib/utils"
import SsoButtons from "./sso-buttons"
import logger from "@/lib/logger"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  logger.debug("login form called")

  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/main"

  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("admin123")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else if (result?.ok) {
        window.location.href = callbackUrl
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div>
        <h2 className="text-2xl font-semibold mb-1">Login</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Enter your credentials or use SSO to login
        </p>

        {/* Credentials Login Form */}
        <form onSubmit={handleCredentialsLogin} className="space-y-4 mb-6">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
      </div>

      {/* SSO Buttons */}
      <SsoButtons />
    </div>
  )
}
