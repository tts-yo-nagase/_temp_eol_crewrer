'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Package, ScanLine, Database, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useTabStore } from '@/app/store/useTabStore';
import { useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
const tabs = [
  { id: 'tab4' as const, label: 'ダッシュボード', icon: LayoutDashboard, href: '/main/tab4', defaultUrl: '/main/tab4/dashboard/dashboard1' },
  { id: 'tab1' as const, label: '製品割り当て', icon: Package, href: '/main/tab1', defaultUrl: '/main/tab1' },
  { id: 'tab2' as const, label: 'スキャン', icon: ScanLine, href: '/main/tab2', defaultUrl: '/main/tab2' },
  { id: 'tab5' as const, label: '脆弱性状況一覧', icon: ShieldAlert, href: '/main/tab5', defaultUrl: '/main/tab5/product-view' },
  { id: 'tab3' as const, label: 'マスタ', icon: Database, href: '/main/tab3', defaultUrl: '/main/tab3/company' },
] as const;

export function TabNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { saveLastUrl, getLastUrl } = useTabStore();

  // 現在のURLを保存（tab1とtab2は単一ページなので保存しない）
  useEffect(() => {
    if (!pathname) return;

    const currentTab = tabs.find(tab => pathname.startsWith(tab.href));
    if (currentTab && pathname !== currentTab.href && currentTab.id !== 'tab1' && currentTab.id !== 'tab2') {
      saveLastUrl(currentTab.id, pathname);
    }
  }, [pathname, saveLastUrl]);

  const isActiveTab = (href: string) => {
    return pathname?.startsWith(href);
  };

  const handleTabClick = (e: React.MouseEvent, tab: typeof tabs[number]) => {
    e.preventDefault();
    // tab1とtab2は単一ページなので常にdefaultUrlを使用
    if (tab.id === 'tab1' || tab.id === 'tab2') {
      router.push(tab.defaultUrl);
    } else {
      const lastUrl = getLastUrl(tab.id);
      const targetUrl = lastUrl || tab.defaultUrl;
      router.push(targetUrl);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <nav className="flex items-center gap-1 h-10 px-4 relative overflow-x-auto scrollbar-hide flex-nowrap">
        {tabs.map((tab) => {
          const isActive = isActiveTab(tab.href);
          const Icon = tab.icon;
          return (
            <Tooltip key={tab.id}>
              <TooltipTrigger asChild>
                <Link
                  href={tab.href}
                  onClick={(e) => handleTabClick(e, tab)}
                  className={cn(
                    'relative px-3 h-full flex items-center text-sm font-medium transition-colors z-10 whitespace-nowrap flex-shrink-0',
                    'hover:text-foreground/80',
                    isActive
                      ? 'text-foreground'
                      : 'text-foreground/60'
                  )}
                >
                  <Icon className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="sm:hidden">
                <p>{tab.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
