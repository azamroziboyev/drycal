import { useState, useEffect, useMemo, useRef } from 'react';
import {
  CalibrationItemInfo,
  ChamberPointData,
  SavedCertificate,
  LoginAuditLog,
} from './types';
import {
  EMPTY_CALIBRATION_INFO,
  createEmptyChamberPoints,
  calculateChamberKU10Uncertainty,
} from './utils/metrology';
import {
  getAuthSession,
  clearAuthSession,
  getSavedCertificates,
  saveCertificate,
  deleteCertificate,
  saveAllCertificates,
  getAuditLogs,
  recordAuditLog,
} from './utils/storage';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { CalibrationForm } from './components/CalibrationForm';
import { OfficialCertificateView } from './components/OfficialCertificateView';
import { PrimaryDataProtocolView } from './components/PrimaryDataProtocolView';
import { HistoryArchiveView } from './components/HistoryArchiveView';
import { DeviceAuditLogView } from './components/DeviceAuditLogView';

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return true;
      }
    }
    return getAuthSession().isAuthenticated;
  });

  const [username, setUsername] = useState<string>(() => {
    return getAuthSession().username || 'metrologiya';
  });

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('metrologiya_theme_mode');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('metrologiya_theme_mode', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('metrologiya_theme_mode', 'light');
    }
  }, [isDarkMode]);

  // Active navigation tab (left sidebar)
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculate');

  // Form states - initialized completely blank per user request
  const [info, setInfo] = useState<CalibrationItemInfo>(EMPTY_CALIBRATION_INFO);
  const [pointsData, setPointsData] = useState<ChamberPointData[]>(createEmptyChamberPoints);

  // Auto-save status and last saved time
  const [, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string>('');

  // Saved Certificates and Audit Logs
  const [savedCerts, setSavedCerts] = useState<SavedCertificate[]>([]);
  const [auditLogs, setAuditLogs] = useState<LoginAuditLog[]>([]);

  useEffect(() => {
    setSavedCerts(getSavedCertificates());
    setAuditLogs(getAuditLogs());
  }, []);

  // Compute metrological uncertainty on the fly according to DIN EN 60068-3-5 / EURAMET cg-20
  const calculation = useMemo(() => {
    return calculateChamberKU10Uncertainty(pointsData, info);
  }, [pointsData, info]);

  // Initial load tracking to avoid immediate redundant save on mount
  const isInitialMount = useRef(true);

  // Automatic saving into database (localStorage) whenever pointsData or info change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only auto-save if user entered actual data
    const hasData =
      info.objectName.trim() !== '' ||
      info.objectType.trim() !== '' ||
      info.serialNumber.trim() !== '' ||
      pointsData.some((p) => p.rows.some((r) => r.tStd !== '' && r.tStd !== 0));
    if (!hasData) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      saveCertificate(info, pointsData, calculation);
      setSavedCerts(getSavedCertificates());
      setAutoSaveStatus('saved');

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setLastAutoSavedTime(
        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      );
    }, 600);

    return () => clearTimeout(timer);
  }, [info, pointsData, calculation]);

  // Auth handlers
  const handleLoginSuccess = (uname: string) => {
    setUsername(uname);
    setIsAuthenticated(true);
    setAuditLogs(getAuditLogs());
  };

  const handleLogout = () => {
    recordAuditLog(username, 'Chiqish', 'Foydalanuvchi tizimdan chiqdi');
    clearAuthSession();
    setIsAuthenticated(false);
    setAuditLogs(getAuditLogs());
  };

  // Generate certificate: compute uncertainty, save immediately, and navigate to certificate view
  const handleGenerateCertificate = () => {
    saveCertificate(info, pointsData, calculation);
    setSavedCerts(getSavedCertificates());
    setActiveTab('certificate');
  };

  // Immediate save helper (e.g. before PDF download)
  const handleImmediateSave = () => {
    saveCertificate(info, pointsData, calculation);
    setSavedCerts(getSavedCertificates());
    setAutoSaveStatus('saved');
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    setLastAutoSavedTime(
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    );
  };

  // Load a certificate from archive back into editor
  const handleLoadCertificate = (cert: SavedCertificate) => {
    setInfo(cert.info);
    if (cert.pointsData && Array.isArray(cert.pointsData)) {
      setPointsData(cert.pointsData);
    }
    setActiveTab('certificate');
  };

  // Delete certificate from archive
  const handleDeleteCertificate = (id: string) => {
    const updated = deleteCertificate(id);
    setSavedCerts(updated);
  };

  // Import backup certificates
  const handleImportBackup = (imported: SavedCertificate[]) => {
    saveAllCertificates(imported);
    setSavedCerts(imported);
  };

  // Clear audit logs
  const handleClearAuditLogs = () => {
    localStorage.removeItem('metrologiya_audit_logs_v1');
    setAuditLogs([]);
  };

  // If not logged in, render the login security screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Left Sidebar Panel */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        username={username}
        onLogout={handleLogout}
        savedCertCount={savedCerts.length}
        lastAutoSavedTime={lastAutoSavedTime}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Tab 1: Calibration Form & 3D Cube Chamber */}
          {activeTab === 'calculate' && (
            <CalibrationForm
              info={info}
              setInfo={setInfo}
              pointsData={pointsData}
              setPointsData={setPointsData}
              calculation={calculation}
              onGenerateCertificate={handleGenerateCertificate}
            />
          )}

          {/* Tab 2: Official 4-page Certificate (UZ_demonstratsiya style with PDF download) */}
          {activeTab === 'certificate' && (
            <OfficialCertificateView
              info={info}
              calculation={calculation}
              pointsData={pointsData}
              onBackToEdit={() => setActiveTab('calculate')}
              onSaveCertificate={handleImmediateSave}
              onUpdateInfo={(updated) => setInfo((prev) => ({ ...prev, ...updated }))}
            />
          )}

          {/* Tab 3: Bayonnoma (PDF) View */}
          {activeTab === 'protocol' && (
            <PrimaryDataProtocolView
              info={info}
              pointsData={pointsData}
              calculation={calculation}
              onBackToEdit={() => setActiveTab('calculate')}
              onOpenCertificate={() => setActiveTab('certificate')}
              onSaveCertificate={handleImmediateSave}
            />
          )}

          {/* Tab 4: Saved Certificates Archive */}
          {activeTab === 'history' && (
            <HistoryArchiveView
              certificates={savedCerts}
              onLoadCertificate={handleLoadCertificate}
              onDeleteCertificate={handleDeleteCertificate}
              onImportBackup={handleImportBackup}
            />
          )}

          {/* Tab 5: Device & Access Audit Log */}
          {activeTab === 'audit' && (
            <DeviceAuditLogView logs={auditLogs} onClearLogs={handleClearAuditLogs} />
          )}
        </main>

        {/* Minimal Clean Footer */}
        <footer className="bg-white/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 py-3 text-center text-[11px] text-slate-500 dark:text-slate-400 print:hidden mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
            <span>O‘zbekiston Milliy Metrologiya Instituti (O‘zMMI)</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
