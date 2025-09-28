import { AttendanceRecord, WorkLogEntry, Employee, Coordinates } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ErrorDetails {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  context?: any;
}

class ValidationService {
  private static instance: ValidationService;
  private errorLog: ErrorDetails[] = [];

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  // Employee validation
  public validateEmployee(employee: Partial<Employee>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!employee.employeeId?.trim()) {
      errors.push('Employee ID is required');
    } else if (!/^TRJ\d{3}$/.test(employee.employeeId)) {
      errors.push('Employee ID must be in format TRJ001');
    }

    if (!employee.name?.trim()) {
      errors.push('Employee name is required');
    } else if (employee.name.length < 2) {
      errors.push('Employee name must be at least 2 characters');
    }

    if (!employee.email?.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(employee.email)) {
      errors.push('Invalid email format');
    }

    if (!employee.department?.trim()) {
      errors.push('Department is required');
    }

    if (!employee.position?.trim()) {
      errors.push('Position is required');
    }

    // Working hours validation
    if (employee.workingHours) {
      if (!this.isValidTimeFormat(employee.workingHours.start)) {
        errors.push('Invalid start time format (use HH:MM)');
      }
      if (!this.isValidTimeFormat(employee.workingHours.end)) {
        errors.push('Invalid end time format (use HH:MM)');
      }
      if (employee.workingHours.start >= employee.workingHours.end) {
        errors.push('End time must be after start time');
      }
    }

    // Phone number validation
    if (employee.phoneNumber && !this.isValidPhoneNumber(employee.phoneNumber)) {
      warnings.push('Phone number format may be invalid');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Attendance record validation
  public validateAttendanceRecord(record: Partial<AttendanceRecord>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!record.employeeId?.trim()) {
      errors.push('Employee ID is required');
    }

    if (!record.date) {
      errors.push('Date is required');
    } else if (!this.isValidDate(record.date)) {
      errors.push('Invalid date format');
    }

    if (!record.clockInTime?.trim()) {
      errors.push('Clock in time is required');
    } else if (!this.isValidTimeFormat(record.clockInTime)) {
      errors.push('Invalid clock in time format');
    }

    // Clock out validation (optional but must be valid if provided)
    if (record.clockOutTime && !this.isValidTimeFormat(record.clockOutTime)) {
      errors.push('Invalid clock out time format');
    }

    // Location validation
    if (record.clockInLocation && !this.isValidCoordinates(record.clockInLocation)) {
      errors.push('Invalid clock in location coordinates');
    }

    if (record.clockOutLocation && !this.isValidCoordinates(record.clockOutLocation)) {
      errors.push('Invalid clock out location coordinates');
    }

    // Business logic validations
    if (record.clockInTime && record.clockOutTime) {
      if (record.clockInTime >= record.clockOutTime) {
        errors.push('Clock out time must be after clock in time');
      }

      const clockIn = new Date(`${record.date}T${record.clockInTime}`);
      const clockOut = new Date(`${record.date}T${record.clockOutTime}`);
      const duration = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

      if (duration > 24) {
        errors.push('Work duration cannot exceed 24 hours');
      }

      if (duration > 12) {
        warnings.push('Work duration exceeds 12 hours - please verify');
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Work log validation
  public validateWorkLog(log: Partial<WorkLogEntry>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!log.employeeId?.trim()) {
      errors.push('Employee ID is required');
    }

    if (!log.task?.trim()) {
      errors.push('Task description is required');
    } else if (log.task.length < 5) {
      errors.push('Task description must be at least 5 characters');
    } else if (log.task.length > 500) {
      errors.push('Task description must not exceed 500 characters');
    }

    if (!log.priority) {
      errors.push('Priority is required');
    }

    if (log.estimatedHours !== undefined && log.estimatedHours < 0) {
      errors.push('Estimated hours cannot be negative');
    }

    if (log.actualHours !== undefined && log.actualHours < 0) {
      errors.push('Actual hours cannot be negative');
    }

    if (log.estimatedHours !== undefined && log.estimatedHours > 24) {
      warnings.push('Estimated hours exceeds 24 - please verify');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Location validation
  public validateLocation(coords: Coordinates, allowedLocations: Coordinates[], radius: number = 100): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.isValidCoordinates(coords)) {
      errors.push('Invalid coordinates provided');
      return { isValid: false, errors, warnings };
    }

    if (coords.accuracy && coords.accuracy > 100) {
      warnings.push(`Location accuracy is ${Math.round(coords.accuracy)}m - may be imprecise`);
    }

    if (allowedLocations.length > 0) {
      const isWithinAllowedArea = allowedLocations.some(allowed => 
        this.calculateDistance(coords, allowed) <= radius
      );

      if (!isWithinAllowedArea) {
        errors.push('Location is outside authorized work areas');
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Business hours validation
  public validateBusinessHours(time: string, workingHours: { start: string; end: string }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.isValidTimeFormat(time)) {
      errors.push('Invalid time format');
      return { isValid: false, errors, warnings };
    }

    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(workingHours.start);
    const endMinutes = this.timeToMinutes(workingHours.end);

    if (timeMinutes < startMinutes) {
      const minutesEarly = startMinutes - timeMinutes;
      if (minutesEarly > 30) {
        warnings.push(`Clocking in ${minutesEarly} minutes early`);
      }
    }

    if (timeMinutes > startMinutes + 15) { // 15 minutes grace period
      const minutesLate = timeMinutes - startMinutes;
      warnings.push(`Late arrival: ${minutesLate} minutes after start time`);
    }

    if (timeMinutes > endMinutes) {
      const minutesOvertime = timeMinutes - endMinutes;
      warnings.push(`Overtime: ${minutesOvertime} minutes after end time`);
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Error logging
  public logError(code: string, message: string, severity: ErrorDetails['severity'], context?: any): void {
    const error: ErrorDetails = {
      code,
      message,
      severity,
      timestamp: new Date().toISOString(),
      context
    };

    this.errorLog.unshift(error);

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(0, 100);
    }

    // Log to console based on severity
    switch (severity) {
      case 'critical':
        console.error(`[CRITICAL] ${code}: ${message}`, context);
        break;
      case 'high':
        console.error(`[HIGH] ${code}: ${message}`, context);
        break;
      case 'medium':
        console.warn(`[MEDIUM] ${code}: ${message}`, context);
        break;
      case 'low':
        console.log(`[LOW] ${code}: ${message}`, context);
        break;
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('trijoshh_error_log', JSON.stringify(this.errorLog.slice(0, 50)));
    } catch (error) {
      console.error('Failed to store error log in localStorage');
    }
  }

  // Get error log
  public getErrorLog(): ErrorDetails[] {
    return [...this.errorLog];
  }

  // Clear error log
  public clearErrorLog(): void {
    this.errorLog = [];
    localStorage.removeItem('trijoshh_error_log');
  }

  // Sanitize user input
  public sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/[<>\"']/g, '') // Remove HTML characters
      .substring(0, 1000); // Limit length
  }

  // Helper methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  private isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }

  private isValidCoordinates(coords: Coordinates): boolean {
    return (
      typeof coords.latitude === 'number' &&
      typeof coords.longitude === 'number' &&
      coords.latitude >= -90 &&
      coords.latitude <= 90 &&
      coords.longitude >= -180 &&
      coords.longitude <= 180
    );
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1.latitude * Math.PI / 180;
    const φ2 = coord2.latitude * Math.PI / 180;
    const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
}

export default ValidationService;