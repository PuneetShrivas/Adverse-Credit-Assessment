"use client";
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./ui/theme-toggle"
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { toast } from "sonner";
import Link from "next/link";

type Organization = {
  id: string;
  name: string;
  created_at: string;
};
export function SiteHeader() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error(userError?.message || "User not found");
        setLoading(false);
        return;
      }
      // Get organization membership
      const { data: member, error: memberError } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .single();
      if (memberError || !member) {
        toast.error(memberError?.message || "Organization not found");
        setLoading(false);
        return;
      }
      // Get organization details
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("id, name, created_at")
        .eq("id", member.organization_id)
        .single();
      if (orgError || !orgData) {
        toast.error(orgError?.message || "Organization not found");
        setLoading(false);
        return;
      }
      setOrg(orgData);
      setLoading(false);
    }
    load();
  }, [supabase]);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{org?.name || ""}</h1>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/dashboard/organization">
            <Button variant="outline">Settings</Button>
          </Link>
          <ModeToggle />
          {/* <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button> */}
          
        </div>
      </div>
    </header>
  )
}
{/*<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card rounded-lg p-6 shadow-sm border border-border">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome to your Dashboard</h1>
          {org && (
            <div className="text-xl text-foreground/80 font-medium">{org.name}</div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap mt-4 md:mt-0">
          <Link href="/dashboard/organization">
            <Button variant="outline" size="lg" className="font-medium">Organization Settings</Button>
          </Link>
        </div>
      </div>*/}
