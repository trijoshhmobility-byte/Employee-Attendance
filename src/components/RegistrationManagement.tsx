import React, { useState, useEffect } from 'react';
import RegistrationService from '../services/registrationService';
import EmailService from '../services/emailService';
import { PendingRegistration } from '../types';

const RegistrationManagement: React.FC = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'emails'>('pending');

  const registrationService = RegistrationService.getInstance();
  const emailService = EmailService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load pending registrations
    const pending = registrationService.getPendingRegistrations();
    setPendingRegistrations(pending);

    // Load sent emails for demo
    const emails = emailService.getSentEmails();
    setSentEmails(emails.slice(-20)); // Show last 20 emails
  };

  const handleCleanupExpired = () => {
    setLoading(true);
    registrationService.cleanupExpiredRegistrations();
    loadData();
    setLoading(false);
  };

  const handleClearEmailHistory = () => {
    emailService.clearEmailHistory();
    setSentEmails([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiryString: string) => {
    return new Date() > new Date(expiryString);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Management</h2>
        <p className="text-gray-600">Monitor and manage user registrations and email verifications</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Registrations ({pendingRegistrations.length})
            </button>
            <button
              onClick={() => setSelectedTab('emails')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'emails'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Email History ({sentEmails.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={loadData}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
        
        <div className="space-x-3">
          {selectedTab === 'pending' && (
            <button
              onClick={handleCleanupExpired}
              disabled={loading}
              className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors disabled:opacity-50"
            >
              🧹 Cleanup Expired
            </button>
          )}
          
          {selectedTab === 'emails' && (
            <button
              onClick={handleClearEmailHistory}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
            >
              🗑️ Clear History
            </button>
          )}
        </div>
      </div>

      {/* Pending Registrations Tab */}
      {selectedTab === 'pending' && (
        <div className="space-y-4">
          {pendingRegistrations.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Registrations</h3>
              <p className="text-gray-500">All registrations have been completed or expired.</p>
            </div>
          ) : (
            pendingRegistrations.map((registration) => (
              <div
                key={registration.id}
                className={`bg-white rounded-lg border-2 p-6 ${
                  isExpired(registration.verificationCodeExpiry) 
                    ? 'border-red-200 bg-red-50' 
                    : registration.isEmailVerified 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {registration.formData.name}
                    </h3>
                    <p className="text-gray-600">{registration.formData.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      isExpired(registration.verificationCodeExpiry)
                        ? 'bg-red-100 text-red-800'
                        : registration.isEmailVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isExpired(registration.verificationCodeExpiry) 
                        ? 'Expired' 
                        : registration.isEmailVerified 
                        ? 'Verified' 
                        : 'Pending Verification'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <p className="capitalize">{registration.type}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Department:</span>
                    <p>{registration.formData.department}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Position:</span>
                    <p>{registration.formData.position}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Attempts:</span>
                    <p>{registration.attempts}/3</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <p>{formatDate(registration.createdAt)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Expires:</span>
                      <p className={isExpired(registration.verificationCodeExpiry) ? 'text-red-600' : ''}>
                        {formatDate(registration.verificationCodeExpiry)}
                      </p>
                    </div>
                  </div>
                  
                  {!registration.isEmailVerified && !isExpired(registration.verificationCodeExpiry) && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        <strong>Verification Code:</strong> {registration.verificationCode}
                        <span className="text-blue-600 ml-2">(For demo purposes only)</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Email History Tab */}
      {selectedTab === 'emails' && (
        <div className="space-y-4">
          {sentEmails.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-gray-400 text-6xl mb-4">📧</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Emails Sent</h3>
              <p className="text-gray-500">Email history will appear here once emails are sent.</p>
            </div>
          ) : (
            sentEmails.map((email, index) => (
              <div key={index} className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{email.subject}</h3>
                    <p className="text-gray-600 text-sm">To: {email.to}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(email.timestamp)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  <details>
                    <summary className="cursor-pointer hover:text-gray-900">
                      View Email Content
                    </summary>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: email.body }} />
                    </div>
                  </details>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-600 text-2xl mr-3">📊</div>
            <div>
              <p className="text-blue-800 font-semibold">Total Pending</p>
              <p className="text-blue-600 text-2xl font-bold">
                {pendingRegistrations.filter(reg => !reg.isEmailVerified && !isExpired(reg.verificationCodeExpiry)).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600 text-2xl mr-3">✅</div>
            <div>
              <p className="text-green-800 font-semibold">Verified</p>
              <p className="text-green-600 text-2xl font-bold">
                {pendingRegistrations.filter(reg => reg.isEmailVerified).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-2xl mr-3">⏰</div>
            <div>
              <p className="text-red-800 font-semibold">Expired</p>
              <p className="text-red-600 text-2xl font-bold">
                {pendingRegistrations.filter(reg => !reg.isEmailVerified && isExpired(reg.verificationCodeExpiry)).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationManagement;