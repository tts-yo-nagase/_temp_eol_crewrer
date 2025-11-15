import { cn } from "@/lib/utils"

interface PageTitleProps {
  children: React.ReactNode
  className?: string
}

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1 className={cn("text-2xl font-bold", className)}>
      {children}
    </h1>
  )
}
