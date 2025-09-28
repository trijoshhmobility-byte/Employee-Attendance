import IndexedDBService from './databaseService';
import EmployeeService from './employeeService';
import { AttendanceRecord, WorkLogEntry, Employee } from '../types';

interface BackupData {
  id: string;
  timestamp: string;
  version: string;
  data: {
    employees: Employee[];
    attendanceRecords: AttendanceRecord[];
    workLogs: WorkLogEntry[];
    settings: any[];
  };
  metadata: {
    totalRecords: number;
    createdBy: string;
    deviceInfo: string;
  };
}

class BackupSyncService {
  private static instance: BackupSyncService;
  private dbService: IndexedDBService;
  private employeeService: EmployeeService;

  private constructor() {
    this.dbService = IndexedDBService.getInstance();
    this.employeeService = EmployeeService.getInstance();
  }

  public static getInstance(): BackupSyncService {
    if (!BackupSyncService.instance) {
      BackupSyncService.instance = new BackupSyncService();
    }
    return BackupSyncService.instance;
  }

  // Create comprehensive backup
  public async createFullBackup(): Promise<string> {
    try {
      const backupData: BackupData = {
        id: `backup_${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
          employees: await this.dbService.getAll<Employee>('employees'),
          attendanceRecords: await this.dbService.getAll<AttendanceRecord>('attendanceRecords'),
          workLogs: await this.dbService.getAll<WorkLogEntry>('workLogs'),
          settings: await this.dbService.getAll('settings')
        },
        metadata: {
          totalRecords: 0,
          createdBy: this.getCurrentUser(),
          deviceInfo: this.getDeviceInfo()
        }
      };

      // Calculate total records
      backupData.metadata.totalRecords = 
        backupData.data.employees.length +
        backupData.data.attendanceRecords.length +
        backupData.data.workLogs.length +
        backupData.data.settings.length;

      // Save backup to IndexedDB
      await this.dbService.save('backups', backupData);

      // Also save to localStorage as additional backup
      this.saveToLocalStorage(backupData);

      return backupData.id;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  // Restore from backup
  public async restoreFromBackup(backupId: string): Promise<boolean> {
    try {
      const backup = await this.dbService.getById<BackupData>('backups', backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Validate backup data
      if (!this.validateBackupData(backup)) {
        throw new Error('Invalid backup data');
      }

      // Clear existing data
      await Promise.all([
        this.dbService.clear('employees'),
        this.dbService.clear('attendanceRecords'),
        this.dbService.clear('workLogs'),
        this.dbService.clear('settings')
      ]);

      // Restore data
      await Promise.all([
        this.dbService.saveMany('employees', backup.data.employees),
        this.dbService.saveMany('attendanceRecords', backup.data.attendanceRecords),
        this.dbService.saveMany('workLogs', backup.data.workLogs),
        this.dbService.saveMany('settings', backup.data.settings)
      ]);

      // Also update localStorage
      localStorage.setItem('attendanceHistory', JSON.stringify(backup.data.attendanceRecords));
      localStorage.setItem('workLogs', JSON.stringify(backup.data.workLogs));

      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  // Export backup to file
  public async exportBackupToFile(backupId: string): Promise<void> {
    try {
      const backup = await this.dbService.getById<BackupData>('backups', backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      const dataStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `trijoshh-backup-${backup.timestamp.split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting backup:', error);
      throw new Error('Failed to export backup');
    }
  }

  // Import backup from file
  public async importBackupFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const backupData = JSON.parse(event.target?.result as string) as BackupData;
          
          if (!this.validateBackupData(backupData)) {
            throw new Error('Invalid backup file format');
          }

          // Generate new ID to avoid conflicts
          backupData.id = `imported_${Date.now()}`;
          
          // Save imported backup
          await this.dbService.save('backups', backupData);
          
          resolve(backupData.id);
        } catch (error) {
          reject(new Error('Failed to import backup file'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read backup file'));
      reader.readAsText(file);
    });
  }

  // Auto backup functionality
  public setupAutoBackup(intervalHours: number = 24): void {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    setInterval(async () => {
      try {
        const backupId = await this.createFullBackup();
        console.log(`Auto backup created: ${backupId}`);
        
        // Clean old backups (keep last 10)
        await this.cleanOldBackups();
      } catch (error) {
        console.error('Auto backup failed:', error);
      }
    }, intervalMs);
  }

  // Clean old backups
  public async cleanOldBackups(keepCount: number = 10): Promise<void> {
    try {
      const allBackups = await this.dbService.getAll<BackupData>('backups');
      
      if (allBackups.length <= keepCount) return;
      
      // Sort by timestamp and keep only the latest ones
      const sortedBackups = allBackups.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      const backupsToDelete = sortedBackups.slice(keepCount);
      
      for (const backup of backupsToDelete) {
        await this.dbService.delete('backups', backup.id);
      }
      
      console.log(`Cleaned ${backupsToDelete.length} old backups`);
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }

  // Get all backups
  public async getAllBackups(): Promise<BackupData[]> {
    try {
      const backups = await this.dbService.getAll<BackupData>('backups');
      return backups.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error getting backups:', error);
      return [];
    }
  }

  // Sync data between devices (basic implementation)
  public async syncData(): Promise<void> {
    // This is a placeholder for future cloud sync functionality
    // For now, we'll use localStorage as a simple sync mechanism
    try {
      // Export current data to localStorage
      const currentData = {
        employees: await this.dbService.getAll<Employee>('employees'),
        attendanceRecords: await this.dbService.getAll<AttendanceRecord>('attendanceRecords'),
        workLogs: await this.dbService.getAll<WorkLogEntry>('workLogs'),
        lastSync: new Date().toISOString()
      };

      localStorage.setItem('trijoshh_sync_data', JSON.stringify(currentData));
      console.log('Data synced to localStorage');
    } catch (error) {
      console.error('Sync failed:', error);
      throw new Error('Data sync failed');
    }
  }

  // Validate backup data structure
  private validateBackupData(backup: BackupData): boolean {
    return !!(
      backup.id &&
      backup.timestamp &&
      backup.data &&
      Array.isArray(backup.data.employees) &&
      Array.isArray(backup.data.attendanceRecords) &&
      Array.isArray(backup.data.workLogs)
    );
  }

  // Get current user info
  private getCurrentUser(): string {
    try {
      const userStr = localStorage.getItem('trijoshh_current_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.name || 'Unknown';
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return 'System';
  }

  // Get device info
  private getDeviceInfo(): string {
    return `${navigator.userAgent.substring(0, 100)}...`;
  }

  // Save backup to localStorage as fallback
  private saveToLocalStorage(backup: BackupData): void {
    try {
      const existingBackups = JSON.parse(localStorage.getItem('trijoshh_backups') || '[]');
      existingBackups.push({
        id: backup.id,
        timestamp: backup.timestamp,
        size: JSON.stringify(backup).length
      });
      
      // Keep only last 5 backup references in localStorage
      if (existingBackups.length > 5) {
        existingBackups.splice(0, existingBackups.length - 5);
      }
      
      localStorage.setItem('trijoshh_backups', JSON.stringify(existingBackups));
      localStorage.setItem(`trijoshh_backup_${backup.id}`, JSON.stringify(backup));
    } catch (error) {
      console.error('Error saving backup to localStorage:', error);
    }
  }

  // Get backup statistics
  public async getBackupStats(): Promise<{
    totalBackups: number;
    latestBackup: string | null;
    totalSize: number;
    autoBackupEnabled: boolean;
  }> {
    try {
      const backups = await this.getAllBackups();
      const totalSize = JSON.stringify(backups).length;
      
      return {
        totalBackups: backups.length,
        latestBackup: backups.length > 0 ? backups[0].timestamp : null,
        totalSize,
        autoBackupEnabled: !!localStorage.getItem('trijoshh_auto_backup_enabled')
      };
    } catch (error) {
      console.error('Error getting backup stats:', error);
      return {
        totalBackups: 0,
        latestBackup: null,
        totalSize: 0,
        autoBackupEnabled: false
      };
    }
  }
}

export default BackupSyncService;