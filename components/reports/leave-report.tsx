"use client";

import { useState } from "react";
import { useAppStore, AppState } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FilterX } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LeaveReport() {
  const leaves = useAppStore((state: AppState) => state.leaves);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("");

  const filteredData = leaves.filter((leave) => {
    const matchType = typeFilter === "all" || (leave.type || "").toLowerCase() === typeFilter.toLowerCase();
    const matchStatus = statusFilter === "all" || (leave.status || "").toLowerCase() === statusFilter.toLowerCase();
    const matchEmployee = employeeFilter === "" || (leave.employee || "").toLowerCase().includes(employeeFilter.toLowerCase());
    return matchType && matchStatus && matchEmployee;
  });

  const exportCsv = () => {
    if (filteredData.length === 0) return;
    const headers = ["ID", "Employee", "Type", "Start Date", "End Date", "Total Days", "Status", "Reason"];
    const rows = filteredData.map(leave => [
      leave.id,
      `"${(leave.employee || "").replace(/"/g, '""')}"`,
      `"${(leave.type || "").replace(/"/g, '""')}"`,
      leave.startDate,
      leave.endDate,
      leave.days,
      leave.status,
      `"${(leave.reason || "").replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `leave_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setEmployeeFilter("");
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    } as const;

    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants] || "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"}>
        {status}
      </Badge>
    );
  };

  // Derive unique types from real data to populate dropdown
  const uniqueTypes = Array.from(new Set(leaves.map(l => l.type).filter(Boolean)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex-1 space-y-2">
          <Label>Search Employee Name</Label>
          <Input placeholder="Enter employee name..." value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} />
        </div>
        <div className="flex-1 space-y-2">
          <Label>Leave Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger><SelectValue placeholder="All Leave Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leave Types</SelectItem>
              {uniqueTypes.map(type => (
                <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-2">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground ml-2">Showing {filteredData.length} records</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <FilterX className="h-4 w-4 mr-2" /> Clear Filters
          </Button>
          <Button size="sm" variant="default" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.slice(0, 10).map((leave) => (
              <TableRow key={leave.id}>
                <TableCell className="font-medium">{leave.id}</TableCell>
                <TableCell>{leave.employee}</TableCell>
                <TableCell>{leave.type}</TableCell>
                <TableCell>{leave.startDate} to {leave.endDate}</TableCell>
                <TableCell>{leave.days}</TableCell>
                <TableCell>{getStatusBadge(leave.status)}</TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">No leave requests found matching criteria</TableCell>
              </TableRow>
            )}
            {filteredData.length > 10 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-2 text-xs text-muted-foreground bg-muted/20">
                  Showing 10 of {filteredData.length} rows. Export CSV to view all.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
