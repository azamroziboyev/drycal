import React, { useState } from 'react';
import { LoginAuditLog } from '../types';
import { 
  ShieldCheck, 
  Laptop, 
  Smartphone, 
  Tablet, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download, 
  Trash2,
  Activity
} from 'lucide-react';

interface DeviceAuditLogViewProps {
  logs: LoginAuditLog[];
  onClearLogs: () => void;
}

export const DeviceAuditLogView: React.FC<DeviceAuditLogViewProps> = ({
  logs,
  onClearLogs
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredLogs = logs.filter(l => {
    if (filterStatus === 'all') return true;
    return l.status === filterStatus;
  });

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Mobile':
        return <Smartphone className="w-4 h-4 text-amber-500" />;
      case 'Tablet':
        return <Tablet className="w-4 h-4 text-purple-500" />;
      default:
        return <Laptop className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleExportCsv = () => {
    const headers = ['Vaqti', 'Foydalanuvchi', 'Qurilma', 'OT', 'Brauzer', 'Ekran', 'IP', 'Holat', 'Harakat'];
    const rows = logs.map(l => [
      `"${l.timestamp}"`,
      `"${l.username}"`,
      `"${l.deviceType}"`,
      `"${l.os}"`,
      `"${l.browser}"`,
      `"${l.screenResolution}"`,
      `"${l.ipAddress}"`,
      `"${l.status}"`,
      `"${l.actionNote || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kirishlar_va_Qurilmalar_Audit_Jurnali_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Kirishlar va Qurilmalar Audit Jurnali</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
              Jami: {logs.length} ta yozuv
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Foydalanuvchilar qachon, qaysi qurilmadan kirgani va harakatlari avtomatik qayd etiladi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="all">Barcha harakatlar</option>
            <option value="Muvaffaqiyatli">Muvaffaqiyatli kirishlar</option>
            <option value="Xato parol">Xato parollar</option>
            <option value="Chiqish">Chiqishlar</option>
          </select>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Yuklab olish</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Barcha audit yozuvlarini tozalamoqchimisiz?')) {
                onClearLogs();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Tozalash</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-semibold">
                <th className="py-3 px-4">Vaqti</th>
                <th className="py-3 px-4">Foydalanuvchi</th>
                <th className="py-3 px-4">Qurilma & OT</th>
                <th className="py-3 px-4">Brauzer</th>
                <th className="py-3 px-4">Ekran o‘lchami</th>
                <th className="py-3 px-4">IP / Tarmoq</th>
                <th className="py-3 px-4">Holat</th>
                <th className="py-3 px-4">Harakat tavsifi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {log.username}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(log.deviceType)}
                      <span className="font-medium text-slate-800 dark:text-slate-200">{log.os}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {log.deviceType}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 truncate max-w-[140px]" title={log.browser}>
                    {log.browser}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-500">
                    {log.screenResolution}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {log.ipAddress}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      log.status === 'Muvaffaqiyatli'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : log.status === 'Xato parol'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {log.status === 'Muvaffaqiyatli' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {log.status === 'Xato parol' && <AlertTriangle className="w-3 h-3 text-red-600" />}
                      {log.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {log.actionNote || 'Kirish amalga oshirildi'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
