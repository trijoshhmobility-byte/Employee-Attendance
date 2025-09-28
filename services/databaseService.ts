import { AttendanceRecord, WorkLogEntry, Employee, AppSettings } from '../types';

export interface TrijoshhDatabase {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  workLogs: WorkLogEntry[];
  settings: AppSettings[];
  backups: any[];
}

class IndexedDBService {
  private static instance: IndexedDBService;
  private db: IDBDatabase | null = null;
  private dbName = 'TrijoshhAttendanceDB';
  private dbVersion = 1;

  private constructor() {}

  public static getInstance(): IndexedDBService {
    if (!IndexedDBService.instance) {
      IndexedDBService.instance = new IndexedDBService();
    }
    return IndexedDBService.instance;
  }

  public async initializeDB(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported, falling back to localStorage');
        resolve(false);
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        resolve(false);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('employees')) {
          const employeesStore = db.createObjectStore('employees', { keyPath: 'id' });
          employeesStore.createIndex('employeeId', 'employeeId', { unique: true });
          employeesStore.createIndex('email', 'email', { unique: true });
          employeesStore.createIndex('department', 'department', { unique: false });
        }

        if (!db.objectStoreNames.contains('attendanceRecords')) {
          const attendanceStore = db.createObjectStore('attendanceRecords', { keyPath: 'id' });
          attendanceStore.createIndex('employeeId', 'employeeId', { unique: false });
          attendanceStore.createIndex('date', 'date', { unique: false });
          attendanceStore.createIndex('employeeDate', ['employeeId', 'date'], { unique: false });
        }

        if (!db.objectStoreNames.contains('workLogs')) {
          const workLogsStore = db.createObjectStore('workLogs', { keyPath: 'id' });
          workLogsStore.createIndex('employeeId', 'employeeId', { unique: false });
          workLogsStore.createIndex('priority', 'priority', { unique: false });
          workLogsStore.createIndex('isCompleted', 'isCompleted', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('backups')) {
          const backupsStore = db.createObjectStore('backups', { keyPath: 'id' });
          backupsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Generic CRUD operations
  public async save<T extends { id: string }>(storeName: keyof TrijoshhDatabase, data: T): Promise<boolean> {
    if (!this.db) {
      return this.fallbackToLocalStorage('save', storeName, data);
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error(`Error saving to ${storeName}:`, request.error);
        resolve(false);
      };
    });
  }

