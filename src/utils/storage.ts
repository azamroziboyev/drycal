import { SavedCertificate, LoginAuditLog, ChamberPointData, CalibrationItemInfo, ChamberCalculation } from '../types';


const STORAGE_KEYS = {
  CERTIFICATES: 'metrologiya_certificates_v1',
  AUDIT_LOGS: 'metrologiya_audit_logs_v1',
  AUTH: 'metrologiya_auth_session_v1',
  THEME: 'metrologiya_theme_v1'
};

/**
 * Detect client device details from browser environment
 */
export function getDeviceInfo(): {
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  screenResolution: string;
  userAgent: string;
} {
  const ua = navigator.userAgent || '';
  const screenRes = typeof window !== 'undefined' && window.screen 
    ? `${window.screen.width}×${window.screen.height}` 
    : '1920×1080';

  // Device type
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'Mobile';
  }

  // OS Detection
  let os = 'Nomaʼlum OT';
  if (ua.indexOf('Win') !== -1) os = 'Windows';
  else if (ua.indexOf('Mac') !== -1) os = 'macOS';
  else if (ua.indexOf('Linux') !== -1) os = 'Linux';
  else if (ua.indexOf('Android') !== -1) os = 'Android';
  else if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) os = 'iOS';

  // Browser Detection
  let browser = 'Chrome/Chromium';
  if (ua.indexOf('Firefox') !== -1) browser = 'Mozilla Firefox';
  else if (ua.indexOf('Edg') !== -1) browser = 'Microsoft Edge';
  else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) browser = 'Apple Safari';
  else if (ua.indexOf('OPR') !== -1 || ua.indexOf('Opera') !== -1) browser = 'Opera';

  return {
    deviceType,
    browser,
    os,
    screenResolution: screenRes,
    userAgent: ua
  };
}

function readRawAuditLogs(): LoginAuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read audit logs', e);
  }
  return [];
}

/**
 * Record a login/logout/action audit event
 */
export function recordAuditLog(
  username: string,
  status: 'Muvaffaqiyatli' | 'Xato parol' | 'Chiqish',
  actionNote?: string
): LoginAuditLog {
  const dev = getDeviceInfo();
  const now = new Date();
  
  // Format local timestamp: YYYY-MM-DD HH:mm:ss
  const pad = (n: number) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const entry: LoginAuditLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    timestamp,
    username,
    deviceType: dev.deviceType,
    browser: dev.browser,
    os: dev.os,
    userAgent: dev.userAgent,
    screenResolution: dev.screenResolution,
    ipAddress: '192.168.1.' + Math.floor(10 + Math.random() * 80) + ' (Lokal/Tarmoq)',
    status,
    actionNote: actionNote || (status === 'Muvaffaqiyatli' ? 'Tizimga muvaffaqiyatli kirildi' : undefined)
  };

  const currentLogs = readRawAuditLogs();
  currentLogs.unshift(entry);
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(currentLogs.slice(0, 100))); // keep last 100 entries
  } catch (e) {
    console.error('Failed to save audit log', e);
  }

  return entry;
}

/**
 * Get all stored audit logs
 */
export function getAuditLogs(): LoginAuditLog[] {
  const logs = readRawAuditLogs();
  if (logs.length > 0) {
    return logs;
  }
  
  // Seed initial login session record for the device if completely empty
  const dev = getDeviceInfo();
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const initialEntry: LoginAuditLog = {
    id: 'log_init_' + Date.now(),
    timestamp,
    username: 'metrologiya',
    deviceType: dev.deviceType,
    browser: dev.browser,
    os: dev.os,
    userAgent: dev.userAgent,
    screenResolution: dev.screenResolution,
    ipAddress: '192.168.1.25 (Lokal/Tarmoq)',
    status: 'Muvaffaqiyatli',
    actionNote: 'Tizimga kirish tasdiqlandi (Avtorizatsiyalangan sessiya)'
  };

  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([initialEntry]));
  } catch (e) {
    // ignore
  }

  return [initialEntry];
}

export function getSavedCertificates(): SavedCertificate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read saved certificates', e);
  }
  return [];
}

/**
 * Save all certificates to storage
 */
export function saveAllCertificates(certs: SavedCertificate[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
  } catch (e) {
    console.error('Failed to save certificates', e);
  }
}

/**
 * Save or update a single certificate in history
 */
export function saveCertificate(
  info: CalibrationItemInfo,
  pointsData: ChamberPointData[],
  calcResult: ChamberCalculation
): SavedCertificate {
  const certs = getSavedCertificates();
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  
  const dev = getDeviceInfo();
  const newCert: SavedCertificate = {
    id: 'cert_' + Date.now(),
    createdAt,
    certificateNumber: info.certificateNumber,
    customerName: info.customerName,
    objectName: info.objectName,
    objectType: info.objectType,
    serialNumber: info.serialNumber,
    issueDate: info.issueDate,
    info,
    pointsData,
    calculation: calcResult,
    deviceInfo: `${dev.os} (${dev.browser})`
  };

  // Add to top of list
  const updated = [newCert, ...certs.filter(c => c.certificateNumber !== info.certificateNumber)];
  saveAllCertificates(updated);

  // Also log audit record
  recordAuditLog(
    'metrologiya',
    'Muvaffaqiyatli',
    `Sertifikat yaratildi va saqlandi: ${info.certificateNumber} (${info.objectType}, №${info.serialNumber})`
  );

  return newCert;
}

/**
 * Delete a certificate by ID
 */
export function deleteCertificate(id: string): SavedCertificate[] {
  const certs = getSavedCertificates().filter(c => c.id !== id);
  saveAllCertificates(certs);
  return certs;
}

/**
 * Auth state management
 */
export function getAuthSession(): { isAuthenticated: boolean; username: string } {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.AUTH) || localStorage.getItem(STORAGE_KEYS.AUTH);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return { isAuthenticated: false, username: '' };
}

export function setAuthSession(username: string, remember: boolean = true): void {
  const data = JSON.stringify({ isAuthenticated: true, username });
  sessionStorage.setItem(STORAGE_KEYS.AUTH, data);
  if (remember) {
    localStorage.setItem(STORAGE_KEYS.AUTH, data);
  }
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(STORAGE_KEYS.AUTH);
  localStorage.removeItem(STORAGE_KEYS.AUTH);
}
