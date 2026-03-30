CREATE DATABASE IF NOT EXISTS `hr_management`;
USE `hr_management`;
CREATE TABLE `users` (
    `id` VARCHAR(191) PRIMARY KEY,
    `email` VARCHAR(191) UNIQUE NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'staff',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(191) PRIMARY KEY,
    `token` VARCHAR(500) UNIQUE NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
CREATE TABLE `Employee` (
    `id` VARCHAR(191) PRIMARY KEY,
    `employee_id` VARCHAR(191) UNIQUE NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) UNIQUE NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `manager` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `status` ENUM('Active', 'On_Leave', 'Inactive') NOT NULL,
    `basic_salary` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);
CREATE TABLE `LeaveRequest` (
    `id` VARCHAR(191) PRIMARY KEY,
    `employee_id` VARCHAR(191) NOT NULL,
    `leave_type` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `days` INT NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL,
    `reliever` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`employee_id`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT
);
CREATE TABLE `JobPosting` (
    `id` VARCHAR(191) PRIMARY KEY,
    `title` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `location` ENUM('Remote', 'Office', 'Hybrid') NOT NULL,
    `type` ENUM(
        'Full-time',
        'Part-time',
        'Contract',
        'Internship'
    ) NOT NULL,
    `status` ENUM('Active', 'Closed', 'Draft') NOT NULL DEFAULT 'Draft',
    `level` ENUM('Entry', 'Mid', 'Senior', 'Lead', 'Executive') NOT NULL,
    `posted` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `salaryMin` INT NOT NULL,
    `salaryMax` INT NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
    `description` TEXT NULL,
    `requirements` JSON NOT NULL,
    `benefits` JSON NOT NULL,
    `responsibilities` JSON NOT NULL,
    `applicationDeadline` DATETIME(3) NOT NULL,
    `contactEmail` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);
CREATE TABLE `Application` (
    `id` VARCHAR(191) PRIMARY KEY,
    `jobId` VARCHAR(191) NOT NULL,
    `applicantId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `appliedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`jobId`) REFERENCES `JobPosting`(`id`) ON DELETE CASCADE
);
CREATE TABLE `PerformanceReview` (
    `id` VARCHAR(191) PRIMARY KEY,
    `employee_id` VARCHAR(191) NOT NULL,
    `reviewer_id` VARCHAR(191) NOT NULL,
    `review_period` VARCHAR(191) NOT NULL,
    `review_type` VARCHAR(191) NOT NULL,
    `overall_rating` INT NOT NULL,
    `goals` TEXT NOT NULL,
    `achievements` TEXT NOT NULL,
    `development_plan` TEXT NOT NULL,
    `status` ENUM('Draft', 'In_Progress', 'Completed') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`employee_id`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`reviewer_id`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT
);
CREATE TABLE `TrainingProgram` (
    `id` VARCHAR(191) PRIMARY KEY,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `duration_hours` INT NOT NULL,
    `max_participants` INT NOT NULL,
    `budget_allocated` DOUBLE NOT NULL,
    `trainer_name` VARCHAR(191) NULL,
    `trainer_email` VARCHAR(191) NULL,
    `is_external` BOOLEAN NOT NULL DEFAULT 0,
    `status` ENUM('Draft', 'Active', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);
CREATE TABLE `TrainingSession` (
    `id` VARCHAR(191) PRIMARY KEY,
    `program_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `max_participants` INT NOT NULL,
    `cost_per_participant` DOUBLE NOT NULL,
    `status` ENUM(
        'Scheduled',
        'In_Progress',
        'Completed',
        'Cancelled'
    ) NOT NULL DEFAULT 'Scheduled',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`program_id`) REFERENCES `TrainingProgram`(`id`) ON DELETE CASCADE
);
CREATE TABLE `TrainingEnrollment` (
    `id` VARCHAR(191) PRIMARY KEY,
    `employee_id` VARCHAR(191) NOT NULL,
    `program_id` VARCHAR(191) NOT NULL,
    `session_id` VARCHAR(191) NULL,
    `enrollment_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM(
        'Enrolled',
        'In_Progress',
        'Completed',
        'Dropped',
        'No_Show'
    ) NOT NULL DEFAULT 'Enrolled',
    `completion_date` DATETIME(3) NULL,
    `certificate_issued` BOOLEAN NOT NULL DEFAULT 0,
    `feedback_rating` INT NULL,
    `feedback_comments` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (`employee_id`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`program_id`) REFERENCES `TrainingProgram`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`session_id`) REFERENCES `TrainingSession`(`id`) ON DELETE
    SET NULL,
        UNIQUE (`employee_id`, `program_id`, `session_id`)
);