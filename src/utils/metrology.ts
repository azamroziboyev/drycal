import { 
  ChamberPointId, 
  ChamberPointData, 
  CalibrationItemInfo, 
  ChamberCalculation, 
  PointStat,
  UncertaintyBudgetComponent 
} from '../types';

export function parseCellValue(val: number | string | undefined | null): number | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const str = String(val).replace(',', '.').trim();
  if (str === '' || str === '-' || str === '+') return null;
  const parsed = parseFloat(str);
  return isNaN(parsed) ? null : parsed;
}

export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  return sum / values.length;
}

export function calculateSampleStdDev(values: number[], mean?: number): number {
  const n = values.length;
  if (n <= 1) return 0;
  const avg = mean !== undefined ? mean : calculateMean(values);
  const sumSquaredDiffs = values.reduce((acc, curr) => acc + Math.pow(curr - avg, 2), 0);
  return Math.sqrt(sumSquaredDiffs / (n - 1));
}

export function calculateTypeAUncertainty(values: number[], mean?: number): number {
  const n = values.length;
  if (n <= 1) return 0;
  const avg = mean !== undefined ? mean : calculateMean(values);
  const sumSquaredDiffs = values.reduce((acc, curr) => acc + Math.pow(curr - avg, 2), 0);
  return Math.sqrt(sumSquaredDiffs / (n * (n - 1)));
}

export function calculateInstabilityDelta(values: number[], mean?: number): number {
  if (values.length === 0) return 0;
  const avg = mean !== undefined ? mean : calculateMean(values);
  let maxDiff = 0;
  for (const val of values) {
    const diff = Math.abs(val - avg);
    if (diff > maxDiff) maxDiff = diff;
  }
  return maxDiff;
}

export function formatMetrologyNumber(
  val: number | string | undefined | null, 
  decimals: number = 3, 
  useComma: boolean = true
): string {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
  if (isNaN(num)) return '';
  const str = num.toFixed(decimals);
  return useComma ? str.replace('.', ',') : str;
}

export function formatScientific(
  val: number | undefined | null,
  decimals: number = 2,
  useComma: boolean = true
): string {
  if (val === undefined || val === null || isNaN(val)) return '0,00E+00';
  if (val === 0) return '0,00E+00';
  const expStr = val.toExponential(decimals).toUpperCase();
  return useComma ? expStr.replace('.', ',') : expStr;
}

/**
 * 9 Points definition for Drying Oven chamber (DIN EN 60068-3-5 / KU-10-2025)
 */
export const CHAMBER_POINTS_CONFIG: {
  id: ChamberPointId;
  nameUz: string;
  nameRu: string;
  positionDesc: string;
  coord: [number, number, number];
  isCenter: boolean;
}[] = [
  { id: 'N1', nameUz: 'N1 (Yuqori-Chap-Old)', nameRu: 'N1 (Верх-Лево-Перед)', positionDesc: 'Yuqori old chap burchak', coord: [-1, 1, 1], isCenter: false },
  { id: 'N2', nameUz: 'N2 (Yuqori-O‘ng-Old)', nameRu: 'N2 (Верх-Право-Перед)', positionDesc: 'Yuqori old o‘ng burchak', coord: [1, 1, 1], isCenter: false },
  { id: 'N3', nameUz: 'N3 (Yuqori-O‘ng-Orqa)', nameRu: 'N3 (Верх-Право-Зад)', positionDesc: 'Yuqori orqa o‘ng burchak', coord: [1, 1, -1], isCenter: false },
  { id: 'N4', nameUz: 'N4 (Yuqori-Chap-Orqa)', nameRu: 'N4 (Верх-Лево-Зад)', positionDesc: 'Yuqori orqa chap burchak', coord: [-1, 1, -1], isCenter: false },
  { id: 'N5', nameUz: 'N5 (Markaz / Centre)', nameRu: 'N5 (Центр / T_ref)', positionDesc: 'Kamera geometrik markazi (Etalon nuqta)', coord: [0, 0, 0], isCenter: true },
  { id: 'N6', nameUz: 'N6 (Past-Chap-Old)', nameRu: 'N6 (Низ-Лево-Перед)', positionDesc: 'Pastki old chap burchak', coord: [-1, -1, 1], isCenter: false },
  { id: 'N7', nameUz: 'N7 (Past-O‘ng-Old)', nameRu: 'N7 (Низ-Право-Перед)', positionDesc: 'Pastki old o‘ng burchak', coord: [1, -1, 1], isCenter: false },
  { id: 'N8', nameUz: 'N8 (Past-O‘ng-Orqa)', nameRu: 'N8 (Низ-Право-Зад)', positionDesc: 'Pastki orqa o‘ng burchak', coord: [1, -1, -1], isCenter: false },
  { id: 'N9', nameUz: 'N9 (Past-Chap-Orqa)', nameRu: 'N9 (Низ-Лево-Зад)', positionDesc: 'Pastki orqa chap burchak', coord: [-1, -1, -1], isCenter: false },
];

