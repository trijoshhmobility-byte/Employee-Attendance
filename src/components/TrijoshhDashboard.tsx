import React, { useState, useMemo } from 'react';
import { AttendanceRecord, WorkLogEntry, Employee, DashboardStats } from '../types';
import EmployeeService from '../services/employeeService';
import IndexedDBService from '../services/databaseService';

interface TrijoshhDashboardProps {
  records: AttendanceRecord[];
  logs: WorkLogEntry[];
}

const TrijoshhDashboard: React.FC<TrijoshhDashboardProps> = ({ records, logs }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const employeeService = EmployeeService.getInstance();
  const employees = employeeService.getAllEmployees();

  const stats = useMemo((): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.date === today);
    
    return {
      totalEmployees: employees.filter(e => e.status === 'ACTIVE').length,
      presentToday: todayRecords.filter(r => r.clockInTime && !r.clockOutTime).length,
      absentToday: employees.filter(e => e.status === 'ACTIVE').length - todayRecords.length,
      lateToday: todayRecords.filter(r => {
        const employee = employees.find(e => e.id === r.employeeId);
        if (!employee) return false;
        const clockInTime = new Date(`${r.date}T${r.clockInTime}`);
        const expectedStart = new Date(`${r.date}T${employee.workingHours.start}`);
        return clockInTime > expectedStart;
      }).length,
      avgWorkingHours: calculateAverageWorkingHours(records),
      totalWorkLogs: logs.length,
      pendingTasks: logs.filter(l => !l.isCompleted).length
    };
  }, [records, logs, employees]);

  const departmentStats = useMemo(() => {
    const departments = [...new Set(employees.map(e => e.department))];
    return departments.map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept && e.status === 'ACTIVE');
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = records.filter(r => {
        const employee = employees.find(e => e.id === r.employeeId);
        return employee?.department === dept && r.date === today;
      });
      
      return {
        department: dept,
        totalEmployees: deptEmployees.length,
        presentToday: todayRecords.filter(r => r.clockInTime && !r.clockOutTime).length,
        attendanceRate: deptEmployees.length > 0 ? 
          Math.round((todayRecords.length / deptEmployees.length) * 100) : 0
      };
    });
  }, [employees, records]);

  const recentActivities = useMemo(() => {
    const allActivities = [
      ...records.slice(-10).map(r => ({
        type: 'attendance' as const,
        timestamp: new Date(r.createdAt || r.id).getTime(),
        description: `${r.employeeName} ${r.clockOutTime ? 'clocked out' : 'clocked in'}`,
        employee: r.employeeName
      })),
      ...logs.slice(-10).map(l => ({
        type: 'worklog' as const,
        timestamp: new Date(l.createdAt || l.id).getTime(),
        description: `${l.employeeName} added work log: ${l.task.substring(0, 50)}...`,
        employee: l.employeeName
      }))
    ];
    
    return allActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 15);
  }, [records, logs]);

  return (
    <div className="space-y-6">
      {/* TRIJOSHH Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">TRIJOSHH Dashboard</h1>
        <p className="text-blue-100">Real-time employee attendance and productivity insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon="👥"
          color="bg-blue-500"
        />
        <MetricCard
          title="Present Today"
          value={stats.presentToday}
          icon="✅"
          color="bg-green-500"
        />
        <MetricCard
          title="Absent Today"
          value={stats.absentToday}
          icon="❌"
          color="bg-red-500"
        />
        <MetricCard
          title="Late Arrivals"
          value={stats.lateToday}
          icon="⏰"
          color="bg-yellow-500"
        />
      </div>

      {/* Department Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Department Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentStats.map(dept => (
            <div key={dept.department} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">{dept.department}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  Present: {dept.presentToday}/{dept.totalEmployees}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${dept.attendanceRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{dept.attendanceRate}% attendance</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Recent Activities</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                activity.type === 'attendance' ? 'bg-green-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">{activity.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            title="Export Attendance"
            description="Download attendance report"
            icon="📊"
            onClick={() => exportAttendanceData(records)}
          />
          <QuickActionButton
            title="Backup Data"
            description="Create system backup"
            icon="💾"
            onClick={() => createBackup()}
          />
          <QuickActionButton
            title="Generate Report"
            description="Create monthly report"
            icon="📈"
            onClick={() => generateMonthlyReport(records, logs)}
          />
          <QuickActionButton
            title="System Settings"
            description="Configure TRIJOSHH settings"
            icon="⚙️"
            onClick={() => alert('Settings panel coming soon!')}
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const MetricCard: React.FC<{
  title: string;
  value: number;
  icon: string;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white text-xl`}>
        {icon}
      </div>
    </div>
  </div>
);

const QuickActionButton: React.FC<{
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <button
    onClick={onClick}
    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
  >
    <div className="text-2xl mb-2">{icon}</div>
    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </button>
);

// Helper Functions
const calculateAverageWorkingHours = (records: AttendanceRecord[]): number => {
  const completedRecords = records.filter(r => r.clockInTime && r.clockOutTime);
  if (completedRecords.length === 0) return 0;
  
  const totalHours = completedRecords.reduce((sum, record) => {
    const clockIn = new Date(`${record.date}T${record.clockInTime}`);
    const clockOut = new Date(`${record.date}T${record.clockOutTime}`);
    const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);
  
  return Math.round((totalHours / completedRecords.length) * 10) / 10;
};

const exportAttendanceData = (records: AttendanceRecord[]) => {
  const csvContent = [
    ['Date', 'Employee', 'Clock In', 'Clock Out', 'Hours'],
    ...records.map(record => [
      record.date,
      record.employeeName,
      record.clockInTime,
      record.clockOutTime || 'Still working',
      record.workingHours || 'N/A'
    ])
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trijoshh-attendance-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const createBackup = async () => {
  const dbService = IndexedDBService.getInstance();
  const backupId = await dbService.createBackup();
  alert(`Backup created successfully! ID: ${backupId}`);
};

const generateMonthlyReport = (records: AttendanceRecord[], logs: WorkLogEntry[]) => {
  alert('Monthly report generation coming soon!');
};

export default TrijoshhDashboard;