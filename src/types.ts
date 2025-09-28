export enum Role {
  Admin = 'ADMIN',
  Employee = 'EMPLOYEE',
  Manager = 'MANAGER',
  HR = 'HR'
}

export enum View {
  Dashboard = 'DASHBOARD',
  History = 'HISTORY',
  WorkLog = 'WORK_LOG',
  Profile = 'PROFILE',
  Reports = 'REPORTS'
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum AttendanceStatus {
  Present = 'PRESENT',
  Absent = 'ABSENT',
  Late = 'LATE',
  HalfDay = 'HALF_DAY',
  Leave = 'LEAVE'
}

export enum EmployeeStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  OnLeave = 'ON_LEAVE',
  Terminated = 'TERMINATED'
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface Employee {
  id: string;
  employeeId: string; // TRIJOSHH employee ID
  name: string;
  email: string;
  department: string;
  position: string;
  role: Role;
  status: EmployeeStatus;
  joinDate: string;
  password: string; // Added password field for authentication
  phoneNumber?: string;
  emergencyContact?: string;
  workingHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  allowedLocations?: Coordinates[]; // Geofenced work locations
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  clockInTime: string;
  clockInLocation: Coordinates | null;
  clockOutTime: string | null;
  clockOutLocation: Coordinates | null;
  employeeId: string;
  employeeName: string;
  status: AttendanceStatus;
  workingHours?: number; // calculated working hours
  breakTime?: number; // break time in minutes
  overtime?: number; // overtime in minutes
  notes?: string;
  isLocationValid?: boolean; // within allowed locations
  createdAt: string;
  updatedAt: string;
}

export interface WorkLogEntry {
  id: string;
  timestamp: string;
  task: string;
  description?: string;
  priority: Priority;
  employeeId: string;
  employeeName: string;
  category?: string;
  estimatedHours?: number;
  actualHours?: number;
  isCompleted: boolean;
  attachments?: string[]; // file paths or URLs
  createdAt: string;
  updatedAt: string;
}

export interface ShiftPattern {
  id: string;
  name: string; // e.g., "Morning Shift", "Night Shift"
  startTime: string;
  endTime: string;
  breakDuration: number; // in minutes
  isActive: boolean;
}

export interface LocationSettings {
  id: string;
  name: string; // e.g., "TRIJOSHH HQ", "Branch Office"
  coordinates: Coordinates;
  radius: number; // geofence radius in meters
  isActive: boolean;
}

export interface AppSettings {
  companyName: string;
  companyLogo?: string;
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  allowedCheckInRadius: number; // in meters
  requireLocationForCheckIn: boolean;
  allowOfflineMode: boolean;
  autoClockOutTime?: string; // HH:MM format
  gracePeriodMinutes: number; // late arrival grace period
  breakReminderEnabled: boolean;
  dataRetentionDays: number;
  backupEnabled: boolean;
  lastBackupDate?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  avgWorkingHours: number;
  totalWorkLogs: number;
  pendingTasks: number;
}

// Registration and email verification types
export interface PendingRegistration {
  id: string;
  type: 'employee' | 'admin';
  email: string;
  verificationCode: string;
  verificationCodeExpiry: string;
  formData: {
    name: string;
    email: string;
    department: string;
    position: string;
    phoneNumber?: string;
    emergencyContact?: string;
  };
  createdAt: string;
  isEmailVerified: boolean;
  attempts: number;
}

export interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  position: string;
  phoneNumber?: string;
  emergencyContact?: string;
  role: Role;
  workingHours: {
    start: string;
    end: string;
  };
}

export interface EmailVerificationResult {
  success: boolean;
  message: string;
  employee?: Employee;
}