import { STORAGE_KEYS, DOWNLOADS } from '../config/constants';

export class DataManagementService {
  /**
   * Export all user data as JSON
   */
  static exportData() {
    try {
      // Get all data from localStorage
      const data = {};
      
      // Export Zustand store (main content data)
      const zustandData = localStorage.getItem(STORAGE_KEYS.ZUSTAND);
      if (zustandData) {
        data.zustand = JSON.parse(zustandData);
      }
      
      // Export settings
      const settings = {
        theme: localStorage.getItem('watchflow_theme') || 'dark',
        accentColor: localStorage.getItem('watchflow_accent_color') || 'blue',
        language: localStorage.getItem('watchflow_language') || 'tr'
      };
      data.settings = settings;
      
      // Add metadata
      data.metadata = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        appName: 'Watchflow'
      };
      
      // Create and download file
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `watchflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true, message: 'Data exported successfully' };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, message: 'Export failed: ' + error.message };
    }
  }
  
  /**
   * Import data from JSON file
   */
  static async importData(file) {
    try {
      // Validate file type
      if (!file.name.endsWith('.json')) {
        throw new Error('Invalid file type. Please select a JSON file.');
      }
      
      // Read file content
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate data structure
      if (!data.metadata || data.metadata.appName !== 'Watchflow') {
        throw new Error('Invalid backup file. This doesn\'t appear to be a Watchflow backup.');
      }
      
      // Backup current data before import
      const currentBackup = this.createBackup();
      
      try {
        // Import Zustand data
        if (data.zustand) {
          localStorage.setItem(STORAGE_KEYS.ZUSTAND, JSON.stringify(data.zustand));
        }
        
        // Import settings
        if (data.settings) {
          // Handle null values with defaults
          const theme = data.settings.theme !== null ? data.settings.theme : 'dark';
          const accentColor = data.settings.accentColor || 'blue';
          const language = data.settings.language !== null ? data.settings.language : 'tr';
          
          localStorage.setItem('watchflow_theme', theme);
          localStorage.setItem('watchflow_accent_color', accentColor);
          localStorage.setItem('watchflow_language', language);
        }
        
        return { 
          success: true, 
          message: 'Data imported successfully. Page will reload to apply changes.',
          requiresReload: true
        };
      } catch (importError) {
        // Restore backup if import fails
        this.restoreBackup(currentBackup);
        throw importError;
      }
      
    } catch (error) {
      console.error('Import failed:', error);
      return { success: false, message: 'Import failed: ' + error.message };
    }
  }
  
  /**
   * Reset all application data
   */
  static resetAllData() {
    try {
      // Clear all localStorage data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      return { 
        success: true, 
        message: 'All data has been reset. Page will reload.',
        requiresReload: true
      };
    } catch (error) {
      console.error('Reset failed:', error);
      return { success: false, message: 'Reset failed: ' + error.message };
    }
  }
  
  /**
   * Get storage information
   */
  static getStorageInfo() {
    try {
      const info = [];
      let totalSize = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          const size = new Blob([value]).size;
          totalSize += size;
          
          info.push({
            key,
            size: this.formatBytes(size),
            preview: value.length > 100 ? value.substring(0, 100) + '...' : value
          });
        }
      }
      
      return {
        items: info,
        totalSize: this.formatBytes(totalSize),
        itemCount: info.length
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { items: [], totalSize: '0 B', itemCount: 0 };
    }
  }
  
  /**
   * Create internal backup (for rollback purposes)
   */
  static createBackup() {
    const backup = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        backup[key] = localStorage.getItem(key);
      }
    }
    return backup;
  }
  
  /**
   * Restore from internal backup
   */
  static restoreBackup(backup) {
    // Clear current data
    localStorage.clear();
    
    // Restore backup
    Object.entries(backup).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }
  
  /**
   * Format bytes to human readable format
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
