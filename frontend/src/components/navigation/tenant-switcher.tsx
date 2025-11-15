'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { apiClient, UserTenant } from '@/lib/api-client'
import { clearTokenCache } from '@/lib/auth-utils'
import { Check, ChevronsUpDown, Building2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function TenantSwitcher() {
  const { data: session, update } = useSession()
  const [tenants, setTenants] = useState<UserTenant[]>([])
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    async function fetchTenants() {
      if (!session?.user?.id) {
        setLoading(false)
        return
      }

      try {
        const tenantsData = await apiClient.getUserTenants()
        setTenants(tenantsData)
      } catch (error) {
        console.error('Failed to fetch tenants:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenants()
  }, [session?.user?.id]) // Only re-fetch when user ID changes

  const currentTenant = tenants.find(t => t.isCurrentTenant)

  const handleSwitchTenant = async (tenantId: string) => {
    if (switching || tenantId === currentTenant?.id) return

    setSwitching(true)
    try {
      // Clear token cache before switching
      clearTokenCache()

      // Switch tenant on backend
      const updatedUser = await apiClient.switchTenant(tenantId)

      // Update session with new tenant and roles
      await update({
        ...session,
        user: {
          ...session?.user,
          tenantId: updatedUser.tenantId,
          roles: updatedUser.roles,
        }
      })

      // Clear token cache again after session update
      clearTokenCache()

      // Full page reload to avoid hydration errors and ensure all data is refreshed
      window.location.reload()
    } catch (error) {
      console.error('Failed to switch tenant:', error)
    } finally {
      setSwitching(false)
    }
  }

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className="w-[180px]">
        <Building2 className="mr-2 h-4 w-4" />
        <span>Loading...</span>
      </Button>
    )
  }

  // If user belongs to only one tenant, show it as a badge
  if (tenants.length <= 1) {
    return (
      <Button variant="outline" size="sm" disabled className="w-[180px]">
        <Building2 className="mr-2 h-4 w-4" />
        <span className="truncate">{currentTenant?.name || 'No Tenant'}</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-[180px] justify-between"
          disabled={switching}
        >
          <div className="flex items-center truncate">
            <Building2 className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{currentTenant?.name || 'Select Tenant'}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 flex-shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Switch Tenant</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => handleSwitchTenant(tenant.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="font-medium truncate">{tenant.name}</span>
                <span className="text-xs text-muted-foreground truncate">
                  Role: {tenant.role}
                </span>
              </div>
              {tenant.isCurrentTenant && (
                <Check className="ml-2 h-4 w-4 flex-shrink-0" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
