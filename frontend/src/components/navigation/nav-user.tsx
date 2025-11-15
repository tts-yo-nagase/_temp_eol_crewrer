import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useLogout } from "@/hooks/use-logout"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { apiClient, Tenant } from "@/lib/api-client"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const router = useRouter();
  const { data: session } = useSession()
  const [tenant, setTenant] = useState<Tenant | null>(null)

  useEffect(() => {
    async function fetchTenant() {
      if (!session?.user?.tenantId) {
        return
      }

      try {
        const tenantData = await apiClient.getTenant(session.user.tenantId)
        setTenant(tenantData)
      } catch (error) {
        console.error('Failed to fetch tenant:', error)
      }
    }

    fetchTenant()
  }, [session?.user?.tenantId])

  const handleAccount = () => {
    router.push("/main/account");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full rounded-md outline-none ring-ring hover:bg-accent focus-visible:ring-2 data-[state=open]:bg-accent">
        <div className="flex items-center gap-2 pl-1 pr-0 py-1.5 text-left text-sm transition-all">
          <Avatar className="h-7 w-7 rounded-md border">
            <AvatarImage
              src={user.avatar}
              alt={user.name}
              className="animate-in fade-in-50 zoom-in-90"
            />
            <AvatarFallback className="rounded-md">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 leading-none">
            <div className="font-medium">{user.name}</div>
            <div className="overflow-hidden text-xs text-muted-foreground">
              <div className="line-clamp-1">{user.email}</div>
            </div>
          </div>
          <ChevronsUpDown className="ml-auto mr-0.5 h-4 w-4 text-muted-foreground/50" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm transition-all">
            <Avatar className="h-7 w-7 rounded-md">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1">
              <div className="font-medium">{user.name}</div>
              <div className="overflow-hidden text-xs text-muted-foreground">
                <div className="line-clamp-1">{user.email}</div>
              </div>
              {tenant && (
                <div className="mt-1">
                  <Badge variant="secondary" className="text-xs font-normal">
                    {tenant.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2" onClick={handleAccount}>
            <BadgeCheck className="h-4 w-4 text-muted-foreground" />
            Account
          </DropdownMenuItem>
          {/* <DropdownMenuItem className="gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Notifications
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" onClick={useLogout()}>
          <LogOut className="h-4 w-4 text-muted-foreground" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
