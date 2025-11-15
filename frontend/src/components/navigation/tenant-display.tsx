'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { apiClient, Tenant } from '@/lib/api-client'
import { Badge } from '@/components/ui/badge'

export function TenantDisplay() {
  const { data: session } = useSession()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTenant() {
      if (!session?.user?.tenantId) {
        setLoading(false)
        return
      }

      try {
        const tenantData = await apiClient.getTenant(session.user.tenantId)
        setTenant(tenantData)
      } catch (error) {
        console.error('Failed to fetch tenant:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenant()
  }, [session?.user?.tenantId])

  if (loading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Loading...
      </Badge>
    )
  }

  if (!tenant) {
    return null
  }

  return (
    <Badge variant="secondary" className="font-normal whitespace-nowrap">
      {tenant.name}
    </Badge>
  )
}
