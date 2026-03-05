import type { JobPosting as DBJobPosting } from "@/types/db"

export type Job = {
  id: string
  title: string
  department: string
  location: JobLocation
  type: JobType
  status: JobStatus
  level: JobLevel
  applicants: number
  posted: string
  salaryMin: number
  salaryMax: number
  currency: string
  description?: string
  requirements?: string[]
  benefits?: string[]
  responsibilities: string[]
  applicationDeadline: string
  contactEmail: string
}

export type JobPosting = Omit<Job, 'applicants'> & {
  posted: Date | string
  applicationDeadline: Date | string
}

export type JobPostingWithRelations = JobPosting & {
  _count: {
    applications: number
  }
}

export type JobPostingCreateData = Omit<JobPosting, 'id' | 'posted'> & {
  posted?: string | Date
  applicationDeadline: string | Date
  description?: string
}

export type JobPostingUpdateData = Partial<Omit<JobPosting, 'id'>> & {
  posted?: string | Date
  applicationDeadline?: string | Date
}

export type JobStatus = 'Active' | 'Closed' | 'Draft'
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
export type JobLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive'
export type JobLocation = 'Remote' | 'Office' | 'Hybrid'

// Helper type to convert DB JobPosting to frontend Job type
export type JobFromDB = Omit<DBJobPosting, 'posted' | 'applicationDeadline' | 'created_at' | 'updated_at'> & {
  posted: string
  applicationDeadline: string
  applicants: number
}

// Keeping the old name backward-compatible just in case it's used elsewhere
export type JobFromPrisma = JobFromDB