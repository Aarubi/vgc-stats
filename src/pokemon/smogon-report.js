import { readFile } from 'node:fs/promises';
import { parseBlocks } from './meta-stats.js';
import { parseUsageReport } from './usage-report.js';
import { createDataCache, fetchData } from './remote-data.js';

export const SMOGON_FORMAT = /^gen9championsvgc20\d{2}reg[a-z0-9]+bo3$/;
export const REPORT_PERIOD = /^20\d{2}-(?:0[1-9]|1[0-2])$/;
export const SMOGON_RATING = '1760';
const SNAPSHOT_URL = 'https://raw.githubusercontent.com/Aarubi/vgc-stats/meta-data/smogon.json';
const ASSET_PREFIX = '../assets/gen9championsvgc2026regmbbo3-1760';

export function parseSmogonReport({ period, format, rating, usageText, movesetText }) {
  if ((period !== undefined && !REPORT_PERIOD.test(period))
      || !SMOGON_FORMAT.test(format)
      || rating !== SMOGON_RATING
      || typeof usageText !== 'string'
      || typeof movesetText !== 'string') {
    throw new Error('Metadados inválidos no relatório da Smogon.');
  }

  const usage = parseUsageReport(usageText);
  const movesets = parseBlocks(movesetText);
  const firstPokemon = usage[0]?.name.toLowerCase().replace(/\s+/g, '-');
  if (usage[0]?.rank !== 1 || !movesets.get(firstPokemon)?.sections.Moves.length) {
    throw new Error('O ranking e o relatório de movesets da Smogon são incompatíveis.');
  }

  return { period, format, rating, usage, movesets };
}

async function loadBundledReport() {
  const [usageText, movesetText] = await Promise.all([
    readFile(new URL(`${ASSET_PREFIX}.txt`, import.meta.url), 'utf8'),
    readFile(new URL(`${ASSET_PREFIX}-metastats.txt`, import.meta.url), 'utf8')
  ]);
  return parseSmogonReport({
    format: 'gen9championsvgc2026regmbbo3',
    rating: SMOGON_RATING,
    usageText,
    movesetText
  });
}

export const getSmogonReport = createDataCache(async () => {
  const snapshot = JSON.parse(await fetchData(SNAPSHOT_URL));
  if (typeof snapshot?.period !== 'string') throw new Error('Mês da Smogon ausente.');
  return parseSmogonReport(snapshot);
}, 6 * 60 * 60_000, loadBundledReport);

export function describeSmogonReport({ period, format, rating }) {
  const regulation = format.match(/reg([a-z0-9]+)bo3$/)[1].toUpperCase().split('').join('-');
  const label = period ? period.split('-').reverse().join('/') : 'cópia local';
  return `Smogon · ${label} · Reg. ${regulation} · Bo3 ${rating}`;
}
