import { test } from 'node:test';
import assert from 'node:assert';
import { calcBearCaseYield } from './calculations.ts';

// Redefine MacroState interface to avoid importing from .tsx files,
// which is not supported by the current Node.js experimental type stripping.
interface MacroState {
  projectMonths: number
  totalVillas: number
  avgVillaGDV: number
  gdcPerVilla: number
  vefaReservation: number
  vefaFoundation: number
  vefaShell: number
  vefaFitOut: number
  vefaHandover: number
  tpiRate: number
  opexRatio: number
  fxUsdMad: number
  fxGbpMad: number
  fxEurMad: number
  minTicketSize: number
  maxTicketSize: number
}

const mockMacro: MacroState = {
  projectMonths: 36,
  totalVillas: 20,
  avgVillaGDV: 650000,
  gdcPerVilla: 350000,
  vefaReservation: 5,
  vefaFoundation: 20,
  vefaShell: 45,
  vefaFitOut: 20,
  vefaHandover: 10,
  tpiRate: 20,
  opexRatio: 40,
  fxUsdMad: 10.0,
  fxGbpMad: 12.6,
  fxEurMad: 10.8,
  minTicketSize: 500000,
  maxTicketSize: 6300000,
};

test('calcBearCaseYield - Happy Path', () => {
  const adr = 400;
  const occupancy = 45;
  const result = calcBearCaseYield(mockMacro, adr, occupancy);

  // totalGDC = 20 * 350000 = 7,000,000
  // grossRev = 400 * 365 * 0.45 * 20 = 1,314,000
  // noi = 1,314,000 * (1 - 0.40) = 788,400
  // yieldPct = (788,400 / 7,000,000) * 100 = 11.262857...
  // lpAnnualDividend = 788,400 * 0.9 = 709,560
  // lpDividendYield = (709,560 / (7,000,000 * 0.9)) * 100 = 11.262857...

  assert.strictEqual(result.grossRev, 1314000);
  assert.strictEqual(result.noi, 788400);
  assert.strictEqual(result.lpAnnualDividend, 709560);
  assert.ok(Math.abs(result.yieldPct - 11.262857) < 0.0001);
  assert.ok(Math.abs(result.lpDividendYield - 11.262857) < 0.0001);
});

test('calcBearCaseYield - Zero Occupancy', () => {
  const adr = 400;
  const occupancy = 0;
  const result = calcBearCaseYield(mockMacro, adr, occupancy);

  assert.strictEqual(result.grossRev, 0);
  assert.strictEqual(result.noi, 0);
  assert.strictEqual(result.yieldPct, 0);
  assert.strictEqual(result.lpAnnualDividend, 0);
  assert.strictEqual(result.lpDividendYield, 0);
});

test('calcBearCaseYield - Zero ADR', () => {
  const adr = 0;
  const occupancy = 45;
  const result = calcBearCaseYield(mockMacro, adr, occupancy);

  assert.strictEqual(result.grossRev, 0);
  assert.strictEqual(result.noi, 0);
  assert.strictEqual(result.yieldPct, 0);
  assert.strictEqual(result.lpAnnualDividend, 0);
  assert.strictEqual(result.lpDividendYield, 0);
});

test('calcBearCaseYield - 100% Occupancy', () => {
  const adr = 500;
  const occupancy = 100;
  const result = calcBearCaseYield(mockMacro, adr, occupancy);

  // grossRev = 500 * 365 * 1.0 * 20 = 3,650,000
  // noi = 3,650,000 * (1 - 0.40) = 2,190,000
  // yieldPct = (2,190,000 / 7,000,000) * 100 = 31.2857...
  assert.strictEqual(result.grossRev, 3650000);
  assert.strictEqual(result.noi, 2190000);
  assert.ok(Math.abs(result.yieldPct - 31.2857) < 0.0001);
});

test('calcBearCaseYield - Opex sensitivity', () => {
  const adr = 400;
  const occupancy = 45;
  const highOpexMacro = { ...mockMacro, opexRatio: 60 };
  const result = calcBearCaseYield(highOpexMacro, adr, occupancy);

  // noi = 1,314,000 * (1 - 0.60) = 525,600
  // yieldPct = (525,600 / 7,000,000) * 100 = 7.50857...
  assert.strictEqual(result.noi, 525600);
  assert.ok(Math.abs(result.yieldPct - 7.50857) < 0.0001);
});
