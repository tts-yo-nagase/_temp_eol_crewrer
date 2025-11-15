"use client"

import { ModeToggle } from "./mode-toggle-button";
import { NavUser } from "./nav-user";
import { TabNavigation } from "./tab-navigation";
import { TenantSwitcher } from "./tenant-switcher";
import { useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScroll } from "@/contexts/scroll-context";

export default function TopMenuBar() {
  const { data: session, status } = useSession()
  const { isScrolled } = useScroll();

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Row 1: Logo Bar - slides up on scroll */}
      <header
        className={cn(
          "w-full bg-white dark:bg-black bg-opacity-90 dark:bg-opacity-80 backdrop-blur-md",
          "transition-transform duration-300 ease-in-out",
          isScrolled && "-translate-y-full"
        )}
      >
        <div className="w-full flex justify-between h-14 px-4">
          <div className="flex items-center gap-6">
            <span className="flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-primary" />
              <span className="font-bold text-xl">SecureLens</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 flex-nowrap">
            {session?.user && <TenantSwitcher />}
            {status === "loading" ? (
              // skeleton code
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
              </div>
            ) : (
              session?.user && (
                <NavUser user={{
                  name: session.user.name ?? "",
                  email: session.user.email ?? "",
                  avatar: session.user.image ?? "",
                }} />
              )
            )}
            <div>
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Row 2: Tab Bar - always at top (fixed) */}
      <div
        className={cn(
          "w-full h-10 border-b",
          "bg-white dark:bg-black bg-opacity-90 dark:bg-opacity-80",
          "backdrop-blur-md transition-all duration-300 ease-in-out",
          isScrolled ? "shadow-md -translate-y-14" : ""
        )}
      >
        <TabNavigation />
      </div>
    </div>
  );
}
