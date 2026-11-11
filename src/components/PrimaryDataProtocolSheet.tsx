import React from 'react';
import { CalibrationItemInfo, ChamberCalculation, ChamberPointData } from '../types';
import { formatMetrologyNumber, formatScientific } from '../utils/metrology';

interface PrimaryDataProtocolSheetProps {
  id?: string;
  info: CalibrationItemInfo;
  pointsData: ChamberPointData[];
  calculation: ChamberCalculation;
  currentPage?: number | 'all';
}

export const PrimaryDataProtocolSheet: React.FC<PrimaryDataProtocolSheetProps> = ({
  id = 'protocol',
  info,
  pointsData,
  calculation,
  currentPage = 'all',
}) => {
  const isPageVisible = (page: number) => currentPage === 'all' || currentPage === page;

  // Watermark component matching Excel sheet print watermark
  const renderWatermark = (pageNum: number) => (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <span className="text-[120px] font-sans font-bold text-slate-400/25 tracking-wider rotate-[-25deg]">
        Page {pageNum}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-8 print:gap-0">
      {/* ================================= PAGE 1 ================================= */}
      <div
        id={`${id}-page-1`}
        className={`w-[210mm] min-h-[297mm] h-[297mm] p-[14mm] bg-white text-black shadow-2xl relative font-sans text-[11px] leading-snug flex-col justify-between box-border shrink-0 print:shadow-none print:m-0 print:p-[12mm] ${
          isPageVisible(1) ? 'flex' : 'hidden print:flex'
        }`}
        style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
      >
        {renderWatermark(1)}

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
                <span className="font-bold font-mono underline ml-1 text-black">
                  {info.certificateNumber || 'Uz-112/1-2025'}
                </span>
              </div>
            </div>
          </div>

          {/* Date & Number of pages */}
          <div className="flex justify-between items-center py-2 text-xs border-b border-black mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold">Дата калибровки:</span>
              <span className="italic text-[10px]">Date of calibration:</span>
              <span className="font-bold text-[#0070C0] ml-1 font-mono">
                {info.issueDate || '2025-04-29'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold">Количество страниц:</span>
              <span className="italic text-[10px]">Number of pages:</span>
              <span className="font-bold text-red-600 font-mono text-[13px] ml-1">5</span>
            </div>
          </div>

          {/* Form details table with Excel gridlines */}
          <table className="w-full border-collapse border border-black text-[11px] mb-4">
            <tbody>
              {/* Customer */}
              <tr>
                <td className="border border-black p-2 font-bold w-[28%] bg-slate-50/60 align-top">
                  <div>Наименование и адрес заказчика</div>
                  <div className="italic text-[10px] font-normal text-slate-700">
                    Name and adress of customer
                  </div>
                </td>
                <td className="border border-black p-2 align-top" colSpan={3}>
                  <div className="font-medium text-black">
                    {info.customerName || '-'}
                  </div>
                  {info.customerAddress && (
                    <div className="text-[10px] text-slate-600 mt-0.5">{info.customerAddress}</div>
                  )}
                </td>
              </tr>

              {/* Order / Application */}
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50/60">
                  <div>Заявка:</div>
                  <div className="italic text-[10px] font-normal text-slate-700">Order:</div>
                </td>
                <td className="border border-black p-2 font-mono font-bold text-[#0070C0]" colSpan={3}>
                  {info.orderNumber || info.contractNumber || '№ 25-112-xxxxxx'}
                </td>
              </tr>

              {/* Calibration Object */}
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50/60 align-top">
                  <div>Объект калибровки</div>
                  <div className="italic text-[10px] font-normal text-slate-700">Calibration item</div>
                </td>
                <td className="border border-black p-2 align-top" colSpan={3}>
                  <div className="font-bold text-[#0070C0] text-[12px]">
                    {info.objectName || 'Сушильные шкаф (Quritish shkafi)'}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px]">
                    <span>
                      с диапазоном измерения от{' '}
                      <span className="font-bold font-mono text-[#0070C0]">
                        {formatMetrologyNumber(info.tempRangeMin, 1)}
                      </span>{' '}
                      до{' '}
                      <span className="font-bold font-mono text-[#0070C0]">
                        {formatMetrologyNumber(info.tempRangeMax, 1)}
                      </span>{' '}
                      °C
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px]">
                    <span>
                      типа{' '}
                      <span className="font-bold font-mono text-[#0070C0]">
                        {info.objectType || 'RTOP-500Y'}
                      </span>
                    </span>
                    <span>
                      заводским номером{' '}
                      <span className="font-bold font-mono text-[#0070C0]">
                        {info.serialNumber || '2333001557'}
                      </span>
                    </span>
                  </div>
                </td>
              </tr>

              {/* Method and procedure */}
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50/60 align-top">
                  <div>Методика и процедура калибровки</div>
                  <div className="italic text-[10px] font-normal text-slate-700">
                    Calibration method and procedure
                  </div>
                </td>
                <td className="border border-black p-2 align-top leading-snug space-y-1 text-[10.5px]" colSpan={3}>
                  <div>KU-10-2025. Камера температуры (термостаты и сушильные шкафы). Методика калибровки.</div>
                  <div>
                    EURAMET Calibration Guide No. 20 Версия 5.0 Calibration of Temperature and/or Humidity Enclosures.
                  </div>
                </td>
              </tr>

              {/* Calibration is performed by using */}
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50/60 align-top">
                  <div>Калибровка выполнена с помощью</div>
                  <div className="italic text-[10px] font-normal text-slate-700">
                    Calibration is performed by using
                  </div>
                </td>
                <td className="border border-black p-2 align-top text-[#0070C0] text-[10px] space-y-1.5 leading-tight" colSpan={3}>
                  <div>
                    <span className="font-bold">Термометр лабораторный электронный</span>
                    <br />
                    <span>типа: {info.standardType || 'LTA/Б-300МТ'}</span>
                    <br />
                    <span>заводской номер № {info.standardSerial || '871352'}</span>
                  </div>
                  <div>
                    <span className="font-bold">
                      Термометр сопротивления с цифровой индикацией (Калибратор температуры)
                    </span>
                    <br />
                    <span>типа: STS-200 A 915 (RTC-156B)</span>
                    <br />
                    <span>заводской номер № 613343-19 (617498-00393)</span>
                  </div>
                  <div>
                    <span className="font-bold">Регистратор-даталоггер</span>
                    <br />
                    <span>типа: "DL200D"</span>
                    <br />
                    <span>заводской номер № 068.1019.0802.034</span>
                  </div>
                </td>
              </tr>

              {/* Environmental conditions subtable */}
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50/60 align-top">
                  <div>Условия калибровки</div>
                  <div className="italic text-[10px] font-normal text-slate-700">Calibration conditions</div>
                </td>
                <td className="border border-black p-1.5 align-top" colSpan={3}>
                  <table className="w-full border-collapse border border-black text-center text-[10.5px]">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border border-black p-1 text-left font-normal italic w-1/2"></th>
                        <th className="border border-black p-1 font-bold w-1/4">в начале</th>
                        <th className="border border-black p-1 font-bold w-1/4">в конце</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-1 text-left font-medium">
                          Температура окружающей среды, °C
                        </td>
                        <td className="border border-black p-1 font-mono text-[#0070C0] font-bold">
                          {formatMetrologyNumber(info.ambientTempMin, 2)}
                        </td>
                        <td className="border border-black p-1 font-mono text-[#0070C0] font-bold">
                          {formatMetrologyNumber(info.ambientTempMax, 2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 text-left font-medium">
                          Относительная влажность, %
                        </td>
                        <td className="border border-black p-1 font-mono text-[#0070C0] font-bold">
                          {formatMetrologyNumber(info.relativeHumidityMin, 2)}
                        </td>
                        <td className="border border-black p-1 font-mono text-[#0070C0] font-bold">
                          {formatMetrologyNumber(info.relativeHumidityMax, 2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1 text-left font-medium">
                          Атмосферное давление, hPa
                        </td>
                        <td className="border border-black p-1 font-mono text-[#0070C0] font-bold">
                          {formatMetrologyNumber(info.atmosphericPressureMin || 1012.2, 2)}
                        </td>
                        <td className="border border-black p-1 font-mono text-[#0070C0] font-bold">
                          {formatMetrologyNumber(info.atmosphericPressureMax || 1013.0, 2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[9px] text-slate-500 pt-2 border-t border-slate-300 flex justify-between items-center">
          <div>Протокол калибровки № {info.certificateNumber || 'Uz-112/1-2025'}</div>
          <div>Страница 1 из 5</div>
        </div>
      </div>

      {/* ================================= PAGE 2 ================================= */}
      <div
        id={`${id}-page-2`}
        className={`w-[210mm] min-h-[297mm] h-[297mm] p-[14mm] bg-white text-black shadow-2xl relative font-sans text-[11px] leading-snug flex-col justify-between box-border shrink-0 print:shadow-none print:m-0 print:p-[12mm] ${
          isPageVisible(2) ? 'flex' : 'hidden print:flex'
        }`}
        style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
      >
        {renderWatermark(2)}

        <div className="relative z-10">
          {/* Green Title and Point Banner */}
          <div className="mb-2">
            <div className="font-extrabold text-[13px] text-black mb-1">Результаты калибровки:</div>
            <div className="bg-[#548235] text-white px-3 py-1 font-bold text-xs flex items-center justify-between">
              <span>Точка калибровки</span>
              <span className="font-mono text-sm">{calculation.pointTemp} °C</span>
            </div>
          </div>

          {/* Section 1 Badge */}
          <div className="flex items-center gap-2 my-1">
            <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <span className="font-bold text-xs">Первичные показания эталона и объекта</span>
          </div>

          {/* 30 Readings Two-Column Table matching Screenshot 2 */}
          <table className="w-full max-w-[420px] border-collapse border border-black text-center text-[10px] my-1">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-black p-1 w-10"></th>
                <th className="border border-black p-1 w-1/2 bg-[#FFF2CC]">
                  Показания эталона
                </th>
                <th className="border border-black p-1 w-1/2 bg-white">
                  Показания индикатора калибруемого термостата
                </th>
              </tr>
            </thead>
            <tbody>
              {calculation.readings30.slice(0, 30).map((r) => (
                <tr key={r.index} className="font-mono leading-none h-[18px]">
                  <td className="border border-black p-0.5 font-bold bg-slate-50 text-[9.5px]">
                    T_{r.index}
                  </td>
                  <td className="border border-black p-0.5 bg-[#FFF2CC] text-slate-900 font-semibold">
                    {formatMetrologyNumber(r.tStd, 2)}
                  </td>
                  <td className="border border-black p-0.5 bg-white text-slate-900">
                    {formatMetrologyNumber(r.tInd, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {/* Mean T_cp */}
              <tr className="font-mono font-bold text-[10px]">
                <td className="border border-black p-1 bg-slate-100 font-sans font-bold">T_ср</td>
                <td className="border border-black p-1 bg-[#FFF2CC] text-blue-900 font-bold">
                  {formatMetrologyNumber(calculation.tCpStd, 4)}
                </td>
                <td className="border border-black p-1 bg-white">
                  {formatMetrologyNumber(calculation.tCpInd, 3)}
                </td>
              </tr>
              {/* Type A Uncertainty u(T) */}
              <tr className="font-mono font-bold text-[9.5px]">
                <td className="border border-black p-1 bg-slate-100 font-sans font-bold">u(T)</td>
                <td className="border border-black p-1 bg-[#FFF2CC] text-indigo-900 font-bold">
                  {formatMetrologyNumber(calculation.uTStd, 9)}
                </td>
                <td className="border border-black p-1 bg-white">
                  {formatMetrologyNumber(calculation.uTInd, 9)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Section 2 Header */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-300">
            <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <span className="font-bold text-xs uppercase tracking-tight">
              Определение неопределенности результатов калибровки
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[9px] text-slate-500 pt-2 border-t border-slate-300 flex justify-between items-center">
          <div>Протокол калибровки № {info.certificateNumber || 'Uz-112/1-2025'}</div>
          <div>Страница 2 из 5</div>
        </div>
      </div>

      {/* ================================= PAGE 3 ================================= */}
      <div
        id={`${id}-page-3`}
        className={`w-[210mm] min-h-[297mm] h-[297mm] p-[14mm] bg-white text-black shadow-2xl relative font-sans text-[11px] leading-snug flex-col justify-between box-border shrink-0 print:shadow-none print:m-0 print:p-[12mm] ${
          isPageVisible(3) ? 'flex' : 'hidden print:flex'
        }`}
        style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
      >
        {renderWatermark(3)}

        <div className="relative z-10">
          {/* Section 2 Title */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <span className="font-bold text-xs uppercase tracking-tight">
              Определение неопределенности результатов калибровки
            </span>
          </div>

          {/* Uncertainty Budget Table matching Screenshot 3 */}
          <table className="w-full border-collapse border border-black text-center text-[10px] mb-3">
            <thead>
              <tr className="bg-slate-100 font-bold leading-tight">
                <th className="border border-black p-1 text-left w-[36%]">
                  Источники неопределенности
                </th>
                <th className="border border-black p-1 w-[5%]">Ед.</th>
                <th className="border border-black p-1 w-[18%]">
                  Стандартная неопределенност связанная, u(x_i)
                </th>
                <th className="border border-black p-1 w-[13%]">
                  Распределение вероятностей p(x_i)
                </th>
                <th className="border border-black p-1 w-[8%]">
                  Коэффициент чувствительности, c_i
                </th>
                <th className="border border-black p-1 w-[12%]">
                  Вклад в неопределенность u_i(y)
                </th>
                <th className="border border-black p-1 w-[8%] bg-[#00B0F0] text-black font-extrabold">
                  Анализ Pareto (%, из 100)
                </th>
              </tr>
            </thead>
            <tbody>
              {/* 1. u(T_std) */}
              <tr className="font-mono">
                <td className="border border-black p-1 text-left font-sans">
                  Стандартная неопределенности эталонного термометра по типу А u(T_std)
                </td>
                <td className="border border-black p-1">°C</td>
                <td className="border border-black p-1">{formatMetrologyNumber(calculation.uTStd, 9)}</td>
                <td className="border border-black p-1 font-sans">нормал</td>
                <td className="border border-black p-1">1</td>
                <td className="border border-black p-1">{formatScientific(calculation.uTStd, 2)}</td>
                <td className="border border-black p-1 bg-[#00B0F0] font-bold">5,2</td>
              </tr>

              {/* 2. u(T_therm) */}
              <tr className="font-mono">
                <td className="border border-black p-1 text-left font-sans">
                  Стандартная неопределенности калибруемого термостата по типу А u(T_therm)
                </td>
                <td className="border border-black p-1">°C</td>
                <td className="border border-black p-1">{formatMetrologyNumber(calculation.uTInd, 9)}</td>
                <td className="border border-black p-1 font-sans">нормал</td>
                <td className="border border-black p-1">-1</td>
                <td className="border border-black p-1">-{formatScientific(calculation.uTInd, 2)}</td>
                <td className="border border-black p-1 bg-[#00B0F0] font-bold">-4,4</td>
              </tr>

              {/* 3. u(T_in-sta) */}
              <tr className="font-mono">
                <td className="border border-black p-1 text-left font-sans">
                  СН от временной нестабильности калибруемого термостата, u(T_in-sta)
                </td>
                <td className="border border-black p-1">°C</td>
                <td className="border border-black p-1">{formatScientific(calculation.u_stab, 4)}</td>
                <td className="border border-black p-1 font-sans">прямоуголь</td>
                <td className="border border-black p-1">1</td>
                <td className="border border-black p-1">{formatScientific(calculation.u_stab, 2)}</td>
                <td className="border border-black p-1 bg-[#00B0F0] font-bold">27,3</td>
              </tr>

              {/* 4. u(T_inhom) */}
              <tr className="font-mono">
                <td className="border border-black p-1 text-left font-sans">
                  СН от пространственной неоднородности калибруемого термостата u(T_inhom)
                </td>
                <td className="border border-black p-1">°C</td>
                <td className="border border-black p-1">{formatScientific(calculation.u_grad, 5)}</td>
                <td className="border border-black p-1 font-sans">прямоуголь</td>
                <td className="border border-black p-1">1</td>
                <td className="border border-black p-1">{formatScientific(calculation.u_grad, 2)}</td>
                <td className="border border-black p-1 bg-[#00B0F0] font-bold">20,6</td>
              </tr>

              {/* 5. u(T_radiation) */}
              <tr className="font-mono">
                <td className="border border-black p-1 text-left font-sans">
                  СН от радиационной эффекти калибруемого термостата u(T_radiation)
                </td>
                <td className="border border-black p-1">°C</td>
                <td className="border border-black p-1">
                  {formatScientific(calculation.radiationDelta / Math.sqrt(3), 5)}
                </td>
                <td className="border border-black p-1 font-sans">прямоуголь</td>
                <td className="border border-black p-1">1</td>
                <td className="border border-black p-1">
                  {formatScientific(calculation.radiationDelta / Math.sqrt(3), 2)}
                </td>
                <td className="border border-black p-1 bg-[#00B0F0] font-bold">5,4</td>
              </tr>

              {/* 6. u(T_load) */}
              <tr className="font-mono">
                <td className="border border-black p-1 text-left font-sans">
                  СН от загруженного эффекта калибруемого термостата u(T_load)
                </td>
                <td className="border border-black p-1">°C</td>
                <td className="border border-black p-1">
                  {formatMetrologyNumber(calculation.loadDelta / Math.sqrt(3), 6)}
                </td>
                <td className="border border-black p-1 font-sans">прямоуголь</td>
                <td className="border border-black p-1">1</td>
                <td className="border border-black p-1">
                  {formatScientific(calculation.loadDelta / Math.sqrt(3), 2)}
                </td>
                <td className="border border-black p-1 bg-[#00B0F0] font-bold">5,9</td>
              </tr>

              {/* 7. u(deltaT_cal.std) */}
              <tr className="font-mono">
                <td className="border border-black p-1 text-left font-sans">
                  СН эталонного термометра u(δT_cal.std)
                </td>
                <td className="border border-black p-1">°C</td>
                <td className="border border-black p-1 text-red-600 font-bold">
                  {formatScientific(calculation.u_ther, 2)}
                </td>
                <td className="border border-black p-1 font-sans">нормал</td>
                <td className="border border-black p-1">1</td>
                <td className="border border-black p-1">{formatScientific(calculation.u_ther, 2)}</td>
                <td className="border border-black p-1 bg-[#00B0F0] font-bold">25,3</td>
              </tr>

              {/* 8. u(deltaT_rez.std) */}
              <tr className="font-mono">
                <td className="border border-black p-1 text-left font-sans">
                  СН от разрешающего способности эталонного термометра , u(δT_rez.std)
                </td>
                <td className="border border-black p-1">°C</td>
                <td className="border border-black p-1">{formatScientific(calculation.u_inst, 2)}</td>
                <td className="border border-black p-1 font-sans">прямоуголь</td>
                <td className="border border-black p-1">1</td>
                <td className="border border-black p-1">{formatScientific(calculation.u_inst, 2)}</td>
                <td className="border border-black p-1 bg-[#00B0F0] font-bold">0,1</td>
              </tr>

              {/* 9. u(deltaT_rez.therm) */}
              <tr className="font-mono">
                <td className="border border-black p-1 text-left font-sans">
                  СН от разрешающего способности калибруемого термостата , u(δT_rez.therm)
                </td>
                <td className="border border-black p-1">°C</td>
                <td className="border border-black p-1 text-red-600 font-bold">
                  {formatScientific(calculation.u_res, 5)}
                </td>
                <td className="border border-black p-1 font-sans">прямоуголь</td>
                <td className="border border-black p-1">1</td>
                <td className="border border-black p-1">{formatScientific(calculation.u_res, 2)}</td>
                <td className="border border-black p-1 bg-[#00B0F0] font-bold">14,6</td>
              </tr>

              {/* 10. u(delta_d) */}
              <tr className="font-mono">
                <td className="border border-black p-1 text-left font-sans">
                  СН от временного дрейфа эталона Δd
                </td>
                <td className="border border-black p-1">°C</td>
                <td className="border border-black p-1 bg-[#FFFF00] font-bold">
                  {formatScientific(calculation.u_drift, 2)}
                </td>
                <td className="border border-black p-1 font-sans">прямоуголь</td>
                <td className="border border-black p-1">1</td>
                <td className="border border-black p-1">{formatScientific(calculation.u_drift, 2)}</td>
                <td className="border border-black p-1 bg-[#00B0F0] font-bold">0,0</td>
              </tr>

              {/* Summary Rows matching Screenshot 3 */}
              <tr className="bg-[#D9E1F2] font-bold font-mono">
                <td className="border border-black p-1 text-left font-sans">
                  Суммарная станд неопределенност, u_c(V_20)
                </td>
                <td className="border border-black p-1 font-sans" colSpan={4}>
                  коэффициент охвата k = 2 (P = 95 %), mL
                </td>
                <td className="border border-black p-1 text-black font-extrabold">
                  {formatScientific(calculation.u_c, 3)}
                </td>
                <td className="border border-black p-1 bg-[#00B0F0] text-black font-extrabold">
                  100,00
                </td>
              </tr>

              <tr className="font-mono font-bold">
                <td className="border border-black p-1 text-left font-sans">
                  Расширенная неопредленность, U (V_20)
                </td>
                <td className="border border-black p-1 font-sans" colSpan={4}></td>
                <td className="border border-black p-1 text-black font-bold">
                  {formatMetrologyNumber(calculation.U, 7)}
                </td>
                <td className="border border-black p-1"></td>
              </tr>

              <tr className="font-mono font-bold">
                <td className="border border-black p-1 text-left font-sans">
                  Коэффициент покрытия V_eff(V_20)
                </td>
                <td className="border border-black p-1 font-sans" colSpan={4}></td>
                <td className="border border-black p-1 bg-[#FFFF00] text-black font-extrabold">
                  {calculation.v_eff || '8374,8'}
                </td>
                <td className="border border-black p-1"></td>
              </tr>

              <tr className="font-mono font-bold">
                <td className="border border-black p-1 text-left font-sans">
                  Поправка показания калибруемого термостата ΔT_thermostat
                </td>
                <td className="border border-black p-1 font-sans" colSpan={4}></td>
                <td className="border border-black p-1 bg-[#FFFF00] text-black font-extrabold">
                  {formatMetrologyNumber(calculation.deviation, 4)}
                </td>
                <td className="border border-black p-1"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[9px] text-slate-500 pt-2 border-t border-slate-300 flex justify-between items-center">
          <div>Протокол калибровки № {info.certificateNumber || 'Uz-112/1-2025'}</div>
          <div>Страница 3 из 5</div>
        </div>
      </div>

      {/* ================================= PAGE 4 ================================= */}
      <div
        id={`${id}-page-4`}
        className={`w-[210mm] min-h-[297mm] h-[297mm] p-[14mm] bg-white text-black shadow-2xl relative font-sans text-[11px] leading-snug flex-col justify-between box-border shrink-0 print:shadow-none print:m-0 print:p-[12mm] ${
          isPageVisible(4) ? 'flex' : 'hidden print:flex'
        }`}
        style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
      >
        {renderWatermark(4)}

        <div className="relative z-10">
          <div className="font-extrabold text-[13px] text-black mb-1 border-b pb-1">
            Пространственное распределение температуры рабочей камеры (9 точек)
          </div>
          <div className="text-[10px] text-slate-600 italic mb-3">
            DIN EN 60068-3-5 / EURAMET Calibration Guide No. 20 (9 Nuqta 3D konfiguratsiyasi)
          </div>

          {/* 9 Points Statistical Table */}
          <table className="w-full border-collapse border border-black text-center text-[10px] mb-4">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-black p-1.5 w-12">Nuqta</th>
                <th className="border border-black p-1.5 text-left">Joylashuvi va Turi</th>
                <th className="border border-black p-1.5 w-20">T̄_std (°C)</th>
                <th className="border border-black p-1.5 w-20">T̄_ind (°C)</th>
                <th className="border border-black p-1.5 w-20">Og‘ish (Δ)</th>
                <th className="border border-black p-1.5 w-24">Standart og‘ish s(T)</th>
                <th className="border border-black p-1.5 w-28">Min ... Max (°C)</th>
              </tr>
            </thead>
            <tbody>
              {pointsData.map((pt) => {
                const stat = calculation.pointStats[pt.id];
                const isCenter = pt.isCenter;
                return (
                  <tr key={pt.id} className={`font-mono ${isCenter ? 'bg-amber-50 font-bold' : ''}`}>
                    <td className="border border-black p-1 font-bold">{pt.id}</td>
                    <td className="border border-black p-1 text-left font-sans text-[10px]">
                      {pt.nameRu} {isCenter ? '(Центр камеры)' : ''}
                    </td>
                    <td className="border border-black p-1 text-blue-900 font-bold">
                      {stat && stat.isEntered ? formatMetrologyNumber(stat.meanStd, 3) : '—'}
                    </td>
                    <td className="border border-black p-1">
                      {stat && stat.isEntered ? formatMetrologyNumber(stat.meanInd, 2) : '—'}
                    </td>
                    <td className="border border-black p-1 text-slate-800">
                      {stat && stat.isEntered ? formatMetrologyNumber(stat.diffFromCenter, 3) : '—'}
                    </td>
                    <td className="border border-black p-1 text-indigo-900 font-semibold">
                      {stat && stat.isEntered ? formatMetrologyNumber(stat.stdDevStd, 4) : '—'}
                    </td>
                    <td className="border border-black p-1 text-[9px] text-slate-700">
                      {stat && stat.isEntered
                        ? `${formatMetrologyNumber(stat.minStd, 2)} ... ${formatMetrologyNumber(stat.maxStd, 2)}`
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold font-mono text-[10.5px]">
                <td className="border border-black p-1.5 text-left font-sans" colSpan={2}>
                  Kamera umumiy o‘rtachasi:
                </td>
                <td className="border border-black p-1.5 text-blue-900 font-bold">
                  {formatMetrologyNumber(calculation.overallStdMean, 3)}
                </td>
                <td className="border border-black p-1.5">
                  {formatMetrologyNumber(calculation.overallIndMean, 2)}
                </td>
                <td className="border border-black p-1.5">
                  {formatMetrologyNumber(calculation.deviation, 2)}
                </td>
                <td className="border border-black p-1.5 text-indigo-900 font-bold">
                  {formatMetrologyNumber(calculation.overallStdDev, 4)}
                </td>
                <td className="border border-black p-1.5"></td>
              </tr>
            </tfoot>
          </table>

          {/* Spatial Profile Metrics */}
          <div className="border border-black p-3 bg-slate-50/70 text-xs space-y-2">
            <div className="font-bold uppercase tracking-tight border-b border-black/30 pb-1">
              Kameraning geometrik va barqarorlik ko‘rsatkichlari:
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="font-bold">Harorat gradienti / Neodnorodnost (ΔT): </span>
                <span className="font-mono font-bold text-indigo-900">
                  {formatMetrologyNumber(calculation.gradientDelta, 3)} °C
                </span>
              </div>
              <div>
                <span className="font-bold">Fazoviy bir jinsli emaslik (δT_inhom): </span>
                <span className="font-mono font-bold text-indigo-900">
                  {formatMetrologyNumber(calculation.inhomogeneityDelta, 4)} °C
                </span>
              </div>
              <div>
                <span className="font-bold">Vaqt bo‘yicha beqarorlik (δT_instab): </span>
                <span className="font-mono font-bold">
                  {formatMetrologyNumber(calculation.instabilityDelta, 4)} °C
                </span>
              </div>
              <div>
                <span className="font-bold">Barcha o‘lchovlar soni (n): </span>
                <span className="font-mono font-bold">{calculation.totalMeasurements} ta</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[9px] text-slate-500 pt-2 border-t border-slate-300 flex justify-between items-center">
          <div>Протокол калибровки № {info.certificateNumber || 'Uz-112/1-2025'}</div>
          <div>Страница 4 из 5</div>
        </div>
      </div>

      {/* ================================= PAGE 5 ================================= */}
      <div
        id={`${id}-page-5`}
        className={`w-[210mm] min-h-[297mm] h-[297mm] p-[14mm] bg-white text-black shadow-2xl relative font-sans text-[11px] leading-snug flex-col justify-between box-border shrink-0 print:shadow-none print:m-0 print:p-[12mm] ${
          isPageVisible(5) ? 'flex' : 'hidden print:flex'
        }`}
        style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
      >
        {renderWatermark(5)}

        <div className="relative z-10">
          {/* Top Blue Header Line matching Screenshot 4 */}
          <div className="border-t-2 border-b border-[#0070C0] py-1 mb-4">
            <span className="font-extrabold text-[12px] text-[#0070C0]">
              Результаты калибровки
            </span>
          </div>

          {/* Final Results Table with Excel gridlines matching Screenshot 4 */}
          <table className="w-full border-collapse border border-black text-center text-[10.5px] mb-4">
            <thead>
              <tr className="bg-slate-50 font-bold">
                <th className="border border-black p-1.5 w-[20%]">
                  Калибруемая точка, °C
                </th>
                <th className="border border-black p-1.5 w-[20%]">
                  Опорное значение, °C
                </th>
                <th className="border border-black p-1.5 w-[20%]">
                  Показание объекта калибровки, °C
                </th>
                <th className="border border-black p-1.5 w-[20%]">
                  Отклонение показаний, °C
                </th>
                <th className="border border-black p-1.5 w-[20%]">
                  Расширенная неопределенность U, °C
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-mono text-[11px]">
                <td className="border border-black p-2 font-bold">
                  {formatMetrologyNumber(calculation.pointTemp, 1)}
                </td>
                <td className="border border-black p-2">
                  {formatMetrologyNumber(calculation.centerStdMean, 2)}
                </td>
                <td className="border border-black p-2">
                  <span className="border-2 border-emerald-600 px-2 py-0.5 inline-block font-bold">
                    {formatMetrologyNumber(
                      calculation.overallIndMean > 0 ? calculation.overallIndMean : calculation.centerIndMean,
                      2
                    )}
                  </span>
                </td>
                <td className="border border-black p-2">
                  {formatMetrologyNumber(calculation.deviation, 2)}
                </td>
                <td className="border border-black p-2 font-bold text-black">
                  {formatMetrologyNumber(calculation.U, 2)}
                </td>
              </tr>
              {/* 2 Empty Gridlines Rows matching Screenshot 4 */}
              <tr className="h-6">
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
              </tr>
              <tr className="h-6">
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
              </tr>
            </tbody>
          </table>

          {/* Measurement Uncertainty Note matching Screenshot 4 */}
          <div className="border border-black p-2.5 mb-4 text-[10.5px] leading-snug flex items-start gap-3">
            <div className="font-bold w-[25%] shrink-0">
              <div>Неопределенность измерений</div>
              <div className="italic text-[9.5px] font-normal text-slate-600">
                Measurement uncertainty
              </div>
            </div>
            <div className="flex-1 text-slate-900">
              Расширенная неопределенность получена путем умножения стандартной неопределенности на коэффициент охвата k = 2, соответствующего уровню доверия приблизительно 95 % при допущении нормального распределения
            </div>
          </div>

          {/* Conclusions section */}
          <div className="border border-black p-2 mb-4 text-[11px]">
            <div className="font-bold mb-1">Выводы :</div>
            <div className="text-[10px] text-slate-700 italic">
              Quritish shkafi belgilangan harorat nuqtasida kalibrlandi va o‘lchash noaniqligi aniqlandi.
            </div>
          </div>

          {/* Person performing the calibration matching Screenshot 4 */}
          <div className="border border-black p-3 my-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="w-1/3">
                <div className="font-bold">Лицо, выполнившее калибровку:</div>
                <div className="italic text-[10px] text-slate-600">
                  Person performing the calibration:
                </div>
              </div>
              <div className="border-b border-black w-1/4 h-5"></div>
              <div className="w-1/3 text-right font-bold font-sans text-blue-900 text-sm">
                {info.calibratedByUz || "G'aibnazarov Boburjon"}
              </div>
            </div>
          </div>

          {/* End of report text matching Screenshot 4 */}
          <div className="text-center mt-6 pt-3 border-t border-black">
            <div className="font-extrabold text-[12.5px] text-black uppercase tracking-wider">
              КОНЕЦ ПРОТОКОЛА КАЛИБРОВКИ
            </div>
            <div className="italic font-bold text-[11px] text-black tracking-wide mt-0.5">
              END OF CALIBRATION REPORT
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[9px] text-slate-500 pt-2 border-t border-slate-300 flex justify-between items-center">
          <div>Протокол калибровки № {info.certificateNumber || 'Uz-112/1-2025'}</div>
          <div>Страница 5 из 5</div>
        </div>
      </div>
    </div>
  );
};
