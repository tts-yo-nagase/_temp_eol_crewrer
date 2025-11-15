"use client"

import {
  Atom,
  BookOpen,
  Eclipse,
  History,

  Settings2,
  SquareTerminal,
  Star,
  Users,
  Building,
  Globe,
  Package,
  Users2,
} from "lucide-react"

import { NavMain } from "@/components/navigation/nav-main"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { usePathname } from "next/navigation"
// Tab1のナビゲーション
const tab1Data = {
  navMain: [
    {
      title: "Dashboard（開いたまま）",
      url: "#",
      icon: SquareTerminal,
      isActive: true, // 開いたままになる
      items: [
        {
          title: "Dashboard1",
          url: "/main/tab1/dashboard/dashboard1",
          icon: History,
          description: "View your recent prompts",
        },
        {
          title: "Dashboard2",
          url: "/main/tab1/dashboard/dashboard2",
          icon: Star,
          description: "Browse your starred prompts",
        },
      ],
    },
    {
      title: "Master",
      url: "#",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Master2",
          url: "/main/tab1/master/master2",
        },
        {
          title: "Master3",
          url: "/main/tab1/master/master3",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      isActive: false,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
      ],
    },
  ]
}

// Tab3のナビゲーション（メンテナンス）
const tab3Data = {
  navMain: [
    {
      title: "Company",
      url: "/main/tab3/company",
      icon: Building,
      isActive: false,
    },
    {
      title: "Users",
      url: "/main/tab3/users",
      icon: Users,
      isActive: false,
    },
  ],
  projects: [],
}

// Tab2のナビゲーション
const tab2Data = {
  navMain: [
    {
      title: "helloworld",
      url: "/main/tab2",
      icon: Globe,
      isActive: false,
    },
  ],
}

// Tab4のナビゲーション
const tab4Data = {
  navMain: [
    {
      title: "Dashboard（開いたまま）",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard1",
          url: "/main/tab4/dashboard/dashboard1",
          icon: History,
          description: "View your recent prompts",
        },
        {
          title: "Dashboard2",
          url: "/main/tab4/dashboard/dashboard2",
          icon: Star,
          description: "Browse your starred prompts",
        },
      ],
    },
    {
      title: "Master",
      url: "#",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Master2",
          url: "/main/tab4/master/master2",
        },
        {
          title: "Master3",
          url: "/main/tab4/master/master3",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      isActive: false,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
      ],
    },
  ]
}

// Tab5のナビゲーション（脆弱性状況一覧）
const tab5Data = {
  navMain: [
    {
      title: "製品軸ビュー",
      url: "/main/tab5/product-view",
      icon: Package,
      isActive: false,
    },
    {
      title: "顧客軸ビュー",
      url: "/main/tab5/customer-view",
      icon: Users2,
      isActive: false,
    },
  ],
}

// 共通のナビゲーション
const commonData = {
  teams: [
    {
      name: "Acme Inc",
      logo: Atom,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: Eclipse,
      plan: "Startup",
    },
  ]
}

export function AppSidebar() {
  const pathname = usePathname()
  const { collapsed } = useSidebar()

  // 現在のタブに基づいてデータを選択
  const isTab2 = pathname?.startsWith("/main/tab2")
  const isTab3 = pathname?.startsWith("/main/tab3")
  const isTab4 = pathname?.startsWith("/main/tab4")
  const isTab5 = pathname?.startsWith("/main/tab5")
  const currentTabData = isTab5 ? tab5Data : isTab4 ? tab4Data : isTab3 ? tab3Data : isTab2 ? tab2Data : tab1Data

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar className="flex h-full flex-col bg-sidebar">
        <SidebarContent className="flex-1 overflow-y-auto">
          <SidebarItem>
            <NavMain items={currentTabData.navMain} />
          </SidebarItem>
        </SidebarContent>
        <SidebarFooter className="justify-start">
          <SidebarTrigger />
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  )
}
