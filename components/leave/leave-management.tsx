"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, FileText, Users } from "lucide-react";
import { LeaveRequestsTable } from "./leave-requests-table";
import { LeaveApplicationDialog } from "./leave-application-dialog";

interface LeaveManagementProps {
  defaultView?: "overview" | "requests";
}

export function LeaveManagement({
  defaultView = "overview",
}: LeaveManagementProps) {
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Leave Management
          </h2>
          <p className="text-muted-foreground">
            Manage employee leave requests and entitlements
          </p>
        </div>
        <Button onClick={() => setShowApplicationDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Leave Request
        </Button>
      </div>

      <Tabs defaultValue={defaultView} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Requests
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Approved This Month
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Employees on Leave
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Currently away</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Leave Days
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18.5</div>
                <p className="text-xs text-muted-foreground">
                  Per employee/year
                </p>
              </CardContent>
            </Card>
          </div>
          <LeaveRequestsTable searchTerm="" />
        </TabsContent>
        <TabsContent value="requests" className="space-y-4">
          <LeaveRequestsTable searchTerm="" />
        </TabsContent>
      </Tabs>

      <LeaveApplicationDialog
        open={showApplicationDialog}
        onOpenChange={setShowApplicationDialog}
      />
    </div>
  );
}
