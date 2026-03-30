"use client";

import { useState } from "react";
import { useAppStore, AppState } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FilterX } from "lucide-react";

export function EmployeeReport() {
  const employees = useAppStore((state: AppState) => state.employees);
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [nameFilter, setNameFilter] = useState("");

  const filteredData = employees.filter((emp) => {
    const matchDept = deptFilter === "all" || (emp.department || "").toLowerCase() === deptFilter.toLowerCase();
    const matchStatus = statusFilter === "all" || (emp.status || "").toLowerCase() === statusFilter.toLowerCase();
    const matchName = nameFilter === "" || (emp.name || "").toLowerCase().includes(nameFilter.toLowerCase());
    return matchDept && matchStatus && matchName;
  });

  const exportCsv = () => {
    if (filteredData.length === 0) return;
    const headers = ["Employee ID", "Name", "Position", "Department", "Status", "Join Date"];
    const rows = filteredData.map(emp => [
      emp.id,
      `"${emp.name.replace(/"/g, '""')}"`,
      `"${emp.position.replace(/"/g, '""')}"`,
      `"${emp.department.replace(/"/g, '""')}"`,
      emp.status,
      emp.joinDate
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `employee_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setDeptFilter("all");
    setStatusFilter("all");
    setNameFilter("");
  };

  // Derive unique departments from real data to populate dropdown
  const uniqueDepartments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex-1 space-y-2">
          <Label>Search Name</Label>
          <Input placeholder="Enter name..." value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
        </div>
        <div className="flex-1 space-y-2">
          <Label>Department</Label>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {uniqueDepartments.map(dept => (
                <SelectItem key={dept} value={dept.toLowerCase()}>{dept}</SelectItem>
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
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
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.slice(0, 10).map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.id}</TableCell>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell>{emp.status}</TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No employees found matching criteria</TableCell>
              </TableRow>
            )}
            {filteredData.length > 10 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-2 text-xs text-muted-foreground bg-muted/20">
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
