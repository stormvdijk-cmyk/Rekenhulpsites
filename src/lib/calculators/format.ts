export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

const eur = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });
const eur0 = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 2 });

export const formatEuro = (n: number, decimals = true): string => (decimals ? eur : eur0).format(n);
export const formatGetal = (n: number): string => num.format(n);
export const formatProcent = (n: number, digits = 2): string =>
  new Intl.NumberFormat('nl-NL', { maximumFractionDigits: digits }).format(n) + '%';

/** Leest een Nederlands of internationaal getal ("1.234,56", "1234.56", "1234,5"). */
export function parseGetal(input: string): number {
  let s = String(input).trim().replace(/[€\s%]/g, '');
  if (s === '') return NaN;
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (hasComma && hasDot) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (hasComma) {
    s = s.replace(',', '.');
  } else if (hasDot && /^\-?\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, '');
  }
  return Number(s);
}