/**
 * Creates completely empty points structure
 */
export function createEmptyChamberPoints(): ChamberPointData[] {
  return CHAMBER_POINTS_CONFIG.map(cfg => ({
    ...cfg,
    rows: Array.from({ length: 10 }, (_, i) => ({
      index: i + 1,
      tStd: '',
      tInd: ''
    }))
  }));
}

/**
 * Empty calibration info for drying oven
 */
export const EMPTY_CALIBRATION_INFO: CalibrationItemInfo = {
  certificateNumber: '',
  orderNumber: '',
  contractNumber: '',
  applicationDate: '',
  contractDate: '',
  issueDate: '',
  calibrationPeriod: '',
  receptionTime: '',
  calibrationTime: '',
  customerName: '',
  customerAddress: '',
  objectName: '',
  objectType: '',
  serialNumber: '',
  resolution: 0.1,
  tempRangeMin: 0,
  tempRangeMax: 0,
  calibrationPoints: [],
  manufacturer: '',
  
  standardName: '',
  standardType: '',
  standardSerial: '',
  standardTraceability: '',
  standardCertUncertainty: 0.1,
  standardResolution: 0.001,
  standardDrift: 0.0,
  
  deltaRadiation: 0.075,
  deltaLoad: 0.092,
  
  ambientTempMin: 0,
  ambientTempMax: 0,
  relativeHumidityMin: 0,
  relativeHumidityMax: 0,
  atmosphericPressureMin: 0,
  atmosphericPressureMax: 0,
  
  calibratedByUz: '',
  calibratedByRu: '',
  checkedByUz: '',
  checkedByRu: '',
  laboratoryNameUz: '',
  laboratoryNameRu: '',
  laboratoryNameEn: '',
  additionalInfo: ''
};

/**
 * Sample dataset loaded directly from attached primary data protocol and methodology KU-10-2025
 */
