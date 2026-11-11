import React from 'react';
import { CalibrationItemInfo, ChamberCalculation } from '../types';
import { UzNimLogo, QrCodeSvg } from './UzNimLogo';

interface OfficialCertificateExcelGridProps {
  info: CalibrationItemInfo;
  calculation: ChamberCalculation;
}

export const OfficialCertificateExcelGrid: React.FC<OfficialCertificateExcelGridProps> = ({
  info,
  calculation,
}) => {
  const certNo = info.certificateNumber || 'Uz-112/1-2025';
  const issueDate = info.issueDate || '2025-04-29';
  const serialNo = info.serialNumber || '2333001557';
  const model = info.objectType || 'RTOP-500Y';
  const itemNameRu = info.objectName || 'Сушильные шкаф (Quritish shkafi)';
  const customer = info.customerName || '-';
  const performer = info.calibratedByUz || "G'aibnazarov Boburjon";

  const pointTempStr = calculation.pointTemp.toFixed(1).replace('.', ',');
  const refValueStr = calculation.centerStdMean.toFixed(2).replace('.', ',');
  const indValue = calculation.overallIndMean > 0 ? calculation.overallIndMean : calculation.centerIndMean;
  const indValueStr = indValue.toFixed(2).replace('.', ',');
  const devValueStr = calculation.deviation.toFixed(2).replace('.', ',');
  const uValueStr = calculation.U.toFixed(2).replace('.', ',');

  // Excel column letters A to V
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];

  return (
    <div className="bg-white text-black font-sans shadow-2xl rounded-sm border border-slate-300 overflow-x-auto select-text w-full max-w-[960px] mx-auto print:shadow-none print:border-none print:w-full">
      {/* Excel Sheet Column Headers (A-V) */}
      <div className="flex bg-[#f3f3f3] border-b border-[#d4d4d4] text-[11px] font-semibold text-[#555] sticky top-0 z-30 select-none print:hidden">
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
      <div className="p-2 sm:p-4 text-[11px] leading-tight relative bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
        
        {/* ========================================================
            PAGE 1: ROWS 1 TO 46
            ======================================================== */}
        <div className="relative pb-6 mb-6">
          {/* Watermark Page 1 */}
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
                  <div className="border-b border-black py-0.5">{certNo}</div>
                  <div className="border-b border-black py-0.5">O‘ZAK.KL.0013</div>
                  <div className="py-0.5 font-normal text-[10px]">{issueDate}</div>
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

            {/* Rows 12-14: 3-column Metadata Box */}
            <div className="grid grid-cols-12 border-b-2 border-dashed border-black pb-2 mb-4 text-center">
              <div className="col-span-3 border-r border-black/40 pr-2">
                <div className="font-bold text-[11px]">Дата выдачи:</div>
                <div className="italic text-[10px] text-slate-700">Date of issue:</div>
                <div className="font-mono text-[12px] font-semibold mt-1">{issueDate}</div>
              </div>
              <div className="col-span-6 px-2">
                <div className="font-bold text-[11px]">Номер сертификата:</div>
                <div className="italic text-[10px] text-slate-700">Certificate number:</div>
                <div className="font-mono text-[13px] font-bold text-black mt-1">{certNo}</div>
              </div>
              <div className="col-span-3 border-l border-black/40 pl-2">
                <div className="font-bold text-[11px]">Количество страниц:</div>
                <div className="italic text-[10px] text-slate-700">Number of pages:</div>
                <div className="font-mono text-[13px] font-bold text-black mt-1">4</div>
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
                  <div>{itemNameRu}</div>
                  <div className="italic text-[10px] text-slate-700">Temperature chamber (Drying oven)</div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4 font-bold">
                  <div>Производитель:</div>
                  <div className="italic text-[10px] font-normal text-slate-700">Manufacturer:</div>
                </div>
                <div className="col-span-8">
                  <div>{info.manufacturer || 'Китай (CN)'}</div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4 font-bold">
                  <div>Тип (модель, серия):</div>
                  <div className="italic text-[10px] font-normal text-slate-700">Type (model, series):</div>
                </div>
                <div className="col-span-8 font-mono">{model}</div>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4 font-bold">
                  <div>Серийный номер:</div>
                  <div className="italic text-[10px] font-normal text-slate-700">Serial number:</div>
                </div>
                <div className="col-span-8 font-mono">{serialNo}</div>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4 font-bold">
                  <div>Заказчик:</div>
                  <div className="italic text-[10px] font-normal text-slate-700">Customer:</div>
                </div>
                <div className="col-span-8">{customer}</div>
              </div>
            </div>

            {/* Rows 31-39: Red Notice Box & Performer Signatures */}
            <div className="grid grid-cols-12 gap-4 mt-8 pt-4 items-start">
              {/* Red Warning Box */}
              <div className="col-span-5 border-2 border-red-600 p-2.5 text-center text-red-600 text-[9.5px] leading-tight font-medium">
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
                  <div className="mt-2 font-bold font-mono text-[12px] border-b border-black pb-1 inline-block min-w-[200px]">
                    {performer}
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
            <span>Uz-112/1-2025</span>
          </div>
        </div>

        {/* ========================================================
            PAGE 2: ROWS 47 TO 87
            ======================================================== */}
        <div className="relative pb-6 mb-6">
          {/* Watermark Page 2 */}
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
                  <div className="border-b border-black py-0.5">{certNo}</div>
                  <div className="border-b border-black py-0.5">O‘ZAK.KL.0013</div>
                  <div className="py-0.5 font-normal text-[10px]">{issueDate}</div>
                </div>
              </div>
            </div>

            {/* Row 50-51: Cert No & Page 2 */}
            <div className="flex justify-between items-center border-b border-dashed border-black py-1.5 my-2 text-[11px]">
              <div>
                <span className="font-bold">Номер сертификата:</span>{' '}
                <span className="italic text-[10px] text-slate-700">Certificate number:</span>{' '}
                <span className="font-mono font-bold underline ml-1">{certNo}</span>
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
                <div className="col-span-8 flex items-center gap-4">
                  <span className="italic text-[10px]">от from</span>
                  <span>{info.orderNumber || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4 font-bold">
                  <div>Период калибровки:</div>
                  <div className="italic text-[10px] font-normal text-slate-700">Calibration period:</div>
                </div>
                <div className="col-span-8 font-mono">{info.calibrationPeriod || issueDate}</div>
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
                    <td className="border border-black p-1.5 font-mono">{info.ambientTempMin ?? 24.0}</td>
                    <td className="border border-black p-1.5 font-mono">{info.ambientTempMax ?? 24.5}</td>
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
                    <td className="border border-black p-1.5 font-mono">{info.relativeHumidityMin ?? 37.7}</td>
                    <td className="border border-black p-1.5 font-mono">{info.relativeHumidityMax ?? 38.5}</td>
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
                    <td className="border border-black p-1.5 font-mono">{info.atmosphericPressureMin ?? 1012.2}</td>
                    <td className="border border-black p-1.5 font-mono">{info.atmosphericPressureMax ?? 1013.0}</td>
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
            <span>Uz-112/1-2025</span>
          </div>
        </div>

        {/* ========================================================
            PAGE 3: ROWS 88 TO 124
            ======================================================== */}
        <div className="relative pb-6 mb-6">
          {/* Watermark Page 3 */}
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
                  <div className="border-b border-black py-0.5">{certNo}</div>
                  <div className="border-b border-black py-0.5">O‘ZAK.KL.0013</div>
                  <div className="py-0.5 font-normal text-[10px]">{issueDate}</div>
                </div>
              </div>
            </div>

            {/* Cert No & Page 3 */}
            <div className="flex justify-between items-center border-b border-dashed border-black py-1.5 my-2 text-[11px]">
              <div>
                <span className="font-bold">Номер сертификата:</span>{' '}
                <span className="italic text-[10px] text-slate-700">Certificate number:</span>{' '}
                <span className="font-mono font-bold underline ml-1">{certNo}</span>
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
                      <div>Термометр лабораторный электронный</div>
                      <div className="italic text-[9.5px] text-slate-700">Electronic laboratory thermometer</div>
                    </td>
                    <td className="border border-black p-1 font-mono">{info.standardType || 'ЛТА/Б-300МТ'}</td>
                    <td className="border border-black p-1 font-mono">{info.standardSerial || '871352'}</td>
                    <td className="border border-black p-1 text-left font-mono text-[10px]">
                      UZ-09T/2927-2024<br />от 07.11.2024 г.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 font-mono font-bold">2</td>
                    <td className="border border-black p-1 text-left">
                      <div>Термометр сопротивления с цифровой индикацией (Калибратор температуры)</div>
                      <div className="italic text-[9px] text-slate-700">Resistance thermometer with digital indication (Temperature Calibrator)</div>
                    </td>
                    <td className="border border-black p-1 font-mono">
                      STS-200 A 915<br />(RTC-156B)
                    </td>
                    <td className="border border-black p-1 font-mono">
                      613343-19<br />(617498-00393)
                    </td>
                    <td className="border border-black p-1 text-left font-mono text-[10px]">
                      Uz-09T/630-2025<br />от 14.04.2025 г.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calibration Results Table (Exact Row 116 to 124) */}
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
                    <td className="border border-black p-2">{pointTempStr}</td>
                    <td className="border border-black p-2">{refValueStr}</td>
                    <td className="border-2 border-emerald-600 p-2 text-emerald-800 bg-emerald-50/50">{indValueStr}</td>
                    <td className="border border-black p-2">{devValueStr}</td>
                    <td className="border border-black p-2">{uValueStr}</td>
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
            <span>Uz-112/1-2025</span>
          </div>
        </div>

        {/* ========================================================
            PAGE 4: ROWS 125 TO 180
            ======================================================== */}
        <div className="relative pb-4">
          {/* Watermark Page 4 */}
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
                  <div className="border-b border-black py-0.5">{certNo}</div>
                  <div className="border-b border-black py-0.5">O‘ZAK.KL.0013</div>
                  <div className="py-0.5 font-normal text-[10px]">{issueDate}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-dashed border-black py-1.5 my-2 text-[11px]">
              <div>
                <span className="font-bold">Номер сертификата:</span>{' '}
                <span className="italic text-[10px] text-slate-700">Certificate number:</span>{' '}
                <span className="font-mono font-bold underline ml-1">{certNo}</span>
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
  );
};
