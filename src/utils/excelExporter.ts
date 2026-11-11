import ExcelJS from 'exceljs';
import { CalibrationItemInfo, ChamberCalculation, ChamberPointData } from '../types';

/**
 * Downloads a generated ExcelJS workbook as a .xlsx file in the browser (100% static client-side)
 */
async function saveWorkbook(workbook: ExcelJS.Workbook, fileName: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Helper to fetch image as base64 string for ExcelJS image embedding
 */
async function fetchBase64FromUrl(url: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Export 5-page Measurement Protocol (Birlamchi ma'lumotlar bayonnomasi) into authentic Excel (.xlsx)
 * CRITICAL REQUIREMENT: Placed on a SINGLE SHEET ("Протокол" / "Лист 1") stacked vertically ("ust ma ust")
 * exactly matching the reviewer layout and user screenshots!
 */
export async function exportProtocolToExcel(
  info: CalibrationItemInfo,
  calculation: ChamberCalculation,
  pointsData: ChamberPointData[]
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "O'zbekiston Milliy Metrologiya Instituti";
  workbook.lastModifiedBy = info.calibratedByUz || "G'aibnazarov Boburjon";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Create SINGLE worksheet where all pages are stacked sequentially
  const sheet = workbook.addWorksheet('Протокол', {
    views: [{ showGridLines: true }],
  });

  // Columns A to V matching standard layout
  sheet.columns = [
    { width: 4 },  // A
    { width: 6 },  // B
    { width: 10 }, // C
    { width: 12 }, // D
    { width: 12 }, // E
    { width: 12 }, // F
    { width: 12 }, // G
    { width: 10 }, // H
    { width: 10 }, // I
    { width: 8 },  // J
    { width: 8 },  // K
    { width: 8 },  // L
    { width: 10 }, // M
    { width: 10 }, // N
    { width: 10 }, // O
    { width: 10 }, // P
    { width: 10 }, // Q
    { width: 10 }, // R
    { width: 10 }, // S
    { width: 10 }, // T
    { width: 10 }, // U
    { width: 12 }, // V
  ];

  // Visual Styles
  const greenHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF548235' },
  };
  const lightBlueFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFBDD7EE' },
  };
  const yellowHighlightFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFF00' },
  };
  const yellowReadingFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFF2CC' },
  };
  const cyanParetoFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF00B0F0' },
  };
  const softGrayFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF2F2F2' },
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  };

  const thickBluePageBreakBorder: Partial<ExcelJS.Borders> = {
    bottom: { style: 'medium', color: { argb: 'FF002060' } },
  };

  const applyRangeBorder = (rStart: number, rEnd: number, cStart: number, cEnd: number) => {
    for (let r = rStart; r <= rEnd; r++) {
      for (let c = cStart; c <= cEnd; c++) {
        const colLetter = String.fromCharCode(64 + c);
        sheet.getCell(`${colLetter}${r}`).border = thinBorder;
      }
    }
  };

  // =============================================================
  // PAGE 1: ROWS 1 TO 36 (Screenshot 2026-11-10 223851.png)
  // =============================================================
  sheet.mergeCells('B2:F2');
  sheet.getCell('B2').value = 'Протокол калибровки';
  sheet.getCell('B2').font = { size: 14, bold: true, color: { argb: 'FF000000' } };

  sheet.mergeCells('B3:F3');
  sheet.getCell('B3').value = 'CALIBRATION REPORT';
  sheet.getCell('B3').font = { size: 10, italic: true };

  sheet.mergeCells('N2:P2');
  sheet.getCell('N2').value = 'Номер протокола:';
  sheet.getCell('N2').font = { size: 9, bold: true };

  sheet.mergeCells('N3:P3');
  sheet.getCell('N3').value = 'Number of report:';
  sheet.getCell('N3').font = { size: 8, italic: true };

  sheet.mergeCells('Q2:V2');
  sheet.getCell('Q2').value = info.certificateNumber || 'Uz-112/1-2025';
  sheet.getCell('Q2').font = { size: 11, bold: true, color: { argb: 'FF0070C0' } };
  sheet.getCell('Q2').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell('Q2').border = { bottom: { style: 'thin', color: { argb: 'FF000000' } } };

  sheet.mergeCells('B5:D5');
  sheet.getCell('B5').value = 'Дата калибровки:';
  sheet.getCell('B5').font = { size: 9, bold: true };

  sheet.mergeCells('B6:D6');
  sheet.getCell('B6').value = 'Date of calibration:';
  sheet.getCell('B6').font = { size: 8, italic: true };

  sheet.mergeCells('E5:H6');
  sheet.getCell('E5').value = info.issueDate || '2025-04-29';
  sheet.getCell('E5').font = { size: 10, bold: true, color: { argb: 'FF0070C0' } };
  sheet.getCell('E5').alignment = { vertical: 'middle' };

  sheet.mergeCells('N5:P5');
  sheet.getCell('N5').value = 'Количество страниц:';
  sheet.getCell('N5').font = { size: 9, bold: true };

  sheet.mergeCells('N6:P6');
  sheet.getCell('N6').value = 'Number of pages:';
  sheet.getCell('N6').font = { size: 8, italic: true };

  sheet.mergeCells('Q5:V6');
  sheet.getCell('Q5').value = 5;
  sheet.getCell('Q5').font = { size: 12, bold: true, color: { argb: 'FFFF0000' } };
  sheet.getCell('Q5').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell('Q5').border = { bottom: { style: 'thin', color: { argb: 'FF000000' } } };

  // Section 1: Customer & Order Details
  sheet.mergeCells('B8:F9');
  sheet.getCell('B8').value = 'Наименование\nи адрес заказчика\nName and address\nof customer';
  sheet.getCell('B8').font = { size: 9, bold: true };
  sheet.getCell('B8').alignment = { vertical: 'middle', wrapText: true };

  sheet.mergeCells('G8:V9');
  sheet.getCell('G8').value = `${info.customerName || '-'}\n${info.customerAddress || ''}`.trim();
  sheet.getCell('G8').font = { size: 9 };
  sheet.getCell('G8').alignment = { vertical: 'middle', wrapText: true };
  applyRangeBorder(8, 9, 2, 22);

  sheet.mergeCells('B10:F11');
  sheet.getCell('B10').value = 'Заявка:\nOrder:';
  sheet.getCell('B10').font = { size: 9, bold: true };
  sheet.getCell('B10').alignment = { vertical: 'middle', wrapText: true };

  sheet.mergeCells('G10:V11');
  sheet.getCell('G10').value = info.orderNumber || '№ 25-112-xxxxxx';
  sheet.getCell('G10').font = { size: 9, bold: true, color: { argb: 'FF0070C0' } };
  sheet.getCell('G10').alignment = { vertical: 'middle' };
  applyRangeBorder(10, 11, 2, 22);

  sheet.mergeCells('B12:F15');
  sheet.getCell('B12').value = 'Объект калибровки\nCalibration item';
  sheet.getCell('B12').font = { size: 9, bold: true };
  sheet.getCell('B12').alignment = { vertical: 'middle', wrapText: true };

  sheet.mergeCells('G12:V12');
  sheet.getCell('G12').value = info.objectName || 'Сушильные шкаф (Quritish shkafi)';
  sheet.getCell('G12').font = { size: 9, bold: true, color: { argb: 'FF0070C0' } };
  sheet.getCell('G12').alignment = { vertical: 'middle' };

  sheet.mergeCells('G13:L13');
  sheet.getCell('G13').value = 'с диапазоном измерения от';
  sheet.getCell('G13').font = { size: 8, italic: true };
  sheet.getCell('G13').alignment = { vertical: 'middle' };

  sheet.mergeCells('M13:N13');
  sheet.getCell('M13').value = info.tempRangeMin ?? 0.0;
  sheet.getCell('M13').font = { size: 9, bold: true, color: { argb: 'FF0070C0' } };
  sheet.getCell('M13').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('O13:P13');
  sheet.getCell('O13').value = 'до';
  sheet.getCell('O13').font = { size: 8, italic: true };
  sheet.getCell('O13').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('Q13:R13');
  sheet.getCell('Q13').value = `${info.tempRangeMax ?? 50.0} °C`;
  sheet.getCell('Q13').font = { size: 9, bold: true, color: { argb: 'FF0070C0' } };
  sheet.getCell('Q13').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('G14:H15');
  sheet.getCell('G14').value = 'типа\ntype';
  sheet.getCell('G14').font = { size: 8, italic: true };
  sheet.getCell('G14').alignment = { vertical: 'middle' };

  sheet.mergeCells('I14:L15');
  sheet.getCell('I14').value = info.objectType || 'RTOP-500Y';
  sheet.getCell('I14').font = { size: 9, bold: true, color: { argb: 'FF0070C0' } };
  sheet.getCell('I14').alignment = { vertical: 'middle' };

  sheet.mergeCells('M14:P15');
  sheet.getCell('M14').value = 'заводским номером\nserial number';
  sheet.getCell('M14').font = { size: 8, italic: true };
  sheet.getCell('M14').alignment = { vertical: 'middle' };

  sheet.mergeCells('Q14:V15');
  sheet.getCell('Q14').value = info.serialNumber || '2333001557';
  sheet.getCell('Q14').font = { size: 9, bold: true, color: { argb: 'FF0070C0' } };
  sheet.getCell('Q14').alignment = { vertical: 'middle' };
  applyRangeBorder(12, 15, 2, 22);

  sheet.mergeCells('B16:F18');
  sheet.getCell('B16').value = 'Методика\nи процедура\nкалибровки\nCalibration method\nand procedure';
  sheet.getCell('B16').font = { size: 8.5, bold: true };
  sheet.getCell('B16').alignment = { vertical: 'middle', wrapText: true };

  sheet.mergeCells('G16:V18');
  sheet.getCell('G16').value =
    'KU-10-2025. Камера температуры (термостаты и сушильные шкафы). Методика калибровки.\nEURAMET Calibration Guide No. 20 Версия 5.0 Calibration of Temperature and/or Humidity Enclosures.';
  sheet.getCell('G16').font = { size: 8.5 };
  sheet.getCell('G16').alignment = { vertical: 'middle', wrapText: true };
  applyRangeBorder(16, 18, 2, 22);

  sheet.mergeCells('B19:F24');
  sheet.getCell('B19').value = 'Калибровка\nвыполнена\nс помощью\nCalibration\nis performed\nby using';
  sheet.getCell('B19').font = { size: 8.5, bold: true };
  sheet.getCell('B19').alignment = { vertical: 'middle', wrapText: true };

  sheet.mergeCells('G19:V20');
  sheet.getCell('G19').value =
    `Термометр лабораторный электронный\nтипа: ${info.standardType || 'ЛТА/Б-300МТ'}, заводской номер № ${info.standardSerial || '871352'}`;
  sheet.getCell('G19').font = { size: 8.5, color: { argb: 'FF0070C0' } };
  sheet.getCell('G19').alignment = { vertical: 'middle', wrapText: true };

  sheet.mergeCells('G21:V22');
  sheet.getCell('G21').value =
    'Термометр сопротивления с цифровой индикацией (Калибратор температуры)\nтипа: STS-200 A 915 (RTC-156B), заводской номер № 613343-19 (617498-00393)';
  sheet.getCell('G21').font = { size: 8.5, color: { argb: 'FF0070C0' } };
  sheet.getCell('G21').alignment = { vertical: 'middle', wrapText: true };

  sheet.mergeCells('G23:V24');
  sheet.getCell('G23').value =
    'Регистратор-даталоггер\nтипа: "DL200D", заводской номер № 068.1019.0802.034';
  sheet.getCell('G23').font = { size: 8.5, color: { argb: 'FF0070C0' } };
  sheet.getCell('G23').alignment = { vertical: 'middle', wrapText: true };
  applyRangeBorder(19, 24, 2, 22);

  // Environmental Conditions Table
  sheet.mergeCells('B26:F26');
  sheet.getCell('B26').value = 'Условия калибровки:';
  sheet.getCell('B26').font = { size: 9, bold: true };

  sheet.mergeCells('B27:F27');
  sheet.getCell('B27').value = 'Calibration conditions:';
  sheet.getCell('B27').font = { size: 8, italic: true };

  sheet.mergeCells('G26:L27');
  sheet.getCell('G26').value = 'Контролируемые показатели\nControlled indicators';
  sheet.getCell('G26').font = { size: 8.5, bold: true };
  sheet.getCell('G26').fill = softGrayFill;
  sheet.getCell('G26').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('M26:P27');
  sheet.getCell('M26').value = 'в начале\nat the beginning';
  sheet.getCell('M26').font = { size: 8.5, bold: true };
  sheet.getCell('M26').fill = softGrayFill;
  sheet.getCell('M26').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('Q26:V27');
  sheet.getCell('Q26').value = 'в конце\nat the end';
  sheet.getCell('Q26').font = { size: 8.5, bold: true };
  sheet.getCell('Q26').fill = softGrayFill;
  sheet.getCell('Q26').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  const envData = [
    {
      title: 'Температура окружающего воздуха, °C',
      start: info.ambientTempMin ?? 24.0,
      end: info.ambientTempMax ?? 24.5,
      r1: 28,
      r2: 29,
    },
    {
      title: 'Относительная влажность, %',
      start: info.relativeHumidityMin ?? 37.7,
      end: info.relativeHumidityMax ?? 38.5,
      r1: 30,
      r2: 31,
    },
    {
      title: 'Атмосферное давление, hPa',
      start: info.atmosphericPressureMin ?? 1012.2,
      end: info.atmosphericPressureMax ?? 1013.0,
      r1: 32,
      r2: 33,
    },
  ];

  envData.forEach((env) => {
    sheet.mergeCells(`G${env.r1}:L${env.r2}`);
    sheet.getCell(`G${env.r1}`).value = env.title;
    sheet.getCell(`G${env.r1}`).alignment = { vertical: 'middle' };
    sheet.getCell(`G${env.r1}`).font = { size: 8.5 };

    sheet.mergeCells(`M${env.r1}:P${env.r2}`);
    sheet.getCell(`M${env.r1}`).value = env.start;
    sheet.getCell(`M${env.r1}`).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell(`M${env.r1}`).font = { size: 9, bold: true, color: { argb: 'FF0070C0' } };
    sheet.getCell(`M${env.r1}`).numFmt = '0.00';

    sheet.mergeCells(`Q${env.r1}:V${env.r2}`);
    sheet.getCell(`Q${env.r1}`).value = env.end;
    sheet.getCell(`Q${env.r1}`).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell(`Q${env.r1}`).font = { size: 9, bold: true, color: { argb: 'FF0070C0' } };
    sheet.getCell(`Q${env.r1}`).numFmt = '0.00';

    applyRangeBorder(env.r1, env.r2, 7, 22);
  });
  applyRangeBorder(26, 27, 7, 22);

  // Row 35: Page 1 Break Divider
  sheet.mergeCells('B35:V35');
  sheet.getCell('B35').value = `--- 1-Sahifa oxiri (Excel Page 1 Break) ---    Протокол: ${info.certificateNumber || 'Uz-112/1-2025'}`;
  sheet.getCell('B35').font = { size: 9, bold: true, color: { argb: 'FF002060' } };
  sheet.getCell('B35').alignment = { horizontal: 'center', vertical: 'middle' };
  for (let c = 2; c <= 22; c++) {
    const colLetter = String.fromCharCode(64 + c);
    sheet.getCell(`${colLetter}35`).border = thickBluePageBreakBorder;
  }

  // =============================================================
  // PAGE 2: ROWS 37 TO 78 (Screenshot 2026-11-10 223903.png)
  // =============================================================
  sheet.mergeCells('B37:F37');
  sheet.getCell('B37').value = 'Результаты калибровки:';
  sheet.getCell('B37').font = { size: 10, bold: true };

  sheet.mergeCells('B38:V38');
  sheet.getCell('B38').value = `Точка калибровки    ${calculation.pointTemp || 30.0} °C`;
  sheet.getCell('B38').font = { size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getCell('B38').fill = greenHeaderFill;
  sheet.getCell('B38').alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(38).height = 22;

  // Step 1 Circle
  sheet.getCell('B40').value = '1';
  sheet.getCell('B40').font = { size: 12, bold: true, color: { argb: 'FF333333' } };
  sheet.getCell('B40').alignment = { horizontal: 'center', vertical: 'middle' };

  // 30 Readings Table Headers (Row 40)
  sheet.getCell('C40').value = '№';
  sheet.getCell('C40').font = { size: 9, bold: true };
  sheet.getCell('C40').fill = lightBlueFill;
  sheet.getCell('C40').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('D40:G40');
  sheet.getCell('D40').value = 'Показания\nэталона';
  sheet.getCell('D40').font = { size: 8.5, bold: true };
  sheet.getCell('D40').fill = lightBlueFill;
  sheet.getCell('D40').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('H40:L40');
  sheet.getCell('H40').value = 'Показания индикатора\nкалибруемого термостата';
  sheet.getCell('H40').font = { size: 8.5, bold: true };
  sheet.getCell('H40').fill = lightBlueFill;
  sheet.getCell('H40').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  applyRangeBorder(40, 40, 3, 12);

  // 30 Temperature Readings (Rows 41 to 70)
  const readings30 =
    calculation.readings30 && calculation.readings30.length === 30
      ? calculation.readings30
      : (pointsData[0]?.rows?.slice(0, 30) || []).map((r, i) => ({
          index: i + 1,
          tStd: Number(r.tStd) || 29.6,
          tInd: Number(r.tInd) || 30.0,
        }));

  for (let i = 1; i <= 30; i++) {
    const rowNum = 40 + i;
    const rItem = readings30[i - 1] || { index: i, tStd: 29.6, tInd: 30.0 };

    sheet.getCell(`C${rowNum}`).value = `T${i}`;
    sheet.getCell(`C${rowNum}`).font = { size: 8.5, bold: true };
    sheet.getCell(`C${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.mergeCells(`D${rowNum}:G${rowNum}`);
    const stdCell = sheet.getCell(`D${rowNum}`);
    stdCell.value = Number(rItem.tStd) || 29.6;
    stdCell.font = { size: 8.5 };
    stdCell.fill = yellowReadingFill;
    stdCell.numFmt = '0.00';
    stdCell.alignment = { horizontal: 'right', vertical: 'middle' };

    sheet.mergeCells(`H${rowNum}:L${rowNum}`);
    const indCell = sheet.getCell(`H${rowNum}`);
    indCell.value = Number(rItem.tInd) || 30.0;
    indCell.font = { size: 8.5 };
    indCell.numFmt = '0.0';
    indCell.alignment = { horizontal: 'right', vertical: 'middle' };

    applyRangeBorder(rowNum, rowNum, 3, 12);
  }

  // Row 71: Mean Tcp
  sheet.getCell('C71').value = 'Tcp';
  sheet.getCell('C71').font = { size: 9, bold: true };
  sheet.getCell('C71').fill = lightBlueFill;
  sheet.getCell('C71').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('D71:G71');
  sheet.getCell('D71').value = calculation.tCpStd || 29.6037;
  sheet.getCell('D71').font = { size: 8.5, bold: true };
  sheet.getCell('D71').fill = lightBlueFill;
  sheet.getCell('D71').numFmt = '0.0000';
  sheet.getCell('D71').alignment = { horizontal: 'right', vertical: 'middle' };

  sheet.mergeCells('H71:L71');
  sheet.getCell('H71').value = calculation.tCpInd || 29.967;
  sheet.getCell('H71').font = { size: 8.5, bold: true };
  sheet.getCell('H71').fill = lightBlueFill;
  sheet.getCell('H71').numFmt = '0.000';
  sheet.getCell('H71').alignment = { horizontal: 'right', vertical: 'middle' };
  applyRangeBorder(71, 71, 3, 12);

  // Row 72: u(T)
  sheet.getCell('C72').value = 'u(T)';
  sheet.getCell('C72').font = { size: 9, bold: true };
  sheet.getCell('C72').fill = yellowReadingFill;
  sheet.getCell('C72').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('D72:G72');
  sheet.getCell('D72').value = calculation.uTStd || 0.01025269;
  sheet.getCell('D72').font = { size: 8.5, bold: true };
  sheet.getCell('D72').fill = yellowReadingFill;
  sheet.getCell('D72').numFmt = '0.00000000';
  sheet.getCell('D72').alignment = { horizontal: 'right', vertical: 'middle' };

  sheet.mergeCells('H72:L72');
  sheet.getCell('H72').value = calculation.uTInd || 0.00875376;
  sheet.getCell('H72').font = { size: 8.5, bold: true };
  sheet.getCell('H72').fill = yellowReadingFill;
  sheet.getCell('H72').numFmt = '0.00000000';
  sheet.getCell('H72').alignment = { horizontal: 'right', vertical: 'middle' };
  applyRangeBorder(72, 72, 3, 12);

  // Row 75: Page 2 Break Divider
  sheet.mergeCells('B75:V75');
  sheet.getCell('B75').value = `--- 2-Sahifa oxiri (Excel Page 2 Break) ---    Протокол: ${info.certificateNumber || 'Uz-112/1-2025'}`;
  sheet.getCell('B75').font = { size: 9, bold: true, color: { argb: 'FF002060' } };
  sheet.getCell('B75').alignment = { horizontal: 'center', vertical: 'middle' };
  for (let c = 2; c <= 22; c++) {
    const colLetter = String.fromCharCode(64 + c);
    sheet.getCell(`${colLetter}75`).border = thickBluePageBreakBorder;
  }

  // =============================================================
  // PAGE 3: ROWS 77 TO 115 (Screenshot 2026-11-10 223916.png)
  // =============================================================
  sheet.getCell('B77').value = '2';
  sheet.getCell('B77').font = { size: 12, bold: true, color: { argb: 'FF333333' } };
  sheet.getCell('B77').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('C77:V77');
  sheet.getCell('C77').value = 'Определение неопределенности результатов калибровки';
  sheet.getCell('C77').font = { size: 10, bold: true };
  sheet.getCell('C77').alignment = { vertical: 'middle' };

  // Budget Table Headers (Row 79)
  sheet.mergeCells('B79:H79');
  sheet.getCell('B79').value = 'Источники неопределенности';
  sheet.getCell('B79').font = { size: 8.5, bold: true };
  sheet.getCell('B79').fill = lightBlueFill;
  sheet.getCell('B79').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.getCell('I79').value = 'Ед.';
  sheet.getCell('I79').font = { size: 8.5, bold: true };
  sheet.getCell('I79').fill = lightBlueFill;
  sheet.getCell('I79').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('J79:M79');
  sheet.getCell('J79').value = 'Стандартная неопределенност\nсвязанная, u(x_i)';
  sheet.getCell('J79').font = { size: 8, bold: true };
  sheet.getCell('J79').fill = lightBlueFill;
  sheet.getCell('J79').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('N79:O79');
  sheet.getCell('N79').value = 'Распределение\nвероятностей p(x_i)';
  sheet.getCell('N79').font = { size: 8, bold: true };
  sheet.getCell('N79').fill = lightBlueFill;
  sheet.getCell('N79').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.getCell('P79').value = 'Коэфф.\nC_i';
  sheet.getCell('P79').font = { size: 8, bold: true };
  sheet.getCell('P79').fill = lightBlueFill;
  sheet.getCell('P79').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('Q79:S79');
  sheet.getCell('Q79').value = 'Вклад в\nнеопределеность u_i(y)';
  sheet.getCell('Q79').font = { size: 8, bold: true };
  sheet.getCell('Q79').fill = lightBlueFill;
  sheet.getCell('Q79').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('T79:V79');
  sheet.getCell('T79').value = 'Анализ\nPareto\n(%, из 100)';
  sheet.getCell('T79').font = { size: 8, bold: true };
  sheet.getCell('T79').fill = cyanParetoFill;
  sheet.getCell('T79').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  applyRangeBorder(79, 79, 2, 22);

  // 10 Uncertainty Components (Rows 80 to 89)
  const budgetItems = [
    {
      name: 'Стандартная неопределенности эталонного термометра по типу А u(T_std)',
      unit: '°C',
      uVal: calculation.uTStd || 0.010252687,
      uFormat: '0.000000000',
      dist: 'нормал',
      c: 1,
      contrib: calculation.uTStd || 0.010252687,
      contribFormat: '0.00E+00',
      pareto: 5.2,
      isRed: false,
      isYellow: false,
    },
    {
      name: 'Стандартная неопределенности калибруемого термостата по типу А u(T_therm)',
      unit: '°C',
      uVal: calculation.uTInd || 0.008753762,
      uFormat: '0.000000000',
      dist: 'нормал',
      c: -1,
      contrib: -(calculation.uTInd || 0.008753762),
      contribFormat: '0.00E+00',
      pareto: -4.4,
      isRed: false,
      isYellow: false,
    },
    {
      name: 'СН от временной нестабильности калибруемого термостата, u(T_in,var)',
      unit: '°C',
      uVal: 5.3867e-2,
      uFormat: '0.0000E+00',
      dist: 'прямоуголь',
      c: 1,
      contrib: 5.39e-2,
      contribFormat: '0.00E+00',
      pareto: 27.3,
      isRed: false,
      isYellow: false,
    },
    {
      name: 'СН от пространственной неоднородности калибруемого термостата u(T_inhom)',
      unit: '°C',
      uVal: 4.06262e-2,
      uFormat: '0.00000E+00',
      dist: 'прямоуголь',
      c: 1,
      contrib: 4.06e-2,
      contribFormat: '0.00E+00',
      pareto: 20.6,
      isRed: false,
      isYellow: false,
    },
    {
      name: 'СН от радиационной эффекти калибруемого термостата u(T_radiation)',
      unit: '°C',
      uVal: 1.06232e-2,
      uFormat: '0.00000E+00',
      dist: 'прямоуголь',
      c: 1,
      contrib: 1.06e-2,
      contribFormat: '0.00E+00',
      pareto: 5.4,
      isRed: false,
      isYellow: false,
    },
    {
      name: 'СН от загруженного эффекта калибруемого термостата u(T_load)',
      unit: '°C',
      uVal: 0.011662,
      uFormat: '0.000000',
      dist: 'прямоуголь',
      c: 1,
      contrib: 1.17e-2,
      contribFormat: '0.00E+00',
      pareto: 5.9,
      isRed: false,
      isYellow: false,
    },
    {
      name: 'СН эталонного термометра u(δT_cal.std)',
      unit: '°C',
      uVal: 5.0e-2,
      uFormat: '0.00E+00',
      dist: 'нормал',
      c: 1,
      contrib: 5.0e-2,
      contribFormat: '0.00E+00',
      pareto: 25.3,
      isRed: true,
      isYellow: false,
    },
    {
      name: 'СН от разрешающего способности эталонного термометра, u(δT_rez.std)',
      unit: '°C',
      uVal: 2.89e-4,
      uFormat: '0.00E+00',
      dist: 'прямоуголь',
      c: 1,
      contrib: 2.89e-4,
      contribFormat: '0.00E+00',
      pareto: 0.1,
      isRed: false,
      isYellow: false,
    },
    {
      name: 'СН от разрешающего способности калибруемого термостата, u(δT_rez.therm)',
      unit: '°C',
      uVal: 2.88675e-2,
      uFormat: '0.00000E+00',
      dist: 'прямоуголь',
      c: 1,
      contrib: 2.89e-2,
      contribFormat: '0.00E+00',
      pareto: 14.6,
      isRed: true,
      isYellow: false,
    },
    {
      name: 'СН от временного дрейфа эталона Δd',
      unit: '°C',
      uVal: info.standardDrift ?? 0.0,
      uFormat: '0.00E+00',
      dist: 'прямоуголь',
      c: 1,
      contrib: 0.0,
      contribFormat: '0.00E+00',
      pareto: 0.0,
      isRed: false,
      isYellow: true,
    },
  ];

  budgetItems.forEach((b, idx) => {
    const rowNum = 80 + idx;

    sheet.mergeCells(`B${rowNum}:H${rowNum}`);
    sheet.getCell(`B${rowNum}`).value = b.name;
    sheet.getCell(`B${rowNum}`).font = { size: 8 };
    sheet.getCell(`B${rowNum}`).alignment = { vertical: 'middle' };

    sheet.getCell(`I${rowNum}`).value = b.unit;
    sheet.getCell(`I${rowNum}`).font = { size: 8 };
    sheet.getCell(`I${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.mergeCells(`J${rowNum}:M${rowNum}`);
    const uCell = sheet.getCell(`J${rowNum}`);
    uCell.value = b.uVal;
    uCell.font = { size: 8, color: b.isRed ? { argb: 'FFFF0000' } : undefined, bold: b.isYellow };
    uCell.numFmt = b.uFormat;
    uCell.alignment = { horizontal: 'right', vertical: 'middle' };
    if (b.isYellow) uCell.fill = yellowHighlightFill;

    sheet.mergeCells(`N${rowNum}:O${rowNum}`);
    sheet.getCell(`N${rowNum}`).value = b.dist;
    sheet.getCell(`N${rowNum}`).font = { size: 8 };
    sheet.getCell(`N${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.getCell(`P${rowNum}`).value = b.c;
    sheet.getCell(`P${rowNum}`).font = { size: 8 };
    sheet.getCell(`P${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.mergeCells(`Q${rowNum}:S${rowNum}`);
    const cCell = sheet.getCell(`Q${rowNum}`);
    cCell.value = b.contrib;
    cCell.font = { size: 8 };
    cCell.numFmt = b.contribFormat;
    cCell.alignment = { horizontal: 'right', vertical: 'middle' };

    sheet.mergeCells(`T${rowNum}:V${rowNum}`);
    const pCell = sheet.getCell(`T${rowNum}`);
    pCell.value = b.pareto;
    pCell.font = { size: 8 };
    pCell.numFmt = '0.0';
    pCell.alignment = { horizontal: 'right', vertical: 'middle' };
    pCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEBF5FB' },
    };

    applyRangeBorder(rowNum, rowNum, 2, 22);
  });

  // Summary Rows (Rows 90 to 93)
  // Row 90: Combined standard uncertainty u_c
  sheet.mergeCells('B90:I90');
  sheet.getCell('B90').value = 'Суммарная станд неопределенност, u_c(V20)';
  sheet.getCell('B90').font = { size: 8.5, bold: true };
  sheet.getCell('B90').fill = lightBlueFill;
  sheet.getCell('B90').alignment = { vertical: 'middle' };

  sheet.mergeCells('J90:S90');
  sheet.getCell('J90').value = calculation.u_c || 0.09119;
  sheet.getCell('J90').font = { size: 9, bold: true };
  sheet.getCell('J90').fill = lightBlueFill;
  sheet.getCell('J90').numFmt = '0.000E+00';
  sheet.getCell('J90').alignment = { horizontal: 'right', vertical: 'middle' };

  sheet.mergeCells('T90:V90');
  sheet.getCell('T90').value = 100.0;
  sheet.getCell('T90').font = { size: 8.5, bold: true };
  sheet.getCell('T90').fill = cyanParetoFill;
  sheet.getCell('T90').numFmt = '0.00';
  sheet.getCell('T90').alignment = { horizontal: 'center', vertical: 'middle' };
  applyRangeBorder(90, 90, 2, 22);

  // Row 91: Expanded uncertainty U
  sheet.mergeCells('B91:I91');
  sheet.getCell('B91').value = 'Расширенная неопределенность, U (V20)';
  sheet.getCell('B91').font = { size: 8.5, bold: true };
  sheet.getCell('B91').fill = lightBlueFill;
  sheet.getCell('B91').alignment = { vertical: 'middle' };

  sheet.mergeCells('J91:P91');
  sheet.getCell('J91').value = 'коэффицент охвата k = 2 (P = 95 %), mL';
  sheet.getCell('J91').font = { size: 8 };
  sheet.getCell('J91').fill = lightBlueFill;
  sheet.getCell('J91').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('Q91:V91');
  sheet.getCell('Q91').value = calculation.U || 0.1823858;
  sheet.getCell('Q91').font = { size: 10, bold: true, color: { argb: 'FF107C41' } };
  sheet.getCell('Q91').numFmt = '0.0000000';
  sheet.getCell('Q91').alignment = { horizontal: 'right', vertical: 'middle' };
  applyRangeBorder(91, 91, 2, 22);

  // Row 92: Coverage factor Veff
  sheet.mergeCells('B92:P92');
  sheet.getCell('B92').value = 'Коэффициент покрытия V_eff(V20)';
  sheet.getCell('B92').font = { size: 8.5, bold: true };
  sheet.getCell('B92').alignment = { vertical: 'middle' };

  sheet.mergeCells('Q92:V92');
  sheet.getCell('Q92').value = calculation.v_eff || 8374.8;
  sheet.getCell('Q92').font = { size: 9, bold: true };
  sheet.getCell('Q92').fill = yellowHighlightFill;
  sheet.getCell('Q92').alignment = { horizontal: 'center', vertical: 'middle' };
  applyRangeBorder(92, 92, 2, 22);

  // Row 93: Correction Delta T
  sheet.mergeCells('B93:P93');
  sheet.getCell('B93').value = 'Поправка показания калибруемого термостата ΔT_thermostat';
  sheet.getCell('B93').font = { size: 8.5, bold: true };
  sheet.getCell('B93').alignment = { vertical: 'middle' };

  sheet.mergeCells('Q93:V93');
  sheet.getCell('Q93').value = calculation.deviation ? -calculation.deviation : -0.363;
  sheet.getCell('Q93').font = { size: 9, bold: true };
  sheet.getCell('Q93').fill = yellowHighlightFill;
  sheet.getCell('Q93').numFmt = '0.0000';
  sheet.getCell('Q93').alignment = { horizontal: 'center', vertical: 'middle' };
  applyRangeBorder(93, 93, 2, 22);

  // Row 96: Page 3 Break Divider
  sheet.mergeCells('B96:V96');
  sheet.getCell('B96').value = `--- 3-Sahifa oxiri (Excel Page 3 Break) ---    Протокол: ${info.certificateNumber || 'Uz-112/1-2025'}`;
  sheet.getCell('B96').font = { size: 9, bold: true, color: { argb: 'FF002060' } };
  sheet.getCell('B96').alignment = { horizontal: 'center', vertical: 'middle' };
  for (let c = 2; c <= 22; c++) {
    const colLetter = String.fromCharCode(64 + c);
    sheet.getCell(`${colLetter}96`).border = thickBluePageBreakBorder;
  }

  // =============================================================
  // PAGE 4/5: ROWS 98 TO 130 (Screenshot 2026-11-10 223927.png)
  // =============================================================
  sheet.mergeCells('B98:V98');
  sheet.getCell('B98').value = 'Результаты калибровки';
  sheet.getCell('B98').font = { size: 10, bold: true, color: { argb: 'FF0070C0' } };

  // 5-Column Calibration Results Summary Table (Row 100)
  sheet.mergeCells('B100:E101');
  sheet.getCell('B100').value = 'Калибруемая точка, °C';
  sheet.getCell('B100').font = { size: 8.5, bold: true };
  sheet.getCell('B100').fill = softGrayFill;
  sheet.getCell('B100').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('F100:I101');
  sheet.getCell('F100').value = 'Опорное значение, °C';
  sheet.getCell('F100').font = { size: 8.5, bold: true };
  sheet.getCell('F100').fill = softGrayFill;
  sheet.getCell('F100').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('J100:M101');
  sheet.getCell('J100').value = 'Показание объекта калибровки, °C';
  sheet.getCell('J100').font = { size: 8.5, bold: true };
  sheet.getCell('J100').fill = softGrayFill;
  sheet.getCell('J100').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('N100:Q101');
  sheet.getCell('N100').value = 'Отклонение показаний, °C';
  sheet.getCell('N100').font = { size: 8.5, bold: true };
  sheet.getCell('N100').fill = softGrayFill;
  sheet.getCell('N100').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('R100:V101');
  sheet.getCell('R100').value = 'Расширенная неопределенность U, °C';
  sheet.getCell('R100').font = { size: 8.5, bold: true };
  sheet.getCell('R100').fill = softGrayFill;
  sheet.getCell('R100').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  // Actual Values (Row 102)
  sheet.mergeCells('B102:E103');
  sheet.getCell('B102').value = calculation.pointTemp || 30.0;
  sheet.getCell('B102').font = { size: 10, bold: true };
  sheet.getCell('B102').numFmt = '0.0';
  sheet.getCell('B102').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('F102:I103');
  sheet.getCell('F102').value = calculation.centerStdMean || 29.59;
  sheet.getCell('F102').font = { size: 10, bold: true };
  sheet.getCell('F102').numFmt = '0.00';
  sheet.getCell('F102').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('J102:M103');
  sheet.getCell('J102').value = calculation.overallIndMean > 0 ? calculation.overallIndMean : 29.97;
  sheet.getCell('J102').font = { size: 10, bold: true, color: { argb: 'FF107C41' } };
  sheet.getCell('J102').numFmt = '0.00';
  sheet.getCell('J102').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('N102:Q103');
  sheet.getCell('N102').value = calculation.deviation || -0.37;
  sheet.getCell('N102').font = { size: 10, bold: true };
  sheet.getCell('N102').numFmt = '0.00';
  sheet.getCell('N102').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('R102:V103');
  sheet.getCell('R102').value = calculation.U || 0.18;
  sheet.getCell('R102').font = { size: 10, bold: true };
  sheet.getCell('R102').numFmt = '0.00';
  sheet.getCell('R102').alignment = { horizontal: 'center', vertical: 'middle' };
  applyRangeBorder(100, 103, 2, 22);

  // Measurement Uncertainty Statement (Rows 105 to 108)
  sheet.mergeCells('B105:F108');
  sheet.getCell('B105').value = 'Неопределенность измерений\nMeasurement uncertainty';
  sheet.getCell('B105').font = { size: 8.5, bold: true };
  sheet.getCell('B105').alignment = { vertical: 'middle', wrapText: true };

  sheet.mergeCells('G105:V108');
  sheet.getCell('G105').value =
    'Расширенная неопределенность получена путем умножения стандартной неопределенности на коэффициент охвата k = 2, соответствующего уровню доверия приблизительно 95 % при допущении нормального распределения.\n\nThe reported expanded uncertainty of measurement is stated as the standard uncertainty of measurement multiplied by the coverage factor k = 2, which corresponds to a coverage probability of approx. 95 % assuming normal distribution.';
  sheet.getCell('G105').font = { size: 8 };
  sheet.getCell('G105').alignment = { vertical: 'middle', wrapText: true };
  applyRangeBorder(105, 108, 2, 22);

  // Conclusions Box (Rows 110 to 112)
  sheet.mergeCells('B110:V112');
  sheet.getCell('B110').value =
    'Выводы:\nСушильные шкаф соответствует требованиям метрологических норм методики KU-10-2025.\nConclusions: Temperature drying oven complies with metrological norms of KU-10-2025.';
  sheet.getCell('B110').font = { size: 8.5 };
  sheet.getCell('B110').alignment = { vertical: 'middle', wrapText: true };
  applyRangeBorder(110, 112, 2, 22);

  // Performer Signature Line (Rows 114 to 116)
  sheet.mergeCells('B114:F114');
  sheet.getCell('B114').value = 'Лицо, выполнившее калибровку:';
  sheet.getCell('B114').font = { size: 9, bold: true };

  sheet.mergeCells('B115:F115');
  sheet.getCell('B115').value = 'Person performing the calibration:';
  sheet.getCell('B115').font = { size: 8, italic: true };

  sheet.mergeCells('G114:V115');
  sheet.getCell('G114').value = info.calibratedByUz || "G'aibnazarov Boburjon";
  sheet.getCell('G114').font = { size: 11, bold: true, color: { argb: 'FF0070C0' } };
  sheet.getCell('G114').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell('G114').border = { bottom: { style: 'thin', color: { argb: 'FF000000' } } };

  // End of Protocol Banner (Rows 118 to 119)
  sheet.mergeCells('B118:V118');
  sheet.getCell('B118').value = 'КОНЕЦ ПРОТОКОЛА КАЛИБРОВКИ';
  sheet.getCell('B118').font = { size: 12, bold: true };
  sheet.getCell('B118').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('B119:V119');
  sheet.getCell('B119').value = 'END OF CALIBRATION REPORT';
  sheet.getCell('B119').font = { size: 10, italic: true };
  sheet.getCell('B119').alignment = { horizontal: 'center', vertical: 'middle' };

  const fileName = `Bayonnoma_${(info.certificateNumber || 'Uz-112-1-2025').replace(/[\/\\]/g, '_')}_${info.serialNumber || '2333001557'}.xlsx`;
  await saveWorkbook(workbook, fileName);
}

/**
 * Export Official 4-page Certificate into authentic Excel (.xlsx) workbook
 * CRITICAL REQUIREMENT: Placed on the FIRST SHEET ("Сертификат" / "Лист 1")
 * exactly matching rows 1 to 180 and columns A to V from user screenshots!
 */
export async function exportCertificateToExcel(
  info: CalibrationItemInfo,
  calculation: ChamberCalculation,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pointsData: ChamberPointData[]
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "O'zbekiston Milliy Metrologiya Instituti";
  workbook.lastModifiedBy = info.calibratedByUz || "G'aibnazarov Boburjon";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Try to load logo and QR code base64 in browser
  const logoBase64 = await fetchBase64FromUrl('/assets/aistudio/logo_4dc60d18.png');
  const qrBase64 = await fetchBase64FromUrl('/assets/aistudio/qr-code_2e7a8d81.png');

  // Styles matching user screenshots
  const thinBlackBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  };

  const thickBluePageBreakBorder: Partial<ExcelJS.Borders> = {
    bottom: { style: 'medium', color: { argb: 'FF002060' } },
  };

  const dashedBottomBorder: Partial<ExcelJS.Borders> = {
    bottom: { style: 'dashed', color: { argb: 'FF000000' } },
  };

  const grayHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF2F2F2' },
  };

  // ==============================================================
  // FIRST SHEET: Complete 4-page continuous layout (Rows 1 to 180)
  // ==============================================================
  const sheet = workbook.addWorksheet('Сертификат', {
    views: [{ showGridLines: true }],
  });

  // 22 Columns (A to V) matching screenshots
  sheet.columns = [
    { width: 4 },    // A
    { width: 5.5 },  // B
    { width: 5.5 },  // C
    { width: 5.5 },  // D
    { width: 5.5 },  // E
    { width: 5.5 },  // F
    { width: 5.5 },  // G
    { width: 5.5 },  // H
    { width: 5.5 },  // I
    { width: 5.5 },  // J
    { width: 5.5 },  // K
    { width: 5.5 },  // L
    { width: 5.5 },  // M
    { width: 5.5 },  // N
    { width: 5.5 },  // O
    { width: 5.5 },  // P
    { width: 5.5 },  // Q
    { width: 5.5 },  // R
    { width: 5.5 },  // S
    { width: 7.5 },  // T
    { width: 7.5 },  // U
    { width: 7.5 },  // V
  ];

  const certNo = info.certificateNumber || 'Uz-112/1-2025';
  const issueDate = info.issueDate || '2025-04-29';
  const serialNo = info.serialNumber || '2333001557';
  const model = info.objectType || 'RTOP-500Y';
  const itemNameRu = info.objectName || 'Сушильные шкаф (Quritish shkafi)';
  const customer = info.customerName || '-';
  const performer = info.calibratedByUz || "G'aibnazarov Boburjon";

  // Embed Logo on Page 1 (B1:G5)
  if (logoBase64) {
    try {
      const logoId = workbook.addImage({ base64: logoBase64, extension: 'png' });
      sheet.addImage(logoId, 'B1:G5');
    } catch (e) {
      console.warn('Could not add logo image to sheet', e);
    }
  }

  // -------------------------------------------------------------
  // PAGE 1: ROWS 1 TO 46
  // -------------------------------------------------------------
  // Header text H1:S5
  sheet.mergeCells('H1:S2');
  sheet.getCell('H1').value = 'Хорезмский филиал ГУ «Узбекский национальный институт метрологии»';
  sheet.getCell('H1').font = { bold: true, size: 10 };
  sheet.getCell('H1').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('H3:S5');
  sheet.getCell('H3').value = '"Uzbek National Institute of Metrology" state institution Khorezm branch';
  sheet.getCell('H3').font = { italic: true, size: 9 };
  sheet.getCell('H3').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  // Top-Right 3-Row Box T1:V5
  sheet.mergeCells('T1:V2');
  sheet.getCell('T1').value = certNo;
  sheet.getCell('T1').font = { bold: true, size: 10 };
  sheet.getCell('T1').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('T3:V4');
  sheet.getCell('T3').value = "O'ZAK.KL.0013";
  sheet.getCell('T3').font = { bold: true, size: 10 };
  sheet.getCell('T3').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('T5:V5');
  sheet.getCell('T5').value = issueDate;
  sheet.getCell('T5').font = { size: 9.5 };
  sheet.getCell('T5').alignment = { horizontal: 'center', vertical: 'middle' };

  ['T1', 'U1', 'V1', 'T2', 'U2', 'V2', 'T3', 'U3', 'V4', 'T5', 'U5', 'V5'].forEach((c) => {
    sheet.getCell(c).border = thinBlackBorder;
  });

  // Certificate Title (Rows 7-10)
  sheet.mergeCells('H7:Q8');
  sheet.getCell('H7').value = 'Сертификат калибровки';
  sheet.getCell('H7').font = { bold: true, size: 14 };
  sheet.getCell('H7').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('H9:Q10');
  sheet.getCell('H9').value = 'Calibration certificate';
  sheet.getCell('H9').font = { italic: true, size: 11 };
  sheet.getCell('H9').alignment = { horizontal: 'center', vertical: 'middle' };

  // 3-Column Metadata Box (Rows 12-14)
  sheet.mergeCells('B12:E12');
  sheet.getCell('B12').value = 'Дата выдачи:';
  sheet.getCell('B12').font = { bold: true, size: 10 };
  sheet.getCell('B12').alignment = { horizontal: 'center' };

  sheet.mergeCells('B13:E13');
  sheet.getCell('B13').value = 'Date of issue:';
  sheet.getCell('B13').font = { italic: true, size: 9 };
  sheet.getCell('B13').alignment = { horizontal: 'center' };

  sheet.mergeCells('B14:E14');
  sheet.getCell('B14').value = issueDate;
  sheet.getCell('B14').font = { size: 10 };
  sheet.getCell('B14').alignment = { horizontal: 'center' };

  sheet.mergeCells('F12:Q12');
  sheet.getCell('F12').value = 'Номер сертификата:';
  sheet.getCell('F12').font = { bold: true, size: 10 };
  sheet.getCell('F12').alignment = { horizontal: 'center' };

  sheet.mergeCells('F13:Q13');
  sheet.getCell('F13').value = 'Certificate number:';
  sheet.getCell('F13').font = { italic: true, size: 9 };
  sheet.getCell('F13').alignment = { horizontal: 'center' };

  sheet.mergeCells('F14:Q14');
  sheet.getCell('F14').value = certNo;
  sheet.getCell('F14').font = { bold: true, size: 10 };
  sheet.getCell('F14').alignment = { horizontal: 'center' };

  sheet.mergeCells('R12:V12');
  sheet.getCell('R12').value = 'Количество страниц:';
  sheet.getCell('R12').font = { bold: true, size: 10 };
  sheet.getCell('R12').alignment = { horizontal: 'center' };

  sheet.mergeCells('R13:V13');
  sheet.getCell('R13').value = 'Number of pages:';
  sheet.getCell('R13').font = { italic: true, size: 9 };
  sheet.getCell('R13').alignment = { horizontal: 'center' };

  sheet.mergeCells('R14:V14');
  sheet.getCell('R14').value = 4;
  sheet.getCell('R14').font = { bold: true, size: 10 };
  sheet.getCell('R14').alignment = { horizontal: 'center' };

  // Dashed border under row 14
  for (let c = 2; c <= 22; c++) {
    const colName = String.fromCharCode(64 + c);
    sheet.getCell(`${colName}14`).border = dashedBottomBorder;
  }

  // Key-Value Rows 16 to 27
  sheet.mergeCells('B16:G16');
  sheet.getCell('B16').value = 'Объект калибровки:';
  sheet.getCell('B16').font = { bold: true, size: 10 };

  sheet.mergeCells('B17:G17');
  sheet.getCell('B17').value = 'Calibration item:';
  sheet.getCell('B17').font = { italic: true, size: 9 };

  sheet.mergeCells('H16:V16');
  sheet.getCell('H16').value = itemNameRu;
  sheet.getCell('H16').font = { bold: true, size: 10 };

  sheet.mergeCells('H17:V17');
  sheet.getCell('H17').value = 'Temperature chamber (Drying oven)';
  sheet.getCell('H17').font = { italic: true, size: 9 };

  sheet.mergeCells('B19:G19');
  sheet.getCell('B19').value = 'Производитель:';
  sheet.getCell('B19').font = { bold: true, size: 10 };

  sheet.mergeCells('B20:G20');
  sheet.getCell('B20').value = 'Manufacturer:';
  sheet.getCell('B20').font = { italic: true, size: 9 };

  sheet.mergeCells('H19:V20');
  sheet.getCell('H19').value = info.manufacturer || 'Китай (CN)';
  sheet.getCell('H19').alignment = { vertical: 'middle' };

  sheet.mergeCells('B21:G21');
  sheet.getCell('B21').value = 'Тип (модель, серия):';
  sheet.getCell('B21').font = { bold: true, size: 10 };

  sheet.mergeCells('B22:G22');
  sheet.getCell('B22').value = 'Type (model, series):';
  sheet.getCell('B22').font = { italic: true, size: 9 };

  sheet.mergeCells('H21:V22');
  sheet.getCell('H21').value = model;
  sheet.getCell('H21').alignment = { vertical: 'middle' };

  sheet.mergeCells('B23:G23');
  sheet.getCell('B23').value = 'Серийный номер:';
  sheet.getCell('B23').font = { bold: true, size: 10 };

  sheet.mergeCells('B24:G24');
  sheet.getCell('B24').value = 'Serial number:';
  sheet.getCell('B24').font = { italic: true, size: 9 };

  sheet.mergeCells('H23:V24');
  sheet.getCell('H23').value = serialNo;
  sheet.getCell('H23').alignment = { vertical: 'middle' };

  sheet.mergeCells('B25:G25');
  sheet.getCell('B25').value = 'Заказчик:';
  sheet.getCell('B25').font = { bold: true, size: 10 };

  sheet.mergeCells('B26:G26');
  sheet.getCell('B26').value = 'Customer:';
  sheet.getCell('B26').font = { italic: true, size: 9 };

  sheet.mergeCells('H25:V27');
  sheet.getCell('H25').value = customer;
  sheet.getCell('H25').alignment = { vertical: 'middle' };

  // Red Box B31:G39
  sheet.mergeCells('B31:G39');
  const redCell = sheet.getCell('B31');
  redCell.value =
    'Сертификат калибровки рассматривается как недействительный без сгенерированного системой e-metrologiya.uz листа, содержащего ссылку на него\n\nThe calibration certificate is considered invalid without a sheet generated by the e-metrologiya.uz system containing a link to it';
  redCell.font = { color: { argb: 'FFFF0000' }, size: 8, bold: true };
  redCell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };
  for (let r = 31; r <= 39; r++) {
    for (let c = 2; c <= 7; c++) {
      const colLetter = String.fromCharCode(64 + c);
      sheet.getCell(`${colLetter}${r}`).border = {
        top: { style: 'thin', color: { argb: 'FFFF0000' } },
        bottom: { style: 'thin', color: { argb: 'FFFF0000' } },
        left: { style: 'thin', color: { argb: 'FFFF0000' } },
        right: { style: 'thin', color: { argb: 'FFFF0000' } },
      };
    }
  }

  // Right Signatures H31:S38
  sheet.mergeCells('H31:S31');
  sheet.getCell('H31').value = 'Калибровку выполнил:';
  sheet.getCell('H31').font = { bold: true, size: 10 };

  sheet.mergeCells('H32:S32');
  sheet.getCell('H32').value = 'Calibration performed by:';
  sheet.getCell('H32').font = { italic: true, size: 9 };

  sheet.mergeCells('H34:S34');
  sheet.getCell('H34').value = performer;
  sheet.getCell('H34').font = { bold: true, size: 11 };
  sheet.getCell('H34').border = { bottom: { style: 'thin', color: { argb: 'FF000000' } } };

  sheet.mergeCells('H36:S38');
  const repBox = sheet.getCell('H36');
  repBox.value =
    'Сертификат калибровки не может быть воспроизведен, кроме как в полном объеме\nCalibration certificate shall not be reproduced except in full';
  repBox.font = { size: 8, bold: true };
  repBox.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  for (let r = 36; r <= 38; r++) {
    for (let c = 8; c <= 19; c++) {
      const colLetter = String.fromCharCode(64 + c);
      sheet.getCell(`${colLetter}${r}`).border = thinBlackBorder;
    }
  }

  // Row 46: Thick Blue Page Break Line
  for (let c = 2; c <= 22; c++) {
    const colLetter = String.fromCharCode(64 + c);
    sheet.getCell(`${colLetter}46`).border = thickBluePageBreakBorder;
  }

  // -------------------------------------------------------------
  // PAGE 2: ROWS 47 TO 87
  // -------------------------------------------------------------
  sheet.mergeCells('H48:S49');
  sheet.getCell('H48').value =
    'Хорезмский филиал ГУ «Узбекский национальный институт метрологии»\n"Uzbek National Institute of Metrology" state institution Khorezm branch';
  sheet.getCell('H48').font = { bold: true, size: 9 };
  sheet.getCell('H48').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('T48:V49');
  sheet.getCell('T48').value = certNo;
  sheet.getCell('T48').font = { bold: true };
  sheet.getCell('T48').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('T50:V51');
  sheet.getCell('T50').value = "O'ZAK.KL.0013";
  sheet.getCell('T50').font = { bold: true };
  sheet.getCell('T50').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('T52:V52');
  sheet.getCell('T52').value = issueDate;
  sheet.getCell('T52').alignment = { horizontal: 'center', vertical: 'middle' };

  ['T48', 'U48', 'V48', 'T49', 'U49', 'V49', 'T50', 'U50', 'V50', 'T51', 'U51', 'V51', 'T52', 'U52', 'V52'].forEach((c) => {
    sheet.getCell(c).border = thinBlackBorder;
  });

  sheet.mergeCells('B50:G50');
  sheet.getCell('B50').value = 'Номер сертификата:';
  sheet.getCell('B50').font = { bold: true };

  sheet.mergeCells('B51:G51');
  sheet.getCell('B51').value = 'Certificate number:';
  sheet.getCell('B51').font = { italic: true };

  sheet.mergeCells('H50:L51');
  sheet.getCell('H50').value = certNo;
  sheet.getCell('H50').font = { bold: true };
  sheet.getCell('H50').alignment = { vertical: 'middle' };

  sheet.mergeCells('M50:P50');
  sheet.getCell('M50').value = 'Страница:';
  sheet.getCell('M50').font = { bold: true };

  sheet.mergeCells('M51:P51');
  sheet.getCell('M51').value = 'Page:';
  sheet.getCell('M51').font = { italic: true };

  sheet.mergeCells('Q50:R51');
  sheet.getCell('Q50').value = 2;
  sheet.getCell('Q50').font = { bold: true };
  sheet.getCell('Q50').alignment = { vertical: 'middle' };

  // Page 2 Details
  sheet.mergeCells('B54:G54');
  sheet.getCell('B54').value = 'Запрос на калибровку:';
  sheet.getCell('B54').font = { bold: true };

  sheet.mergeCells('B55:G55');
  sheet.getCell('B55').value = 'Calibration request:';
  sheet.getCell('B55').font = { italic: true };

  sheet.mergeCells('H54:I55');
  sheet.getCell('H54').value = 'от from';
  sheet.getCell('H54').alignment = { vertical: 'middle' };

  sheet.mergeCells('J54:K55');
  sheet.getCell('J54').value = info.orderNumber || '-';
  sheet.getCell('J54').alignment = { vertical: 'middle' };

  sheet.mergeCells('B56:G56');
  sheet.getCell('B56').value = 'Период калибровки:';
  sheet.getCell('B56').font = { bold: true };

  sheet.mergeCells('B57:G57');
  sheet.getCell('B57').value = 'Calibration period:';
  sheet.getCell('B57').font = { italic: true };

  sheet.mergeCells('H56:K57');
  sheet.getCell('H56').value = info.calibrationPeriod || issueDate;
  sheet.getCell('H56').alignment = { vertical: 'middle' };

  sheet.mergeCells('B58:G59');
  sheet.getCell('B58').value = 'Наименование лаборатории:';
  sheet.getCell('B58').font = { bold: true };

  sheet.mergeCells('B60:G61');
  sheet.getCell('B60').value = 'Name of laboratory:';
  sheet.getCell('B60').font = { italic: true };

  sheet.mergeCells('H58:V61');
  sheet.getCell('H58').value =
    'Лаборатория сравнения и калибровки физико-химических приборов, измерителей плотности, давления и температуры\nLaboratory for comparison and calibration of physical and chemical instruments, density, pressure and temperature meters';
  sheet.getCell('H58').alignment = { wrapText: true, vertical: 'middle' };

  sheet.mergeCells('B62:G64');
  sheet.getCell('B62').value = 'Место осуществления измерений:';
  sheet.getCell('B62').font = { bold: true };

  sheet.mergeCells('B65:G68');
  sheet.getCell('B65').value = 'Location of performance of measurement:';
  sheet.getCell('B65').font = { italic: true };

  sheet.mergeCells('H62:V68');
  sheet.getCell('H62').value =
    'Хорезмский филиал ГУ «Узбекский национальный институт метрологии»\nРеспублика Узбекистан, Хорезмская область, город Ургенч, улица Ханкинская, 107Б, тел: +998 78 770-46-15, www.nim.uz\n"Uzbek National Institute of Metrology" state institution Khorezm branch\n107B, Khonqa street, the city of Urgench, Khorezm region, Republic of Uzbekistan, tel: +998 78 770-46-15, www.nim.uz';
  sheet.getCell('H62').alignment = { wrapText: true, vertical: 'middle' };

  // Environmental Conditions Table Rows 72 to 82
  sheet.mergeCells('B70:G70');
  sheet.getCell('B70').value = 'Условия калибровки:';
  sheet.getCell('B70').font = { bold: true };

  sheet.mergeCells('B71:G71');
  sheet.getCell('B71').value = 'Calibration conditions:';
  sheet.getCell('B71').font = { italic: true };

  sheet.mergeCells('B72:L73');
  sheet.getCell('B72').value = 'Контролируемые показатели\nControlled indicators';
  sheet.getCell('B72').font = { bold: true };
  sheet.getCell('B72').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell('B72').fill = grayHeaderFill;

  sheet.mergeCells('M72:O73');
  sheet.getCell('M72').value = 'от\nfrom';
  sheet.getCell('M72').font = { bold: true };
  sheet.getCell('M72').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell('M72').fill = grayHeaderFill;

  sheet.mergeCells('P72:Q73');
  sheet.getCell('P72').value = 'до\nto';
  sheet.getCell('P72').font = { bold: true };
  sheet.getCell('P72').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell('P72').fill = grayHeaderFill;

  sheet.mergeCells('R72:V73');
  sheet.getCell('R72').value = 'Примечание\nRemark';
  sheet.getCell('R72').font = { bold: true };
  sheet.getCell('R72').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell('R72').fill = grayHeaderFill;

  const envTableRows = [
    {
      title: 'Температура окружающего воздуха, °C\nAmbient temperature, °C',
      from: info.ambientTempMin ?? 24.0,
      to: info.ambientTempMax ?? 24.5,
      remark: 'в пределах 1,0 °C в 24 h\nwithin 1,0 °C in 24 h',
      r1: 74,
      r2: 76,
    },
    {
      title: 'Относительная влажность окружающей среды, %\nAmbient relative humidity, %',
      from: info.relativeHumidityMin ?? 37.7,
      to: info.relativeHumidityMax ?? 38.5,
      remark: 'в пределах 10 % в 24 h\nwithin 10 % in 24 h',
      r1: 77,
      r2: 79,
    },
    {
      title: 'Атмосферное давление, hPa\nAir pressure, hPa',
      from: info.atmosphericPressureMin ?? 1012.2,
      to: info.atmosphericPressureMax ?? 1013.0,
      remark: 'в пределах ±8 hPa в 24 h\nwithin to ±8 hPa in 24 h',
      r1: 80,
      r2: 82,
    },
  ];

  envTableRows.forEach(({ title, from, to, remark, r1, r2 }) => {
    sheet.mergeCells(`B${r1}:L${r2}`);
    sheet.getCell(`B${r1}`).value = title;
    sheet.getCell(`B${r1}`).alignment = { vertical: 'middle', wrapText: true };

    sheet.mergeCells(`M${r1}:O${r2}`);
    sheet.getCell(`M${r1}`).value = from;
    sheet.getCell(`M${r1}`).alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.mergeCells(`P${r1}:Q${r2}`);
    sheet.getCell(`P${r1}`).value = to;
    sheet.getCell(`P${r1}`).alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.mergeCells(`R${r1}:V${r2}`);
    sheet.getCell(`R${r1}`).value = remark;
    sheet.getCell(`R${r1}`).alignment = { vertical: 'middle', wrapText: true };

    for (let r = r1; r <= r2; r++) {
      for (let c = 2; c <= 22; c++) {
        const colLetter = String.fromCharCode(64 + c);
        sheet.getCell(`${colLetter}${r}`).border = thinBlackBorder;
      }
    }
  });

  // Row 87: Thick Blue Page Break Line
  for (let c = 2; c <= 22; c++) {
    const colLetter = String.fromCharCode(64 + c);
    sheet.getCell(`${colLetter}87`).border = thickBluePageBreakBorder;
  }

  // -------------------------------------------------------------
  // PAGE 3: ROWS 88 TO 124
  // -------------------------------------------------------------
  sheet.mergeCells('H88:S89');
  sheet.getCell('H88').value =
    'Хорезмский филиал ГУ «Узбекский национальный институт метрологии»\n"Uzbek National Institute of Metrology" state institution Khorezm branch';
  sheet.getCell('H88').font = { bold: true, size: 9 };
  sheet.getCell('H88').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('T88:V89');
  sheet.getCell('T88').value = certNo;
  sheet.getCell('T88').font = { bold: true };
  sheet.getCell('T88').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('T90:V91');
  sheet.getCell('T90').value = "O'ZAK.KL.0013";
  sheet.getCell('T90').font = { bold: true };
  sheet.getCell('T90').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('T92:V92');
  sheet.getCell('T92').value = issueDate;
  sheet.getCell('T92').alignment = { horizontal: 'center', vertical: 'middle' };

  ['T88', 'U88', 'V88', 'T89', 'U89', 'V89', 'T90', 'U90', 'V90', 'T91', 'U91', 'V91', 'T92', 'U92', 'V92'].forEach((c) => {
    sheet.getCell(c).border = thinBlackBorder;
  });

  sheet.mergeCells('B90:G90');
  sheet.getCell('B90').value = 'Номер сертификата: Certificate number:';
  sheet.getCell('B90').font = { bold: true };

  sheet.mergeCells('H90:L91');
  sheet.getCell('H90').value = certNo;
  sheet.getCell('H90').font = { bold: true };
  sheet.getCell('H90').alignment = { vertical: 'middle' };

  sheet.mergeCells('M90:P90');
  sheet.getCell('M90').value = 'Страница: Page:';
  sheet.getCell('M90').font = { bold: true };

  sheet.mergeCells('Q90:R91');
  sheet.getCell('Q90').value = 3;
  sheet.getCell('Q90').font = { bold: true };
  sheet.getCell('Q90').alignment = { vertical: 'middle' };

  sheet.mergeCells('B93:G93');
  sheet.getCell('B93').value = 'Метод и калибровочная процедура:';
  sheet.getCell('B93').font = { bold: true };

  sheet.mergeCells('B94:G94');
  sheet.getCell('B94').value = 'Method and calibration procedure:';
  sheet.getCell('B94').font = { italic: true };

  sheet.mergeCells('B95:V96');
  sheet.getCell('B95').value =
    'KU-10-2025. Камера температуры (сушильные шкафы). Методика калибровки.\nEURAMET Calibration Guide No. 20 Версия 5.0 Calibration of Temperature and/or Humidity Enclosures.';
  sheet.getCell('B95').alignment = { wrapText: true };

  sheet.mergeCells('B98:G98');
  sheet.getCell('B98').value = 'Калибровка выполнена с помощью:';
  sheet.getCell('B98').font = { bold: true };

  sheet.mergeCells('B99:G99');
  sheet.getCell('B99').value = 'Calibration is performed by using:';
  sheet.getCell('B99').font = { italic: true };

  // Reference Standards Table (Rows 100-115)
  sheet.mergeCells('B100:B103');
  sheet.getCell('B100').value = '№';
  sheet.getCell('B100').font = { bold: true };
  sheet.getCell('B100').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell('B100').fill = grayHeaderFill;

  sheet.mergeCells('C100:H103');
  sheet.getCell('C100').value = 'Опорный измерительный эталон\nReference measurement standart';
  sheet.getCell('C100').font = { bold: true };
  sheet.getCell('C100').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell('C100').fill = grayHeaderFill;

  sheet.mergeCells('I100:K103');
  sheet.getCell('I100').value = 'Тип / Модель\nType / Model';
  sheet.getCell('I100').font = { bold: true };
  sheet.getCell('I100').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell('I100').fill = grayHeaderFill;

  sheet.mergeCells('L100:N103');
  sheet.getCell('L100').value = 'Серийный номер\nSerial Number';
  sheet.getCell('L100').font = { bold: true };
  sheet.getCell('L100').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell('L100').fill = grayHeaderFill;

  sheet.mergeCells('O100:V103');
  sheet.getCell('O100').value = 'Метрологическая прослеживаемость\nMetrological traceability';
  sheet.getCell('O100').font = { bold: true };
  sheet.getCell('O100').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell('O100').fill = grayHeaderFill;

  // Standard 1
  sheet.mergeCells('B104:B107');
  sheet.getCell('B104').value = 1;
  sheet.getCell('B104').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('C104:H107');
  sheet.getCell('C104').value = 'Термометр лабораторный электронный\nElectronic laboratory thermometer';
  sheet.getCell('C104').alignment = { vertical: 'middle', wrapText: true };

  sheet.mergeCells('I104:K107');
  sheet.getCell('I104').value = info.standardType || 'ЛТА/Б-300МТ';
  sheet.getCell('I104').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('L104:N107');
  sheet.getCell('L104').value = info.standardSerial || '871352';
  sheet.getCell('L104').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('O104:V107');
  sheet.getCell('O104').value = 'UZ-09T/2927-2024\nот 07.11.2024 г.';
  sheet.getCell('O104').alignment = { vertical: 'middle', wrapText: true };

  // Standard 2
  sheet.mergeCells('B108:B115');
  sheet.getCell('B108').value = 2;
  sheet.getCell('B108').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('C108:H115');
  sheet.getCell('C108').value =
    'Термометр сопротивления с цифровой индикацией (Калибратор температуры)\nResistance thermometer with digital indication (Temperature Calibrator)';
  sheet.getCell('C108').alignment = { vertical: 'middle', wrapText: true };

  sheet.mergeCells('I108:K115');
  sheet.getCell('I108').value = 'STS-200 A 915\n(RTC-156B)';
  sheet.getCell('I108').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('L108:N115');
  sheet.getCell('L108').value = '613343-19\n(617498-00393)';
  sheet.getCell('L108').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('O108:V115');
  sheet.getCell('O108').value = 'Uz-09T/630-2025\nот 14.04.2025 г.';
  sheet.getCell('O108').alignment = { vertical: 'middle', wrapText: true };

  for (let r = 100; r <= 115; r++) {
    for (let c = 2; c <= 22; c++) {
      const colLetter = String.fromCharCode(64 + c);
      sheet.getCell(`${colLetter}${r}`).border = thinBlackBorder;
    }
  }

  // Calibration Results Table (Rows 116-124)
  sheet.mergeCells('B116:V116');
  sheet.getCell('B116').value = 'Результаты калибровки, включая неопределенность';
  sheet.getCell('B116').font = { bold: true };

  sheet.mergeCells('B117:V117');
  sheet.getCell('B117').value = 'Calibration results including uncertainty';
  sheet.getCell('B117').font = { italic: true };

  sheet.mergeCells('B118:E121');
  sheet.getCell('B118').value = 'Номинальная температура, °C\nNominal temperature, °C';
  sheet.getCell('B118').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell('B118').font = { bold: true };
  sheet.getCell('B118').fill = grayHeaderFill;

  sheet.mergeCells('F118:I121');
  sheet.getCell('F118').value = 'Опорное значение, °C\nSupport meaning, °C';
  sheet.getCell('F118').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell('F118').font = { bold: true };
  sheet.getCell('F118').fill = grayHeaderFill;

  sheet.mergeCells('J118:M121');
  sheet.getCell('J118').value = 'Показание объекта калибровки, °C\nIndication of the calibration object, °C';
  sheet.getCell('J118').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell('J118').font = { bold: true };
  sheet.getCell('J118').fill = grayHeaderFill;

  sheet.mergeCells('N118:Q121');
  sheet.getCell('N118').value = 'Отклонение, °C\nDeviation, °C';
  sheet.getCell('N118').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell('N118').font = { bold: true };
  sheet.getCell('N118').fill = grayHeaderFill;

  sheet.mergeCells('R118:V121');
  sheet.getCell('R118').value = 'Расширенная неопределенность, °C\nExpanded uncertainty, °C';
  sheet.getCell('R118').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sheet.getCell('R118').font = { bold: true };
  sheet.getCell('R118').fill = grayHeaderFill;

  // Row 122: Actual Values
  sheet.mergeCells('B122:E122');
  sheet.getCell('B122').value = calculation.pointTemp || 30.0;
  sheet.getCell('B122').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell('B122').font = { bold: true };

  sheet.mergeCells('F122:I122');
  sheet.getCell('F122').value = calculation.centerStdMean || 29.59;
  sheet.getCell('F122').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell('F122').font = { bold: true };

  sheet.mergeCells('J122:M122');
  sheet.getCell('J122').value = calculation.overallIndMean > 0 ? calculation.overallIndMean : 29.97;
  sheet.getCell('J122').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell('J122').font = { bold: true };

  sheet.mergeCells('N122:Q122');
  sheet.getCell('N122').value = calculation.deviation || -0.37;
  sheet.getCell('N122').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell('N122').font = { bold: true };

  sheet.mergeCells('R122:V122');
  sheet.getCell('R122').value = calculation.U || 0.18;
  sheet.getCell('R122').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell('R122').font = { bold: true };

  // Empty row 123-124
  sheet.mergeCells('B123:E124');
  sheet.mergeCells('F123:I124');
  sheet.mergeCells('J123:M124');
  sheet.mergeCells('N123:Q124');
  sheet.mergeCells('R123:V124');

  for (let r = 118; r <= 124; r++) {
    for (let c = 2; c <= 22; c++) {
      const colLetter = String.fromCharCode(64 + c);
      sheet.getCell(`${colLetter}${r}`).border = thinBlackBorder;
    }
  }

  // Row 124: Thick Blue Page Break Line
  for (let c = 2; c <= 22; c++) {
    const colLetter = String.fromCharCode(64 + c);
    sheet.getCell(`${colLetter}124`).border = thickBluePageBreakBorder;
  }

  // -------------------------------------------------------------
  // PAGE 4: ROWS 125 TO 180
  // -------------------------------------------------------------
  sheet.mergeCells('B126:V126');
  sheet.getCell('B126').value = 'Дополнительная информация:';
  sheet.getCell('B126').font = { bold: true };

  sheet.mergeCells('B127:V127');
  sheet.getCell('B127').value = 'Additional information:';
  sheet.getCell('B127').font = { italic: true };

  // Diagonal Hatch Area B129:V133
  sheet.mergeCells('B129:V133');
  sheet.getCell('B129').fill = {
    type: 'pattern',
    pattern: 'darkUp',
    fgColor: { argb: 'FFD9D9D9' },
  };
  for (let r = 129; r <= 133; r++) {
    for (let c = 2; c <= 22; c++) {
      const colLetter = String.fromCharCode(64 + c);
      sheet.getCell(`${colLetter}${r}`).border = thinBlackBorder;
    }
  }

  // Page 4 Header
  sheet.mergeCells('H135:S136');
  sheet.getCell('H135').value =
    'Хорезмский филиал ГУ «Узбекский национальный институт метрологии»\n"Uzbek National Institute of Metrology" state institution Khorezm branch';
  sheet.getCell('H135').font = { bold: true, size: 9 };
  sheet.getCell('H135').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  sheet.mergeCells('T135:V136');
  sheet.getCell('T135').value = certNo;
  sheet.getCell('T135').font = { bold: true };
  sheet.getCell('T135').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('T137:V138');
  sheet.getCell('T137').value = "O'ZAK.KL.0013";
  sheet.getCell('T137').font = { bold: true };
  sheet.getCell('T137').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('T139:V139');
  sheet.getCell('T139').value = issueDate;
  sheet.getCell('T139').alignment = { horizontal: 'center', vertical: 'middle' };

  ['T135', 'U135', 'V135', 'T136', 'U136', 'V136', 'T137', 'U137', 'V137', 'T138', 'U138', 'V138', 'T139', 'U139', 'V139'].forEach((c) => {
    sheet.getCell(c).border = thinBlackBorder;
  });

  sheet.mergeCells('B137:G137');
  sheet.getCell('B137').value = 'Номер сертификата: Certificate number:';
  sheet.getCell('B137').font = { bold: true };

  sheet.mergeCells('H137:L138');
  sheet.getCell('H137').value = certNo;
  sheet.getCell('H137').font = { bold: true };
  sheet.getCell('H137').alignment = { vertical: 'middle' };

  sheet.mergeCells('M137:P137');
  sheet.getCell('M137').value = 'Страница: Page:';
  sheet.getCell('M137').font = { bold: true };

  sheet.mergeCells('Q137:R138');
  sheet.getCell('Q137').value = 4;
  sheet.getCell('Q137').font = { bold: true };
  sheet.getCell('Q137').alignment = { vertical: 'middle' };

  // Uncertainty Box B140:V151
  sheet.mergeCells('B140:V151');
  const uBox = sheet.getCell('B140');
  uBox.value =
    'Указанная расширенная неопределенность измерений определяется как стандартная неопределенность измерений, умноженная на коэффициент охвата k = 2, что для нормального распределения соответствует вероятности охвата приблизительно 95 %. Стандартная неопределенность измерений определена в соответствии с GUM.\nThe reported expanded uncertainty of measurement is stated as the standard uncertainty of measurement multiplied by the coverage factor k = 2, which for a normal distribution corresponds to a coverage probability of approximately 95 %. The standard uncertainty of measurement has been determined in accordance with GUM.\n\nВсе измерения имеют прослеживаемость к единицам Международной системы SI\nAll measurements are traceable to the SI units\n\nРезультат калибровки относится только к объекту калибровки\nThe calibration result refers only to the calibration item';
  uBox.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  uBox.font = { size: 9 };
  for (let r = 140; r <= 151; r++) {
    for (let c = 2; c <= 22; c++) {
      const colLetter = String.fromCharCode(64 + c);
      sheet.getCell(`${colLetter}${r}`).border = thinBlackBorder;
    }
  }

  // Accreditation Box B153:V166
  sheet.mergeCells('B153:V166');
  const aBox = sheet.getCell('B153');
  aBox.value =
    'Узбекский национальный институт метрологии является подписантом Договорённости о взаимном признании (MRA) Международного комитета по весам и мерам (CIPM).\nUzbek National Institute of Metrology is a signatory of the International Committee for Weights and Measures (CIPM) Mutual Recognition Arrangement (MRA).\n\nХорезмский филиал ГУ «Узбекский национальный институт метрологии» аккредитован ГУ «Узбекским центром аккредитации» (O‘ZAKK) под регистрационным номером O‘ZAK.KL.0013 по O‘z DSt ISO/IEC 17025:2019 как калибровочная лаборатория.\n"Uzbek National Institute of Metrology" state institution Khorezm branch accredited by Uzbek Accreditation Center (O\'ZAKK) under registration number O\'ZAK.KL.0013 for O\'z DSt ISO/IEC 17025:2019 as Calibration Laboratory.\n\nУзбекский центр аккредитации (O‘ZAKK) является подписантом Договорённости о взаимном признании (MRA) Азиатско-Тихоокеанского сотрудничества по аккредитации (APAC) и Договорённости о взаимном признании (MRA) Международного сотрудничества по аккредитации лабораторий (ILAC) для признания сертификатов калибровки.\nUzbek Accreditation Center (O\'ZAKK) is a signatory to the Asia Pacific Accreditation Cooperation (APAC) Mutual Recognition Arrangement (MRA) and to the International Laboratory Accreditation Cooperation (ILAC) Mutual Recognition Arrangement (MRA) for the recognition of calibration certificates.';
  aBox.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  aBox.font = { size: 9 };
  for (let r = 153; r <= 166; r++) {
    for (let c = 2; c <= 22; c++) {
      const colLetter = String.fromCharCode(64 + c);
      sheet.getCell(`${colLetter}${r}`).border = thinBlackBorder;
    }
  }

  // Customer Feedback & QR Code Box (Rows 168-174)
  sheet.mergeCells('J169:M173');
  const fbBox = sheet.getCell('J169');
  fbBox.value =
    'Калибровочная лаборатория УзНИМ стремится получать обратную связь от своих заказчиков\n\nUzNIM Calibration laboratory seeks feedback from its customers';
  fbBox.font = { size: 9, bold: true };
  fbBox.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  for (let r = 169; r <= 173; r++) {
    for (let c = 10; c <= 13; c++) {
      const colLetter = String.fromCharCode(64 + c);
      sheet.getCell(`${colLetter}${r}`).border = thinBlackBorder;
    }
  }

  // QR Code Image in N169:Q173
  if (qrBase64) {
    try {
      const qrId = workbook.addImage({ base64: qrBase64, extension: 'png' });
      sheet.addImage(qrId, 'N169:Q173');
    } catch (e) {
      console.warn('Could not add QR image to sheet', e);
    }
  } else {
    sheet.mergeCells('N169:Q173');
    sheet.getCell('N169').value = '[QR CODE]';
    sheet.getCell('N169').alignment = { horizontal: 'center', vertical: 'middle' };
  }
  for (let r = 169; r <= 173; r++) {
    for (let c = 14; c <= 17; c++) {
      const colLetter = String.fromCharCode(64 + c);
      sheet.getCell(`${colLetter}${r}`).border = thinBlackBorder;
    }
  }

  // End of Calibration Certificate (Rows 175-177)
  sheet.mergeCells('B175:V175');
  sheet.getCell('B175').value = 'Конец сертификата калибровки';
  sheet.getCell('B175').font = { bold: true, size: 13 };
  sheet.getCell('B175').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('B176:V176');
  sheet.getCell('B176').value = 'End of Calibration Certificate';
  sheet.getCell('B176').font = { italic: true, size: 11 };
  sheet.getCell('B176').alignment = { horizontal: 'center', vertical: 'middle' };

  const fileName = `Sertifikat_${certNo.replace(/[\/\\]/g, '_')}_${serialNo}.xlsx`;
  await saveWorkbook(workbook, fileName);
}