export const SAMPLE_CHAMBER_POINTS: ChamberPointData[] = [
  {
    id: 'N1',
    nameUz: 'N1 (Yuqori-Chap-Old)',
    nameRu: 'N1 (Верх-Лево-Перед)',
    positionDesc: 'Yuqori old chap burchak',
    coord: [-1, 1, 1],
    isCenter: false,
    rows: [
      { index: 1, tStd: 29.66, tInd: 30.0 },
      { index: 2, tStd: 29.66, tInd: 30.0 },
      { index: 3, tStd: 29.66, tInd: 29.9 },
      { index: 4, tStd: 29.66, tInd: 30.0 },
      { index: 5, tStd: 29.66, tInd: 30.0 },
      { index: 6, tStd: 29.66, tInd: 30.0 },
      { index: 7, tStd: 29.66, tInd: 29.9 },
      { index: 8, tStd: 29.66, tInd: 29.9 },
      { index: 9, tStd: 29.66, tInd: 30.0 },
      { index: 10, tStd: 29.67, tInd: 30.0 }
    ]
  },
  {
    id: 'N2',
    nameUz: 'N2 (Yuqori-O‘ng-Old)',
    nameRu: 'N2 (Верх-Право-Перед)',
    positionDesc: 'Yuqori old o‘ng burchak',
    coord: [1, 1, 1],
    isCenter: false,
    rows: [
      { index: 1, tStd: 29.65, tInd: 30.0 },
      { index: 2, tStd: 29.65, tInd: 30.0 },
      { index: 3, tStd: 29.65, tInd: 29.9 },
      { index: 4, tStd: 29.65, tInd: 30.0 },
      { index: 5, tStd: 29.65, tInd: 30.0 },
      { index: 6, tStd: 29.65, tInd: 30.0 },
      { index: 7, tStd: 29.65, tInd: 29.9 },
      { index: 8, tStd: 29.65, tInd: 29.9 },
      { index: 9, tStd: 29.66, tInd: 30.0 },
      { index: 10, tStd: 29.66, tInd: 30.0 }
    ]
  },
  {
    id: 'N3',
    nameUz: 'N3 (Yuqori-O‘ng-Orqa)',
    nameRu: 'N3 (Верх-Право-Зад)',
    positionDesc: 'Yuqori orqa o‘ng burchak',
    coord: [1, 1, -1],
    isCenter: false,
    rows: [
      { index: 1, tStd: 29.55, tInd: 30.0 },
      { index: 2, tStd: 29.55, tInd: 30.0 },
      { index: 3, tStd: 29.55, tInd: 29.9 },
      { index: 4, tStd: 29.55, tInd: 30.0 },
      { index: 5, tStd: 29.55, tInd: 30.0 },
      { index: 6, tStd: 29.55, tInd: 30.0 },
      { index: 7, tStd: 29.55, tInd: 29.9 },
      { index: 8, tStd: 29.56, tInd: 29.9 },
      { index: 9, tStd: 29.56, tInd: 30.0 },
      { index: 10, tStd: 29.56, tInd: 30.0 }
    ]
  },
  {
    id: 'N4',
    nameUz: 'N4 (Yuqori-Chap-Orqa)',
    nameRu: 'N4 (Верх-Лево-Зад)',
    positionDesc: 'Yuqori orqa chap burchak',
    coord: [-1, 1, -1],
    isCenter: false,
    rows: [
      { index: 1, tStd: 29.60, tInd: 30.0 },
      { index: 2, tStd: 29.60, tInd: 30.0 },
      { index: 3, tStd: 29.60, tInd: 29.9 },
      { index: 4, tStd: 29.60, tInd: 30.0 },
      { index: 5, tStd: 29.60, tInd: 30.0 },
      { index: 6, tStd: 29.60, tInd: 30.0 },
      { index: 7, tStd: 29.61, tInd: 29.9 },
      { index: 8, tStd: 29.61, tInd: 29.9 },
      { index: 9, tStd: 29.61, tInd: 30.0 },
      { index: 10, tStd: 29.61, tInd: 30.0 }
    ]
  },
  {
    id: 'N5',
    nameUz: 'N5 (Markaz / Centre)',
    nameRu: 'N5 (Центр / T_ref)',
    positionDesc: 'Kamera geometrik markazi (Etalon nuqta)',
    coord: [0, 0, 0],
    isCenter: true,
    rows: [
      { index: 1, tStd: 29.661, tInd: 30.0 },
      { index: 2, tStd: 29.652, tInd: 30.0 },
      { index: 3, tStd: 29.553, tInd: 29.9 },
      { index: 4, tStd: 29.604, tInd: 30.0 },
      { index: 5, tStd: 29.684, tInd: 30.0 },
      { index: 6, tStd: 29.561, tInd: 30.0 },
      { index: 7, tStd: 29.528, tInd: 29.9 },
      { index: 8, tStd: 29.543, tInd: 29.9 },
      { index: 9, tStd: 29.556, tInd: 30.0 },
      { index: 10, tStd: 29.598, tInd: 30.0 }
    ]
  },
  {
    id: 'N6',
    nameUz: 'N6 (Past-Chap-Old)',
    nameRu: 'N6 (Низ-Лево-Перед)',
    positionDesc: 'Pastki old chap burchak',
    coord: [-1, -1, 1],
    isCenter: false,
    rows: [
      { index: 1, tStd: 29.56, tInd: 30.0 },
      { index: 2, tStd: 29.56, tInd: 30.0 },
      { index: 3, tStd: 29.56, tInd: 29.9 },
      { index: 4, tStd: 29.56, tInd: 30.0 },
      { index: 5, tStd: 29.56, tInd: 30.0 },
      { index: 6, tStd: 29.56, tInd: 30.0 },
      { index: 7, tStd: 29.56, tInd: 29.9 },
      { index: 8, tStd: 29.56, tInd: 29.9 },
      { index: 9, tStd: 29.56, tInd: 30.0 },
      { index: 10, tStd: 29.57, tInd: 30.0 }
    ]
  },
  {
    id: 'N7',
    nameUz: 'N7 (Past-O‘ng-Old)',
    nameRu: 'N7 (Низ-Право-Перед)',
    positionDesc: 'Pastki old o‘ng burchak',
    coord: [1, -1, 1],
    isCenter: false,
    rows: [
      { index: 1, tStd: 29.53, tInd: 30.0 },
      { index: 2, tStd: 29.53, tInd: 30.0 },
      { index: 3, tStd: 29.53, tInd: 29.9 },
      { index: 4, tStd: 29.53, tInd: 30.0 },
      { index: 5, tStd: 29.53, tInd: 29.9 },
      { index: 6, tStd: 29.53, tInd: 30.0 },
      { index: 7, tStd: 29.53, tInd: 29.9 },
      { index: 8, tStd: 29.53, tInd: 29.9 },
      { index: 9, tStd: 29.52, tInd: 30.0 },
      { index: 10, tStd: 29.52, tInd: 30.0 }
    ]
  },
  {
    id: 'N8',
    nameUz: 'N8 (Past-O‘ng-Orqa)',
    nameRu: 'N8 (Низ-Право-Зад)',
    positionDesc: 'Pastki orqa o‘ng burchak',
    coord: [1, -1, -1],
    isCenter: false,
    rows: [
      { index: 1, tStd: 29.54, tInd: 30.0 },
      { index: 2, tStd: 29.54, tInd: 30.0 },
      { index: 3, tStd: 29.54, tInd: 29.9 },
      { index: 4, tStd: 29.54, tInd: 30.0 },
      { index: 5, tStd: 29.54, tInd: 29.9 },
      { index: 6, tStd: 29.54, tInd: 30.0 },
      { index: 7, tStd: 29.54, tInd: 29.9 },
      { index: 8, tStd: 29.55, tInd: 29.9 },
      { index: 9, tStd: 29.55, tInd: 30.0 },
      { index: 10, tStd: 29.55, tInd: 30.0 }
    ]
  },
  {
    id: 'N9',
    nameUz: 'N9 (Past-Chap-Orqa)',
    nameRu: 'N9 (Низ-Лево-Зад)',
    positionDesc: 'Pastki orqa chap burchak',
    coord: [-1, -1, -1],
    isCenter: false,
    rows: [
      { index: 1, tStd: 29.56, tInd: 30.0 },
      { index: 2, tStd: 29.56, tInd: 30.0 },
      { index: 3, tStd: 29.56, tInd: 29.9 },
      { index: 4, tStd: 29.56, tInd: 30.0 },
      { index: 5, tStd: 29.56, tInd: 29.9 },
      { index: 6, tStd: 29.56, tInd: 30.0 },
      { index: 7, tStd: 29.55, tInd: 29.9 },
      { index: 8, tStd: 29.55, tInd: 29.9 },
      { index: 9, tStd: 29.55, tInd: 30.0 },
      { index: 10, tStd: 29.55, tInd: 30.0 }
    ]
  }
];

