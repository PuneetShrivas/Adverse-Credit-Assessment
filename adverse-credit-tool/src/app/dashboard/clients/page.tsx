"use client"

import React, { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/client"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

type Client = {
  id: string
  name: string
  email: string
  phone?: string
  adviser_email?: string
  created_at: string
  assessments?: any
}

export default function ClientsPage() {
  const supabase = createClient()
  const [data, setData] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const tableRef = useRef<HTMLDivElement>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null)
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false)

  const handleViewAssessment = (assessment: any) => {
    try {
      // Handle both string and object assessments
      const parsedAssessment = typeof assessment === 'string' 
        ? JSON.parse(assessment) 
        : assessment;
      
      setSelectedAssessment(parsedAssessment);
      setIsAssessmentDialogOpen(true);
    } catch (e) {
      console.error('Failed to parse assessment:', e);
      toast.error("Invalid assessment data");
    }
  };

  const handleCloseDialog = () => {
    setIsAssessmentDialogOpen(false);
    // Reset the selected assessment after a brief delay to allow dialog to close smoothly
    setTimeout(() => {
      setSelectedAssessment(null);
    }, 200);
  };

  const columns: ColumnDef<Client>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    // { accessorKey: "adviser_email", header: "Adviser" },
    { 
      accessorKey: "created_at", 
      header: "Created At",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return new Date(date).toLocaleDateString();
      }
    },
    {
      id: "assessments",
      header: "Assessments",
      cell: ({ row }) => {
        const assessment = row.original.assessments;
        return assessment ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewAssessment(assessment)}
          >
            View Assessment
          </Button>
        ) : (
          <span className="text-muted-foreground">No assessment</span>
        );
      }
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { 
      globalFilter,
      pagination: {
        pageIndex: 0,
        pageSize: pageSize,
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  })

  useEffect(() => {
    async function loadClients() {
      setLoading(true);
      
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          toast.error(userError?.message || "User not found");
          return;
        }

        // Get organization id from organization_members
        const { data: member, error: memberError } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .single();
          
        if (memberError || !member) {
          toast.error(memberError?.message || "Organization not found");
          return;
        }

        // Get clients for this organization with proper joins
        const { data: clients, error: clientsError } = await supabase
          .from("clients")
          .select(`
            id,
            name,
            email,
            phone,
            created_at,
            adverse_credit,
            adviser_id
          `)
          .eq("organization_id", member.organization_id);

        if (clientsError) {
          toast.error(clientsError.message);
          return;
        }
        //get user email from adviser_id
        

        if (clients) {
          const processedClients = clients.map((c: any) => ({
            id: c.id,
            name: c.name || "",
            email: c.email || "",
            phone: c.phone || "",
            adviser_email: c.profiles?.email || "",
            created_at: c.created_at,
            assessments: c.adverse_credit || null,
          }));
          
          setData(processedClients);
        }
      } catch (error) {
        console.error('Error loading clients:', error);
        toast.error("Failed to load clients");
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, [supabase]);

  const exportToExcel = () => {
    if (!data.length) {
      toast.error("No data to export");
      return;
    }

    try {
      // Create export data without complex objects
      const exportData = data.map(client => ({
        Name: client.name,
        Email: client.email,
        Phone: client.phone || "",
        Adviser: client.adviser_email || "",
        "Created At": client.created_at,
        "Has Assessment": client.assessments ? "Yes" : "No"
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Clients");
      
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([wbout], { type: "application/octet-stream" }), `clients_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success("Exported to Excel successfully");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export data");
    }
  };

  // Render the badge for lender status
  const renderStatusBadge = (status: "Accept" | "Consider" | "Decline") => {
    switch (status) {
      case "Accept":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-50">Accept</Badge>
      case "Consider":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-50">Consider</Badge>
      case "Decline":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-50">Decline</Badge>
      default:
        return null;
    }
  }

  const renderAssessmentContent = () => {
    if (!selectedAssessment) {
      return <div className="text-center text-muted-foreground">No assessment data available</div>;
    }

    const hasData = selectedAssessment.selectedTypes?.length > 0;
    
    if (!hasData) {
      return <div className="text-center text-muted-foreground">No adverse credit issues recorded</div>;
    }

    return (
      <div className="space-y-6">
        {/* Lender Results Section */}
        {selectedAssessment.lenderResults && selectedAssessment.lenderResults.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Lender Assessment Results</h3>
            
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedAssessment.lenderResults.map((lender: any, idx: number) => (
                <Card key={idx} className={`overflow-hidden border-t-4 ${
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
            </div>
          </div>
        )}

        <h3 className="text-lg font-semibold">Adverse Credit Details</h3>
        
        {selectedAssessment.selectedTypes.includes("CCJs") && selectedAssessment.ccjs?.length > 0 && (
          <div>
            <div className="font-semibold mb-2">CCJs ({selectedAssessment.ccjs.length})</div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Registered</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Satisfied</TableHead>
                    <TableHead>Date Satisfied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedAssessment.ccjs.map((ccj: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {ccj.dateRegistered ? new Date(ccj.dateRegistered).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>£{ccj.amount || "0"}</TableCell>
                      <TableCell>{ccj.satisfied ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        {ccj.satisfied && ccj.dateSatisfied ? new Date(ccj.dateSatisfied).toLocaleDateString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {selectedAssessment.selectedTypes.includes("Defaults") && selectedAssessment.defaults?.length > 0 && (
          <div>
            <div className="font-semibold mb-2">Defaults ({selectedAssessment.defaults.length})</div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Registered</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Satisfied</TableHead>
                    <TableHead>Date Satisfied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedAssessment.defaults.map((def: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {def.dateRegistered ? new Date(def.dateRegistered).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>£{def.amount || "0"}</TableCell>
                      <TableCell>{def.satisfied ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        {def.satisfied && def.dateSatisfied ? new Date(def.dateSatisfied).toLocaleDateString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {selectedAssessment.selectedTypes.includes("Repossessions") && selectedAssessment.repossessions?.length > 0 && (
          <div>
            <div className="font-semibold mb-2">Repossessions ({selectedAssessment.repossessions.length})</div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Debt Cleared</TableHead>
                    <TableHead>Outstanding Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedAssessment.repossessions.map((repo: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {repo.dateOfRepossession ? new Date(repo.dateOfRepossession).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>{repo.debtCleared ? "Yes" : "No"}</TableCell>
                      <TableCell>£{repo.outstandingAmount || "0"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4" ref={tableRef}>
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-semibold">Clients ({data.length})</h1>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-64"
          />
          <Button onClick={exportToExcel} disabled={!data.length}>
            Download Excel
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={header.column.getCanSort() ? "cursor-pointer select-none hover:bg-muted/50" : ""}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: " ▲",
                      desc: " ▼",
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow 
                  key={row.id} 
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  {globalFilter ? "No results found." : "No clients found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select 
            value={String(pageSize)} 
            onValueChange={(val) => { 
              const newSize = Number(val);
              setPageSize(newSize); 
              table.setPageSize(newSize);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50, 100].map(size => (
                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {data.length} entries
          </span>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => table.previousPage()} 
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => table.nextPage()} 
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      
      {/* Assessment Dialog */}
      <Dialog open={isAssessmentDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assessment Details</DialogTitle>
            <DialogDescription>
              Adverse credit profile and lender assessment results
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {renderAssessmentContent()}
          </div>
          
          <DialogFooter>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}