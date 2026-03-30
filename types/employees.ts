import type { Employee } from "@/types/db"

export type EmployeeWithManager = Employee & {
  manager?: Employee | null
}

export type EmployeeWithDirectReports = Employee & {
  directReports?: Employee[]
}

export type EmployeeWithRelations = Employee & {
  manager?: Employee | null
  directReports?: Employee[]
}

export type EmployeeCreateData = Omit<Employee, 'id' | 'created_at' | 'updated_at'>
export type EmployeeUpdateData = Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>