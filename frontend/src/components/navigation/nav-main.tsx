"use client"

import Link from "next/link"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"

export function NavMain({
  className,
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
} & React.ComponentProps<"ul">) {
  const pathname = usePathname()
  const { collapsed } = useSidebar()

  return (
    <ul className={cn("grid gap-0.5", className)}>
      {items.map((item) => {
        const isCurrentPath = item.items?.some((subItem) => subItem.url === pathname) || pathname === item.url
        const hasChildren = item.items && item.items.length > 0

        // If no children, render as simple link
        if (!hasChildren) {
          const linkContent = (
            <Link
              href={item.url}
              className={cn(
                "min-w-8 flex h-8 items-center gap-2 overflow-hidden rounded-md text-sm font-medium outline-none ring-ring transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2",
                collapsed ? "px-1 justify-center" : "px-1.5",
                pathname === item.url && "bg-accent text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <div className="flex flex-1 overflow-hidden">
                  <div className="line-clamp-1">{item.title}</div>
                </div>
              )}
            </Link>
          )

          return (
            <li key={item.title}>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                linkContent
              )}
            </li>
          )
        }

        // Render collapsible with children
        const collapsibleLink = (
          <Link
            href={item.url}
            className={cn(
              "min-w-8 flex h-8 flex-1 items-center gap-2 overflow-hidden rounded-md text-sm font-medium outline-none ring-ring transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2",
              collapsed ? "px-1 justify-center" : "px-1.5",
              isCurrentPath && "bg-accent text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <div className="flex flex-1 overflow-hidden">
                <div className="line-clamp-1 pr-6">{item.title}</div>
              </div>
            )}
          </Link>
        )

        return (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive || isCurrentPath}>
            <li>
              <div className="relative flex items-center">
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {collapsibleLink}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  collapsibleLink
                )}
                {!collapsed && (
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="absolute right-1 h-6 w-6 rounded-md p-0 ring-ring transition-all focus-visible:ring-2 data-[state=open]:rotate-90"
                    >
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                )}
              </div>
              {!collapsed && (
                <CollapsibleContent className="px-4 py-0.5">
                  <ul className="grid border-l px-2">
                    {item.items?.map((subItem) => (
                      <li key={subItem.title}>
                        <Link
                          href={subItem.url}
                          className={cn(
                            "min-w-8 flex h-8 items-center gap-2 overflow-hidden rounded-md px-2 text-sm font-medium text-muted-foreground ring-ring transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2",
                            pathname === subItem.url && "bg-accent text-accent-foreground"
                          )}
                        >
                          <div className="line-clamp-1">{subItem.title}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              )}
            </li>
          </Collapsible>
        )
      })}
    </ul>
  )
}
