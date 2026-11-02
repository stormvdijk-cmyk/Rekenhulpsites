// Het enige punt waar het actieve tarievenjaar wordt gekozen.
import data from './tarieven-2026.json';

export type Tarieven = typeof data;
export const tarieven: Tarieven = data;
export const TARIEF_JAAR = data.jaar;
