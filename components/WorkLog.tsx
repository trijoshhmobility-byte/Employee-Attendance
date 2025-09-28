
import React, { useState, useMemo } from 'react';
import { WorkLogEntry, Priority } from '../types';
import { summarizeWorkLogs } from '../services/geminiService';
import Spinner from './Spinner';
import Modal from './Modal';
import { downloadCSV } from '../utils/csv';
import { DownloadIcon, EditIcon, TrashIcon, SaveIcon, CancelIcon } from './icons';


interface WorkLogProps {
  logs: WorkLogEntry[];
  onAddLog: (task: string, priority: Priority) => void;
  onEditLog?: (id: string, task: string, priority: Priority) => void;
  onDeleteLog?: (id: string) => void;
  isClockedIn: boolean;
}

const getPriorityBadgeColor = (priority: Priority) => {
    switch (priority) {
        case Priority.High: return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
        case Priority.Critical: return 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100 animate-pulse';
        case Priority.Medium: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
        case Priority.Low: return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
}


const WorkLog: React.FC<WorkLogProps> = ({ logs, onAddLog, onEditLog, onDeleteLog, isClockedIn }) => {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>(Priority.Medium);
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number | ''>('');
  const [category, setCategory] = useState('');

  const filteredLogs = useMemo(() => {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
    if (!startDate && !endDate) {
        const today = new Date().toISOString().split('T')[0];
        return sortedLogs.filter(log => new Date(log.id).toISOString().split('T')[0] === today);
    }
    return sortedLogs.filter(log => {
        const logDateStr = new Date(log.id).toISOString().split('T')[0];
        return (!startDate || logDateStr >= startDate) && (!endDate || logDateStr <= endDate);
    });
  }, [logs, startDate, endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim()) {
      onAddLog(task.trim(), priority);
      setTask('');
      setDescription('');
      setEstimatedHours('');
      setCategory('');
      setPriority(Priority.Medium);
    }
  };

  const handleEdit = (log: WorkLogEntry) => {
    setEditingId(log.id);
    setEditTask(log.task);
    setEditPriority(log.priority);
  };

  const handleSaveEdit = () => {
    if (editingId && editTask.trim() && onEditLog) {
      onEditLog(editingId, editTask.trim(), editPriority);
      setEditingId(null);
      setEditTask('');
      setEditPriority(Priority.Medium);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTask('');
    setEditPriority(Priority.Medium);
  };

  const handleDelete = (id: string) => {
    if (onDeleteLog && window.confirm('Are you sure you want to delete this work log?')) {
      onDeleteLog(id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };
  
  const handleSummarize = async () => {
      setIsSummarizing(true);
      const result = await summarizeWorkLogs(filteredLogs);
      setSummary(result);
      setIsSummarizing(false);
      setShowModal(true);
  };

  const handleClearFilters = () => {
      setStartDate('');
      setEndDate('');
  };

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      alert('No logs to export');
      return;
    }

    const exportData = filteredLogs.map(log => ({
      Date: new Date(log.id).toLocaleDateString(),
      Time: log.timestamp,
      Task: log.task,
      Description: log.description || 'N/A',
      Priority: log.priority,
      Category: log.category || 'General',
      'Estimated Hours': log.estimatedHours || 'N/A',
      'Actual Hours': log.actualHours || 'N/A',
      Status: log.isCompleted ? 'Completed' : 'In Progress',
      Employee: log.employeeName
    }));

    const filename = `trijoshh_work_logs_${startDate || 'all'}_to_${endDate || 'today'}.csv`;
    downloadCSV(exportData, filename);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Add Work Log</h2>
        {isClockedIn ? (
            <form onSubmit={handleSubmit} className="space-y-4" onKeyPress={handleKeyPress}>
              <div>
                <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="task-description"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Enter task title (Ctrl+Enter to submit quickly)..."
                    rows={2}
                    required
                    maxLength={200}
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">{task.length}/200 characters</div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description (Optional)
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add detailed description..."
                    rows={3}
                    maxLength={500}
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <div className="text-xs text-gray-500 mt-1">{description.length}/500 characters</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                   <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                   <select
                      id="priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                   >
                      <option value={Priority.Low}>🟢 Low</option>
                      <option value={Priority.Medium}>🟡 Medium</option>
                      <option value={Priority.High}>🔴 High</option>
                      <option value={Priority.Critical}>🚨 Critical</option>
                   </select>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  >
                    <option value="">Select Category</option>
                    <option value="Development">💻 Development</option>
                    <option value="Meeting">🤝 Meeting</option>
                    <option value="Documentation">📝 Documentation</option>
                    <option value="Testing">🧪 Testing</option>
                    <option value="Support">🛠️ Support</option>
                    <option value="Training">📚 Training</option>
                    <option value="Other">📋 Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="estimated-hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Est. Hours</label>
                  <input
                    id="estimated-hours"
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="2.5"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                </div>
              </div>
              
            <button
                type="submit"
                disabled={!task.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
            >
                ✍️ Add Work Log
            </button>
            
            <div className="text-xs text-gray-500 text-center">
              💡 Tip: Use Ctrl+Enter for quick submission
            </div>
            </form>
        ) : (
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-4xl mb-4">🔒</div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">You must be clocked in to add work logs.</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Clock in from the Dashboard to start logging your work.</p>
            </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Work Log History</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
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
            <button onClick={handleClearFilters} className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-2.5 rounded-lg transition duration-300">
                Clear Filters
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
             <button 
                onClick={handleSummarize}
                disabled={isSummarizing || filteredLogs.length === 0}
                className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
                {isSummarizing ? <Spinner /> : <><span className="mr-2">📊</span>Summarize</>}
            </button>
            <button 
                onClick={handleExport}
                disabled={filteredLogs.length === 0}
                className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-green-400 disabled:cursor-not-allowed"
            >
                <DownloadIcon className="w-4 h-4 mr-2"/>
                Export CSV
            </button>
            <button 
                onClick={() => {
                    const jsonData = JSON.stringify(filteredLogs, null, 2);
                    const blob = new Blob([jsonData], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `trijoshh_work_logs_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                }}
                disabled={filteredLogs.length === 0}
                className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
                <span className="mr-2">📄</span>Export JSON
            </button>
        </div>
        
        <div className="flex-grow overflow-hidden">
            {filteredLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No logs for the selected period.</p>
                </div>
            ) : (
            <ul className="space-y-3 h-full overflow-y-auto pr-2">
                {filteredLogs.map(log => (
                <li key={log.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    {editingId === log.id ? (
                        // Edit Mode
                        <div className="space-y-3">
                            <div>
                                <textarea
                                    value={editTask}
                                    onChange={(e) => setEditTask(e.target.value)}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
                                    rows={2}
                                    maxLength={200}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <select
                                    value={editPriority}
                                    onChange={(e) => setEditPriority(e.target.value as Priority)}
                                    className="p-1 text-xs border border-gray-300 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
                                >
                                    <option value={Priority.Low}>🟢 Low</option>
                                    <option value={Priority.Medium}>🟡 Medium</option>
                                    <option value={Priority.High}>🔴 High</option>
                                    <option value={Priority.Critical}>🚨 Critical</option>
                                </select>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-800 rounded transition-colors"
                                        title="Save changes"
                                    >
                                        <SaveIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                                        title="Cancel editing"
                                    >
                                        <CancelIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // View Mode
                        <div>
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <div className="flex-grow">
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">{log.task}</h4>
                                    {log.description && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{log.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span>📅 {new Date(log.id).toLocaleDateString()}</span>
                                        <span>🕐 {log.timestamp}</span>
                                        {log.category && <span>📁 {log.category}</span>}
                                        {log.estimatedHours && <span>⏱️ {log.estimatedHours}h</span>}
                                        {log.actualHours && <span>✅ {log.actualHours}h</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getPriorityBadgeColor(log.priority)}`}>
                                        {log.priority === Priority.Low && '🟢'}
                                        {log.priority === Priority.Medium && '🟡'}
                                        {log.priority === Priority.High && '🔴'}
                                        {log.priority === Priority.Critical && '🚨'}
                                        {' '}{log.priority}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                {onEditLog && (
                                    <button
                                        onClick={() => handleEdit(log)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors"
                                        title="Edit this log"
                                    >
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                )}
                                {onDeleteLog && (
                                    <button
                                        onClick={() => handleDelete(log.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-800 rounded-md transition-colors"
                                        title="Delete this log"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </li>
                ))}
            </ul>
            )}
        </div>
      </div>

      {showModal && (
        <Modal title="Work Summary" onClose={() => setShowModal(false)}>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{summary}</p>
        </Modal>
      )}
    </div>
  );
};

export default WorkLog;