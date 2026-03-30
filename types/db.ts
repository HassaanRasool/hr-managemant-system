export interface User {
  id: string;
  email: string;
  password: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export type EmployeeStatus = 'Active' | 'On_Leave' | 'Inactive';

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  manager: string;
  start_date: Date;
  status: EmployeeStatus;
  basic_salary: number;
  created_at: Date;
  updated_at: Date;
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: Date;
  end_date: Date;
  days: number;
  reason: string;
  status: LeaveStatus;
  reliever: string;
  created_at: Date;
  updated_at: Date;
}

export type JobStatus = 'Active' | 'Closed' | 'Draft';
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type JobLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
export type JobLocation = 'Remote' | 'Office' | 'Hybrid';

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: JobLocation;
  type: JobType;
  status: JobStatus;
  level: JobLevel;
  posted: Date;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  description: string | null;
  requirements: string[]; // JSON array in DB
  benefits: string[]; // JSON array in DB
  responsibilities: string[]; // JSON array in DB
  applicationDeadline: Date;
  contactEmail: string;
  created_at: Date;
  updated_at: Date;
}

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  status: string;
  appliedAt: Date;
}

export type ReviewStatus = 'Draft' | 'In_Progress' | 'Completed';

export interface PerformanceReview {
  id: string;
  employee_id: string;
  reviewer_id: string;
  review_period: string;
  review_type: string;
  overall_rating: number;
  goals: string;
  achievements: string;
  development_plan: string;
  status: ReviewStatus;
  created_at: Date;
  updated_at: Date;
}

export type TrainingStatus = 'Draft' | 'Active' | 'Completed' | 'Cancelled';

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_hours: number;
  max_participants: number;
  budget_allocated: number;
  trainer_name: string | null;
  trainer_email: string | null;
  is_external: boolean;
  status: TrainingStatus;
  created_at: Date;
  updated_at: Date;
}

export type SessionStatus = 'Scheduled' | 'In_Progress' | 'Completed' | 'Cancelled';

export interface TrainingSession {
  id: string;
  program_id: string;
  title: string;
  start_date: Date;
  end_date: Date;
  location: string;
  max_participants: number;
  cost_per_participant: number;
  status: SessionStatus;
  created_at: Date;
  updated_at: Date;
}

export type EnrollmentStatus = 'Enrolled' | 'In_Progress' | 'Completed' | 'Dropped' | 'No_Show';

export interface TrainingEnrollment {
  id: string;
  employee_id: string;
  program_id: string;
  session_id: string | null;
  enrollment_date: Date;
  status: EnrollmentStatus;
  completion_date: Date | null;
  certificate_issued: boolean;
  feedback_rating: number | null;
  feedback_comments: string | null;
  created_at: Date;
  updated_at: Date;
}
