import React, { useState, useEffect } from 'react';
import RegistrationService from '../services/registrationService';
import EmailService from '../services/emailService';

const RegistrationDemo: React.FC = () => {
  const [demoMode, setDemoMode] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const registrationService = RegistrationService.getInstance();
  const emailService = EmailService.getInstance();

  useEffect(() => {
    updateStats();
  }, []);

  const updateStats = () => {
    const pending = registrationService.getPendingRegistrations();
    setPendingCount(pending.length);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const simulateEmployeeRegistration = async () => {
    setDemoMode(true);
    addLog('🎬 Starting Employee Registration Demo...');

    try {
      // Simulate form data
      const formData = {
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: 'securepass123',
        confirmPassword: 'securepass123',
        department: 'Engineering',
        position: 'Software Engineer',
        phoneNumber: '+91 9876543210',
        emergencyContact: '+91 9876543211',
        role: 'EMPLOYEE' as any,
        workingHours: {
          start: '09:00',
          end: '18:00'
        }
      };

      addLog('📝 Submitting registration form...');
      const registrationResult = await registrationService.initiateRegistration(formData);

      if (registrationResult.success) {
        addLog('✅ Registration initiated successfully');
        addLog('📧 Verification email sent');
        updateStats();

        // Simulate email verification after 2 seconds
        setTimeout(async () => {
          const pending = registrationService.getPendingRegistrations();
          const latestPending = pending[pending.length - 1];
          
          if (latestPending) {
            addLog(`🔑 Using verification code: ${latestPending.verificationCode}`);
            
            const verificationResult = await registrationService.verifyEmailAndCompleteRegistration(
              latestPending.id,
              latestPending.verificationCode
            );

            if (verificationResult.success) {
              addLog('✅ Email verified successfully');
              addLog('👤 Employee account created');
              addLog(`🆔 Generated Employee ID: ${verificationResult.employee?.employeeId}`);
              addLog('📧 Welcome email sent');
              updateStats();
            } else {
              addLog('❌ Verification failed: ' + verificationResult.message);
            }
          }
          
          setDemoMode(false);
        }, 2000);
      } else {
        addLog('❌ Registration failed: ' + registrationResult.message);
        setDemoMode(false);
      }
    } catch (error) {
      addLog('❌ Demo error: ' + error);
      setDemoMode(false);
    }
  };

  const simulateAdminRegistration = async () => {
    setDemoMode(true);
    addLog('🎬 Starting Admin Registration Demo...');

    try {
      const formData = {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@trijoshh.com',
        password: 'adminpass123',
        confirmPassword: 'adminpass123',
        department: 'Administration',
        position: 'System Administrator',
        phoneNumber: '+91 9876543220',
        emergencyContact: '+91 9876543221',
        role: 'ADMIN' as any,
        workingHours: {
          start: '08:00',
          end: '17:00'
        }
      };

      addLog('📝 Submitting admin registration form...');
      const registrationResult = await registrationService.initiateRegistration(formData);

      if (registrationResult.success) {
        addLog('✅ Admin registration initiated');
        addLog('📧 Admin verification email sent');
        updateStats();

        // Auto-verify after 3 seconds
        setTimeout(async () => {
          const pending = registrationService.getPendingRegistrations();
          const latestPending = pending[pending.length - 1];
          
          if (latestPending) {
            addLog(`🔑 Using admin verification code: ${latestPending.verificationCode}`);
            
            const verificationResult = await registrationService.verifyEmailAndCompleteRegistration(
              latestPending.id,
              latestPending.verificationCode
            );

            if (verificationResult.success) {
              addLog('✅ Admin email verified');
              addLog('👨‍💼 Admin account created with elevated privileges');
              addLog(`🆔 Generated Admin ID: ${verificationResult.employee?.employeeId}`);
              addLog('📧 Admin welcome email sent');
              updateStats();
            }
          }
          
          setDemoMode(false);
        }, 3000);
      } else {
        addLog('❌ Admin registration failed: ' + registrationResult.message);
        setDemoMode(false);
      }
    } catch (error) {
      addLog('❌ Demo error: ' + error);
      setDemoMode(false);
    }
  };

  const clearDemo = () => {
    setLogs([]);
    // Clean up demo data
    registrationService.cleanupExpiredRegistrations();
    emailService.clearEmailHistory();
    updateStats();
    addLog('🧹 Demo data cleared');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🚀 TRIJOSHH Registration System Demo
          </h1>
          <p className="text-gray-600">
            Experience the complete secure registration process with email verification
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Pending Registrations:</strong> {pendingCount} | 
              <strong> Demo Mode:</strong> {demoMode ? '🟢 Active' : '🔴 Inactive'}
            </p>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={simulateEmployeeRegistration}
            disabled={demoMode}
            className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            👨‍💻 Demo Employee Registration
          </button>
          
          <button
            onClick={simulateAdminRegistration}
            disabled={demoMode}
            className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            👨‍💼 Demo Admin Registration
          </button>
          
          <button
            onClick={clearDemo}
            disabled={demoMode}
            className="p-6 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🧹 Clear Demo Data
          </button>
        </div>

        {/* Features Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🔐 Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Email verification required</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Password strength validation</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Input sanitization</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Role-based access control</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Verification code expiry (15 min)</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Maximum 3 verification attempts</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Duplicate email prevention</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Auto employee ID generation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Activity Log</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No activity yet. Click a demo button to start!</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="font-semibold text-amber-800 mb-2">📖 How It Works</h3>
          <ol className="text-amber-700 text-sm space-y-1 list-decimal list-inside">
            <li>User selects registration type (Employee/Admin)</li>
            <li>User fills out the registration form with validation</li>
            <li>System sends verification email with 6-digit code</li>
            <li>User enters verification code within 15 minutes</li>
            <li>System creates account and assigns employee ID</li>
            <li>Welcome email sent with account details</li>
            <li>User can now log in with credentials</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDemo;