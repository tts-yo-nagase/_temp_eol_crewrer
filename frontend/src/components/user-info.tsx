"use client"

import { useSession } from "next-auth/react"

export function NavUserInfo() {
  const { data: session, status } = useSession()
  return (
    <>
      <span className="text-sm px-4">
        ユーザ名：
        {status === "loading" ? (
          <div className="inline-block">
            <div className="w-24 h-4 bg-gray-200 rounded" />
          </div>
        ) : (
          session?.user?.name
        )}
      </span>
    </>
  )
}