  public async saveMany<T extends { id: string }>(storeName: keyof TrijoshhDatabase, dataArray: T[]): Promise<boolean> {
    if (!this.db) {
      return this.fallbackToLocalStorage('saveMany', storeName, dataArray);
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      let completed = 0;
      let hasError = false;

      dataArray.forEach(data => {
        const request = store.put(data);
        request.onsuccess = () => {
          completed++;
          if (completed === dataArray.length && !hasError) {
            resolve(true);
          }
        };
        request.onerror = () => {
          hasError = true;
          resolve(false);
        };
      });

      if (dataArray.length === 0) {
        resolve(true);
      }
    });
  }

  public async getById<T>(storeName: keyof TrijoshhDatabase, id: string): Promise<T | null> {
    if (!this.db) {
      return this.fallbackToLocalStorage('getById', storeName, id);
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => {
        console.error(`Error getting from ${storeName}:`, request.error);
        resolve(null);
      };
    });
  }

  public async getAll<T>(storeName: keyof TrijoshhDatabase): Promise<T[]> {
    if (!this.db) {
      return this.fallbackToLocalStorage('getAll', storeName);
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        console.error(`Error getting all from ${storeName}:`, request.error);
        resolve([]);
      };
    });
  }

  public async getByIndex<T>(storeName: keyof TrijoshhDatabase, indexName: string, key: any): Promise<T[]> {
    if (!this.db) {
      return this.fallbackToLocalStorage('getByIndex', storeName, { indexName, key });
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(key);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        console.error(`Error getting by index from ${storeName}:`, request.error);
        resolve([]);
      };
    });
  }

  public async delete(storeName: keyof TrijoshhDatabase, id: string): Promise<boolean> {
    if (!this.db) {
      return this.fallbackToLocalStorage('delete', storeName, id);
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error(`Error deleting from ${storeName}:`, request.error);
        resolve(false);
      };
    });
  }

  public async clear(storeName: keyof TrijoshhDatabase): Promise<boolean> {
    if (!this.db) {
      return this.fallbackToLocalStorage('clear', storeName);
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error(`Error clearing ${storeName}:`, request.error);
        resolve(false);
      };
    });
  }

  // Attendance-specific methods
  public async getAttendanceByEmployee(employeeId: string): Promise<AttendanceRecord[]> {
    return this.getByIndex<AttendanceRecord>('attendanceRecords', 'employeeId', employeeId);
  }

  public async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    return this.getByIndex<AttendanceRecord>('attendanceRecords', 'date', date);
  }

  public async getAttendanceByEmployeeAndDate(employeeId: string, date: string): Promise<AttendanceRecord[]> {
    return this.getByIndex<AttendanceRecord>('attendanceRecords', 'employeeDate', [employeeId, date]);
  }

  public async getWorkLogsByEmployee(employeeId: string): Promise<WorkLogEntry[]> {
    return this.getByIndex<WorkLogEntry>('workLogs', 'employeeId', employeeId);
  }

  public async getPendingTasks(employeeId?: string): Promise<WorkLogEntry[]> {
    const allLogs = await this.getByIndex<WorkLogEntry>('workLogs', 'isCompleted', false);
    return employeeId ? allLogs.filter(log => log.employeeId === employeeId) : allLogs;
  }

  // Backup and sync methods
  public async createBackup(): Promise<string> {
    const backup = {
      id: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      data: {
        employees: await this.getAll<Employee>('employees'),
        attendanceRecords: await this.getAll<AttendanceRecord>('attendanceRecords'),
        workLogs: await this.getAll<WorkLogEntry>('workLogs'),
        settings: await this.getAll<AppSettings>('settings')
      }
    };

    await this.save('backups', backup);
    return backup.id;
  }

  public async restoreFromBackup(backupId: string): Promise<boolean> {
    try {
      const backup = await this.getById<any>('backups', backupId);
      if (!backup) return false;

      // Clear existing data
      await Promise.all([
        this.clear('employees'),
        this.clear('attendanceRecords'),
        this.clear('workLogs'),
        this.clear('settings')
      ]);

      // Restore data
      await Promise.all([
        this.saveMany('employees', backup.data.employees),
        this.saveMany('attendanceRecords', backup.data.attendanceRecords),
        this.saveMany('workLogs', backup.data.workLogs),
        this.saveMany('settings', backup.data.settings)
      ]);

      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  public async getBackups(): Promise<any[]> {
    return this.getAll('backups');
  }

  // Fallback to localStorage when IndexedDB is not available
  private fallbackToLocalStorage(operation: string, storeName: keyof TrijoshhDatabase, data?: any): any {
    const key = `trijoshh_${storeName}`;

    try {
      switch (operation) {
        case 'save':
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          const index = existing.findIndex((item: any) => item.id === data.id);
          if (index >= 0) {
            existing[index] = data;
          } else {
            existing.push(data);
          }
          localStorage.setItem(key, JSON.stringify(existing));
          return true;

        case 'saveMany':
          localStorage.setItem(key, JSON.stringify(data));
          return true;

        case 'getById':
          const items = JSON.parse(localStorage.getItem(key) || '[]');
          return items.find((item: any) => item.id === data) || null;

        case 'getAll':
          return JSON.parse(localStorage.getItem(key) || '[]');

        case 'getByIndex':
          const allItems = JSON.parse(localStorage.getItem(key) || '[]');
          if (data.indexName === 'employeeId') {
            return allItems.filter((item: any) => item.employeeId === data.key);
          }
          if (data.indexName === 'date') {
            return allItems.filter((item: any) => item.date === data.key);
          }
          return allItems;

        case 'delete':
          const currentItems = JSON.parse(localStorage.getItem(key) || '[]');
          const filteredItems = currentItems.filter((item: any) => item.id !== data);
          localStorage.setItem(key, JSON.stringify(filteredItems));
          return true;

        case 'clear':
          localStorage.removeItem(key);
          return true;

        default:
          return false;
      }
    } catch (error) {
      console.error(`LocalStorage fallback error for ${operation}:`, error);
      return operation === 'getAll' || operation === 'getByIndex' ? [] : false;
    }
  }

  // Check if IndexedDB is being used
  public isUsingIndexedDB(): boolean {
    return this.db !== null;
  }

  // Get storage info
  public async getStorageInfo(): Promise<{ isIndexedDB: boolean; storageEstimate?: StorageEstimate }> {
    const info: { isIndexedDB: boolean; storageEstimate?: StorageEstimate } = {
      isIndexedDB: this.isUsingIndexedDB()
    };

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        info.storageEstimate = await navigator.storage.estimate();
      } catch (error) {
        console.warn('Could not get storage estimate:', error);
      }
    }

    return info;
  }
}

export default IndexedDBService;