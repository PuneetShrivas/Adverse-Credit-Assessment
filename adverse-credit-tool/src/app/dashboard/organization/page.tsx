"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner" // ✅ Sonner toast

export default function OrganizationPage() {
  const supabase = createClient()

  const [organization, setOrganization] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("adviser")
  const [editingName, setEditingName] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          toast.error("User not authenticated")
          setLoading(false)
          return
        }

        // Get organization ID from organization_members table through user ID
        const { data: memberData, error: memberError } = await supabase
          .from("organization_members")
          .select("organization_id, role")
          .eq("user_id", user.id)
          .single()

        if (memberError) {
          console.error("Error fetching organization membership:", memberError)
          toast.error("Failed to fetch organization membership")
          setError("You don't have access to any organization. Please contact your administrator.")
          setLoading(false)
          return
        }

        // Store the current user's role
        setCurrentUserRole(memberData.role)

        // Get organization details using organization_id
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", memberData.organization_id)
          .single()

        if (orgError) {
          console.error("Error fetching organization:", orgError)
          toast.error("Failed to fetch organization details")
          setError("Organization details could not be loaded. Please try again later.")
          setLoading(false)
          return
        }

        setOrganization(orgData)
        setEditingName(orgData?.name || "")

        // Get all members of the organization
        const { data: allMembersData, error: allMembersError } = await supabase
          .from("organization_members")
          .select("role, user_id, users: user_id(email)")
          .eq("organization_id", memberData.organization_id)

        if (allMembersError) {
          console.error("Error fetching members:", allMembersError)
          toast.error("Failed to fetch organization members")
        } else {
          setMembers(allMembersData || [])
        }
      } catch (error) {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const updateOrgName = async () => {
    if (!editingName.trim()) {
      toast.error("Organization name cannot be empty")
      return
    }
    
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ name: editingName })
        .eq("id", organization.id)
      
      if (error) {
        console.error("Error updating organization name:", error)
        toast.error("Failed to update organization name")
        return
      }
      
      setOrganization({ ...organization, name: editingName })
      toast.success("Organization name updated successfully")
    } catch (error) {
      console.error("Unexpected error updating organization name:", error)
      toast.error("An unexpected error occurred")
    }
  }

  const sendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email address is required")
      return
    }
    
    if (!organization?.id) {
      toast.error("Organization information is missing")
      return
    }
    
    try {
      // Generate a random password for initial setup
      const password = Math.random().toString(36).slice(-8)
      
      const { error } = await supabase.from("pending_invites").insert({
        organization_id: organization.id,
        email: inviteEmail.trim(),
        password_hash: password,
        role: inviteRole,
      })
      
      if (error) {
        console.error("Error sending invite:", error)
        if (error.code === '23505') {
          toast.error("This email has already been invited")
        } else {
          toast.error("Failed to send invite")
        }
        return
      }
      
      toast.success(`Invite sent to ${inviteEmail}`)
      setInviteEmail("")
    } catch (error) {
      console.error("Unexpected error sending invite:", error)
      toast.error("An unexpected error occurred")
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Loading organization data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-amber-600 mb-2">Organization Not Found</h2>
          <p className="text-muted-foreground mb-4">
            We couldn&apos;t load your organization data. Please try again or contact support.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Organization Settings</CardTitle>
          <CardDescription>Manage your organization’s details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {currentUserRole === 'admin' ? (
              <>
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="Organization Name"
                  className="max-w-sm"
                />
                <Button onClick={updateOrgName}>Save</Button>
              </>
            ) : (
              <p className="text-lg font-medium">{organization.name}</p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Created on:{" "}
            {new Date(organization.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Members</CardTitle>
          <CardDescription>View all members and their roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.user_id}>
                  <TableCell>{m.users?.email}</TableCell>
                  <TableCell className="capitalize">{m.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Form - Only visible to admins */}
      {currentUserRole === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Invite Member</CardTitle>
            <CardDescription>
              Send an invite to join your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <Input
                type="email"
                placeholder="Email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adviser">Adviser</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={sendInvite}>Send Invite</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
