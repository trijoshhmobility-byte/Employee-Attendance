
import React, { useState, useMemo } from 'react';
import { AttendanceRecord, WorkLogEntry, Priority } from '../types';
import AttendanceHistory from './AttendanceHistory';
import RegistrationManagement from './RegistrationManagement';
import { DownloadIcon, SearchIcon } from './icons';
import { downloadCSV } from '../utils/csv';

interface AdminPanelProps {
    records: AttendanceRecord[];
    logs: WorkLogEntry[];
}

const getPriorityBadgeColor = (priority: Priority) => {
    switch (priority) {
        case Priority.High: return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
        case Priority.Medium: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
        case Priority.Low: return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
}

const AdminPanel: React.FC<AdminPanelProps> = ({ records, logs }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'registrations'>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            const recordDateStr = record.date;
            const employeeNameMatch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
            const dateMatch = (!startDate || recordDateStr >= startDate) && (!endDate || recordDateStr <= endDate);
            return employeeNameMatch && dateMatch;
        });
    }, [records, searchTerm, startDate, endDate]);

    const filteredLogs = useMemo(() => {
        const sortedLogs = [...logs].sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
        return sortedLogs.filter(log => {
            const logDateStr = new Date(log.id).toISOString().split('T')[0];
            const employeeNameMatch = log.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
            const dateMatch = (!startDate || logDateStr >= startDate) && (!endDate || logDateStr <= endDate);
            return employeeNameMatch && dateMatch;
        });
    }, [logs, searchTerm, startDate, endDate]);


    const totalEmployees = new Set(records.map(r => r.employeeId)).size;
    const today = new Date().toISOString().split('T')[0];
    const clockedInEmployees = new Set(
        records
            .filter(r => r.date === today && !r.clockOutTime)
            .map(r => r.employeeId)
    ).size;

    const handleClearFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'overview'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            📊 Overview & Reports
                        </button>
                        <button
                            onClick={() => setActiveTab('registrations')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'registrations'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            👥 Registration Management
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' ? (
                <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Employees</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{totalEmployees}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Currently Clocked In</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{clockedInEmployees}</p>
                </div>
            </div>

            {/* Admin Controls */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 sm:p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Admin Controls</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    {/* Search */}
                    <div className="relative">
                         <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search Employee</label>
                         <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="e.g., John Doe"
                                className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            />
                         </div>
                    </div>
                    {/* Date Filters */}
                     <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>
                     <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>
                     {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button onClick={handleClearFilters} className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                            Clear
                        </button>
                    </div>
                </div>
                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button onClick={() => downloadCSV(filteredRecords, 'attendance_history.csv')} className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                        <DownloadIcon className="w-5 h-5 mr-2"/>
                        Export Attendance
                    </button>
                    <button onClick={() => downloadCSV(filteredLogs, 'work_logs.csv')} className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                        <DownloadIcon className="w-5 h-5 mr-2"/>
                        Export Logs
                    </button>
                </div>
            </div>

            {/* Attendance History Table */}
            <AttendanceHistory records={filteredRecords} isAdminView={true} />

            {/* All Work Logs */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 sm:p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">All Work Logs</h2>
                {filteredLogs.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No work logs found for the current filters.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredLogs.map(log => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{log.employeeName}</td>
                                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-500 dark:text-gray-400">{log.task}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(log.priority)}`}>
                                                {log.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(log.id).toLocaleDateString()} {log.timestamp}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
                </div>
            ) : (
                <RegistrationManagement />
            )}
        </div>
    );
};

export default AdminPanel;