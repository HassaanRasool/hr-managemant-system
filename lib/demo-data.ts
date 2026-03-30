export interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'hr_manager' | 'hr_staff' | 'employee';
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "admin@company.com",
    password: "password123",
    name: "System Admin",
    role: "admin",
    description: "Full system access with all management rights."
  },
  {
    email: "hr@company.com",
    password: "password123",
    name: "HR Manager",
    role: "hr_manager",
    description: "Management access for recruitment and employees."
  },
  {
    email: "staff@company.com",
    password: "password123",
    name: "HR Staff",
    role: "hr_staff",
    description: "Standard access for processing data."
  },
  {
    email: "employee@company.com",
    password: "password123",
    name: "Standard Employee",
    role: "employee",
    description: "Limited access to personal details and leave requests."
  }
];
