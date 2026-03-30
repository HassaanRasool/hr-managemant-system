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
import { Appraisal } from "@/lib/store";
import { cn } from "@/lib/utils";

interface PerformanceDetailsDialogProps {
  appraisal: Appraisal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PerformanceDetailsDialog({
  appraisal,
  open,
  onOpenChange,
}: PerformanceDetailsDialogProps) {
  if (!appraisal) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      Completed: "default",
      Pending: "outline",
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

  // Removed getRatingStyle to avoid inline style warning

  const renderRating = (label: string, value: number) => (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full bg-primary transition-all duration-500",
              `w-[${(value / 5) * 100}%]`
            )}
          />
        </div>
        <span className="text-sm font-bold">{value.toFixed(1)}/5.0</span>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">Performance Review Details</DialogTitle>
              <DialogDescription>
                Review ID: {appraisal.id} • {appraisal.reviewPeriod}
              </DialogDescription>
            </div>
            {getStatusBadge(appraisal.status || "Pending")}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">Employee</h4>
              <p className="text-base font-medium">{appraisal.employee || "N/A"}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">Department</h4>
              <p className="text-base font-medium">{appraisal.department || "N/A"}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">Reviewer</h4>
              <p className="text-base font-medium">{appraisal.reviewer}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">Review Type</h4>
              <p className="text-base font-medium">{appraisal.reviewType}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-lg font-bold mb-3">Performance Ratings</h4>
            <div className="space-y-1">
              {renderRating("Overall Rating", (appraisal.score || 0) / 20)}
              {appraisal.qualityOfWork && renderRating("Quality of Work", appraisal.qualityOfWork[0] || (appraisal.score || 0) / 20)}
              {appraisal.productivity && renderRating("Productivity", appraisal.productivity[0] || (appraisal.score || 0) / 20)}
              {appraisal.communication && renderRating("Communication", appraisal.communication[0] || (appraisal.score || 0) / 20)}
              {appraisal.teamwork && renderRating("Teamwork", appraisal.teamwork[0] || (appraisal.score || 0) / 20)}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-muted-foreground mb-1">Goals</h4>
              <p className="text-sm bg-muted/50 p-3 rounded-md min-h-[60px]">
                {appraisal.goals || "No goals specified for this period."}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-muted-foreground mb-1">Key Achievements</h4>
              <p className="text-sm bg-muted/50 p-3 rounded-md min-h-[60px]">
                {appraisal.achievements || "No achievements recorded."}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-muted-foreground mb-1">Challenges & Areas for Growth</h4>
              <p className="text-sm bg-muted/50 p-3 rounded-md min-h-[60px]">
                {appraisal.challenges || "No challenges noted."}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-muted-foreground mb-1">Development Plan</h4>
              <p className="text-sm bg-muted/50 p-3 rounded-md min-h-[60px]">
                {appraisal.developmentPlan || "No development plan defined."}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-muted-foreground mb-1">Additional Comments</h4>
              <p className="text-sm italic bg-muted/50 p-3 rounded-md min-h-[60px]">
                {appraisal.comments || "No additional comments."}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
