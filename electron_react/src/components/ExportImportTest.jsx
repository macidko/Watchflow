import React, { useState, useEffect } from 'react';
import { DataManagementService } from '../services/dataManagementService';

const ExportImportTest = () => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get initial storage info
    const info = DataManagementService.getStorageInfo();
    setStorageInfo(info);
  }, []);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, {
      test,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runStorageCheck = () => {
    setIsLoading(true);
    try {
      const info = DataManagementService.getStorageInfo();
      setStorageInfo(info);

      // Check if zustand data exists
      const zustandItem = info.items.find(item => item.key === 'content-tracker-storage');
      if (zustandItem) {
        addTestResult('Zustand Storage Check', 'PASS', `Found ${zustandItem.size} of data`);
      } else {
        addTestResult('Zustand Storage Check', 'FAIL', 'No zustand data found');
      }

      // Check settings
      const settingsKeys = ['watchflow_theme', 'watchflow_accent_color', 'watchflow_language'];
      const foundSettings = settingsKeys.filter(key =>
        info.items.some(item => item.key === key)
      );

      addTestResult('Settings Check', foundSettings.length > 0 ? 'PASS' : 'WARN',
        `Found ${foundSettings.length}/${settingsKeys.length} settings`);

    } catch (error) {
      addTestResult('Storage Check', 'ERROR', error.message);
    }
    setIsLoading(false);
  };

  const testExport = () => {
    setIsLoading(true);
    try {
      const result = DataManagementService.exportData();
      addTestResult('Export Test', result.success ? 'PASS' : 'FAIL', result.message);
    } catch (error) {
      addTestResult('Export Test', 'ERROR', error.message);
    }
    setIsLoading(false);
  };

  const resetAndInitializeStore = () => {
    setIsLoading(true);
    try {
      // Clear zustand data
      localStorage.removeItem('content-tracker-storage');
      
      // Reload page to reinitialize store
      window.location.reload();
    } catch (error) {
      addTestResult('Reset Store', 'ERROR', error.message);
      setIsLoading(false);
    }
  };

  const checkZustandDirectly = () => {
    setIsLoading(true);
    try {
      const zustandData = localStorage.getItem('content-tracker-storage');
      
      if (zustandData) {
        const parsed = JSON.parse(zustandData);
        addTestResult('Direct Zustand Check', 'PASS', 
          `Found data with ${Object.keys(parsed.state?.pages || {}).length} pages, ${Object.keys(parsed.state?.statuses || {}).length} statuses, ${Object.keys(parsed.state?.contents || {}).length} contents`);
      } else {
        addTestResult('Direct Zustand Check', 'FAIL', 'No zustand data found in localStorage');
      }
    } catch (error) {
      addTestResult('Direct Zustand Check', 'ERROR', error.message);
    }
    setIsLoading(false);
  };

  const forceInitializeStore = () => {
    setIsLoading(true);
    try {
      // Import store and force initialize
      import('../config/initialData').then(({ default: useContentStore }) => {
        const store = useContentStore.getState();
        store.initializeStore();
        
        // Wait a bit and check again
        setTimeout(() => {
          checkZustandDirectly();
          setIsLoading(false);
        }, 1000);
      });
    } catch (error) {
      addTestResult('Force Initialize', 'ERROR', error.message);
      setIsLoading(false);
    }
  };

  const testImport = () => {
    // Create a test import file
    const testData = {
      zustand: {
        state: {
          pages: { test: 'test page' },
          statuses: {},
          contents: {}
        },
        version: 1
      },
      settings: {
        theme: 'dark',
        accentColor: '#1976d2',
        language: 'tr'
      },
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        appName: 'Watchflow'
      }
    };

    const jsonString = JSON.stringify(testData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], 'test-import.json', { type: 'application/json' });

    setIsLoading(true);
    DataManagementService.importData(file).then(result => {
      addTestResult('Import Test', result.success ? 'PASS' : 'FAIL', result.message);
      setIsLoading(false);
    }).catch(error => {
      addTestResult('Import Test', 'ERROR', error.message);
      setIsLoading(false);
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', marginTop: '84px' }}>
      <h2>Export/Import Test Suite</h2>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={runStorageCheck} disabled={isLoading}>
          Check Storage
        </button>
        <button onClick={checkZustandDirectly} disabled={isLoading} style={{ marginLeft: '10px' }}>
          Check Zustand Direct
        </button>
        <button onClick={forceInitializeStore} disabled={isLoading} style={{ marginLeft: '10px' }}>
          Force Initialize
        </button>
        <button onClick={testExport} disabled={isLoading} style={{ marginLeft: '10px' }}>
          Test Export
        </button>
        <button onClick={testImport} disabled={isLoading} style={{ marginLeft: '10px' }}>
          Test Import
        </button>
        <button onClick={resetAndInitializeStore} disabled={isLoading} style={{ marginLeft: '10px', backgroundColor: '#ff6b6b', color: 'white' }}>
          Reset Store
        </button>
      </div>

      {storageInfo && (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>Storage Info</h3>
          <p>Total Items: {storageInfo.itemCount}</p>
          <p>Total Size: {storageInfo.totalSize}</p>
          <details>
            <summary>Items ({storageInfo.items.length})</summary>
            <ul>
              {storageInfo.items.map((item, index) => (
                <li key={index}>
                  <strong>{item.key}</strong> - {item.size}
                  <br />
                  <small>{item.preview}</small>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}

      <div>
        <h3>Test Results</h3>
        {testResults.length === 0 ? (
          <p>No tests run yet</p>
        ) : (
          <ul>
            {testResults.map((result, index) => (
              <li key={index} style={{
                color: result.result === 'PASS' ? 'green' :
                       result.result === 'FAIL' ? 'red' :
                       result.result === 'WARN' ? 'orange' : 'black'
              }}>
                <strong>{result.test}</strong> [{result.result}] - {result.timestamp}
                {result.details && <br />}
                {result.details && <small>{result.details}</small>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExportImportTest;
