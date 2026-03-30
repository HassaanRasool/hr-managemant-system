import {
  Users,
  UserPlus,
  Calendar,
  Award,
  GraduationCap,
  AlertTriangle,
  LogOut,
  Building2,
  PieChart,
} from "lucide-react"

export const navigationItems = [
  {
    title: "Employee Management",
    items: [
      { title: "All Employees", icon: Users, id: "employees" },
      { title: "Job Management", icon: Building2, id: "jobs" },
      { title: "Recruitment", icon: UserPlus, id: "recruitment" },
    ],
  },
  {
    title: "Leave & Attendance",
    items: [
      { title: "Leave Management", icon: Calendar, id: "leave" },
    ],
  },
  {
    title: "Performance & Development",
    items: [
      { title: "Performance Management", icon: Award, id: "performance" },
      { title: "Training Management", icon: GraduationCap, id: "training" },
    ],
  },
  {
    title: "Administration",
    items: [
      { title: "Disciplinary Management", icon: AlertTriangle, id: "disciplinary" },
      { title: "Employee Separation", icon: LogOut, id: "separation" },
    ],
  },
  {
    title: "Reports & Analytics",
    items: [
      { title: "Data Export & Reports", icon: PieChart, id: "reports" },
    ],
  },
]
