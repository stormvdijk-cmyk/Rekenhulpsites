import { formatEuro, parseGetal } from './calculators/format';

export const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;

/** Leest een getal uit een invoerveld; lege of ongeldige invoer = fallback. */
export function getal(id: string, fallback = 0): number {
  const el = $<HTMLInputElement>(id);
  const n = parseGetal(el?.value ?? '');
  return Number.isFinite(n) ? n : fallback;
}

export function radio(name: string): string {
  return (document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement | null)?.value ?? '';
}

export function vinkje(id: string): boolean {
  return Boolean($<HTMLInputElement>(id)?.checked);
}

export function zet(id: string, tekst: string): void {
  const el = $(id);
  if (el) el.textContent = tekst;
}

export const euro = (n: number, dec = true): string => (Number.isFinite(n) ? formatEuro(n, dec) : '–');

/** Herberekent bij elke wijziging in het formulier, en meteen bij laden. Bewaart invoer in de URL (deelbaar). */
export function live(formId: string, bereken: () => void): void {
  const form = $<HTMLFormElement>(formId);
  if (!form) return;
  // Invoer uit de URL herstellen
  const params = new URLSearchParams(location.search);
  for (const [k, v] of params) {
    const els = form.querySelectorAll<HTMLInputElement | HTMLSelectElement>(`[name="${CSS.escape(k)}"]`);
    els.forEach((el) => {
      if (el instanceof HTMLInputElement && (el.type === 'radio' || el.type === 'checkbox')) el.checked = el.type === 'radio' ? el.value === v : v === '1';
      else el.value = v;
    });
  }
  const run = () => {
    try { bereken(); } catch (e) { console.error(e); }
  };
  let t: number | undefined;
  const sync = () => {
    const p = new URLSearchParams();
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[name]').forEach((el) => {
      if (el instanceof HTMLInputElement && el.type === 'radio') { if (el.checked) p.set(el.name, el.value); }
      else if (el instanceof HTMLInputElement && el.type === 'checkbox') p.set(el.name, el.checked ? '1' : '0');
      else p.set(el.name, el.value);
    });
    history.replaceState(null, '', `${location.pathname}?${p.toString()}`);
  };
  form.addEventListener('input', () => { run(); clearTimeout(t); t = window.setTimeout(sync, 400); });
  form.addEventListener('change', run);
  form.addEventListener('submit', (e) => { e.preventDefault(); run(); });
  run();
}
