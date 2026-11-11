export type ChamberPointId = 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6' | 'N7' | 'N8' | 'N9';

export interface ChamberMeasurementRow {
  index: number;
  tStd: number | string; // Etalon ko'rsatkichi, °C
  tInd: number | string; // Quritish shkafi ko'rsatkichi, °C
}

export interface ChamberPointData {
  id: ChamberPointId;
  nameUz: string;
  nameRu: string;
  positionDesc: string;
  coord: [number, number, number]; // 3D coordinates for Three.js
  isCenter: boolean;
  rows: ChamberMeasurementRow[];
}

export interface CalibrationItemInfo {
  certificateNumber: string;
  orderNumber: string;
  contractNumber: string;
  applicationDate: string;
  contractDate: string;
  issueDate: string;
  calibrationPeriod: string;
  receptionTime: string;
  calibrationTime: string;
  customerName: string;
  customerAddress?: string;
  objectName: string;
  objectType: string;
  serialNumber: string;
  resolution: number; // e.g. 0.1 °C or 0.01 °C
  tempRangeMin: number; // e.g. 0 °C
  tempRangeMax: number; // e.g. 50 °C or 300 °C
  calibrationPoints: number[]; // e.g. [30] or [50]
  manufacturer: string;
  
  // Reference standards used
  standardName: string;
  standardType: string;
  standardSerial: string;
  standardTraceability: string;
  standardCertUncertainty: number; // U_cal.std e.g. 0.1 °C
  standardResolution: number; // rez_std e.g. 0.001 °C
  standardDrift: number; // delta_d e.g. 0.0 °C
  
  // Radiation and loading effect parameters
  deltaRadiation: number; // Max |T_le - T_he| (typically 0.075 or calculated)
  deltaLoad: number; // Max |T_ref - T_ref.load| (typically 0.092 or calculated)
  
  // Ambient conditions
  ambientTempMin: number;
  ambientTempMax: number;
  relativeHumidityMin: number;
  relativeHumidityMax: number;
  atmosphericPressureMin?: number;
  atmosphericPressureMax?: number;
  
  // Personnel
  calibratedByUz: string;
  calibratedByRu: string;
  checkedByUz: string;
  checkedByRu: string;
  laboratoryNameUz: string;
  laboratoryNameRu: string;
  laboratoryNameEn: string;
  additionalInfo?: string;
}

export interface PointStat {
  id: ChamberPointId;
  name: string;
  meanStd: number;
  meanInd: number;
  stdDevStd: number; // s(T_i) sample standard deviation for this point
  minStd: number;    // T_min for this point
  maxStd: number;    // T_max for this point
  diffFromCenter: number; // ABS | T_ref - T_i |
  isEntered: boolean;
  count: number;
}

export interface UncertaintyBudgetComponent {
  index: number;
  nameUz: string;
  nameRu: string;
  symbol: string;
  value: number; // Estimate value
  valueFormatted: string;
  distribution: string; // 'Normal' | 'To‘g‘ri burchakli (Прямоугольное)'
  evaluationType: 'Тип А' | 'Тип Б';
  divisorName: string; // '2' | '√3' | '√n'
  divisorValue: number;
  standardUncertainty: number; // u(x_i) = value / divisor
  sensitivity: number; // c_i = 1
  contribution: number; // u_i(y) = c_i * u(x_i)
  varianceContribution: number; // [u_i(y)]^2
  paretoPercent?: number;
  unit?: string;
  formula: string;
}

export interface ProtocolReading30 {
  index: number;
  tStd: number;
  tInd: number;
}

export interface ChamberCalculation {
  pointTemp: number; // calibration target temperature (e.g. 30 °C, 50 °C)
  n: number; // number of readings per point (usually 10)
  totalMeasurements: number; // total count of measurements across all points (e.g. 90)
  totalFilledPoints: number; // how many of the 9 points have data
  
  // 30 Measurements for Protocol Page 2
  readings30: ProtocolReading30[];
  tCpStd: number;
  tCpInd: number;
  uTStd: number;
  uTInd: number;
  
  // Per point stats
  pointStats: Record<ChamberPointId, PointStat>;
  
  // Center reference point (N5)
  centerStdMean: number;
  centerIndMean: number;
  
  // Overall means
  overallStdMean: number;
  overallIndMean: number;
  overallStdDev: number; // s(T) sample std dev of all measurements
  deviation: number; // T_std - T_ind (or T_ref - T_ind)
  
  // Extremes & Gradient
  minPointMean: number; // T_min (lowest point average)
  maxPointMean: number; // T_max (highest point average)
  gradientDelta: number; // Delta T = (T_max - T_min) / 2
  
  // Instability & Inhomogeneity
  instabilityDelta: number; // delta T_instab = Max | T_bar - T_i |
  inhomogeneityDelta: number; // delta T_inhom = Max | T_ref - T_i |
  radiationDelta: number; // delta T_radiation
  loadDelta: number; // delta T_load
  
  // 10 Uncertainty components from KALIBRATSIYA_METODIKASI_FULL_4fc01b30.md
  u_ther: number;   // 1. Etalon termometr: U(ther) / 2
  u_cal: number;    // 2. Kalibratsiya: U(cal) / 2
  u_rep: number;    // 3. Takrorlanuvchanlik: s(T) / sqrt(n)
  u_grad: number;   // 4. Harorat gradienti: Delta T / sqrt(3)
  u_inst: number;   // 5. Etalon o'lchash xatosi: delta(inst) / sqrt(3)
  u_env: number;    // 6. Muhit ta'siri: delta(env) / sqrt(3)
  u_stab: number;   // 7. Barqarorlik (stabilitet): delta(stab) / sqrt(3)
  u_res: number;    // 8. Raqamli ko'rsatish aniqlanuvchanligi: delta(res) / sqrt(3)
  u_interp: number; // 9. Interpolatsiya xatosi: delta(interp) / sqrt(3)
  u_drift: number;  // 10. Kalibrlash punkti barqarorligi: delta(drift) / sqrt(3)
  
  // Legacy aliases for backward compatibility
  u_a1: number;
  u_a2: number;
  u_b1: number;
  u_b2: number;
  u_b3: number;
  u_b4: number;
  u_b5: number;
  u_b6: number;
  u_b7: number;
  u_b8: number;
  
  // Budget Table data
  budgetComponents: UncertaintyBudgetComponent[];
  sumVariances: number; // sum of [u_i(y)]^2
  
  // Combined and expanded
  u_c: number; // u_c(y) = sqrt(sumVariances)
  k: number; // k = 2
  U: number; // U = k * u_c
  v_eff: number | string;
}

export interface SavedCertificate {
  id: string;
  createdAt: string;
  certificateNumber: string;
  customerName: string;
  objectName: string;
  objectType: string;
  serialNumber: string;
  issueDate: string;
  info: CalibrationItemInfo;
  pointsData: ChamberPointData[];
  calculation: ChamberCalculation;
  deviceInfo?: string;
}

export interface LoginAuditLog {
  id: string;
  timestamp: string;
  username: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  userAgent: string;
  screenResolution: string;
  ipAddress: string;
  status: 'Muvaffaqiyatli' | 'Xato parol' | 'Chiqish';
  actionNote?: string;
}
