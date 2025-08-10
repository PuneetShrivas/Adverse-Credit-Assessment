"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
// import { format } from "date-fns"

// Types for adverse credit
type AdverseType = 
  | "Defaults" 
  | "CCJs" 
  | "Mortgage/Secured Loan Arrears" 
  | "Unsecured Credit Arrears" 
  | "IVA" 
  | "Bankruptcy" 
  | "Repossessions" 
  | "Debt Management Plan"

type LenderResult = {
  id: string
  name: string
  status: "Accept" | "Consider" | "Decline"
  product: string
  reason: string
}

// Define the profile state
type AdverseProfile = {
  selectedTypes: AdverseType[]
  defaults?: {
    dateRegistered: string
    amount: number
    satisfied: boolean
    dateSatisfied?: string
  }[]
  ccjs?: {
    dateRegistered: string
    amount: number
    satisfied: boolean
    dateSatisfied?: string
  }[]
  mortgageArrears?: {
    missedPayments6Months: number
    missedPayments12Months: number
    missedPayments24Months: number
    missedPayments36Months: number
    missedPayments48Months: number
  }
  unsecuredArrears?: {
    missedPayments6Months: number
    missedPayments12Months: number
    missedPayments24Months: number
    missedPayments36Months: number
    missedPayments48Months: number
  }
  iva?: {
    dateRegistered: string
    totalDebt: number
    dateDischarged: string
  }
  bankruptcy?: {
    dateRegistered: string
    totalDebt: number
    dateDischarged: string
  }
  dmp?: {
    startDate: string
    monthsPaid: number
    monthlyPayment: number
    endDate: string
  }
  repossessions?: {
    dateOfRepossession: string
    debtCleared: boolean
    outstandingAmount: number
  }[]
}

