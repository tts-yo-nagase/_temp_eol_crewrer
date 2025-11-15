"use client";

import "../globals.css";
import React from "react";
import TopMenuBar from "@/components/navigation/top-menu-bar";
import { ScrollProvider } from "@/contexts/scroll-context";
import { SidebarLayout } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideSidebar = (pathname?.startsWith("/main/tab1") || pathname?.startsWith("/main/tab2")) ?? false;

  return (
    <ScrollProvider>
      <SidebarLayout
        key={hideSidebar ? "no-sidebar" : "with-sidebar"}
        defaultOpen={!hideSidebar}
        className={
          hideSidebar
            ? "sm:pl-0 data-[sidebar=open]:sm:pl-0 data-[sidebar=collapsed]:sm:pl-0"
            : undefined
        }
      >
        {!hideSidebar && <AppSidebar />}
        <div className="flex flex-1 flex-col w-full">
          <TopMenuBar />
          <div className="pt-[96px]">
            {children}
          </div>
        </div>
      </SidebarLayout>
    </ScrollProvider>
  );
}
