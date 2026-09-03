import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const REPORT_PATH = fileURLToPath(new URL('../assets/gen9championsvgc2026regmbbo3-1760.txt', import.meta.url));

export async function getUsageEntries() {
  const report = await readFile(REPORT_PATH, 'utf8');
  const entries = [];

  for (const line of report.split('\n')) {
    const match = line.match(/^\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*([\d.]+%)\s*\|/);
    if (!match) continue;

    entries.push({
      rank: Number(match[1]),
      name: match[2].trim(),
      usage: match[3]
    });
  }

  return entries;
}
