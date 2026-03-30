"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeReport } from "./employee-report";
import { LeaveReport } from "./leave-report";

export function ReportsManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports & Data Export</h2>
        <p className="text-muted-foreground">
          Advanced filtering and extraction tools for your organizational data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Analyzer</CardTitle>
          <CardDescription>Select a dataset below to begin extracting insights</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="employees" className="w-full">
            <TabsList className="grid w-full lg:w-1/2 grid-cols-2 mb-4">
              <TabsTrigger value="employees">Employee Directory Report</TabsTrigger>
              <TabsTrigger value="leaves">Leave Requests Report</TabsTrigger>
            </TabsList>
            <TabsContent value="employees">
              <EmployeeReport />
            </TabsContent>
            <TabsContent value="leaves">
              <LeaveReport />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