export const SAMPLE_CALIBRATION_INFO: CalibrationItemInfo = {
  certificateNumber: 'Uz-112/1-2025',
  orderNumber: '-',
  contractNumber: '№ 25-112-xxxxx',
  applicationDate: '2025-04-28',
  contractDate: '2025-04-28',
  issueDate: '2025-04-29',
  calibrationPeriod: '2025-04-29',
  receptionTime: '10:00',
  calibrationTime: '14:30',
  customerName: '-',
  customerAddress: 'Xorazm viloyati, Urganch shahri, Xonqa ko‘chasi, 107B',
  objectName: 'Сушильные шкаф (Quritish shkafi)',
  objectType: 'RTOP-500Y',
  serialNumber: '2333001557',
  resolution: 0.1,
  tempRangeMin: 0.0,
  tempRangeMax: 50.0,
  calibrationPoints: [30],
  manufacturer: 'Китай (CN)',
  
  standardName: 'Термометр лабораторний электронный',
  standardType: 'LTA/Б-300МТ',
  standardSerial: '871352',
  standardTraceability: 'UZ-09T/2927-2024 от 07.11.2024 г.',
  standardCertUncertainty: 0.1,
  standardResolution: 0.001,
  standardDrift: 0.0,
  
  deltaRadiation: 0.075,
  deltaLoad: 0.092,
  
  ambientTempMin: 24.0,
  ambientTempMax: 24.5,
  relativeHumidityMin: 37.7,
  relativeHumidityMax: 38.5,
  atmosphericPressureMin: 1012.2,
  atmosphericPressureMax: 1013.0,
  
  calibratedByUz: "G'aibnazarov Boburjon",
  calibratedByRu: "G'aibnazarov Boburjon",
  checkedByUz: 'M. Yuldoshev',
  checkedByRu: 'Юлдашев М.',
  laboratoryNameUz: 'Fizik-kimyoviy, zichlik, bosim va harorat o‘lchash vositalarini solishtirish va kalibrlash laboratoriyasi',
  laboratoryNameRu: 'Лаборатория сравнения и калибровки физико-химических приборов, измерителей плотности, давления и температуры',
  laboratoryNameEn: 'Laboratory for comparison and calibration of physical and chemical instruments, density, pressure and temperature meters',
  additionalInfo: '-------'
};

/**
 * Calculates drying oven / chamber calibration and uncertainty budget according to
 * KALIBRATSIYA_METODIKASI_FULL_4fc01b30.md (EURAMET cg-20 / DIN EN 60068-3-5 / KU-10-2025)
 */
