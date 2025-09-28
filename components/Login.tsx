import React, { useState } from 'react';
import { Employee } from '../types';
import EmployeeService from '../services/employeeService';

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
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold">TRJ</span>
          </div>
          <h1 className="text-xl font-bold">TRIJOSHH Attendance</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Employee ID (e.g., TRJ001)"
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">Sign In</button>
        </form>
        
        <div className="mt-4 flex gap-2">
          <button onClick={() => setEmployeeId('TRJ001')} className="flex-1 text-xs bg-gray-100 py-1 rounded">Employee</button>
          <button onClick={() => setEmployeeId('TRJ004')} className="flex-1 text-xs bg-gray-100 py-1 rounded">Admin</button>
        </div>
      </div>
    </div>
  );
};

export default Login;