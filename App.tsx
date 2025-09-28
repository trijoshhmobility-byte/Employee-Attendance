import React, { useState, useEffect, useCallback } from 'react';
import { View, AttendanceRecord, WorkLogEntry, Role, Priority, Employee } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AttendanceHistory from './components/AttendanceHistory';
import WorkLog from './components/WorkLog';
import RoleSelection from './components/RoleSelection';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { seedInitialData } from './mockData';
import EmployeeService from './services/employeeService';
import IndexedDBService from './services/databaseService';



const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  // Initialize database and check for existing session
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize IndexedDB
      const dbService = IndexedDBService.getInstance();
      await dbService.initializeDB();
      
      // Seed initial data
      seedInitialData();
      
      // Check for existing user session
      const savedUser = localStorage.getItem('trijoshh_current_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser) as Employee;
          const employeeService = EmployeeService.getInstance();
          const validEmployee = employeeService.getEmployeeById(user.id);
          if (validEmployee && validEmployee.status === 'ACTIVE') {
            setCurrentUser(validEmployee);
            setRole(validEmployee.role);
          } else {
            localStorage.removeItem('trijoshh_current_user');
          }
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('trijoshh_current_user');
        }
      }
      
      setIsDbInitialized(true);
    };
    
    initializeApp();
  }, []);

  const handleLogin = (employee: Employee) => {
    setCurrentUser(employee);
    setRole(employee.role);
  };

  const handleLogout = () => {
    localStorage.removeItem('trijoshh_current_user');
    setCurrentUser(null);
    setRole(null);
  };

  // Show loading while initializing
  if (!isDbInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing TRIJOSHH System...</p>
        </div>
      </div>
    );
  }

  // Show login if no authenticated user
  if (!currentUser || !role) {
    return <Login onLogin={handleLogin} />;
  }

  const handleSwitchRole = () => {
    // For demo purposes, allow role switching without logout
    setRole(null);
  };

  if (!role) {
    return <RoleSelection onSelectRole={setRole} />;
  }

  if (role === Role.Admin) {
    const allHistory = JSON.parse(localStorage.getItem('attendanceHistory') || '[]');
    const allLogs = JSON.parse(localStorage.getItem('workLogs') || '[]');
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        <Header 
          role={role} 
          onSwitchRole={handleSwitchRole}
        />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <AdminPanel records={allHistory} logs={allLogs} />
        </main>
      </div>
    );
  }

  // If role is Employee, render the employee panel
  return <EmployeePanel currentUser={currentUser} onSwitchRole={handleSwitchRole} onLogout={handleLogout} />;
};


// The original App component is now the EmployeePanel
const EmployeePanel: React.FC<{
  currentUser: Employee;
  onSwitchRole: () => void;
  onLogout: () => void;
}> = ({ currentUser, onSwitchRole, onLogout }) => {
    const [currentView, setCurrentView] = useState<View>(View.Dashboard);
    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
    const [workLogs, setWorkLogs] = useState<WorkLogEntry[]>([]);
    const [currentAttendance, setCurrentAttendance] = useState<AttendanceRecord | null>(null);
    
    const CURRENT_USER_ID = currentUser.id;
    const CURRENT_USER_NAME = currentUser.name;
  
    useEffect(() => {
      const savedHistory = localStorage.getItem('attendanceHistory');
      const savedLogs = localStorage.getItem('workLogs');
      if (savedHistory) {
        const history: AttendanceRecord[] = JSON.parse(savedHistory);
        setAttendanceHistory(history);
        const userHistory = history.filter(r => r.employeeId === CURRENT_USER_ID);
        const today = new Date().toISOString().split('T')[0];
        const ongoing = userHistory.find(rec => rec.date === today && rec.clockOutTime === null);
        if (ongoing) {
          setCurrentAttendance(ongoing);
        }
      }
      if (savedLogs) {
        setWorkLogs(JSON.parse(savedLogs));
      }
    }, []);
  
    useEffect(() => {
      localStorage.setItem('attendanceHistory', JSON.stringify(attendanceHistory));
    }, [attendanceHistory]);
  
    useEffect(() => {
      localStorage.setItem('workLogs', JSON.stringify(workLogs));
    }, [workLogs]);
  
    const handleClockIn = useCallback((location: GeolocationCoordinates) => {
      const now = new Date();
      const newRecord: AttendanceRecord = {
        id: now.toISOString(),
        date: now.toISOString().split('T')[0],
        clockInTime: now.toLocaleTimeString(),
        clockInLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        clockOutTime: null,
        clockOutLocation: null,
        employeeId: CURRENT_USER_ID,
        employeeName: CURRENT_USER_NAME,
        status: 'PRESENT' as any,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      setAttendanceHistory(prev => [...prev, newRecord]);
      setCurrentAttendance(newRecord);
    }, []);
  
    const handleClockOut = useCallback((location: GeolocationCoordinates) => {
      if (!currentAttendance) return;
      const now = new Date();
      const updatedRecord: AttendanceRecord = {
        ...currentAttendance,
        clockOutTime: now.toLocaleTimeString(),
        clockOutLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      };
      setAttendanceHistory(prev =>
        prev.map(rec => (rec.id === currentAttendance.id ? updatedRecord : rec))
      );
      setCurrentAttendance(null);
    }, [currentAttendance]);
  
    const handleAddWorkLog = useCallback((task: string, priority: Priority) => {
      const now = new Date();
      const newLog: WorkLogEntry = {
        id: now.toISOString(),
        timestamp: now.toLocaleTimeString(),
        task,
        priority,
        employeeId: CURRENT_USER_ID,
        employeeName: CURRENT_USER_NAME,
        isCompleted: false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      setWorkLogs(prev => [...prev, newLog]);
    }, []);

    const handleEditWorkLog = useCallback((id: string, task: string, priority: Priority) => {
      setWorkLogs(prev => prev.map(log => 
        log.id === id 
          ? { ...log, task, priority, updatedAt: new Date().toISOString() }
          : log
      ));
    }, []);

    const handleDeleteWorkLog = useCallback((id: string) => {
      setWorkLogs(prev => prev.filter(log => log.id !== id));
    }, []);

    const userHistory = attendanceHistory.filter(r => r.employeeId === CURRENT_USER_ID);
    const userLogs = workLogs.filter(l => l.employeeId === CURRENT_USER_ID);
  
    const renderView = () => {
      switch (currentView) {
        case View.Dashboard:
          return (
            <Dashboard
              isClockedIn={!!currentAttendance}
              lastRecord={currentAttendance ?? userHistory[userHistory.length - 1] ?? null}
              currentUser={currentUser}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
            />
          );
        case View.History:
          return <AttendanceHistory records={userHistory} />;
        case View.WorkLog:
          return (
              <WorkLog 
                  logs={userLogs} 
                  onAddLog={handleAddWorkLog}
                  onEditLog={handleEditWorkLog}
                  onDeleteLog={handleDeleteWorkLog}
                  isClockedIn={!!currentAttendance} 
              />
          );
        default:
          return <Dashboard 
                      isClockedIn={!!currentAttendance} 
                      lastRecord={currentAttendance ?? userHistory[userHistory.length - 1] ?? null}
                      currentUser={currentUser}
                      onClockIn={handleClockIn}
                      onClockOut={handleClockOut}
                  />;
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        <Header 
          role={Role.Employee} 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          onSwitchRole={onSwitchRole}
        />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {renderView()}
        </main>
      </div>
    );
}

export default App;