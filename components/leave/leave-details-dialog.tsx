"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LeaveRequest } from "@/lib/sample-data";

interface LeaveDetailsDialogProps {
  leave: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveDetailsDialog({
  leave,
  open,
  onOpenChange,
}: LeaveDetailsDialogProps) {
  if (!leave) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">Leave Request Details</DialogTitle>
              <DialogDescription>
                Request ID: {leave.id}
              </DialogDescription>
            </div>
            {getStatusBadge(leave.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">Employee</h4>
              <p className="text-base font-medium">{leave.employee}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Leave Type</h4>
                <p className="text-base font-medium">{leave.type}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Duration</h4>
                <p className="text-base font-medium">{leave.days} {leave.days === 1 ? 'Day' : 'Days'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Start Date</h4>
                <p className="text-base font-medium">{leave.startDate}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">End Date</h4>
                <p className="text-base font-medium">{leave.endDate}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-bold text-muted-foreground mb-1">Reason for Leave</h4>
            <div className="text-sm bg-muted/50 p-4 rounded-md min-h-[80px]">
              {leave.reason || "No reason provided."}
            </div>
          </div>

          {leave.status !== 'Pending' && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground italic">
                This request has already been {leave.status.toLowerCase()} and cannot be modified.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
