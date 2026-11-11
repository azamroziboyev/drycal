import React, { useState } from 'react';
import {
  CalibrationItemInfo,
  ChamberPointData,
  ChamberCalculation,
  ChamberPointId,
  ChamberMeasurementRow,
} from '../types';
import {
  SAMPLE_CHAMBER_POINTS,
  SAMPLE_CALIBRATION_INFO,
  createEmptyChamberPoints,
  formatMetrologyNumber,
  CHAMBER_POINTS_CONFIG,
} from '../utils/metrology';
import { ChamberCube3D } from './ChamberCube3D';
import { PointDataModal } from './PointDataModal';
import { UncertaintyBudgetTable } from './UncertaintyBudgetTable';
import {
  Sparkles,
  ArrowRight,
  Thermometer,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Box,
  Building2,
  Tag,
  CircleDot,
  FileCheck,
  FileBadge,
} from 'lucide-react';

interface CalibrationFormProps {
  info: CalibrationItemInfo;
  setInfo: React.Dispatch<React.SetStateAction<CalibrationItemInfo>>;
  pointsData: ChamberPointData[];
  setPointsData: React.Dispatch<React.SetStateAction<ChamberPointData[]>>;
  calculation: ChamberCalculation;
  onGenerateCertificate: () => void;
}

