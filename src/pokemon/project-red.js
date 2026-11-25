import { createDataCache, fetchData } from './remote-data.js';

export const PROJECT_RED_REPO = 'https://github.com/jamesrcode/project-red-data';
const STATS_URL = 'https://raw.githubusercontent.com/jamesrcode/project-red-data/main/stats.json';
const SECTIONS = ['abilities', 'items', 'moves', 'spreads', 'teammates'];

function isFraction(value) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function isCount(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function normalizeName(name) {
  return name.toLowerCase().replace(/-female\b/g, '-f').replace(/-male\b/g, '-m')
    .replace(/[^a-z0-9♀♂]/g, '').replace(/♀/g, 'f').replace(/♂/g, 'm');
}

function topEntries(section) {
  return Object.entries(section ?? {})
    .filter(([name, usage]) => name.length > 0 && name.length <= 100 && isFraction(usage))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
}

export function parseProjectRed({ battles, info, pokemon }) {
  const generated = Date.parse(info?.generated);
  if (!Number.isFinite(generated) || !/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(info?.regulation)
      || !isCount(battles) || battles === 0 || !isCount(info.teams) || !isCount(info.sheets)
      || !pokemon || typeof pokemon !== 'object' || Array.isArray(pokemon)) {
    throw new Error('Snapshot inválido do Project Red.');
  }

  const days = info.source?.match(/\blast (\d{1,3}) days\b/i)?.[1];
  const ranking = [];
  for (const [name, entry] of Object.entries(pokemon)) {
    if (!name || name.length > 100 || !isFraction(entry?.usage?.raw)) continue;
    ranking.push({
      name,
      usage: entry.usage.raw,
      sheets: isCount(entry.sheets) ? entry.sheets : undefined,
      setsFromSmogon: Boolean(entry.setsFromSmogon),
      sections: Object.fromEntries(SECTIONS.map((section) => [section, topEntries(entry[section])]))
    });
  }

  ranking.sort((a, b) => b.usage - a.usage || a.name.localeCompare(b.name));
  if (!ranking.length) throw new Error('Project Red sem dados de usage.');
  const pokemonByName = new Map(ranking.map((entry) => [normalizeName(entry.name), entry]));
  return { battles, generated, days, regulation: info.regulation, sheets: info.sheets,
    teams: info.teams, spreadsEstimated: info.spreadsEstimated, ranking, pokemonByName };
}

export function findProjectRedPokemon(report, name) {
  const key = normalizeName(name.trim());
  return report.pokemonByName.get(key) ?? report.pokemonByName.get(`${key}m`);
}

export const getProjectRedReport = createDataCache(
  async () => parseProjectRed(JSON.parse(await fetchData(STATS_URL))),
  60 * 60_000
);
