'use client'

import { useSession } from "next-auth/react"

/**
 * show session data for debug
 * @returns 
 */
export function SessionDebug() {
  const { data: session } = useSession()

  return (
    <div>
      <h2>Session Data:</h2>
      <pre>
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  )
} 