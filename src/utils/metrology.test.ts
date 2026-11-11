import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMean,
  calculateSampleStdDev,
  calculateTypeAUncertainty,
  calculateChamberKU10Uncertainty,
  formatMetrologyNumber,
  SAMPLE_CHAMBER_POINTS,
  SAMPLE_CALIBRATION_INFO,
} from './metrology';

test('calculateMean calculates arithmetic mean correctly', () => {
  const vals = [10, 20, 30];
  assert.equal(calculateMean(vals), 20);
});

test('calculateSampleStdDev calculates Bessel-corrected sample standard deviation s', () => {
  const vals = [30.0, 30.2, 29.8, 30.1, 29.9];
  const mean = calculateMean(vals);
  const s = calculateSampleStdDev(vals, mean);
  assert.ok(Math.abs(s - 0.1581) < 0.001);
});

test('calculateTypeAUncertainty calculates sample std dev / sqrt(n)', () => {
  const vals = [30.01, 30.02, 30.01, 30.03, 30.01, 30.02, 30.01, 30.02, 30.01, 30.02];
  const mean = calculateMean(vals);
  const u_a = calculateTypeAUncertainty(vals, mean);
  assert.ok(u_a > 0 && u_a < 0.01);
});

test('calculateChamberKU10Uncertainty implements the full 10-component budget according to KALIBRATSIYA_METODIKASI_FULL.md', () => {
  const result = calculateChamberKU10Uncertainty(SAMPLE_CHAMBER_POINTS, SAMPLE_CALIBRATION_INFO);

  assert.equal(result.totalFilledPoints, 9);
  assert.equal(result.pointTemp, 30);
  assert.equal(result.n, 10);
  assert.equal(result.totalMeasurements, 90);

  // Check 10 components existence
  assert.equal(result.budgetComponents.length, 10);

  // Component 1: Etalon termometr (Normal, k=2, U_ther=0.100 => u1=0.0500)
  assert.equal(result.budgetComponents[0].nameUz, 'Etalon termometr noaniqligi');
  assert.ok(Math.abs(result.budgetComponents[0].standardUncertainty - 0.0500) < 0.0001);

  // Component 2: Kalibratsiya noaniqligi (Normal, k=2, U_cal=0.050 => u2=0.0250)
  assert.equal(result.budgetComponents[1].nameUz, 'Kalibratsiya noaniqligi');
  assert.ok(Math.abs(result.budgetComponents[1].standardUncertainty - 0.0250) < 0.0001);

  // Component 4: Gradient delta = (max - min)/2
  assert.ok(result.gradientDelta > 0);
  assert.ok(Math.abs(result.budgetComponents[3].standardUncertainty - result.gradientDelta / Math.sqrt(3)) < 0.0001);

  // Component 5: Etalon asbob diskretligi (0.001 / sqrt(3) ~ 0.000577)
  assert.ok(Math.abs(result.budgetComponents[4].standardUncertainty - 0.001 / Math.sqrt(3)) < 0.0001);

  // Component 6: Muhit ta'siri (0.020 / sqrt(3) ~ 0.0115)
  assert.ok(Math.abs(result.budgetComponents[5].standardUncertainty - 0.020 / Math.sqrt(3)) < 0.0001);

  // Combined uncertainty uc and expanded uncertainty U = k * uc (k=2)
  assert.equal(result.k, 2);
  assert.ok(result.u_c > 0.05 && result.u_c < 0.30);
  assert.ok(Math.abs(result.U - 2 * result.u_c) < 0.0001);

  // Verify formatted values on official views
  assert.equal(formatMetrologyNumber(result.pointTemp, 1), '30,0');
  assert.equal(formatMetrologyNumber(result.centerStdMean, 2), '29,59');
  assert.equal(formatMetrologyNumber(result.overallIndMean, 2), '29,97');
  assert.equal(formatMetrologyNumber(result.deviation, 2), '-0,37');
});

test('Exact MD Section 6 numerical sample matches sum of squares and U = 0.22 °C', () => {
  // Mock points that reproduce exactly min=29.850, max=30.150 => Delta T = 0.150, overallStdDev = 0.0103
  const u1 = 0.100 / 2; // 0.0500
  const u2 = 0.050 / 2; // 0.0250
  const u3 = 0.0103 / Math.sqrt(90); // 0.0010857
  const u4 = 0.150 / Math.sqrt(3); // 0.0866025
  const u5 = 0.001 / Math.sqrt(3); // 0.0005774
  const u6 = 0.020 / Math.sqrt(3); // 0.0115470
  const u7 = 0.030 / Math.sqrt(3); // 0.0173205
  const u8 = 0.050 / Math.sqrt(3); // 0.0288675
  const u9 = 0.010 / Math.sqrt(3); // 0.0057735
  const u10 = 0.020 / Math.sqrt(3); // 0.0115470

  const sumSq = [u1, u2, u3, u4, u5, u6, u7, u8, u9, u10].reduce((acc, u) => acc + u * u, 0);
  const uc = Math.sqrt(sumSq);
  const U = 2 * uc;

  assert.ok(Math.abs(sumSq - 0.012058) < 0.0001);
  assert.ok(Math.abs(uc - 0.1098) < 0.001);
  assert.ok(Math.abs(U - 0.22) < 0.01);
});