export default function AssessProfilePage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<string>("1")
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [clientId, setClientId] = useState<string | null>(null)
  const [clients, setClients] = useState<{ id: string, name: string }[]>([])
  const [lenderResults, setLenderResults] = useState<LenderResult[]>([])
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  
  // Initialize adverse profile state
  const [profile, setProfile] = useState<AdverseProfile>({
    selectedTypes: [],
    defaults: [],
    ccjs: [],
    repossessions: []
  })
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: ""
  })

  // Fetch organization ID and clients
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

        // Get organization ID
        const { data: memberData, error: memberError } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .single()

        if (memberError) {
          console.error("Error fetching organization membership:", memberError)
          toast.error("Failed to fetch organization membership")
          setLoading(false)
          return
        }

        setOrganizationId(memberData.organization_id)

        // Fetch clients for this organization
        const { data: clientsData, error: clientsError } = await supabase
          .from("clients")
          .select("id, name")
          .eq("organization_id", memberData.organization_id)

        if (clientsError) {
          console.error("Error fetching clients:", clientsError)
          toast.error("Failed to fetch clients")
        } else {
          setClients(clientsData || [])
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

  // Handle type selection
  const handleTypeSelect = (type: AdverseType) => {
    setProfile(prev => {
      const isSelected = prev.selectedTypes.includes(type)
      
      if (isSelected) {
        return {
          ...prev,
          selectedTypes: prev.selectedTypes.filter(t => t !== type)
        }
      } else {
        // Initialize the data structure for the newly selected type
        const updatedProfile = {
          ...prev,
          selectedTypes: [...prev.selectedTypes, type]
        }
        
        // Initialize default values based on type
        switch (type) {
          case "Defaults":
            updatedProfile.defaults = updatedProfile.defaults || [{
              dateRegistered: "",
              amount: 0,
              satisfied: false
            }]
            break
          case "CCJs":
            updatedProfile.ccjs = updatedProfile.ccjs || [{
              dateRegistered: "",
              amount: 0,
              satisfied: false
            }]
            break
          case "Mortgage/Secured Loan Arrears":
            updatedProfile.mortgageArrears = updatedProfile.mortgageArrears || {
              missedPayments6Months: 0,
              missedPayments12Months: 0,
              missedPayments24Months: 0,
              missedPayments36Months: 0,
              missedPayments48Months: 0
            }
            break
          case "Unsecured Credit Arrears":
            updatedProfile.unsecuredArrears = updatedProfile.unsecuredArrears || {
              missedPayments6Months: 0,
              missedPayments12Months: 0,
              missedPayments24Months: 0,
              missedPayments36Months: 0,
              missedPayments48Months: 0
            }
            break
          case "IVA":
            updatedProfile.iva = updatedProfile.iva || {
              dateRegistered: "",
              totalDebt: 0,
              dateDischarged: ""
            }
            break
          case "Bankruptcy":
            updatedProfile.bankruptcy = updatedProfile.bankruptcy || {
              dateRegistered: "",
              totalDebt: 0,
              dateDischarged: ""
            }
            break
          case "Debt Management Plan":
            updatedProfile.dmp = updatedProfile.dmp || {
              startDate: "",
              monthsPaid: 0,
              monthlyPayment: 0,
              endDate: ""
            }
            break
          case "Repossessions":
            updatedProfile.repossessions = updatedProfile.repossessions || [{
              dateOfRepossession: "",
              debtCleared: false,
              outstandingAmount: 0
            }]
            break
        }
        
        return updatedProfile
      }
    })
  }

  // Add a new item for arrays (defaults, CCJs, repossessions)
  const addItem = (type: "defaults" | "ccjs" | "repossessions") => {
    setProfile(prev => {
      const items = [...(prev[type] || [])]
      
      if (type === "defaults") {
        items.push({
          dateRegistered: "",
          amount: 0,
          satisfied: false
        })
      } else if (type === "ccjs") {
        items.push({
          dateRegistered: "",
          amount: 0,
          satisfied: false
        })
      } else if (type === "repossessions") {
        items.push({
          dateOfRepossession: "",
          debtCleared: false,
          outstandingAmount: 0
        })
      }
      
      return { ...prev, [type]: items }
    })
  }

  // Remove item from arrays
  const removeItem = (type: "defaults" | "ccjs" | "repossessions", index: number) => {
    setProfile(prev => {
      const items = [...(prev[type] || [])]
      items.splice(index, 1)
      return { ...prev, [type]: items }
    })
  }

  // Update field for array items
  const updateArrayItem = (
    type: "defaults" | "ccjs" | "repossessions",
    index: number,
    field: string,
    value: any
  ) => {
    setProfile(prev => {
      const items = [...(prev[type] || [])]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, [type]: items }
    })
  }

  // Update field for object items
  const updateObjectField = (
    type: "mortgageArrears" | "unsecuredArrears" | "iva" | "bankruptcy" | "dmp",
    field: string,
    value: any
  ) => {
    setProfile(prev => {
      const obj = { ...(prev[type] || {}) } as Record<string, any>
      obj[field] = value
      return { ...prev, [type]: obj }
    })
  }

  // Search lenders
  const searchLenders = async () => {
    try {
      setLoading(true)
      
      // Fetch all lenders for the organization
      const { data: lenders, error } = await supabase
        .from("lenders")
        .select("*")
        .eq("organization_id", organizationId)
      
      if (error) {
        toast.error("Failed to fetch lenders: " + error.message)
        return
      }
      
      if (!lenders || lenders.length === 0) {
        toast.warning("No lenders found for your organization")
        setLenderResults([])
        setSearchPerformed(true)
        return
      }
      
      // Process each lender against profile criteria
      const results: LenderResult[] = lenders.map(lender => {
        let status: "Accept" | "Consider" | "Decline" = "Accept"
        let reason = ""
        
        // Check CCJs criteria
        if (profile.selectedTypes.includes("CCJs") && profile.ccjs && profile.ccjs.length > 0) {
          const ccjCriteria = lender.criteria.CCJs
          
          // Find the highest CCJ amount
          const highestCCJ = Math.max(...profile.ccjs.map(ccj => ccj.amount))
          
          // Count total CCJs
          const ccjCount = profile.ccjs.length
          
          // Find the most recent CCJ
          const mostRecentCCJ = profile.ccjs.reduce((recent, current) => {
            if (!recent.dateRegistered) return current
            return new Date(current.dateRegistered) > new Date(recent.dateRegistered) ? current : recent
          }, { dateRegistered: "" })
          
          // Calculate age in months of most recent CCJ
          const ccjAgeMonths = mostRecentCCJ.dateRegistered ? 
            Math.floor((new Date().getTime() - new Date(mostRecentCCJ.dateRegistered).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0
          
          // Evaluate against criteria
          if (highestCCJ > ccjCriteria.max_amount) {
            status = "Decline"
            reason += `CCJ amount (£${highestCCJ}) exceeds maximum (£${ccjCriteria.max_amount}). `
          }
          
          if (ccjCount > ccjCriteria.max_count) {
            status = "Decline"
            reason += `CCJ count (${ccjCount}) exceeds maximum (${ccjCriteria.max_count}). `
          }
          
          if (ccjAgeMonths < ccjCriteria.max_age_months) {
            status = status === "Accept" ? "Consider" : status
            reason += `Most recent CCJ (${ccjAgeMonths} months) is newer than preferred (${ccjCriteria.max_age_months} months). `
          }
          
          // Check satisfaction status
          const hasUnsatisfiedCCJs = profile.ccjs.some(ccj => !ccj.satisfied)
          if (hasUnsatisfiedCCJs && ccjCriteria.status === "satisfied") {
            status = "Decline"
            reason += "Lender requires all CCJs to be satisfied. "
          }
        }
        
        // Check Bankruptcy criteria
        if (profile.selectedTypes.includes("Bankruptcy") && profile.bankruptcy) {
          const bankruptcyCriteria = lender.criteria.Bankruptcy
          
          // Calculate discharge period in months
          const dischargeMonths = profile.bankruptcy.dateDischarged ? 
            Math.floor((new Date().getTime() - new Date(profile.bankruptcy.dateDischarged).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0
          
          if (dischargeMonths < bankruptcyCriteria.discharge_period_months) {
            status = "Decline"
            reason += `Bankruptcy discharge period (${dischargeMonths} months) is less than required (${bankruptcyCriteria.discharge_period_months} months). `
          }
        }
        
        // Check Arrears criteria
        if (profile.selectedTypes.includes("Mortgage/Secured Loan Arrears") && profile.mortgageArrears) {
          const arrearsCriteria = lender.criteria.Arrears
          
          if (profile.mortgageArrears.missedPayments12Months > arrearsCriteria.arrears_tolerance.count) {
            status = status === "Accept" ? "Consider" : status
            reason += `Mortgage arrears in last 12 months (${profile.mortgageArrears.missedPayments12Months}) exceed tolerance (${arrearsCriteria.arrears_tolerance.count}). `
          }
        }
        
        // Similar checks can be added for other adverse credit types
        
        return {
          id: lender.id,
          name: lender.name,
          status: status,
          product: "Residential/BTL", // This would come from lender data
          reason: reason || "Meets all criteria"
        }
      })
      
      setLenderResults(results)
      
      // Store lender results with the profile for saving to client
      setProfile(prev => ({
        ...prev,
        lenderResults: results
      }))
      
      setSearchPerformed(true)
      setActiveTab("3") // Move to results tab
      
    } catch (error) {
      console.error("Error searching lenders:", error)
      toast.error("Failed to search lenders")
    } finally {
      setLoading(false)
    }
  }

  // Save profile to client
  const saveToClient = async () => {
    if (!clientId) {
      toast.error("Please select a client")
      return
    }
    
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from("clients")
        .update({ 
          adverse_credit: profile
        })
        .eq("id", clientId)
      
      if (error) {
        toast.error("Failed to save profile: " + error.message)
      } else {
        toast.success("Profile saved to client successfully")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Failed to save profile")
    } finally {
      setLoading(false)
    }
  }
  
  // Create a new client
  const createNewClient = async () => {
    if (!newClient.name.trim()) {
      toast.error("Client name is required")
      return
    }
    
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("User not authenticated")
        setLoading(false)
        return
      }
      
      // Create new client
      const { data, error } = await supabase
        .from("clients")
        .insert({
          name: newClient.name.trim(),
          email: newClient.email.trim() || null,
          phone: newClient.phone.trim() || null,
          organization_id: organizationId,
          adviser_id: user.id,
          adverse_credit: profile
        })
        .select()
      
      if (error) {
        toast.error("Failed to create client: " + error.message)
      } else {
        toast.success("Client created successfully")
        setNewClientOpen(false)
        
        // Reset form
        setNewClient({
          name: "",
          email: "",
          phone: ""
        })
        
        // Refresh clients list
        const { data: refreshedClients } = await supabase
          .from("clients")
          .select("id, name")
          .eq("organization_id", organizationId)
          
        if (refreshedClients) {
          setClients(refreshedClients)
          
          // Set the newly created client as selected
          if (data && data[0]) {
            setClientId(data[0].id)
          }
        }
      }
    } catch (error) {
      console.error("Error creating client:", error)
      toast.error("Failed to create client")
    } finally {
      setLoading(false)
    }
  }

  // Export results to PDF
  const exportToPDF = () => {
    toast.info("Exporting results to PDF...")
    // PDF export logic would go here
    toast.success("Results exported to PDF")
  }
  
  // Export results to Excel
  const exportToExcel = () => {
    try {
      // Prepare data for Excel
      const rows = lenderResults.map(lender => ({
        Name: lender.name,
        Product: lender.product,
        Status: lender.status,
        Reason: lender.reason
      }))
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(rows)
      
      // Create workbook
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Lender Results")
      
      // Generate Excel file and save
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      saveAs(new Blob([wbout], { type: "application/octet-stream" }), "lender-results.xlsx")
      
      toast.success("Results exported to Excel")
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      toast.error("Failed to export to Excel")
    }
  }
  
  // Render the badge for lender status
  const renderStatusBadge = (status: "Accept" | "Consider" | "Decline") => {
    switch (status) {
      case "Accept":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-50">Accept</Badge>
      case "Consider":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-50">Consider</Badge>
      case "Decline":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-50">Decline</Badge>
    }
  }

  if (loading && !searchPerformed) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Assess Adverse Credit Profile</h1>
        <p className="text-muted-foreground">
          Build an adverse credit profile to find suitable lenders.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="1">1. Select Adverse Credit Types</TabsTrigger>
          <TabsTrigger value="2">2. Input Detailed Data</TabsTrigger>
          <TabsTrigger value="3" disabled={!searchPerformed}>3. Results</TabsTrigger>
        </TabsList>

        {/* Step 1: Select Adverse Credit Types */}
        <TabsContent value="1">
          <Card>
            <CardHeader>
              <CardTitle>Select Adverse Credit Types</CardTitle>
              <CardDescription>
                Choose all the adverse credit types that apply to this profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Defaults",
                "CCJs",
                "Mortgage/Secured Loan Arrears",
                "Unsecured Credit Arrears",
                "IVA",
                "Bankruptcy",
                "Repossessions",
                "Debt Management Plan"
              ].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`type-${type}`} 
                    checked={profile.selectedTypes.includes(type as AdverseType)}
                    onCheckedChange={() => handleTypeSelect(type as AdverseType)}
                    className="border-2 data-[state=checked]:border-primary border-gray-300 dark:border-gray-600 h-5 w-5"
                  />
                  <Label htmlFor={`type-${type}`}>{type}</Label>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button 
                onClick={() => setActiveTab("2")}
                disabled={profile.selectedTypes.length === 0}
              >
                Continue to Details
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Step 2: Input Detailed Data */}
        <TabsContent value="2">
          <Card>
            <CardHeader>
              <CardTitle>Input Detailed Data</CardTitle>
              <CardDescription>
                Provide specific details for each selected adverse credit type.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Defaults Section */}
              {profile.selectedTypes.includes("Defaults") && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Defaults</h3>
                  <Separator />
                  
                  {profile.defaults && profile.defaults.map((defaultItem, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Default {index + 1}</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeItem("defaults", index)}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`default-date-${index}`}>Date Default Registered</Label>
                          <Input 
                            id={`default-date-${index}`}
                            type="date"
                            value={defaultItem.dateRegistered}
                            onChange={(e) => updateArrayItem("defaults", index, "dateRegistered", e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`default-amount-${index}`}>Default Amount (£)</Label>
                          <Input 
                            id={`default-amount-${index}`}
                            type="number"
                            value={defaultItem.amount}
                            onChange={(e) => updateArrayItem("defaults", index, "amount", parseFloat(e.target.value))}
                          />
                        </div>
                        
                        <div className="space-y-2 flex items-center">
                          <div className="flex-1">
                            <Label htmlFor={`default-satisfied-${index}`}>Has default been satisfied?</Label>
                            <div className="flex items-center pt-2">
                              <Switch 
                                id={`default-satisfied-${index}`}
                                checked={defaultItem.satisfied}
                                onCheckedChange={(checked) => updateArrayItem("defaults", index, "satisfied", checked)}
                              />
                              <Label htmlFor={`default-satisfied-${index}`} className="ml-2">
                                {defaultItem.satisfied ? "Yes" : "No"}
                              </Label>
                            </div>
                          </div>
                        </div>
                        
                        {defaultItem.satisfied && (
                          <div className="space-y-2">
                            <Label htmlFor={`default-satisfied-date-${index}`}>Date Satisfied</Label>
                            <Input 
                              id={`default-satisfied-date-${index}`}
                              type="date"
                              value={defaultItem.dateSatisfied || ""}
                              onChange={(e) => updateArrayItem("defaults", index, "dateSatisfied", e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" onClick={() => addItem("defaults")}>
                    Add Another Default
                  </Button>
                </div>
              )}
              
              {/* CCJs Section */}
              {profile.selectedTypes.includes("CCJs") && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">CCJs</h3>
                  <Separator />
                  
                  {profile.ccjs && profile.ccjs.map((ccj, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">CCJ {index + 1}</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeItem("ccjs", index)}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`ccj-date-${index}`}>Date CCJ Registered</Label>
                          <Input 
                            id={`ccj-date-${index}`}
                            type="date"
                            value={ccj.dateRegistered}
                            onChange={(e) => updateArrayItem("ccjs", index, "dateRegistered", e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`ccj-amount-${index}`}>CCJ Amount (£)</Label>
                          <Input 
                            id={`ccj-amount-${index}`}
                            type="number"
                            value={ccj.amount}
                            onChange={(e) => updateArrayItem("ccjs", index, "amount", parseFloat(e.target.value))}
                          />
                        </div>
                        
                        <div className="space-y-2 flex items-center">
                          <div className="flex-1">
                            <Label htmlFor={`ccj-satisfied-${index}`}>Has CCJ been satisfied?</Label>
                            <div className="flex items-center pt-2">
                              <Switch 
                                id={`ccj-satisfied-${index}`}
                                checked={ccj.satisfied}
                                onCheckedChange={(checked) => updateArrayItem("ccjs", index, "satisfied", checked)}
                              />
                              <Label htmlFor={`ccj-satisfied-${index}`} className="ml-2">
                                {ccj.satisfied ? "Yes" : "No"}
                              </Label>
                            </div>
                          </div>
                        </div>
                        
                        {ccj.satisfied && (
                          <div className="space-y-2">
                            <Label htmlFor={`ccj-satisfied-date-${index}`}>Date Satisfied</Label>
                            <Input 
                              id={`ccj-satisfied-date-${index}`}
                              type="date"
                              value={ccj.dateSatisfied || ""}
                              onChange={(e) => updateArrayItem("ccjs", index, "dateSatisfied", e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" onClick={() => addItem("ccjs")}>
                    Add Another CCJ
                  </Button>
                </div>
              )}
              
              {/* Mortgage/Secured Loan Arrears */}
              {profile.selectedTypes.includes("Mortgage/Secured Loan Arrears") && profile.mortgageArrears && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Mortgage/Secured Loan Arrears</h3>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mortgage-6months">Missed Payments (Last 6 Months)</Label>
                      <Input 
                        id="mortgage-6months"
                        type="number"
                        value={profile.mortgageArrears.missedPayments6Months}
                        onChange={(e) => updateObjectField(
                          "mortgageArrears", 
                          "missedPayments6Months", 
                          parseInt(e.target.value)
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mortgage-12months">Missed Payments (Last 12 Months)</Label>
                      <Input 
                        id="mortgage-12months"
                        type="number"
                        value={profile.mortgageArrears.missedPayments12Months}
                        onChange={(e) => updateObjectField(
                          "mortgageArrears", 
                          "missedPayments12Months", 
                          parseInt(e.target.value)
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mortgage-24months">Missed Payments (Last 24 Months)</Label>
                      <Input 
                        id="mortgage-24months"
                        type="number"
                        value={profile.mortgageArrears.missedPayments24Months}
                        onChange={(e) => updateObjectField(
                          "mortgageArrears", 
                          "missedPayments24Months", 
                          parseInt(e.target.value)
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mortgage-36months">Missed Payments (Last 36 Months)</Label>
                      <Input 
                        id="mortgage-36months"
                        type="number"
                        value={profile.mortgageArrears.missedPayments36Months}
                        onChange={(e) => updateObjectField(
                          "mortgageArrears", 
                          "missedPayments36Months", 
                          parseInt(e.target.value)
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mortgage-48months">Missed Payments (Last 48 Months)</Label>
                      <Input 
                        id="mortgage-48months"
                        type="number"
                        value={profile.mortgageArrears.missedPayments48Months}
                        onChange={(e) => updateObjectField(
                          "mortgageArrears", 
                          "missedPayments48Months", 
                          parseInt(e.target.value)
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Unsecured Credit Arrears */}
              {profile.selectedTypes.includes("Unsecured Credit Arrears") && profile.unsecuredArrears && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Unsecured Credit Arrears</h3>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unsecured-6months">Missed Payments (Last 6 Months)</Label>
                      <Input 
                        id="unsecured-6months"
                        type="number"
                        value={profile.unsecuredArrears.missedPayments6Months}
                        onChange={(e) => updateObjectField(
                          "unsecuredArrears", 
                          "missedPayments6Months", 
                          parseInt(e.target.value)
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="unsecured-12months">Missed Payments (Last 12 Months)</Label>
                      <Input 
                        id="unsecured-12months"
                        type="number"
                        value={profile.unsecuredArrears.missedPayments12Months}
                        onChange={(e) => updateObjectField(
                          "unsecuredArrears", 
                          "missedPayments12Months", 
                          parseInt(e.target.value)
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="unsecured-24months">Missed Payments (Last 24 Months)</Label>
                      <Input 
                        id="unsecured-24months"
                        type="number"
                        value={profile.unsecuredArrears.missedPayments24Months}
                        onChange={(e) => updateObjectField(
                          "unsecuredArrears", 
                          "missedPayments24Months", 
                          parseInt(e.target.value)
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="unsecured-36months">Missed Payments (Last 36 Months)</Label>
                      <Input 
                        id="unsecured-36months"
                        type="number"
                        value={profile.unsecuredArrears.missedPayments36Months}
                        onChange={(e) => updateObjectField(
                          "unsecuredArrears", 
                          "missedPayments36Months", 
                          parseInt(e.target.value)
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="unsecured-48months">Missed Payments (Last 48 Months)</Label>
                      <Input 
                        id="unsecured-48months"
                        type="number"
                        value={profile.unsecuredArrears.missedPayments48Months}
                        onChange={(e) => updateObjectField(
                          "unsecuredArrears", 
                          "missedPayments48Months", 
                          parseInt(e.target.value)
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* IVA */}
              {profile.selectedTypes.includes("IVA") && profile.iva && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">IVA</h3>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="iva-date-registered">Date Registered</Label>
                      <Input 
                        id="iva-date-registered"
                        type="date"
                        value={profile.iva.dateRegistered}
                        onChange={(e) => updateObjectField("iva", "dateRegistered", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="iva-total-debt">Total Debt (£)</Label>
                      <Input 
                        id="iva-total-debt"
                        type="number"
                        value={profile.iva.totalDebt}
                        onChange={(e) => updateObjectField("iva", "totalDebt", parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="iva-date-discharged">Date Discharged</Label>
                      <Input 
                        id="iva-date-discharged"
                        type="date"
                        value={profile.iva.dateDischarged}
                        onChange={(e) => updateObjectField("iva", "dateDischarged", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Bankruptcy */}
              {profile.selectedTypes.includes("Bankruptcy") && profile.bankruptcy && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bankruptcy</h3>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankruptcy-date-registered">Date Registered</Label>
                      <Input 
                        id="bankruptcy-date-registered"
                        type="date"
                        value={profile.bankruptcy.dateRegistered}
                        onChange={(e) => updateObjectField("bankruptcy", "dateRegistered", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bankruptcy-total-debt">Total Debt (£)</Label>
                      <Input 
                        id="bankruptcy-total-debt"
                        type="number"
                        value={profile.bankruptcy.totalDebt}
                        onChange={(e) => updateObjectField("bankruptcy", "totalDebt", parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bankruptcy-date-discharged">Date Discharged</Label>
                      <Input 
                        id="bankruptcy-date-discharged"
                        type="date"
                        value={profile.bankruptcy.dateDischarged}
                        onChange={(e) => updateObjectField("bankruptcy", "dateDischarged", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Debt Management Plan */}
              {profile.selectedTypes.includes("Debt Management Plan") && profile.dmp && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Debt Management Plan (DMP)</h3>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dmp-start-date">Start Date</Label>
                      <Input 
                        id="dmp-start-date"
                        type="date"
                        value={profile.dmp.startDate}
                        onChange={(e) => updateObjectField("dmp", "startDate", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dmp-months-paid">Number of Months Payments Made</Label>
                      <Input 
                        id="dmp-months-paid"
                        type="number"
                        value={profile.dmp.monthsPaid}
                        onChange={(e) => updateObjectField("dmp", "monthsPaid", parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dmp-monthly-payment">Monthly Payment Amount (£)</Label>
                      <Input 
                        id="dmp-monthly-payment"
                        type="number"
                        value={profile.dmp.monthlyPayment}
                        onChange={(e) => updateObjectField("dmp", "monthlyPayment", parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dmp-end-date">Expected End Date</Label>
                      <Input 
                        id="dmp-end-date"
                        type="date"
                        value={profile.dmp.endDate}
                        onChange={(e) => updateObjectField("dmp", "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Repossessions */}
              {profile.selectedTypes.includes("Repossessions") && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Repossessions</h3>
                  <Separator />
                  
                  {profile.repossessions && profile.repossessions.map((repo, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Repossession {index + 1}</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeItem("repossessions", index)}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`repo-date-${index}`}>Date of Repossession</Label>
                          <Input 
                            id={`repo-date-${index}`}
                            type="date"
                            value={repo.dateOfRepossession}
                            onChange={(e) => updateArrayItem("repossessions", index, "dateOfRepossession", e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2 flex items-center">
                          <div className="flex-1">
                            <Label htmlFor={`repo-cleared-${index}`}>Was debt cleared?</Label>
                            <div className="flex items-center pt-2">
                              <Switch 
                                id={`repo-cleared-${index}`}
                                checked={repo.debtCleared}
                                onCheckedChange={(checked) => updateArrayItem("repossessions", index, "debtCleared", checked)}
                              />
                              <Label htmlFor={`repo-cleared-${index}`} className="ml-2">
                                {repo.debtCleared ? "Yes" : "No"}
                              </Label>
                            </div>
                          </div>
                        </div>
                        
                        {!repo.debtCleared && (
                          <div className="space-y-2">
                            <Label htmlFor={`repo-outstanding-${index}`}>Outstanding Amount (£)</Label>
                            <Input 
                              id={`repo-outstanding-${index}`}
                              type="number"
                              value={repo.outstandingAmount}
                              onChange={(e) => updateArrayItem("repossessions", index, "outstandingAmount", parseFloat(e.target.value))}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" onClick={() => addItem("repossessions")}>
                    Add Another Repossession
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("1")}>
                Back to Selection
              </Button>
              <Button onClick={searchLenders}>
                Search Lenders
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Step 3: Results */}
        <TabsContent value="3">
          <Card>
            <CardHeader>
              <CardTitle>Lender Results</CardTitle>
              <CardDescription>
                Lenders that match the adverse credit profile criteria.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-sm">Accept</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                  <span className="text-sm">Consider</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span className="text-sm">Decline</span>
                </div>
              </div>
              
              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lenderResults.map((lender) => (
                  <Card key={lender.id} className={`overflow-hidden border-t-4 ${
                    lender.status === "Accept" ? "border-t-green-500" :
                    lender.status === "Consider" ? "border-t-amber-500" :
                    "border-t-red-500"
                  }`}>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{lender.name}</CardTitle>
                          <CardDescription className="text-xs">{lender.product}</CardDescription>
                        </div>
                        {renderStatusBadge(lender.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground">{lender.reason}</p>
                    </CardContent>
                  </Card>
                ))}

                {lenderResults.length === 0 && (
                  <div className="col-span-full p-8 text-center">
                    <p className="text-muted-foreground mb-2">No matching lenders found.</p>
                    <p className="text-sm">Try adjusting the adverse credit profile criteria.</p>
                  </div>
                )}
              </div>
              
              {/* Client Save Section */}
              {lenderResults.length > 0 && (
                <div className="mt-6 p-4 border rounded-md">
                  <h3 className="text-lg font-medium mb-4">Save Results</h3>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="client-select">Select Client</Label>
                      <div className="flex gap-2">
                        <Select value={clientId || ""} onValueChange={setClientId} >
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">+</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create New Client</DialogTitle>
                              <DialogDescription>
                                Create a new client to save this adverse credit profile.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-2">
                              <div className="space-y-2">
                                <Label htmlFor="client-name">Name *</Label>
                                <Input
                                  id="client-name"
                                  placeholder="Client name"
                                  value={newClient.name}
                                  onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="client-email">Email</Label>
                                <Input
                                  id="client-email"
                                  type="email"
                                  placeholder="Email address"
                                  value={newClient.email}
                                  onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="client-phone">Phone</Label>
                                <Input
                                  id="client-phone"
                                  placeholder="Phone number"
                                  value={newClient.phone}
                                  onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setNewClientOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={createNewClient}>
                                Create & Save
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={saveToClient} disabled={!clientId}>
                        Save to Client
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            Export Results
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={exportToPDF}>
                            Export as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={exportToExcel}>
                            Export as Excel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("2")}>
                Back to Details
              </Button>
              <Button onClick={() => {
                setProfile({
                  selectedTypes: [],
                  defaults: [],
                  ccjs: [],
                  repossessions: []
                })
                setLenderResults([])
                setSearchPerformed(false)
                setActiveTab("1")
              }}>
                Start New Assessment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
