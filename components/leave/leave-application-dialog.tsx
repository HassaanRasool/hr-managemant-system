"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore, AppState } from "@/lib/store";
import { toast } from "sonner";
import { LeaveRequest } from "@/lib/sample-data";

interface LeaveApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveToEdit?: LeaveRequest | null;
}

export function LeaveApplicationDialog({
  open,
  onOpenChange,
  leaveToEdit,
}: LeaveApplicationDialogProps) {
  const [formData, setFormData] = useState({
    employeeId: "", // We might not have employeeId in LeaveRequest, let's assume it matches employee name or just leave it blank for now
    leaveType: leaveToEdit?.type || "",
    startDate: leaveToEdit?.startDate || "",
    endDate: leaveToEdit?.endDate || "",
    reason: leaveToEdit?.reason || "",
    reliever: leaveToEdit?.reliever || "",
    emergencyContact: leaveToEdit?.emergencyContact || "",
    emergencyPhone: leaveToEdit?.emergencyPhone || "",
  });

  // Update form data when leaveToEdit changes
  useState(() => {
    if (leaveToEdit) {
      setFormData({
        employeeId: "",
        leaveType: leaveToEdit.type || "",
        startDate: leaveToEdit.startDate || "",
        endDate: leaveToEdit.endDate || "",
        reason: leaveToEdit.reason || "",
        reliever: leaveToEdit.reliever || "",
        emergencyContact: leaveToEdit.emergencyContact || "",
        emergencyPhone: leaveToEdit.emergencyPhone || "",
      });
    }
    return undefined;
  });

  const addLeave = useAppStore((state: AppState) => state.addLeave);
  const updateLeave = useAppStore((state: AppState) => state.updateLeave);
  const employeeName = useAppStore(
    (state: AppState) =>
      state.employees.find((e) => e.id === formData.employeeId)?.name ||
      (leaveToEdit ? leaveToEdit.employee : "Unknown Employee"),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (leaveToEdit) {
      updateLeave(leaveToEdit.id, {
        employeeId: formData.employeeId,
        type: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        reliever: formData.reliever,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        days: calculateDays(),
      });
      toast.success("Leave application updated successfully!");
    } else {
      const newId = `LV${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`;
      addLeave({
        id: newId,
        employeeId: formData.employeeId,
        employee: employeeName,
        type: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: "Pending",
        reason: formData.reason,
        reliever: formData.reliever,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        days: calculateDays(),
      });
      toast.success("Leave application submitted successfully!");
    }

    onOpenChange(false);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {leaveToEdit ? "Edit Leave Application" : "Leave Application"}
          </DialogTitle>
          <DialogDescription>
            {leaveToEdit
              ? `Updating request for ${leaveToEdit.employee}`
              : "Submit a new leave request. All fields marked with * are required."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Leave Details</CardTitle>
              <CardDescription>Specify your leave requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee *</Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) =>
                      updateFormData("employeeId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {useAppStore.getState().employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} ({emp.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type *</Label>
                  <Select
                    value={formData.leaveType}
                    onValueChange={(value) =>
                      updateFormData("leaveType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="maternity">Maternity Leave</SelectItem>
                      <SelectItem value="paternity">Paternity Leave</SelectItem>
                      <SelectItem value="study">Study Leave</SelectItem>
                      <SelectItem value="compassionate">
                        Compassionate Leave
                      </SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateFormData("startDate", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData("endDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Days</Label>
                  <div className="flex items-center justify-center h-10 px-3 py-2 border border-input bg-background rounded-md">
                    <span className="text-sm font-medium">
                      {calculateDays()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData("reason", e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Handover Details</CardTitle>
              <CardDescription>
                Specify who will handle your responsibilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reliever">Reliever/Substitute *</Label>
                <Input
                  id="reliever"
                  value={formData.reliever}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData("reliever", e.target.value)}
                  placeholder="Name of colleague who will cover your duties"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateFormData("emergencyContact", e.target.value)
                    }
                    placeholder="Contact person during leave"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateFormData("emergencyPhone", e.target.value)
                    }
                    placeholder="Phone number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {leaveToEdit ? "Update Application" : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
