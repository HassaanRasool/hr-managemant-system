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
import { MoreHorizontal, Eye, Edit, FileText } from "lucide-react";
import { PerformanceDetailsDialog } from "./performance-details-dialog";
import { Appraisal, useAppStore, AppState } from "@/lib/store";
import { useAuth } from "@/lib/auth-store";
import { CreateAppraisalDialog } from "./create-appraisal-dialog";

interface PerformanceTableProps {
  searchTerm?: string;
}

export function PerformanceTable({ searchTerm }: PerformanceTableProps) {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "hr_manager";
  const appraisals = useAppStore((state: AppState) => state.appraisals);
  const employees = useAppStore((state: AppState) => state.employees);
  const [selectedReview, setSelectedReview] = useState<Appraisal | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Map Zustand appraisals to the format expected by the table
  const mappedAppraisals = appraisals.map((appraisal) => {
    const employee = employees.find((emp) => emp.id === appraisal.employeeId);
    // Simple average calculation for demo purposes
    const averageScore = Math.round(
      (appraisal.overallRating.reduce((a, b) => a + b, 0) /
        appraisal.overallRating.length) *
        10 +
        60,
    );

    let status = "Needs Improvement";
    if (averageScore >= 90) status = "Excellent";
    else if (averageScore >= 75) status = "Good";
    else if (averageScore >= 65) status = "Average";

    return {
      id: appraisal.id,
      employeeId: appraisal.employeeId,
      employee: employee ? employee.name : "Unknown",
      department: employee ? employee.department : "Unknown",
      reviewDate: "Pending", // Usually comes from a separate field
      reviewer: appraisal.reviewer,
      score: averageScore,
      status: status,
      reviewPeriod: appraisal.reviewPeriod, // Added for consistency
      reviewType: appraisal.reviewType, // Added for consistency
    };
  });

  const allPerformanceData = mappedAppraisals;

  const filteredData = allPerformanceData.filter((record) => {
    const search = (searchTerm ?? "").toLowerCase();

    return (
      (record.employee || "").toLowerCase().includes(search) ||
      (record.department || "").toLowerCase().includes(search)
    );
  });

  if (!mounted) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      Completed: "default",
      "In Progress": "secondary",
      Pending: "outline",
      Overdue: "destructive",
      Excellent: "default",
      Good: "secondary",
      Average: "outline",
      "Needs Improvement": "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status}
      </Badge>
    );
  };

  const handleViewDetails = (review: Partial<Appraisal> & { id: string }) => {
    // Find the original appraisal data to get ratings, goals etc.
    const originalAppraisal = appraisals.find((a) => a.id === review.id);

    setSelectedReview({
      ...review,
      ...originalAppraisal,
    } as Appraisal);
    setIsDetailsOpen(true);
  };

  const handleEditReview = (review: Partial<Appraisal> & { id: string }) => {
    const originalAppraisal = appraisals.find((a) => a.id === review.id);

    setSelectedReview({
      ...review,
      ...originalAppraisal,
    } as Appraisal);
    setIsEditOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Performance Reviews</CardTitle>
          <CardDescription>
            Track employee performance appraisals and reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Review ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((review) => {
                  const status = review.score > 0 ? "Completed" : "Pending";
                  const score =
                    review.score > 0 ? (review.score / 20).toFixed(1) : 0;

                  return (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.id}</TableCell>
                      <TableCell>{review.employee}</TableCell>
                      <TableCell>{review.reviewPeriod}</TableCell>
                      <TableCell>{review.reviewType}</TableCell>
                      <TableCell>{getStatusBadge(status)}</TableCell>
                      <TableCell>
                        {review.score > 0 ? (
                          <span className="font-medium">{score}/5.0</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{review.reviewer}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(review)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {canManage && (
                              <DropdownMenuItem
                                onClick={() => handleEditReview(review)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Review
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Generate Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <PerformanceDetailsDialog
        appraisal={selectedReview}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
      <CreateAppraisalDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        appraisalToEdit={selectedReview || undefined}
      />
    </>
  );
}
