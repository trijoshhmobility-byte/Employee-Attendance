// TRIJOSHH Attendance Tracker - Browser Console Tests
// Open DevTools console and run: TrijoshhTests.runAllTests()

import EmployeeService from '../services/employeeService';
import ValidationService from '../services/validationService';
import { Employee, AttendanceRecord } from '../types';

// Manual test functions for browser console
const TrijoshhTests = {
  testEmployeeAuthentication: () => {
    console.log('Testing Employee Authentication...');
    const service = EmployeeService.getInstance();
    
    // Test valid employee with correct password
    const validEmployee = service.authenticateEmployee('TRJ001', 'rahul@123');
    const test1 = validEmployee && validEmployee.employeeId === 'TRJ001';
    console.log('  ✓ Valid employee authentication:', test1 ? 'PASS' : 'FAIL');
    
    // Test invalid employee
    const invalidEmployee = service.authenticateEmployee('INVALID', 'password');
    const test2 = invalidEmployee === null;
    console.log('  ✓ Invalid employee rejection:', test2 ? 'PASS' : 'FAIL');
    
    // Test valid employee with wrong password
    const wrongPasswordEmployee = service.authenticateEmployee('TRJ001', 'wrongpassword');
    const test3 = wrongPasswordEmployee === null;
    console.log('  ✓ Wrong password rejection:', test3 ? 'PASS' : 'FAIL');
    
    return test1 && test2 && test3;
  },

  testLocationValidation: () => {
    console.log('Testing Location Validation...');
    const service = EmployeeService.getInstance();
    const employee = service.getEmployeeByEmployeeId('TRJ001');
    
    if (!employee) {
      console.log('  ✗ Could not find test employee');
      return false;
    }
    
    // Test valid location (Delhi HQ)
    const validLocation = { latitude: 28.6139, longitude: 77.2090 };
    const test1 = service.validateLocation(employee, validLocation);
    console.log('  ✓ Valid location acceptance:', test1 ? 'PASS' : 'FAIL');
    
    // Test invalid location
    const invalidLocation = { latitude: 0, longitude: 0 };
    const test2 = !service.validateLocation(employee, invalidLocation);
    console.log('  ✓ Invalid location rejection:', test2 ? 'PASS' : 'FAIL');
    
    return test1 && test2;
  },

  testValidationService: () => {
    console.log('Testing Validation Service...');
    const service = ValidationService.getInstance();
    
    // Test valid employee data
    const validEmployee: Partial<Employee> = {
      employeeId: 'TRJ999',
      name: 'Test Employee',
      email: 'test@trijoshh.com',
      department: 'Testing',
      position: 'Test Engineer',
      workingHours: { start: '09:00', end: '17:00' }
    };
    
    const result1 = service.validateEmployee(validEmployee);
    const test1 = result1.isValid && result1.errors.length === 0;
    console.log('  ✓ Valid employee data validation:', test1 ? 'PASS' : 'FAIL');
    
    // Test invalid employee data
    const invalidEmployee: Partial<Employee> = {
      employeeId: 'INVALID',
      name: '',
      email: 'invalid-email',
      department: '',
      position: ''
    };
    
    const result2 = service.validateEmployee(invalidEmployee);
    const test2 = !result2.isValid && result2.errors.length > 0;
    console.log('  ✓ Invalid employee data rejection:', test2 ? 'PASS' : 'FAIL');
    
    // Test input sanitization
    const maliciousInput = '<script>alert("hack")</script>Hello World';
    const sanitized = service.sanitizeInput(maliciousInput);
    const test3 = !sanitized.includes('<script>') && sanitized.includes('Hello World');
    console.log('  ✓ Input sanitization:', test3 ? 'PASS' : 'FAIL');
    
    return test1 && test2 && test3;
  },

  testAttendanceFlow: () => {
    console.log('Testing Complete Attendance Flow...');
    const employeeService = EmployeeService.getInstance();
    const validationService = ValidationService.getInstance();
    
    // Authenticate employee
    const employee = employeeService.authenticateEmployee('TRJ001', 'rahul@123');
    if (!employee) {
      console.log('  ✗ Employee authentication failed');
      return false;
    }
    
    // Create attendance record
    const attendanceRecord: Partial<AttendanceRecord> = {
      employeeId: employee.id,
      date: new Date().toISOString().split('T')[0],
      clockInTime: '09:00',
      clockInLocation: { latitude: 28.6139, longitude: 77.2090 },
      status: 'PRESENT' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Validate attendance record
    const validation = validationService.validateAttendanceRecord(attendanceRecord);
    const test1 = validation.isValid;
    console.log('  ✓ Attendance record validation:', test1 ? 'PASS' : 'FAIL');
    
    // Validate location
    const locationValidation = employeeService.validateLocation(
      employee, 
      attendanceRecord.clockInLocation!
    );
    const test2 = locationValidation;
    console.log('  ✓ Location validation in flow:', test2 ? 'PASS' : 'FAIL');
    
    return test1 && test2;
  },

  testSystemIntegration: () => {
    console.log('Testing System Integration...');
    
    // Test data persistence
    const testData = { test: 'trijoshh', timestamp: Date.now() };
    try {
      localStorage.setItem('trijoshh_test', JSON.stringify(testData));
      const retrieved = JSON.parse(localStorage.getItem('trijoshh_test') || '{}');
      const test1 = retrieved.test === 'trijoshh';
      console.log('  ✓ LocalStorage persistence:', test1 ? 'PASS' : 'FAIL');
      localStorage.removeItem('trijoshh_test');
      
      // Test geolocation availability
      const test2 = 'geolocation' in navigator;
      console.log('  ✓ Geolocation API availability:', test2 ? 'PASS' : 'FAIL');
      
      // Test IndexedDB availability
      const test3 = 'indexedDB' in window;
      console.log('  ✓ IndexedDB availability:', test3 ? 'PASS' : 'FAIL');
      
      return test1 && test2 && test3;
    } catch (error) {
      console.log('  ✗ System integration test failed:', error);
      return false;
    }
  },

  runAllTests: () => {
    console.log('\n=== TRIJOSHH SYSTEM TESTS ===');
    console.log('Running comprehensive system validation...\n');
    
    const results = {
      employeeAuth: TrijoshhTests.testEmployeeAuthentication(),
      locationValidation: TrijoshhTests.testLocationValidation(),
      validationService: TrijoshhTests.testValidationService(),
      attendanceFlow: TrijoshhTests.testAttendanceFlow(),
      systemIntegration: TrijoshhTests.testSystemIntegration()
    };
    
    console.log('\n=== TEST RESULTS ===');
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    console.log(`\n📊 Overall: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests/totalTests)*100)}%)`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! TRIJOSHH system is ready for production.');
    } else {
      console.log('⚠️ Some tests failed. Please review the system before deployment.');
    }
    
    return results;
  }
};

// Make tests available globally
(window as any).TrijoshhTests = TrijoshhTests;

export default TrijoshhTests;