import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const META_STATS_PATH = fileURLToPath(new URL('../assets/gen9championsvgc2026regmbbo3-1760-metastats.txt', import.meta.url));
const SECTIONS = ['Abilities', 'Items', 'Spreads', 'Moves', 'Teammates'];

function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

function getMetaStatsNames(name) {
  const normalizedName = normalizeName(name);
  const baseName = normalizedName.replace(/-(female|male)$/, '');
  const fallbackNames = [baseName, `${baseName}-mega`];

  if (normalizedName.endsWith('-female')) {
    return [`${baseName}-f`, ...fallbackNames];
  }

  return fallbackNames;
}

function parseEntries(lines) {
  return lines
    .map((line) => line.replace(/^\|\s*|\s*\|$/g, '').trim())
    .map((line) => line.match(/^(.*?)\s+([\d.]+%)$/))
    .filter(Boolean)
    .map(([, name, usage]) => ({ name: name.trim(), usage }));
}

function parseBlocks(content) {
  const statsByPokemon = new Map();
  const lines = content.split('\n');
  let currentPokemon;
  let currentSections;
  let currentSection;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const value = line.replace(/^\|\s*|\s*\|$/g, '').trim();
    const isBorder = /^\+[-+]+\+$/.test(line);
    const isPokeHeader = isBorder
      && /^\|\s*[^|]+\s*\|$/.test(lines[index + 1] || '')
      && /^\+[-+]+\+$/.test(lines[index + 2] || '');

    if (isPokeHeader) {
      currentPokemon = lines[index + 1].replace(/^\|\s*|\s*\|$/g, '').trim();
      currentSections = Object.fromEntries(SECTIONS.map((section) => [section, []]));
      currentSection = undefined;
      statsByPokemon.set(normalizeName(currentPokemon), {
        name: currentPokemon,
        sections: currentSections
      });
      continue;
    }

    if (!currentPokemon || !currentSections) continue;
    if (SECTIONS.includes(value)) {
      currentSection = value;
    } else if (currentSection && /^\|.*\|$/.test(line)) {
      const entries = parseEntries([line]);
      if (entries.length > 0) currentSections[currentSection].push(entries[0]);
    }
  }

  return statsByPokemon;
}

let metaStatsPromise;

async function getMetaStats() {
  metaStatsPromise ??= readFile(META_STATS_PATH, 'utf8').then(parseBlocks);
  return metaStatsPromise;
}

export async function getPokemonMetaStats(pokemonName) {
  const statsByPokemon = await getMetaStats();
  return getMetaStatsNames(pokemonName)
    .map((name) => statsByPokemon.get(name))
    .find((stats) => stats !== undefined);
}

export { parseBlocks };
