import { Employee, Role, EmployeeStatus, Coordinates } from '../types';

// TRIJOSHH Employee Database
export const TRIJOSHH_EMPLOYEES: Employee[] = [
  {
    id: 'emp001',
    employeeId: 'TRJ001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@trijoshh.com',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    role: Role.Employee,
    status: EmployeeStatus.Active,
    joinDate: '2023-01-15',
    phoneNumber: '+91 9876543210',
    emergencyContact: '+91 9876543211',
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    allowedLocations: [
      { latitude: 28.6139, longitude: 77.2090, accuracy: 100 }, // Delhi HQ
      { latitude: 19.0760, longitude: 72.8777, accuracy: 100 }  // Mumbai Branch
    ],
    createdAt: new Date('2023-01-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'emp002',
    employeeId: 'TRJ002',
    name: 'Priya Patel',
    email: 'priya.patel@trijoshh.com',
    department: 'Human Resources',
    position: 'HR Manager',
    role: Role.HR,
    status: EmployeeStatus.Active,
    joinDate: '2022-11-20',
    phoneNumber: '+91 9876543212',
    emergencyContact: '+91 9876543213',
    workingHours: {
      start: '09:30',
      end: '18:30'
    },
    allowedLocations: [
      { latitude: 28.6139, longitude: 77.2090, accuracy: 100 }
    ],
    createdAt: new Date('2022-11-20').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'emp003',
    employeeId: 'TRJ003',
    name: 'Amit Kumar',
    email: 'amit.kumar@trijoshh.com',
    department: 'Sales',
    position: 'Sales Manager',
    role: Role.Manager,
    status: EmployeeStatus.Active,
    joinDate: '2022-08-10',
    phoneNumber: '+91 9876543214',
    emergencyContact: '+91 9876543215',
    workingHours: {
      start: '08:30',
      end: '17:30'
    },
    allowedLocations: [
      { latitude: 28.6139, longitude: 77.2090, accuracy: 100 },
      { latitude: 19.0760, longitude: 72.8777, accuracy: 100 },
      { latitude: 12.9716, longitude: 77.5946, accuracy: 100 }  // Bangalore Branch
    ],
    createdAt: new Date('2022-08-10').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'emp004',
    employeeId: 'TRJ004',
    name: 'Admin User',
    email: 'admin@trijoshh.com',
    department: 'Administration',
    position: 'System Administrator',
    role: Role.Admin,
    status: EmployeeStatus.Active,
    joinDate: '2022-01-01',
    phoneNumber: '+91 9876543216',
    emergencyContact: '+91 9876543217',
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    allowedLocations: [
      { latitude: 28.6139, longitude: 77.2090, accuracy: 100 },
      { latitude: 19.0760, longitude: 72.8777, accuracy: 100 },
      { latitude: 12.9716, longitude: 77.5946, accuracy: 100 }
    ],
    createdAt: new Date('2022-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'emp005',
    employeeId: 'TRJ005',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@trijoshh.com',
    department: 'Marketing',
    position: 'Marketing Executive',
    role: Role.Employee,
    status: EmployeeStatus.Active,
    joinDate: '2023-03-22',
    phoneNumber: '+91 9876543218',
    emergencyContact: '+91 9876543219',
    workingHours: {
      start: '10:00',
      end: '19:00'
    },
    allowedLocations: [
      { latitude: 28.6139, longitude: 77.2090, accuracy: 100 }
    ],
    createdAt: new Date('2023-03-22').toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class EmployeeService {
  private static instance: EmployeeService;
  private employees: Employee[] = [];

  private constructor() {
    this.initializeEmployees();
  }

  public static getInstance(): EmployeeService {
    if (!EmployeeService.instance) {
      EmployeeService.instance = new EmployeeService();
    }
    return EmployeeService.instance;
  }

  private initializeEmployees(): void {
    const savedEmployees = localStorage.getItem('trijoshh_employees');
    if (savedEmployees) {
      this.employees = JSON.parse(savedEmployees);
    } else {
      this.employees = [...TRIJOSHH_EMPLOYEES];
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('trijoshh_employees', JSON.stringify(this.employees));
  }

  public getAllEmployees(): Employee[] {
    return [...this.employees];
  }

  public getActiveEmployees(): Employee[] {
    return this.employees.filter(emp => emp.status === EmployeeStatus.Active);
  }

  public getEmployeeById(id: string): Employee | null {
    return this.employees.find(emp => emp.id === id) || null;
  }

  public getEmployeeByEmployeeId(employeeId: string): Employee | null {
    return this.employees.find(emp => emp.employeeId === employeeId) || null;
  }

  public getEmployeeByEmail(email: string): Employee | null {
    return this.employees.find(emp => emp.email === email) || null;
  }

  public authenticateEmployee(employeeId: string, additionalCheck?: string): Employee | null {
    const employee = this.getEmployeeByEmployeeId(employeeId);
    if (!employee || employee.status !== EmployeeStatus.Active) {
      return null;
    }
    // Additional validation can be added here (PIN, password, etc.)
    return employee;
  }

  public addEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee {
    const newEmployee: Employee = {
      ...employee,
      id: this.generateEmployeeId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.employees.push(newEmployee);
    this.saveToStorage();
    return newEmployee;
  }

  public updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) return null;

    this.employees[index] = {
      ...this.employees[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage();
    return this.employees[index];
  }

  public deleteEmployee(id: string): boolean {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) return false;

    // Instead of deleting, mark as terminated
    this.employees[index].status = EmployeeStatus.Terminated;
    this.employees[index].updatedAt = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  public searchEmployees(query: string): Employee[] {
    const lowerQuery = query.toLowerCase();
    return this.employees.filter(emp => 
      emp.name.toLowerCase().includes(lowerQuery) ||
      emp.employeeId.toLowerCase().includes(lowerQuery) ||
      emp.email.toLowerCase().includes(lowerQuery) ||
      emp.department.toLowerCase().includes(lowerQuery) ||
      emp.position.toLowerCase().includes(lowerQuery)
    );
  }

  public getEmployeesByDepartment(department: string): Employee[] {
    return this.employees.filter(emp => emp.department === department);
  }

  public getEmployeesByRole(role: Role): Employee[] {
    return this.employees.filter(emp => emp.role === role);
  }

  private generateEmployeeId(): string {
    return 'emp' + Date.now().toString();
  }

  public validateLocation(employee: Employee, currentLocation: Coordinates): boolean {
    if (!employee.allowedLocations || employee.allowedLocations.length === 0) {
      return true; // No location restrictions
    }

    return employee.allowedLocations.some(allowedLocation => {
      const distance = this.calculateDistance(currentLocation, allowedLocation);
      return distance <= (allowedLocation.accuracy || 100); // Default 100m radius
    });
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

  public getWorkingHours(employee: Employee): { start: string; end: string } {
    return employee.workingHours;
  }

  public isWorkingDay(date: Date = new Date()): boolean {
    const dayOfWeek = date.getDay();
    // Monday to Friday (1-5) are working days for TRIJOSHH
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  public exportEmployeeData(): string {
    return JSON.stringify(this.employees, null, 2);
  }

  public importEmployeeData(data: string): boolean {
    try {
      const importedEmployees = JSON.parse(data) as Employee[];
      // Validate data structure
      if (Array.isArray(importedEmployees) && importedEmployees.every(emp => emp.id && emp.employeeId)) {
        this.employees = importedEmployees;
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing employee data:', error);
      return false;
    }
  }
}

export default EmployeeService;