export const CalibrationForm: React.FC<CalibrationFormProps> = ({
  info,
  setInfo,
  pointsData,
  setPointsData,
  calculation,
  onGenerateCertificate,
}) => {
  const [activeTab, setActiveTab] = useState<'points' | 'budget' | 'metadata' | 'standards'>('points');
  const [selectedPointId, setSelectedPointId] = useState<ChamberPointId | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open modal for a specific point
  const handleOpenPointModal = (id: ChamberPointId) => {
    setSelectedPointId(id);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Update rows for a specific point
  const handleUpdatePointRows = (pointId: ChamberPointId, newRows: ChamberMeasurementRow[]) => {
    setPointsData((prev) =>
      prev.map((p) => {
        if (p.id === pointId) {
          return { ...p, rows: newRows };
        }
        return p;
      })
    );
  };

  // Navigate between points in modal
  const handleNavigatePoint = (direction: 'prev' | 'next') => {
    if (!selectedPointId) return;
    const currentIdx = CHAMBER_POINTS_CONFIG.findIndex((p) => p.id === selectedPointId);
    if (direction === 'prev' && currentIdx > 0) {
      setSelectedPointId(CHAMBER_POINTS_CONFIG[currentIdx - 1].id);
    } else if (direction === 'next' && currentIdx < CHAMBER_POINTS_CONFIG.length - 1) {
      setSelectedPointId(CHAMBER_POINTS_CONFIG[currentIdx + 1].id);
    }
  };

  // Clear all points data
  const handleClearAll = () => {
    setPointsData(createEmptyChamberPoints());
  };

  // Load sample test data from bayonnoma
  const handleLoadSample = () => {
    setPointsData(SAMPLE_CHAMBER_POINTS);
    setInfo(SAMPLE_CALIBRATION_INFO);
  };

  const selectedPoint = pointsData.find((p) => p.id === selectedPointId) || null;

  const enteredCount = pointsData.filter((p) =>
    p.rows.some((r) => r.tStd !== '' && !isNaN(Number(r.tStd)))
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Object Inputs & Single Top Action Button */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Quritish shkaflari kalibrlash tizimi
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadSample}
              title="Namuna protokol qiymatlarini yuklash"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Namuna yuklash</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              title="Barcha nuqtalarni tozalash"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* User requirement: "faqat yuqorida bo'lsin va shu tugmani bosganda berilgan qiymatlar bilan fo'rmulalar bo'yicha hisoblab sertifikatni shakllantirsin" */}
            <button
              type="button"
              onClick={onGenerateCertificate}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              <FileBadge className="w-4 h-4 text-blue-200" />
              <span>Sertifikatni yaratish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Object details inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              <span>Kalibrlash obyekti:</span>
            </label>
            <input
              type="text"
              value={info.objectName}
              onChange={(e) => setInfo((prev) => ({ ...prev, objectName: e.target.value }))}
              placeholder="Masalan: Quritish shkafi / Камера температуры"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span>Turi / Rusumi (Model):</span>
            </label>
            <input
              type="text"
              value={info.objectType}
              onChange={(e) => setInfo((prev) => ({ ...prev, objectType: e.target.value }))}
              placeholder="Masalan: RTOP-500Y"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <span className="font-mono text-blue-500 font-bold">№</span>
              <span>Zavod raqami:</span>
            </label>
            <input
              type="text"
              value={info.serialNumber}
              onChange={(e) => setInfo((prev) => ({ ...prev, serialNumber: e.target.value }))}
              placeholder="Masalan: 20241014"
              className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-blue-500" />
              <span>Kalibrlash nuqtasi (°C):</span>
            </label>
            <input
              type="text"
              value={info.calibrationPoints.length > 0 ? info.calibrationPoints[0] : ''}
              onChange={(e) => {
                const val = e.target.value.trim();
                const num = parseFloat(val);
                setInfo((prev) => ({
                  ...prev,
                  calibrationPoints: isNaN(num) ? [] : [num],
                }));
              }}
              placeholder="Masalan: 30"
              className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('points')}
          className={`px-4 py-2 rounded-t-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'points'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>1. 3D Kub va 9 O‘lchash Nuqtalari ({enteredCount}/9)</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`px-4 py-2 rounded-t-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'budget'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CircleDot className="w-3.5 h-3.5" />
          <span>2. Noaniqlik byudjeti (10 ta komponent)</span>
        </button>

        <button
          onClick={() => setActiveTab('metadata')}
          className={`px-4 py-2 rounded-t-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'metadata'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>3. Buyurtmachi va Obyekt rekvizitlari</span>
        </button>

        <button
          onClick={() => setActiveTab('standards')}
          className={`px-4 py-2 rounded-t-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'standards'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>4. Etalon va Muhit sharoitlari</span>
        </button>
      </div>

      {/* Tab 1: 3D Cube & 9 Points Grid */}
      {activeTab === 'points' && (
        <div className="space-y-6">
          {/* Quick KPI summary bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Markaz etaloni (T_ref / N5)
              </span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {calculation.centerStdMean > 0
                  ? `${formatMetrologyNumber(calculation.centerStdMean, 3)} °C`
                  : '—'}
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Quritish shkafi (T_ind)
              </span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {calculation.centerIndMean > 0
                  ? `${formatMetrologyNumber(calculation.centerIndMean, 2)} °C`
                  : '—'}
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Harorat gradienti (ΔT)
              </span>
              <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {calculation.gradientDelta > 0
                  ? `${formatMetrologyNumber(calculation.gradientDelta, 3)} °C`
                  : '—'}
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Kengaytirilgan noaniqlik (U)
              </span>
              <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {calculation.U > 0 ? `± ${formatMetrologyNumber(calculation.U, 2)} °C` : '—'}
              </span>
            </div>
          </div>

          {/* Interactive Layout: 3D Cube (Left) + 9 Point Cards (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 3D Cube Canvas */}
            <div className="lg:col-span-7">
              <ChamberCube3D
                pointsData={pointsData}
                selectedPointId={selectedPointId}
                onSelectPoint={handleOpenPointModal}
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center">
                Shkafni sichqoncha yoki barmoq bilan (telefonda) o‘ng va chapga aylantirishingiz hamda nuqtalar ustiga bosishingiz mumkin
              </p>
            </div>

            {/* 9 Points Status Cards List */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Kamera Nuqtalari (N1 — N9)
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {enteredCount}/9 to'ldirilgan
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[460px] overflow-y-auto pr-1">
                {CHAMBER_POINTS_CONFIG.map((pt) => {
                  const data = pointsData.find((p) => p.id === pt.id);
                  const stat = calculation.pointStats[pt.id];
                  const entered =
                    data && data.rows.some((r) => r.tStd !== '' && !isNaN(Number(r.tStd)));
                  const isCenter = pt.isCenter;

                  return (
                    <div
                      key={pt.id}
                      onClick={() => handleOpenPointModal(pt.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedPointId === pt.id
                          ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500'
                          : entered
                          ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/80'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            isCenter
                              ? 'bg-amber-500 text-white'
                              : entered
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {pt.id}
                        </span>

                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {pt.nameUz}
                            </span>
                            {isCenter && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium">
                                Reference
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            {pt.positionDesc}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {entered && stat ? (
                          <>
                            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 block">
                              {formatMetrologyNumber(stat.meanStd, 2)} °C
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Δ = {stat.diffFromCenter.toFixed(2)} °C
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Kiritilmagan
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Uncertainty Budget */}
      {activeTab === 'budget' && (
        <UncertaintyBudgetTable calculation={calculation} info={info} />
      )}

      {/* Tab 3: Metadata & Customer */}
      {activeTab === 'metadata' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Sertifikat va Buyurtmachi ma‘lumotlari</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Sertifikat raqami:
              </label>
              <input
                type="text"
                value={info.certificateNumber}
                onChange={(e) => setInfo({ ...info, certificateNumber: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Berilgan sana (Date of issue):
              </label>
              <input
                type="text"
                value={info.issueDate}
                onChange={(e) => setInfo({ ...info, issueDate: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Buyurtmachi (Customer):
              </label>
              <input
                type="text"
                value={info.customerName}
                onChange={(e) => setInfo({ ...info, customerName: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Kalibrlash obyekti (Calibration item):
              </label>
              <input
                type="text"
                value={info.objectName}
                onChange={(e) => setInfo({ ...info, objectName: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Turi / rusumi (Type, model):
              </label>
              <input
                type="text"
                value={info.objectType}
                onChange={(e) => setInfo({ ...info, objectType: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Zavod raqami (Serial number):
              </label>
              <input
                type="text"
                value={info.serialNumber}
                onChange={(e) => setInfo({ ...info, serialNumber: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Ishlab chiqaruvchi (Manufacturer):
              </label>
              <input
                type="text"
                value={info.manufacturer}
                onChange={(e) => setInfo({ ...info, manufacturer: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Harorat diapazoni (°C):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={info.tempRangeMin !== 0 ? info.tempRangeMin : ''}
                  onChange={(e) => setInfo({ ...info, tempRangeMin: parseFloat(e.target.value) || 0 })}
                  className="w-1/2 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Min (0)"
                />
                <span className="text-slate-400">...</span>
                <input
                  type="text"
                  value={info.tempRangeMax !== 0 ? info.tempRangeMax : ''}
                  onChange={(e) => setInfo({ ...info, tempRangeMax: parseFloat(e.target.value) || 0 })}
                  className="w-1/2 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Max (300)"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Ajratish qobiliyati / Diskretligi (°C):
              </label>
              <input
                type="text"
                value={info.resolution ? info.resolution : ''}
                onChange={(e) => setInfo({ ...info, resolution: parseFloat(e.target.value) || 0 })}
                placeholder="0.1"
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Kalibrlovchi mutaxassis (F.I.O):
              </label>
              <input
                type="text"
                value={info.calibratedByUz}
                onChange={(e) => setInfo({ ...info, calibratedByUz: e.target.value, calibratedByRu: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Tekshirdi (F.I.O):
              </label>
              <input
                type="text"
                value={info.checkedByUz}
                onChange={(e) => setInfo({ ...info, checkedByUz: e.target.value, checkedByRu: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Kalibrlash davri (Period):
              </label>
              <input
                type="text"
                value={info.calibrationPeriod}
                onChange={(e) => setInfo({ ...info, calibrationPeriod: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Standards and Laboratory Conditions */}
      {activeTab === 'standards' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Etalonlar va Laboratoriya sharoitlari</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Etalon nomi:
              </label>
              <input
                type="text"
                value={info.standardName}
                onChange={(e) => setInfo({ ...info, standardName: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Etalon turi/rusumi:
              </label>
              <input
                type="text"
                value={info.standardType}
                onChange={(e) => setInfo({ ...info, standardType: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Etalon zavod raqamlari:
              </label>
              <input
                type="text"
                value={info.standardSerial}
                onChange={(e) => setInfo({ ...info, standardSerial: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Metrologik prosljejivost:
              </label>
              <input
                type="text"
                value={info.standardTraceability}
                onChange={(e) => setInfo({ ...info, standardTraceability: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Etalon noaniqligi U_cal.std (°C):
              </label>
              <input
                type="text"
                value={info.standardCertUncertainty ? info.standardCertUncertainty : ''}
                onChange={(e) =>
                  setInfo({ ...info, standardCertUncertainty: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.1"
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Etalon diskretligi rez_std (°C):
              </label>
              <input
                type="text"
                value={info.standardResolution ? info.standardResolution : ''}
                onChange={(e) =>
                  setInfo({ ...info, standardResolution: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.001"
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Devorlar nurlanishi farqi Δ_rad (°C):
              </label>
              <input
                type="text"
                value={info.deltaRadiation ? info.deltaRadiation : ''}
                onChange={(e) =>
                  setInfo({ ...info, deltaRadiation: parseFloat(e.target.value) || 0.075 })
                }
                placeholder="0.075"
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Kamera yuklanishi farqi Δ_load (°C):
              </label>
              <input
                type="text"
                value={info.deltaLoad ? info.deltaLoad : ''}
                onChange={(e) =>
                  setInfo({ ...info, deltaLoad: parseFloat(e.target.value) || 0.092 })
                }
                placeholder="0.092"
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Atrof-muhit harorati (°C):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={info.ambientTempMin !== 0 ? info.ambientTempMin : ''}
                  onChange={(e) =>
                    setInfo({ ...info, ambientTempMin: parseFloat(e.target.value) || 0 })
                  }
                  className="w-1/2 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Min (22.2)"
                />
                <span className="text-slate-400">...</span>
                <input
                  type="text"
                  value={info.ambientTempMax !== 0 ? info.ambientTempMax : ''}
                  onChange={(e) =>
                    setInfo({ ...info, ambientTempMax: parseFloat(e.target.value) || 0 })
                  }
                  className="w-1/2 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Max (24.4)"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Nisbiy namlik (%):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={info.relativeHumidityMin !== 0 ? info.relativeHumidityMin : ''}
                  onChange={(e) =>
                    setInfo({ ...info, relativeHumidityMin: parseFloat(e.target.value) || 0 })
                  }
                  className="w-1/2 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Min (37.7)"
                />
                <span className="text-slate-400">...</span>
                <input
                  type="text"
                  value={info.relativeHumidityMax !== 0 ? info.relativeHumidityMax : ''}
                  onChange={(e) =>
                    setInfo({ ...info, relativeHumidityMax: parseFloat(e.target.value) || 0 })
                  }
                  className="w-1/2 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Max (38.5)"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Atmosfera bosimi (hPa):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={info.atmosphericPressureMin !== 0 ? info.atmosphericPressureMin : ''}
                  onChange={(e) =>
                    setInfo({ ...info, atmosphericPressureMin: parseFloat(e.target.value) || 0 })
                  }
                  className="w-1/2 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Min (1012.2)"
                />
                <span className="text-slate-400">...</span>
                <input
                  type="text"
                  value={info.atmosphericPressureMax !== 0 ? info.atmosphericPressureMax : ''}
                  onChange={(e) =>
                    setInfo({ ...info, atmosphericPressureMax: parseFloat(e.target.value) || 0 })
                  }
                  className="w-1/2 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Max (1013.0)"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Point Data Input Modal */}
      <PointDataModal
        pointData={selectedPoint}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdatePointRows={handleUpdatePointRows}
        onNavigatePoint={handleNavigatePoint}
      />
    </div>
  );
};
