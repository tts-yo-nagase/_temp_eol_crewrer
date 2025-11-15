"use client"

import * as React from "react"
import { PanelLeftOpen, PanelLeftClose } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useScroll } from "@/contexts/scroll-context"

export const SIDEBAR_STATE_COOKIE = "sidebar:state"

type SidebarContext = {
  state: "open" | "collapsed" | "closed"
  open: boolean
  collapsed: boolean
  onOpenChange: (open: boolean) => void
  toggleCollapsed: () => void
}

const SidebarContext = React.createContext<SidebarContext>({
  state: "open",
  open: true,
  collapsed: false,
  onOpenChange: () => {},
  toggleCollapsed: () => {},
})

function useSidebar() {
  return React.useContext(SidebarContext)
}

const SidebarLayout = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
  }
>(({ defaultOpen, className, ...props }, ref) => {
  const [open, setOpen] = React.useState(defaultOpen ?? true)
  const [collapsed, setCollapsed] = React.useState(false)

  const onOpenChange = React.useCallback((open: boolean) => {
    setOpen(open)
    if (!open) {
      setCollapsed(false)
    }
    document.cookie = `${SIDEBAR_STATE_COOKIE}=${open}; path=/; max-age=${
      60 * 60 * 24 * 7
    }`
  }, [])

  const toggleCollapsed = React.useCallback(() => {
    if (open) {
      setCollapsed((prev) => !prev)
    }
  }, [open])

  const state = !open ? "closed" : collapsed ? "collapsed" : "open"

  return (
    <SidebarContext.Provider value={{ state, open, collapsed, onOpenChange, toggleCollapsed }}>
      <div
        ref={ref}
        data-sidebar={state}
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-collapsed": "3rem",
          } as React.CSSProperties
        }
        className={cn(
          "flex min-h-[calc(100vh-88px)] pl-0 transition-all duration-300 ease-in-out data-[sidebar=closed]:pl-0 data-[sidebar=collapsed]:sm:pl-[--sidebar-width-collapsed] sm:pl-[--sidebar-width]",
          className
        )}
        {...props}
      />
    </SidebarContext.Provider>
  )
})
SidebarLayout.displayName = "SidebarLayout"

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { open, onOpenChange, toggleCollapsed, collapsed } = useSidebar()
  const isMobile = useIsMobile()

  const handleClick = () => {
    if (isMobile) {
      // On mobile, just toggle open/close
      onOpenChange(!open)
    } else {
      // On desktop, toggle collapsed state
      if (open) {
        toggleCollapsed()
      } else {
        onOpenChange(true)
      }
    }
  }

  // Show PanelLeftOpen when collapsed, PanelLeftClose when open
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={handleClick}
      {...props}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const Sidebar = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, children }, ref) => {
    const isMobile = useIsMobile()
    const { open, onOpenChange, state } = useSidebar()
    const { headerHeight } = useScroll()

    const sidebar = (
      <div
        ref={ref}
        className={cn("flex h-full flex-col border-r bg-background", className)}
      >
        {children}
      </div>
    )

    if (isMobile) {
      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent
            className="w-[260px] p-0 md:w-[--sidebar-width] [&>button]:hidden"
            side="left"
          >
            {sidebar}
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <aside
        className={cn(
          "fixed bottom-0 left-0 z-10 hidden transition-all duration-300 ease-in-out md:block",
          "[[data-sidebar=closed]_&]:left-[calc(var(--sidebar-width)*-1)]",
          "[[data-sidebar=collapsed]_&]:w-[--sidebar-width-collapsed]",
          "[[data-sidebar=open]_&]:w-[--sidebar-width]"
        )}
        style={{ top: `${headerHeight}px` }}
      >
        {sidebar}
      </aside>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center border-b px-2.5 py-2", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center border-t px-2.5 py-2", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-1 flex-col gap-5 overflow-auto py-4", className)}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("grid gap-2 px-2", className)} {...props} />
  )
})
SidebarItem.displayName = "SidebarItem"

const SidebarLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "px-1.5 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
})
SidebarLabel.displayName = "SidebarLabel"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarLayout,
  SidebarTrigger,
  useSidebar,
}
