import { create } from "zustand";
import { Employee, LeaveRequest, sampleEmployees, sampleLeaveRequests } from "./sample-data";
import { Job, JobLocation, JobType, JobStatus, JobLevel } from "@/types";



export interface Training {
  id: string;
  title: string;
  type: string;
  provider: string;
  trainer: string;
  department: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  maxParticipants: string;
  cost: string;
  currency: string;
  description: string;
  objectives: string;
  prerequisites: string;
  materials: string;
  isInternal: boolean;
  isMandatory: boolean;
  certificateProvided: boolean;
  selectedEmployees: string[];
}

export interface Appraisal {
  id: string;
  employeeId: string;
  reviewPeriod: string;
  reviewType: string;
  reviewer: string;
  goals: string;
  achievements: string;
  challenges: string;
  developmentPlan: string;
  overallRating: number[];
  qualityOfWork: number[];
  productivity: number[];
  communication: number[];
  teamwork: number[];
  leadership: number[];
  comments: string;
  status?: string;
  employee?: string;
  department?: string;
  score?: number;
}


export interface AppState {
  // Data
  employees: Employee[];
  leaves: LeaveRequest[];
  jobs: Job[];
  trainings: Training[];
  appraisals: Appraisal[];

  // Actions
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  addLeave: (leave: LeaveRequest) => void;
  updateLeave: (id: string, updates: Partial<LeaveRequest>) => void;

  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;

  addTraining: (training: Training) => void;
  
  addAppraisal: (appraisal: Appraisal) => void;
  updateAppraisal: (id: string, updates: Partial<Appraisal>) => void;
  
  initializeStore: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  // Initialize with sample data where available
  employees: [...sampleEmployees],
  leaves: [...sampleLeaveRequests],
  
  // Initialize others empty for demo
  jobs: [
    {
      id: "JOB001",
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote" as JobLocation,
      type: "Full-time" as JobType,
      status: "Active" as JobStatus,
      level: "Senior" as JobLevel,
      applicants: 12,
      posted: "2024-03-01",
      salaryMin: 120000,
      salaryMax: 160000,
      currency: "USD",
      responsibilities: [],
      applicationDeadline: "2024-04-01",
      contactEmail: "hr@company.com",
    },
    {
      id: "JOB002",
      title: "HR Business Partner",
      department: "Human Resources",
      location: "Office" as JobLocation,
      type: "Full-time" as JobType,
      status: "Active" as JobStatus,
      level: "Mid" as JobLevel,
      applicants: 5,
      posted: "2024-03-10",
      salaryMin: 80000,
      salaryMax: 110000,
      currency: "USD",
      responsibilities: [],
      applicationDeadline: "2024-04-10",
      contactEmail: "hr@company.com",
    }
  ],
  trainings: [],
  appraisals: [],

