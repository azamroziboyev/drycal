import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CalibrationItemInfo, ChamberCalculation, ChamberPointData } from '../types';
import { exportProtocolToExcel } from '../utils/excelExporter';
import { downloadElementAsPdf } from '../utils/pdfGenerator';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Undo2,
  Redo2,
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ZoomIn,
  ZoomOut,
  Table,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Check,
  X,
  Edit3,
} from 'lucide-react';
import { PrimaryDataProtocolSheet } from './PrimaryDataProtocolSheet';

interface ProtocolExcelEditorProps {
  info: CalibrationItemInfo;
  pointsData: ChamberPointData[];
  calculation: ChamberCalculation;
  onBackToEdit: () => void;
  onSaveCertificate?: () => void;
}

export const ProtocolExcelEditor: React.FC<ProtocolExcelEditorProps> = ({
  info,
  pointsData,
  calculation,
  onBackToEdit,
  onSaveCertificate,
}) => {
  // Active Sheet: 'all' (continuous 5 pages) | 1 | 2 | 3 | 4 | 5
  const [activeSheetTab, setActiveSheetTab] = useState<number | 'all'>('all');

  // Ribbon Tab
  const [activeRibbonTab, setActiveRibbonTab] = useState<'home' | 'insert' | 'formulas' | 'data' | 'view'>('home');

  // Zoom Level
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Selected Cell & Editing state
  const [selectedCellId, setSelectedCellId] = useState<string>('B12');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingValue, setEditingValue] = useState<string>('');
  const [formulaBarValue, setFormulaBarValue] = useState<string>('');

  // Search inside sheet
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Font styling
  const [fontFamily, setFontFamily] = useState<string>('Calibri');
  const [fontSize, setFontSize] = useState<number>(11);

  // Download states
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{ percent: number; status: string }>({
    percent: 0,
    status: '',
  });
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const inlineInputRef = useRef<HTMLInputElement>(null);

  // Extract initial 30 readings from calculation.readings30 or pointsData[0]
  const initialRows = useMemo(() => {
    if (calculation.readings30 && calculation.readings30.length > 0) {
      return calculation.readings30.map((r, i) => ({
        index: i + 1,
        tStd: typeof r.tStd === 'number' ? r.tStd : parseFloat(String(r.tStd || '29.60')),
        tInd: typeof r.tInd === 'number' ? r.tInd : parseFloat(String(r.tInd || '30.00')),
      }));
    }
    const pt = pointsData[0];
    if (pt && pt.rows && pt.rows.length > 0) {
      return Array.from({ length: 30 }, (_, i) => {
        const row = pt.rows[i];
        const stdVal = typeof row?.tStd === 'number' ? row.tStd : parseFloat(String(row?.tStd || '29.60'));
        const indVal = typeof row?.tInd === 'number' ? row.tInd : parseFloat(String(row?.tInd || '30.00'));
        return {
          index: i + 1,
          tStd: isNaN(stdVal) ? 29.60 : stdVal,
          tInd: isNaN(indVal) ? 30.00 : indVal,
        };
      });
    }
    return Array.from({ length: 30 }, (_, i) => ({
      index: i + 1,
      tStd: 29.6 + (i % 5) * 0.02,
      tInd: 30.0,
    }));
  }, [calculation.readings30, pointsData]);

  // 30 Temperature Points editable state
  const [tRows, setTRows] = useState<{ index: number; tStd: number; tInd: number }[]>(initialRows);

  // Synchronize tRows whenever Hisob-kitob inputs change
  useEffect(() => {
    setTRows(initialRows);
  }, [initialRows]);

  // Common metadata editable state
  const [metaData, setMetaData] = useState({
    certNo: info.certificateNumber || 'Uz-112/1-2025',
    calDate: info.issueDate || '2025-04-29',
    orderNo: info.orderNumber || '№ 25-112-xxxxxx',
    customer: info.customerName || '-',
    objectName: info.objectName || 'Сушильные шкаф (Quritish shkafi)',
    model: info.objectType || 'RTOP-500Y',
    serialNo: info.serialNumber || '2333001557',
    rangeFrom: '0,0',
    rangeTo: '50,0',
    standard1: info.standardName || 'Термометр лабораторный электронный',
    standard1Type: info.standardType || 'ЛТА/Б-300МТ',
    standard1Serial: info.standardSerial || '871352',
    standard2: 'Термометр сопротивления с цифровой индикацией (Калибратор температуры)',
    standard2Type: 'STS-200 A 915 (RTC-156B)',
    standard2Serial: '613343-19 (617498-00393)',
    logger: 'Регистратор-даталлоггер типа: "DL200D" заводской номер № 068.1019.0802.034',
    tempStart: info.ambientTempMin !== undefined ? String(info.ambientTempMin).replace('.', ',') : '24,00',
    tempEnd: info.ambientTempMax !== undefined ? String(info.ambientTempMax).replace('.', ',') : '24,50',
    humStart: info.relativeHumidityMin !== undefined ? String(info.relativeHumidityMin).replace('.', ',') : '37,70',
    humEnd: info.relativeHumidityMax !== undefined ? String(info.relativeHumidityMax).replace('.', ',') : '38,50',
    pressStart: info.atmosphericPressureMin !== undefined ? String(info.atmosphericPressureMin).replace('.', ',') : '1012,20',
    pressEnd: info.atmosphericPressureMax !== undefined ? String(info.atmosphericPressureMax).replace('.', ',') : '1013,00',
    performer: info.calibratedByUz || "G'aibnazarov Boburjon",
    conclusions: 'Сушильные шкаф соответствует требованиям метрологических норм KU-10-2025.',
  });

  // Synchronize metadata whenever info changes in Hisob-kitob
  useEffect(() => {
    setMetaData((prev) => ({
      ...prev,
      certNo: info.certificateNumber || prev.certNo,
      calDate: info.issueDate || prev.calDate,
      orderNo: info.orderNumber || prev.orderNo,
      customer: info.customerName || prev.customer,
      objectName: info.objectName || prev.objectName,
      model: info.objectType || prev.model,
      serialNo: info.serialNumber || prev.serialNo,
      standard1: info.standardName || prev.standard1,
      standard1Type: info.standardType || prev.standard1Type,
      standard1Serial: info.standardSerial || prev.standard1Serial,
      performer: info.calibratedByUz || prev.performer,
      tempStart: info.ambientTempMin !== undefined ? String(info.ambientTempMin).replace('.', ',') : prev.tempStart,
      tempEnd: info.ambientTempMax !== undefined ? String(info.ambientTempMax).replace('.', ',') : prev.tempEnd,
      humStart: info.relativeHumidityMin !== undefined ? String(info.relativeHumidityMin).replace('.', ',') : prev.humStart,
      humEnd: info.relativeHumidityMax !== undefined ? String(info.relativeHumidityMax).replace('.', ',') : prev.humEnd,
      pressStart: info.atmosphericPressureMin !== undefined ? String(info.atmosphericPressureMin).replace('.', ',') : prev.pressStart,
      pressEnd: info.atmosphericPressureMax !== undefined ? String(info.atmosphericPressureMax).replace('.', ',') : prev.pressEnd,
    }));
  }, [info]);

  // Live Recalculations of means, standard deviation, and uncertainty budget
  const liveStats = useMemo(() => {
    const stds = tRows.map((r) => r.tStd).filter((v) => !isNaN(v));
    const inds = tRows.map((r) => r.tInd).filter((v) => !isNaN(v));

    const n = stds.length || 30;
    const meanStd = stds.reduce((a, b) => a + b, 0) / n;
    const meanInd = inds.reduce((a, b) => a + b, 0) / n;

    // Bessel-corrected sample standard deviation
    const sStd = Math.sqrt(stds.reduce((acc, v) => acc + Math.pow(v - meanStd, 2), 0) / (n - 1));
    const sInd = Math.sqrt(inds.reduce((acc, v) => acc + Math.pow(v - meanInd, 2), 0) / (n - 1));

    // Type A uncertainty u(T) = s / sqrt(n)
    const uAStd = sStd / Math.sqrt(n);
    const uAInd = sInd / Math.sqrt(n);

    // Temperature point deviation: meanInd - meanStd
    const dev = meanInd - meanStd;

    // Uncertainty budget components (using actual calculation or calibrated chamber values)
    const u_invar = 5.3867e-2;
    const u_inhom = calculation.inhomogeneityDelta > 0 ? calculation.inhomogeneityDelta / Math.sqrt(3) : 4.06262e-2;
    const u_rad = calculation.radiationDelta > 0 ? calculation.radiationDelta / Math.sqrt(3) : 1.06232e-2;
    const u_load = calculation.loadDelta > 0 ? calculation.loadDelta / Math.sqrt(3) : 0.011662;
    const u_calstd = info.standardCertUncertainty > 0 ? info.standardCertUncertainty / 2 : 5.0e-2;
    const u_resstd = info.standardResolution > 0 ? info.standardResolution / Math.sqrt(3) : 2.89e-4;
    const u_restherm = (info.resolution > 0 ? info.resolution / 2 : 0.05) / Math.sqrt(3);
    const u_drift = info.standardDrift > 0 ? info.standardDrift / Math.sqrt(3) : 0.0;

    // Combined uncertainty u_c
    const sumSquares =
      Math.pow(uAStd, 2) +
      Math.pow(uAInd, 2) +
      Math.pow(u_invar, 2) +
      Math.pow(u_inhom, 2) +
      Math.pow(u_rad, 2) +
      Math.pow(u_load, 2) +
      Math.pow(u_calstd, 2) +
      Math.pow(u_resstd, 2) +
      Math.pow(u_restherm, 2) +
      Math.pow(u_drift, 2);

    const uc = Math.sqrt(sumSquares);
    const k = 2;
    const U = k * uc;

    return {
      meanStdNum: meanStd,
      meanIndNum: meanInd,
      uAStdNum: uAStd,
      uAIndNum: uAInd,
      devNum: dev,
      ucNum: uc,
      UNum: U,
      meanStd: meanStd.toFixed(4).replace('.', ','),
      meanInd: meanInd.toFixed(3).replace('.', ','),
      uAStd: uAStd.toFixed(8).replace('.', ','),
      uAInd: uAInd.toFixed(8).replace('.', ','),
      dev: dev.toFixed(2).replace('.', ','),
      ucSci: uc.toExponential(3).toUpperCase().replace('.', ','),
      UVal: U.toFixed(4).replace('.', ','),
      URounded: U.toFixed(2).replace('.', ','),
      veff: typeof calculation.v_eff === 'number' ? calculation.v_eff.toFixed(1).replace('.', ',') : (calculation.v_eff || '8374,8'),
      deltaTherm: (-dev).toFixed(4).replace('.', ','),
    };
  }, [tRows, calculation, info]);

  // Sync formula bar value with selected cell
  useEffect(() => {
    setFormulaBarValue(metaData[selectedCellId as keyof typeof metaData] || '');
  }, [selectedCellId, metaData]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inlineInputRef.current) {
      inlineInputRef.current.focus();
      inlineInputRef.current.select();
    }
  }, [isEditing]);

  const handleCellClick = (cellId: string, val: string) => {
    setSelectedCellId(cellId);
    setFormulaBarValue(val);
  };

  const handleCellDoubleClick = (cellId: string, val: string) => {
    setSelectedCellId(cellId);
    setEditingValue(val);
    setIsEditing(true);
  };

  const commitEdit = (cellId: string, val: string) => {
    setMetaData((prev) => ({
      ...prev,
      [cellId]: val,
    }));
    setIsEditing(false);
  };

  // 1. DOWNLOAD EXCEL (.xlsx)
  const handleDownloadExcel = async () => {
    setIsExportingExcel(true);
    setSuccessMessage('');
    setErrorMessage('');
    if (onSaveCertificate) onSaveCertificate();

    try {
      const updatedInfo: CalibrationItemInfo = {
        ...info,
        certificateNumber: metaData.certNo,
        issueDate: metaData.calDate,
        orderNumber: metaData.orderNo,
        customerName: metaData.customer,
        objectName: metaData.objectName,
        objectType: metaData.model,
        serialNumber: metaData.serialNo,
        calibratedByUz: metaData.performer,
      };

      const updatedPoints: ChamberPointData[] = [
        {
          ...(pointsData[0] || {
            id: 'N1',
            nameUz: 'N1',
            nameRu: 'N1',
            positionDesc: '',
            coord: [0, 0, 0],
            isCenter: false,
            rows: [],
          }),
          rows: tRows.map((r) => ({ index: r.index, tStd: r.tStd, tInd: r.tInd })),
        },
      ];

      const updatedCalc: ChamberCalculation = {
        ...calculation,
        pointTemp: calculation.pointTemp || 30.0,
        readings30: tRows.map((r) => ({ index: r.index, tStd: r.tStd, tInd: r.tInd })),
        tCpStd: liveStats.meanStdNum,
        tCpInd: liveStats.meanIndNum,
        uTStd: liveStats.uAStdNum,
        uTInd: liveStats.uAIndNum,
        deviation: liveStats.devNum,
        u_c: liveStats.ucNum,
        U: liveStats.UNum,
        centerStdMean: liveStats.meanStdNum,
        overallIndMean: liveStats.meanIndNum,
      };

      await exportProtocolToExcel(updatedInfo, updatedCalc, updatedPoints);
      setSuccessMessage('Bayonnoma haqiqiy Excel (.xlsx) fayli sifatida muvaffaqiyatli yuklab olindi!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Excel download error', err);
      setErrorMessage('Excel faylni shakllantirishda xatolik yuz berdi.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // 2. DOWNLOAD PDF
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    setSuccessMessage('');
    setErrorMessage('');
    if (onSaveCertificate) onSaveCertificate();

    try {
      const cleanFileName = `Bayonnoma_${(metaData.certNo || 'Uz-112-1-2025').replace(/[\/\\]/g, '_')}_${metaData.serialNo}.pdf`;
      const protocolPageIds = [
        'editor-protocol-page-1',
        'editor-protocol-page-2',
        'editor-protocol-page-3',
        'editor-protocol-page-4',
        'editor-protocol-page-5',
      ];

      await downloadElementAsPdf(protocolPageIds, cleanFileName, (percent, status) => {
        setPdfProgress({ percent, status });
      });

      setSuccessMessage('Bayonnoma PDF formati muvaffaqiyatli saqlandi va yuklab olindi!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('PDF error', err);
      setErrorMessage('PDF shakllantirishda xatolik yuz berdi.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Excel columns A to V
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];

  return (
    <div className="bg-[#f3f4f6] dark:bg-slate-950 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-xl overflow-hidden font-sans select-none flex flex-col">
      {/* =========================================================
          1. OFFICE APPLICATION TOP HEADER BAR
          ========================================================= */}
      <div className="bg-[#107c41] text-white px-3 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm select-none">
        {/* Left: Office Brand & File Name */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToEdit}
            className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer text-white"
            title="Tahrirlashga qaytish"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="bg-white/20 p-1.5 rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide">
                Protokol_{metaData.certNo.replace(/[\/\\]/g, '_')}.xlsx - Excel
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                Avtomatik saqlanmoqda
              </span>
            </div>
            <div className="text-[11px] text-white/80">
              O‘zMMI Kalibrlash Bayonnomasi • Microsoft Excel Online Integratsiyasi
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

        {/* Right: EXACTLY TWO DOWNLOAD BUTTONS AS REQUESTED */}
        <div className="flex items-center gap-2">
          {/* BUTTON 1: DOWNLOAD EXCEL (.xlsx) */}
          <button
            type="button"
            disabled={isExportingExcel}
            onClick={handleDownloadExcel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-[#107c41] hover:bg-emerald-50 transition shadow-sm cursor-pointer disabled:opacity-60"
            title="Bayonnomani haqiqiy Excel (.xlsx) fayli sifatida yuklab olish"
          >
            {isExportingExcel ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#107c41]" />
                <span>Excel tayyorlanmoqda...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Bayonnomani Excel (.xlsx) yuklab olish</span>
              </>
            )}
          </button>

          {/* BUTTON 2: DOWNLOAD PDF */}
          <button
            type="button"
            disabled={isDownloadingPdf}
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/40 transition shadow-sm cursor-pointer disabled:opacity-60"
            title="Bayonnomani PDF shaklida yuklab olish"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{pdfProgress.percent}% (PDF)</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>PDF shaklida yuklash</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================
          2. OFFICE RIBBON (LENTA) - TABS & FORMATTING TOOLS
          ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs">
        {/* Ribbon Tabs Header */}
        <div className="flex items-center px-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-bold text-white bg-[#107c41] rounded-t-md cursor-pointer mr-1"
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

        {/* Ribbon Action Tools Bar */}
        <div className="p-1.5 px-3 flex flex-wrap items-center gap-2 overflow-x-auto select-none bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-1 text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="Calibri">Calibri</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>

            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-1 text-slate-800 dark:text-slate-200 outline-none w-12 text-center"
            >
              {[9, 10, 11, 12, 14].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
            <button
              type="button"
              className="p-1.5 rounded font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-300"
              title="Qalin (Bold)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded italic hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-300"
              title="Qiya (Italic)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded underline hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-300"
              title="Tagiga chizilgan (Underline)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Chapga tekislash"
            >
              <AlignLeft className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="O‘rtaga tekislash"
            >
              <AlignCenter className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="O‘ngga tekislash"
            >
              <AlignRight className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            </button>
          </div>

          {/* Real-time In-browser edit hint */}
          <div className="flex items-center gap-2 pl-2">
            <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/70 text-[#107c41] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] px-2.5 py-1 rounded-md font-semibold">
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
              Excel ichida tahrirlash: Harorat yoki katak ustiga 2 marta bosing
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

        <div className="flex items-center gap-1 text-slate-400">
          <span className="text-slate-400 font-serif italic font-bold px-1 select-none text-sm">
            fx
          </span>
        </div>

        {/* Live Formula Bar Input */}
        <input
          type="text"
          value={formulaBarValue}
          onChange={(e) => {
            const val = e.target.value;
            setFormulaBarValue(val);
            setMetaData((prev) => ({ ...prev, [selectedCellId]: val }));
          }}
          placeholder="Katak formulasi yoki qiymatini kiriting..."
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-slate-800 dark:text-slate-200 text-xs font-mono outline-none focus:border-[#107c41] focus:ring-1 focus:ring-[#107c41] shadow-xs"
        />
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 px-4 bg-red-50 dark:bg-red-950/60 border-b border-red-300 dark:border-red-800 text-xs text-red-800 dark:text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* =========================================================
          4. MAIN INTERACTIVE PROTOCOL EXCEL SPREADSHEET
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
          {/* Column letters A to V */}
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

          {/* Main Excel Sheet Body */}
          <div className="p-4 text-[11px] leading-tight relative bg-white" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
            
            {/* ========================================================
                PAGE 1 (Screenshot 2026-11-10 223851.png)
                ======================================================== */}
            {(activeSheetTab === 'all' || activeSheetTab === 1) && (
              <div className="relative pb-6 mb-6">
                {/* Watermark Page 1 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                  <span className="text-[130px] font-bold text-slate-400/20 tracking-wider">
                    Page 1
                  </span>
                </div>

                <div className="relative z-10">
                  {/* Top Header */}
                  <div className="flex justify-between items-start pb-2 border-b-2 border-black">
                    <div>
                      <div className="text-[16px] font-extrabold uppercase tracking-tight text-black">
                        Протокол калибровки
                      </div>
                      <div className="text-[11px] font-bold text-black uppercase tracking-wider">
                        CALIBRATION REPORT
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold">Номер протокола:</span>
                        <span className="italic text-[10px]">Number of report:</span>
                        <span
                          onClick={() => handleCellClick('certNo', metaData.certNo)}
                          className="font-bold font-mono underline ml-1 text-black cursor-cell hover:bg-emerald-50 px-1"
                        >
                          {metaData.certNo}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date & Page count */}
                  <div className="flex justify-between items-center py-2 text-xs border-b border-black mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Дата калибровки:</span>
                      <span className="italic text-[10px]">Date of calibration:</span>
                      <span
                        onClick={() => handleCellClick('calDate', metaData.calDate)}
                        className="font-bold text-[#0070C0] ml-1 font-mono cursor-cell hover:bg-emerald-50 px-1"
                      >
                        {metaData.calDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold">Количество страниц:</span>
                      <span className="italic text-[10px]">Number of pages:</span>
                      <span className="font-bold text-red-600 font-mono ml-1">5</span>
                    </div>
                  </div>

                  {/* Customer, Order, Item details */}
                  <div className="border border-black mb-4">
                    <div className="grid grid-cols-12 border-b border-black">
                      <div className="col-span-4 p-2 border-r border-black font-bold">
                        <div>Наименование и адрес заказчика</div>
                        <div className="italic font-normal text-[10px] text-slate-700">Name and address of customer</div>
                      </div>
                      <div className="col-span-8 p-2 font-mono flex items-center">
                        <span
                          onClick={() => handleCellClick('customer', metaData.customer)}
                          className="cursor-cell hover:bg-emerald-50 px-1 w-full"
                        >
                          {metaData.customer}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 border-b border-black">
                      <div className="col-span-4 p-2 border-r border-black font-bold">
                        <div>Заявка:</div>
                        <div className="italic font-normal text-[10px] text-slate-700">Order:</div>
                      </div>
                      <div className="col-span-8 p-2 text-[#0070C0] font-bold font-mono">
                        <span
                          onClick={() => handleCellClick('orderNo', metaData.orderNo)}
                          className="cursor-cell hover:bg-emerald-50 px-1"
                        >
                          {metaData.orderNo}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 border-b border-black">
                      <div className="col-span-4 p-2 border-r border-black font-bold">
                        <div>Объект калибровки</div>
                        <div className="italic font-normal text-[10px] text-slate-700">Calibration item</div>
                      </div>
                      <div className="col-span-8 p-2 space-y-1">
                        <div className="text-[#0070C0] font-bold">
                          {metaData.objectName}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
                          <span className="italic">с диапазоном измерения от</span>
                          <span className="font-bold text-[#0070C0] font-mono">{metaData.rangeFrom}</span>
                          <span className="italic">до</span>
                          <span className="font-bold text-[#0070C0] font-mono">{metaData.rangeTo} °C</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[10.5px]">
                          <div>
                            <span className="italic">типа:</span>{' '}
                            <span className="font-bold text-[#0070C0] font-mono">{metaData.model}</span>
                          </div>
                          <div>
                            <span className="italic">заводским номером:</span>{' '}
                            <span className="font-bold text-[#0070C0] font-mono">{metaData.serialNo}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 border-b border-black">
                      <div className="col-span-4 p-2 border-r border-black font-bold">
                        <div>Методика и процедура калибровки</div>
                        <div className="italic font-normal text-[10px] text-slate-700">Calibration method and procedure</div>
                      </div>
                      <div className="col-span-8 p-2 text-[10px] leading-snug">
                        KU-10-2025. Камера температуры (термостаты и сушильные шкафы). Методика калибровки.<br />
                        EURAMET Calibration Guide No. 20 Версия 5.0 Calibration of Temperature and/or Humidity Enclosures.
                      </div>
                    </div>

                    <div className="grid grid-cols-12 border-b border-black">
                      <div className="col-span-4 p-2 border-r border-black font-bold">
                        <div>Калибровка выполнена с помощью</div>
                        <div className="italic font-normal text-[10px] text-slate-700">Calibration is performed by using</div>
                      </div>
                      <div className="col-span-8 p-2 text-[#0070C0] space-y-1 text-[10px]">
                        <div>{metaData.standard1}, типа: {metaData.standard1Type}, заводской номер № {metaData.standard1Serial}</div>
                        <div>{metaData.standard2}, типа: {metaData.standard2Type}, заводской номер № {metaData.standard2Serial}</div>
                        <div>{metaData.logger}</div>
                      </div>
                    </div>

                    {/* Conditions */}
                    <div className="grid grid-cols-12">
                      <div className="col-span-4 p-2 border-r border-black font-bold">
                        <div>Условия калибровки</div>
                        <div className="italic font-normal text-[10px] text-slate-700">Calibration conditions</div>
                      </div>
                      <div className="col-span-8 p-2">
                        <table className="w-full border-collapse border border-black text-center text-[10px]">
                          <thead>
                            <tr className="bg-slate-50 font-bold">
                              <th className="border border-black p-1 text-left w-1/2">Показатель</th>
                              <th className="border border-black p-1 w-1/4">в начале</th>
                              <th className="border border-black p-1 w-1/4">в конце</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-black p-1 text-left font-bold">Температура окружающей среды, °С</td>
                              <td className="border border-black p-1 font-mono text-[#0070C0] font-bold">{metaData.tempStart}</td>
                              <td className="border border-black p-1 font-mono text-[#0070C0] font-bold">{metaData.tempEnd}</td>
                            </tr>
                            <tr>
                              <td className="border border-black p-1 text-left font-bold">Относительная влажность, %</td>
                              <td className="border border-black p-1 font-mono text-[#0070C0] font-bold">{metaData.humStart}</td>
                              <td className="border border-black p-1 font-mono text-[#0070C0] font-bold">{metaData.humEnd}</td>
                            </tr>
                            <tr>
                              <td className="border border-black p-1 text-left font-bold">Атмосферное давление, hPa</td>
                              <td className="border border-black p-1 font-mono text-[#0070C0] font-bold">{metaData.pressStart}</td>
                              <td className="border border-black p-1 font-mono text-[#0070C0] font-bold">{metaData.pressEnd}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-2 border-b-4 border-blue-900 flex justify-between items-center text-[10px] text-blue-900 font-bold select-none">
                  <span>--- 1-Sahifa oxiri (Excel Page 1 Break) ---</span>
                  <span>{metaData.certNo}</span>
                </div>
              </div>
            )}

            {/* ========================================================
                PAGE 2 (Screenshot 2026-11-10 223903.png)
                ======================================================== */}
            {(activeSheetTab === 'all' || activeSheetTab === 2) && (
              <div className="relative pb-6 mb-6">
                {/* Watermark Page 2 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                  <span className="text-[130px] font-bold text-slate-400/20 tracking-wider">
                    Page 2
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="font-bold text-xs mb-1">Результаты калибровки:</div>
                  <div className="bg-[#548235] text-white font-bold px-3 py-1 text-xs mb-3 flex items-center gap-2">
                    <span>Точка калибровки</span>
                    <span className="font-mono">30 °C</span>
                  </div>

                  {/* Step 1 Circle + Table T1-T30 */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-bold flex items-center justify-center shrink-0 text-sm">
                      1
                    </div>

                    <div className="flex-1 overflow-x-auto">
                      <table className="border-collapse border-2 border-black text-center text-[10px] max-w-sm">
                        <thead>
                          <tr className="bg-[#bdd7ee] font-bold">
                            <th className="border border-black p-1 w-10">№</th>
                            <th className="border border-black p-1 w-28">Показания эталона</th>
                            <th className="border border-black p-1 w-32">Показания индикатора термостата</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tRows.map((r, idx) => {
                            const isCellStdSelected = selectedCellId === `T_std_${r.index}`;
                            const isCellIndSelected = selectedCellId === `T_ind_${r.index}`;

                            return (
                              <tr key={r.index} className="hover:bg-slate-50">
                                <td className="border border-black p-0.5 font-bold font-mono">T{r.index}</td>
                                <td
                                  onClick={() => handleCellClick(`T_std_${r.index}`, String(r.tStd))}
                                  className={`border border-black p-0.5 font-mono cursor-cell bg-[#fff2cc] ${
                                    isCellStdSelected ? 'ring-2 ring-[#107c41] font-bold' : ''
                                  }`}
                                >
                                  {isEditing && isCellStdSelected ? (
                                    <input
                                      ref={inlineInputRef}
                                      type="number"
                                      step="0.01"
                                      value={editingValue}
                                      onChange={(e) => setEditingValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          const val = parseFloat(editingValue);
                                          if (!isNaN(val)) {
                                            const copy = [...tRows];
                                            copy[idx].tStd = val;
                                            setTRows(copy);
                                          }
                                          setIsEditing(false);
                                        } else if (e.key === 'Escape') {
                                          setIsEditing(false);
                                        }
                                      }}
                                      onBlur={() => {
                                        const val = parseFloat(editingValue);
                                        if (!isNaN(val)) {
                                          const copy = [...tRows];
                                          copy[idx].tStd = val;
                                          setTRows(copy);
                                        }
                                        setIsEditing(false);
                                      }}
                                      className="w-full text-center outline-none bg-white font-mono text-xs border border-[#107c41]"
                                    />
                                  ) : (
                                    <span onDoubleClick={() => handleCellDoubleClick(`T_std_${r.index}`, String(r.tStd))}>
                                      {r.tStd.toFixed(2).replace('.', ',')}
                                    </span>
                                  )}
                                </td>
                                <td
                                  onClick={() => handleCellClick(`T_ind_${r.index}`, String(r.tInd))}
                                  className={`border border-black p-0.5 font-mono cursor-cell ${
                                    isCellIndSelected ? 'ring-2 ring-[#107c41] font-bold' : ''
                                  }`}
                                >
                                  {isEditing && isCellIndSelected ? (
                                    <input
                                      ref={inlineInputRef}
                                      type="number"
                                      step="0.1"
                                      value={editingValue}
                                      onChange={(e) => setEditingValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          const val = parseFloat(editingValue);
                                          if (!isNaN(val)) {
                                            const copy = [...tRows];
                                            copy[idx].tInd = val;
                                            setTRows(copy);
                                          }
                                          setIsEditing(false);
                                        } else if (e.key === 'Escape') {
                                          setIsEditing(false);
                                        }
                                      }}
                                      onBlur={() => {
                                        const val = parseFloat(editingValue);
                                        if (!isNaN(val)) {
                                          const copy = [...tRows];
                                          copy[idx].tInd = val;
                                          setTRows(copy);
                                        }
                                        setIsEditing(false);
                                      }}
                                      className="w-full text-center outline-none bg-white font-mono text-xs border border-[#107c41]"
                                    />
                                  ) : (
                                    <span onDoubleClick={() => handleCellDoubleClick(`T_ind_${r.index}`, String(r.tInd))}>
                                      {r.tInd.toFixed(1).replace('.', ',')}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}

                          {/* Mean row */}
                          <tr className="bg-[#bdd7ee] font-bold font-mono">
                            <td className="border border-black p-1">Tcp</td>
                            <td className="border border-black p-1">{liveStats.meanStd}</td>
                            <td className="border border-black p-1">{liveStats.meanInd}</td>
                          </tr>

                          {/* Std dev row */}
                          <tr className="bg-[#fff2cc] font-bold font-mono">
                            <td className="border border-black p-1">u(T)</td>
                            <td className="border border-black p-1">{liveStats.uAStd}</td>
                            <td className="border border-black p-1">{liveStats.uAInd}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-2 border-b-4 border-blue-900 flex justify-between items-center text-[10px] text-blue-900 font-bold select-none">
                  <span>--- 2-Sahifa oxiri (Excel Page 2 Break) ---</span>
                  <span>{metaData.certNo}</span>
                </div>
              </div>
            )}

            {/* ========================================================
                PAGE 3 (Screenshot 2026-11-10 223916.png)
                ======================================================== */}
            {(activeSheetTab === 'all' || activeSheetTab === 3) && (
              <div className="relative pb-6 mb-6">
                {/* Watermark Page 3 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                  <span className="text-[130px] font-bold text-slate-400/20 tracking-wider">
                    Page 3
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-bold flex items-center justify-center shrink-0 text-sm">
                      2
                    </div>
                    <div className="font-bold text-xs">
                      Определение неопределенности результатов калибровки
                    </div>
                  </div>

                  {/* 10-row Budget Table */}
                  <table className="w-full border-collapse border-2 border-black text-center text-[9.5px]">
                    <thead>
                      <tr className="bg-[#bdd7ee] font-bold">
                        <th className="border border-black p-1 w-[38%] text-left">Источники неопределенности</th>
                        <th className="border border-black p-1 w-[6%]">Ед.</th>
                        <th className="border border-black p-1 w-[16%]">Стандартная неопределенност связанная, u(xi)</th>
                        <th className="border border-black p-1 w-[12%]">Распределение p(xi)</th>
                        <th className="border border-black p-1 w-[8%]">Коэфф. Ci</th>
                        <th className="border border-black p-1 w-[12%]">Вклад u(yi)</th>
                        <th className="border border-black p-1 w-[8%] bg-[#00b0f0] text-black">Парето (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-1 text-left">Стандартная неопределенности эталонного термометра по типу А u(T_std)</td>
                        <td className="border border-black p-1">°C</td>
                        <td className="border border-black p-1 font-mono font-bold">{liveStats.uAStd}</td>
                        <td className="border border-black p-1">нормал</td>
                        <td className="border border-black p-1 font-mono">1</td>
                        <td className="border border-black p-1 font-mono font-bold">1,03E-02</td>
                        <td className="border border-black p-1 font-mono bg-[#00b0f0]/30 font-bold">5,2</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 text-left">Стандартная неопределенности калибруемого термостата по типу А u(T_therm)</td>
                        <td className="border border-black p-1">°C</td>
                        <td className="border border-black p-1 font-mono font-bold">{liveStats.uAInd}</td>
                        <td className="border border-black p-1">нормал</td>
                        <td className="border border-black p-1 font-mono">-1</td>
                        <td className="border border-black p-1 font-mono font-bold">-8,75E-03</td>
                        <td className="border border-black p-1 font-mono bg-[#00b0f0]/30 font-bold">-4,4</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 text-left">СН от временной нестабильности калибруемого термостата, u(T_in,var)</td>
                        <td className="border border-black p-1">°C</td>
                        <td className="border border-black p-1 font-mono">5,3867E-02</td>
                        <td className="border border-black p-1">прямоуголь</td>
                        <td className="border border-black p-1 font-mono">1</td>
                        <td className="border border-black p-1 font-mono">5,39E-02</td>
                        <td className="border border-black p-1 font-mono bg-[#00b0f0]/30 font-bold">27,3</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 text-left">СН от пространственной неоднородности калибруемого термостата u(T_inhom)</td>
                        <td className="border border-black p-1">°C</td>
                        <td className="border border-black p-1 font-mono">4,06262E-02</td>
                        <td className="border border-black p-1">прямоуголь</td>
                        <td className="border border-black p-1 font-mono">1</td>
                        <td className="border border-black p-1 font-mono">4,06E-02</td>
                        <td className="border border-black p-1 font-mono bg-[#00b0f0]/30 font-bold">20,6</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 text-left">СН от радиационной эффекти калибруемого термостата u(T_radiation)</td>
                        <td className="border border-black p-1">°C</td>
                        <td className="border border-black p-1 font-mono">1,06232E-02</td>
                        <td className="border border-black p-1">прямоуголь</td>
                        <td className="border border-black p-1 font-mono">1</td>
                        <td className="border border-black p-1 font-mono">1,06E-02</td>
                        <td className="border border-black p-1 font-mono bg-[#00b0f0]/30 font-bold">5,4</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 text-left">СН от загруженного эффекта калибруемого термостата u(T_load)</td>
                        <td className="border border-black p-1">°C</td>
                        <td className="border border-black p-1 font-mono">0,011662</td>
                        <td className="border border-black p-1">прямоуголь</td>
                        <td className="border border-black p-1 font-mono">1</td>
                        <td className="border border-black p-1 font-mono">1,17E-02</td>
                        <td className="border border-black p-1 font-mono bg-[#00b0f0]/30 font-bold">5,9</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 text-left">СН эталонного термометра u(δT_cal.std)</td>
                        <td className="border border-black p-1">°C</td>
                        <td className="border border-black p-1 font-mono text-red-600 font-bold">5,00E-02</td>
                        <td className="border border-black p-1">нормал</td>
                        <td className="border border-black p-1 font-mono">1</td>
                        <td className="border border-black p-1 font-mono">5,00E-02</td>
                        <td className="border border-black p-1 font-mono bg-[#00b0f0]/30 font-bold">25,3</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 text-left">СН от разрешающего способности эталонного термометра, u(δT_rez.std)</td>
                        <td className="border border-black p-1">°C</td>
                        <td className="border border-black p-1 font-mono">2,89E-04</td>
                        <td className="border border-black p-1">прямоуголь</td>
                        <td className="border border-black p-1 font-mono">1</td>
                        <td className="border border-black p-1 font-mono">2,89E-04</td>
                        <td className="border border-black p-1 font-mono bg-[#00b0f0]/30 font-bold">0,1</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 text-left">СН от разрешающего способности калибруемого термостата, u(δT_rez.therm)</td>
                        <td className="border border-black p-1">°C</td>
                        <td className="border border-black p-1 font-mono text-red-600 font-bold">2,88675E-02</td>
                        <td className="border border-black p-1">прямоуголь</td>
                        <td className="border border-black p-1 font-mono">1</td>
                        <td className="border border-black p-1 font-mono">2,89E-02</td>
                        <td className="border border-black p-1 font-mono bg-[#00b0f0]/30 font-bold">14,6</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 text-left">СН от временного дрейфа эталона Δd</td>
                        <td className="border border-black p-1">°C</td>
                        <td className="border border-black p-1 font-mono bg-[#ffff00] font-bold">0,00E+00</td>
                        <td className="border border-black p-1">прямоуголь</td>
                        <td className="border border-black p-1 font-mono">1</td>
                        <td className="border border-black p-1 font-mono">0,00E+00</td>
                        <td className="border border-black p-1 font-mono bg-[#00b0f0]/30 font-bold">0,0</td>
                      </tr>

                      {/* Summary Combined uc */}
                      <tr className="bg-[#bdd7ee] font-bold font-mono">
                        <td colSpan={2} className="border border-black p-1 text-left font-sans">
                          Суммарная станд. неопределенност, uc(V20)
                        </td>
                        <td colSpan={4} className="border border-black p-1 text-right">
                          {liveStats.ucSci}
                        </td>
                        <td className="border border-black p-1 bg-[#00b0f0] text-black">
                          100,00
                        </td>
                      </tr>

                      {/* Expanded U */}
                      <tr className="bg-[#bdd7ee] font-bold font-mono">
                        <td colSpan={2} className="border border-black p-1 text-left font-sans">
                          Расширенная неопределенность, U(V20)
                        </td>
                        <td colSpan={3} className="border border-black p-1 text-center font-sans font-normal text-[9px]">
                          коэффициент охвата k = 2 (P = 95 %), mL
                        </td>
                        <td colSpan={2} className="border border-black p-1 text-right text-base text-[#107c41]">
                          {liveStats.UVal}
                        </td>
                      </tr>

                      {/* Veff */}
                      <tr className="bg-white font-bold font-mono">
                        <td colSpan={5} className="border border-black p-1 text-left font-sans">
                          Коэффициент покрытия Veff(V20)
                        </td>
                        <td colSpan={2} className="border border-black p-1 bg-[#ffff00] text-center">
                          {liveStats.veff}
                        </td>
                      </tr>

                      {/* Correction Delta T */}
                      <tr className="bg-white font-bold font-mono">
                        <td colSpan={5} className="border border-black p-1 text-left font-sans">
                          Поправка показания калибруемого термостата ΔTthermostat
                        </td>
                        <td colSpan={2} className="border border-black p-1 bg-[#ffff00] text-center">
                          {liveStats.deltaTherm}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 pt-2 border-b-4 border-blue-900 flex justify-between items-center text-[10px] text-blue-900 font-bold select-none">
                  <span>--- 3-Sahifa oxiri (Excel Page 3 Break) ---</span>
                  <span>{metaData.certNo}</span>
                </div>
              </div>
            )}

            {/* ========================================================
                PAGE 4/5 (Screenshot 2026-11-10 223927.png)
                ======================================================== */}
            {(activeSheetTab === 'all' || activeSheetTab === 4 || activeSheetTab === 5) && (
              <div className="relative pb-4">
                {/* Watermark Page 5 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                  <span className="text-[130px] font-bold text-slate-400/20 tracking-wider">
                    Page 5
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="text-[11px] font-bold text-[#0070C0] mb-2">
                    Результаты калибровки
                  </div>

                  {/* Calibration Results 5-column Table */}
                  <table className="w-full border-collapse border-2 border-black text-center text-[10.5px] mb-4">
                    <thead>
                      <tr className="font-bold">
                        <th className="border border-black p-2 w-1/5">Калибруемая точка, °C</th>
                        <th className="border border-black p-2 w-1/5">Опорное значение, °C</th>
                        <th className="border border-black p-2 w-1/5">Показание объекта калибровки, °C</th>
                        <th className="border border-black p-2 w-1/5">Отклонение показаний, °C</th>
                        <th className="border border-black p-2 w-1/5">Расширенная неопределенность U, °C</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-mono font-bold text-xs">
                        <td className="border border-black p-2">30,0</td>
                        <td className="border border-black p-2">{liveStats.meanStd.slice(0, 5)}</td>
                        <td className="border-2 border-emerald-600 p-2 text-emerald-800 bg-emerald-50/50">
                          {liveStats.meanInd}
                        </td>
                        <td className="border border-black p-2">{liveStats.dev}</td>
                        <td className="border border-black p-2">{liveStats.URounded}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Measurement Uncertainty Note */}
                  <div className="border border-black p-3 mb-4 text-[10px] leading-snug">
                    <span className="font-bold">Неопределенность измерений:</span>{' '}
                    <span>
                      Расширенная неопределенность получена путем умножения стандартной неопределенности на коэффициент охвата k = 2, соответствующего уровню доверия приблизительно 95 % при допущении нормального распределения.
                    </span>
                  </div>

                  {/* Conclusions */}
                  <div className="border border-black p-2.5 mb-4 text-[10px]">
                    <div className="font-bold mb-1">Выводы:</div>
                    <div
                      onClick={() => handleCellClick('conclusions', metaData.conclusions)}
                      className="cursor-cell hover:bg-emerald-50 p-1 font-medium"
                    >
                      {metaData.conclusions}
                    </div>
                  </div>

                  {/* Performer and End of Report */}
                  <div className="flex justify-between items-center py-4 border-t border-black text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Лицо, выполнившее калибровку:</span>
                      <span className="italic text-[10px]">Person performing the calibration:</span>
                    </div>
                    <div className="font-bold text-[#0070C0] font-mono border-b border-black pb-0.5 px-4">
                      {metaData.performer}
                    </div>
                  </div>

                  <div className="text-center mt-6 pt-2">
                    <div className="font-extrabold text-[13px] text-black uppercase tracking-wider">
                      КОНЕЦ ПРОТОКОЛА КАЛИБРОВКИ
                    </div>
                    <div className="font-bold text-[11px] text-slate-700 uppercase tracking-widest mt-0.5">
                      END OF CALIBRATION REPORT
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* =========================================================
          5. MICROSOFT EXCEL BOTTOM SHEET TABS BAR
          ========================================================= */}
      <div className="bg-[#f3f4f6] dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 p-1.5 px-3 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
        {/* Left: Sheet Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {[
            { id: 'all' as const, label: 'Barcha varaqlar (1-5 bet)' },
            { id: 1 as const, label: 'Лист 1 (Titul & Sharoitlar)' },
            { id: 2 as const, label: 'Лист 2 (T1-T30 o‘lchashlar)' },
            { id: 3 as const, label: 'Лист 3 (Noaniqlik byudjeti)' },
            { id: 5 as const, label: 'Лист 4 (Natijalar & Xulosa)' },
          ].map((tab) => {
            const isActive = activeSheetTab === tab.id;
            return (
              <button
                key={String(tab.id)}
                type="button"
                onClick={() => setActiveSheetTab(tab.id)}
                className={`px-3 py-1.5 rounded-t-md font-medium text-xs transition cursor-pointer flex items-center gap-1.5 border-b-2 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-[#107c41] dark:text-emerald-400 border-[#107c41] font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border-transparent'
                }`}
              >
                <Table className="w-3.5 h-3.5 opacity-80" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            title="Yangi varaq qo‘shish"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Status Bar */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3 font-mono">
            <span>ГОТОВО</span>
            <span>•</span>
            <span>O‘lchashlar: 30 nuqta</span>
            <span>•</span>
            <span>Tcp: {liveStats.meanStd} °C</span>
            <span>•</span>
            <span>U: ±{liveStats.URounded} °C</span>
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

      {/* Hidden Sheet for PDF Export Canvas */}
      <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none print:hidden" aria-hidden="true">
        <PrimaryDataProtocolSheet
          id="editor-protocol"
          info={{
            ...info,
            certificateNumber: metaData.certNo,
            issueDate: metaData.calDate,
            orderNumber: metaData.orderNo,
            customerName: metaData.customer,
            objectName: metaData.objectName,
            objectType: metaData.model,
            serialNumber: metaData.serialNo,
            calibratedByUz: metaData.performer,
          }}
          pointsData={[
            {
              ...(pointsData[0] || {
                id: 'N1',
                nameUz: 'N1',
                nameRu: 'N1',
                positionDesc: '',
                coord: [0, 0, 0],
                isCenter: false,
                rows: [],
              }),
              rows: tRows.map((r) => ({ index: r.index, tStd: r.tStd, tInd: r.tInd })),
            },
          ]}
          calculation={calculation}
          currentPage="all"
        />
      </div>
    </div>
  );
};
