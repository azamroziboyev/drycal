import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CalibrationItemInfo, ChamberCalculation, ChamberPointData } from '../types';
import { exportCertificateToExcel, exportProtocolToExcel } from '../utils/excelExporter';
import { UzNimLogo, QrCodeSvg } from './UzNimLogo';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Undo2,
  Redo2,
  Copy,
  Check,
  X,
  Search,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Layers,
  Sparkles,
  Loader2,
  Edit3,
  CheckCircle2,
  Table,
  Plus,
} from 'lucide-react';

interface OfficeExcelEditorProps {
  info: CalibrationItemInfo;
  calculation: ChamberCalculation;
  pointsData: ChamberPointData[];
  onBackToEdit?: () => void;
  onSaveCertificate?: () => void;
  onUpdateInfo?: (updatedInfo: Partial<CalibrationItemInfo>) => void;
}

interface CellRecord {
  id: string; // e.g. "B14"
  row: number;
  col: string;
  value: string;
  formula?: string;
  isBold?: boolean;
  isItalic?: boolean;
  align?: 'left' | 'center' | 'right';
  fontSize?: number;
  textColor?: string;
  bgColor?: string;
  border?: string;
  readOnly?: boolean;
}

export const OfficeExcelEditor: React.FC<OfficeExcelEditorProps> = ({
  info,
  calculation,
  pointsData,
  onSaveCertificate,
  onUpdateInfo,
}) => {
  // Active Ribbon Tab: 'home' | 'insert' | 'page_layout' | 'formulas' | 'data' | 'view'
  const [activeRibbonTab, setActiveRibbonTab] = useState<'home' | 'insert' | 'formulas' | 'data' | 'view'>('home');
  
  // Active Sheet: 'sheet1' (Certificate 1-180 rows) | 'sheet2' (Protocol)
  const [activeSheet, setActiveSheet] = useState<'sheet1' | 'sheet2'>('sheet1');

  // Zoom Level
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Selected Cell & Editing Cell State
  const [selectedCellId, setSelectedCellId] = useState<string>('B14');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingValue, setEditingValue] = useState<string>('');
  const [formulaBarValue, setFormulaBarValue] = useState<string>('');

  // Undo / Redo history
  const [history, setHistory] = useState<{ [id: string]: string }[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Export Loading States
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Search in sheet
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchBox, setShowSearchBox] = useState<boolean>(false);

  // Font styling for selected cell
  const [fontFamily, setFontFamily] = useState<string>('Calibri');
  const [fontSize, setFontSize] = useState<number>(11);

  const formulaInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  // Derived initial values from props
  const defaultCertNo = info.certificateNumber || 'Uz-112/1-2025';
  const defaultIssueDate = info.issueDate || '2025-04-29';
  const defaultSerialNo = info.serialNumber || '2333001557';
  const defaultModel = info.objectType || 'RTOP-500Y';
  const defaultItemName = info.objectName || 'Сушильные шкаф (Quritish shkafi)';
  const defaultManufacturer = info.manufacturer || 'Китай (CN)';
  const defaultCustomer = info.customerName || '-';
  const defaultPerformer = info.calibratedByUz || "G'aibnazarov Boburjon";
  const defaultOrderNo = info.orderNumber || '№ 25-112-xxxxxx';
  const defaultPeriod = info.calibrationPeriod || defaultIssueDate;

  const defaultPointTemp = calculation.pointTemp.toFixed(1).replace('.', ',');
  const defaultRefVal = calculation.centerStdMean.toFixed(2).replace('.', ',');
  const defaultIndVal = (calculation.overallIndMean > 0 ? calculation.overallIndMean : calculation.centerIndMean).toFixed(2).replace('.', ',');
  const defaultDevVal = calculation.deviation.toFixed(2).replace('.', ',');
  const defaultUVal = calculation.U.toFixed(2).replace('.', ',');

  // Cell database: mapping cell ID -> string value
  const [cellData, setCellData] = useState<{ [id: string]: string }>({
    // Page 1
    T1: defaultCertNo,
    T3: "O'ZAK.KL.0013",
    T5: defaultIssueDate,
    B14: defaultIssueDate,
    H14: defaultCertNo,
    T14: '4',
    G16: defaultItemName,
    G19: defaultManufacturer,
    G21: defaultModel,
    G23: defaultSerialNo,
    G25: defaultCustomer,
    H33: defaultPerformer,

    // Page 2
    T48: defaultCertNo,
    T50: "O'ZAK.KL.0013",
    T52: defaultIssueDate,
    H50: defaultCertNo,
    H54: defaultOrderNo,
    H56: defaultPeriod,
    C75: String(info.ambientTempMin ?? 24.0).replace('.', ','),
    D75: String(info.ambientTempMax ?? 24.5).replace('.', ','),
    C78: String(info.relativeHumidityMin ?? 37.7).replace('.', ','),
    D78: String(info.relativeHumidityMax ?? 38.5).replace('.', ','),
    C81: String(info.atmosphericPressureMin ?? 1012.2).replace('.', ','),
    D81: String(info.atmosphericPressureMax ?? 1013.0).replace('.', ','),

    // Page 3
    T89: defaultCertNo,
    T91: "O'ZAK.KL.0013",
    T93: defaultIssueDate,
    H90: defaultCertNo,
    B105: 'Термометр лабораторный электронный',
    C105: info.standardType || 'ЛТА/Б-300МТ',
    D105: info.standardSerial || '871352',
    E105: 'UZ-09T/2927-2024 от 07.11.2024 г.',
    B110: 'Термометр сопротивления с цифровой индикацией (Калибратор температуры)',
    C110: 'STS-200 A 915 (RTC-156B)',
    D110: '613343-19 (617498-00393)',
    E110: 'Uz-09T/630-2025 от 14.04.2025 г.',
    B122: defaultPointTemp,
    C122: defaultRefVal,
    D122: defaultIndVal,
    E122: defaultDevVal,
    F122: defaultUVal,

    // Page 4
    T135: defaultCertNo,
    T137: "O'ZAK.KL.0013",
    T139: defaultIssueDate,
    H137: defaultCertNo,
    B126: '-------',
  });

  // Cell formatting overrides (bold, italic, color)
  const [cellStyles, setCellStyles] = useState<{
    [id: string]: { bold?: boolean; italic?: boolean; underline?: boolean; align?: string; color?: string; bg?: string };
  }>({});

  // Helper to read a cell value
  const getVal = (id: string, fallback: string = ''): string => {
    return cellData[id] !== undefined ? cellData[id] : fallback;
  };

  // Sync formula bar value with selected cell
  useEffect(() => {
    setFormulaBarValue(cellData[selectedCellId] || '');
  }, [selectedCellId, cellData]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inlineInputRef.current) {
      inlineInputRef.current.focus();
      inlineInputRef.current.select();
    }
  }, [isEditing]);

  // Commit cell edit
  const commitCellEdit = (cellId: string, newValue: string) => {
    // Record history for Undo
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), { ...cellData }]);
    setHistoryIndex((prev) => prev + 1);

    setCellData((prev) => ({
      ...prev,
      [cellId]: newValue,
    }));

    // If critical fields were updated, propagate back to app state
    if (onUpdateInfo) {
      if (cellId === 'B14') onUpdateInfo({ issueDate: newValue });
      if (cellId === 'H14') onUpdateInfo({ certificateNumber: newValue });
      if (cellId === 'G16') onUpdateInfo({ objectName: newValue });
      if (cellId === 'G19') onUpdateInfo({ manufacturer: newValue });
      if (cellId === 'G21') onUpdateInfo({ objectType: newValue });
      if (cellId === 'G23') onUpdateInfo({ serialNumber: newValue });
      if (cellId === 'G25') onUpdateInfo({ customerName: newValue });
      if (cellId === 'H33') onUpdateInfo({ calibratedByUz: newValue });
    }

    setIsEditing(false);
  };

  const handleCellClick = (cellId: string) => {
    if (isEditing && selectedCellId !== cellId) {
      commitCellEdit(selectedCellId, editingValue);
    }
    setSelectedCellId(cellId);
    setFormulaBarValue(cellData[cellId] || '');
  };

  const handleCellDoubleClick = (cellId: string) => {
    setSelectedCellId(cellId);
    setEditingValue(cellData[cellId] || '');
    setIsEditing(true);
  };

  const handleFormulaBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormulaBarValue(val);
    setCellData((prev) => ({
      ...prev,
      [selectedCellId]: val,
    }));
  };

  const handleFormulaBarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitCellEdit(selectedCellId, formulaBarValue);
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setFormulaBarValue(cellData[selectedCellId] || '');
      e.currentTarget.blur();
    }
  };

  const handleInlineKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitCellEdit(selectedCellId, editingValue);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex >= 0) {
      const prev = history[historyIndex];
      setCellData(prev);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setCellData(next);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Toggle cell styling
  const toggleStyle = (styleKey: 'bold' | 'italic' | 'underline') => {
    setCellStyles((prev) => {
      const current = prev[selectedCellId] || {};
      return {
        ...prev,
        [selectedCellId]: {
          ...current,
          [styleKey]: !current[styleKey],
        },
      };
    });
  };

  const setCellAlign = (align: 'left' | 'center' | 'right') => {
    setCellStyles((prev) => {
      const current = prev[selectedCellId] || {};
      return {
        ...prev,
        [selectedCellId]: {
          ...current,
          align,
        },
      };
    });
  };

  // Export updated workbook with edited cells
  const handleExportEditedExcel = async () => {
    setIsExportingExcel(true);
    setSaveSuccessMsg('');
    if (onSaveCertificate) onSaveCertificate();

    try {
      // Create a modified info object based on any edited cells
      const updatedInfo: CalibrationItemInfo = {
        ...info,
        certificateNumber: cellData['H14'] || info.certificateNumber,
        issueDate: cellData['B14'] || info.issueDate,
        objectName: cellData['G16'] || info.objectName,
        manufacturer: cellData['G19'] || info.manufacturer,
        objectType: cellData['G21'] || info.objectType,
        serialNumber: cellData['G23'] || info.serialNumber,
        customerName: cellData['G25'] || info.customerName,
        calibratedByUz: cellData['H33'] || info.calibratedByUz,
        orderNumber: cellData['H54'] || info.orderNumber,
        calibrationPeriod: cellData['H56'] || info.calibrationPeriod,
      };

      await exportCertificateToExcel(updatedInfo, calculation, pointsData);
      setSaveSuccessMsg('Tahrirlangan Excel (.xlsx) fayli muvaffaqiyatli saqlandi va yuklab olindi!');
      setTimeout(() => setSaveSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Excel download error:', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Excel columns A through V
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];

  // Render an interactive cell
  const renderInteractiveCell = (
    cellId: string,
    defaultVal: string,
    className: string = '',
    customStyles: React.CSSProperties = {}
  ) => {
    const isSelected = selectedCellId === cellId;
    const isThisEditing = isEditing && isSelected;
    const currentVal = getVal(cellId, defaultVal);
    const cellStyle = cellStyles[cellId] || {};

    const isMatch =
      searchQuery.trim() !== '' &&
      currentVal.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div
        key={cellId}
        onClick={() => handleCellClick(cellId)}
        onDoubleClick={() => handleCellDoubleClick(cellId)}
        className={`relative select-text transition-colors cursor-cell group ${
          isSelected
            ? 'ring-2 ring-[#107c41] bg-emerald-50/70 z-20 font-medium'
            : isMatch
            ? 'bg-amber-100 ring-1 ring-amber-400'
            : 'hover:bg-slate-100/60'
        } ${className}`}
        style={{
          fontWeight: cellStyle.bold ? 'bold' : undefined,
          fontStyle: cellStyle.italic ? 'italic' : undefined,
          textDecoration: cellStyle.underline ? 'underline' : undefined,
          textAlign: (cellStyle.align as any) || undefined,
          ...customStyles,
        }}
        title={`Katak: ${cellId} (Tahrirlash uchun ikki marta bosing)`}
      >
        {isThisEditing ? (
          <input
            ref={inlineInputRef}
            type="text"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onKeyDown={handleInlineKeyDown}
            onBlur={() => commitCellEdit(cellId, editingValue)}
            className="w-full h-full bg-white text-black font-sans text-xs px-1 py-0.5 outline-none border-2 border-[#107c41] shadow-lg rounded-xs z-30"
          />
        ) : (
          <span className="break-words block px-1 py-0.5">{currentVal}</span>
        )}

        {/* Excel Active Cell Corner Handle */}
        {isSelected && !isThisEditing && (
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#107c41] border border-white cursor-crosshair z-30" />
        )}
      </div>
    );
  };

  // Stats for the Status Bar
  const stats = useMemo(() => {
    const numericValues: number[] = [];
    Object.values(cellData).forEach((v) => {
      const parsed = parseFloat(v.replace(',', '.'));
      if (!isNaN(parsed)) numericValues.push(parsed);
    });
    const count = numericValues.length;
    const sum = numericValues.reduce((a, b) => a + b, 0);
    const avg = count > 0 ? sum / count : 0;
    return { count, sum: sum.toFixed(2), avg: avg.toFixed(2) };
  }, [cellData]);

  return (
    <div className="bg-[#f3f4f6] dark:bg-slate-950 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-xl overflow-hidden font-sans select-none flex flex-col">
      {/* =========================================================
          1. OFFICE APPLICATION TOP HEADER BAR
          ========================================================= */}
      <div className="bg-[#107c41] text-white px-3 py-2 flex flex-wrap items-center justify-between gap-3 shadow-sm select-none">
        {/* Left: Office Brand & File Name */}
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide">
                Sertifikat_{info.certificateNumber ? info.certificateNumber.replace(/[\/\\]/g, '_') : 'Uz-112-1-2025'}.xlsx
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                Avtomatik saqlanmoqda
              </span>
            </div>
            <div className="text-[11px] text-white/80">
              Microsoft Excel Online Integratsiyasi • O‘zMMI Rasmiy Sertifikati (KU-10-2025)
            </div>
          </div>
        </div>

        {/* Center: Search Box */}
        <div className="flex items-center">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-white/70 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Jadvaldan qidirish (Ctrl+F)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/15 hover:bg-white/20 focus:bg-white focus:text-slate-900 text-white placeholder-white/70 text-xs pl-8 pr-3 py-1 rounded-lg w-52 sm:w-64 transition outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* PRIMARY: Export edited .xlsx */}
          <button
            type="button"
            disabled={isExportingExcel}
            onClick={handleExportEditedExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#107c41] hover:bg-emerald-50 transition shadow-sm cursor-pointer disabled:opacity-60"
            title="Tahrirlangan faylni to‘g‘ridan-to‘g‘ri .xlsx qilib yuklab olish"
          >
            {isExportingExcel ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Eksport...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Excel (.xlsx) yuklab olish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================
          2. OFFICE RIBBON (LENTA) - TABS & TOOLBAR
          ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs">
        {/* Ribbon Tabs Header */}
        <div className="flex items-center px-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-bold text-white bg-[#107c41] rounded-t-md cursor-pointer hover:bg-[#0b5c30] mr-1"
          >
            Файл
          </button>
          {[
            { id: 'home', label: 'Главная' },
            { id: 'insert', label: 'Вставка' },
            { id: 'formulas', label: 'Формулы' },
            { id: 'data', label: 'Данные' },
            { id: 'view', label: 'Вид' },
          ].map((tab) => {
            const isActive = activeRibbonTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveRibbonTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold cursor-pointer border-b-2 transition ${
                  isActive
                    ? 'border-[#107c41] text-[#107c41] dark:text-emerald-400 bg-white dark:bg-slate-900 font-bold'
                    : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Ribbon Action Tools Bar (Active when 'Главная') */}
        <div className="p-1.5 px-3 flex flex-wrap items-center gap-2 overflow-x-auto select-none bg-white dark:bg-slate-900">
          {/* Undo / Redo */}
          <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex < 0}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              title="Orqaga qaytarish (Undo)"
            >
              <Undo2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              title="Oldinga o‘tkazish (Redo)"
            >
              <Redo2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
          </div>

          {/* Font Controls */}
          <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-1 text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="Calibri">Calibri</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Segoe UI">Segoe UI</option>
            </select>

            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-1 text-slate-800 dark:text-slate-200 outline-none w-12 text-center"
            >
              {[9, 10, 11, 12, 14, 16, 18].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => toggleStyle('bold')}
              className={`p-1.5 rounded font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                cellStyles[selectedCellId]?.bold ? 'bg-emerald-100 dark:bg-emerald-950 text-[#107c41]' : ''
              }`}
              title="Qalin (Bold / Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => toggleStyle('italic')}
              className={`p-1.5 rounded italic hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                cellStyles[selectedCellId]?.italic ? 'bg-emerald-100 dark:bg-emerald-950 text-[#107c41]' : ''
              }`}
              title="Qiya (Italic / Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => toggleStyle('underline')}
              className={`p-1.5 rounded underline hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                cellStyles[selectedCellId]?.underline ? 'bg-emerald-100 dark:bg-emerald-950 text-[#107c41]' : ''
              }`}
              title="Tagiga chizilgan (Underline / Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alignment Controls */}
          <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setCellAlign('left')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Chapga tekislash"
            >
              <AlignLeft className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            </button>
            <button
              type="button"
              onClick={() => setCellAlign('center')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="O‘rtaga tekislash"
            >
              <AlignCenter className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            </button>
            <button
              type="button"
              onClick={() => setCellAlign('right')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="O‘ngga tekislash"
            >
              <AlignRight className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            </button>
          </div>

          {/* Editing Mode Indicator */}
          <div className="flex items-center gap-2 pl-2">
            <span className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 text-[#107c41] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] px-2.5 py-1 rounded-md font-semibold">
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
              Tahrirlash rejimi: Katakka 2 marta bosing
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. EXCEL FORMULA BAR (СТРОКА ФОРМУЛ)
          ========================================================= */}
      <div className="px-3 py-1.5 bg-[#f9fafb] dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-mono select-none">
        {/* Cell Name Box */}
        <div className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 w-16 text-center select-none shadow-xs">
          {selectedCellId}
        </div>

        {/* Action icons: Cancel, Accept, fx */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            onClick={() => setFormulaBarValue(cellData[selectedCellId] || '')}
            className="hover:text-red-500 p-0.5"
            title="Bekor qilish"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => commitCellEdit(selectedCellId, formulaBarValue)}
            className="hover:text-emerald-600 p-0.5"
            title="Kiritishni tasdiqlash (Enter)"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-400 font-serif italic font-bold px-1 select-none text-sm">
            fx
          </span>
        </div>

        {/* Live Formula Bar Input */}
        <input
          ref={formulaInputRef}
          type="text"
          value={formulaBarValue}
          onChange={handleFormulaBarChange}
          onKeyDown={handleFormulaBarKeyDown}
          placeholder="Katak qiymatini yoki matnini kiriting..."
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-slate-800 dark:text-slate-200 text-xs font-mono outline-none focus:border-[#107c41] focus:ring-1 focus:ring-[#107c41] shadow-xs"
        />
      </div>

      {/* Success Notification Bar */}
      {saveSuccessMsg && (
        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/80 border-b border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* =========================================================
          4. MAIN INTERACTIVE SPREADSHEET WORKSPACE
          ========================================================= */}
      <div className="relative overflow-auto bg-slate-200 dark:bg-slate-900 max-h-[750px] p-4 flex justify-center">
        <div
          className="bg-white text-black font-sans shadow-2xl rounded-xs border border-slate-300 overflow-x-auto select-text w-full max-w-[960px] mx-auto"
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center',
            fontFamily: fontFamily,
          }}
        >
          {/* Excel Column Headers (A to V) */}
          <div className="flex bg-[#f3f3f3] border-b border-[#d4d4d4] text-[11px] font-semibold text-[#555] sticky top-0 z-30 select-none">
            <div className="w-10 min-w-[40px] py-1 text-center bg-[#e6e6e6] border-r border-[#d4d4d4] shrink-0 font-mono text-[10px]">
              #
            </div>
            {columns.map((c) => (
              <div
                key={c}
                className={`py-1 text-center border-r border-[#d4d4d4] shrink-0 font-mono text-[10px] ${
                  c === 'A' ? 'w-6 min-w-[24px]' : c >= 'T' ? 'w-12 min-w-[48px]' : 'w-10 min-w-[40px]'
                }`}
              >
                {c}
              </div>
            ))}
          </div>

          {/* Spreadsheet Content */}
          <div className="p-3 sm:p-5 text-[11px] leading-tight relative bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
            
            {/* ========================================================
                PAGE 1: ROWS 1 TO 46
                ======================================================== */}
            <div className="relative pb-6 mb-6">
              {/* Background Watermark Page 1 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                <span className="text-[130px] font-bold text-slate-400/20 tracking-wider">
                  Page 1
                </span>
              </div>

              <div className="relative z-10">
                {/* Rows 1-5: Header */}
                <div className="grid grid-cols-12 gap-2 items-center pb-2 border-b border-slate-200">
                  <div className="col-span-3 flex items-center justify-start pl-2">
                    <UzNimLogo size={52} />
                  </div>
                  <div className="col-span-6 text-center">
                    <div className="font-bold text-[12px] text-black">
                      Хорезмский филиал ГУ «Узбекский национальный институт метрологии»
                    </div>
                    <div className="italic text-[10px] text-black mt-0.5">
                      "Uzbek National Institute of Metrology" state institution Khorezm branch
                    </div>
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <div className="border border-black text-center font-bold text-[11px] w-28">
                      <div className="border-b border-black">
                        {renderInteractiveCell('T1', defaultCertNo, 'py-0.5 text-center')}
                      </div>
                      <div className="border-b border-black">
                        {renderInteractiveCell('T3', "O'ZAK.KL.0013", 'py-0.5 text-center')}
                      </div>
                      <div>
                        {renderInteractiveCell('T5', defaultIssueDate, 'py-0.5 text-center font-normal text-[10px]')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rows 7-10: Certificate Title */}
                <div className="text-center my-6">
                  <h1 className="text-[17px] font-bold text-black uppercase tracking-tight">
                    Сертификат калибровки
                  </h1>
                  <div className="italic text-[13px] text-black font-normal mt-0.5">
                    Calibration certificate
                  </div>
                </div>

                {/* Rows 12-14: 3-column Metadata Box with dashed bottom */}
                <div className="grid grid-cols-12 border-b-2 border-dashed border-black pb-2 mb-4 text-center">
                  <div className="col-span-3 border-r border-black/40 pr-2">
                    <div className="font-bold text-[11px]">Дата выдачи:</div>
                    <div className="italic text-[10px] text-slate-700">Date of issue:</div>
                    <div className="mt-1">
                      {renderInteractiveCell('B14', defaultIssueDate, 'font-mono text-[12px] font-semibold text-center')}
                    </div>
                  </div>
                  <div className="col-span-6 px-2">
                    <div className="font-bold text-[11px]">Номер сертификата:</div>
                    <div className="italic text-[10px] text-slate-700">Certificate number:</div>
                    <div className="mt-1">
                      {renderInteractiveCell('H14', defaultCertNo, 'font-mono text-[13px] font-bold text-black text-center')}
                    </div>
                  </div>
                  <div className="col-span-3 border-l border-black/40 pl-2">
                    <div className="font-bold text-[11px]">Количество страниц:</div>
                    <div className="italic text-[10px] text-slate-700">Number of pages:</div>
                    <div className="mt-1">
                      {renderInteractiveCell('T14', '4', 'font-mono text-[13px] font-bold text-black text-center')}
                    </div>
                  </div>
                </div>

                {/* Rows 16-27: Item Details Key-Value List */}
                <div className="space-y-2.5 my-4 text-[11px]">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 font-bold">
                      <div>Объект калибровки:</div>
                      <div className="italic text-[10px] font-normal text-slate-700">Calibration item:</div>
                    </div>
                    <div className="col-span-8">
                      {renderInteractiveCell('G16', defaultItemName, 'font-bold')}
                      <div className="italic text-[10px] text-slate-700 pl-1">Temperature chamber (Drying oven)</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 font-bold">
                      <div>Производитель:</div>
                      <div className="italic text-[10px] font-normal text-slate-700">Manufacturer:</div>
                    </div>
                    <div className="col-span-8">
                      {renderInteractiveCell('G19', defaultManufacturer)}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 font-bold">
                      <div>Тип (модель, серия):</div>
                      <div className="italic text-[10px] font-normal text-slate-700">Type (model, series):</div>
                    </div>
                    <div className="col-span-8">
                      {renderInteractiveCell('G21', defaultModel, 'font-mono')}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 font-bold">
                      <div>Серийный номер:</div>
                      <div className="italic text-[10px] font-normal text-slate-700">Serial number:</div>
                    </div>
                    <div className="col-span-8">
                      {renderInteractiveCell('G23', defaultSerialNo, 'font-mono')}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 font-bold">
                      <div>Заказчик:</div>
                      <div className="italic text-[10px] font-normal text-slate-700">Customer:</div>
                    </div>
                    <div className="col-span-8">
                      {renderInteractiveCell('G25', defaultCustomer)}
                    </div>
                  </div>
                </div>

                {/* Rows 31-39: Red Notice Box & Performer Signatures */}
                <div className="grid grid-cols-12 gap-4 mt-8 pt-4 items-start">
                  {/* Red Warning Box (B31:G39) */}
                  <div className="col-span-5 border-2 border-red-600 p-2.5 text-center text-red-600 text-[9.5px] leading-tight font-medium bg-red-50/20">
                    <div>
                      Сертификат калибровки рассматривается как недействительный без сгенерированного системой e-metrologiya.uz листа, содержащего ссылку на него
                    </div>
                    <div className="italic mt-1.5 pt-1.5 border-t border-red-200">
                      The calibration certificate is considered invalid without a sheet generated by the e-metrologiya.uz system containing a link to it
                    </div>
                  </div>

                  {/* Right Signature and Full Reproduction Box */}
                  <div className="col-span-7 flex flex-col justify-between h-full space-y-4">
                    <div>
                      <div className="font-bold text-[11px]">Калибровку выполнил:</div>
                      <div className="italic text-[10px] text-slate-700">Calibration performed by:</div>
                      <div className="mt-2 border-b border-black pb-1 inline-block min-w-[220px]">
                        {renderInteractiveCell('H33', defaultPerformer, 'font-bold font-mono text-[12px]')}
                      </div>
                    </div>

                    <div className="border border-black p-2 text-center text-[9px] leading-tight">
                      <div className="font-bold">
                        Сертификат калибровки не может быть воспроизведен, кроме как в полном объеме
                      </div>
                      <div className="italic mt-0.5 text-slate-700">
                        Calibration certificate shall not be reproduced except in full
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 46: Thick Blue Page Break Line */}
              <div className="mt-8 pt-3 border-b-4 border-blue-900 flex justify-between items-center text-[10px] text-blue-900 font-bold select-none">
                <span>--- 1-Sahifa oxiri (Excel Page 1 Break) ---</span>
                <span>{getVal('H14', defaultCertNo)}</span>
              </div>
            </div>

            {/* ========================================================
                PAGE 2: ROWS 47 TO 87
                ======================================================== */}
            <div className="relative pb-6 mb-6">
              {/* Background Watermark Page 2 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                <span className="text-[130px] font-bold text-slate-400/20 tracking-wider">
                  Page 2
                </span>
              </div>

              <div className="relative z-10">
                {/* Rows 48-52: Header with 3-box & Page 2 */}
                <div className="grid grid-cols-12 gap-2 items-center pb-2 border-b border-slate-200">
                  <div className="col-span-9">
                    <div className="font-bold text-[11px] text-black">
                      Хорезмский филиал ГУ «Узбекский национальный институт метрологии»
                    </div>
                    <div className="italic text-[10px] text-black">
                      "Uzbek National Institute of Metrology" state institution Khorezm branch
                    </div>
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <div className="border border-black text-center font-bold text-[11px] w-28">
                      <div className="border-b border-black">
                        {renderInteractiveCell('T48', defaultCertNo, 'py-0.5 text-center')}
                      </div>
                      <div className="border-b border-black">
                        {renderInteractiveCell('T50', "O'ZAK.KL.0013", 'py-0.5 text-center')}
                      </div>
                      <div>
                        {renderInteractiveCell('T52', defaultIssueDate, 'py-0.5 text-center font-normal text-[10px]')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 50-51: Cert No & Page 2 */}
                <div className="flex justify-between items-center border-b border-dashed border-black py-1.5 my-2 text-[11px]">
                  <div className="flex items-center gap-1">
                    <span className="font-bold">Номер сертификата:</span>{' '}
                    <span className="italic text-[10px] text-slate-700">Certificate number:</span>{' '}
                    {renderInteractiveCell('H50', defaultCertNo, 'font-mono font-bold underline')}
                  </div>
                  <div>
                    <span className="font-bold">Страница:</span>{' '}
                    <span className="italic text-[10px] text-slate-700">Page:</span>{' '}
                    <span className="font-mono font-bold ml-1">2</span>
                  </div>
                </div>

                {/* Rows 54-68: Request, Period, Lab info, Location */}
                <div className="space-y-2.5 my-3 text-[11px]">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 font-bold">
                      <div>Запрос на калибровку:</div>
                      <div className="italic text-[10px] font-normal text-slate-700">Calibration request:</div>
                    </div>
                    <div className="col-span-8 flex items-center gap-2">
                      <span className="italic text-[10px]">от from</span>
                      {renderInteractiveCell('H54', defaultOrderNo)}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 font-bold">
                      <div>Период калибровки:</div>
                      <div className="italic text-[10px] font-normal text-slate-700">Calibration period:</div>
                    </div>
                    <div className="col-span-8">
                      {renderInteractiveCell('H56', defaultPeriod, 'font-mono')}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 font-bold">
                      <div>Наименование лаборатории:</div>
                      <div className="italic text-[10px] font-normal text-slate-700">Name of laboratory:</div>
                    </div>
                    <div className="col-span-8">
                      <div>Лаборатория сравнения и калибровки физико-химических приборов, измерителей плотности, давления и температуры</div>
                      <div className="italic text-[10px] text-slate-700">Laboratory for comparison and calibration of physical and chemical instruments, density, pressure and temperature meters</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 font-bold">
                      <div>Место осуществления измерений:</div>
                      <div className="italic text-[10px] font-normal text-slate-700">Location of performance of measurement:</div>
                    </div>
                    <div className="col-span-8">
                      <div>Хорезмский филиал ГУ «Узбекский национальный институт метрологии»</div>
                      <div className="text-[10px] text-slate-800">Республика Узбекистан, Хорезмская область, город Ургенч, улица Ханкинская, 107Б, тел: +998 78 770-46-15, www.nim.uz</div>
                      <div className="italic text-[9.5px] text-slate-600 mt-0.5">"Uzbek National Institute of Metrology" state institution Khorezm branch, 107B, Khonqa street, the city of Urgench, Khorezm region, Republic of Uzbekistan</div>
                    </div>
                  </div>
                </div>

                {/* Rows 70-82: Environmental Conditions Table */}
                <div className="mt-4">
                  <div className="font-bold text-[11px]">Условия калибровки:</div>
                  <div className="italic text-[10px] text-slate-700 mb-2">Calibration conditions:</div>

                  <table className="w-full border-collapse border border-black text-center text-[10.5px]">
                    <thead>
                      <tr className="bg-slate-100/70 font-bold">
                        <th className="border border-black p-1.5 w-[46%] text-left">
                          <div>Контролируемые показатели</div>
                          <div className="italic text-[9.5px] font-normal text-slate-700">Controlled indicators</div>
                        </th>
                        <th className="border border-black p-1.5 w-[14%]">
                          <div>от</div>
                          <div className="italic text-[9.5px] font-normal text-slate-700">from</div>
                        </th>
                        <th className="border border-black p-1.5 w-[14%]">
                          <div>до</div>
                          <div className="italic text-[9.5px] font-normal text-slate-700">to</div>
                        </th>
                        <th className="border border-black p-1.5 w-[26%] text-left">
                          <div>Примечание</div>
                          <div className="italic text-[9.5px] font-normal text-slate-700">Remark</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-1.5 text-left">
                          <div>Температура окружающего воздуха, °C</div>
                          <div className="italic text-[9.5px] text-slate-700">Ambient temperature, °C</div>
                        </td>
                        <td className="border border-black p-1 font-mono">
                          {renderInteractiveCell('C75', '24,0', 'text-center font-mono')}
                        </td>
                        <td className="border border-black p-1 font-mono">
                          {renderInteractiveCell('D75', '24,5', 'text-center font-mono')}
                        </td>
                        <td className="border border-black p-1.5 text-left text-[9.5px]">
                          <div>в пределах 1,0 °C в 24 h</div>
                          <div className="italic text-slate-700">within 1,0 °C in 24 h</div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1.5 text-left">
                          <div>Относительная влажность окружающей среды, %</div>
                          <div className="italic text-[9.5px] text-slate-700">Ambient relative humidity, %</div>
                        </td>
                        <td className="border border-black p-1 font-mono">
                          {renderInteractiveCell('C78', '37,7', 'text-center font-mono')}
                        </td>
                        <td className="border border-black p-1 font-mono">
                          {renderInteractiveCell('D78', '38,5', 'text-center font-mono')}
                        </td>
                        <td className="border border-black p-1.5 text-left text-[9.5px]">
                          <div>в пределах 10 % в 24 h</div>
                          <div className="italic text-slate-700">within 10 % in 24 h</div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1.5 text-left">
                          <div>Атмосферное давление, hPa</div>
                          <div className="italic text-[9.5px] text-slate-700">Air pressure, hPa</div>
                        </td>
                        <td className="border border-black p-1 font-mono">
                          {renderInteractiveCell('C81', '1012,2', 'text-center font-mono')}
                        </td>
                        <td className="border border-black p-1 font-mono">
                          {renderInteractiveCell('D81', '1013,0', 'text-center font-mono')}
                        </td>
                        <td className="border border-black p-1.5 text-left text-[9.5px]">
                          <div>в пределах ±8 hPa в 24 h</div>
                          <div className="italic text-slate-700">within to ±8 hPa in 24 h</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Row 87: Thick Blue Page Break Line */}
              <div className="mt-8 pt-3 border-b-4 border-blue-900 flex justify-between items-center text-[10px] text-blue-900 font-bold select-none">
                <span>--- 2-Sahifa oxiri (Excel Page 2 Break) ---</span>
                <span>{getVal('H14', defaultCertNo)}</span>
              </div>
            </div>

            {/* ========================================================
                PAGE 3: ROWS 88 TO 124
                ======================================================== */}
            <div className="relative pb-6 mb-6">
              {/* Background Watermark Page 3 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                <span className="text-[130px] font-bold text-slate-400/20 tracking-wider">
                  Page 3
                </span>
              </div>

              <div className="relative z-10">
                {/* Rows 88-92: Header */}
                <div className="grid grid-cols-12 gap-2 items-center pb-2 border-b border-slate-200">
                  <div className="col-span-9">
                    <div className="font-bold text-[11px] text-black">
                      Хорезмский филиал ГУ «Узбекский национальный институт метрологии»
                    </div>
                    <div className="italic text-[10px] text-black">
                      "Uzbek National Institute of Metrology" state institution Khorezm branch
                    </div>
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <div className="border border-black text-center font-bold text-[11px] w-28">
                      <div className="border-b border-black">
                        {renderInteractiveCell('T89', defaultCertNo, 'py-0.5 text-center')}
                      </div>
                      <div className="border-b border-black">
                        {renderInteractiveCell('T91', "O'ZAK.KL.0013", 'py-0.5 text-center')}
                      </div>
                      <div>
                        {renderInteractiveCell('T93', defaultIssueDate, 'py-0.5 text-center font-normal text-[10px]')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cert No & Page 3 */}
                <div className="flex justify-between items-center border-b border-dashed border-black py-1.5 my-2 text-[11px]">
                  <div className="flex items-center gap-1">
                    <span className="font-bold">Номер сертификата:</span>{' '}
                    <span className="italic text-[10px] text-slate-700">Certificate number:</span>{' '}
                    {renderInteractiveCell('H90', defaultCertNo, 'font-mono font-bold underline')}
                  </div>
                  <div>
                    <span className="font-bold">Страница:</span>{' '}
                    <span className="italic text-[10px] text-slate-700">Page:</span>{' '}
                    <span className="font-mono font-bold ml-1">3</span>
                  </div>
                </div>

                {/* Method and procedure */}
                <div className="my-3 text-[11px]">
                  <div className="font-bold">Метод и калибровочная процедура:</div>
                  <div className="italic text-[10px] text-slate-700">Method and calibration procedure:</div>
                  <div className="mt-1 text-[10px] leading-snug">
                    KU-10-2025. Камера температуры (сушильные шкафы). Методика калибровки.<br />
                    EURAMET Calibration Guide No. 20 Версия 5.0 Calibration of Temperature and/or Humidity Enclosures.
                  </div>
                </div>

                {/* Reference Standards Table */}
                <div className="my-3">
                  <div className="font-bold text-[11px]">Калибровка выполнена с помощью:</div>
                  <div className="italic text-[10px] text-slate-700 mb-2">Calibration is performed by using:</div>

                  <table className="w-full border-collapse border border-black text-center text-[10.5px]">
                    <thead>
                      <tr className="bg-slate-100/70 font-bold">
                        <th className="border border-black p-1 w-8">№</th>
                        <th className="border border-black p-1 text-left w-[38%]">
                          <div>Опорный измерительный эталон</div>
                          <div className="italic text-[9px] font-normal text-slate-700">Reference measurement standart</div>
                        </th>
                        <th className="border border-black p-1 w-[18%]">
                          <div>Тип / Модель</div>
                          <div className="italic text-[9px] font-normal text-slate-700">Type / Model</div>
                        </th>
                        <th className="border border-black p-1 w-[18%]">
                          <div>Серийный номер</div>
                          <div className="italic text-[9px] font-normal text-slate-700">Serial Number</div>
                        </th>
                        <th className="border border-black p-1 text-left w-[22%]">
                          <div>Метрологическая прослеживаемость</div>
                          <div className="italic text-[9px] font-normal text-slate-700">Metrological traceability</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-1 font-mono font-bold">1</td>
                        <td className="border border-black p-1 text-left">
                          {renderInteractiveCell('B105', 'Термометр лабораторный электронный')}
                          <div className="italic text-[9.5px] text-slate-700 pl-1">Electronic laboratory thermometer</div>
                        </td>
                        <td className="border border-black p-1 font-mono">
                          {renderInteractiveCell('C105', info.standardType || 'ЛТА/Б-300МТ', 'text-center font-mono')}
                        </td>
                        <td className="border border-black p-1 font-mono">
                          {renderInteractiveCell('D105', info.standardSerial || '871352', 'text-center font-mono')}
                        </td>
                        <td className="border border-black p-1 text-left font-mono text-[10px]">
                          {renderInteractiveCell('E105', 'UZ-09T/2927-2024 от 07.11.2024 г.')}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 font-mono font-bold">2</td>
                        <td className="border border-black p-1 text-left">
                          {renderInteractiveCell('B110', 'Термометр сопротивления с цифровой индикацией (Калибратор температуры)')}
                          <div className="italic text-[9px] text-slate-700 pl-1">Resistance thermometer with digital indication (Temperature Calibrator)</div>
                        </td>
                        <td className="border border-black p-1 font-mono">
                          {renderInteractiveCell('C110', 'STS-200 A 915 (RTC-156B)', 'text-center font-mono')}
                        </td>
                        <td className="border border-black p-1 font-mono">
                          {renderInteractiveCell('D110', '613343-19 (617498-00393)', 'text-center font-mono')}
                        </td>
                        <td className="border border-black p-1 text-left font-mono text-[10px]">
                          {renderInteractiveCell('E110', 'Uz-09T/630-2025 от 14.04.2025 г.')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Calibration Results Table */}
                <div className="mt-4">
                  <div className="font-bold text-[11px]">Результаты калибровки, включая неопределенность</div>
                  <div className="italic text-[10px] text-slate-700 mb-2">Calibration results including uncertainty</div>

                  <table className="w-full border-collapse border border-black text-center text-[10.5px]">
                    <thead>
                      <tr className="bg-slate-100/70 font-bold">
                        <th className="border border-black p-1.5 w-[20%]">
                          <div>Номинальная температура, °C</div>
                          <div className="italic text-[9px] font-normal text-slate-700">Nominal temperature, °C</div>
                        </th>
                        <th className="border border-black p-1.5 w-[20%]">
                          <div>Опорное значение, °C</div>
                          <div className="italic text-[9px] font-normal text-slate-700">Support meaning, °C</div>
                        </th>
                        <th className="border border-black p-1.5 w-[20%]">
                          <div>Показание объекта калибровки, °C</div>
                          <div className="italic text-[9px] font-normal text-slate-700">Indication of the calibration object, °C</div>
                        </th>
                        <th className="border border-black p-1.5 w-[20%]">
                          <div>Отклонение, °C</div>
                          <div className="italic text-[9px] font-normal text-slate-700">Deviation, °C</div>
                        </th>
                        <th className="border border-black p-1.5 w-[20%]">
                          <div>Расширенная неопределенность, °C</div>
                          <div className="italic text-[9px] font-normal text-slate-700">Expanded uncertainty, °C</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-mono text-[11px] font-bold">
                        <td className="border border-black p-1">
                          {renderInteractiveCell('B122', defaultPointTemp, 'text-center font-mono')}
                        </td>
                        <td className="border border-black p-1">
                          {renderInteractiveCell('C122', defaultRefVal, 'text-center font-mono')}
                        </td>
                        <td className="border-2 border-emerald-600 p-1 text-emerald-800 bg-emerald-50/50">
                          {renderInteractiveCell('D122', defaultIndVal, 'text-center font-mono font-bold text-emerald-800')}
                        </td>
                        <td className="border border-black p-1">
                          {renderInteractiveCell('E122', defaultDevVal, 'text-center font-mono')}
                        </td>
                        <td className="border border-black p-1">
                          {renderInteractiveCell('F122', defaultUVal, 'text-center font-mono')}
                        </td>
                      </tr>
                      <tr className="h-6">
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-1"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Row 124: Thick Blue Page Break Line */}
              <div className="mt-8 pt-3 border-b-4 border-blue-900 flex justify-between items-center text-[10px] text-blue-900 font-bold select-none">
                <span>--- 3-Sahifa oxiri (Excel Page 3 Break) ---</span>
                <span>{getVal('H14', defaultCertNo)}</span>
              </div>
            </div>

            {/* ========================================================
                PAGE 4: ROWS 125 TO 180
                ======================================================== */}
            <div className="relative pb-4">
              {/* Background Watermark Page 4 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                <span className="text-[130px] font-bold text-slate-400/20 tracking-wider">
                  Page 4
                </span>
              </div>

              <div className="relative z-10">
                {/* Rows 126-133: Additional Information with Diagonal Hatch */}
                <div className="my-2 text-[11px]">
                  <div className="font-bold">Дополнительная информация:</div>
                  <div className="italic text-[10px] text-slate-700">Additional information:</div>
                  <div className="mt-1">
                    {renderInteractiveCell('B126', '-------')}
                  </div>
                  <div
                    className="w-full h-12 border border-slate-300 mt-1 rounded-xs"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 4px, transparent 4px, transparent 12px)',
                    }}
                  />
                </div>

                {/* Rows 135-139: Header + Page 4 */}
                <div className="grid grid-cols-12 gap-2 items-center pb-2 border-b border-slate-200 mt-4">
                  <div className="col-span-9">
                    <div className="font-bold text-[11px] text-black">
                      Хорезмский филиал ГУ «Узбекский национальный институт метрологии»
                    </div>
                    <div className="italic text-[10px] text-black">
                      "Uzbek National Institute of Metrology" state institution Khorezm branch
                    </div>
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <div className="border border-black text-center font-bold text-[11px] w-28">
                      <div className="border-b border-black">
                        {renderInteractiveCell('T135', defaultCertNo, 'py-0.5 text-center')}
                      </div>
                      <div className="border-b border-black">
                        {renderInteractiveCell('T137', "O'ZAK.KL.0013", 'py-0.5 text-center')}
                      </div>
                      <div>
                        {renderInteractiveCell('T139', defaultIssueDate, 'py-0.5 text-center font-normal text-[10px]')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-dashed border-black py-1.5 my-2 text-[11px]">
                  <div className="flex items-center gap-1">
                    <span className="font-bold">Номер сертификата:</span>{' '}
                    <span className="italic text-[10px] text-slate-700">Certificate number:</span>{' '}
                    {renderInteractiveCell('H137', defaultCertNo, 'font-mono font-bold underline')}
                  </div>
                  <div>
                    <span className="font-bold">Страница:</span>{' '}
                    <span className="italic text-[10px] text-slate-700">Page:</span>{' '}
                    <span className="font-mono font-bold ml-1">4</span>
                  </div>
                </div>

                {/* Rows 140-151: Uncertainty statement Box */}
                <div className="border border-black p-3.5 text-center space-y-2.5 my-3 text-[10px] leading-snug">
                  <div>
                    <p className="font-bold">
                      Указанная расширенная неопределенность измерений определяется как стандартная неопределенность измерений, умноженная на коэффициент охвата k = 2, что для нормального распределения соответствует вероятности охвата приблизительно 95 %. Стандартная неопределенность измерений определена в соответствии с GUM.
                    </p>
                    <p className="italic text-slate-700 mt-0.5">
                      The reported expanded uncertainty of measurement is stated as the standard uncertainty of measurement multiplied by the coverage factor k = 2, which for a normal distribution corresponds to a coverage probability of approximately 95 %. The standard uncertainty of measurement has been determined in accordance with GUM.
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-slate-300">
                    <p className="font-bold">Все измерения имеют прослеживаемость к единицам Международной системы SI</p>
                    <p className="italic text-slate-700">All measurements are traceable to the SI units</p>
                  </div>

                  <div>
                    <p className="font-bold">Результат калибровки относится только к объекту калибровки</p>
                    <p className="italic text-slate-700">The calibration result refers only to the calibration item</p>
                  </div>
                </div>

                {/* Rows 153-166: Accreditation statements Box */}
                <div className="border border-black p-3.5 text-center space-y-2.5 my-3 text-[10px] leading-snug">
                  <div>
                    <p className="font-bold">
                      Узбекский национальный институт метрологии является подписантом Договорённости о взаимном признании (MRA) Международного комитета по весам и мерам (CIPM).
                    </p>
                    <p className="italic text-slate-700 mt-0.5">
                      Uzbek National Institute of Metrology is a signatory of the International Committee for Weights and Measures (CIPM) Mutual Recognition Arrangement (MRA).
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-slate-300">
                    <p className="font-bold">
                      Хорезмский филиал ГУ «Узбекский национальный институт метрологии» аккредитован ГУ «Узбекским центром аккредитации» (O‘ZAKK) под регистрационным номером O‘ZAK.KL.0013 по O‘z DSt ISO/IEC 17025:2019 как калибровочная лаборатория.
                    </p>
                    <p className="italic text-slate-700 mt-0.5">
                      "Uzbek National Institute of Metrology" state institution Khorezm branch accredited by Uzbek Accreditation Center (O'ZAKK) under registration number O'ZAK.KL.0013 for O'z DSt ISO/IEC 17025:2019 as Calibration Laboratory.
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-slate-300">
                    <p className="font-bold">
                      Узбекский центр аккредитации (O‘ZAKK) является подписантом Договорённости о взаимном признании (MRA) Азиатско-Тихоокеанского сотрудничества по аккредитации (APAC) и Договорённости о взаимном признании (MRA) Международного сотрудничества по аккредитации лабораторий (ILAC) для признания сертификатов калибровки.
                    </p>
                    <p className="italic text-slate-700 mt-0.5">
                      Uzbek Accreditation Center (O'ZAKK) is a signatory to the Asia Pacific Accreditation Cooperation (APAC) Mutual Recognition Arrangement (MRA) and to the International Laboratory Accreditation Cooperation (ILAC) Mutual Recognition Arrangement (MRA) for the recognition of calibration certificates.
                    </p>
                  </div>
                </div>

                {/* Rows 168-174: QR Code & Feedback Box */}
                <div className="flex justify-center items-center gap-3 my-4">
                  <div className="border border-black p-2.5 text-center text-[10px] leading-tight max-w-xs">
                    <div className="font-bold">
                      Калибровочная лаборатория УзНИМ стремится получать обратную связь от своих заказчиков
                    </div>
                    <div className="italic text-slate-700 mt-1">
                      UzNIM Calibration laboratory seeks feedback from its customers
                    </div>
                  </div>
                  <div className="w-16 h-16 p-1 border border-black flex items-center justify-center bg-white shrink-0">
                    <QrCodeSvg size={58} />
                  </div>
                </div>

                {/* Rows 175-177: End of Calibration Certificate */}
                <div className="text-center mt-6 pt-2">
                  <div className="font-bold text-[13px] text-black">
                    Конец сертификата калибровки
                  </div>
                  <div className="italic text-[12px] text-black mt-0.5">
                    End of Calibration Certificate
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================
          5. MICROSOFT EXCEL BOTTOM SHEET TABS BAR
          ========================================================= */}
      <div className="bg-[#f3f4f6] dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 p-1.5 px-3 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
        {/* Left: Sheet Tabs (Лист 1, Лист 2, +) */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setActiveSheet('sheet1')}
            className={`px-3 py-1.5 rounded-t-md font-medium text-xs transition cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeSheet === 'sheet1'
                ? 'bg-white dark:bg-slate-800 text-[#107c41] dark:text-emerald-400 border-[#107c41] font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border-transparent'
            }`}
          >
            <Table className="w-3.5 h-3.5 opacity-80" />
            <span>Лист 1: Сертификат (1-180 satr)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSheet('sheet2')}
            className={`px-3 py-1.5 rounded-t-md font-medium text-xs transition cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeSheet === 'sheet2'
                ? 'bg-white dark:bg-slate-800 text-[#107c41] dark:text-emerald-400 border-[#107c41] font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border-transparent'
            }`}
          >
            <Table className="w-3.5 h-3.5 opacity-80" />
            <span>Лист 2: Протокол o‘lchashlari</span>
          </button>

          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            title="Yangi varaq qo‘shish"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Status Bar with selection stats & zoom */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3 font-mono">
            <span>ГОТОВО</span>
            <span>•</span>
            <span>Sonlar soni: {stats.count}</span>
            <span>•</span>
            <span>O‘rtacha: {stats.avg}</span>
            <span>•</span>
            <span>Yig‘indi: {stats.sum}</span>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer"
              title="Kichiklashtirish"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-mono font-bold text-[10px]">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer"
              title="Kattalashtirish"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
