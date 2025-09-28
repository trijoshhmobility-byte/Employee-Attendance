import { AttendanceRecord, WorkLogEntry, Priority } from './types';

export const MOCK_DATA = {
    attendanceHistory: [
        {
            id: new Date('2023-10-27T09:00:00Z').toISOString(),
            date: '2023-10-27',
            clockInTime: '09:00:00 AM',
            clockInLocation: { latitude: 34.0522, longitude: -118.2437 },
            clockOutTime: '05:00:00 PM',
            clockOutLocation: { latitude: 34.0522, longitude: -118.2437 },
            employeeId: 'user1',
            employeeName: 'John Doe',
        },
        {
            id: new Date('2023-10-27T08:30:00Z').toISOString(),
            date: '2023-10-27',
            clockInTime: '08:30:00 AM',
            clockInLocation: { latitude: 40.7128, longitude: -74.0060 },
            clockOutTime: '04:30:00 PM',
            clockOutLocation: { latitude: 40.7128, longitude: -74.0060 },
            employeeId: 'user2',
            employeeName: 'Jane Smith',
        },
        {
            id: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0],
            clockInTime: '09:05:00 AM',
            clockInLocation: { latitude: 51.5074, longitude: -0.1278 },
            clockOutTime: null,
            clockOutLocation: null,
            employeeId: 'user3',
            employeeName: 'Peter Jones',
        },
    ] as AttendanceRecord[],
    workLogs: [
        {
            id: new Date('2023-10-27T10:00:00Z').toISOString(),
            timestamp: '10:00:00 AM',
            task: 'Completed the Q3 report analysis.',
            description: 'Analyzed quarterly performance metrics and prepared comprehensive report for management review.',
            priority: Priority.High,
            category: 'Documentation',
            estimatedHours: 3,
            actualHours: 2.5,
            employeeId: 'user1',
            employeeName: 'John Doe',
            isCompleted: true,
            createdAt: new Date('2023-10-27T10:00:00Z').toISOString(),
            updatedAt: new Date('2023-10-27T12:30:00Z').toISOString()
        },
        {
            id: new Date('2023-10-27T11:00:00Z').toISOString(),
            timestamp: '11:00:00 AM',
            task: 'Client call with Acme Corp.',
            description: 'Discussed project requirements and timeline adjustments for the new feature implementation.',
            priority: Priority.Medium,
            category: 'Meeting',
            estimatedHours: 1,
            actualHours: 1.5,
            employeeId: 'user2',
            employeeName: 'Jane Smith',
            isCompleted: true,
            createdAt: new Date('2023-10-27T11:00:00Z').toISOString(),
            updatedAt: new Date('2023-10-27T12:30:00Z').toISOString()
        },
        {
            id: new Date('2023-10-27T02:00:00Z').toISOString(),
            timestamp: '02:00:00 PM',
            task: 'Fixed bug #123 in the payment module.',
            description: 'Resolved critical issue with payment processing that was causing transaction failures.',
            priority: Priority.Critical,
            category: 'Development',
            estimatedHours: 2,
            actualHours: 4,
            employeeId: 'user1',
            employeeName: 'John Doe',
            isCompleted: true,
            createdAt: new Date('2023-10-27T02:00:00Z').toISOString(),
            updatedAt: new Date('2023-10-27T06:00:00Z').toISOString()
        },
        {
            id: new Date().toISOString(),
            timestamp: new Date().toLocaleTimeString(),
            task: 'Working on TRIJOSHH attendance system enhancement',
            description: 'Adding edit and export functionality to work log management system.',
            priority: Priority.High,
            category: 'Development',
            estimatedHours: 4,
            employeeId: 'emp001',
            employeeName: 'Rahul Sharma',
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ] as WorkLogEntry[],
};

export const seedInitialData = () => {
    if (!localStorage.getItem('attendanceHistory')) {
        localStorage.setItem('attendanceHistory', JSON.stringify(MOCK_DATA.attendanceHistory));
    }
    if (!localStorage.getItem('workLogs')) {
        localStorage.setItem('workLogs', JSON.stringify(MOCK_DATA.workLogs));
    }
};