"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut, FileText, CheckCircle, AlertCircle } from "lucide-react";

export function EmployeeSeparation() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Employee Separation
        </h2>
        <p className="text-muted-foreground">
          Manage employee offboarding, resignations, and terminations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Separations
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Exit Interviews
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clearance Pipeline
            </CardTitle>
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Awaiting IT/Admin</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Separation Management Features</CardTitle>
          <CardDescription>
            Comprehensive employee offboarding and separation system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Resignation Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Process resignations with automated workflows and approval
                chains.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Exit Interviews</h4>
              <p className="text-sm text-muted-foreground">
                Conduct and analyze exit interviews to improve retention
                strategies.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Clearance Checklists</h4>
              <p className="text-sm text-muted-foreground">
                Track IT, Admin, and Finance clearance processes for departing
                employees.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Final Settlements</h4>
              <p className="text-sm text-muted-foreground">
                Process final paychecks, leave encashment, and severance
                packages.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
