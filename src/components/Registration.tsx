import React, { useState } from 'react';
import { Role, RegistrationFormData } from '../types';
import RegistrationService from '../services/registrationService';
import TrijoshhLogo from './TrijoshhLogo';

interface RegistrationProps {
  onRegistrationComplete: () => void;
  onBackToLogin: () => void;
}

const Registration: React.FC<RegistrationProps> = ({ onRegistrationComplete, onBackToLogin }) => {
  const [step, setStep] = useState<'type-selection' | 'form' | 'verification'>('type-selection');
  const [registrationType, setRegistrationType] = useState<'employee' | 'admin' | null>(null);
  const [registrationId, setRegistrationId] = useState<string>('');
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    position: '',
    phoneNumber: '',
    emergencyContact: '',
    role: Role.Employee,
    workingHours: {
      start: '09:00',
      end: '18:00'
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const registrationService = RegistrationService.getInstance();

  // Predefined departments and positions
  const departments = [
    'Engineering', 'Human Resources', 'Sales', 'Marketing', 'Finance', 
    'Operations', 'Administration', 'Customer Support', 'Quality Assurance'
  ];

  const positions = {
    'Engineering': ['Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'Engineering Manager', 'DevOps Engineer'],
    'Human Resources': ['HR Executive', 'HR Manager', 'Talent Acquisition Specialist', 'HR Business Partner'],
    'Sales': ['Sales Executive', 'Sales Manager', 'Account Manager', 'Business Development Manager'],
    'Marketing': ['Marketing Executive', 'Marketing Manager', 'Digital Marketing Specialist', 'Content Creator'],
    'Finance': ['Financial Analyst', 'Accountant', 'Finance Manager', 'Financial Controller'],
    'Operations': ['Operations Executive', 'Operations Manager', 'Process Manager', 'Logistics Coordinator'],
    'Administration': ['Admin Executive', 'Office Manager', 'System Administrator', 'Facilities Manager'],
    'Customer Support': ['Support Executive', 'Customer Success Manager', 'Technical Support Specialist'],
    'Quality Assurance': ['QA Engineer', 'QA Manager', 'Test Lead', 'Automation Engineer']
  };

  const handleTypeSelection = (type: 'employee' | 'admin') => {
    setRegistrationType(type);
    setFormData(prev => ({
      ...prev,
      role: type === 'admin' ? Role.Admin : Role.Employee,
      department: type === 'admin' ? 'Administration' : '',
      position: type === 'admin' ? 'System Administrator' : ''
    }));
    setStep('form');
  };

  const handleInputChange = (field: keyof RegistrationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleWorkingHoursChange = (field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value
      }
    }));
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await registrationService.initiateRegistration(formData);
      
      if (result.success) {
        setRegistrationId(result.registrationId!);
        setSuccess(result.message);
        setStep('verification');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await registrationService.verifyEmailAndCompleteRegistration(
        registrationId,
        verificationCode
      );

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          onRegistrationComplete();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await registrationService.resendVerificationCode(registrationId);
      
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Type selection step
  if (step === 'type-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <TrijoshhLogo size="xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join TRIJOSHH</h1>
            <p className="text-lg font-semibold text-blue-600 tracking-wide">Choose Your Registration Type</p>
            <div className="mt-3 h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleTypeSelection('employee')}
              className="w-full p-6 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">Employee Registration</h3>
                  <p className="text-sm text-gray-600">Join as a team member</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleTypeSelection('admin')}
              className="w-full p-6 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">Admin Registration</h3>
                  <p className="text-sm text-gray-600">Register with administrative privileges</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onBackToLogin}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Registration form step
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <TrijoshhLogo size="lg" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {registrationType === 'admin' ? 'Admin Registration' : 'Employee Registration'}
            </h1>
            <p className="text-blue-600 font-medium">Create your TRIJOSHH account</p>
          </div>

          <form onSubmit={handleSubmitRegistration} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            </div>

            {/* Department and Position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={registrationType === 'admin'}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={registrationType === 'admin' || !formData.department}
                >
                  <option value="">Select Position</option>
                  {formData.department && positions[formData.department as keyof typeof positions]?.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Working Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.workingHours.start}
                  onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.workingHours.end}
                  onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-600 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep('type-selection')}
                className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Back
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Send Verification Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Email verification step
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <TrijoshhLogo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a verification code to <br />
            <span className="font-semibold text-blue-600">{formData.email}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyEmail} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-lg font-mono tracking-widest"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-600 text-sm font-medium">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || verificationCode.length !== 6}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify & Complete Registration'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50"
            >
              Resend Code
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;