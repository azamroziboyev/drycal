import React, { useState } from 'react';
import { SavedCertificate } from '../types';
import { formatMetrologyNumber } from '../utils/metrology';
import { 
  Search, 
  Trash2, 
  Download, 
  ExternalLink, 
  Calendar, 
  Laptop, 
  FileCheck, 
  Upload, 
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface HistoryArchiveViewProps {
  certificates: SavedCertificate[];
  onLoadCertificate: (cert: SavedCertificate) => void;
  onDeleteCertificate: (id: string) => void;
  onImportBackup: (imported: SavedCertificate[]) => void;
}

export const HistoryArchiveView: React.FC<HistoryArchiveViewProps> = ({
  certificates,
  onLoadCertificate,
  onDeleteCertificate,
  onImportBackup
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState<SavedCertificate | null>(null);

  const filtered = certificates.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.certificateNumber.toLowerCase().includes(q) ||
      c.customerName.toLowerCase().includes(q) ||
      c.objectType.toLowerCase().includes(q) ||
      c.serialNumber.toLowerCase().includes(q)
    );
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(certificates, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Metrologiya_Sertifikatlar_Zaxira_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportBackup(parsed);
          alert(`${parsed.length} ta sertifikat zaxiradan muvaffaqiyatli tiklandi!`);
        }
      } catch (err) {
        alert('Faylni o‘qishda xatolik yuz berdi. Iltimos to‘g‘ri JSON faylni tanlang.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Kalibrlash Sertifikatlari Tarixi (Arxiv)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono">
              Jami: {certificates.length} ta
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Yaratilgan barcha sertifikatlar va ularning 10 ta o‘lchov nuqtalari to‘liq saqlangan
          </p>
        </div>

        {/* Search & Backup buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Qidirish (№, rusumi, buyurtmachi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Barcha arxivni JSON fayl sifatida yuklab olish (Netlify uchun zaxira)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Zaxira (Eksport)</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Tiklash (Import)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Certificates List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <FileCheck className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Sertifikatlar topilmadi
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? 'Qidiruv bo‘yicha natija yo‘q' : 'Hozircha saqlangan sertifikatlar mavjud emas'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cert) => {
            const calc = cert.calculation;
            return (
              <div 
                key={cert.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card top */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      {cert.certificateNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {cert.createdAt}
                    </span>
                  </div>

                  {/* Title & Customer */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                    {cert.objectType}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Zavod №: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{cert.serialNumber}</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">
                    {cert.customerName}
                  </div>

                  {/* Metrology badges */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Kengaytirilgan Noaniqlik (U)</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                        ± {calc ? formatMetrologyNumber(calc.U, 2) : '0,10'} °C
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Nuqta / Bir jinsli emaslik</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {calc ? `${calc.pointTemp}°C / δ=${formatMetrologyNumber(calc.inhomogeneityDelta, 2)}` : '30°C'}
                      </span>
                    </div>
                  </div>

                  {/* Device Stamp */}
                  {cert.deviceInfo && (
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 truncate">
                      <Laptop className="w-3 h-3 shrink-0" />
                      <span>{cert.deviceInfo}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onLoadCertificate(cert)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ko‘rish & PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Rostdan ham ${cert.certificateNumber} sertifikatini tarixdan o‘chirmoqchimisiz?`)) {
                        onDeleteCertificate(cert.id);
                      }
                    }}
                    title="O‘chirish"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
