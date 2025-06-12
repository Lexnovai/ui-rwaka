import { Receipt, Shield, User, UserCircle } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

const items = [
  {
    title: 'Profile',
    url: '/settings/profile',
    icon: UserCircle
  },
  {
    title: 'Account',
    url: '/settings/account',
    icon: User
  },
  {
    title: 'Privacy Policy',
    url: '/settings/privacy',
    icon: Shield
  },
  {
    title: 'Pricing Plans',
    url: '/settings/pricing',
    icon: Receipt
  }
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
