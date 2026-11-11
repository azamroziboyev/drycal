import React from 'react';
import { ChamberCalculation, CalibrationItemInfo } from '../types';
import { formatMetrologyNumber } from '../utils/metrology';
import { Info, CheckCircle2 } from 'lucide-react';

interface UncertaintyBudgetTableProps {
  calculation: ChamberCalculation;
  info: CalibrationItemInfo;
}

export const UncertaintyBudgetTable: React.FC<UncertaintyBudgetTableProps> = ({
  calculation,
}) => {
  const c = calculation;
  const items = c.budgetComponents && c.budgetComponents.length > 0 ? c.budgetComponents : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Noaniqlik byudjeti (10 komponent)
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium">
              Nuqta: {c.pointTemp} °C • {c.totalFilledPoints}/9 nuqta ({c.totalMeasurements} ta o‘lchov)
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
            Quritish Shkafi Noaniqlik Byudjeti (Бюджет неопределенности)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            KALIBRATSIYA METODIKASI (EURAMET cg-20, DIN EN 60068-3-5, KU-10-2025)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4 text-emerald-500" />
          <span>k = 2 (95% ishonch darajasi)</span>
        </div>
      </div>

      {/* Budget Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <th className="py-2.5 px-3 font-semibold w-8">№</th>
              <th className="py-2.5 px-3 font-semibold">Noaniqlik manbai / Komponent</th>
              <th className="py-2.5 px-3 font-semibold">Belgisi</th>
              <th className="py-2.5 px-3 font-semibold text-right">Kirish qiymati</th>
              <th className="py-2.5 px-3 font-semibold text-center">Taqsimot</th>
              <th className="py-2.5 px-3 font-semibold text-center">Divisor (k)</th>
              <th className="py-2.5 px-3 font-semibold text-right">Standart noaniqlik, u(xᵢ)</th>
              <th className="py-2.5 px-3 font-semibold text-center">cᵢ</th>
              <th className="py-2.5 px-3 font-semibold text-right">uᵢ(y), °C</th>
              <th className="py-2.5 px-3 font-semibold text-right">[uᵢ(y)]², °C²</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <tr key={item.index} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors font-mono">
                <td className="py-2.5 px-3 text-slate-400">{item.index}</td>
                <td className="py-2.5 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                  <div className="font-semibold">{item.nameUz}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {item.nameRu} • {item.formula}
                  </div>
                </td>
                <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                  {item.symbol}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                  {item.valueFormatted}
                </td>
                <td className="py-2.5 px-3 text-center font-sans">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.evaluationType === 'Тип А'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    {item.distribution}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-bold">
                  {item.divisorName}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                  {formatMetrologyNumber(item.standardUncertainty, 4)}
                </td>
                <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400">
                  {item.sensitivity}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                  {formatMetrologyNumber(item.contribution, 4)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                  {item.varianceContribution.toFixed(6)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 dark:bg-slate-800/90 font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
              <td className="py-3 px-3 text-center" colSpan={9}>
                Yig‘indi dispersiya (Сумма квадратов, Σ [uᵢ(y)]²):
              </td>
              <td className="py-3 px-3 text-right font-mono text-emerald-700 dark:text-emerald-300 text-sm">
                {c.sumVariances.toFixed(6)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary KPI cards matching Methodology Section 6 & 7 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
        {/* Combined uncertainty u_c */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Birlashtirilgan standart noaniqlik</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">u_c(y)</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatMetrologyNumber(c.u_c, 4)} <span className="text-xs font-normal text-slate-500">°C</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            u_c = √Σ uᵢ(y)² = √{c.sumVariances.toFixed(6)}
          </div>
        </div>

        {/* Temperature Gradient / Inhomogeneity */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Harorat gradienti (Neodnorodnost)</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">ΔT</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatMetrologyNumber(c.gradientDelta, 3)} <span className="text-xs font-normal text-slate-500">°C</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            ΔT = (T_max - T_min) / 2
          </div>
        </div>

        {/* Repeatability s(T) */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Takrorlanuvchanlik standart og‘ishi</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">s(T)</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatMetrologyNumber(c.overallStdDev, 4)} <span className="text-xs font-normal text-slate-500">°C</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            u(x₃) = s(T) / √{c.totalMeasurements || 90}
          </div>
        </div>

        {/* Expanded uncertainty U */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-300 dark:border-emerald-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
            <span className="font-semibold uppercase tracking-wide">Kengaytirilgan noaniqlik (U)</span>
            <span className="font-mono font-bold bg-emerald-200/60 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded text-[10px]">
              k = {c.k}
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-950 dark:text-emerald-200 mt-1">
            ±{formatMetrologyNumber(c.U, 2)} <span className="text-xs font-normal text-emerald-700 dark:text-emerald-400">°C</span>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span>U = k × u_c (P ≈ 95%, k = 2)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
