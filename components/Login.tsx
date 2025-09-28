import React, { useState } from 'react';
import { Employee } from '../types';
import EmployeeService from '../services/employeeService';
import TrijoshhLogo from './TrijoshhLogo';

interface LoginProps {
  onLogin: (employee: Employee) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const employeeService = EmployeeService.getInstance();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!employeeId.trim()) {
      setError('Please enter your Employee ID');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    const employee = employeeService.authenticateEmployee(employeeId.toUpperCase(), password);
    if (employee) {
      localStorage.setItem('trijoshh_current_user', JSON.stringify(employee));
      onLogin(employee);
    } else {
      setError('Invalid Employee ID or Password');
    }
  };

  const handleDemoLogin = (demoEmployeeId: string, demoPassword: string) => {
    setEmployeeId(demoEmployeeId);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <TrijoshhLogo size="xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">TRIJOSHH</h1>
          <p className="text-lg font-semibold text-blue-600 tracking-wide">EMPLOYEE ATTENDANCE TRACKER</p>
          <div className="mt-3 h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto rounded-full"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee ID
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter your Employee ID (e.g., TRJ001)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.636 8.636m1.242 1.242L12 12m0 0l2.121 2.121M12 12l2.121-2.121m0 0l1.242-1.242M12 12l-2.121-2.121" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
          >
            Sign In to TRIJOSHH
          </button>
        </form>
        
        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-center text-xs text-gray-500 mb-3">Quick Access (Demo)</p>
          <div className="space-y-2">
            <button 
              onClick={() => handleDemoLogin('TRJ001', 'rahul@123')} 
              className="w-full text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 transition-colors font-medium text-left"
            >
              <div className="font-semibold text-gray-700">Employee Demo</div>
              <div className="text-gray-500 mt-1">ID: TRJ001 | Password: rahul@123</div>
            </button>
            <button 
              onClick={() => handleDemoLogin('TRJ004', 'admin@123')} 
              className="w-full text-xs bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 transition-colors font-medium text-left"
            >
              <div className="font-semibold text-blue-700">Admin Demo</div>
              <div className="text-blue-600 mt-1">ID: TRJ004 | Password: admin@123</div>
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 font-medium mb-1">📝 Available Demo Accounts:</p>
            <div className="text-xs text-amber-600 space-y-1">
              <div>• TRJ001 (Employee) - rahul@123</div>
              <div>• TRJ002 (HR) - priya@123</div>
              <div>• TRJ003 (Manager) - amit@123</div>
              <div>• TRJ004 (Admin) - admin@123</div>
              <div>• TRJ005 (Employee) - sneha@123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;