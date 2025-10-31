import { useState, useRef, useCallback } from 'react';
import { DataManagementService } from '../services/dataManagementService';
import { t } from '../i18n';

export default function useSettingsController() {
	const [showStorage, setShowStorage] = useState(false);
	const [storageInfo, setStorageInfo] = useState({ items: [], totalSize: '0 B', itemCount: 0 });
	const [expandedItems, setExpandedItems] = useState(new Set());
	const [activeSection, setActiveSection] = useState('appearance');
	const [showResetModal, setShowResetModal] = useState(false);
	const [toast, setToast] = useState(null);
	const fileInputRef = useRef(null);

	const showToast = useCallback((message, type = 'success') => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 3000);
	}, []);

	const handleShowStorage = useCallback(() => {
		if (!showStorage) {
			const info = DataManagementService.getStorageInfo();
			setStorageInfo(info);
		}
		setShowStorage(prev => !prev);
	}, [showStorage]);

	const toggleExpanded = useCallback((key) => {
		setExpandedItems(prev => {
			const newExpanded = new Set(prev);
			if (newExpanded.has(key)) {
				newExpanded.delete(key);
			} else {
				newExpanded.add(key);
			}
			return newExpanded;
		});
	}, []);

	const handleExportData = useCallback(() => {
		const result = DataManagementService.exportData();
		if (result.success) {
			showToast(t('toast.dataExported'));
		} else {
			showToast(result.message, 'error');
		}
	}, [showToast]);

	const handleImportData = useCallback(async (file) => {
		const result = await DataManagementService.importData(file);
		if (result.success) {
			showToast(t('toast.dataImported'));
			if (result.requiresReload) {
				setTimeout(() => window.location.reload(), 1500);
			}
		} else {
			showToast(result.message, 'error');
		}
	}, [showToast]);

	const handleResetData = useCallback(() => {
		const result = DataManagementService.resetAllData();
		if (result.success) {
			showToast(t('toast.dataReset'));
			setShowResetModal(false);
			if (result.requiresReload) {
				setTimeout(() => window.location.reload(), 1500);
			}
		} else {
			showToast(result.message, 'error');
		}
	}, [showToast]);

	const handleFileSelect = useCallback((event) => {
		const file = event.target.files && event.target.files[0];
		if (file) handleImportData(file);
	}, [handleImportData]);

	const handleDragOver = useCallback((event) => {
		event.preventDefault();
	}, []);

	const handleDrop = useCallback((event) => {
		event.preventDefault();
		const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
		if (file) handleImportData(file);
	}, [handleImportData]);

	return {
		// state
		showStorage,
		storageInfo,
		expandedItems,
		activeSection,
		showResetModal,
		toast,
		fileInputRef,

		// setters
		setShowStorage,
		setStorageInfo,
		setExpandedItems,
		setActiveSection,
		setShowResetModal,
		setToast,

		// handlers
		showToast,
		handleShowStorage,
		toggleExpanded,
		handleExportData,
		handleImportData,
		handleFileSelect,
		handleDragOver,
		handleDrop,
		handleResetData
	};
}
