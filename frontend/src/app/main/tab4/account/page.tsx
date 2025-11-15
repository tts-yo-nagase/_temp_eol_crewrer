"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AccountPage() {
  const { data: session } = useSession()

  if (!session) {
    return <div>Loading...</div>
  }

  const userInfo = [
    { label: "Name", value: session.user.name },
    { label: "Email", value: session.user.email },
    { label: "Roles", value: session.user.roles?.join(", ") },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Account Information</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                <AvatarFallback className="text-lg">{getInitials(session.user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>User Profile</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your account information
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userInfo.map((item) => (
                <div key={item.label} className="flex flex-col space-y-1.5">
                  <dt className="text-sm font-medium text-muted-foreground">{item.label}</dt>
                  <dd className="text-base">{item.value || "Not set"}</dd>
                </div>
              ))}
              <div className="flex flex-col space-y-1.5">
                <dt className="text-sm font-medium text-muted-foreground">Session Expires</dt>
                <dd className="text-base">{formatDate(session.expires)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}