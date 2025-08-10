"use client"

import * as React from "react"
import { redirect, usePathname } from "next/navigation"
import {
  IconDashboard,
  IconSettings,
  IconBuildingBank,
  IconUsersGroup,
  IconHelp,
  IconUser,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/client"
import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
        isActive: pathname === "/dashboard",
      },
      {
        title: "Lenders",
        url: "/dashboard/lenders",
        icon: IconBuildingBank,
        isActive: pathname === "/dashboard/lenders",
      },
      {
        title: "Clients",
        url: "/dashboard/clients",
        icon: IconUsersGroup,
        isActive: pathname === "/dashboard/clients",
      },
      {
        title: "Assess Profile",
        url: "/dashboard/assess-profile",
        icon: IconUser,
        isActive: pathname === "/dashboard/assess-profile",
      },
      {
        title: "Organization Settings",
        url: "/dashboard/organization",
        icon: IconSettings,
        isActive: pathname === "/dashboard/organization",
      },
    ],
    navSecondary: [
      {
        title: "Help",
        url: "/help",
        icon: IconHelp,
        isActive: pathname === "/help",
      },
    ],
    documents: [],
  }
  const [user, setUser] = React.useState<any>({user_metadata: {name:"User", avatar_url: "/avatars/shadcn.jpg"}, email:"", });
  const supabase = createClient();
  React.useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if(!user) redirect("/auth/login");
      setUser(user);
    };
    fetchUser();
  }, []);
  // if (!user) setUser();

  // Map Supabase user to expected NavUser props
  const navUser = {
    name: user.user_metadata?.name || user.email || "User",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url || "/avatars/shadcn.jpg",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <span className="text-base font-semibold">CreditMatch Pro</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {data.documents.length > 0 && <NavDocuments items={data.documents} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
