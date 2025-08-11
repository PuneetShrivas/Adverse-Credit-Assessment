
"use client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { useEffect, useState, useRef } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const CATEGORIES: AdverseType[] = ["CCJs", "Bankruptcy", "Arrears", "IVA", "Repossessions"];

const badgeClass = (type: string) =>
  type === "CCJs" ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-50" :
  type === "Bankruptcy" ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-50" :
  type === "Arrears" ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-50" :
  type === "IVA" ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-50" :
  type === "Repossessions" ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-50" : "";

import { useState as useLocalState, useRef as useLocalRef } from "react";
const globalSetDialog: any = null;
const CriteriaDialog = ({ open, onClose, crit, type }: { open: boolean, onClose: () => void, crit: Criteria, type: string }) => {
  const dialogRef = useLocalRef<HTMLDivElement>(null);
  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
      <div ref={dialogRef} className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl p-6 min-w-[320px] max-w-[90vw] relative animate-fade-in">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:hover:text-white" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M6 6l12 12M6 18L18 6"/></svg>
        </button>
        <div className="flex flex-col gap-2">
          <span className="font-bold text-lg mb-2">{type} Details</span>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">max_amount:</span> {crit.max_amount}</div>
            <div><span className="font-medium">max_count:</span> {crit.max_count}</div>
            <div><span className="font-medium">max_age_months:</span> {crit.max_age_months}</div>
            <div><span className="font-medium">status:</span> <span className="capitalize">{crit.status}</span></div>
            {"discharge_period_months" in crit && (
              <div><span className="font-medium">discharge_period_months:</span> {(crit as any).discharge_period_months}</div>
            )}
            {"arrears_tolerance" in crit && crit.arrears_tolerance && (
              <div>
                <span className="font-medium">arrears_tolerance:</span> months: {crit.arrears_tolerance.months}, count: {crit.arrears_tolerance.count}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

let setDialogState: any = null;
const renderCriteriaCell = (crit: Criteria, type: string) => {
  // Use a global dialog state for all cards
  if (!setDialogState) return null;
  return (
    <div
      className="cursor-pointer h-full rounded-lg border p-2 shadow-sm bg-white dark:bg-zinc-900 hover:shadow-md transition-all duration-300"
      onClick={() => setDialogState({ open: true, crit, type })}
      style={{ minWidth: 120 }}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-xs">{type}</span>
      </div>
      <div className="text-xs space-y-1">
        <div><span className="font-medium">max_amount:</span> {crit.max_amount}</div>
        <div><span className="font-medium">max_count:</span> {crit.max_count}</div>
        <div><span className="font-medium">max_age_months:</span> {crit.max_age_months}</div>
        <div><span className="font-medium">status:</span> <span className="capitalize">{crit.status}</span></div>
        {"discharge_period_months" in crit && (
          <div><span className="font-medium">discharge_period_months:</span> {(crit as any).discharge_period_months}</div>
        )}
        {"arrears_tolerance" in crit && crit.arrears_tolerance && (
          <div>
            <span className="font-medium">arrears_tolerance:</span> months: {crit.arrears_tolerance.months}, count: {crit.arrears_tolerance.count}
          </div>
        )}
      </div>
    </div>
  );
};

const lenderColumns = (onEdit: (l: Lender) => void, isAdmin: boolean): ColumnDef<Lender>[] => [
  { accessorKey: "name", header: "Name" },
  ...CATEGORIES.map((cat) => ({
    id: cat,
    header: () => <Badge className={badgeClass(cat)}>{cat}</Badge>,
    cell: ({ row }: { row: any }) => renderCriteriaCell(row.original.criteria[cat], cat),
    enableSorting: false,
    enableHiding: false,
  })),
  ...(isAdmin ? [{
    id: "actions",
    header: "",
    cell: ({ row }: { row: any }) => (
      <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>
        Edit
      </Button>
    ),
    enableSorting: false,
    enableHiding: false,
  }] : []),
];
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

type AdverseType = "CCJs" | "Bankruptcy" | "Arrears" | "IVA" | "Repossessions"

type Criteria = {
  max_amount: number
  max_count: number
  max_age_months: number
  status: "satisfied" | "unsatisfied"
  discharge_period_months?: number
  arrears_tolerance?: {
    months: number
    count: number
  }
}

type Lender = {
  id?: string
  name: string
  criteria: Record<AdverseType, Criteria>
}

const defaultCriteria = (): Record<AdverseType, Criteria> => ({
  CCJs: { max_amount: 0, max_count: 0, max_age_months: 0, status: "unsatisfied" },
  Bankruptcy: { max_amount: 0, max_count: 0, max_age_months: 0, status: "unsatisfied", discharge_period_months: 0 },
  Arrears: { max_amount: 0, max_count: 0, max_age_months: 0, status: "unsatisfied", arrears_tolerance: { months: 0, count: 0 } },
  IVA: { max_amount: 0, max_count: 0, max_age_months: 0, status: "unsatisfied", discharge_period_months: 0 },
  Repossessions: { max_amount: 0, max_count: 0, max_age_months: 0, status: "unsatisfied" },
})

export default function LendersPage() {
  const exportToExcel = () => {
    // Prepare data for Excel: flatten criteria into columns
    const rows = lenders.map((l: Lender) => {
      const row: any = { Name: l.name };
      Object.entries(l.criteria).forEach(([cat, crit]) => {
        const c = crit as Criteria;
        row[`${cat} max_amount`] = c.max_amount;
        row[`${cat} max_count`] = c.max_count;
        row[`${cat} max_age_months`] = c.max_age_months;
        row[`${cat} status`] = c.status;
        if ("discharge_period_months" in c) row[`${cat} discharge_period_months`] = (c as any).discharge_period_months;
        if ("arrears_tolerance" in c && c.arrears_tolerance) {
          row[`${cat} arrears_months`] = c.arrears_tolerance.months;
          row[`${cat} arrears_count`] = c.arrears_tolerance.count;
        }
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lenders");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "lenders.xlsx");
  };
  const supabase = createClient()
  const [lenders, setLenders] = useState<Lender[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [lender, setLender] = useState<Lender>({ name: "", criteria: defaultCriteria() })
  const [isAdmin, setIsAdmin] = useState(false)
  const [orgId, setOrgId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      let isAdminUser = false;
      let organizationId = null;
      if (user) {
        // Get org member row for this user
        const { data: member, error: memberError } = await supabase
          .from("organization_members")
          .select("role, organization_id")
          .eq("user_id", user.id)
          .single();
        if (memberError) {
          toast.error(memberError.message);
        } else if (member) {
          isAdminUser = member.role === "admin";
          organizationId = member.organization_id;
        }
      }
      setIsAdmin(isAdminUser);
      setOrgId(organizationId);
      let lendersData = [];
      if (organizationId) {
        const { data, error } = await supabase
          .from("lenders")
          .select("*")
          .eq("organization_id", organizationId);
        if (error) toast.error(error.message)
        else lendersData = data as any;
      }
      setLenders(lendersData);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const saveLender = async () => {
    const { error } = await supabase
      .from("lenders")
      .upsert({ id: lender.id, organization_id: orgId, name: lender.name, criteria: lender.criteria })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Lender saved")
      setOpen(false)
      setLender({ name: "", criteria: defaultCriteria() })
      const { data } = await supabase.from("lenders").select("*")
      setLenders(data as any)
    }
  }

  const tableRef = useRef<HTMLDivElement>(null);
  const table = useReactTable({
    data: lenders,
    columns: lenderColumns((l) => {
      setLender(l);
      setOpen(true);
    }, isAdmin),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Dialog state for criteria expansion
  const [dialog, setDialog] = useLocalState<{ open: boolean, crit?: Criteria, type?: string }>({ open: false });
  setDialogState = setDialog;
  
  return (
    <div className="p-6 space-y-6" ref={tableRef}>
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-semibold">Lenders</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>Download as Excel</Button>
          {isAdmin && (
            <Dialog open={open} onOpenChange={(v) => {
              setOpen(v);
              if (!v) return;
              setLender((l) => l.id ? l : { name: "", criteria: defaultCriteria() });
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setLender({ name: "", criteria: defaultCriteria() })}>Add New Lender</Button>
              </DialogTrigger>
              <DialogContent className="w-auto min-w-[700px] max-h-[90vh] overflow-y-auto">
                {/* ...existing dialog content for add/edit... */}
                <DialogHeader>
                  <DialogTitle>{lender.id ? "Edit Lender" : "Create Lender"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1">Lender Name</label>
                    <Input
                      className="w-full min-w-[250px]"
                      placeholder="Lender Name"
                      value={lender.name}
                      onChange={(e) => setLender((l) => ({ ...l, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(lender.criteria).map(([type, crit]) => (
                      <Card key={type} className="p-6 space-y-2 border w-full min-w-[250px]  max-w-full">
                        <h3 className="font-semibold mb-2">{type}</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {/* ...existing code... */}
                          <div>
                            <label className="block text-sm mb-1">Max Amount</label>
                            <Input
                              className="w-full min-w-[120px]"
                              type="number"
                              placeholder="Max Amount"
                              value={crit.max_amount}
                              onChange={(e) => {
                                const v = Number(e.target.value)
                                setLender((l) => ({
                                  ...l,
                                  criteria: { ...l.criteria, [type]: { ...crit, max_amount: v } },
                                }))
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">Max Count</label>
                            <Input
                              className="w-full min-w-[120px]"
                              type="number"
                              placeholder="Max Count"
                              value={crit.max_count}
                              onChange={(e) => {
                                const v = Number(e.target.value)
                                setLender((l) => ({
                                  ...l,
                                  criteria: { ...l.criteria, [type]: { ...crit, max_count: v } },
                                }))
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">Max Age (months)</label>
                            <Input
                              className="w-full min-w-[120px]"
                              type="number"
                              placeholder="Max Age (months)"
                              value={crit.max_age_months}
                              onChange={(e) => {
                                const v = Number(e.target.value)
                                setLender((l) => ({
                                  ...l,
                                  criteria: { ...l.criteria, [type]: { ...crit, max_age_months: v } },
                                }))
                              }}
                            />
                          </div>
                          {"discharge_period_months" in crit && (
                            <div className="col-span-2">
                              <label className="block text-sm mb-1">Discharge Period (months)</label>
                              <Input
                                className="w-full min-w-[120px]"
                                type="number"
                                placeholder="Discharge Period"
                                value={(crit as any).discharge_period_months}
                                onChange={(e) => {
                                  const v = Number(e.target.value)
                                  setLender((l) => ({
                                    ...l,
                                    criteria: {
                                      ...l.criteria,
                                      [type]: { ...(crit as any), discharge_period_months: v },
                                    },
                                  }))
                                }}
                              />
                            </div>
                          )}
                          {"arrears_tolerance" in crit && (
                            <>
                              <div>
                                <label className="block text-sm mb-1">Arrears Months</label>
                                <Input
                                  className="w-full min-w-[120px]"
                                  type="number"
                                  placeholder="Arrears Months"
                                  value={(crit as any).arrears_tolerance.months}
                                  onChange={(e) => {
                                    const v = Number(e.target.value)
                                    setLender((l) => ({
                                      ...l,
                                      criteria: {
                                        ...l.criteria,
                                        [type]: {
                                          ...(crit as any),
                                          arrears_tolerance: { ...crit.arrears_tolerance!, months: v },
                                        },
                                      },
                                    }))
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1">Arrears Count</label>
                                <Input
                                  className="w-full min-w-[120px]"
                                  type="number"
                                  placeholder="Arrears Count"
                                  value={(crit as any).arrears_tolerance.count}
                                  onChange={(e) => {
                                    const v = Number(e.target.value)
                                    setLender((l) => ({
                                      ...l,
                                      criteria: {
                                        ...l.criteria,
                                        [type]: {
                                          ...(crit as any),
                                          arrears_tolerance: { ...crit.arrears_tolerance!, count: v },
                                        },
                                      },
                                    }))
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={saveLender}>{lender.id ? "Update" : "Create"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      {/* Loading animation */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="cursor-pointer select-none"
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <CriteriaDialog
            open={dialog.open}
            onClose={() => setDialog({ open: false })}
            crit={dialog.crit ?? defaultCriteria().CCJs}
            type={dialog.type ?? "CCJs"}
          />
        </>
      )}
    </div>
  );
}
