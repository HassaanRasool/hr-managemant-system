"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LeaveRequest, PerformanceReview } from "@/types/db";

interface EmployeeDetail {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  name?: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  status: string;
  manager?: string;
  start_date: string | Date;
  basic_salary?: number;
  leaveRequests?: LeaveRequest[];
  performanceReviews?: PerformanceReview[];
}

interface EmployeeDetailsDialogProps {
  employeeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeDetailsDialog({
  employeeId,
  open,
  onOpenChange,
}: EmployeeDetailsDialogProps) {
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEmployeeDetails = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${id}`);
      if (res.ok) {
        setEmployee(await res.json());
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && employeeId) {
      fetchEmployeeDetails(employeeId);
    }
  }, [open, employeeId, fetchEmployeeDetails]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Active: "bg-green-100 text-green-800 border-green-200",
      "On Leave": "bg-yellow-100 text-yellow-800 border-yellow-200",
      On_Leave: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Inactive: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <Badge
        className={variants[status] || "bg-slate-100 text-slate-800"}
        variant="outline"
      >
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (!employeeId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Employee Profile
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : employee ? (
          <div className="space-y-6 pt-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-3xl font-bold shrink-0">
                {(employee?.first_name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-bold">
                  {employee.first_name} {employee.last_name}
                </h2>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="secondary" className="px-3">
                    {employee.employee_id}
                  </Badge>
                  {getStatusBadge(employee.status)}
                </div>
                <p className="text-muted-foreground flex items-center gap-1.5 pt-1">
                  <Briefcase className="h-4 w-4" /> {employee.position}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">{employee.phone || "Not Provided"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Employment Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Organizational
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-sm">{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm">Manager: {employee.manager || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Joined: {new Date(employee.start_date as string).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Financial/System - Restricted for Admin/HR normally, but they are viewing it */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Financial & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Basic Salary</span>
                      <span className="text-sm font-medium">
                        {employee.basic_salary ? `${employee.basic_salary.toLocaleString()} / month` : "Confidential"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">System ID</span>
                      <span className="text-sm font-mono text-muted-foreground uppercase">{employee.id.split('-')[0]}...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent History or Stats could go here */}
          </div>
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            Failed to load employee profile.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
