import { 
  PendingRegistration, 
  RegistrationFormData, 
  EmailVerificationResult, 
  Employee, 
  Role, 
  EmployeeStatus 
} from '../types';
import EmailService from './emailService';
import EmployeeService from './employeeService';
import ValidationService from './validationService';

class RegistrationService {
  private static instance: RegistrationService;
  private pendingRegistrations: PendingRegistration[] = [];
  private emailService: EmailService;
  private employeeService: EmployeeService;
  private validationService: ValidationService;

  private constructor() {
    this.emailService = EmailService.getInstance();
    this.employeeService = EmployeeService.getInstance();
    this.validationService = ValidationService.getInstance();
    this.loadPendingRegistrations();
  }

  public static getInstance(): RegistrationService {
    if (!RegistrationService.instance) {
      RegistrationService.instance = new RegistrationService();
    }
    return RegistrationService.instance;
  }

  private loadPendingRegistrations(): void {
    const saved = localStorage.getItem('trijoshh_pending_registrations');
    if (saved) {
      this.pendingRegistrations = JSON.parse(saved);
    }
  }

  private savePendingRegistrations(): void {
    localStorage.setItem('trijoshh_pending_registrations', JSON.stringify(this.pendingRegistrations));
  }

  private generateEmployeeId(): string {
    const existingEmployees = this.employeeService.getAllEmployees();
    const existingIds = existingEmployees.map(emp => emp.employeeId);
    
    let nextNumber = 1;
    let newId = '';
    
    do {
      const paddedNumber = nextNumber.toString().padStart(3, '0');
      newId = `TRJ${paddedNumber}`;
      nextNumber++;
    } while (existingIds.includes(newId));
    
    return newId;
  }

