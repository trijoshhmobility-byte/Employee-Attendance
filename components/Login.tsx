import React, { useState } from 'react';
import { Employee } from '../types';
import EmployeeService from '../services/employeeService';
import TrijoshhLogo from './TrijoshhLogo';

interface LoginProps {
  onLogin: (employee: Employee) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const employeeService = EmployeeService.getInstance();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const employee = employeeService.authenticateEmployee(employeeId.toUpperCase());
    if (employee) {
      localStorage.setItem('trijoshh_current_user', JSON.stringify(employee));
      onLogin(employee);
    } else {
      setError('Invalid Employee ID');
    }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter your Employee ID (e.g., TRJ001)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
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
          <div className="flex gap-2">
            <button 
              onClick={() => setEmployeeId('TRJ001')} 
              className="flex-1 text-xs bg-gray-50 hover:bg-gray-100 py-2 px-3 rounded-lg border border-gray-200 transition-colors font-medium"
            >
              Employee Demo
            </button>
            <button 
              onClick={() => setEmployeeId('TRJ004')} 
              className="flex-1 text-xs bg-blue-50 hover:bg-blue-100 py-2 px-3 rounded-lg border border-blue-200 transition-colors font-medium text-blue-700"
            >
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;