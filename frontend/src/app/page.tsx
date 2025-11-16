'use client'

import Link from "next/link"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchWithAuth, fetchWithoutAuth } from "@/lib/auth-utils"

interface ProtectedApiResponse {
  message: string
  user?: {
    userId?: string
    name?: string | null
    email?: string | null
    roles?: string[]
    company?: string
    customField?: string
  }
}

interface PublicApiResponse {
  message: string
  timestamp: string
  serverInfo: string
}

export default function Home() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ProtectedApiResponse | null>(null)
  const [publicResponse, setPublicResponse] = useState<PublicApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const accessPublicEndpoint = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    setPublicResponse(null)

    try {
      const res = await fetchWithoutAuth('/protected-public', {
        method: 'GET',
      })

      setPublicResponse(res as PublicApiResponse)
    } catch (err) {
      console.error('Request error:', err)
      setError('Network error occurred - Please make sure the NestJS server is running')
    } finally {
      setLoading(false)
    }
  }

  const accessProtectedEndpoint = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    setPublicResponse(null)

    try {
      const res = await fetchWithAuth('/protected', {
        method: 'GET',
      })

      setResponse(res as ProtectedApiResponse)
    } catch (err) {
      console.error('Request error:', err)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-svh w-full items-center justify-center gap-6 p-6 md:p-10">
      {/* --- Landing Page Overview --- */}
      <div className="w-full max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">App Template</h1>
        <p className="text-lg text-muted-foreground mb-4">
          A modern full-stack application template built with <b>Next.js</b> (frontend) and <b>NestJS</b> (backend), featuring authentication, role-based access, API, and a beautiful UI.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Link href="/login"><Button>Login</Button></Link>
          <Link href="/main"><Button variant="secondary">Dashboard</Button></Link>
          <a href={`${process.env.NEXT_PUBLIC_API_URL || 'https://temp-eol-crewrer-backend.vercel.app'}/api-docs`} target="_blank" rel="noopener noreferrer"><Button variant="outline">API Docs</Button></a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mt-6">
          <div>
            <h2 className="font-semibold mb-1">Key Features</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              <li>Monorepo with Next.js 16 + NestJS 11</li>
              <li>Authentication (NextAuth.js, JWT, OAuth)</li>
              <li>Role-based access control</li>
              <li>Prisma + PostgreSQL</li>
              <li>API documentation (OpenAPI/Swagger)</li>
              <li>Storybook, Jest, Tailwind CSS</li>
              <li>Database management with Docker</li>
              <li>Beautiful UI and dashboards</li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold mb-1">Tech Stack</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              <li>Next.js, React, TypeScript, Tailwind CSS</li>
              <li>NestJS, Prisma, PostgreSQL</li>
              <li>NextAuth.js, JWT, Passport</li>
              <li>Radix UI, Tremor, Recharts</li>
              <li>Zustand, Consola, Storybook</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 text-xs text-muted-foreground">
          <p>Quick Start: <b>pnpm install</b> → <b>docker compose up -d</b> → <b>pnpm dev</b></p>
          <p>API Docs: <a href={`${process.env.NEXT_PUBLIC_API_URL || 'https://temp-eol-crewrer-backend.vercel.app'}/api-docs`} className="underline" target="_blank" rel="noopener noreferrer">{process.env.NEXT_PUBLIC_API_URL || 'https://temp-eol-crewrer-backend.vercel.app'}/api-docs</a></p>
        </div>
      </div>

      {/* --- Existing Demo/Test Section --- */}
      <div className="text-center mb-4">
        {session ? (
          <div className="text-sm text-green-600">
            ✅ Logged in: {session.user?.name || session.user?.email}
          </div>
        ) : (
          <div className="text-sm text-red-600">
            ❌ Not logged in
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-md">
        <Link href="/login">
          <Button className="w-full">Go to Login Page</Button>
        </Link>

        <Button
          onClick={accessPublicEndpoint}
          disabled={loading}
          variant="secondary"
          className="w-full"
        >
          {loading ? 'Loading...' : 'Test NestJS Public API'}
        </Button>

        <Button
          onClick={accessProtectedEndpoint}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? 'Loading...' : 'Access NestJS Protected API'}
        </Button>
      </div>

      {error && (
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Please make sure the NestJS server is running (localhost:3010)
            </p>
          </CardContent>
        </Card>
      )}

      {publicResponse && (
        <Card className="w-full max-w-md border-green-500">
          <CardHeader>
            <CardTitle className="text-green-600">Public API Response</CardTitle>
            <CardDescription>Response from NestJS public endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm"><strong>Message:</strong> {publicResponse.message}</p>
              <p className="text-sm"><strong>Timestamp:</strong> {publicResponse.timestamp}</p>
              <p className="text-sm"><strong>Server Info:</strong> {publicResponse.serverInfo}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">Protected API Response</CardTitle>
            <CardDescription>Response from NestJS Protected API</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm"><strong>Message:</strong> {response.message}</p>
              {response.user && (
                <div className="text-sm">
                  <strong>User Info:</strong>
                  <ul className="ml-4 mt-1">
                    <li>ID: {response.user.userId || 'N/A'}</li>
                    <li>Name: {response.user.name || 'N/A'}</li>
                    <li>Email: {response.user.email || 'N/A'}</li>
                    <li>Roles: {response.user.roles ? response.user.roles.join(', ') : 'N/A'}</li>
                    <li>Company: {response.user.company || 'N/A'}</li>
                    <li>Custom: {response.user.customField || 'N/A'}</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
