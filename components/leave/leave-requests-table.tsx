"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Check, X, Edit } from "lucide-react";
import { LeaveDetailsDialog } from "./leave-details-dialog";
import { LeaveRequest } from "@/lib/sample-data";
import { LeaveApplicationDialog } from "./leave-application-dialog";
import { useAppStore, AppState } from "@/lib/store";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

interface LeaveRequestsTableProps {
  searchTerm: string;
}

export function LeaveRequestsTable({
  searchTerm,
}: LeaveRequestsTableProps) {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "hr_manager";
  const leaves = useAppStore((state: AppState) => state.leaves);
  const updateLeave = useAppStore((state: AppState) => state.updateLeave);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleStatusChange = (id: string, status: "Approved" | "Rejected") => {
    updateLeave(id, { status });
    toast.success(`Leave request ${status.toLowerCase()} successfully`);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredRequests = leaves.filter(
    (request) =>
      (request.employee || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.type || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!mounted) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      Pending: "outline",
      Approved: "default",
      Rejected: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status}
      </Badge>
    );
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Recent Leave Requests</CardTitle>
        <CardDescription>
          Latest leave applications requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.employee}</TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>{request.startDate}</TableCell>
                  <TableCell>{request.endDate}</TableCell>
                  <TableCell>{request.days}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedLeave(request);
                            setIsDetailsOpen(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {request.status === "Pending" && canManage && (
                            <>
                              <DropdownMenuItem onClick={() => {
                                setSelectedLeave(request);
                                setIsEditOpen(true);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(request.id, "Approved")}>
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleStatusChange(request.id, "Rejected")}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    <LeaveDetailsDialog 
      leave={selectedLeave}
      open={isDetailsOpen}
      onOpenChange={setIsDetailsOpen}
    />
    <LeaveApplicationDialog 
      open={isEditOpen}
      onOpenChange={setIsEditOpen}
      leaveToEdit={selectedLeave}
    />
    </>
  );
}
