import React from 'react';
import { AttendanceRecord } from '../types';
import { LocationPinIcon } from './icons';


interface AttendanceHistoryProps {
  records: AttendanceRecord[];
  isAdminView?: boolean;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ records, isAdminView = false }) => {
  const sortedRecords = [...records].sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Attendance History</h2>
      {records.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No attendance records found for the current filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {isAdminView && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Employee
                    </th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Clock In
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Clock Out
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Hours
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedRecords.map(record => {
                const clockIn = record.clockInTime ? new Date(`${record.date}T${record.clockInTime.replace(/(\d{1,2}:\d{2}:\d{2})\s(AM|PM)/, (match, time, period) => {
                    const [h, m, s] = time.split(':');
                    let hours = parseInt(h);
                    if (period === 'PM' && hours < 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;
                    return `${String(hours).padStart(2, '0')}:${m}:${s}`;
                })}`) : null;

                const clockOut = record.clockOutTime ? new Date(`${record.date}T${record.clockOutTime.replace(/(\d{1,2}:\d{2}:\d{2})\s(AM|PM)/, (match, time, period) => {
                    const [h, m, s] = time.split(':');
                    let hours = parseInt(h);
                    if (period === 'PM' && hours < 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;
                    return `${String(hours).padStart(2, '0')}:${m}:${s}`;
                })}`) : null;

                let hoursWorked = 'N/A';
                if (clockIn && clockOut) {
                    const diff = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
                    hoursWorked = diff.toFixed(2);
                } else if (clockIn) {
                    hoursWorked = 'In Progress';
                }

                return (
                    <tr key={record.id}>
                        {isAdminView && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{record.employeeName}</td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{record.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                                {record.clockInTime}
                                {record.clockInLocation && <LocationPinIcon className="w-4 h-4 ml-2 text-green-500" />}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                           {record.clockOutTime ? (
                               <div className="flex items-center">
                                  {record.clockOutTime}
                                  {record.clockOutLocation && <LocationPinIcon className="w-4 h-4 ml-2 text-red-500" />}
                               </div>
                           ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                                    Active
                                </span>
                           )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{hoursWorked}</td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;