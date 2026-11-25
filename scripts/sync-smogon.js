import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fetchData } from '../src/pokemon/remote-data.js';
import {
  parseSmogonReport,
  REPORT_PERIOD,
  SMOGON_FORMAT,
  SMOGON_RATING
} from '../src/pokemon/smogon-report.js';

const [outputDirectory, existingSnapshot] = process.argv.slice(2);
const previousMonth = new Date();
previousMonth.setUTCDate(1);
previousMonth.setUTCMonth(previousMonth.getUTCMonth() - 1);

const format = process.env.SMOGON_FORMAT || 'gen9championsvgc2026regmcbo3';
const period = process.env.SMOGON_PERIOD || previousMonth.toISOString().slice(0, 7);
const rating = SMOGON_RATING;

if (!outputDirectory || !SMOGON_FORMAT.test(format) || !REPORT_PERIOD.test(period)
    || period > previousMonth.toISOString().slice(0, 7)) {
  throw new Error('Informe o diretório, um formato Champions VGC Bo3 e um mês encerrado.');
}

let existing;
if (existingSnapshot) {
  existing = JSON.parse(await readFile(existingSnapshot, 'utf8'));
  parseSmogonReport(existing);
}

if (existing?.period > period) throw new Error('O snapshot existente é de um mês mais recente.');

if (existing?.period === period && existing.format === format && !process.env.SMOGON_PERIOD) {
  console.log(`${period} já publicado para ${format}.`);
} else {
  const base = `https://www.smogon.com/stats/${period}/`;
  const filename = `${format}-${rating}.txt`;
  const [usageText, movesetText] = await Promise.all([
    fetchData(`${base}${filename}`),
    fetchData(`${base}moveset/${filename}`)
  ]).catch((error) => {
    if (error.status !== 404 || process.env.GITHUB_EVENT_NAME !== 'schedule') throw error;
    console.log(`A Smogon ainda não publicou o par para ${period} · ${format}.`);
    return [];
  });
  if (!usageText || !movesetText) process.exit(0);

  const snapshot = { period, format, rating, usageText, movesetText };
  const { usage } = parseSmogonReport(snapshot);
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(join(outputDirectory, 'usage.txt'), usageText),
    writeFile(join(outputDirectory, 'moveset.txt'), movesetText),
    writeFile(join(outputDirectory, 'smogon.json'), `${JSON.stringify(snapshot)}\n`)
  ]);
  console.log(`Smogon ${period} · ${format} · ${usage.length} Pokémon.`);
}