  private generateVerificationCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  public async initiateRegistration(formData: RegistrationFormData): Promise<{
    success: boolean;
    message: string;
    registrationId?: string;
  }> {
    try {
      // Validate form data
      const validation = this.validateRegistrationData(formData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join(', ')
        };
      }

      // Check if email already exists
      const existingEmployee = this.employeeService.getEmployeeByEmail(formData.email);
      if (existingEmployee) {
        return {
          success: false,
          message: 'An account with this email already exists'
        };
      }

      // Check if there's already a pending registration for this email
      const existingPending = this.pendingRegistrations.find(
        reg => reg.email === formData.email && !reg.isEmailVerified
      );
      if (existingPending) {
        return {
          success: false,
          message: 'A registration is already pending for this email. Please check your email or try again in 15 minutes.'
        };
      }

      // Create pending registration
      const verificationCode = this.generateVerificationCode();
      const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      const pendingRegistration: PendingRegistration = {
        id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: formData.role === Role.Admin ? 'admin' : 'employee',
        email: formData.email,
        verificationCode,
        verificationCodeExpiry: expiryTime.toISOString(),
        formData: {
          name: formData.name,
          email: formData.email,
          department: formData.department,
          position: formData.position,
          phoneNumber: formData.phoneNumber,
          emergencyContact: formData.emergencyContact
        },
        createdAt: new Date().toISOString(),
        isEmailVerified: false,
        attempts: 0
      };

      // Store the full form data temporarily (including password)
      sessionStorage.setItem(`reg_${pendingRegistration.id}`, JSON.stringify(formData));

      this.pendingRegistrations.push(pendingRegistration);
      this.savePendingRegistrations();

      // Send verification email
      const emailSent = await this.emailService.sendVerificationEmail(
        formData.email,
        verificationCode,
        formData.name,
        pendingRegistration.type
      );

      if (!emailSent) {
        return {
          success: false,
          message: 'Failed to send verification email. Please try again.'
        };
      }

      return {
        success: true,
        message: 'Registration initiated successfully. Please check your email for the verification code.',
        registrationId: pendingRegistration.id
      };

    } catch (error) {
      console.error('Error initiating registration:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  }

  public async verifyEmailAndCompleteRegistration(
    registrationId: string,
    verificationCode: string
  ): Promise<EmailVerificationResult> {
    try {
      const pendingRegistration = this.pendingRegistrations.find(reg => reg.id === registrationId);
      
      if (!pendingRegistration) {
        return {
          success: false,
          message: 'Invalid registration ID'
        };
      }

      // Check if already verified
      if (pendingRegistration.isEmailVerified) {
        return {
          success: false,
          message: 'Email already verified'
        };
      }

      // Check if expired
      const now = new Date();
      const expiry = new Date(pendingRegistration.verificationCodeExpiry);
      if (now > expiry) {
        this.removePendingRegistration(registrationId);
        return {
          success: false,
          message: 'Verification code has expired. Please start the registration process again.'
        };
      }

      // Check attempts
      if (pendingRegistration.attempts >= 3) {
        this.removePendingRegistration(registrationId);
        return {
          success: false,
          message: 'Maximum verification attempts exceeded. Please start the registration process again.'
        };
      }

      // Verify code
      if (pendingRegistration.verificationCode !== verificationCode.toUpperCase()) {
        pendingRegistration.attempts++;
        this.savePendingRegistrations();
        
        return {
          success: false,
          message: `Invalid verification code. ${3 - pendingRegistration.attempts} attempts remaining.`
        };
      }

      // Get the full form data from session storage
      const fullFormData = sessionStorage.getItem(`reg_${registrationId}`);
      if (!fullFormData) {
        return {
          success: false,
          message: 'Registration data expired. Please start the registration process again.'
        };
      }

      const formData: RegistrationFormData = JSON.parse(fullFormData);

      // Create the employee account
      const newEmployee = await this.createEmployeeAccount(formData);
      
      if (!newEmployee) {
        return {
          success: false,
          message: 'Failed to create employee account. Please contact support.'
        };
      }

      // Mark as verified and clean up
      pendingRegistration.isEmailVerified = true;
      this.removePendingRegistration(registrationId);
      sessionStorage.removeItem(`reg_${registrationId}`);

      // Send welcome email
      await this.emailService.sendWelcomeEmail(newEmployee);

      return {
        success: true,
        message: 'Email verified and account created successfully! You can now log in.',
        employee: newEmployee
      };

    } catch (error) {
      console.error('Error verifying email:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during verification. Please try again.'
      };
    }
  }

  private async createEmployeeAccount(formData: RegistrationFormData): Promise<Employee | null> {
    try {
      const employeeId = this.generateEmployeeId();
      
      const newEmployee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> = {
        employeeId,
        name: this.validationService.sanitizeInput(formData.name),
        email: formData.email.toLowerCase(),
        department: this.validationService.sanitizeInput(formData.department),
        position: this.validationService.sanitizeInput(formData.position),
        role: formData.role,
        status: EmployeeStatus.Active,
        joinDate: new Date().toISOString().split('T')[0],
        password: formData.password, // In production, this should be hashed
        phoneNumber: formData.phoneNumber,
        emergencyContact: formData.emergencyContact,
        workingHours: formData.workingHours,
        allowedLocations: [
          // Default to company HQ - can be updated later by admin
          { latitude: 28.6139, longitude: 77.2090, accuracy: 100 }
        ]
      };

      return this.employeeService.addEmployee(newEmployee);
    } catch (error) {
      console.error('Error creating employee account:', error);
      return null;
    }
  }

  public async resendVerificationCode(registrationId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const pendingRegistration = this.pendingRegistrations.find(reg => reg.id === registrationId);
      
      if (!pendingRegistration) {
        return {
          success: false,
          message: 'Invalid registration ID'
        };
      }

      if (pendingRegistration.isEmailVerified) {
        return {
          success: false,
          message: 'Email already verified'
        };
      }

      // Generate new code and extend expiry
      const newVerificationCode = this.generateVerificationCode();
      const newExpiryTime = new Date(Date.now() + 15 * 60 * 1000);

      pendingRegistration.verificationCode = newVerificationCode;
      pendingRegistration.verificationCodeExpiry = newExpiryTime.toISOString();
      pendingRegistration.attempts = 0; // Reset attempts
      
      this.savePendingRegistrations();

      // Send new verification email
      const emailSent = await this.emailService.sendVerificationEmail(
        pendingRegistration.email,
        newVerificationCode,
        pendingRegistration.formData.name,
        pendingRegistration.type
      );

      if (!emailSent) {
        return {
          success: false,
          message: 'Failed to send verification email. Please try again.'
        };
      }

      return {
        success: true,
        message: 'New verification code sent successfully. Please check your email.'
      };

    } catch (error) {
      console.error('Error resending verification code:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  }

  private removePendingRegistration(registrationId: string): void {
    this.pendingRegistrations = this.pendingRegistrations.filter(reg => reg.id !== registrationId);
    this.savePendingRegistrations();
  }

  private validateRegistrationData(formData: RegistrationFormData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Basic validation
    if (!formData.name?.trim()) {
      errors.push('Name is required');
    } else if (formData.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (!formData.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Invalid email format');
    }

    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (!formData.department?.trim()) {
      errors.push('Department is required');
    }

    if (!formData.position?.trim()) {
      errors.push('Position is required');
    }

    if (!formData.role) {
      errors.push('Role is required');
    }

    // Working hours validation
    if (!formData.workingHours.start || !formData.workingHours.end) {
      errors.push('Working hours are required');
    } else if (formData.workingHours.start >= formData.workingHours.end) {
      errors.push('End time must be after start time');
    }

    // Phone number validation (optional)
    if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Utility methods
  public getPendingRegistrations(): PendingRegistration[] {
    return [...this.pendingRegistrations];
  }

  public cleanupExpiredRegistrations(): void {
    const now = new Date();
    this.pendingRegistrations = this.pendingRegistrations.filter(reg => {
      const expiry = new Date(reg.verificationCodeExpiry);
      return now <= expiry || reg.isEmailVerified;
    });
    this.savePendingRegistrations();
  }
}

export default RegistrationService;