// app/dashboard/page.tsx
import { HRDashboard } from "@/components/dashboard/hr-dashboard";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <HRDashboard />
    </ProtectedRoute>
  );
}
