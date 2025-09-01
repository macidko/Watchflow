// Test script for export/import functionality
// Run this in browser console

console.log('=== WATCHFLOW EXPORT/IMPORT TEST ===');

// Check localStorage keys
console.log('Available localStorage keys:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`${i + 1}. ${key}`);
}

// Check specific keys
const zustandKey = 'content-tracker-storage';
const zustandData = localStorage.getItem(zustandKey);

if (zustandData) {
  console.log('\n=== ZUSTAND DATA ANALYSIS ===');
  const parsed = JSON.parse(zustandData);
  console.log('Type:', typeof parsed);
  console.log('Has state:', !!parsed.state);
  console.log('Version:', parsed.version);

  if (parsed.state) {
    console.log('State keys:', Object.keys(parsed.state));
    console.log('Pages count:', Object.keys(parsed.state.pages || {}).length);
    console.log('Statuses count:', Object.keys(parsed.state.statuses || {}).length);
    console.log('Contents count:', Object.keys(parsed.state.contents || {}).length);
  }
} else {
  console.log('❌ Zustand data not found!');
}

// Check settings
console.log('\n=== SETTINGS CHECK ===');
const settings = {
  theme: localStorage.getItem('watchflow_theme'),
  accentColor: localStorage.getItem('watchflow_accent_color'),
  language: localStorage.getItem('watchflow_language')
};
console.log('Settings:', settings);

// Test export simulation
console.log('\n=== EXPORT SIMULATION ===');
const exportData = {
  zustand: zustandData ? JSON.parse(zustandData) : null,
  settings: settings,
  metadata: {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    appName: 'Watchflow'
  }
};

console.log('Export data structure:');
console.log('- Zustand data:', !!exportData.zustand);
console.log('- Settings:', !!exportData.settings);
console.log('- Metadata:', !!exportData.metadata);

const jsonString = JSON.stringify(exportData, null, 2);
console.log('Total JSON size:', jsonString.length, 'characters');
console.log('Estimated file size:', Math.round(jsonString.length / 1024), 'KB');
