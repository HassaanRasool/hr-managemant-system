"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { HRSidebar } from "@/components/layout/hr-sidebar";
import { HRHeader } from "@/components/layout/hr-header";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { EmployeeManagement } from "@/components/employees/employee-management";
import { LeaveManagement } from "@/components/leave/leave-management";
import { RecruitmentManagement } from "@/components/recruitment/recruitment-management";
import { PerformanceManagement } from "@/components/performance/performance-management";
import { JobManagement } from "@/components/jobs/job-management";
import { TrainingManagement } from "@/components/training/training-management";
import { DisciplinaryManagement } from "@/components/disciplinary/disciplinary-management";
import { EmployeeSeparation } from "@/components/separation/employee-separation";
import { ReportsManagement } from "@/components/reports/reports-management";
import { useAppStore } from "@/lib/store";

export function HRDashboard() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const initializeStore = useAppStore((state) => state.initializeStore);

  useEffect(() => {
    // Initial fetch
    initializeStore();

    // Set up Server-Sent Events for True Real-Time Updates
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === "db_updated") {
          console.log("Real-time update received! Refreshing store.");
          initializeStore();
        }
      } catch {
        // Ignore parsing errors for keep-alive messages
      }
    };

    return () => {
      eventSource.close();
    };
  }, [initializeStore]);

  const renderModuleContent = () => {
    switch (activeModule) {
      case "employees":
        return <EmployeeManagement />;
      case "leave":
      case "leave-requests":
        return (
          <LeaveManagement
            defaultView={
              activeModule === "leave-requests" ? "requests" : "overview"
            }
          />
        );
      case "recruitment":
        return <RecruitmentManagement />;
      case "performance":
        return <PerformanceManagement />;
      case "jobs":
        return <JobManagement />;
      case "training":
        return <TrainingManagement />;
      case "disciplinary":
        return <DisciplinaryManagement />;
      case "separation":
        return <EmployeeSeparation />;
      case "reports":
        return <ReportsManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <HRSidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <SidebarInset>
        <HRHeader />
        <div className="flex flex-1 flex-col mx-auto w-full max-w-[2000px] gap-4 p-4 md:p-6 lg:p-8">
          {renderModuleContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
