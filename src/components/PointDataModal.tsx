import React, { useRef, useEffect } from 'react';
import { ChamberPointData, ChamberPointId, ChamberMeasurementRow } from '../types';
import { CHAMBER_POINTS_CONFIG } from '../utils/metrology';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';

interface PointDataModalProps {
  pointData: ChamberPointData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePointRows: (pointId: ChamberPointId, newRows: ChamberMeasurementRow[]) => void;
  onNavigatePoint: (direction: 'prev' | 'next') => void;
}

export const PointDataModal: React.FC<PointDataModalProps> = ({
  pointData,
  isOpen,
  onClose,
  onUpdatePointRows,
  onNavigatePoint,
}) => {
  const stdInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const indInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        stdInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen, pointData?.id]);

  if (!isOpen || !pointData) return null;

  const pointConfig = CHAMBER_POINTS_CONFIG.find((p) => p.id === pointData.id);

  // Handle Etalon (Col 1) change for a single row
  const handleStdChange = (rowIndex: number, val: string) => {
    const updated = pointData.rows.map((row, idx) => {
      if (idx === rowIndex) {
        return { ...row, tStd: val };
      }
      return row;
    });
    onUpdatePointRows(pointData.id, updated);
  };

  // Handle Quritish shkafi (Col 2) change individually for a single row
  const handleIndChange = (rowIndex: number, val: string) => {
    const updated = pointData.rows.map((row, idx) => {
      if (idx === rowIndex) {
        return { ...row, tInd: val };
      }
      return row;
    });
    onUpdatePointRows(pointData.id, updated);
  };

  // Excel-like navigation for Column 1
  const handleStdKeyDown = (rowIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      if (rowIndex < pointData.rows.length - 1) {
        stdInputRefs.current[rowIndex + 1]?.focus();
        stdInputRefs.current[rowIndex + 1]?.select();
      } else {
        indInputRefs.current[0]?.focus();
        indInputRefs.current[0]?.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) {
        stdInputRefs.current[rowIndex - 1]?.focus();
        stdInputRefs.current[rowIndex - 1]?.select();
      }
    } else if (e.key === 'ArrowRight' && e.currentTarget.selectionStart === e.currentTarget.value.length) {
      e.preventDefault();
      indInputRefs.current[rowIndex]?.focus();
      indInputRefs.current[rowIndex]?.select();
    }
  };

  // Excel-like navigation for Column 2
  const handleIndKeyDown = (rowIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      if (rowIndex < pointData.rows.length - 1) {
        indInputRefs.current[rowIndex + 1]?.focus();
        indInputRefs.current[rowIndex + 1]?.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) {
        indInputRefs.current[rowIndex - 1]?.focus();
        indInputRefs.current[rowIndex - 1]?.select();
      }
    } else if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
      e.preventDefault();
      stdInputRefs.current[rowIndex]?.focus();
      stdInputRefs.current[rowIndex]?.select();
    }
  };

  // Clear point rows
  const handleClear = () => {
    const cleared = Array.from({ length: 10 }, (_, i) => ({
      index: i + 1,
      tStd: '',
      tInd: '',
    }));
    onUpdatePointRows(pointData.id, cleared);
  };

  // Fast fill sample row helper
  const handleQuickFillCurrent = () => {
    const baseStd = pointData.isCenter ? 29.59 : 29.55 + (parseInt(pointData.id.replace('N', '')) % 5) * 0.02;
    const filled: ChamberMeasurementRow[] = Array.from({ length: 10 }, (_, i) => ({
      index: i + 1,
      tStd: (baseStd + ((i % 3) - 1) * 0.01).toFixed(2),
      tInd: i === 2 || i === 6 || i === 7 ? '29.9' : '30.0',
    }));
    onUpdatePointRows(pointData.id, filled);
  };

  // Point statistics calculation for preview
  const validStd = pointData.rows
    .map((r) => parseFloat(String(r.tStd).replace(',', '.')))
    .filter((n) => !isNaN(n));
  const validInd = pointData.rows
    .map((r) => parseFloat(String(r.tInd).replace(',', '.')))
    .filter((n) => !isNaN(n));

  const meanStd =
    validStd.length > 0 ? validStd.reduce((a, b) => a + b, 0) / validStd.length : null;
  const meanInd =
    validInd.length > 0 ? validInd.reduce((a, b) => a + b, 0) / validInd.length : null;
  const diff = meanStd !== null && meanInd !== null ? meanStd - meanInd : null;

  const isEntered = validStd.length > 0;

  // Find index in CHAMBER_POINTS_CONFIG
  const currentIdx = CHAMBER_POINTS_CONFIG.findIndex((p) => p.id === pointData.id);
  const prevPoint = currentIdx > 0 ? CHAMBER_POINTS_CONFIG[currentIdx - 1].id : null;
  const nextPoint =
    currentIdx < CHAMBER_POINTS_CONFIG.length - 1
      ? CHAMBER_POINTS_CONFIG[currentIdx + 1].id
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <span
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-base shadow-sm ${
                pointData.isCenter
                  ? 'bg-amber-500 text-white'
                  : isEntered
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {pointData.id}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {pointConfig?.nameUz || pointData.nameUz}
                </h3>
                {pointData.isCenter && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-medium">
                    Markaz (Reference T_ref)
                  </span>
                )}
                {isEntered && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Kiritilgan (Yashil)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {pointConfig?.positionDesc} • 10 ta o'lchash qatori
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice banner about individual cell input & Excel navigation */}
        <div className="px-6 py-2.5 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs text-blue-800 dark:text-blue-300">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Alohida kataklar va Excel navigatsiyasi:</strong> 1-ustun va 2-ustundagi har bir katak alohida to‘ldiriladi. <strong>Enter</strong> yoki <strong>↓ / ↑</strong> tugmalari orqali qatorlar bo‘ylab harakatlanishingiz mumkin.
            </span>
          </div>
        </div>

        {/* 10 Rows Table */}
        <div className="p-6 overflow-y-auto flex-1">
          <table className="w-full text-sm border-separate border-spacing-y-1.5">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                <th className="w-12 text-center pb-1">№</th>
                <th className="text-left pb-1 pl-2">
                  1-ustun: Etalon ko'rsatkichi (T_std), °C
                </th>
                <th className="text-left pb-1 pl-2">
                  2-ustun: Quritish shkafi (T_ind), °C
                </th>
              </tr>
            </thead>
            <tbody>
              {pointData.rows.map((row, idx) => (
                <tr key={idx} className="group">
                  <td className="text-center font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 select-none">
                    {idx + 1}
                  </td>

                  {/* Col 1: Etalon (Individual cell) */}
                  <td className="pr-2">
                    <div className="relative">
                      <input
                        ref={(el) => {
                          stdInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="decimal"
                        value={row.tStd}
                        onChange={(e) => handleStdChange(idx, e.target.value)}
                        onKeyDown={(e) => handleStdKeyDown(idx, e)}
                        placeholder="Masalan: 29.62"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                  </td>

                  {/* Col 2: Quritish shkafi (Individual cell per row, just like Col 1) */}
                  <td className="pl-2">
                    <div className="relative">
                      <input
                        ref={(el) => {
                          indInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="decimal"
                        value={row.tInd}
                        onChange={(e) => handleIndChange(idx, e.target.value)}
                        onKeyDown={(e) => handleIndKeyDown(idx, e)}
                        placeholder="Masalan: 30.0"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Quick Point Stats Box */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Etalon o'rtacha: </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {meanStd !== null ? `${meanStd.toFixed(3)} °C` : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Shkaf o'rtacha: </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {meanInd !== null ? `${meanInd.toFixed(3)} °C` : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Farq (T_std − T_ind): </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {diff !== null ? `${diff > 0 ? '+' : ''}${diff.toFixed(3)} °C` : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleQuickFillCurrent}
                title="Namuna qiymatlar kiritish"
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Namuna to'ldirish
              </button>
              <button
                type="button"
                onClick={handleClear}
                title="Tozalash"
                className="px-2.5 py-1 text-xs rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Tozalash
              </button>
            </div>
          </div>
        </div>

        {/* Footer with prev/next navigation & save button */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={!prevPoint}
              onClick={() => onNavigatePoint('prev')}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none flex items-center space-x-1 text-xs font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Oldingi ({prevPoint || '—'})</span>
            </button>
            <button
              type="button"
              disabled={!nextPoint}
              onClick={() => onNavigatePoint('next')}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none flex items-center space-x-1 text-xs font-medium transition"
            >
              <span>Keyingi ({nextPoint || '—'})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Saqlash va davom etish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