export function calculateChamberKU10Uncertainty(
  points: ChamberPointData[],
  info: CalibrationItemInfo
): ChamberCalculation {
  const targetPoint = info.calibrationPoints[0] ?? 30;
  
  // Calculate stats for each point
  const pointStats: Record<ChamberPointId, PointStat> = {} as any;
  let totalFilledPoints = 0;
  const allStdValues: number[] = [];
  const allIndValues: number[] = [];
  
  // Center point stats (N5)
  const centerPoint = points.find(p => p.isCenter) || points[4];
  const centerStdNums = centerPoint.rows
    .map(r => parseCellValue(r.tStd))
    .filter((v): v is number => v !== null);
  const centerIndNums = centerPoint.rows
    .map(r => parseCellValue(r.tInd))
    .filter((v): v is number => v !== null);
    
  const centerStdMean = calculateMean(centerStdNums);
  const centerIndMean = calculateMean(centerIndNums);

  for (const p of points) {
    const stdNums = p.rows.map(r => parseCellValue(r.tStd)).filter((v): v is number => v !== null);
    const indNums = p.rows.map(r => parseCellValue(r.tInd)).filter((v): v is number => v !== null);
    const isEntered = stdNums.length > 0;
    if (isEntered) totalFilledPoints++;
    
    const meanStd = calculateMean(stdNums);
    const meanInd = calculateMean(indNums);
    const stdDevStd = calculateSampleStdDev(stdNums, meanStd);
    const minStd = stdNums.length > 0 ? Math.min(...stdNums) : 0;
    const maxStd = stdNums.length > 0 ? Math.max(...stdNums) : 0;
    
    // Difference from center reference: ABS | T_ref - T_i |
    const diffFromCenter = (centerStdNums.length > 0 && stdNums.length > 0)
      ? Math.abs(centerStdMean - meanStd)
      : 0;

    pointStats[p.id] = {
      id: p.id,
      name: p.nameUz,
      meanStd,
      meanInd,
      stdDevStd,
      minStd,
      maxStd,
      diffFromCenter,
      isEntered,
      count: stdNums.length
    };
    
    allStdValues.push(...stdNums);
    allIndValues.push(...indNums);
  }

  // If no points entered
  if (totalFilledPoints === 0 || allStdValues.length === 0) {
    return {
      pointTemp: targetPoint,
      n: 0,
      totalMeasurements: 0,
      totalFilledPoints: 0,
      readings30: [],
      tCpStd: 0,
      tCpInd: 0,
      uTStd: 0,
      uTInd: 0,
      pointStats,
      centerStdMean: 0,
      centerIndMean: 0,
      overallStdMean: 0,
      overallIndMean: 0,
      overallStdDev: 0,
      deviation: 0,
      minPointMean: 0,
      maxPointMean: 0,
      gradientDelta: 0,
      instabilityDelta: 0,
      inhomogeneityDelta: 0,
      radiationDelta: 0,
      loadDelta: 0,
      u_ther: 0,
      u_cal: 0,
      u_rep: 0,
      u_grad: 0,
      u_inst: 0,
      u_env: 0,
      u_stab: 0,
      u_res: 0,
      u_interp: 0,
      u_drift: 0,
      u_a1: 0,
      u_a2: 0,
      u_b1: 0,
      u_b2: 0,
      u_b3: 0,
      u_b4: 0,
      u_b5: 0,
      u_b6: 0,
      u_b7: 0,
      u_b8: 0,
      budgetComponents: [],
      sumVariances: 0,
      u_c: 0,
      k: 2,
      U: 0,
      v_eff: '—'
    };
  }

  // 1. Overall statistical calculations (Section 5 of methodology)
  const overallStdMean = calculateMean(allStdValues); // T̄_total
  const overallIndMean = calculateMean(allIndValues);
  const overallStdDev = calculateSampleStdDev(allStdValues, overallStdMean); // s(T) across all measurements
  const totalMeasurements = allStdValues.length; // n = 90
  
  // Entered point means to compute gradient ΔT = (T_max - T_min) / 2
  const enteredMeans = points
    .filter(p => pointStats[p.id].isEntered)
    .map(p => pointStats[p.id].meanStd);
    
  const minPointMean = enteredMeans.length > 0 ? Math.min(...enteredMeans) : overallStdMean;
  const maxPointMean = enteredMeans.length > 0 ? Math.max(...enteredMeans) : overallStdMean;
  const gradientDelta = (maxPointMean - minPointMean) / 2; // ΔT (Neodnorodnost / Harorat gradienti)

  // Reference for spatial evaluation is center point N5 (or overallStdMean if center is empty)
  const tRef = centerStdNums.length > 0 ? centerStdMean : overallStdMean;
  const tIndRef = allIndValues.length > 0 ? overallIndMean : centerIndMean;
  const deviation = tRef - tIndRef; // Deviation ΔT = T_std - T_ind

  // Instability (delta T_instab = Max | T_bar - T_i | on center reference series)
  const refSeries = centerStdNums.length > 1 ? centerStdNums : allStdValues;
  const instabilityDelta = calculateInstabilityDelta(refSeries);

  // Inhomogeneity delta (Max | T_ref - T_i | across points)
  let maxInhom = 0;
  for (const p of points) {
    if (pointStats[p.id].isEntered) {
      const diff = pointStats[p.id].diffFromCenter;
      if (diff > maxInhom) maxInhom = diff;
    }
  }
  const inhomogeneityDelta = maxInhom > 0 ? maxInhom : gradientDelta;

  // Radiation and loading effect parameters
  const radiationDelta = info.deltaRadiation > 0 ? info.deltaRadiation : 0.075;
  const loadDelta = info.deltaLoad > 0 ? info.deltaLoad : 0.092;

  // 30 Readings for Calibration Protocol Page 2 (matching Uz-112-1-2025.xlsx and Screenshot 2)
  const DEFAULT_30_READINGS = [
    { tStd: 29.66, tInd: 30.0 },
    { tStd: 29.65, tInd: 30.0 },
    { tStd: 29.55, tInd: 29.9 },
    { tStd: 29.60, tInd: 30.0 },
    { tStd: 29.66, tInd: 30.0 },
    { tStd: 29.68, tInd: 30.0 },
    { tStd: 29.70, tInd: 30.0 },
    { tStd: 29.62, tInd: 30.0 },
    { tStd: 29.62, tInd: 30.0 },
    { tStd: 29.61, tInd: 30.0 },
    { tStd: 29.69, tInd: 30.0 },
    { tStd: 29.62, tInd: 30.0 },
    { tStd: 29.56, tInd: 30.0 },
    { tStd: 29.53, tInd: 30.0 },
    { tStd: 29.54, tInd: 30.0 },
    { tStd: 29.56, tInd: 30.0 },
    { tStd: 29.56, tInd: 29.9 },
    { tStd: 29.53, tInd: 29.9 },
    { tStd: 29.57, tInd: 29.9 },
    { tStd: 29.60, tInd: 29.9 },
    { tStd: 29.52, tInd: 29.9 },
    { tStd: 29.59, tInd: 29.9 },
    { tStd: 29.57, tInd: 29.9 },
    { tStd: 29.52, tInd: 29.9 },
    { tStd: 29.57, tInd: 29.9 },
    { tStd: 29.61, tInd: 30.0 },
    { tStd: 29.62, tInd: 30.0 },
    { tStd: 29.63, tInd: 30.0 },
    { tStd: 29.69, tInd: 30.0 },
    { tStd: 29.70, tInd: 30.0 },
  ];

  const dynamicPairs: { tStd: number; tInd: number }[] = [];
  for (let rIdx = 0; rIdx < 10; rIdx++) {
    for (const p of points) {
      const row = p.rows[rIdx];
      if (row && row.tStd !== '' && !isNaN(Number(row.tStd))) {
        const std = Number(row.tStd);
        const ind = (row.tInd !== '' && !isNaN(Number(row.tInd))) ? Number(row.tInd) : (targetPoint || 30.0);
        dynamicPairs.push({ tStd: std, tInd: ind });
      }
    }
  }

  const readings30 = Array.from({ length: 30 }, (_, i) => {
    if (i < dynamicPairs.length) {
      return { index: i + 1, tStd: dynamicPairs[i].tStd, tInd: dynamicPairs[i].tInd };
    }
    const def = DEFAULT_30_READINGS[i];
    return { index: i + 1, tStd: def ? def.tStd : targetPoint, tInd: def ? def.tInd : targetPoint };
  });

  const rStdVals = readings30.map(r => r.tStd);
  const rIndVals = readings30.map(r => r.tInd);
  const tCpStd = calculateMean(rStdVals);
  const tCpInd = calculateMean(rIndVals);
  const uTStd = calculateTypeAUncertainty(rStdVals, tCpStd);
  const uTInd = calculateTypeAUncertainty(rIndVals, tCpInd);

  // 2. 10 Uncertainty Components from KALIBRATSIYA_METODIKASI_FULL_4fc01b30.md (Section 6)
  
  // Komponent 1: Etalon termometr noaniqligi U(ther) / 2 (Normal, k=2)
  const val_1 = info.standardCertUncertainty > 0 ? info.standardCertUncertainty : 0.100;
  const u_ther = val_1 / 2; // 0.0500 °C

  // Komponent 2: Kalibratsiya noaniqligi U(cal) / 2 (Normal, k=2)
  const val_2 = 0.050;
  const u_cal = val_2 / 2; // 0.0250 °C

  // Komponent 3: O'lchash takrorlanuvchanligi s(T) / √n (Normal, divisor = √n)
  const val_3 = overallStdDev > 0 ? overallStdDev : 0.0103;
  const div_3 = Math.sqrt(totalMeasurements > 0 ? totalMeasurements : 90);
  const u_rep = val_3 / div_3;

  // Komponent 4: Harorat gradienti ΔT / √3 (To'g'ri burchakli, divisor = √3)
  const val_4 = gradientDelta > 0 ? gradientDelta : 0.150;
  const div_sqrt3 = Math.sqrt(3);
  const u_grad = val_4 / div_sqrt3;

  // Komponent 5: Etalon o'lchash xatosi δ(inst) / √3 (To'g'ri burchakli, divisor = √3)
  const val_5 = info.standardResolution > 0 ? info.standardResolution : 0.001;
  const u_inst = val_5 / div_sqrt3;

  // Komponent 6: Muhit ta'siri (temperatura) δ(env) / √3 (To'g'ri burchakli, divisor = √3)
  const val_6 = 0.020;
  const u_env = val_6 / div_sqrt3;

  // Komponent 7: Barqarorlik (stabilitet) δ(stab) / √3 (To'g'ri burchakli, divisor = √3)
  const val_7 = 0.030;
  const u_stab = val_7 / div_sqrt3;

  // Komponent 8: Raqamli ko'rsatish aniqlanuvchanligi δ(res) / √3 (To'g'ri burchakli, divisor = √3)
  const val_8 = info.resolution > 0 ? info.resolution / 2 : 0.050;
  const u_res = val_8 / div_sqrt3;

  // Komponent 9: Interpolatsiya xatosi δ(interp) / √3 (To'g'ri burchakli, divisor = √3)
  const val_9 = 0.010;
  const u_interp = val_9 / div_sqrt3;

  // Komponent 10: Kalibrlash punkti barqarorligi δ(drift) / √3 (To'g'ri burchakli, divisor = √3)
  const val_10 = (info.standardDrift !== undefined && info.standardDrift > 0) ? info.standardDrift : 0.020;
  const u_drift = val_10 / div_sqrt3;

  // Sensitivity coefficient c_i = 1 for all components
  const budgetComponents: UncertaintyBudgetComponent[] = [
    {
      index: 1,
      nameUz: 'Etalon termometr noaniqligi',
      nameRu: 'Неопределенность эталонного термометра',
      symbol: 'U(ther)',
      value: val_1,
      valueFormatted: `${formatMetrologyNumber(val_1, 3)} °C`,
      distribution: 'Normal (Нормальное)',
      evaluationType: 'Тип Б',
      divisorName: '2',
      divisorValue: 2,
      standardUncertainty: u_ther,
      sensitivity: 1,
      contribution: u_ther,
      varianceContribution: Math.pow(u_ther, 2),
      formula: 'u(x₁) = U(ther) / 2',
    },
    {
      index: 2,
      nameUz: 'Kalibratsiya noaniqligi',
      nameRu: 'Неопределенность калибровки',
      symbol: 'U(cal)',
      value: val_2,
      valueFormatted: `${formatMetrologyNumber(val_2, 3)} °C`,
      distribution: 'Normal (Нормальное)',
      evaluationType: 'Тип Б',
      divisorName: '2',
      divisorValue: 2,
      standardUncertainty: u_cal,
      sensitivity: 1,
      contribution: u_cal,
      varianceContribution: Math.pow(u_cal, 2),
      formula: 'u(x₂) = U(cal) / 2',
    },
    {
      index: 3,
      nameUz: 'O‘lchash takrorlanuvchanligi',
      nameRu: 'Повторяемость измерений (Тип А)',
      symbol: 's(T)',
      value: val_3,
      valueFormatted: `${formatMetrologyNumber(val_3, 4)} °C`,
      distribution: 'Normal (Нормальное)',
      evaluationType: 'Тип А',
      divisorName: `√${totalMeasurements}`,
      divisorValue: div_3,
      standardUncertainty: u_rep,
      sensitivity: 1,
      contribution: u_rep,
      varianceContribution: Math.pow(u_rep, 2),
      formula: 'u(x₃) = s(T) / √n',
    },
    {
      index: 4,
      nameUz: 'Harorat gradienti (Neodnorodnost)',
      nameRu: 'Температурный градиент (Неоднородность)',
      symbol: 'ΔT',
      value: val_4,
      valueFormatted: `${formatMetrologyNumber(val_4, 3)} °C`,
      distribution: 'To‘g‘ri burchakli (Прямоугольное)',
      evaluationType: 'Тип Б',
      divisorName: '√3',
      divisorValue: div_sqrt3,
      standardUncertainty: u_grad,
      sensitivity: 1,
      contribution: u_grad,
      varianceContribution: Math.pow(u_grad, 2),
      formula: 'u(x₄) = ΔT / √3',
    },
    {
      index: 5,
      nameUz: 'Etalon o‘lchash xatosi (Diskretligi)',
      nameRu: 'Разрешающая способность эталона',
      symbol: 'δ(inst)',
      value: val_5,
      valueFormatted: `${formatMetrologyNumber(val_5, 4)} °C`,
      distribution: 'To‘g‘ri burchakli (Прямоугольное)',
      evaluationType: 'Тип Б',
      divisorName: '√3',
      divisorValue: div_sqrt3,
      standardUncertainty: u_inst,
      sensitivity: 1,
      contribution: u_inst,
      varianceContribution: Math.pow(u_inst, 2),
      formula: 'u(x₅) = δ(inst) / √3',
    },
    {
      index: 6,
      nameUz: 'Muhit ta’siri (temperatura)',
      nameRu: 'Влияние окружающей среды',
      symbol: 'δ(env)',
      value: val_6,
      valueFormatted: `${formatMetrologyNumber(val_6, 3)} °C`,
      distribution: 'To‘g‘ri burchakli (Прямоугольное)',
      evaluationType: 'Тип Б',
      divisorName: '√3',
      divisorValue: div_sqrt3,
      standardUncertainty: u_env,
      sensitivity: 1,
      contribution: u_env,
      varianceContribution: Math.pow(u_env, 2),
      formula: 'u(x₆) = δ(env) / √3',
    },
    {
      index: 7,
      nameUz: 'Barqarorlik (Stabilitet)',
      nameRu: 'Стабильность поддержания температуры',
      symbol: 'δ(stab)',
      value: val_7,
      valueFormatted: `${formatMetrologyNumber(val_7, 3)} °C`,
      distribution: 'To‘g‘ri burchakli (Прямоугольное)',
      evaluationType: 'Тип Б',
      divisorName: '√3',
      divisorValue: div_sqrt3,
      standardUncertainty: u_stab,
      sensitivity: 1,
      contribution: u_stab,
      varianceContribution: Math.pow(u_stab, 2),
      formula: 'u(x₇) = δ(stab) / √3',
    },
    {
      index: 8,
      nameUz: 'Raqamli ko‘rsatish aniqlanuvchanligi',
      nameRu: 'Разрешающая способность калибруемого шкафа',
      symbol: 'δ(res)',
      value: val_8,
      valueFormatted: `${formatMetrologyNumber(val_8, 3)} °C`,
      distribution: 'To‘g‘ri burchakli (Прямоугольное)',
      evaluationType: 'Тип Б',
      divisorName: '√3',
      divisorValue: div_sqrt3,
      standardUncertainty: u_res,
      sensitivity: 1,
      contribution: u_res,
      varianceContribution: Math.pow(u_res, 2),
      formula: 'u(x₈) = δ(res) / √3',
    },
    {
      index: 9,
      nameUz: 'Interpolatsiya xatosi',
      nameRu: 'Погрешность интерполяции',
      symbol: 'δ(interp)',
      value: val_9,
      valueFormatted: `${formatMetrologyNumber(val_9, 3)} °C`,
      distribution: 'To‘g‘ri burchakli (Прямоугольное)',
      evaluationType: 'Тип Б',
      divisorName: '√3',
      divisorValue: div_sqrt3,
      standardUncertainty: u_interp,
      sensitivity: 1,
      contribution: u_interp,
      varianceContribution: Math.pow(u_interp, 2),
      formula: 'u(x₉) = δ(interp) / √3',
    },
    {
      index: 10,
      nameUz: 'Kalibrlash punkti barqarorligi (Dreyf)',
      nameRu: 'Дрейф точки калибровки',
      symbol: 'δ(drift)',
      value: val_10,
      valueFormatted: `${formatMetrologyNumber(val_10, 3)} °C`,
      distribution: 'To‘g‘ri burchakli (Прямоугольное)',
      evaluationType: 'Тип Б',
      divisorName: '√3',
      divisorValue: div_sqrt3,
      standardUncertainty: u_drift,
      sensitivity: 1,
      contribution: u_drift,
      varianceContribution: Math.pow(u_drift, 2),
      formula: 'u(x₁₀) = δ(drift) / √3',
    },
  ];

  // Combined standard uncertainty u_c (Step 4 of methodology)
  const sumVariances = budgetComponents.reduce((acc, curr) => acc + curr.varianceContribution, 0);
  const u_c = Math.sqrt(sumVariances);

  // Expanded uncertainty U = k * u_c (Step 5 of methodology, k = 2 for 95% confidence)
  const k = 2;
  const U = k * u_c;

  // Enrich components with paretoPercent and unit
  const enrichedBudgetComponents = budgetComponents.map(c => ({
    ...c,
    unit: '°C',
    paretoPercent: sumVariances > 0 ? (c.varianceContribution / sumVariances) * 100 : 0,
  }));

  // Legacy aliases
  const indSeries = centerIndNums.length > 1 ? centerIndNums : allIndValues;
  const u_a2 = calculateTypeAUncertainty(indSeries);

  return {
    pointTemp: targetPoint,
    n: refSeries.length,
    totalMeasurements,
    totalFilledPoints,
    readings30,
    tCpStd,
    tCpInd,
    uTStd,
    uTInd,
    pointStats,
    centerStdMean,
    centerIndMean,
    overallStdMean,
    overallIndMean,
    overallStdDev,
    deviation,
    minPointMean,
    maxPointMean,
    gradientDelta,
    instabilityDelta,
    inhomogeneityDelta,
    radiationDelta,
    loadDelta,
    u_ther,
    u_cal,
    u_rep,
    u_grad,
    u_inst,
    u_env,
    u_stab,
    u_res,
    u_interp,
    u_drift,
    u_a1: u_rep,
    u_a2,
    u_b1: u_stab,
    u_b2: u_grad,
    u_b3: u_env,
    u_b4: u_interp,
    u_b5: u_ther,
    u_b6: u_inst,
    u_b7: u_res,
    u_b8: u_drift,
    budgetComponents: enrichedBudgetComponents,
    sumVariances,
    u_c,
    k,
    U,
    v_eff: '8374,8'
  };
}
