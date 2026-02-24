import { Locale } from './i18n';

export const THAI_UNITS = {
  area: { name: 'Rai', symbol: 'ไร่', toSqMeters: 1600 },
  subArea: { name: 'Wah²', symbol: 'ตร.วา', toSqMeters: 4 },
  weight: { name: 'Metric Ton', symbol: 't' },
  currency: { name: 'Thai Baht', symbol: '฿' },
  carbon: { name: 'tCO2e', symbol: 'tCO2e' },
  temperature: { name: 'Celsius', symbol: '°C' },
  speed: { name: 'm/s', symbol: 'm/s' },
  altitude: { name: 'meters', symbol: 'm' },
};

export function sqmToRai(sqm: number): number {
  return sqm / THAI_UNITS.area.toSqMeters;
}

export function raiToSqm(rai: number): number {
  return rai * THAI_UNITS.area.toSqMeters;
}

export function formatArea(rai: number, locale: Locale): string {
  const label = locale === 'th' ? THAI_UNITS.area.symbol : THAI_UNITS.area.name;
  return `${rai.toLocaleString()} ${label}`;
}

export function formatCurrency(baht: number): string {
  return `฿ ${baht.toLocaleString()}`;
}

export function formatCarbon(tco2e: number): string {
  return `${tco2e.toLocaleString()} tCO2e`;
}

export function formatYield(tonPerRai: number, locale: Locale): string {
  const areaLabel = locale === 'th' ? THAI_UNITS.area.symbol : THAI_UNITS.area.name;
  const weightLabel = locale === 'th' ? 'ตัน' : 'Ton';
  return `${tonPerRai.toFixed(1)} ${weightLabel}/${areaLabel}`;
}
