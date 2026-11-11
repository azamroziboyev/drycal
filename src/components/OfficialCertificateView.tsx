import React, { useState } from 'react';
import { CalibrationItemInfo, ChamberCalculation, ChamberPointData } from '../types';
import { formatMetrologyNumber } from '../utils/metrology';
import { UzNimLogo, UzakkBadge, QrCodeSvg } from './UzNimLogo';
import { downloadElementAsPdf } from '../utils/pdfGenerator';
import {
  Download,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface OfficialCertificateViewProps {
  info: CalibrationItemInfo;
  calculation: ChamberCalculation;
  pointsData: ChamberPointData[];
  onBackToEdit: () => void;
  onSaveCertificate: () => void;
  onUpdateInfo?: (updatedInfo: Partial<CalibrationItemInfo>) => void;
}

export const OfficialCertificateView: React.FC<OfficialCertificateViewProps> = ({
  info,
  calculation,
  pointsData,
  onBackToEdit,
  onSaveCertificate,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{ percent: number; status: string }>({
    percent: 0,
    status: '',
  });
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setDownloadSuccess(false);
    setErrorMessage('');

    onSaveCertificate();

    try {
      const pageIds = ['cert-page-1', 'cert-page-2', 'cert-page-3', 'cert-page-4'];
      const cleanFileName = `Sertifikat_${info.certificateNumber.replace(/[\/\\]/g, '_')}_${info.serialNumber}.pdf`;

      await downloadElementAsPdf(pageIds, cleanFileName, (percent, status) => {
        setPdfProgress({ percent, status });
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err: any) {
      console.error('PDF generation error', err);
      setErrorMessage(
        'Sertifikatni yuklab olishda muammo yuz berdi. Iltimos qaytadan urinib ko‘ring.'
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const pointTemp = calculation.pointTemp;
  const refValue = calculation.centerStdMean;
  const indValue = calculation.overallIndMean > 0 ? calculation.overallIndMean : calculation.centerIndMean;
  const devValue = calculation.deviation;
  const extUncertainty = calculation.U;

  // Reusable Page Header matching sertifikat.pdf (Khorezm branch + 3-row box on all 4 pages)
  const renderPageHeader = () => (
    <div className="flex items-center justify-between pb-2">
      <div className="w-28 shrink-0 flex items-center justify-start">
        <UzNimLogo size={54} />
      </div>

      <div className="flex-1 text-center px-3">
        <div className="text-[12px] font-bold leading-snug text-black">
          Хорезмский филиал ГУ «Узбекский национальный институт метрологии»
        </div>
        <div className="text-[11px] italic font-normal leading-snug text-black mt-0.5">
          "Uzbek National Institute of Metrology" state institution Khorezm branch
        </div>
      </div>

      {/* Top Right 3-Row Box */}
      <div className="border border-black text-center text-[10px] w-28 shrink-0 font-bold leading-tight">
        <div className="border-b border-black py-1 px-1">{info.certificateNumber || 'Uz-112/1-2025'}</div>
        <div className="border-b border-black py-1 px-1">O'ZAK.KL.0013</div>
        <div className="py-1 px-1">{info.issueDate || '2025-04-29'}</div>
      </div>
    </div>
  );

  // Reusable Sub-Header for Pages 2, 3, 4
  const renderPageSubHeader = (pageNumber: number) => (
    <div className="flex items-start justify-between py-3 text-[11px]">
      <div className="flex items-center gap-3">
        <div>
          <div className="font-bold">Номер сертификата</div>
          <div className="italic text-[10px]">Certificate number</div>
        </div>
        <div className="font-bold text-[12px] pl-2">{info.certificateNumber || 'Uz-112/1-2025'}</div>
      </div>

      <div className="text-right">
        <div>
          <span className="font-bold">Страница</span>
          <span className="font-bold mx-2">{pageNumber}</span>
          <span className="font-bold">из</span>
          <span className="font-bold mx-2">4</span>
          <span className="font-bold">страниц</span>
        </div>
        <div className="italic text-[10px]">
          <span>Page</span>
          <span className="mx-2 not-italic font-normal">{pageNumber}</span>
          <span>of</span>
          <span className="mx-2 not-italic font-normal">4</span>
          <span>pages</span>
        </div>
      </div>
    </div>
  );

  // Reusable Footer matching sertifikat.pdf
  const renderPageFooter = () => (
    <div className="pt-2 text-[9px] text-black flex justify-between items-end">
      <div className="leading-tight">
        <div className="font-bold">КЛ-ЖХ-19 приложение "В"</div>
        <div>(2022-06-01)</div>
      </div>
      <div className="text-right leading-tight">
        <div>Узбекистан, Хорезмская обл., г. Ургенч, ул. Ханкинская, 107Б, xorazm@nim.uz</div>
        <div>107B, Khonqa str., the city of Urgench, Khorezm r, Uzbekistan, xorazm@nim.uz</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Official Certificate PDF Toolbar */}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 transition-colors">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToEdit}
              className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer text-white"
              title="Tahrirlashga qaytish"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="bg-white text-blue-700 p-1.5 rounded-lg font-black text-xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-wide">
                    Sertifikat (PDF) • {info.certificateNumber || 'Uz-112/1-2025'}
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-medium">
                    Rasmiy Blank (4 sahifa)
                  </span>
                </div>
                <div className="text-[11px] text-white/80">
                  O‘zMMI Kalibrlash Sertifikati (KU-10-2025 / EURAMET Calibration Guide No. 20)
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-blue-800 hover:bg-blue-50 shadow-sm transition cursor-pointer disabled:opacity-60"
              title="Sertifikatni rasmiy PDF formatida yuklab olish"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
                  <span>{pdfProgress.percent}% (PDF)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-blue-700" />
                  <span>Sertifikatni PDF yuklab olish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 print:hidden">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Sertifikat PDF formati muvaffaqiyatli saqlandi va yuklab olindi!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2 print:hidden">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pages Container: Clean A4 sheets */}
      <div className="flex flex-col items-center gap-8 py-4 bg-slate-200 dark:bg-slate-950 p-4 rounded-2xl overflow-x-auto">
        {/* ==================== PAGE 1 ==================== */}
        <div
          id="cert-page-1"
          className="w-[210mm] min-h-[297mm] h-[297mm] p-[16mm] bg-white text-black shadow-2xl relative font-sans text-[11px] leading-snug flex flex-col justify-between box-border shrink-0 print:shadow-none print:m-0 print:p-[12mm]"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          <div>
            {renderPageHeader()}

            {/* Title */}
            <div className="text-center my-6">
              <h2 className="text-lg font-bold text-black">Сертификат калибровки</h2>
              <h3 className="text-sm italic font-normal text-black mt-0.5">
                Calibration certificate
              </h3>
            </div>

            {/* General Metadata Grid with individual underlines */}
            <div className="grid grid-cols-3 gap-8 my-6 text-xs text-center">
              <div>
                <div className="font-bold">Дата выдачи</div>
                <div className="italic text-[10px]">Date of issue</div>
                <div className="mt-2 border-b border-black pb-0.5 font-medium">
                  {info.issueDate || '2025-04-29'}
                </div>
              </div>
              <div>
                <div className="font-bold">Номер сертификата</div>
                <div className="italic text-[10px]">Certificate number</div>
                <div className="mt-2 border-b border-black pb-0.5 font-bold">
                  {info.certificateNumber || 'Uz-112/1-2025'}
                </div>
              </div>
              <div>
                <div className="font-bold">Количество страниц</div>
                <div className="italic text-[10px]">Number of pages</div>
                <div className="mt-2 border-b border-black pb-0.5 font-medium">4</div>
              </div>
            </div>

            {/* Items Details List */}
            <div className="space-y-5 my-8 text-xs">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <div className="font-bold">Объект калибровки</div>
                  <div className="italic text-[10px]">Calibration item</div>
                </div>
                <div className="col-span-7">
                  <div className="font-bold">
                    {info.objectName || 'Сушильные шкаф (Quritish shkafi)'}
                  </div>
                  <div className="italic text-[11px]">Temperature chamber (Drying oven)</div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <div className="font-bold">Производитель</div>
                  <div className="italic text-[10px]">Manufacturer</div>
                </div>
                <div className="col-span-7 font-medium">{info.manufacturer || 'Китай (CN)'}</div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <div className="font-bold">Тип (модель, серия)</div>
                  <div className="italic text-[10px]">Type (model, series)</div>
                </div>
                <div className="col-span-7 font-medium">{info.objectType || 'RTOP-500Y'}</div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <div className="font-bold">Серийный номер</div>
                  <div className="italic text-[10px]">Serial number</div>
                </div>
                <div className="col-span-7 font-medium">{info.serialNumber || '2333001557'}</div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <div className="font-bold">Заказчик</div>
                  <div className="italic text-[10px]">Customer</div>
                </div>
                <div className="col-span-7 font-medium">{info.customerName || '-'}</div>
              </div>
            </div>

            {/* Bottom Notice & Signatures */}
            <div className="mt-16">
              <div className="grid grid-cols-12 gap-5 items-end">
                {/* Warning Red Box on Left */}
                <div className="col-span-5 border border-red-500 p-3 text-[9.5px] leading-snug text-center">
                  <p className="font-bold text-red-600">
                    Сертификат калибровки рассматривается как недействительный без сгенерированного системой «e-metrologiya.uz» листа, содержащего ссылку на него
                  </p>
                  <p className="italic text-black mt-1.5">
                    The calibration certificate is considered invalid without a sheet generated by the "e-metrologiya.uz" system containing a link to it
                  </p>
                </div>

                {/* Right Column: Calibrated by + Reproduction box */}
                <div className="col-span-7 space-y-6 text-xs">
                  <div className="flex items-end justify-between gap-2">
                    <div className="shrink-0">
                      <div className="font-bold">Калибровку выполнил:</div>
                      <div className="italic text-[10px]">Calibration performed by:</div>
                    </div>
                    <div className="font-bold text-[11px] px-1 shrink-0">
                      {info.calibratedByUz || "G'aibnazarov Boburjon"}
                    </div>
                    <div className="border-b border-black flex-1 min-w-[90px] mb-1" />
                  </div>

                  {/* Reproduction box */}
                  <div className="border border-black p-2.5 text-center text-[10px]">
                    <p className="font-bold">
                      Сертификат калибровки не может быть воспроизведен, кроме как в полном объеме
                    </p>
                    <p className="italic mt-0.5">
                      Calibration certificate shall not be reproduced except in full
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {renderPageFooter()}
        </div>

        {/* ==================== PAGE 2 ==================== */}
        <div
          id="cert-page-2"
          className="w-[210mm] min-h-[297mm] h-[297mm] p-[16mm] bg-white text-black shadow-2xl relative font-sans text-[11px] leading-snug flex flex-col justify-between box-border shrink-0 print:shadow-none print:m-0 print:p-[12mm]"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          <div>
            {renderPageHeader()}
            {renderPageSubHeader(2)}

            {/* Content items */}
            <div className="space-y-5 my-4 text-xs">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <div className="font-bold">Запрос на калибровку</div>
                  <div className="italic text-[10px]">Calibration request</div>
                </div>
                <div className="col-span-2 text-center">
                  <div className="font-bold">от</div>
                  <div className="italic text-[10px]">from</div>
                </div>
                <div className="col-span-6 font-medium">{info.orderNumber || '-'}</div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <div className="font-bold">Период калибровки</div>
                  <div className="italic text-[10px]">Calibration period</div>
                </div>
                <div className="col-span-8 font-medium">
                  {info.calibrationPeriod || '2025-04-29'}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4">
                  <div className="font-bold">Наименование лаборатории</div>
                  <div className="italic text-[10px]">Name of laboratory</div>
                </div>
                <div className="col-span-8 leading-snug">
                  <div className="font-bold">
                    {info.laboratoryNameRu ||
                      'Лаборатория сравнения и калибровки физико-химических приборов, измерителей плотности, давления и температуры'}
                  </div>
                  <div className="italic text-[10.5px] mt-1">
                    {info.laboratoryNameEn ||
                      'Laboratory for comparison and calibration of physical and chemical instruments, density, pressure and temperature meters'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4">
                  <div className="font-bold">Место осуществления измерений</div>
                  <div className="italic text-[10px]">Location of performance of measurement</div>
                </div>
                <div className="col-span-8 leading-snug">
                  <div className="font-bold">
                    Хорезмский филиал ГУ «Узбекский национальный институт метрологии» Республика Узбекистан, Хорезмская область, город Ургенч, улица Ханкинская, 107Б, тел: +998 78 770-46-15, www.nim.uz
                  </div>
                  <div className="italic text-[10.5px] mt-1">
                    "Uzbek National Institute of Metrology" state institution Khorezm branch 107B, Khonqa street, the city of Urgench, Khorezm region, Republic of Uzbekistan, tel: +998 78 770-46-15, www.nim.uz
                  </div>
                </div>
              </div>

              {/* Environmental Conditions (4-column table matching sertifikat.pdf) */}
              <div className="pt-2">
                <div className="mb-2">
                  <div className="font-bold">Условия калибровки</div>
                  <div className="italic text-[10px]">Calibration conditions</div>
                </div>

                <table className="w-full border-collapse border border-black text-[11px] text-center">
                  <thead>
                    <tr>
                      <th className="border border-black p-2 w-[46%]">
                        <div className="font-bold">Контролируемые показатели</div>
                        <div className="italic font-normal text-[10px]">Controlled indicators</div>
                      </th>
                      <th className="border border-black p-2 w-[14%]">
                        <div className="font-bold">от</div>
                        <div className="italic font-normal text-[10px]">from</div>
                      </th>
                      <th className="border border-black p-2 w-[14%]">
                        <div className="font-bold">до</div>
                        <div className="italic font-normal text-[10px]">to</div>
                      </th>
                      <th className="border border-black p-2 w-[26%]">
                        <div className="font-bold">Примечание</div>
                        <div className="italic font-normal text-[10px]">Remark</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-center">
                        <div className="font-bold">Температура окружающего воздуха, °С</div>
                        <div className="italic text-[10px]">Ambient temperature, °С</div>
                      </td>
                      <td className="border border-black p-2">
                        {formatMetrologyNumber(info.ambientTempMin, 1)}
                      </td>
                      <td className="border border-black p-2">
                        {formatMetrologyNumber(info.ambientTempMax, 1)}
                      </td>
                      <td className="border border-black p-2">
                        <div className="font-bold">в пределах 1,0 °С в 24 h</div>
                        <div className="italic text-[10px]">within 1,0 °С in 24 h</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center">
                        <div className="font-bold">Относительная влажность окружающей среды, %</div>
                        <div className="italic text-[10px]">Ambient relative humidity, %</div>
                      </td>
                      <td className="border border-black p-2">
                        {formatMetrologyNumber(info.relativeHumidityMin, 1)}
                      </td>
                      <td className="border border-black p-2">
                        {formatMetrologyNumber(info.relativeHumidityMax, 1)}
                      </td>
                      <td className="border border-black p-2">
                        <div className="font-bold">в пределах 10 % в 24 h</div>
                        <div className="italic text-[10px]">within 10 % in 24 h</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center">
                        <div className="font-bold">Атмосферное давление, hPa</div>
                        <div className="italic text-[10px]">Air pressure, hPa</div>
                      </td>
                      <td className="border border-black p-2">
                        {formatMetrologyNumber(info.atmosphericPressureMin || 1012.2, 1)}
                      </td>
                      <td className="border border-black p-2">
                        {formatMetrologyNumber(info.atmosphericPressureMax || 1013.0, 1)}
                      </td>
                      <td className="border border-black p-2">
                        <div className="font-bold">в пределах ± 8 hPa в 24 h</div>
                        <div className="italic text-[10px]">within to ±8 hPa in 24 h</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {renderPageFooter()}
        </div>

        {/* ==================== PAGE 3 ==================== */}
        <div
          id="cert-page-3"
          className="w-[210mm] min-h-[297mm] h-[297mm] p-[16mm] bg-white text-black shadow-2xl relative font-sans text-[11px] leading-snug flex flex-col justify-between box-border shrink-0 print:shadow-none print:m-0 print:p-[12mm]"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          <div>
            {renderPageHeader()}
            {renderPageSubHeader(3)}

            {/* Method and calibration procedure */}
            <div className="grid grid-cols-12 gap-2 items-start my-3 text-xs">
              <div className="col-span-5">
                <div className="font-bold">Метод и калибровочная процедура</div>
                <div className="italic text-[10px]">Method and calibration procedure</div>
              </div>
              <div className="col-span-7 italic text-[11px] leading-snug space-y-1">
                <div>KU-10-2025. Камера температуры (сушильные шкафы). Методика калибровки.</div>
                <div>
                  EURAMET Calibration Guide No. 20 Версия 5.0 Calibration of Temperature and/or Humidity Enclosures.
                </div>
              </div>
            </div>

            {/* Standards Table (2 rows matching sertifikat.pdf) */}
            <div className="my-3">
              <div className="mb-1.5 text-xs">
                <div className="font-bold">Калибровка выполнена с помощью</div>
                <div className="italic text-[10px]">Calibration is performed by using</div>
              </div>

              <table className="w-full border-collapse border border-black text-[10.5px] text-center">
                <thead>
                  <tr>
                    <th className="border border-black p-1.5 w-8 font-bold">№</th>
                    <th className="border border-black p-1.5 w-[34%]">
                      <div className="font-bold">Опорный измерительный эталон</div>
                      <div className="italic font-normal text-[9.5px]">
                        Reference measurement standard
                      </div>
                    </th>
                    <th className="border border-black p-1.5 w-[20%]">
                      <div className="font-bold">Тип / Модель</div>
                      <div className="italic font-normal text-[9.5px]">Type / Model</div>
                    </th>
                    <th className="border border-black p-1.5 w-[18%]">
                      <div className="font-bold">Серийный номер</div>
                      <div className="italic font-normal text-[9.5px]">Serial Number</div>
                    </th>
                    <th className="border border-black p-1.5 w-[24%]">
                      <div className="font-bold">Метрологическая прослеживаемость</div>
                      <div className="italic font-normal text-[9.5px]">
                        Metrological traceability
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-1.5">1</td>
                    <td className="border border-black p-1.5">
                      <div className="font-bold">
                        {info.standardName || 'Термометр лабораторний электронный'}
                      </div>
                      <div className="italic text-[9.5px]">Electronic laboratory thermometer</div>
                    </td>
                    <td className="border border-black p-1.5">
                      {info.standardType || 'LTA/Б-300МТ'}
                    </td>
                    <td className="border border-black p-1.5">
                      {info.standardSerial || '871352'}
                    </td>
                    <td className="border border-black p-1.5">
                      {info.standardTraceability || 'UZ-09T/2927-2024 от 07.11.2024 г.'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5">2</td>
                    <td className="border border-black p-1.5">
                      <div className="font-bold">
                        Термометр сопротивления с цифровой индикацией (Калибратор температуры)
                      </div>
                      <div className="italic text-[9.5px]">
                        Resistance thermometer with digital indication (Temperature Calibrator)
                      </div>
                    </td>
                    <td className="border border-black p-1.5">STS-200 A 915 (RTC-156B)</td>
                    <td className="border border-black p-1.5">613343-19 (617498-00393)</td>
                    <td className="border border-black p-1.5">Uz-09T/630-2025 от 14.04.2025 г.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calibration Results Table */}
            <div className="my-3">
              <div className="mb-1.5 text-xs">
                <div className="font-bold">Результаты калибровки, включая неопределенность</div>
                <div className="italic text-[10px]">Calibration results including uncertainty</div>
              </div>

              <table className="w-full border-collapse border border-black text-[10.5px] text-center">
                <thead>
                  <tr>
                    <th className="border border-black p-1.5 w-1/5">
                      <div className="font-bold">Номинальная температура, °C</div>
                      <div className="italic font-normal text-[9.5px]">Nominal temperature, °C</div>
                    </th>
                    <th className="border border-black p-1.5 w-1/5">
                      <div className="font-bold">Опорное значение, °С</div>
                      <div className="italic font-normal text-[9.5px]">Support meaning, °C</div>
                    </th>
                    <th className="border border-black p-1.5 w-1/5">
                      <div className="font-bold">Показание объекта калибровки, °С</div>
                      <div className="italic font-normal text-[9.5px]">
                        Indication of the calibration object, °C
                      </div>
                    </th>
                    <th className="border border-black p-1.5 w-1/5">
                      <div className="font-bold">Отклонение, °C</div>
                      <div className="italic font-normal text-[9.5px]">Deviation, °C</div>
                    </th>
                    <th className="border border-black p-1.5 w-1/5">
                      <div className="font-bold">Расширенная неопределенность, °C</div>
                      <div className="italic font-normal text-[9.5px]">
                        Expanded uncertainty, °C
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-1.5">
                      {formatMetrologyNumber(pointTemp, 1)}
                    </td>
                    <td className="border border-black p-1.5">
                      {formatMetrologyNumber(refValue, 2)}
                    </td>
                    <td className="border border-black p-1.5">
                      {formatMetrologyNumber(indValue, 2)}
                    </td>
                    <td className="border border-black p-1.5">
                      {formatMetrologyNumber(devValue, 2)}
                    </td>
                    <td className="border border-black p-1.5">
                      {formatMetrologyNumber(extUncertainty, 2)}
                    </td>
                  </tr>
                  <tr className="h-6">
                    <td className="border border-black" />
                    <td className="border border-black" />
                    <td className="border border-black" />
                    <td className="border border-black" />
                    <td className="border border-black" />
                  </tr>
                  <tr className="h-6">
                    <td className="border border-black" />
                    <td className="border border-black" />
                    <td className="border border-black" />
                    <td className="border border-black" />
                    <td className="border border-black" />
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-12 gap-2 items-center my-3 text-xs">
              <div className="col-span-5">
                <div className="font-bold">Дополнительная информация</div>
                <div className="italic text-[10px]">Additional information</div>
              </div>
              <div className="col-span-7">{info.additionalInfo || '-------'}</div>
            </div>

            {/* Diagonal dashed lines matching sertifikat.pdf */}
            <div className="my-2 relative h-36 overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 700 160" preserveAspectRatio="none">
                <line x1="20" y1="150" x2="180" y2="5" stroke="#000" strokeWidth="1.2" strokeDasharray="5,4" />
                <line x1="90" y1="155" x2="290" y2="5" stroke="#000" strokeWidth="1.2" strokeDasharray="5,4" />
                <line x1="180" y1="155" x2="400" y2="5" stroke="#000" strokeWidth="1.2" strokeDasharray="5,4" />
                <line x1="280" y1="155" x2="500" y2="5" stroke="#000" strokeWidth="1.2" strokeDasharray="5,4" />
                <line x1="390" y1="155" x2="600" y2="5" stroke="#000" strokeWidth="1.2" strokeDasharray="5,4" />
                <line x1="500" y1="155" x2="680" y2="15" stroke="#000" strokeWidth="1.2" strokeDasharray="5,4" />
              </svg>
            </div>
          </div>

          {renderPageFooter()}
        </div>

        {/* ==================== PAGE 4 ==================== */}
        <div
          id="cert-page-4"
          className="w-[210mm] min-h-[297mm] h-[297mm] p-[16mm] bg-white text-black shadow-2xl relative font-sans text-[11px] leading-snug flex flex-col justify-between box-border shrink-0 print:shadow-none print:m-0 print:p-[12mm]"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          <div>
            {renderPageHeader()}
            {renderPageSubHeader(4)}

            {/* First Bordered Box: GUM & Traceability Statements */}
            <div className="border border-black p-4 text-center space-y-3 my-4 text-[10.5px] leading-snug">
              <div>
                <p className="font-bold">
                  Указанная расширенная неопределенность измерений определяется как стандартная неопределенность измерений, умноженная на коэффициент охвата k = 2, что для нормального распределения соответствует вероятности охвата приблизительно 95 %. Стандартная неопределенность измерений определена в соответствии с GUM.
                </p>
                <p className="italic mt-1">
                  The reported expanded uncertainty of measurement is stated as the standard uncertainty of measurement multiplied by the coverage factor k = 2, which for a normal distribution corresponds to a coverage probability of approximately 95 %. The standard uncertainty of measurement has been determined in accordance with GUM.
                </p>
              </div>

              <div>
                <p className="font-bold">
                  Все измерения имеют прослеживаемость к единицам Международной системы SI
                </p>
                <p className="italic">All measurements are traceable to the SI units</p>
              </div>

              <div>
                <p className="font-bold">
                  Результат калибровки относится только к объекту калибровки
                </p>
                <p className="italic">The calibration result refers only to the calibration item</p>
              </div>
            </div>

            {/* Second Bordered Box: Institutional & Khorezm Branch Accreditation */}
            <div className="border border-black p-4 text-center space-y-3 my-4 text-[10.5px] leading-snug">
              <div>
                <p className="font-bold">
                  Узбекский национальный институт метрологии является подписантом Договорённости о взаимном признании (MRA) Международного комитета по весам и мерам (CIPM).
                </p>
                <p className="italic">
                  Uzbek National Institute of Metrology is a signatory of the International Committee for Weights and Measures (CIPM) Mutual Recognition Arrangement (MRA).
                </p>
              </div>

              <div>
                <p className="font-bold">
                  Хорезмский филиал ГУ «Узбекский национальный институт метрологии» аккредитован ГУ «Узбекским центром аккредитации» (O‘ZAKK) под регистрационным номером O‘ZAK.KL.0013 по O‘z DSt ISO/IEC 17025:2019 как калибровочная лаборатория.
                </p>
                <p className="italic">
                  State Institution "Uzbek National Institute of Metrology" Khorezm Branch is accredited by the State Institution "Uzbek Accreditation Center" (O'ZAKK) under registration number O'ZAK.KL.0013 according to O'z DSt ISO/IEC 17025:2019 as a calibration laboratory.
                </p>
              </div>

              <div>
                <p className="font-bold">
                  Узбекский центр аккредитации (O‘ZAKK) является подписантом Договорённости о взаимном признании (MRA) Международного сотрудничество по аккредитации лабораторий (ILAC).
                </p>
                <p className="italic">
                  Uzbek Accreditation Center (O‘ZAKK) is a signatory of the International Laboratory Accreditation Cooperation (ILAC) Mutual Recognition Arrangement (MRA).
                </p>
              </div>
            </div>

            {/* Bottom Section: UzakkBadge (Left) + Feedback Text & QrCodeSvg (Right) + End of Certificate */}
            <div className="mt-6 pt-2">
              <div className="flex items-center justify-between gap-4 px-1">
                <div className="shrink-0">
                  <UzakkBadge />
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-[10.5px] leading-snug max-w-[185px]">
                    <p className="font-bold text-black">
                      Калибровочная лаборатория УзНИМ стремится получать обратную связь от своих заказчиков
                    </p>
                    <p className="italic text-black mt-0.5">
                      UzNIM Calibration laboratory seeks feedback from its customers
                    </p>
                  </div>
                  <div className="shrink-0">
                    <QrCodeSvg size={115} />
                  </div>
                </div>
              </div>

              <div className="text-center mt-5 pt-2">
                <div className="font-bold text-[12px] text-black">
                  Конец сертификата калибровки
                </div>
                <div className="italic text-[12px] text-black mt-0.5">
                  End of Calibration Certificate
                </div>
              </div>
            </div>
          </div>

          {renderPageFooter()}
        </div>
      </div>
    </div>
  );
};
