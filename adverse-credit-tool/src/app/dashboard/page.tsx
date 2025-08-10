"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

type Organization = {
  id: string;
  name: string;
  created_at: string;
};

export default function DashboardPage() {
  const supabase = createClient();
  const [org, setOrg] = useState<Organization | null>(null);
  const [lenderCount, setLenderCount] = useState<number>(0);
  const [clientCount, setClientCount] = useState<number>(0);
  const [adviserCount, setAdviserCount] = useState<number>(0);
  const [adminCount, setAdminCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

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
      // Get counts
      const [{ count: lenders }, { count: clients }, { count: advisers }, {count: admins}] = await Promise.all([
        supabase.from("lenders").select("id", { count: "exact", head: true }).eq("organization_id", orgData.id),
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("organization_id", orgData.id),
        supabase.from("organization_members").select("id", { count: "exact", head: true }).eq("organization_id", orgData.id).eq("role", "adviser"),
        supabase.from("organization_members").select("id", { count: "exact", head: true }).eq("organization_id", orgData.id).eq("role", "admin"),

      ]);
      setLenderCount(lenders ?? 0);
      setClientCount(clients ?? 0);
      setAdviserCount(advisers ?? 0);
      setAdminCount(admins ?? 0);
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-3">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <div className="text-muted-foreground font-medium">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 space-y-4 bg-gradient-to-br from-background via-background/80 to-primary/5 ">
      {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card rounded-lg p-6 shadow-sm border border-border">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome to your Dashboard</h1>
          {org && (
            <div className="text-xl text-foreground/80 font-medium">{org.name}</div>
          )}
           {org && (
            <div className="text-sm text-muted-foreground mt-1">Organization ID: <span className="font-mono">{org.id}</span></div>
          )} 
        </div>
        <div className="flex gap-2 flex-wrap mt-4 md:mt-0">
          <Link href="/dashboard/organization">
            <Button variant="outline" size="lg" className="font-medium">Organization Settings</Button>
          </Link>
        </div>
      </div>*/}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="px-6 gap-2 flex flex-col items-center justify-between h-full bg-primary/10 shadow-md hover:shadow-lg transition-shadow border border-primary/20">
          <div className="text-2xl font-bold text-primary">Credit Profile Assessment</div>
          {/* <div className="text-sm text-foreground/80 mt-2 text-center">Main tool for assessing client credit profiles against lender criteria.</div> */}
          <Link href="/dashboard/assess-profile" className="mt-6 w-full">
            <Button className="w-full" variant="default">Go to Assessment Tool</Button>
          </Link>
        </Card>
        <Card className="px-6 gap-2 flex flex-col items-center justify-between h-full bg-card shadow hover:shadow-md transition-shadow border border-border">
          <div className="text-4xl font-bold text-primary mb-2">{lenderCount}</div>
          <div className="text-lg font-medium text-foreground/90">Lenders</div>
          <Link href="/dashboard/lenders" className="mt-6 w-full">
            <Button className="w-full" variant="secondary">View Lenders</Button>
          </Link>
        </Card>
        <Card className="px-6 gap-2 flex flex-col items-center justify-between h-full bg-card shadow hover:shadow-md transition-shadow border border-border">
          <div className="text-4xl font-bold text-primary mb-2">{clientCount}</div>
          <div className="text-lg font-medium text-foreground/90">Clients</div>
          <Link href="/dashboard/clients" className="mt-6 w-full">
            <Button className="w-full" variant="secondary">View Clients</Button>
          </Link>
        </Card>
        <Card className="px-6 gap-2 flex flex-col items-center justify-between h-full bg-card shadow hover:shadow-md transition-shadow border border-border">
          <div className="flex flex-row justify-between w-full px-8">
          <div className = "flex flex-col items-center gap-2">
          <div className="text-4xl font-bold text-primary mb-2">{adviserCount}</div>
          <div className="text-lg font-medium text-foreground/90">Advisers</div>
          </div>
          <div className = "flex flex-col items-center gap-2">
          <div className="text-4xl font-bold text-primary mb-2">{adminCount}</div>
          <div className="text-lg font-medium text-foreground/90">Admins</div>
          </div>

          
          </div>
          <Link href="/dashboard/organization" className="mt-6 w-full">
            <Button className="w-full" variant="secondary">View Members</Button>
          </Link>
        </Card>
        
      </div>

      {/* Quick Links */}
      {/* <div className="">
        <Card className="p-6 gap-2 bg-card border border-border shadow-sm hover:shadow transition-shadow rounded-lg">
          <div className="font-semibold text-xl text-foreground mb-4">Quick Links</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/clients">
          <Button variant="outline" className="w-full group justify-between">
            Clients
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 group-hover:translate-x-1 transition-transform">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
        </Link>
        <Link href="/dashboard/lenders">
          <Button variant="outline" className="w-full group justify-between">
            Lenders
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 group-hover:translate-x-1 transition-transform">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
        </Link>
        <Link href="/dashboard/organization">
          <Button variant="outline" className="w-full group justify-between">
            Organization
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 group-hover:translate-x-1 transition-transform">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
        </Link>
        <Link href="/dashboard/assess-profile">
          <Button variant="default" className="w-full group justify-between">
            Assessment Tool
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 group-hover:translate-x-1 transition-transform">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
        </Link>
          </div>
        </Card>
      </div> */}
    </div>
  );
}