  // Action Implementations
  addEmployee: async (employee) => {
    set((state) => ({ employees: [...state.employees, employee] }));
    try {
      // Map frontend Employee to backend Employee API expected format
      const [firstName, ...lastNameParts] = employee.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employee.id,
          first_name: firstName,
          last_name: lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
          phone: "000-000-0000",
          position: employee.position,
          department: employee.department,
          manager: "Admin",
          start_date: employee.joinDate || new Date().toISOString(),
          basic_salary: 50000
        }),
      });
    } catch (error) {
      console.error("Failed to persist employee:", error);
    }
  },

  updateEmployee: async (id, updates) => {
    set((state) => ({
      employees: state.employees.map((emp) =>
        emp.id === id ? { ...emp, ...updates } : emp
      ),
    }));
    try {
      await fetch(`/api/employees/${id}`, {
        method: 'PUT', // Route uses PUT for updates
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Failed to update employee:", error);
    }
  },

  deleteEmployee: async (id) => {
    set((state) => ({
      employees: state.employees.filter((emp) => emp.id !== id),
    }));
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Failed to delete employee:", error);
    }
  },

  addLeave: async (leave) => {
    set((state) => ({ leaves: [...state.leaves, leave] }));
    try {
      await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leave.id,
          employee_id: leave.employeeId,
          leave_type: leave.type,
          start_date: leave.startDate,
          end_date: leave.endDate,
          days: leave.days,
          reason: leave.reason,
          reliever: leave.reliever
        }),
      });
    } catch (error) {
      console.error("Failed to persist leave:", error);
    }
  },

  updateLeave: async (id, updates) => {
    set((state) => ({
      leaves: state.leaves.map((leave) =>
        leave.id === id ? { ...leave, ...updates } : leave
      ),
    }));
    try {
      const payload: Record<string, string | number> = {};
      if (updates.employeeId) payload.employee_id = updates.employeeId;
      if (updates.type) payload.leave_type = updates.type;
      if (updates.startDate) payload.start_date = updates.startDate;
      if (updates.endDate) payload.end_date = updates.endDate;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.reason !== undefined) payload.reason = updates.reason;
      if (updates.reliever !== undefined) payload.reliever = updates.reliever;
      if (updates.days !== undefined) payload.days = updates.days;

      await fetch(`/api/leave/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Failed to update leave:", error);
    }
  },

  addJob: async (job) => {
    set((state) => ({ jobs: [...state.jobs, job] }));
    try {
       await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      });
    } catch (error) {
      console.error("Failed to persist job:", error);
    }
  },

  updateJob: async (id, updates) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id ? { ...job, ...updates } : job
      ),
    }));
    try {
      await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Failed to update job:", error);
    }
  },

  addTraining: async (training) => {
    set((state) => ({ trainings: [...state.trainings, training] }));
    try {
      await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(training),
      });
    } catch (error) {
      console.error("Failed to persist training:", error);
    }
  },

  addAppraisal: async (appraisal) => {
    set((state) => ({ appraisals: [...state.appraisals, appraisal] }));
    try {
      await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appraisal.id,
          employee_id: appraisal.employeeId,
          review_period: appraisal.reviewPeriod,
          review_type: appraisal.reviewType,
          overall_rating: appraisal.overallRating[0] || 0,
          goals: appraisal.goals,
          achievements: appraisal.achievements,
          development_plan: appraisal.developmentPlan,
          status: appraisal.status || 'Completed'
        }),
      });
    } catch (error) {
      console.error("Failed to persist appraisal:", error);
    }
  },

  updateAppraisal: async (id, updates) => {
    set((state) => ({
      appraisals: state.appraisals.map((appraisal) =>
        appraisal.id === id ? { ...appraisal, ...updates } : appraisal
      ),
    }));
    try {
      await fetch(`/api/performance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Failed to update appraisal:", error);
    }
  },

  initializeStore: async () => {
    try {
      const [empRes, leaveRes, perfRes, jobRes, trainRes] = await Promise.all([
        fetch('/api/employees?limit=1000'),
        fetch('/api/leave'),
        fetch('/api/performance'),
        fetch('/api/jobs'),
        fetch('/api/training')
      ]);
      
      if (empRes.ok) {
        const { employees } = await empRes.json();
        interface DBEmployee {
          id: string; first_name: string; last_name: string; position: string;
          department: string; status: string; start_date: string; email: string;
        }
        const mappedEmployees = employees.map((e: DBEmployee) => ({
          id: e.id,
          name: `${e.first_name || ""} ${e.last_name || ""}`.trim(),
          position: e.position || "Unspecified",
          department: e.department || "Unspecified",
          status: e.status === 'On_Leave' ? 'On Leave' : (e.status || "Active"),
          joinDate: e.start_date ? new Date(e.start_date).toLocaleDateString() : "Unknown",
          email: e.email || ""
        }));
        set({ employees: mappedEmployees });
      }
      
      if (leaveRes.ok) {
        const leaves = await leaveRes.json();
        set({ leaves });
      }

      if (perfRes.ok) {
        const appraisals = await perfRes.json();
        set({ appraisals });
      }

      if (jobRes.ok) {
        const jobs = await jobRes.json();
        set({ jobs });
      }

      if (trainRes.ok) {
        const trainingsRaw = await trainRes.json();
        interface DBTraining {
          id: string; title: string; location: string; start_date: string;
          end_date: string; max_participants: number; cost_per_participant: number;
        }
        const mappedTrainings = trainingsRaw.map((t: DBTraining) => ({
          id: t.id,
          title: t.title,
          type: "Internal",
          provider: "Company",
          trainer: "Internal",
          department: "Various",
          location: t.location,
          startDate: t.start_date,
          endDate: t.end_date,
          startTime: "09:00",
          endTime: "17:00",
          maxParticipants: t.max_participants.toString(),
          cost: t.cost_per_participant.toString(),
          currency: "USD",
          description: "",
          objectives: "",
          prerequisites: "",
          materials: "",
          isInternal: true,
          isMandatory: false,
          certificateProvided: true,
          selectedEmployees: []
        }));
        set({ trainings: mappedTrainings });
      }
    } catch (error) {
      console.error("Failed to initialize store:", error);
    }
  }
}));
