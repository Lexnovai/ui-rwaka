import { AppSidebar } from '@/components/app-components/app-sidebar'
import { Providers } from '@/components/providers/providers'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Providers>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex w-full flex-col">{children}</div>
      </SidebarProvider>
    </Providers>
  )
}
